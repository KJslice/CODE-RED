"""
firebase_config/seed_data.py
─────────────────────────────
Seeds Firestore with the initial dataset matching the JSX app:
  - toilets   (8 locations in Nagpur)
  - employees (4 NMC staff)
  - admins    (2 officers)
  - alerts    (4 active alerts)

Run once:  python -m firebase_config.seed_data
"""

import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from firebase_config.firebase_init import bootstrap, db
from google.cloud.firestore_v1 import SERVER_TIMESTAMP

# ── Seed Data ────────────────────────────────────────────────────────────────────

TOILETS = [
    {
        "id": 1, "name": "Sitabuldi Market Public Toilet", "area": "Sitabuldi",
        "grade": "A", "score": 94, "rating": 4.5, "reviews": 128, "distance": 0.3,
        "status": "Open", "water": True, "soap": True, "handDryer": True, "wheelchair": False,
        "lastCleaned": "10 min ago", "lat": 21.146, "lng": 79.088,
        "staffId": "EMP001", "displayCode": "NMC-STB-001", "issues": [], "queue": 2, "alert": False,
    },
    {
        "id": 2, "name": "Itwari Station Facility", "area": "Itwari",
        "grade": "C", "score": 62, "rating": 3.1, "reviews": 74, "distance": 0.7,
        "status": "Open", "water": True, "soap": False, "handDryer": False, "wheelchair": False,
        "lastCleaned": "3 hrs ago", "lat": 21.151, "lng": 79.075,
        "staffId": "EMP002", "displayCode": "NMC-ITW-002", "issues": ["Wet floor", "No soap"], "queue": 0, "alert": True,
    },
    {
        "id": 3, "name": "Sadar Market Toilet Block", "area": "Sadar",
        "grade": "A", "score": 91, "rating": 4.3, "reviews": 96, "distance": 1.1,
        "status": "Open", "water": True, "soap": True, "handDryer": False, "wheelchair": True,
        "lastCleaned": "25 min ago", "lat": 21.138, "lng": 79.082,
        "staffId": "EMP001", "displayCode": "NMC-SAD-003", "issues": [], "queue": 1, "alert": False,
    },
    {
        "id": 4, "name": "Dharampeth Community Toilet", "area": "Dharampeth",
        "grade": "B", "score": 78, "rating": 3.8, "reviews": 42, "distance": 1.4,
        "status": "Open", "water": True, "soap": True, "handDryer": False, "wheelchair": False,
        "lastCleaned": "1 hr ago", "lat": 21.131, "lng": 79.062,
        "staffId": "EMP003", "displayCode": "NMC-DHP-004", "issues": ["Minor litter"], "queue": 0, "alert": False,
    },
    {
        "id": 5, "name": "Gandhibagh Public WC", "area": "Gandhibagh",
        "grade": "A", "score": 88, "rating": 4.1, "reviews": 61, "distance": 0.9,
        "status": "Open", "water": True, "soap": True, "handDryer": True, "wheelchair": True,
        "lastCleaned": "45 min ago", "lat": 21.143, "lng": 79.101,
        "staffId": "EMP004", "displayCode": "NMC-GDB-005", "issues": [], "queue": 3, "alert": False,
    },
    {
        "id": 6, "name": "Lakadganj Facility", "area": "Lakadganj",
        "grade": "B", "score": 81, "rating": 3.9, "reviews": 33, "distance": 1.6,
        "status": "Maintenance", "water": False, "soap": False, "handDryer": False, "wheelchair": False,
        "lastCleaned": "6 hrs ago", "lat": 21.158, "lng": 79.095,
        "staffId": "EMP002", "displayCode": "NMC-LKD-006", "issues": ["Under maintenance"], "queue": 0, "alert": False,
    },
    {
        "id": 7, "name": "Nandanvan Park Toilet", "area": "Nandanvan",
        "grade": "D", "score": 34, "rating": 1.8, "reviews": 19, "distance": 1.9,
        "status": "Open", "water": False, "soap": False, "handDryer": False, "wheelchair": False,
        "lastCleaned": "12 hrs ago", "lat": 21.122, "lng": 79.098,
        "staffId": "EMP003", "displayCode": "NMC-NDV-007",
        "issues": ["Overflow", "No water", "Heavy litter"], "queue": 0, "alert": True,
    },
    {
        "id": 8, "name": "Cotton Market WC", "area": "Cotton Market",
        "grade": "B", "score": 74, "rating": 3.6, "reviews": 51, "distance": 1.2,
        "status": "Open", "water": True, "soap": False, "handDryer": False, "wheelchair": False,
        "lastCleaned": "2 hrs ago", "lat": 21.165, "lng": 79.082,
        "staffId": "EMP004", "displayCode": "NMC-CTN-008", "issues": ["Low soap"], "queue": 1, "alert": False,
    },
]

