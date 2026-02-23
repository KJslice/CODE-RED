import { useState, useEffect, useRef } from "react";

// ═══════════════════════════════════════════════════════════════════════════════
// MOCK DATA
// ═══════════════════════════════════════════════════════════════════════════════

const ADMIN_CREDENTIALS = [
  { id: "ADM001", name: "Rajesh Shukla", email: "admin@nmc.gov.in", password: "admin123", role: "admin", designation: "Sanitation Officer", zone: "Central Nagpur" },
  { id: "ADM002", name: "Priya Deshmukh", email: "priya@nmc.gov.in", password: "admin456", role: "admin", designation: "Senior Inspector", zone: "West Nagpur" },
];

const KARMACHARI_CREDENTIALS = [
  { id: "KRM001", name: "Suresh Wankhede", email: "suresh@nmc.gov.in", password: "karm123", role: "karmachari", assignedToilets: [1, 3], zone: "Sitabuldi", lastUpload: "today" },
  { id: "KRM002", name: "Meena Thakre", email: "meena@nmc.gov.in", password: "karm456", role: "karmachari", assignedToilets: [2, 4], zone: "Itwari", lastUpload: "yesterday" },
  { id: "KRM003", name: "Dilip Rao", email: "dilip@nmc.gov.in", password: "karm789", role: "karmachari", assignedToilets: [5, 6], zone: "Dharampeth", lastUpload: "2 days ago" },
  { id: "KRM004", name: "Kavita Borkar", email: "kavita@nmc.gov.in", password: "karm000", role: "karmachari", assignedToilets: [7, 8], zone: "Gandhibagh", lastUpload: "today" },
];

const PUBLISHED_TOILETS = [
  { id: 1, name: "Sitabuldi Market Toilet", area: "Sitabuldi", grade: "B", score: 78, x: 52, y: 44, reviews: 14, lastUpdated: "2 hrs ago", status: "published", assignedKarmachari: "KRM001", lastStaffUpload: "today", dailyUploads: 14 },
  { id: 2, name: "Itwari Station Public WC", area: "Itwari", grade: "D", score: 42, x: 34, y: 38, reviews: 8, lastUpdated: "30 min ago", status: "published", assignedKarmachari: "KRM002", lastStaffUpload: "yesterday", dailyUploads: 9, alert: true },
  { id: 3, name: "Sadar Market Facility", area: "Sadar", grade: "A", score: 94, x: 44, y: 56, reviews: 22, lastUpdated: "5 hrs ago", status: "published", assignedKarmachari: "KRM001", lastStaffUpload: "today", dailyUploads: 21 },
  { id: 4, name: "Dharampeth Toilet Block", area: "Dharampeth", grade: "C", score: 65, x: 27, y: 62, reviews: 6, lastUpdated: "1 day ago", status: "published", assignedKarmachari: "KRM002", lastStaffUpload: "2 days ago", dailyUploads: 7, alert: true },
  { id: 5, name: "Gandhibagh Public WC", area: "Gandhibagh", grade: "A", score: 91, x: 68, y: 48, reviews: 19, lastUpdated: "3 hrs ago", status: "published", assignedKarmachari: "KRM003", lastStaffUpload: "today", dailyUploads: 19 },
  { id: 6, name: "Lakadganj Community Toilet", area: "Lakadganj", grade: "B", score: 81, x: 62, y: 30, reviews: 11, lastUpdated: "6 hrs ago", status: "published", assignedKarmachari: "KRM003", lastStaffUpload: "today", dailyUploads: 18 },
  { id: 7, name: "Nandanvan Park WC", area: "Nandanvan", grade: "D", score: 38, x: 65, y: 72, reviews: 4, lastUpdated: "20 min ago", status: "published", assignedKarmachari: "KRM004", lastStaffUpload: "today", dailyUploads: 5, alert: true },
  { id: 8, name: "Cotton Market Facility", area: "Cotton Market", grade: "C", score: 68, x: 46, y: 22, reviews: 9, lastUpdated: "4 hrs ago", status: "published", assignedKarmachari: "KRM004", lastStaffUpload: "today", dailyUploads: 12 },
];

const PENDING_VERIFICATIONS = [
  { id: "PV001", submittedBy: "User #4521", toiletName: "Ramdaspeth Circle WC", area: "Ramdaspeth", lat: "21.1452", lng: "79.0783", submittedAt: "10 min ago", photos: 3, description: "Near petrol pump junction", status: "pending" },
  { id: "PV002", submittedBy: "User #7832", toiletName: "Ambazari Lake Public Toilet", area: "Ambazari", lat: "21.1239", lng: "79.0412", submittedAt: "1 hr ago", photos: 2, description: "Behind the garden entrance", status: "pending" },
  { id: "PV003", submittedBy: "User #2291", toiletName: "Hingna Road Facility", area: "Hingna", lat: "21.1678", lng: "78.9823", submittedAt: "3 hrs ago", photos: 4, description: "Adjacent to bus stop", status: "pending" },
];

const PENDING_SCORE_REVIEWS = [
  { id: "PSR001", toiletId: 1, toiletName: "Sitabuldi Market Toilet", karmachariName: "Suresh Wankhede", uploadedAt: "1 hr ago", aiScore: 82, aiGrade: "B", detections: ["Minor stains detected", "Fixtures intact", "Soap present"], photos: 2, status: "pending_review" },
  { id: "PSR002", toiletId: 5, toiletName: "Gandhibagh Public WC", karmachariName: "Dilip Rao", uploadedAt: "3 hrs ago", aiScore: 88, aiGrade: "B", detections: ["Clean floor", "Lighting adequate"], photos: 3, status: "pending_review" },
  { id: "PSR003", toiletId: 7, toiletName: "Nandanvan Park WC", karmachariName: "Kavita Borkar", uploadedAt: "20 min ago", aiScore: 38, aiGrade: "D", detections: ["Heavy dirt detected", "Broken tap", "Waste on floor", "No soap"], photos: 2, status: "pending_review", urgent: true },
];

const SYSTEM_ALERTS = [
  { id: "ALT001", type: "poor_hygiene", toiletId: 7, toiletName: "Nandanvan Park WC", area: "Nandanvan", message: "AI detected Grade D hygiene — immediate action required", time: "20 min ago", severity: "critical", resolved: false },
  { id: "ALT002", type: "poor_hygiene", toiletId: 2, toiletName: "Itwari Station Public WC", area: "Itwari", message: "Score dropped to 42 — poor conditions detected", time: "30 min ago", severity: "critical", resolved: false },
  { id: "ALT003", type: "no_upload", toiletId: 4, toiletName: "Dharampeth Toilet Block", area: "Dharampeth", message: "Karmachari Meena Thakre has not uploaded in 2 days", time: "2 days ago", severity: "warning", resolved: false },
  { id: "ALT004", type: "no_upload", toiletId: 2, toiletName: "Itwari Station Public WC", area: "Itwari", message: "Karmachari Meena Thakre missed yesterday upload", time: "1 day ago", severity: "warning", resolved: false },
];

const YOLO_ISSUES = [
  { class: "Heavy Dirt/Stains", deduction: 25, icon: "🟤" },
  { class: "Broken Fixtures", deduction: 20, icon: "🔧" },
  { class: "Waste/Litter", deduction: 20, icon: "🗑️" },
  { class: "No Hygiene Items", deduction: 10, icon: "🧴" },
  { class: "Poor Lighting", deduction: 10, icon: "💡" },
  { class: "Water Puddles", deduction: 15, icon: "💧" },
];

const GRADE_CFG = {
  A: { color: "#00e676", bg: "rgba(0,230,118,0.12)", border: "#00e67640", label: "Excellent" },
  B: { color: "#ffeb3b", bg: "rgba(255,235,59,0.12)", border: "#ffeb3b40", label: "Good" },
  C: { color: "#ff9800", bg: "rgba(255,152,0,0.12)", border: "#ff980040", label: "Average" },
  D: { color: "#f44336", bg: "rgba(244,67,54,0.12)", border: "#f4433640", label: "Poor" },
};

// ═══════════════════════════════════════════════════════════════════════════════
// SHARED MICRO-COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════════

function GradeBadge({ grade, score, size = "md" }) {
  if (!grade) return null;
  const cfg = GRADE_CFG[grade];
  const cls = { sm: "text-xs px-2 py-0.5", md: "text-sm px-2.5 py-1", lg: "text-xl px-4 py-2 font-black" }[size];
  return (
    <span className={`font-mono font-bold rounded-md inline-flex items-center gap-1.5 ${cls}`}
      style={{ color: cfg.color, background: cfg.bg, border: `1px solid ${cfg.border}` }}>
      {grade}{score !== undefined && <span className="opacity-60 text-xs font-normal">({score})</span>}
    </span>
  );
}

function ScoreBar({ score, animated }) {
  const c = score >= 90 ? "#00e676" : score >= 75 ? "#ffeb3b" : score >= 60 ? "#ff9800" : "#f44336";
  return (
    <div className="w-full h-1.5 rounded-full mt-2" style={{ background: "rgba(255,255,255,0.08)" }}>
      <div className="h-1.5 rounded-full" style={{ width: `${score}%`, background: `linear-gradient(90deg, ${c}66, ${c})`, transition: "width 1.2s ease" }} />
    </div>
  );
}

