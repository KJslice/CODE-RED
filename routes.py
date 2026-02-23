"""
api/routes.py
─────────────────────────────────────────────────────────────────────────────
Flask REST API blueprint – all routes for SmartSanitation backend.

Endpoints:
  POST /api/auth/login            – role-based login (public/employee/admin)
  POST /api/auth/logout           – invalidate session

  GET  /api/toilets               – list all toilets (with optional filters)
  GET  /api/toilets/<id>          – single toilet details
  POST /api/toilets/<id>/rate     – submit public rating
  GET  /api/toilets/nearby        – find nearby toilets via Google Maps

  POST /api/upload/photos         – employee: upload photos for AI analysis
  GET  /api/uploads/pending       – admin: list pending reviews
  POST /api/uploads/<id>/approve  – admin: approve an upload → update toilet score
  POST /api/uploads/<id>/reject   – admin: reject with reason

  GET  /api/alerts                – admin: list active alerts
  POST /api/alerts/<id>/resolve   – admin: resolve an alert

  GET  /api/employees             – admin: list all employees
  GET  /api/admin/stats           – admin: dashboard statistics

  GET  /api/map/static            – generate static map URL
  GET  /api/display               – public display board data
"""

import os
import io
import logging
from datetime import datetime

from flask import Blueprint, request, jsonify, current_app

from firebase_config.firebase_init import db, bucket
from ai.hygiene_analyzer import analyze_images
from utils.auth import create_session, get_session, require_auth
from utils.maps import (
    find_nearby_toilets, get_walking_distances,
    get_static_map_url, get_directions_url, reverse_geocode
)

logger = logging.getLogger(__name__)
api    = Blueprint("api", __name__, url_prefix="/api")

# ── Hardcoded credentials (mirrors JSX data) ─────────────────────────────────────
# In production these live only in Firestore with hashed passwords.
EMPLOYEE_CREDS = {
    "suresh@nmc.gov.in": ("emp001", "EMP001"),
    "meena@nmc.gov.in":  ("emp002", "EMP002"),
    "dilip@nmc.gov.in":  ("emp003", "EMP003"),
    "kavita@nmc.gov.in": ("emp004", "EMP004"),
}
ADMIN_CREDS = {
    "admin@nmc.gov.in": ("admin123", "ADM001"),
    "priya@nmc.gov.in": ("admin456", "ADM002"),
}


# ═══════════════════════════════════════════════════════════════════════════════
# AUTH
# ═══════════════════════════════════════════════════════════════════════════════

@api.post("/auth/login")
def login():
    data  = request.get_json(force=True)
    role  = data.get("role", "public")
    email = data.get("email", "").strip().lower()
    pwd   = data.get("password", "")

    if role == "public":
        token = create_session("PUBLIC", "public", {"name": "Citizen"})
        return jsonify({"token": token, "role": "public", "name": "Citizen"})

    if role == "employee":
        entry = EMPLOYEE_CREDS.get(email)
        if entry and entry[0] == pwd:
            emp_id  = entry[1]
            emp_doc = db.collection("employees").document(emp_id).get()
            if emp_doc.exists:
                emp_data = emp_doc.to_dict()
                token    = create_session(emp_id, "employee", emp_data)
                return jsonify({"token": token, "role": "employee", **emp_data})
        return jsonify({"error": "Invalid credentials"}), 401

    if role == "admin":
        entry = ADMIN_CREDS.get(email)
        if entry and entry[0] == pwd:
            adm_id  = entry[1]
            adm_doc = db.collection("admins").document(adm_id).get()
            if adm_doc.exists:
                adm_data = adm_doc.to_dict()
                token    = create_session(adm_id, "admin", adm_data)
                return jsonify({"token": token, "role": "admin", **adm_data})
        return jsonify({"error": "Invalid credentials"}), 401

    return jsonify({"error": "Invalid role"}), 400


@api.post("/auth/logout")
def logout():
    token = request.headers.get("Authorization", "").replace("Bearer ", "")
    from utils.auth import _sessions
    _sessions.pop(token, None)
    return jsonify({"message": "Logged out"})


# ═══════════════════════════════════════════════════════════════════════════════
# TOILETS
# ═══════════════════════════════════════════════════════════════════════════════