EMPLOYEES = [
    {
        "id": "EMP001", "name": "Suresh Wankhede", "zone": "Sitabuldi / Sadar",
        "phone": "9823100001", "email": "suresh@nmc.gov.in", "password": "emp001",
        "lastUpload": "Today 9:14 AM", "compliant": True, "uploads": 22,
        "assignedToilets": [1, 3],
    },
    {
        "id": "EMP002", "name": "Meena Thakre", "zone": "Itwari / Lakadganj",
        "phone": "9823100002", "email": "meena@nmc.gov.in", "password": "emp002",
        "lastUpload": "Yesterday 5:30 PM", "compliant": False, "uploads": 18,
        "assignedToilets": [2, 6],
    },
    {
        "id": "EMP003", "name": "Dilip Rao", "zone": "Dharampeth / Nandanvan",
        "phone": "9823100003", "email": "dilip@nmc.gov.in", "password": "emp003",
        "lastUpload": "2 days ago", "compliant": False, "uploads": 11,
        "assignedToilets": [4, 7],
    },
    {
        "id": "EMP004", "name": "Kavita Borkar", "zone": "Gandhibagh / Cotton Mkt",
        "phone": "9823100004", "email": "kavita@nmc.gov.in", "password": "emp004",
        "lastUpload": "Today 10:02 AM", "compliant": True, "uploads": 25,
        "assignedToilets": [5, 8],
    },
]

ADMINS = [
    {
        "id": "ADM001", "name": "Rajesh Shukla", "email": "admin@nmc.gov.in",
        "password": "admin123", "role": "admin", "designation": "Sanitation Officer",
    },
    {
        "id": "ADM002", "name": "Priya Deshmukh", "email": "priya@nmc.gov.in",
        "password": "admin456", "role": "admin", "designation": "Senior Inspector",
    },
]

ALERTS = [
    {
        "id": "ALT001", "type": "critical", "toilet": "Nandanvan Park Toilet",
        "issue": "AI detected overflow + Grade D hygiene", "time": "7:30 AM", "resolved": False,
    },
    {
        "id": "ALT002", "type": "critical", "toilet": "Itwari Station Facility",
        "issue": "Score dropped — wet floor & no soap detected", "time": "8:45 AM", "resolved": False,
    },
    {
        "id": "ALT003", "type": "warning", "toilet": "Lakadganj Facility",
        "issue": "Staff Meena Thakre has not uploaded in 2 days", "time": "Yesterday", "resolved": False,
    },
    {
        "id": "ALT004", "type": "warning", "toilet": "Dharampeth Community Toilet",
        "issue": "Staff Dilip Rao overdue — 2 days", "time": "2 days ago", "resolved": False,
    },
]

PENDING_UPLOADS = [
    {
        "id": "UPL001", "toiletId": 1, "toiletName": "Sitabuldi Market Public Toilet",
        "staffName": "Suresh Wankhede", "uploadedAt": "Today 9:14 AM",
        "aiScore": 94, "aiGrade": "A", "issues": [], "status": "pending", "photos": 3, "urgent": False,
    },
    {
        "id": "UPL002", "toiletId": 2, "toiletName": "Itwari Station Facility",
        "staffName": "Meena Thakre", "uploadedAt": "Today 8:45 AM",
        "aiScore": 62, "aiGrade": "C", "issues": ["Wet floor detected", "No soap visible"],
        "status": "pending", "photos": 2, "urgent": True,
    },
    {
        "id": "UPL003", "toiletId": 7, "toiletName": "Nandanvan Park Toilet",
        "staffName": "Dilip Rao", "uploadedAt": "Today 7:30 AM",
        "aiScore": 34, "aiGrade": "D",
        "issues": ["Overflow detected", "No water", "Heavy litter", "Broken door"],
        "status": "pending", "photos": 4, "urgent": True,
    },
    {
        "id": "UPL004", "toiletId": 8, "toiletName": "Cotton Market WC",
        "staffName": "Kavita Borkar", "uploadedAt": "Today 10:02 AM",
        "aiScore": 74, "aiGrade": "B", "issues": ["Low soap dispenser"],
        "status": "pending", "photos": 2, "urgent": False,
    },
]


def seed():
    bootstrap()

    print("[Seed] Seeding toilets...")
    toilets_col = db.collection("toilets")
    for t in TOILETS:
        toilets_col.document(str(t["id"])).set(t)

    print("[Seed] Seeding employees...")
    emp_col = db.collection("employees")
    for e in EMPLOYEES:
        emp_col.document(e["id"]).set(e)

    print("[Seed] Seeding admins...")
    adm_col = db.collection("admins")
    for a in ADMINS:
        adm_col.document(a["id"]).set(a)

    print("[Seed] Seeding alerts...")
    alert_col = db.collection("alerts")
    for al in ALERTS:
        alert_col.document(al["id"]).set(al)

    print("[Seed] Seeding pending_uploads...")
    up_col = db.collection("pending_uploads")
    for u in PENDING_UPLOADS:
        up_col.document(u["id"]).set(u)

    print("[Seed] ✅ All data seeded successfully.")


if __name__ == "__main__":
    seed()