function StatusPill({ status }) {
  const map = {
    pending: { label: "Pending", color: "#ff9800" },
    pending_review: { label: "Awaiting Review", color: "#00b4d8" },
    approved: { label: "Approved", color: "#00e676" },
    rejected: { label: "Rejected", color: "#f44336" },
    published: { label: "Published", color: "#00e676" },
    under_maintenance: { label: "Under Maintenance", color: "#9e9e9e" },
  };
  const s = map[status] || { label: status, color: "#9e9e9e" };
  return (
    <span className="text-xs px-2 py-0.5 rounded-full font-medium"
      style={{ color: s.color, background: `${s.color}18`, border: `1px solid ${s.color}30` }}>
      {s.label}
    </span>
  );
}

function Toast({ msg, visible }) {
  return (
    <div className="fixed bottom-8 left-1/2 z-[999] transition-all duration-500 pointer-events-none"
      style={{ transform: `translateX(-50%) translateY(${visible ? 0 : 24}px)`, opacity: visible ? 1 : 0 }}>
      <div className="px-6 py-3 rounded-2xl text-sm font-semibold text-black shadow-2xl"
        style={{ background: "#00e676", boxShadow: "0 0 40px rgba(0,230,118,0.5)", fontFamily: "monospace" }}>
        {msg}
      </div>
    </div>
  );
}

function Card({ children, className = "", style = {} }) {
  return (
    <div className={`rounded-2xl ${className}`}
      style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", ...style }}>
      {children}
    </div>
  );
}