@api.get("/toilets")
def list_toilets():
    grade   = request.args.get("grade")
    status  = request.args.get("status")
    area    = request.args.get("area")

    ref = db.collection("toilets")
    if grade:
        ref = ref.where("grade", "==", grade.upper())
    if status:
        ref = ref.where("status", "==", status)

    docs    = ref.stream()
    toilets = [d.to_dict() for d in docs]

    if area:
        toilets = [t for t in toilets if area.lower() in t.get("area", "").lower()]

    # Sort by score descending
    toilets.sort(key=lambda t: t.get("score", 0), reverse=True)
    return jsonify({"toilets": toilets, "count": len(toilets)})


@api.get("/toilets/<int:toilet_id>")
def get_toilet(toilet_id):
    doc = db.collection("toilets").document(str(toilet_id)).get()
    if not doc.exists:
        return jsonify({"error": "Toilet not found"}), 404
    data = doc.to_dict()
    # Add directions URL
    data["directions_url"] = get_directions_url(data["lat"], data["lng"])
    return jsonify(data)


@api.post("/toilets/<int:toilet_id>/rate")
def rate_toilet(toilet_id):
    data   = request.get_json(force=True)
    rating = float(data.get("rating", 0))
    if not (1 <= rating <= 5):
        return jsonify({"error": "Rating must be 1-5"}), 400

    ref = db.collection("toilets").document(str(toilet_id))
    doc = ref.get()
    if not doc.exists:
        return jsonify({"error": "Toilet not found"}), 404

    t = doc.to_dict()
    new_count  = t["reviews"] + 1
    new_rating = round(((t["rating"] * t["reviews"]) + rating) / new_count, 1)
    ref.update({"rating": new_rating, "reviews": new_count})
    return jsonify({"rating": new_rating, "reviews": new_count})


@api.get("/toilets/nearby")
def nearby_toilets():
    lat = float(request.args.get("lat", 21.1458))
    lng = float(request.args.get("lng", 79.0882))
    radius = int(request.args.get("radius", 2000))

    # Our own toilets from Firestore
    our_toilets = [d.to_dict() for d in db.collection("toilets").stream()]

    # Google Maps nearby (external)
    google_places = find_nearby_toilets(lat, lng, radius)

    # Distance matrix for our toilets
    dest_list = [{"id": t["id"], "lat": t["lat"], "lng": t["lng"]} for t in our_toilets]
    distances = get_walking_distances(lat, lng, dest_list)
    dist_map  = {d["id"]: d for d in distances}

    for t in our_toilets:
        dist_info = dist_map.get(t["id"], {})
        t["distance_text"]  = dist_info.get("distance_text", f"{t.get('distance', '?')} km")
        t["duration_text"]  = dist_info.get("duration_text", "")
        t["distance_m"]     = dist_info.get("distance_m")
        t["directions_url"] = get_directions_url(t["lat"], t["lng"], lat, lng)

    our_toilets.sort(key=lambda t: t.get("distance_m") or 99999)
    return jsonify({"our_toilets": our_toilets, "google_places": google_places})


# ═══════════════════════════════════════════════════════════════════════════════
# PHOTO UPLOAD + AI ANALYSIS
# ═══════════════════════════════════════════════════════════════════════════════

