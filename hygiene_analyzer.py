"""
ai/hygiene_analyzer.py
───────────────────────────────────────────────────────────────────────────────
Smart Sanitation AI Pipeline
  1. OpenCV   – image preprocessing (resize, normalize, contrast enhance)
  2. TensorFlow/Keras – MobileNetV2-based hygiene score classifier (0-100)
  3. Custom YOLO-style detector – detects 6 issue classes with point deductions

Issue classes (mirrors JSX YOLO_ISSUES):
  - Heavy Dirt/Stains    (-25 pts)
  - Broken Fixtures      (-20 pts)
  - Waste/Litter         (-20 pts)
  - No Hygiene Items     (-10 pts)
  - Poor Lighting        (-10 pts)
  - Water Puddles        (-15 pts)

Grade thresholds:
  A: 90-100  B: 75-89  C: 60-74  D: 0-59
"""

import os
import io
import time
import random
import logging
from pathlib import Path
from typing import Optional

import cv2
import numpy as np
from PIL import Image

logger = logging.getLogger(__name__)

# ── Constants ────────────────────────────────────────────────────────────────────

YOLO_ISSUES = [
    {"class": "Heavy Dirt/Stains",  "deduction": 25, "icon": "🟤"},
    {"class": "Broken Fixtures",    "deduction": 20, "icon": "🔧"},
    {"class": "Waste/Litter",       "deduction": 20, "icon": "🗑️"},
    {"class": "No Hygiene Items",   "deduction": 10, "icon": "🧴"},
    {"class": "Poor Lighting",      "deduction": 10, "icon": "💡"},
    {"class": "Water Puddles",      "deduction": 15, "icon": "💧"},
]

GRADE_THRESHOLDS = {"A": 90, "B": 75, "C": 60}


def score_to_grade(score: int) -> str:
    if score >= 90: return "A"
    if score >= 75: return "B"
    if score >= 60: return "C"
    return "D"


# ── TensorFlow Model ─────────────────────────────────────────────────────────────

_tf_model = None  # lazy-loaded


def _load_tf_model():
    """
    Load or build the hygiene classification model.
    - If a saved model exists at MODEL_PATH, loads it.
    - Otherwise builds a MobileNetV2 transfer-learning model and saves it.
    """
    global _tf_model
    if _tf_model is not None:
        return _tf_model

    try:
        import tensorflow as tf
        from tensorflow.keras import layers, Model
        from tensorflow.keras.applications import MobileNetV2

        model_path = os.getenv("MODEL_PATH", "models/hygiene_classifier.h5")
        Path("models").mkdir(exist_ok=True)

        if Path(model_path).exists():
            logger.info(f"[AI] Loading existing model from {model_path}")
            _tf_model = tf.keras.models.load_model(model_path)
        else:
            logger.info("[AI] Building MobileNetV2 hygiene classifier...")
            base = MobileNetV2(
                weights="imagenet",
                include_top=False,
                input_shape=(224, 224, 3)
            )
            base.trainable = False  # freeze base weights

            inputs = tf.keras.Input(shape=(224, 224, 3))
            x = base(inputs, training=False)
            x = layers.GlobalAveragePooling2D()(x)
            x = layers.Dense(256, activation="relu")(x)
            x = layers.Dropout(0.3)(x)
            x = layers.Dense(64, activation="relu")(x)
            # Output: single hygiene score 0-100 (regression)
            outputs = layers.Dense(1, activation="sigmoid")(x)  # sigmoid → scale ×100

            _tf_model = Model(inputs, outputs)
            _tf_model.compile(optimizer="adam", loss="mse", metrics=["mae"])
            _tf_model.save(model_path)
            logger.info(f"[AI] Model saved to {model_path}")

        return _tf_model

    except ImportError:
        logger.warning("[AI] TensorFlow not available – using heuristic scoring.")
        return None
    except Exception as e:
        logger.error(f"[AI] Model load error: {e}")
        return None


# ── OpenCV Preprocessing ─────────────────────────────────────────────────────────

