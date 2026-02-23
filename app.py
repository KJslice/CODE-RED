"""
app.py
──────────────────────────────────────────────────────────────────────────────
SmartSanitation Flask Application Entry Point

Features:
  - REST API (api/routes.py)
  - Flask-SocketIO for real-time alert broadcasting to admin panel
  - CORS enabled for React/mobile clients
  - Firebase bootstrap on startup
"""

import os
import logging
from dotenv import load_dotenv

load_dotenv()

from flask import Flask, jsonify
from flask_cors import CORS
from flask_socketio import SocketIO, emit

from firebase_config.firebase_init import bootstrap
from api.routes import api

# ── Logging ──────────────────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s – %(message)s",
)
logger = logging.getLogger(__name__)

# ── Flask App ────────────────────────────────────────────────────────────────────
app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("FLASK_SECRET_KEY", "dev-secret")
app.config["MAX_CONTENT_LENGTH"] = 32 * 1024 * 1024  # 32 MB max upload

CORS(app, resources={r"/api/*": {"origins": "*"}})

# ── SocketIO (real-time alerts) ───────────────────────────────────────────────────
socketio = SocketIO(app, cors_allowed_origins="*", async_mode="eventlet")

# ── Register blueprints ───────────────────────────────────────────────────────────
app.register_blueprint(api)


# ── SocketIO Events ───────────────────────────────────────────────────────────────
@socketio.on("connect")
def on_connect():
    logger.info(f"[WS] Client connected: {request_sid()}")
    emit("connected", {"message": "SmartSanitation realtime connected"})


@socketio.on("disconnect")
def on_disconnect():
    logger.info(f"[WS] Client disconnected")


@socketio.on("subscribe_alerts")
def on_subscribe_alerts(data):
    """Admin clients subscribe to live alert notifications."""
    from flask_socketio import join_room
    join_room("admin_alerts")
    emit("subscribed", {"room": "admin_alerts"})


def broadcast_alert(alert_data: dict):
    """Call this from anywhere to push a live alert to all subscribed admins."""
    socketio.emit("new_alert", alert_data, room="admin_alerts")


def request_sid():
    from flask import request
    return getattr(request, "sid", "unknown")


# ── Health check ──────────────────────────────────────────────────────────────────
@app.get("/health")
def health():
    return jsonify({
        "status":  "ok",
        "service": "SmartSanitation API",
        "city":    os.getenv("CITY", "Nagpur"),
    })


@app.get("/")
def root():
    return jsonify({
        "name":     "AI Smart Sanitation & Access Locator",
        "org":      "Nagpur Municipal Corporation",
        "version":  "2.0.0",
        "docs":     "/api/",
        "health":   "/health",
    })


# ── Startup ───────────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    logger.info("[App] Bootstrapping Firebase...")
    bootstrap()

    port = int(os.getenv("FLASK_PORT", 5000))
    debug = os.getenv("FLASK_ENV", "development") == "development"

    logger.info(f"[App] 🚀 Starting SmartSanitation on port {port}  (debug={debug})")
    socketio.run(app, host="0.0.0.0", port=port, debug=debug)