@api.post("/upload/photos")
@require_auth("employee")
def upload_photos():
    toilet_id = request.form.get("toilet_id")
    if not toilet_id:
        return jsonify({"error": "toilet_id required"}), 400

    files = request.files.getlist("photos")
    if not files:
        return jsonify({"error": "No photos provided"}), 400
    if len(files) > 6:
        return jsonify({"error": "Maximum 6 photos allowed"}), 400

    session   = request.session
    staff_id  = session["uid"]
    staff_name = session["data"].get("name", "Unknown")

    # Read all images
    images_bytes = []
    storage_urls = []
    for f in files:
        raw = f.read()
        images_bytes.append(raw)

        # Upload to Firebase Storage
        try:
            blob_path = f"uploads/{staff_id}/{toilet_id}/{datetime.utcnow().isoformat()}_{f.filename}"
            blob = bucket.blob(blob_path)
            blob.upload_from_string(raw, content_type=f.content_type or "image/jpeg")
            blob.make_public()
            storage_urls.append(blob.public_url)
        except Exception as e:
            logger.warning(f"Storage upload failed: {e}")
            storage_urls.append(None)

    # Run AI analysis
    ai_result = analyze_images(images_bytes)

    # Determine urgency
    urgent = ai_result["grade"] in ("C", "D") or len(ai_result["issues"]) >= 2

    # Store pending upload in Firestore
    upload_doc = {
        "toiletId":    int(toilet_id),
        "staffId":     staff_id,
        "staffName":   staff_name,
        "uploadedAt":  datetime.utcnow().isoformat(),
        "aiScore":     ai_result["score"],
        "aiGrade":     ai_result["grade"],
        "issues":      [iss["class"] for iss in ai_result["issues"]],
        "status":      "pending",
        "photos":      len(files),
        "photoUrls":   storage_urls,
        "urgent":      urgent,
        "processingMs": ai_result["processing_time_ms"],
    }

    doc_ref = db.collection("pending_uploads").add(upload_doc)
    upload_id = doc_ref[1].id

    # Auto-create alert if grade D or critical
    if ai_result["grade"] == "D":
        toilet_doc = db.collection("toilets").document(str(toilet_id)).get()
        toilet_name = toilet_doc.to_dict().get("name", f"Toilet {toilet_id}") if toilet_doc.exists else f"Toilet {toilet_id}"
        db.collection("alerts").add({
            "type":     "critical",
            "toilet":   toilet_name,
            "toiletId": int(toilet_id),
            "issue":    f"AI detected Grade D — {', '.join(iss['class'] for iss in ai_result['issues'])}",
            "time":     datetime.utcnow().strftime("%I:%M %p"),
            "resolved": False,
        })

    # Update employee upload record
    db.collection("employees").document(staff_id).update({
        "lastUpload": datetime.utcnow().strftime("Today %I:%M %p"),
        "uploads":    _increment_field(),
        "compliant":  True,
    })

    return jsonify({
        "upload_id":  upload_id,
        "ai_result":  ai_result,
        "urgent":     urgent,
        "message":    "Uploaded successfully. Pending admin review.",
    })


def _increment_field():
    from google.cloud.firestore_v1 import Increment
    return Increment(1)


# ═══════════════════════════════════════════════════════════════════════════════
# ADMIN – PENDING UPLOADS
# ═══════════════════════════════════════════════════════════════════════════════

@api.get("/uploads/pending")
@require_auth("admin")
def get_pending_uploads():
    docs = db.collection("pending_uploads").where("status", "==", "pending").stream()
    uploads = []
    for d in docs:
        u = d.to_dict()
        u["id"] = d.id
        uploads.append(u)
    # Sort: urgent first, then by time
    uploads.sort(key=lambda u: (not u.get("urgent", False), u.get("uploadedAt", "")))
    return jsonify({"uploads": uploads, "count": len(uploads)})


@api.post("/uploads/<upload_id>/approve")
@require_auth("admin")
def approve_upload(upload_id):
    ref = db.collection("pending_uploads").document(upload_id)
    doc = ref.get()
    if not doc.exists:
        return jsonify({"error": "Upload not found"}), 404

    u         = doc.to_dict()
    toilet_id = str(u["toiletId"])

    # Update toilet score/grade/issues in Firestore
    db.collection("toilets").document(toilet_id).update({
        "score":        u["aiScore"],
        "grade":        u["aiGrade"],
        "issues":       u["issues"],
        "lastCleaned":  "Just now" if u["aiScore"] >= 75 else f"Needs cleaning",
        "alert":        u.get("urgent", False),
    })

    # Mark upload approved
    ref.update({
        "status":       "approved",
        "approvedAt":   datetime.utcnow().isoformat(),
        "approvedBy":   request.session["uid"],
    })

    return jsonify({"message": "Approved. Toilet score updated.", "score": u["aiScore"], "grade": u["aiGrade"]})


@api.post("/uploads/<upload_id>/reject")
@require_auth("admin")
def reject_upload(upload_id):
    data   = request.get_json(force=True)
    reason = data.get("reason", "No reason given")

    ref = db.collection("pending_uploads").document(upload_id)
    if not ref.get().exists:
        return jsonify({"error": "Upload not found"}), 404

    ref.update({
        "status":     "rejected",
        "rejectedAt": datetime.utcnow().isoformat(),
        "rejectedBy": request.session["uid"],
        "reason":     reason,
    })
    return jsonify({"message": "Rejected."})