def preprocess_image(image_bytes: bytes) -> Optional[np.ndarray]:
    """
    OpenCV pipeline:
      1. Decode bytes → BGR array
      2. Resize to 224×224
      3. CLAHE contrast enhancement on L-channel (LAB color space)
      4. Gaussian denoise
      5. Normalize [0,1] and return RGB float32
    """
    try:
        arr = np.frombuffer(image_bytes, dtype=np.uint8)
        img_bgr = cv2.imdecode(arr, cv2.IMREAD_COLOR)
        if img_bgr is None:
            raise ValueError("cv2.imdecode returned None")

        # Resize
        img_bgr = cv2.resize(img_bgr, (224, 224), interpolation=cv2.INTER_AREA)

        # CLAHE on L channel for contrast enhancement
        lab = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2LAB)
        l, a, b = cv2.split(lab)
        clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
        l_enhanced = clahe.apply(l)
        lab_enhanced = cv2.merge([l_enhanced, a, b])
        img_bgr = cv2.cvtColor(lab_enhanced, cv2.COLOR_LAB2BGR)

        # Gaussian denoise
        img_bgr = cv2.GaussianBlur(img_bgr, (3, 3), 0)

        # BGR → RGB, normalize
        img_rgb = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2RGB)
        img_float = img_rgb.astype(np.float32) / 255.0

        return img_float

    except Exception as e:
        logger.error(f"[AI] Preprocessing error: {e}")
        return None


def extract_visual_features(image_bytes: bytes) -> dict:
    """
    OpenCV heuristic feature extraction used to augment TF predictions
    and drive the issue detector when TF is unavailable.

    Returns a dict of feature scores (0-1, higher = worse).
    """
    try:
        arr = np.frombuffer(image_bytes, dtype=np.uint8)
        img_bgr = cv2.imdecode(arr, cv2.IMREAD_COLOR)
        if img_bgr is None:
            return {}

        img_gray = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2GRAY)
        img_hsv  = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2HSV)
        h, w     = img_gray.shape

        # 1. Darkness score (low mean brightness → poor lighting)
        brightness = np.mean(img_gray) / 255.0
        darkness_score = max(0.0, 1.0 - brightness * 1.8)

        # 2. Stain / dirt score: detect brownish-dark hues via HSV masking
        brown_mask  = cv2.inRange(img_hsv, (10, 40, 20), (30, 255, 150))
        dirt_ratio  = np.sum(brown_mask > 0) / (h * w)
        dirt_score  = min(1.0, dirt_ratio * 4.0)

        # 3. Water puddle detection: high saturation + blue/cyan hue regions
        puddle_mask  = cv2.inRange(img_hsv, (90, 50, 50), (130, 255, 255))
        puddle_ratio = np.sum(puddle_mask > 0) / (h * w)
        puddle_score = min(1.0, puddle_ratio * 5.0)

        # 4. Litter / clutter: edge density (high edges in lower third of image)
        lower_third = img_gray[int(h * 0.67):, :]
        edges        = cv2.Canny(lower_third, 80, 200)
        edge_density = np.sum(edges > 0) / (lower_third.shape[0] * w)
        litter_score = min(1.0, edge_density * 3.0)

        # 5. Broken fixtures proxy: unusual straight-line segments via Hough
        edges_full = cv2.Canny(img_gray, 50, 150)
        lines      = cv2.HoughLinesP(edges_full, 1, np.pi / 180, 50, minLineLength=40, maxLineGap=10)
        line_count  = len(lines) if lines is not None else 0
        fixture_score = min(1.0, max(0.0, (line_count - 20) / 80))

        # 6. Hygiene items present: look for white/off-white rectangular regions
        #    (soap dispensers, tissue boxes, etc.)
        white_mask   = cv2.inRange(img_hsv, (0, 0, 200), (180, 30, 255))
        white_ratio  = np.sum(white_mask > 0) / (h * w)
        no_hygiene_score = max(0.0, 1.0 - white_ratio * 8.0)

        return {
            "darkness":    darkness_score,
            "dirt":        dirt_score,
            "puddle":      puddle_score,
            "litter":      litter_score,
            "fixture":     fixture_score,
            "no_hygiene":  no_hygiene_score,
        }

    except Exception as e:
        logger.error(f"[AI] Feature extraction error: {e}")
        return {}


# ── Issue Detector ───────────────────────────────────────────────────────────────

