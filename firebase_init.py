"""
firebase_config/firebase_init.py
─────────────────────────────────
Initializes Firebase Admin SDK with Firestore, Realtime DB, and Storage.
All other modules import `db`, `rt_db`, and `bucket` from here.
"""

import os
import firebase_admin
from firebase_admin import credentials, firestore, db as realtime_db, storage
from dotenv import load_dotenv

load_dotenv()

_app = None


def init_firebase() -> firebase_admin.App:
    global _app
    if _app is not None:
        return _app

    cred_path = os.getenv("FIREBASE_CREDENTIALS_PATH", "firebase_config/serviceAccountKey.json")
    bucket_name = os.getenv("FIREBASE_STORAGE_BUCKET")
    db_url = os.getenv("FIREBASE_DATABASE_URL")

    cred = credentials.Certificate(cred_path)
    _app = firebase_admin.initialize_app(cred, {
        "storageBucket": bucket_name,
        "databaseURL": db_url,
    })
    return _app


# ── Lazy singletons ──────────────────────────────────────────────────────────────
def get_firestore():
    init_firebase()
    return firestore.client()


def get_realtime_db():
    init_firebase()
    return realtime_db


def get_bucket():
    init_firebase()
    return storage.bucket()


# Convenience exports – import these everywhere
db = None          # Firestore client  (set after init)
rt_db = None       # Realtime DB ref
bucket = None      # Storage bucket


def bootstrap():
    """Call once at app startup to populate module-level singletons."""
    global db, rt_db, bucket
    init_firebase()
    db = get_firestore()
    rt_db = get_realtime_db()
    bucket = get_bucket()
    print("[Firebase] ✅ Firestore, Realtime DB, and Storage initialized.")