# ═══════════════════════════════════════════════════════════════════════════════
# ALERTS
# ═══════════════════════════════════════════════════════════════════════════════

@api.get("/alerts")
@require_auth("admin")
def get_alerts():
    docs   = db.collection("alerts").where("resolved", "==", False).stream()
    alerts = []
    for d in docs:
        a = d.to_dict()
        a["id"] = d.id
        alerts.append(a)
    alerts.sort(key=lambda a: a.get("type") != "critical")  # critical first
    return jsonify({"alerts": alerts, "count": len(alerts)})


@api.post("/alerts/<alert_id>/resolve")
@require_auth("admin")
def resolve_alert(alert_id):
    ref = db.collection("alerts").document(alert_id)
    if not ref.get().exists:
        return jsonify({"error": "Alert not found"}), 404
    ref.update({"resolved": True, "resolvedAt": datetime.utcnow().isoformat()})
    return jsonify({"message": "Alert resolved."})


# ═══════════════════════════════════════════════════════════════════════════════
# EMPLOYEES
# ═══════════════════════════════════════════════════════════════════════════════

@api.get("/employees")
@require_auth("admin")
def get_employees():
    docs  = db.collection("employees").stream()
    emps  = []
    for d in docs:
        e = d.to_dict()
        e.pop("password", None)  # never expose password
        emps.append(e)
    return jsonify({"employees": emps})


# ═══════════════════════════════════════════════════════════════════════════════
# ADMIN DASHBOARD STATS
# ═══════════════════════════════════════════════════════════════════════════════

@api.get("/admin/stats")
@require_auth("admin")
def admin_stats():
    toilets   = [d.to_dict() for d in db.collection("toilets").stream()]
    employees = [d.to_dict() for d in db.collection("employees").stream()]
    pending   = list(db.collection("pending_uploads").where("status", "==", "pending").stream())
    alerts    = list(db.collection("alerts").where("resolved", "==", False).stream())

    grade_counts = {"A": 0, "B": 0, "C": 0, "D": 0}
    for t in toilets:
        g = t.get("grade", "D")
        if g in grade_counts:
            grade_counts[g] += 1

    avg_score   = round(sum(t.get("score", 0) for t in toilets) / max(len(toilets), 1), 1)
    compliant   = sum(1 for e in employees if e.get("compliant"))

    return jsonify({
        "total_toilets":      len(toilets),
        "grade_counts":       grade_counts,
        "avg_score":          avg_score,
        "pending_reviews":    len(pending),
        "active_alerts":      len(alerts),
        "total_employees":    len(employees),
        "compliant_staff":    compliant,
        "non_compliant_staff": len(employees) - compliant,
        "toilets_with_alert": sum(1 for t in toilets if t.get("alert")),
        "open_toilets":       sum(1 for t in toilets if t.get("status") == "Open"),
    })


# ═══════════════════════════════════════════════════════════════════════════════
# MAP / PUBLIC DISPLAY
# ═══════════════════════════════════════════════════════════════════════════════

@api.get("/map/static")
def static_map():
    toilets = [d.to_dict() for d in db.collection("toilets").stream()]
    url     = get_static_map_url(toilets)
    return jsonify({"url": url})


@api.get("/display")
def public_display():
    """
    Data for the Public Display Board screen (lobby/bus-stand kiosks).
    Returns top 5 toilets sorted by score with live queue info.
    """
    toilets = [d.to_dict() for d in db.collection("toilets").stream()]
    toilets.sort(key=lambda t: t.get("score", 0), reverse=True)
    top5    = toilets[:5]

    stats   = {
        "avg_score":    round(sum(t.get("score", 0) for t in toilets) / max(len(toilets), 1), 1),
        "open_count":   sum(1 for t in toilets if t.get("status") == "Open"),
        "total":        len(toilets),
        "grade_A_count": sum(1 for t in toilets if t.get("grade") == "A"),
    }

    map_url = get_static_map_url(toilets)

    return jsonify({
        "top_toilets": top5,
        "stats":       stats,
        "map_url":     map_url,
        "updated_at":  datetime.utcnow().isoformat(),
    })
