# 🚻 AI Smart Sanitation & Access Locator
### Nagpur Municipal Corporation · Swachh Bharat Digital Initiative

A full-stack Python backend that powers the SmartSanitation system —
converting the React JSX prototype into production-ready infrastructure.

---

## 🏗️ Architecture

```
SmartSanitation/
├── app.py                        ← Flask entry point + SocketIO (real-time alerts)
├── requirements.txt
├── .env.example                  ← Copy to .env and fill in your keys
│
├── api/
│   └── routes.py                 ← All REST endpoints (auth, toilets, upload, admin)
│
├── ai/
│   └── hygiene_analyzer.py       ← OpenCV preprocessing + TF classifier + issue detector
│
├── firebase_config/
│   ├── firebase_init.py          ← Firebase Admin SDK bootstrap
│   ├── seed_data.py              ← Seeds all 8 toilets, 4 employees, 2 admins
│   └── serviceAccountKey.json    ← ⚠️ YOUR Firebase credentials (never commit)
│
├── utils/
│   ├── maps.py                   ← Google Maps API (nearby, distance, geocoding)
│   └── auth.py                   ← Token-based session management
│
└── models/
    └── hygiene_classifier.h5     ← Auto-generated MobileNetV2 model (first run)
```

---

## 🚀 Quick Start

### 1. Clone & install dependencies

```bash
git clone <repo>
cd SmartSanitation
python -m venv venv
source venv/bin/activate          # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Configure environment

```bash
cp .env.example .env
# Edit .env with your credentials:
#   FIREBASE_CREDENTIALS_PATH, FIREBASE_STORAGE_BUCKET, FIREBASE_DATABASE_URL
#   GOOGLE_MAPS_API_KEY
#   FLASK_SECRET_KEY
```

### 3. Set up Firebase

1. Create a Firebase project at https://console.firebase.google.com
2. Enable **Firestore**, **Realtime Database**, and **Storage**
3. Download a Service Account key → save as `firebase_config/serviceAccountKey.json`

### 4. Seed initial data

```bash
python -m firebase_config.seed_data
```

This seeds all 8 NMC toilets, 4 employees, 2 admins, 4 alerts, and 4 pending uploads.

### 5. Run the server

```bash
python app.py
# → http://localhost:5000
```

---

## 🔌 REST API Reference

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Role-based login (public / employee / admin) |
| POST | `/api/auth/logout` | Invalidate session |

**Login body:**
```json
{ "role": "employee", "email": "suresh@nmc.gov.in", "password": "emp001" }
```

---

### Toilets
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/toilets` | List all (filters: `grade`, `status`, `area`) |
| GET | `/api/toilets/<id>` | Single toilet + directions URL |
| POST | `/api/toilets/<id>/rate` | Submit rating `{ "rating": 4.5 }` |
| GET | `/api/toilets/nearby?lat=21.1&lng=79.0` | Nearby via Google Maps |

---

### Photo Upload (Employee)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/upload/photos` | Upload 1-6 photos, runs AI analysis |

**Headers:** `Authorization: Bearer <token>`  
**Form data:** `toilet_id=1`, `photos[]` (multipart files)

**Response:**
```json
{
  "upload_id": "abc123",
  "ai_result": {
    "score": 62,
    "grade": "C",
    "issues": [
      { "class": "Water Puddles", "deduction": 15, "icon": "💧" },
      { "class": "No Hygiene Items", "deduction": 10, "icon": "🧴" }
    ],
    "processing_time_ms": 340
  },
  "urgent": true
}
```

---

### Admin Panel
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/uploads/pending` | Pending AI analyses for review |
| POST | `/api/uploads/<id>/approve` | Approve → update toilet score live |
| POST | `/api/uploads/<id>/reject` | Reject with reason |
| GET | `/api/alerts` | Active critical/warning alerts |
| POST | `/api/alerts/<id>/resolve` | Mark alert resolved |
| GET | `/api/employees` | All staff + compliance status |
| GET | `/api/admin/stats` | Dashboard KPIs |

---

### Map & Display
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/map/static` | Google Static Map URL with grade-colored pins |
| GET | `/api/display` | Public kiosk board data (top 5 + stats) |

---

## 🤖 AI Pipeline

### 1. OpenCV Preprocessing (`ai/hygiene_analyzer.py`)
- Resize to 224×224
- CLAHE contrast enhancement (LAB color space)
- Gaussian denoising

### 2. Feature Extraction (OpenCV Heuristics)
| Feature | Method | Maps to Issue |
|---------|--------|---------------|
| Darkness | Mean brightness | Poor Lighting (-10 pts) |
| Dirt/Stains | HSV brownish-hue masking | Heavy Dirt/Stains (-25 pts) |
| Water Puddles | HSV blue/cyan masking | Water Puddles (-15 pts) |
| Litter | Edge density in lower image | Waste/Litter (-20 pts) |
| Broken Fixtures | Hough line transform anomalies | Broken Fixtures (-20 pts) |
| No Hygiene Items | White rectangular region detection | No Hygiene Items (-10 pts) |

### 3. TensorFlow Model
- **Architecture:** MobileNetV2 (ImageNet pretrained) + custom regression head
- **Output:** Hygiene score 0-100 (sigmoid × 100)
- **Auto-builds** on first run if no saved model found
- **Fine-tuning:** Re-train on labeled NMC data with `model.fit()`

### 4. Grade Calculation
```
Score ≥ 90 → Grade A (Excellent)
Score ≥ 75 → Grade B (Good)
Score ≥ 60 → Grade C (Average)
Score  < 60 → Grade D (Poor) + auto-alert
```

---

## 🔴 Real-Time Alerts (SocketIO)

Admin dashboard clients connect via WebSocket:

```javascript
const socket = io("http://localhost:5000");
socket.emit("subscribe_alerts");
socket.on("new_alert", (alert) => console.log("🚨 New alert:", alert));
```

Alerts fire automatically when:
- AI grades a toilet **D**
- An employee is **non-compliant** (no upload for 48h)
- Admin approves an **urgent** upload

---

## 🗄️ Firestore Collections

| Collection | Description |
|------------|-------------|
| `toilets` | 8 NMC toilet documents |
| `employees` | 4 sanitation staff |
| `admins` | 2 officers |
| `alerts` | Critical/warning alerts |
| `pending_uploads` | AI results awaiting admin review |

---

## 🔐 Default Credentials

| Role | Email | Password |
|------|-------|----------|
| Employee | suresh@nmc.gov.in | emp001 |
| Employee | meena@nmc.gov.in | emp002 |
| Employee | dilip@nmc.gov.in | emp003 |
| Employee | kavita@nmc.gov.in | emp004 |
| Admin | admin@nmc.gov.in | admin123 |
| Admin | priya@nmc.gov.in | admin456 |

> ⚠️ Change all passwords before production deployment.

---

## 📱 Mobile App Integration

This backend is designed to serve:
- **Android App** (React Native / Flutter) – login, map, upload, rating
- **Web Admin Panel** – live alerts, approve uploads, employee tracking
- **Public Display Kiosk** – `/api/display` endpoint auto-refreshes

---

## 🛡️ Security Notes

- Always use HTTPS in production (Nginx + Let's Encrypt)
- Move to Firebase Auth tokens instead of session-based auth
- Hash passwords with `bcrypt` before storing
- Set `FLASK_ENV=production` to disable debug mode
- Restrict CORS to your specific frontend domains

---

*Built for Nagpur Municipal Corporation · Swachh Bharat Digital Initiative*