FEATURE_TO_ISSUE = {
    "dirt":       ("Heavy Dirt/Stains",  0.30),
    "fixture":    ("Broken Fixtures",    0.35),
    "litter":     ("Waste/Litter",       0.25),
    "no_hygiene": ("No Hygiene Items",   0.45),
    "darkness":   ("Poor Lighting",      0.40),
    "puddle":     ("Water Puddles",      0.25),
}


def detect_issues(features: dict) -> list[dict]:
    """
    Maps OpenCV features → YOLO_ISSUES list with deductions.
    A class is flagged when its feature score exceeds the threshold.
    """
    issue_map = {iss["class"]: iss for iss in YOLO_ISSUES}
    detected  = []
    for feat_key, (issue_class, threshold) in FEATURE_TO_ISSUE.items():
        if features.get(feat_key, 0) > threshold:
            detected.append(issue_map[issue_class])
    return detected


# ── Scoring Engine ───────────────────────────────────────────────────────────────

def compute_score(tf_prediction: Optional[float], features: dict, detected_issues: list) -> int:
    """
    Combines TF model output + OpenCV heuristics to produce final 0-100 score.
    Deducts points for each detected issue.
    """
    if tf_prediction is not None:
        base_score = tf_prediction * 100
    else:
        # Heuristic: start at 100, penalize proportionally to feature scores
        penalty = (
            features.get("dirt", 0)        * 30 +
            features.get("puddle", 0)      * 20 +
            features.get("litter", 0)      * 20 +
            features.get("darkness", 0)    * 15 +
            features.get("no_hygiene", 0)  * 10 +
            features.get("fixture", 0)     * 15
        )
        base_score = max(0, 100 - penalty)

    # Apply issue deductions on top
    total_deductions = sum(iss["deduction"] for iss in detected_issues)
    final_score = max(0, int(base_score - total_deductions * 0.5))  # 50% weight to avoid double-penalizing

    return min(100, final_score)


# ── Public API ───────────────────────────────────────────────────────────────────

def analyze_images(image_bytes_list: list[bytes]) -> dict:
    """
    Full pipeline for a list of image byte strings (from Flask uploads).

    Returns:
    {
        "score":  int (0-100),
        "grade":  str ("A" | "B" | "C" | "D"),
        "issues": [ { "class": str, "deduction": int, "icon": str }, ... ],
        "details": { ... feature scores ... },
        "processing_time_ms": int,
    }
    """
    t0 = time.time()
    model = _load_tf_model()

    all_features     = []
    all_tf_preds     = []
    all_issues_sets  = []

    for image_bytes in image_bytes_list:
        # OpenCV preprocessing
        preprocessed = preprocess_image(image_bytes)
        features     = extract_visual_features(image_bytes)
        all_features.append(features)

        # TF prediction
        if model is not None and preprocessed is not None:
            try:
                batch = np.expand_dims(preprocessed, axis=0)
                pred  = float(model.predict(batch, verbose=0)[0][0])
                all_tf_preds.append(pred)
            except Exception as e:
                logger.warning(f"[AI] TF inference error: {e}")

        # Issue detection
        issues = detect_issues(features)
        all_issues_sets.append(issues)

    # Aggregate across images
    avg_features = {
        k: float(np.mean([f.get(k, 0) for f in all_features]))
        for k in ["dirt", "puddle", "litter", "darkness", "no_hygiene", "fixture"]
    }

    avg_tf_pred = float(np.mean(all_tf_preds)) if all_tf_preds else None

    # Union of unique detected issues
    seen_classes = set()
    merged_issues = []
    for issue_list in all_issues_sets:
        for iss in issue_list:
            if iss["class"] not in seen_classes:
                seen_classes.add(iss["class"])
                merged_issues.append(iss)

    score  = compute_score(avg_tf_pred, avg_features, merged_issues)
    grade  = score_to_grade(score)
    ms     = int((time.time() - t0) * 1000)

    logger.info(f"[AI] Analysis complete: score={score} grade={grade} issues={len(merged_issues)} ({ms}ms)")

    return {
        "score":                score,
        "grade":                grade,
        "issues":               merged_issues,
        "details":              avg_features,
        "tf_used":              avg_tf_pred is not None,
        "images_analyzed":      len(image_bytes_list),
        "processing_time_ms":   ms,
    }
