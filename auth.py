"""
utils/auth.py
──────────────
Simple token-based auth helpers for the Flask API.
In production, replace with Firebase Auth tokens (firebase_admin.auth.verify_id_token).
"""

import os
import hashlib
import logging
from datetime import datetime, timedelta
from functools import wraps

from flask import request, jsonify

logger = logging.getLogger(__name__)

# In-memory session store (swap for Redis in production)
_sessions: dict[str, dict] = {}

SECRET = os.getenv("FLASK_SECRET_KEY", "dev-secret-changeme")


def _make_token(uid: str, role: str) -> str:
    payload = f"{uid}:{role}:{datetime.utcnow().isoformat()}:{SECRET}"
    return hashlib.sha256(payload.encode()).hexdigest()


def create_session(uid: str, role: str, user_data: dict) -> str:
    token = _make_token(uid, role)
    _sessions[token] = {
        "uid":      uid,
        "role":     role,
        "data":     user_data,
        "expires":  datetime.utcnow() + timedelta(hours=12),
    }
    return token


def get_session(token: str) -> dict | None:
    s = _sessions.get(token)
    if s and s["expires"] > datetime.utcnow():
        return s
    _sessions.pop(token, None)
    return None


def require_auth(*allowed_roles):
    """Decorator: enforces that a valid session token is present."""
    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            token = request.headers.get("Authorization", "").replace("Bearer ", "")
            session = get_session(token)
            if not session:
                return jsonify({"error": "Unauthorized"}), 401
            if allowed_roles and session["role"] not in allowed_roles:
                return jsonify({"error": "Forbidden"}), 403
            request.session = session
            return fn(*args, **kwargs)
        return wrapper
    return decorator