function SectionHeader({ icon, title, sub, right }) {
  return (
    <div className="flex items-start justify-between mb-5">
      <div>
        <div className="flex items-center gap-2">
          <span className="text-xl">{icon}</span>
          <span className="text-white font-black text-lg tracking-tight">{title}</span>
        </div>
        {sub && <div className="text-gray-500 text-xs mt-0.5 ml-8">{sub}</div>}
      </div>
      {right}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// LOGIN SCREEN
// ═══════════════════════════════════════════════════════════════════════════════

function LoginScreen({ onLogin }) {
  const [mode, setMode] = useState("public"); // public | karmachari | admin
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleLogin = async () => {
    if (mode === "public") { onLogin({ role: "public", name: "Citizen" }); return; }
    setLoading(true); setError("");
    await new Promise(r => setTimeout(r, 900));
    const allCreds = [...ADMIN_CREDENTIALS, ...KARMACHARI_CREDENTIALS];
    const user = allCreds.find(u => u.email === email && u.password === password && u.role === mode);
    if (user) { onLogin(user); }
    else { setError("Invalid credentials. Please check your ID and password."); }
    setLoading(false);
  };

  const roles = [
    { key: "public", label: "Public", icon: "🌏", desc: "Browse & report toilets" },
    { key: "karmachari", label: "Staff (Karmachari)", icon: "🧹", desc: "Upload daily toilet photos" },
    { key: "admin", label: "Admin Officer", icon: "🛡️", desc: "Government admin access" },
  ];

  const hints = {
    admin: "Try: admin@nmc.gov.in / admin123",
    karmachari: "Try: suresh@nmc.gov.in / karm123",
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{ background: "#030912", fontFamily: "'Courier New', monospace" }}>
      {/* Background grid */}
      <div className="absolute inset-0 opacity-20">
        <svg width="100%" height="100%">
          <defs><pattern id="g" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1e40af" strokeWidth="0.5" />
          </pattern></defs>
          <rect width="100%" height="100%" fill="url(#g)" />
        </svg>
      </div>
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full opacity-10"
        style={{ background: "radial-gradient(circle, #0077b6, transparent)" }} />

      <div className="relative z-10 w-full max-w-md mx-4">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🚻</div>
          <div className="text-3xl font-black text-white tracking-tight">SmartToilet</div>
          <div className="text-blue-400 text-sm font-mono tracking-widest mt-1">NAGPUR MUNICIPAL CORPORATION</div>
          <div className="text-gray-600 text-xs mt-1">Swachh Bharat Digital Initiative</div>
        </div>

        <Card className="p-6">
          {/* Role Selector */}
          <div className="mb-5">
            <div className="text-gray-400 text-xs font-mono mb-2 uppercase tracking-wider">Select Access Role</div>
            <div className="grid grid-cols-3 gap-2">
              {roles.map(r => (
                <button key={r.key} onClick={() => { setMode(r.key); setError(""); setEmail(""); setPassword(""); }}
                  className="flex flex-col items-center p-2.5 rounded-xl transition-all text-center"
                  style={{
                    background: mode === r.key ? "rgba(0,180,216,0.15)" : "rgba(255,255,255,0.03)",
                    border: mode === r.key ? "1px solid #00b4d8" : "1px solid rgba(255,255,255,0.07)",
                  }}>
                  <span className="text-xl mb-1">{r.icon}</span>
                  <span className="text-xs font-bold" style={{ color: mode === r.key ? "#00b4d8" : "#9ca3af" }}>{r.label}</span>
                  <span className="text-xs text-gray-600 mt-0.5 leading-tight" style={{ fontSize: 9 }}>{r.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {mode === "public" ? (
            <button onClick={handleLogin}
              className="w-full py-3.5 rounded-xl font-bold text-white transition-all hover:opacity-90 flex items-center justify-center gap-2"
              style={{ background: "linear-gradient(135deg, #0077b6, #00b4d8)" }}>
              🌏 Enter as Public User
            </button>
          ) : (
            <>
              <div className="space-y-3 mb-4">
                <div>
                  <div className="text-gray-500 text-xs font-mono mb-1">OFFICIAL EMAIL ID</div>
                  <input value={email} onChange={e => setEmail(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl text-white text-sm outline-none"
                    style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
                    placeholder={mode === "admin" ? "admin@nmc.gov.in" : "karmachari@nmc.gov.in"} />
                </div>
                <div>
                  <div className="text-gray-500 text-xs font-mono mb-1">SECURE PASSWORD</div>
                  <div className="relative">
                    <input value={password} onChange={e => setPassword(e.target.value)}
                      type={showPass ? "text" : "password"}
                      onKeyDown={e => e.key === "Enter" && handleLogin()}
                      className="w-full px-3 py-2.5 rounded-xl text-white text-sm outline-none pr-10"
                      style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
                      placeholder="••••••••" />
                    <button onClick={() => setShowPass(!showPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 text-xs">
                      {showPass ? "🙈" : "👁️"}
                    </button>
                  </div>
                </div>
              </div>
              {hints[mode] && (
                <div className="mb-3 px-3 py-2 rounded-lg text-xs" style={{ background: "rgba(0,180,216,0.08)", border: "1px solid rgba(0,180,216,0.2)", color: "#00b4d8" }}>
                  💡 Demo: {hints[mode]}
                </div>
              )}
              {error && (
                <div className="mb-3 px-3 py-2 rounded-lg text-xs" style={{ background: "rgba(244,67,54,0.1)", border: "1px solid rgba(244,67,54,0.3)", color: "#f44336" }}>
                  ⚠️ {error}
                </div>
              )}
              <button onClick={handleLogin} disabled={loading}
                className="w-full py-3.5 rounded-xl font-bold text-black transition-all hover:opacity-90 flex items-center justify-center gap-2"
                style={{ background: loading ? "rgba(255,255,255,0.1)" : mode === "admin" ? "linear-gradient(135deg, #f59e0b, #f97316)" : "linear-gradient(135deg, #0077b6, #00b4d8)", color: loading ? "#6b7280" : mode === "admin" ? "#000" : "#fff" }}>
                {loading ? <><div className="w-4 h-4 border-2 border-gray-600 border-t-gray-300 rounded-full animate-spin" /> Authenticating...</> : <>{mode === "admin" ? "🛡️ Admin Login" : "🧹 Staff Login"}</>}
              </button>
            </>
          )}
        </Card>
        <div className="text-center mt-4 text-gray-700 text-xs">Nagpur Municipal Corporation · Digital Swachh Bharat</div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// NAGPUR MAP
// ═══════════════════════════════════════════════════════════════════════════════

function NagpurMapBg({ toilets, selected, onPin }) {
  return (
    <div className="relative w-full h-full" style={{ background: "#050c1a" }}>
      <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at 50% 40%, #0a1628 0%, #040810 70%)" }} />
      <svg className="absolute inset-0 w-full h-full opacity-25" viewBox="0 0 100 100" preserveAspectRatio="none">
        <defs>
          <pattern id="cg" width="6" height="6" patternUnits="userSpaceOnUse">
            <path d="M 6 0 L 0 0 0 6" fill="none" stroke="#1e3a8a" strokeWidth="0.25" />
          </pattern>
          <radialGradient id="mg" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#1e3a8a" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#1e3a8a" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width="100" height="100" fill="url(#cg)" />
        <rect width="100" height="100" fill="url(#mg)" />
        <line x1="50" y1="0" x2="50" y2="100" stroke="#1d4ed8" strokeWidth="0.6" opacity="0.7" />
        <line x1="0" y1="50" x2="100" y2="50" stroke="#1d4ed8" strokeWidth="0.6" opacity="0.7" />
        <line x1="0" y1="25" x2="100" y2="25" stroke="#1e3a8a" strokeWidth="0.3" opacity="0.4" />
        <line x1="0" y1="75" x2="100" y2="75" stroke="#1e3a8a" strokeWidth="0.3" opacity="0.4" />
        <line x1="25" y1="0" x2="25" y2="100" stroke="#1e3a8a" strokeWidth="0.3" opacity="0.4" />
        <line x1="75" y1="0" x2="75" y2="100" stroke="#1e3a8a" strokeWidth="0.3" opacity="0.4" />
        <path d="M 15 35 Q 35 30 50 50 Q 65 70 85 65" fill="none" stroke="#2563eb" strokeWidth="1" opacity="0.4" strokeDasharray="3,2" />
        {[...Array(18)].map((_, i) => {
          const px = (i * 17 + 8) % 88 + 6, py = (i * 23 + 12) % 82 + 8;
          return <rect key={i} x={px} y={py} width={Math.random() * 4 + 2} height={Math.random() * 4 + 2} fill="#0f172a" stroke="#1e3a8a" strokeWidth="0.2" opacity="0.6" rx="0.2" />;
        })}
        {[["SITABULDI", 48, 43], ["GANDHIBAGH", 64, 48], ["DHARAMPETH", 28, 62], ["LAKADGANJ", 59, 30], ["ITWARI", 34, 37], ["AJNI", 78, 64]].map(([t, x, y]) => (
          <text key={t} x={x} y={y} fill="#3b82f6" fontSize="1.8" opacity="0.55" textAnchor="middle">{t}</text>
        ))}
        <text x="50" y="57" fill="#2563eb" fontSize="1.4" opacity="0.35" textAnchor="middle" transform="rotate(-15,50,57)">Nag River</text>
      </svg>
      <div className="absolute bottom-6 right-6 pointer-events-none text-right">
        <div className="text-4xl font-black tracking-widest" style={{ color: "transparent", WebkitTextStroke: "1px rgba(59,130,246,0.25)" }}>NAGPUR</div>
        <div style={{ color: "#1e3a8a", fontSize: 10, letterSpacing: "0.2em", fontFamily: "monospace" }}>MAHARASHTRA · INDIA</div>
      </div>
      {toilets.map(t => {
        const cfg = GRADE_CFG[t.grade];
        const isSel = selected?.id === t.id;
        return (
          <div key={t.id} onClick={() => onPin(t)} className="absolute cursor-pointer transition-all duration-200 hover:scale-125"
            style={{ left: `${t.x}%`, top: `${t.y}%`, transform: "translate(-50%,-50%)", zIndex: isSel ? 10 : 4 }}>
            {t.grade === "D" && <div className="absolute rounded-full animate-ping" style={{ width: 30, height: 30, top: -5, left: -5, background: cfg.color + "30" }} />}
            {t.alert && <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse border border-red-300 z-10" />}
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-black shadow-lg"
              style={{ background: cfg.color, color: "#000", boxShadow: `0 0 ${isSel ? 20 : 10}px ${cfg.color}80`, border: isSel ? "2.5px solid #fff" : "1.5px solid rgba(255,255,255,0.2)" }}>
              {t.grade}
            </div>
            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 whitespace-nowrap px-1.5 py-0.5 rounded text-white"
              style={{ background: "rgba(0,0,0,0.85)", fontSize: 9, border: `1px solid ${cfg.color}30`, fontFamily: "monospace" }}>
              {t.area}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// PUBLIC MAP VIEW
// ═══════════════════════════════════════════════════════════════════════════════

function PublicMap({ user, onLogout }) {
  const [toilets, setToilets] = useState(PUBLISHED_TOILETS);
  const [selected, setSelected] = useState(null);
  const [panel, setPanel] = useState(null); // null | search | upload | submit
  const [uploadPhase, setUploadPhase] = useState("idle"); // idle | selecting | analyzing | result | done
  const [uploadFiles, setUploadFiles] = useState([]);
  const [aiResult, setAiResult] = useState(null);
  const [submitForm, setSubmitForm] = useState({ name: "", area: "", description: "" });
  const [submitPhase, setSubmitPhase] = useState("form"); // form | submitted
  const [searchQ, setSearchQ] = useState("");
  const [searchGrade, setSearchGrade] = useState("all");
  const [toast, setToast] = useState({ v: false, m: "" });
  const fileRef = useRef();

  const showToast = (m) => { setToast({ v: true, m }); setTimeout(() => setToast({ v: false, m: "" }), 3000); };

  const openPanel = (p) => { setPanel(prev => prev === p ? null : p); setSelected(null); setUploadPhase("idle"); setUploadFiles([]); setAiResult(null); setSubmitPhase("form"); };

  const handleFiles = (fs) => { setUploadFiles(Array.from(fs).slice(0, 5).map(f => ({ file: f, url: URL.createObjectURL(f) }))); };

  const runAnalysis = async () => {
    setUploadPhase("analyzing");
    await new Promise(r => setTimeout(r, 2800));
    const issues = [...YOLO_ISSUES].sort(() => Math.random() - 0.5).slice(0, Math.floor(Math.random() * 3) + 1);
    const score = Math.max(0, 100 - issues.reduce((s, i) => s + i.deduction, 0));
    const grade = score >= 90 ? "A" : score >= 75 ? "B" : score >= 60 ? "C" : "D";
    setAiResult({ score, grade, issues });
    setUploadPhase("result");
  };

  const submitReport = () => {
    setUploadPhase("done");
    showToast("📤 Report submitted — pending admin review");
    setTimeout(() => { setPanel(null); setUploadPhase("idle"); setUploadFiles([]); setAiResult(null); }, 2500);
  };

  const submitNewToilet = () => {
    setSubmitPhase("submitted");
    showToast("🚻 Location submitted — admin will verify within 24hrs");
    setTimeout(() => { setPanel(null); setSubmitPhase("form"); setSubmitForm({ name: "", area: "", description: "" }); }, 2500);
  };

  const filtered = toilets
    .filter(t => searchGrade === "all" || t.grade === searchGrade)
    .filter(t => t.name.toLowerCase().includes(searchQ.toLowerCase()) || t.area.toLowerCase().includes(searchQ.toLowerCase()));

  return (
    <div className="relative w-screen h-screen overflow-hidden" style={{ fontFamily: "monospace" }}>
      <NagpurMapBg toilets={toilets} selected={selected} onPin={t => { setSelected(prev => prev?.id === t.id ? null : t); setPanel(null); }} />

      {/* Top bar */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3">
        <div className="flex items-center gap-3 px-5 py-2.5 rounded-2xl"
          style={{ background: "rgba(4,8,18,0.96)", border: "1px solid rgba(255,255,255,0.09)", backdropFilter: "blur(14px)" }}>
          <span className="text-xl">🚻</span>
          <div>
            <div className="text-white font-black text-sm tracking-wide">SmartToilet Finder</div>
            <div className="text-gray-600 text-xs">Nagpur · {toilets.length} verified locations</div>
          </div>
        </div>
      </div>

      {/* Right info: user + logout */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
        <div className="px-3 py-1.5 rounded-xl text-xs" style={{ background: "rgba(4,8,18,0.9)", border: "1px solid rgba(255,255,255,0.08)", color: "#9ca3af" }}>
          🌏 {user.name}
        </div>
        <button onClick={onLogout} className="px-3 py-1.5 rounded-xl text-xs text-gray-400 hover:text-white transition-all"
          style={{ background: "rgba(4,8,18,0.9)", border: "1px solid rgba(255,255,255,0.08)" }}>Logout</button>
      </div>

      {/* Left sidebar icons */}
      <div className="absolute left-4 top-1/2 -translate-y-1/2 z-20 flex flex-col gap-2.5">
        {[
          { key: "search", icon: "🔍", label: "Search" },
          { key: "upload", icon: "📸", label: "Report" },
          { key: "submit", icon: "📍", label: "Add New" },
        ].map(b => (
          <button key={b.key} onClick={() => openPanel(b.key)}
            className="group w-12 h-12 rounded-xl flex flex-col items-center justify-center transition-all hover:scale-110"
            style={{
              background: panel === b.key ? "rgba(0,180,216,0.2)" : "rgba(4,8,18,0.9)",
              border: panel === b.key ? "1px solid #00b4d8" : "1px solid rgba(255,255,255,0.09)",
              backdropFilter: "blur(12px)"
            }}>
            <span className="text-base">{b.icon}</span>
            <span className="text-gray-500 group-hover:text-gray-300" style={{ fontSize: 8 }}>{b.label}</span>
          </button>
        ))}
      </div>

      {/* Search button bottom center */}
      {!panel && (
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-20">
          <button onClick={() => openPanel("search")}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm text-white"
            style={{ background: "linear-gradient(135deg,#0077b6,#00b4d8)", boxShadow: "0 4px 24px rgba(0,180,216,0.4)" }}>
            🔍 Search Nearby Toilets
          </button>
        </div>
      )}

      {/* Selected popup */}
      {selected && !panel && (() => {
        const cfg = GRADE_CFG[selected.grade];
        return (
          <div className="absolute z-20 w-72 rounded-2xl p-4"
            style={{ left: `${Math.min(selected.x + 5, 60)}%`, top: `${Math.max(selected.y - 5, 5)}%`, background: "rgba(4,8,18,0.97)", border: `1px solid ${cfg.border}`, backdropFilter: "blur(14px)" }}>
            <button onClick={() => setSelected(null)} className="absolute top-2 right-2 text-gray-500 hover:text-white w-6 h-6 flex items-center justify-center rounded-full hover:bg-white/10">✕</button>
            <div className="flex gap-3 mb-3">
              <span className="text-2xl">🚻</span>
              <div>
                <div className="text-white font-bold text-sm">{selected.name}</div>
                <div className="text-gray-500 text-xs">{selected.area}, Nagpur</div>
              </div>
            </div>
            <div className="flex items-center gap-2 mb-1"><GradeBadge grade={selected.grade} score={selected.score} /><span className="text-xs" style={{ color: cfg.color }}>{cfg.label}</span></div>
            <ScoreBar score={selected.score} />
            <div className="flex justify-between text-xs text-gray-600 mt-1.5 mb-3"><span>Score: {selected.score}/100</span><span>Updated {selected.lastUpdated}</span></div>
            <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
              <span>⭐ {selected.reviews} reviews</span>
              <span>📅 {selected.dailyUploads} staff uploads</span>
            </div>
            {selected.lastStaffUpload !== "today" && (
              <div className="px-2 py-1.5 rounded-lg text-xs" style={{ background: "rgba(255,152,0,0.1)", border: "1px solid rgba(255,152,0,0.3)", color: "#ff9800" }}>
                ⚠️ Staff last uploaded: {selected.lastStaffUpload}
              </div>
            )}
            {selected.grade === "D" && (
              <div className="mt-2 px-2 py-1.5 rounded-lg text-xs" style={{ background: "rgba(244,67,54,0.1)", border: "1px solid rgba(244,67,54,0.3)", color: "#f44336" }}>
                🚨 Admin Alert Active
              </div>
            )}
          </div>
        );
      })()}

      {/* Search Panel */}
      {panel === "search" && (
        <div className="absolute left-4 top-4 bottom-4 w-72 z-30 rounded-2xl flex flex-col overflow-hidden"
          style={{ background: "rgba(4,8,18,0.97)", border: "1px solid rgba(255,255,255,0.09)", backdropFilter: "blur(16px)" }}>
          <div className="p-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
            <div className="flex items-center justify-between mb-3">
              <div className="text-white font-bold text-sm">🔍 Search Nearby</div>
              <button onClick={() => setPanel(null)} className="text-gray-500 hover:text-white w-7 h-7 rounded-full hover:bg-white/10 flex items-center justify-center">✕</button>
            </div>
            <input value={searchQ} onChange={e => setSearchQ(e.target.value)} placeholder="Name or area..."
              className="w-full px-3 py-2 rounded-xl text-white text-sm outline-none mb-3"
              style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.09)" }} />
            <div className="flex gap-1 flex-wrap">
              {["all", "A", "B", "C", "D"].map(g => (
                <button key={g} onClick={() => setSearchGrade(g)}
                  className="text-xs px-2.5 py-1 rounded-lg font-mono font-bold transition-all"
                  style={{ background: searchGrade === g ? (g === "all" ? "#00b4d8" : GRADE_CFG[g]?.color) : "rgba(255,255,255,0.05)", color: searchGrade === g ? "#000" : "#6b7280" }}>
                  {g === "all" ? "All" : `Grade ${g}`}
                </button>
              ))}
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {filtered.map(t => (
              <div key={t.id} onClick={() => { setSelected(t); setPanel(null); }}
                className="p-3 cursor-pointer hover:bg-white/5 transition-all"
                style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="text-white text-xs font-medium truncate">{t.name}</div>
                    <div className="text-gray-600 text-xs">{t.area} · {(Math.random() * 2 + 0.2).toFixed(1)} km</div>
                  </div>
                  <GradeBadge grade={t.grade} score={t.score} size="sm" />
                </div>
                <ScoreBar score={t.score} />
                <div className="text-gray-700 text-xs mt-1">Updated {t.lastUpdated}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload/Report Panel */}
      {panel === "upload" && (
        <div className="absolute right-4 top-4 bottom-4 w-80 z-30 rounded-2xl flex flex-col overflow-hidden"
          style={{ background: "rgba(4,8,18,0.97)", border: "1px solid rgba(255,255,255,0.09)", backdropFilter: "blur(16px)" }}>
          <div className="flex items-center justify-between p-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
            <div><div className="text-white font-bold text-sm">📸 Report a Toilet</div><div className="text-gray-600 text-xs mt-0.5">Upload photos for AI analysis</div></div>
            <button onClick={() => setPanel(null)} className="text-gray-500 hover:text-white w-7 h-7 flex items-center justify-center rounded-full hover:bg-white/10">✕</button>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            {uploadPhase === "idle" && (
              <>
                <div onClick={() => fileRef.current.click()}
                  className="border-2 border-dashed rounded-xl flex flex-col items-center justify-center p-8 mb-4 cursor-pointer transition-all hover:border-blue-500"
                  style={{ borderColor: "rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.02)", minHeight: 130 }}>
                  <span className="text-3xl mb-2">📸</span>
                  <span className="text-white text-sm">Drop or click to upload</span>
                  <span className="text-gray-600 text-xs mt-1">Up to 5 photos</span>
                  <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={e => handleFiles(e.target.files)} />
                </div>
                {uploadFiles.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    {uploadFiles.map((f, i) => <div key={i} className="aspect-square rounded-lg overflow-hidden bg-gray-800"><img src={f.url} alt="" className="w-full h-full object-cover" /></div>)}
                  </div>
                )}
                <div className="text-xs text-gray-600 p-3 rounded-xl mb-4" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
                  <div className="text-gray-400 font-medium mb-1.5">📋 Note:</div>
                  Your report will be reviewed by an admin before the score is published publicly. AI analysis runs immediately.
                </div>
              </>
            )}
            {uploadPhase === "analyzing" && (
              <div className="flex flex-col items-center py-8">
                <div className="w-16 h-16 border-4 border-blue-900 border-t-blue-400 rounded-full animate-spin mb-4" />
                <div className="text-white font-bold mb-1">YOLOv8 Analyzing...</div>
                <div className="text-gray-500 text-xs text-center">Scanning {uploadFiles.length} photo{uploadFiles.length > 1 ? "s" : ""} for hygiene issues</div>
                <div className="mt-4 space-y-2 w-full">
                  {["Loading model", "Running detection", "Scoring"].map((s, i) => (
                    <div key={s} className="flex items-center gap-2 text-xs text-gray-600"><div className="w-1.5 h-1.5 rounded-full animate-pulse bg-blue-500" style={{ animationDelay: `${i * 0.3}s` }} />{s}...</div>
                  ))}
                </div>
              </div>
            )}
            {uploadPhase === "result" && aiResult && (
              <>
                <div className="text-center mb-4">
                  <div className="text-gray-400 text-xs mb-2">Analysis Complete</div>
                  <div className="text-5xl font-black" style={{ color: GRADE_CFG[aiResult.grade].color, textShadow: `0 0 30px ${GRADE_CFG[aiResult.grade].color}` }}>{aiResult.grade}</div>
                  <div className="text-white text-xl font-bold mt-1">{aiResult.score}<span className="text-gray-600 text-sm">/100</span></div>
                  <div className="text-xs mt-1" style={{ color: GRADE_CFG[aiResult.grade].color }}>{GRADE_CFG[aiResult.grade].label}</div>
                </div>
                <ScoreBar score={aiResult.score} />
                <div className="mt-4 mb-4 p-3 rounded-xl" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <div className="text-xs text-gray-400 font-medium mb-2">🔍 Detected Issues:</div>
                  {aiResult.issues.map(d => (
                    <div key={d.class} className="flex justify-between text-xs py-1" style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                      <span className="text-gray-400">{d.icon} {d.class}</span>
                      <span className="text-red-400 font-mono">−{d.deduction}pts</span>
                    </div>
                  ))}
                </div>
                <div className="px-3 py-2.5 rounded-xl text-xs mb-2" style={{ background: "rgba(0,180,216,0.08)", border: "1px solid rgba(0,180,216,0.2)", color: "#00b4d8" }}>
                  ℹ️ This score will be sent to admin for review before being published on the public map.
                  {aiResult.grade === "D" && " A critical alert will also be generated."}
                </div>
              </>
            )}
            {uploadPhase === "done" && (
              <div className="flex flex-col items-center py-12">
                <div className="text-5xl mb-3 animate-bounce">✅</div>
                <div className="text-white font-bold">Report Submitted!</div>
                <div className="text-gray-500 text-sm mt-1 text-center">Awaiting admin verification</div>
              </div>
            )}
          </div>
          {(uploadPhase === "idle" || uploadPhase === "result") && (
            <div className="p-4" style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}>
              {uploadPhase === "idle" && (
                <button onClick={runAnalysis} disabled={!uploadFiles.length}
                  className="w-full py-3 rounded-xl font-bold text-sm transition-all"
                  style={{ background: uploadFiles.length ? "linear-gradient(135deg,#0077b6,#00b4d8)" : "rgba(255,255,255,0.05)", color: uploadFiles.length ? "#fff" : "#4b5563", cursor: uploadFiles.length ? "pointer" : "not-allowed" }}>
                  🤖 Analyze with YOLOv8
                </button>
              )}
              {uploadPhase === "result" && (
                <button onClick={submitReport} className="w-full py-3 rounded-xl font-bold text-sm text-white"
                  style={{ background: "linear-gradient(135deg,#7c3aed,#5b21b6)" }}>
                  📤 Submit for Admin Review
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Submit New Toilet Panel */}
      {panel === "submit" && (
        <div className="absolute right-4 top-4 bottom-4 w-80 z-30 rounded-2xl flex flex-col overflow-hidden"
          style={{ background: "rgba(4,8,18,0.97)", border: "1px solid rgba(255,255,255,0.09)", backdropFilter: "blur(16px)" }}>
          <div className="flex items-center justify-between p-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
            <div><div className="text-white font-bold text-sm">📍 Report New Toilet</div><div className="text-gray-600 text-xs mt-0.5">Found a toilet not on the map?</div></div>
            <button onClick={() => setPanel(null)} className="text-gray-500 hover:text-white w-7 h-7 flex items-center justify-center rounded-full hover:bg-white/10">✕</button>
          </div>
          <div className="flex-1 p-4 overflow-y-auto">
            {submitPhase === "form" ? (
              <>
                <div className="px-3 py-2.5 rounded-xl text-xs mb-5" style={{ background: "rgba(251,191,36,0.08)", border: "1px solid rgba(251,191,36,0.2)", color: "#fbbf24" }}>
                  📋 Your submission will be sent to the admin panel for verification. Once confirmed as a real toilet, it will be added to the public map.
                </div>
                {[
                  { key: "name", label: "Toilet Name / Description", placeholder: "e.g. Near Sitabuldi Junction" },
                  { key: "area", label: "Area / Locality", placeholder: "e.g. Sitabuldi, Nagpur" },
                  { key: "description", label: "Additional Details", placeholder: "Landmark, direction etc." },
                ].map(f => (
                  <div key={f.key} className="mb-3">
                    <div className="text-gray-500 text-xs font-mono mb-1 uppercase tracking-wider">{f.label}</div>
                    <input value={submitForm[f.key]} onChange={e => setSubmitForm(s => ({ ...s, [f.key]: e.target.value }))}
                      className="w-full px-3 py-2.5 rounded-xl text-white text-sm outline-none"
                      style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)" }}
                      placeholder={f.placeholder} />
                  </div>
                ))}
                <div className="mb-4 p-3 rounded-xl" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <div className="text-gray-500 text-xs font-mono mb-1">📸 UPLOAD PHOTOS (Required)</div>
                  <div onClick={() => fileRef.current.click()} className="border border-dashed rounded-xl flex items-center justify-center p-4 cursor-pointer hover:border-blue-500 transition-all"
                    style={{ borderColor: "rgba(255,255,255,0.1)" }}>
                    <span className="text-gray-500 text-xs">Click to add photos of this toilet</span>
                  </div>
                  <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={e => handleFiles(e.target.files)} />
                  {uploadFiles.length > 0 && <div className="text-green-400 text-xs mt-1.5">✅ {uploadFiles.length} photo(s) selected</div>}
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center py-16">
                <div className="text-5xl mb-4">📋</div>
                <div className="text-white font-bold text-lg">Submitted!</div>
                <div className="text-gray-500 text-sm text-center mt-2">Admin will verify within 24 hours</div>
                <div className="mt-4 px-4 py-2 rounded-xl text-xs text-center" style={{ background: "rgba(251,191,36,0.08)", color: "#fbbf24" }}>
                  You'll be notified once it's approved and visible on the map
                </div>
              </div>
            )}
          </div>
          {submitPhase === "form" && (
            <div className="p-4" style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}>
              <button onClick={submitNewToilet} disabled={!submitForm.name || !submitForm.area}
                className="w-full py-3 rounded-xl font-bold text-sm transition-all"
                style={{ background: submitForm.name && submitForm.area ? "linear-gradient(135deg,#059669,#10b981)" : "rgba(255,255,255,0.05)", color: submitForm.name && submitForm.area ? "#fff" : "#4b5563" }}>
                📍 Submit for Verification
              </button>
            </div>
          )}
        </div>
      )}

      {/* Legend */}
      <div className="absolute bottom-4 left-4 z-20 p-3 rounded-xl" style={{ background: "rgba(4,8,18,0.9)", border: "1px solid rgba(255,255,255,0.07)", backdropFilter: "blur(10px)" }}>
        <div className="text-gray-500 text-xs font-mono mb-2 uppercase tracking-wider">Grade</div>
        {Object.entries(GRADE_CFG).map(([g, cfg]) => (
          <div key={g} className="flex items-center gap-2 mb-1">
            <div className="w-4 h-4 rounded-full flex items-center justify-center font-black text-black" style={{ background: cfg.color, fontSize: 9 }}>{g}</div>
            <span className="text-gray-500 text-xs">{cfg.label}</span>
          </div>
        ))}
      </div>

      {/* Live dot */}
      <div className="absolute top-4 right-32 z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-full" style={{ background: "rgba(4,8,18,0.9)", border: "1px solid rgba(255,255,255,0.07)" }}>
        <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
        <span className="text-gray-500 text-xs">LIVE</span>
      </div>

      <Toast msg={toast.m} visible={toast.v} />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// KARMACHARI PORTAL
// ═══════════════════════════════════════════════════════════════════════════════

function KarmachariPortal({ user, onLogout }) {
  const karm = KARMACHARI_CREDENTIALS.find(k => k.id === user.id);
  const assignedToilets = PUBLISHED_TOILETS.filter(t => karm?.assignedToilets.includes(t.id));
  const [selectedToilet, setSelectedToilet] = useState(null);
  const [phase, setPhase] = useState("idle");
  const [files, setFiles] = useState([]);
  const [progress, setProgress] = useState(0);
  const [aiResult, setAiResult] = useState(null);
  const [toast, setToast] = useState({ v: false, m: "" });
  const fileRef = useRef();

  const showToast = (m) => { setToast({ v: true, m }); setTimeout(() => setToast({ v: false, m: "" }), 3000); };

  const handleFiles = (fs) => setFiles(Array.from(fs).slice(0, 5).map(f => ({ file: f, url: URL.createObjectURL(f) })));

  const analyze = async () => {
    setPhase("analyzing"); setProgress(0);
    for (let i = 0; i <= 100; i += 5) { await new Promise(r => setTimeout(r, 80)); setProgress(i); }
    const issues = [...YOLO_ISSUES].sort(() => Math.random() - 0.5).slice(0, Math.floor(Math.random() * 2));
    const score = Math.max(0, 100 - issues.reduce((s, i) => s + i.deduction, 0));
    const grade = score >= 90 ? "A" : score >= 75 ? "B" : score >= 60 ? "C" : "D";
    setAiResult({ score, grade, issues });
    setPhase("result");
  };

  const submit = () => {
    setPhase("submitted");
    showToast("✅ Daily upload submitted — awaiting admin approval");
    setTimeout(() => { setPhase("idle"); setFiles([]); setAiResult(null); setSelectedToilet(null); }, 2500);
  };

  return (
    <div className="min-h-screen" style={{ background: "#030912", fontFamily: "monospace", color: "#e5e7eb" }}>
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: "rgba(255,255,255,0.07)", background: "rgba(4,8,18,0.8)" }}>
        <div className="flex items-center gap-3">
          <span className="text-2xl">🧹</span>
          <div>
            <div className="text-white font-black text-base">Karmachari Portal</div>
            <div className="text-gray-600 text-xs">SmartToilet NMC · Swachh Nagpur</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-white text-sm font-bold">{user.name}</div>
            <div className="text-gray-600 text-xs">{user.id} · {karm?.zone}</div>
          </div>
          <button onClick={onLogout} className="px-3 py-1.5 rounded-xl text-xs text-gray-400 hover:text-white border" style={{ borderColor: "rgba(255,255,255,0.09)" }}>Logout</button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6">
        {/* Status strip */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { icon: "🚻", label: "Assigned Toilets", val: assignedToilets.length, color: "#00b4d8" },
            { icon: "📅", label: "Today's Uploads", val: assignedToilets.filter(t => t.lastStaffUpload === "today").length + "/" + assignedToilets.length, color: "#00e676" },
            { icon: "⏰", label: "Last Upload", val: karm?.lastUpload || "—", color: karm?.lastUpload === "today" ? "#00e676" : "#ff9800" },
          ].map(s => (
            <Card key={s.label} className="p-4 flex items-center gap-3">
              <span className="text-2xl">{s.icon}</span>
              <div><div className="font-black text-lg" style={{ color: s.color }}>{s.val}</div><div className="text-gray-600 text-xs">{s.label}</div></div>
            </Card>
          ))}
        </div>

        {/* Assigned Toilets */}
        <SectionHeader icon="🚻" title="Your Assigned Toilets" sub="You must upload photos daily for each toilet" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
          {assignedToilets.map(t => {
            const cfg = GRADE_CFG[t.grade];
            const overdue = t.lastStaffUpload !== "today";
            return (
              <Card key={t.id} className="p-4 cursor-pointer hover:border-blue-700 transition-all"
                style={{ border: selectedToilet?.id === t.id ? "1px solid #00b4d8" : undefined }}
                onClick={() => { setSelectedToilet(t); setPhase("idle"); setFiles([]); setAiResult(null); }}>
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="text-white font-bold text-sm">{t.name}</div>
                    <div className="text-gray-600 text-xs">{t.area}, Nagpur</div>
                  </div>
                  <GradeBadge grade={t.grade} score={t.score} size="sm" />
                </div>
                <ScoreBar score={t.score} />
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center gap-1.5">
                    <div className={`w-2 h-2 rounded-full ${overdue ? "bg-orange-500 animate-pulse" : "bg-green-400"}`} />
                    <span className="text-xs" style={{ color: overdue ? "#ff9800" : "#00e676" }}>
                      {overdue ? `⚠️ Last upload: ${t.lastStaffUpload}` : "✅ Uploaded today"}
                    </span>
                  </div>
                  <span className="text-xs text-gray-600">{t.dailyUploads} total uploads</span>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Upload Section */}
        {selectedToilet && (
          <div>
            <SectionHeader icon="📸" title={`Daily Upload — ${selectedToilet.name}`} sub="Upload photos to generate today's hygiene score for admin review" />
            <Card className="p-5">
              {phase === "idle" && (
                <>
                  <div onClick={() => fileRef.current.click()}
                    className="border-2 border-dashed rounded-2xl flex flex-col items-center justify-center p-10 cursor-pointer transition-all hover:border-blue-500 mb-4"
                    style={{ borderColor: "rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.01)" }}>
                    <span className="text-4xl mb-2">📸</span>
                    <span className="text-white text-sm font-bold">Upload Today's Photos</span>
                    <span className="text-gray-600 text-xs mt-1">Drag & drop or click • Up to 5 images</span>
                    <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={e => handleFiles(e.target.files)} />
                  </div>
                  {files.length > 0 && (
                    <div className="grid grid-cols-4 gap-2 mb-4">
                      {files.map((f, i) => <div key={i} className="aspect-square rounded-lg overflow-hidden bg-gray-800"><img src={f.url} alt="" className="w-full h-full object-cover" /></div>)}
                    </div>
                  )}
                  <div className="p-3 rounded-xl text-xs mb-4" style={{ background: "rgba(0,180,216,0.06)", border: "1px solid rgba(0,180,216,0.15)", color: "#9ca3af" }}>
                    📋 Your photos will be analyzed by AI. The generated score will be sent to admin for approval before being visible to the public.
                  </div>
                  <button onClick={analyze} disabled={!files.length}
                    className="w-full py-3.5 rounded-xl font-bold text-sm transition-all"
                    style={{ background: files.length ? "linear-gradient(135deg,#0077b6,#00b4d8)" : "rgba(255,255,255,0.05)", color: files.length ? "#fff" : "#4b5563" }}>
                    🤖 Run YOLOv8 Analysis
                  </button>
                </>
              )}
              {phase === "analyzing" && (
                <div className="flex flex-col items-center py-8">
                  <div className="relative w-20 h-20 mb-5">
                    <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
                      <circle cx="40" cy="40" r="34" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6" />
                      <circle cx="40" cy="40" r="34" fill="none" stroke="#00b4d8" strokeWidth="6" strokeDasharray="213" strokeDashoffset={213 - (213 * progress / 100)} strokeLinecap="round" />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center text-blue-400 font-black text-sm">{progress}%</div>
                  </div>
                  <div className="text-white font-bold mb-1">Analyzing Photos...</div>
                  <div className="text-gray-600 text-xs">YOLOv8 scanning for hygiene issues</div>
                </div>
              )}
              {phase === "result" && aiResult && (
                <div>
                  <div className="flex items-center gap-6 mb-4 p-4 rounded-xl" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
                    <div className="text-center">
                      <div className="text-5xl font-black" style={{ color: GRADE_CFG[aiResult.grade].color }}>{aiResult.grade}</div>
                      <div className="text-gray-500 text-xs">Grade</div>
                    </div>
                    <div className="flex-1">
                      <div className="text-white text-2xl font-black">{aiResult.score}<span className="text-gray-600 text-sm">/100</span></div>
                      <ScoreBar score={aiResult.score} />
                      <div className="text-xs mt-1.5" style={{ color: GRADE_CFG[aiResult.grade].color }}>{GRADE_CFG[aiResult.grade].label}</div>
                    </div>
                  </div>
                  {aiResult.issues.length > 0 && (
                    <div className="mb-4 p-3 rounded-xl" style={{ background: "rgba(244,67,54,0.06)", border: "1px solid rgba(244,67,54,0.15)" }}>
                      <div className="text-xs text-red-400 font-medium mb-2">⚠️ Issues Detected:</div>
                      {aiResult.issues.map(d => (
                        <div key={d.class} className="flex justify-between text-xs py-0.5"><span className="text-gray-400">{d.icon} {d.class}</span><span className="text-red-400 font-mono">−{d.deduction}pts</span></div>
                      ))}
                    </div>
                  )}
                  {aiResult.grade === "D" && (
                    <div className="mb-4 p-3 rounded-xl text-xs" style={{ background: "rgba(244,67,54,0.1)", border: "1px solid rgba(244,67,54,0.3)", color: "#f44336" }}>
                      🚨 Critical hygiene detected — a system alert will be sent to admin automatically
                    </div>
                  )}
                  <div className="p-3 rounded-xl text-xs mb-4" style={{ background: "rgba(0,180,216,0.06)", border: "1px solid rgba(0,180,216,0.12)", color: "#9ca3af" }}>
                    ℹ️ This score is not yet public. Admin will review and approve before it appears on the public map.
                  </div>
                  <button onClick={submit} className="w-full py-3.5 rounded-xl font-bold text-black transition-all hover:opacity-90"
                    style={{ background: GRADE_CFG[aiResult.grade].color }}>
                    📤 Submit to Admin for Review
                  </button>
                </div>
              )}
              {phase === "submitted" && (
                <div className="flex flex-col items-center py-12">
                  <div className="text-5xl mb-3 animate-bounce">✅</div>
                  <div className="text-white font-bold text-lg">Daily Upload Complete!</div>
                  <div className="text-gray-500 text-sm mt-1">Awaiting admin approval</div>
                </div>
              )}
            </Card>
          </div>
        )}
      </div>
      <Toast msg={toast.m} visible={toast.v} />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ADMIN PANEL
// ═══════════════════════════════════════════════════════════════════════════════

function AdminPanel({ user, onLogout }) {
  const [tab, setTab] = useState("overview");
  const [verifications, setVerifications] = useState(PENDING_VERIFICATIONS);
  const [scoreReviews, setScoreReviews] = useState(PENDING_SCORE_REVIEWS);
  const [alerts, setAlerts] = useState(SYSTEM_ALERTS);
  const [toilets, setToilets] = useState(PUBLISHED_TOILETS);
  const [toast, setToast] = useState({ v: false, m: "" });
  const showToast = (m) => { setToast({ v: true, m }); setTimeout(() => setToast({ v: false, m: "" }), 3000); };

  const approveVerification = (id) => {
    setVerifications(v => v.map(x => x.id === id ? { ...x, status: "approved" } : x));
    showToast("✅ Toilet verified and added to public map");
  };
  const rejectVerification = (id) => {
    setVerifications(v => v.map(x => x.id === id ? { ...x, status: "rejected" } : x));
    showToast("❌ Toilet submission rejected");
  };
  const approveScore = (id) => {
    setScoreReviews(v => v.map(x => x.id === id ? { ...x, status: "approved" } : x));
    showToast("✅ Score approved and published to public map");
  };
  const rejectScore = (id) => {
    setScoreReviews(v => v.map(x => x.id === id ? { ...x, status: "rejected" } : x));
    showToast("🔁 Score rejected — karmachari must re-upload");
  };
  const resolveAlert = (id) => {
    setAlerts(v => v.map(x => x.id === id ? { ...x, resolved: true } : x));
    showToast("✅ Alert marked as resolved");
  };
  const setMaintenance = (id) => {
    setToilets(v => v.map(t => t.id === id ? { ...t, grade: "C", status: "under_maintenance" } : t));
    showToast("🔧 Toilet marked as Under Maintenance");
  };

  const pendingV = verifications.filter(v => v.status === "pending").length;
  const pendingS = scoreReviews.filter(s => s.status === "pending_review").length;
  const unresolvedA = alerts.filter(a => !a.resolved).length;
  const gradeCount = { A: 0, B: 0, C: 0, D: 0 };
  toilets.forEach(t => { if (gradeCount[t.grade] !== undefined) gradeCount[t.grade]++; });
  const nonCompliant = KARMACHARI_CREDENTIALS.filter(k => k.lastUpload !== "today");

  const tabs = [
    { key: "overview", label: "Overview", icon: "📊" },
    { key: "verifications", label: "Verifications", icon: "📍", badge: pendingV },
    { key: "scores", label: "Score Reviews", icon: "🔍", badge: pendingS },
    { key: "alerts", label: "Alerts", icon: "🚨", badge: unresolvedA },
    { key: "compliance", label: "Staff Compliance", icon: "👥", badge: nonCompliant.length || null },
    { key: "toilets", label: "All Toilets", icon: "🚻" },
  ];

  return (
    <div className="min-h-screen flex" style={{ background: "#030912", fontFamily: "monospace", color: "#e5e7eb" }}>
      {/* Sidebar */}
      <div className="w-56 flex-shrink-0 flex flex-col" style={{ background: "rgba(4,8,18,0.9)", borderRight: "1px solid rgba(255,255,255,0.07)" }}>
        <div className="p-5 border-b" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
          <div className="flex items-center gap-2 mb-1"><span className="text-xl">🛡️</span><span className="text-white font-black text-sm">Admin Panel</span></div>
          <div className="text-gray-600 text-xs">NMC SmartToilet</div>
        </div>
        <div className="p-3 border-b mb-2" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
          <div className="text-xs font-bold text-white">{user.name}</div>
          <div className="text-gray-600 text-xs">{user.designation}</div>
          <div className="text-gray-700 text-xs">{user.zone}</div>
        </div>
        <nav className="flex-1 px-2 space-y-0.5">
          {tabs.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition-all text-sm"
              style={{ background: tab === t.key ? "rgba(0,180,216,0.15)" : "transparent", color: tab === t.key ? "#00b4d8" : "#6b7280" }}>
              <span className="flex items-center gap-2"><span>{t.icon}</span><span>{t.label}</span></span>
              {t.badge > 0 && <span className="text-xs px-1.5 py-0.5 rounded-full font-bold" style={{ background: "#f44336", color: "#fff", fontSize: 10 }}>{t.badge}</span>}
            </button>
          ))}
        </nav>
        <div className="p-3 border-t" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
          <button onClick={onLogout} className="w-full text-xs text-gray-600 hover:text-gray-300 py-2 rounded-lg hover:bg-white/5 transition-all">← Logout</button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto p-6">

          {/* OVERVIEW */}
          {tab === "overview" && (
            <>
              <SectionHeader icon="📊" title="Dashboard Overview" sub="Nagpur Municipal Corporation — Sanitation Monitoring" />
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                {[
                  { icon: "🚻", label: "Total Toilets", val: toilets.length, color: "#00b4d8" },
                  { icon: "📍", label: "Pending Verifications", val: pendingV, color: pendingV > 0 ? "#fbbf24" : "#00e676" },
                  { icon: "🔍", label: "Awaiting Score Review", val: pendingS, color: pendingS > 0 ? "#fbbf24" : "#00e676" },
                  { icon: "🚨", label: "Active Alerts", val: unresolvedA, color: unresolvedA > 0 ? "#f44336" : "#00e676" },
                ].map(s => (
                  <Card key={s.label} className="p-4">
                    <span className="text-2xl block mb-1">{s.icon}</span>
                    <div className="font-black text-2xl" style={{ color: s.color }}>{s.val}</div>
                    <div className="text-gray-600 text-xs mt-0.5">{s.label}</div>
                  </Card>
                ))}
              </div>
              {/* Grade Distribution */}
              <Card className="p-5 mb-5">
                <div className="text-white font-bold text-sm mb-4">Grade Distribution</div>
                <div className="flex gap-4 items-end h-20">
                  {Object.entries(gradeCount).map(([g, c]) => {
                    const pct = (c / toilets.length) * 100;
                    return (
                      <div key={g} className="flex flex-col items-center gap-1 flex-1">
                        <span className="text-gray-400 text-xs">{c}</span>
                        <div className="w-full rounded-t" style={{ height: `${Math.max(pct * 0.6, 5)}px`, background: GRADE_CFG[g].color, opacity: 0.85 }} />
                        <span className="font-black text-xs" style={{ color: GRADE_CFG[g].color }}>Grade {g}</span>
                      </div>
                    );
                  })}
                </div>
              </Card>
              {/* Active alerts preview */}
              {alerts.filter(a => !a.resolved).slice(0, 2).map(a => (
                <div key={a.id} className="p-4 rounded-xl mb-3 flex items-start justify-between"
                  style={{ background: a.severity === "critical" ? "rgba(244,67,54,0.08)" : "rgba(255,152,0,0.08)", border: `1px solid ${a.severity === "critical" ? "rgba(244,67,54,0.25)" : "rgba(255,152,0,0.25)"}` }}>
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: a.severity === "critical" ? "#f44336" : "#ff9800" }} />
                      <span className="text-xs font-bold" style={{ color: a.severity === "critical" ? "#f44336" : "#ff9800" }}>{a.severity === "critical" ? "CRITICAL ALERT" : "WARNING"}</span>
                    </div>
                    <div className="text-white text-sm">{a.toiletName}</div>
                    <div className="text-gray-500 text-xs">{a.message}</div>
                  </div>
                  <button onClick={() => resolveAlert(a.id)} className="text-xs px-3 py-1.5 rounded-xl border text-gray-400 hover:text-white hover:bg-white/10 transition-all flex-shrink-0"
                    style={{ borderColor: "rgba(255,255,255,0.1)" }}>Resolve</button>
                </div>
              ))}
            </>
          )}

          {/* VERIFICATIONS */}
          {tab === "verifications" && (
            <>
              <SectionHeader icon="📍" title="New Toilet Verifications" sub="User-submitted toilet locations awaiting admin verification before going public" />
              {verifications.map(v => (
                <Card key={v.id} className="p-5 mb-3">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="text-white font-bold">{v.toiletName}</div>
                        <StatusPill status={v.status} />
                      </div>
                      <div className="text-gray-500 text-xs">{v.area}, Nagpur</div>
                      <div className="text-gray-600 text-xs mt-1 italic">"{v.description}"</div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-gray-600 text-xs">{v.submittedBy}</div>
                      <div className="text-gray-700 text-xs">{v.submittedAt}</div>
                    </div>
                  </div>
                  <div className="flex gap-4 text-xs text-gray-600 mb-4">
                    <span>📸 {v.photos} photos</span>
                    <span>📍 {v.lat}°N, {v.lng}°E</span>
                    <span>🆔 {v.id}</span>
                  </div>
                  {v.status === "pending" && (
                    <div className="p-3 rounded-xl mb-4" style={{ background: "rgba(251,191,36,0.06)", border: "1px solid rgba(251,191,36,0.15)" }}>
                      <div className="text-xs text-yellow-400 font-medium mb-1.5">Admin Checklist:</div>
                      {["Does the location exist on Nagpur maps?", "Are submitted photos genuine?", "Is this a public-access toilet?", "Is the location already listed?"].map(c => (
                        <div key={c} className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                          <input type="checkbox" className="rounded" />
                          <span>{c}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {v.status === "pending" && (
                    <div className="flex gap-2">
                      <button onClick={() => approveVerification(v.id)}
                        className="flex-1 py-2 rounded-xl font-bold text-sm text-black transition-all hover:opacity-90" style={{ background: "#00e676" }}>
                        ✅ Verify & Publish
                      </button>
                      <button onClick={() => rejectVerification(v.id)}
                        className="flex-1 py-2 rounded-xl font-bold text-sm text-white transition-all hover:opacity-90" style={{ background: "rgba(244,67,54,0.7)" }}>
                        ❌ Reject
                      </button>
                    </div>
                  )}
                </Card>
              ))}
            </>
          )}

          {/* SCORE REVIEWS */}
          {tab === "scores" && (
            <>
              <SectionHeader icon="🔍" title="Score Review Queue" sub="Karmachari-uploaded scores awaiting admin approval before public release" />
              {scoreReviews.map(sr => (
                <Card key={sr.id} className="p-5 mb-3" style={{ border: sr.urgent ? "1px solid rgba(244,67,54,0.3)" : undefined }}>
                  {sr.urgent && (
                    <div className="flex items-center gap-2 mb-3 px-3 py-2 rounded-xl" style={{ background: "rgba(244,67,54,0.1)", border: "1px solid rgba(244,67,54,0.25)" }}>
                      <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                      <span className="text-xs font-bold text-red-400">URGENT — Grade D Detected. Auto-alert generated.</span>
                    </div>
                  )}
                  <div className="flex items-start justify-between mb-3 gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="text-white font-bold text-sm">{sr.toiletName}</div>
                        <StatusPill status={sr.status} />
                      </div>
                      <div className="text-gray-500 text-xs">Uploaded by: {sr.karmachariName} · {sr.uploadedAt}</div>
                    </div>
                    <GradeBadge grade={sr.aiGrade} score={sr.aiScore} size="md" />
                  </div>
                  <ScoreBar score={sr.aiScore} />
                  <div className="mt-3 mb-3">
                    <div className="text-xs text-gray-500 font-mono mb-1.5">AI DETECTIONS:</div>
                    <div className="flex flex-wrap gap-1.5">
                      {sr.detections.map(d => (
                        <span key={d} className="text-xs px-2 py-0.5 rounded-full" style={{ background: "rgba(255,255,255,0.05)", color: "#9ca3af", border: "1px solid rgba(255,255,255,0.08)" }}>{d}</span>
                      ))}
                    </div>
                  </div>
                  <div className="text-xs text-gray-600 mb-4">📸 {sr.photos} photo(s) submitted</div>
                  {sr.status === "pending_review" && (
                    <div className="flex gap-2">
                      <button onClick={() => approveScore(sr.id)}
                        className="flex-1 py-2 rounded-xl font-bold text-sm text-black" style={{ background: "#00e676" }}>
                        ✅ Approve & Publish Score
                      </button>
                      <button onClick={() => rejectScore(sr.id)}
                        className="flex-1 py-2 rounded-xl font-bold text-sm text-white" style={{ background: "rgba(244,67,54,0.7)" }}>
                        🔁 Reject — Request Re-upload
                      </button>
                    </div>
                  )}
                </Card>
              ))}
            </>
          )}

          {/* ALERTS */}
          {tab === "alerts" && (
            <>
              <SectionHeader icon="🚨" title="System Alerts" sub="Auto-generated alerts for poor hygiene and staff non-compliance" right={<div className="text-xs text-gray-600 font-mono">{unresolvedA} active · {alerts.length - unresolvedA} resolved</div>} />
              {alerts.map(a => (
                <Card key={a.id} className="p-5 mb-3" style={{ border: a.resolved ? "1px solid rgba(255,255,255,0.06)" : a.severity === "critical" ? "1px solid rgba(244,67,54,0.3)" : "1px solid rgba(255,152,0,0.3)", opacity: a.resolved ? 0.5 : 1 }}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1.5">
                        <div className={`w-2 h-2 rounded-full ${a.resolved ? "bg-gray-600" : a.severity === "critical" ? "bg-red-500 animate-pulse" : "bg-orange-400 animate-pulse"}`} />
                        <span className="text-xs font-bold font-mono" style={{ color: a.resolved ? "#6b7280" : a.severity === "critical" ? "#f44336" : "#ff9800" }}>
                          {a.resolved ? "RESOLVED" : a.severity === "critical" ? "🚨 CRITICAL" : "⚠️ WARNING"} · {a.type === "poor_hygiene" ? "POOR HYGIENE" : "STAFF NON-COMPLIANCE"}
                        </span>
                      </div>
                      <div className="text-white font-bold text-sm mb-0.5">{a.toiletName}</div>
                      <div className="text-gray-500 text-xs mb-0.5">{a.area}, Nagpur</div>
                      <div className="text-gray-400 text-xs">{a.message}</div>
                      <div className="text-gray-700 text-xs mt-1">Triggered: {a.time}</div>
                    </div>
                    {!a.resolved && (
                      <div className="flex flex-col gap-2 flex-shrink-0">
                        <button onClick={() => resolveAlert(a.id)} className="px-3 py-1.5 rounded-xl text-xs font-bold text-black" style={{ background: "#00e676" }}>✅ Resolve</button>
                        <button onClick={() => setMaintenance(a.toiletId)} className="px-3 py-1.5 rounded-xl text-xs font-medium text-white border" style={{ borderColor: "rgba(255,255,255,0.12)" }}>🔧 Maintenance</button>
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </>
          )}

          {/* COMPLIANCE */}
          {tab === "compliance" && (
            <>
              <SectionHeader icon="👥" title="Staff Compliance Tracker" sub="Daily upload compliance status for all karmacharis" />
              <div className="grid grid-cols-2 gap-3 mb-6">
                {[
                  { icon: "✅", label: "Uploaded Today", val: KARMACHARI_CREDENTIALS.filter(k => k.lastUpload === "today").length, color: "#00e676" },
                  { icon: "⚠️", label: "Non-Compliant", val: nonCompliant.length, color: "#f44336" },
                ].map(s => (
                  <Card key={s.label} className="p-4 flex items-center gap-3">
                    <span className="text-2xl">{s.icon}</span>
                    <div><div className="font-black text-xl" style={{ color: s.color }}>{s.val}</div><div className="text-gray-600 text-xs">{s.label}</div></div>
                  </Card>
                ))}
              </div>
              {KARMACHARI_CREDENTIALS.map(k => {
                const overdue = k.lastUpload !== "today";
                const kToilets = PUBLISHED_TOILETS.filter(t => k.assignedToilets.includes(t.id));
                return (
                  <Card key={k.id} className="p-5 mb-3" style={{ border: overdue ? "1px solid rgba(244,67,54,0.2)" : "1px solid rgba(0,230,118,0.15)" }}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="text-white font-bold">{k.name}</div>
                          <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                            style={{ background: overdue ? "rgba(244,67,54,0.15)" : "rgba(0,230,118,0.15)", color: overdue ? "#f44336" : "#00e676", border: `1px solid ${overdue ? "rgba(244,67,54,0.3)" : "rgba(0,230,118,0.3)"}` }}>
                            {overdue ? `⚠️ Last upload: ${k.lastUpload}` : "✅ Compliant today"}
                          </span>
                        </div>
                        <div className="text-gray-600 text-xs">{k.id} · Zone: {k.zone}</div>
                        <div className="text-gray-600 text-xs mt-0.5">{k.email}</div>
                        <div className="mt-2.5">
                          <div className="text-xs text-gray-600 font-mono mb-1.5">ASSIGNED TOILETS:</div>
                          <div className="flex flex-wrap gap-1.5">
                            {kToilets.map(t => (
                              <div key={t.id} className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs"
                                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                                <div className="w-3 h-3 rounded-full flex items-center justify-center font-black" style={{ background: GRADE_CFG[t.grade].color, color: "#000", fontSize: 7 }}>{t.grade}</div>
                                <span className="text-gray-300">{t.area}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                      {overdue && (
                        <button className="px-3 py-2 rounded-xl text-xs font-bold text-white flex-shrink-0" style={{ background: "rgba(244,67,54,0.6)" }}>
                          📨 Send Reminder
                        </button>
                      )}
                    </div>
                  </Card>
                );
              })}
            </>
          )}

          {/* ALL TOILETS */}
          {tab === "toilets" && (
            <>
              <SectionHeader icon="🚻" title="All Published Toilets" sub="Live overview of all verified toilets on the public map" />
              {toilets.map(t => (
                <Card key={t.id} className="p-4 mb-2.5 flex items-center gap-4">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center font-black text-sm flex-shrink-0"
                    style={{ background: GRADE_CFG[t.grade].color, color: "#000" }}>{t.grade}</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-white text-sm font-bold truncate">{t.name}</div>
                    <div className="text-gray-600 text-xs">{t.area} · Score: {t.score}/100 · {t.dailyUploads} staff uploads</div>
                    <div className="flex items-center gap-1.5 mt-1">
                      <div className={`w-1.5 h-1.5 rounded-full ${t.lastStaffUpload === "today" ? "bg-green-400" : "bg-orange-500 animate-pulse"}`} />
                      <span className="text-xs" style={{ color: t.lastStaffUpload === "today" ? "#00e676" : "#ff9800" }}>Staff: {t.lastStaffUpload}</span>
                      {t.alert && <span className="text-xs text-red-400 ml-2">🚨 Alert Active</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <StatusPill status={t.status} />
                    <button onClick={() => setMaintenance(t.id)} className="text-xs px-2.5 py-1.5 rounded-xl border text-gray-500 hover:text-white hover:bg-white/8 transition-all"
                      style={{ borderColor: "rgba(255,255,255,0.09)" }}>🔧 Maintenance</button>
                  </div>
                </Card>
              ))}
            </>
          )}
        </div>
      </div>
      <Toast msg={toast.m} visible={toast.v} />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ROOT APP
// ═══════════════════════════════════════════════════════════════════════════════

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);

  const handleLogin = (user) => setCurrentUser(user);
  const handleLogout = () => setCurrentUser(null);

  if (!currentUser) return <LoginScreen onLogin={handleLogin} />;
  if (currentUser.role === "admin") return <AdminPanel user={currentUser} onLogout={handleLogout} />;
  if (currentUser.role === "karmachari") return <KarmachariPortal user={currentUser} onLogout={handleLogout} />;
  return <PublicMap user={currentUser} onLogout={handleLogout} />;
}
