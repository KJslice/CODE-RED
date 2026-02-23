import { useState, useEffect, useRef, useCallback } from "react";

// ─── MOCK DATA ───────────────────────────────────────────────────────────────
const NAGPUR_TOILETS = [
  { id: 1, name: "Sitabuldi Market Toilet", area: "Sitabuldi", grade: "B", score: 78, lat: 21.146, lng: 79.088, reviews: 14, lastUpdated: "2 hrs ago", x: 52, y: 44 },
  { id: 2, name: "Itwari Station Public WC", area: "Itwari", grade: "D", score: 42, lat: 21.151, lng: 79.075, reviews: 8, lastUpdated: "30 min ago", x: 34, y: 38 },
  { id: 3, name: "Sadar Market Facility", area: "Sadar", grade: "A", score: 94, lat: 21.138, lng: 79.082, reviews: 22, lastUpdated: "5 hrs ago", x: 44, y: 56 },
  { id: 4, name: "Dharampeth Toilet Block", area: "Dharampeth", grade: "C", score: 65, lat: 21.131, lng: 79.062, reviews: 6, lastUpdated: "1 day ago", x: 27, y: 62 },
  { id: 5, name: "Gandhibagh Public WC", area: "Gandhibagh", grade: "A", score: 91, lat: 21.143, lng: 79.101, reviews: 19, lastUpdated: "3 hrs ago", x: 68, y: 48 },
  { id: 6, name: "Lakadganj Community Toilet", area: "Lakadganj", grade: "B", score: 81, lat: 21.158, lng: 79.095, reviews: 11, lastUpdated: "6 hrs ago", x: 62, y: 30 },
  { id: 7, name: "Nandanvan Park WC", area: "Nandanvan", grade: "D", score: 38, lat: 21.122, lng: 79.098, reviews: 4, lastUpdated: "20 min ago", x: 65, y: 72 },
  { id: 8, name: "Cotton Market Facility", area: "Cotton Market", grade: "C", score: 68, lat: 21.165, lng: 79.082, reviews: 9, lastUpdated: "4 hrs ago", x: 46, y: 22 },
  { id: 9, name: "Mahal Heritage Toilet", area: "Mahal", grade: "B", score: 76, lat: 21.148, lng: 79.079, reviews: 16, lastUpdated: "8 hrs ago", x: 39, y: 42 },
  { id: 10, name: "Nagpur Railway Station WC", area: "Ajni", grade: "A", score: 88, lat: 21.127, lng: 79.115, reviews: 31, lastUpdated: "1 hr ago", x: 80, y: 65 },
];

const GRADE_CONFIG = {
  A: { color: "#00e676", bg: "rgba(0,230,118,0.15)", border: "#00e676", label: "Excellent", ring: "#00e67660" },
  B: { color: "#ffeb3b", bg: "rgba(255,235,59,0.15)", border: "#ffeb3b", label: "Good", ring: "#ffeb3b60" },
  C: { color: "#ff9800", bg: "rgba(255,152,0,0.15)", border: "#ff9800", label: "Average", ring: "#ff980060" },
  D: { color: "#f44336", bg: "rgba(244,67,54,0.15)", border: "#f44336", label: "Poor — Alert!", ring: "#f4433660" },
};

const YOLO_DETECTIONS = [
  { class: "Heavy Dirt/Stains", deduction: 25, icon: "🟤" },
  { class: "Broken Fixtures", deduction: 20, icon: "🔧" },
  { class: "Waste/Litter Present", deduction: 20, icon: "🗑️" },
  { class: "No Hygiene Items", deduction: 10, icon: "🧴" },
  { class: "Poor Lighting", deduction: 10, icon: "💡" },
  { class: "Water Puddles", deduction: 15, icon: "💧" },
];

// ─── HELPERS ─────────────────────────────────────────────────────────────────
function GradeBadge({ grade, score, size = "md" }) {
  const cfg = GRADE_CONFIG[grade];
  const sizes = { sm: "text-xs px-2 py-0.5", md: "text-sm px-3 py-1", lg: "text-lg px-4 py-2 font-bold" };
  return (
    <span style={{ color: cfg.color, background: cfg.bg, border: `1px solid ${cfg.border}`, borderRadius: 6 }}
      className={`font-mono font-bold ${sizes[size]} inline-flex items-center gap-1`}>
      {grade} {score !== undefined && <span className="opacity-70 text-xs font-normal">({score})</span>}
    </span>
  );
}

function ScoreBar({ score }) {
  const color = score >= 90 ? "#00e676" : score >= 75 ? "#ffeb3b" : score >= 60 ? "#ff9800" : "#f44336";
  return (
    <div className="w-full h-2 rounded-full" style={{ background: "rgba(255,255,255,0.1)" }}>
      <div className="h-2 rounded-full transition-all duration-1000"
        style={{ width: `${score}%`, background: `linear-gradient(90deg, ${color}88, ${color})` }} />
    </div>
  );
}

// ─── MAP COMPONENTS ──────────────────────────────────────────────────────────
function MapToiletPin({ toilet, selected, onClick, animated }) {
  const cfg = GRADE_CONFIG[toilet.grade];
  const isD = toilet.grade === "D";
  return (
    <div onClick={() => onClick(toilet)}
      className="absolute cursor-pointer transition-all duration-300 hover:scale-110"
      style={{ left: `${toilet.x}%`, top: `${toilet.y}%`, transform: "translate(-50%, -50%)", zIndex: selected ? 10 : 5 }}>
      {isD && (
        <div className="absolute inset-0 rounded-full animate-ping"
          style={{ background: cfg.ring, width: 28, height: 28, top: -4, left: -4 }} />
      )}
      <div className="relative flex items-center justify-center rounded-full font-bold text-xs shadow-lg transition-all"
        style={{
          width: selected ? 32 : 26, height: selected ? 32 : 26,
          background: cfg.color, color: "#000",
          boxShadow: `0 0 ${selected ? 20 : 10}px ${cfg.color}80`,
          border: selected ? "3px solid #fff" : "2px solid rgba(255,255,255,0.3)"
        }}>
        {toilet.grade}
      </div>
      <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 whitespace-nowrap text-xs px-1.5 py-0.5 rounded"
        style={{ background: "rgba(0,0,0,0.85)", color: "#fff", border: `1px solid ${cfg.color}40`, fontSize: 9 }}>
        {toilet.area}
      </div>
    </div>
  );
}

function ToiletPopup({ toilet, onClose }) {
  const cfg = GRADE_CONFIG[toilet.grade];
  return (
    <div className="absolute z-20 rounded-xl p-4 w-72 shadow-2xl"
      style={{
        left: `${Math.min(toilet.x + 5, 65)}%`, top: `${Math.max(toilet.y - 5, 5)}%`,
        background: "rgba(8,12,24,0.97)", border: `1px solid ${cfg.border}50`, backdropFilter: "blur(12px)"
      }}>
      <button onClick={onClose} className="absolute top-2 right-2 text-gray-400 hover:text-white w-6 h-6 flex items-center justify-center rounded-full hover:bg-white/10">✕</button>
      <div className="flex items-start gap-3 mb-3">
        <div className="text-2xl">🚻</div>
        <div>
          <div className="font-bold text-white text-sm">{toilet.name}</div>
          <div className="text-gray-400 text-xs mt-0.5">{toilet.area}, Nagpur</div>
        </div>
      </div>
      <div className="flex items-center gap-2 mb-3">
        <GradeBadge grade={toilet.grade} score={toilet.score} size="md" />
        <span style={{ color: cfg.color }} className="text-xs">{cfg.label}</span>
      </div>
      <ScoreBar score={toilet.score} />
      <div className="flex justify-between text-xs text-gray-500 mt-2 mb-3">
        <span>Score: {toilet.score}/100</span>
        <span>Updated {toilet.lastUpdated}</span>
      </div>
      <div className="flex gap-2 text-xs text-gray-400">
        <span>⭐ {toilet.reviews} reviews</span>
        <span>📍 {(Math.random() * 1.5 + 0.2).toFixed(1)} km away</span>
      </div>
      {toilet.grade === "D" && (
        <div className="mt-3 p-2 rounded text-xs" style={{ background: "rgba(244,67,54,0.15)", border: "1px solid #f4433650", color: "#f44336" }}>
          ⚠️ Admin Alert Active — Inspection Pending
        </div>
      )}
    </div>
  );
}

// ─── UPLOAD PANEL ─────────────────────────────────────────────────────────────
function UploadPanel({ onClose, onGradeSubmit }) {
  const [phase, setPhase] = useState("upload"); // upload | analyzing | result | submitted
  const [dragging, setDragging] = useState(false);
  const [files, setFiles] = useState([]);
  const [progress, setProgress] = useState(0);
  const [detections, setDetections] = useState([]);
  const [score, setScore] = useState(0);
  const [grade, setGrade] = useState("A");
  const fileRef = useRef();

  const handleFiles = (fs) => {
    const arr = Array.from(fs).slice(0, 5);
    setFiles(arr.map(f => ({ file: f, url: URL.createObjectURL(f) })));
  };

  const runAnalysis = async () => {
    setPhase("analyzing");
    setProgress(0);
    // Simulate backend analysis
    for (let i = 0; i <= 100; i += 4) {
      await new Promise(r => setTimeout(r, 60));
      setProgress(i);
    }
    // Randomly pick 2-4 detections
    const shuffled = [...YOLO_DETECTIONS].sort(() => Math.random() - 0.5);
    const detected = shuffled.slice(0, Math.floor(Math.random() * 3) + 1);
    const totalDeduction = detected.reduce((s, d) => s + d.deduction, 0);
    const finalScore = Math.max(0, 100 - totalDeduction);
    const g = finalScore >= 90 ? "A" : finalScore >= 75 ? "B" : finalScore >= 60 ? "C" : "D";
    setDetections(detected);
    setScore(finalScore);
    setGrade(g);
    setPhase("result");
  };

  const submit = () => {
    setPhase("submitted");
    onGradeSubmit({ grade, score });
    setTimeout(onClose, 2500);
  };

  return (
    <div className="absolute right-4 top-4 bottom-4 w-80 z-30 rounded-2xl flex flex-col overflow-hidden"
      style={{ background: "rgba(6,10,22,0.97)", border: "1px solid rgba(255,255,255,0.1)", backdropFilter: "blur(16px)" }}>
      <div className="flex items-center justify-between p-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        <div>
          <div className="text-white font-bold text-sm">📤 Upload & Analyze</div>
          <div className="text-gray-500 text-xs mt-0.5">AI-powered cleanliness check</div>
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-white w-7 h-7 rounded-full hover:bg-white/10 flex items-center justify-center">✕</button>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {phase === "upload" && (
          <>
            <div
              onDragOver={e => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={e => { e.preventDefault(); setDragging(false); handleFiles(e.dataTransfer.files); }}
              onClick={() => fileRef.current.click()}
              className="rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all p-6 mb-4"
              style={{
                borderColor: dragging ? "#00e5ff" : "rgba(255,255,255,0.15)",
                background: dragging ? "rgba(0,229,255,0.05)" : "rgba(255,255,255,0.02)",
                minHeight: 140
              }}>
              <div className="text-3xl mb-2">{dragging ? "📂" : "📸"}</div>
              <div className="text-white text-sm font-medium">Drop photos here</div>
              <div className="text-gray-500 text-xs mt-1">or click to browse (max 5)</div>
              <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={e => handleFiles(e.target.files)} />
            </div>
            {files.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mb-4">
                {files.map((f, i) => (
                  <div key={i} className="aspect-square rounded-lg overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.1)" }}>
                    <img src={f.url} alt="" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            )}
            <div className="text-xs text-gray-500 mb-4 p-3 rounded-lg" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
              <div className="font-medium text-gray-400 mb-1">🤖 YOLOv8 will detect:</div>
              {YOLO_DETECTIONS.map(d => (
                <div key={d.class} className="flex justify-between mt-0.5">
                  <span>{d.icon} {d.class}</span>
                  <span className="text-red-400">−{d.deduction}pts</span>
                </div>
              ))}
            </div>
          </>
        )}

        {phase === "analyzing" && (
          <div className="flex flex-col items-center py-8">
            <div className="relative w-20 h-20 mb-6">
              <svg className="w-20 h-20 animate-spin" style={{ animationDuration: "2s" }} viewBox="0 0 80 80">
                <circle cx="40" cy="40" r="35" fill="none" stroke="rgba(0,229,255,0.2)" strokeWidth="6" />
                <circle cx="40" cy="40" r="35" fill="none" stroke="#00e5ff" strokeWidth="6"
                  strokeDasharray="220" strokeDashoffset={220 - (220 * progress / 100)} strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center text-cyan-400 font-bold text-sm">{progress}%</div>
            </div>
            <div className="text-white font-semibold mb-1">Analyzing Images...</div>
            <div className="text-gray-500 text-xs text-center">YOLOv8 scanning for hygiene issues</div>
            <div className="mt-6 w-full space-y-2">
              {["Loading model...", "Running inference...", "Calculating score..."].map((step, i) => (
                <div key={i} className="flex items-center gap-2 text-xs">
                  <div className="w-4 h-4 rounded-full flex items-center justify-center"
                    style={{ background: progress > i * 33 + 10 ? "#00e676" : "rgba(255,255,255,0.1)" }}>
                    {progress > i * 33 + 10 ? "✓" : "·"}
                  </div>
                  <span style={{ color: progress > i * 33 + 10 ? "#00e676" : "#6b7280" }}>{step}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {phase === "result" && (
          <>
            <div className="text-center mb-4">
              <div className="text-gray-400 text-xs mb-2">Analysis Complete</div>
              <div className="text-6xl font-black mb-1" style={{ color: GRADE_CONFIG[grade].color, textShadow: `0 0 30px ${GRADE_CONFIG[grade].color}` }}>
                {grade}
              </div>
              <div className="text-2xl font-bold text-white">{score}<span className="text-gray-500 text-sm">/100</span></div>
              <div className="text-xs mt-1" style={{ color: GRADE_CONFIG[grade].color }}>{GRADE_CONFIG[grade].label}</div>
            </div>
            <ScoreBar score={score} />
            <div className="mt-4 mb-4">
              <div className="text-xs text-gray-400 font-medium mb-2">🔍 Detected Issues:</div>
              {detections.length === 0 ? (
                <div className="text-green-400 text-xs p-2 rounded" style={{ background: "rgba(0,230,118,0.1)" }}>
                  ✅ No major hygiene issues detected
                </div>
              ) : detections.map(d => (
                <div key={d.class} className="flex justify-between items-center py-1.5 border-b text-xs"
                  style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                  <span className="text-gray-300">{d.icon} {d.class}</span>
                  <span className="text-red-400 font-mono">−{d.deduction}pts</span>
                </div>
              ))}
            </div>
            {grade === "D" && (
              <div className="mb-3 p-2 rounded text-xs" style={{ background: "rgba(244,67,54,0.15)", border: "1px solid #f4433650", color: "#f44336" }}>
                ⚠️ Grade D will trigger an Admin Alert automatically
              </div>
            )}
          </>
        )}

        {phase === "submitted" && (
          <div className="flex flex-col items-center py-12">
            <div className="text-5xl mb-4 animate-bounce">✅</div>
            <div className="text-white font-bold text-lg">Submitted!</div>
            <div className="text-gray-400 text-sm mt-1 text-center">Map updated in real-time</div>
            <div className="mt-4">
              <GradeBadge grade={grade} score={score} size="lg" />
            </div>
          </div>
        )}
      </div>

      {(phase === "upload" || phase === "result") && (
        <div className="p-4" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
          {phase === "upload" && (
            <button onClick={runAnalysis} disabled={files.length === 0}
              className="w-full py-3 rounded-xl font-bold text-sm transition-all"
              style={{
                background: files.length > 0 ? "linear-gradient(135deg, #00b4d8, #0077b6)" : "rgba(255,255,255,0.05)",
                color: files.length > 0 ? "#fff" : "#6b7280",
                cursor: files.length > 0 ? "pointer" : "not-allowed"
              }}>
              🤖 Analyze with YOLOv8
            </button>
          )}
          {phase === "result" && (
            <button onClick={submit} className="w-full py-3 rounded-xl font-bold text-sm text-black transition-all hover:opacity-90"
              style={{ background: GRADE_CONFIG[grade].color }}>
              📍 Submit to Map
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ─── SEARCH PANEL ─────────────────────────────────────────────────────────────
function SearchPanel({ toilets, onSelect, onClose }) {
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");
  const filtered = toilets
    .filter(t => filter === "all" || t.grade === filter)
    .filter(t => t.name.toLowerCase().includes(query.toLowerCase()) || t.area.toLowerCase().includes(query.toLowerCase()))
    .sort((a, b) => b.score - a.score);

  return (
    <div className="absolute left-4 top-4 bottom-4 w-72 z-30 rounded-2xl flex flex-col overflow-hidden"
      style={{ background: "rgba(6,10,22,0.97)", border: "1px solid rgba(255,255,255,0.1)", backdropFilter: "blur(16px)" }}>
      <div className="p-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        <div className="flex items-center justify-between mb-3">
          <div className="text-white font-bold text-sm">🔍 Search Nearby</div>
          <button onClick={onClose} className="text-gray-400 hover:text-white w-7 h-7 rounded-full hover:bg-white/10 flex items-center justify-center">✕</button>
        </div>
        <input value={query} onChange={e => setQuery(e.target.value)}
          className="w-full px-3 py-2 rounded-lg text-sm text-white mb-3 outline-none focus:ring-1"
          style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)", focusRingColor: "#00e5ff" }}
          placeholder="Search by name or area..." />
        <div className="flex gap-1 flex-wrap">
          {["all", "A", "B", "C", "D"].map(g => (
            <button key={g} onClick={() => setFilter(g)}
              className="text-xs px-2 py-1 rounded-md transition-all font-mono font-bold"
              style={{
                background: filter === g ? (g === "all" ? "#00e5ff" : GRADE_CONFIG[g]?.color) : "rgba(255,255,255,0.06)",
                color: filter === g ? "#000" : "#9ca3af"
              }}>
              {g === "all" ? "All" : `Grade ${g}`}
            </button>
          ))}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        {filtered.map((t, i) => {
          const cfg = GRADE_CONFIG[t.grade];
          const dist = (Math.random() * 2 + 0.1).toFixed(1);
          return (
            <div key={t.id} onClick={() => onSelect(t)}
              className="p-3 cursor-pointer transition-all hover:bg-white/5"
              style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="text-white text-xs font-medium truncate">{t.name}</div>
                  <div className="text-gray-500 text-xs mt-0.5">{t.area} · {dist} km</div>
                </div>
                <GradeBadge grade={t.grade} size="sm" />
              </div>
              <ScoreBar score={t.score} />
              <div className="text-gray-600 text-xs mt-1">Updated {t.lastUpdated}</div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center h-32 text-gray-600 text-sm">
            <div className="text-2xl mb-2">🔍</div>
            No results found
          </div>
        )}
      </div>
    </div>
  );
}

// ─── ADMIN DASHBOARD ──────────────────────────────────────────────────────────
function AdminDashboard({ toilets, onClose }) {
  const alerts = toilets.filter(t => t.grade === "D");
  const gradeCount = { A: 0, B: 0, C: 0, D: 0 };
  toilets.forEach(t => gradeCount[t.grade]++);
  const total = toilets.length;

  return (
    <div className="absolute inset-0 z-40 overflow-auto"
      style={{ background: "rgba(4,8,18,0.98)", backdropFilter: "blur(20px)" }}>
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="text-2xl font-black text-white tracking-tight">🛡️ Admin Dashboard</div>
            <div className="text-gray-500 text-sm mt-0.5">SmartToilet — Nagpur City Monitoring</div>
          </div>
          <button onClick={onClose} className="px-4 py-2 rounded-xl text-sm font-medium hover:bg-white/10 text-gray-400 border"
            style={{ borderColor: "rgba(255,255,255,0.1)" }}>
            ← Back to Map
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          {[
            { label: "Total Toilets", value: total, icon: "🚻", color: "#00e5ff" },
            { label: "Grade A", value: gradeCount.A, icon: "🟢", color: "#00e676" },
            { label: "Active Alerts", value: gradeCount.D, icon: "🔴", color: "#f44336" },
            { label: "Avg Score", value: Math.round(toilets.reduce((s, t) => s + t.score, 0) / total), icon: "📊", color: "#ffeb3b" },
          ].map(stat => (
            <div key={stat.label} className="p-4 rounded-xl"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
              <div className="text-2xl mb-1">{stat.icon}</div>
              <div className="font-black text-2xl" style={{ color: stat.color }}>{stat.value}</div>
              <div className="text-gray-500 text-xs mt-0.5">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Grade Distribution */}
        <div className="p-4 rounded-xl mb-6" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
          <div className="text-white font-semibold text-sm mb-3">Grade Distribution</div>
          <div className="flex gap-3 items-end h-16">
            {Object.entries(gradeCount).map(([g, count]) => {
              const cfg = GRADE_CONFIG[g];
              const pct = (count / total) * 100;
              return (
                <div key={g} className="flex flex-col items-center gap-1 flex-1">
                  <div className="text-xs text-gray-400">{count}</div>
                  <div className="w-full rounded-t"
                    style={{ height: `${Math.max(pct * 0.5, 4)}px`, background: cfg.color, opacity: 0.85 }} />
                  <div className="text-xs font-bold" style={{ color: cfg.color }}>Grade {g}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Alerts */}
        {alerts.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <div className="text-red-400 font-bold text-sm">🚨 Active Alerts ({alerts.length})</div>
            </div>
            {alerts.map(t => (
              <div key={t.id} className="p-4 rounded-xl mb-3"
                style={{ background: "rgba(244,67,54,0.08)", border: "1px solid rgba(244,67,54,0.3)" }}>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-white font-semibold text-sm">{t.name}</div>
                    <div className="text-gray-400 text-xs mt-0.5">📍 {t.area}, Nagpur · Updated {t.lastUpdated}</div>
                    <div className="mt-2 flex items-center gap-3">
                      <GradeBadge grade={t.grade} score={t.score} />
                      <span className="text-red-400 text-xs">⚠️ Requires immediate inspection</span>
                    </div>
                  </div>
                  <button className="px-3 py-1.5 rounded-lg text-xs font-medium text-white hover:opacity-90 mt-1"
                    style={{ background: "#f44336" }}>
                    Flag for Inspection
                  </button>
                </div>
                <ScoreBar score={t.score} />
              </div>
            ))}
          </div>
        )}

        {/* All Toilets Table */}
        <div className="rounded-xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.07)" }}>
          <div className="px-4 py-3" style={{ background: "rgba(255,255,255,0.03)", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
            <div className="text-white font-semibold text-sm">All Monitored Toilets</div>
          </div>
          {toilets.map((t, i) => {
            const cfg = GRADE_CONFIG[t.grade];
            return (
              <div key={t.id} className="flex items-center gap-3 px-4 py-3"
                style={{ borderBottom: i < toilets.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none" }}>
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                  style={{ background: cfg.color, color: "#000" }}>{t.grade}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-white text-xs font-medium truncate">{t.name}</div>
                  <div className="text-gray-500 text-xs">{t.area} · {t.reviews} reviews</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-sm" style={{ color: cfg.color }}>{t.score}</div>
                  <div className="text-gray-600 text-xs">{t.lastUpdated}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── NAGPUR MAP BACKGROUND ────────────────────────────────────────────────────
function NagpurMap3D({ toilets, selectedToilet, onPinClick }) {
  return (
    <div className="relative w-full h-full overflow-hidden" style={{ background: "#050c1a" }}>
      {/* Sky gradient */}
      <div className="absolute inset-0" style={{
        background: "radial-gradient(ellipse at 50% 30%, #0a1628 0%, #040810 60%, #020508 100%)"
      }} />

      {/* Grid lines - simulated 3D city grid */}
      <svg className="absolute inset-0 w-full h-full opacity-20" viewBox="0 0 100 100" preserveAspectRatio="none">
        <defs>
          <pattern id="grid" width="8" height="8" patternUnits="userSpaceOnUse">
            <path d="M 8 0 L 0 0 0 8" fill="none" stroke="#1e40af" strokeWidth="0.3" />
          </pattern>
          <radialGradient id="mapGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#1e3a8a" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#1e3a8a" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width="100" height="100" fill="url(#grid)" />
        <rect width="100" height="100" fill="url(#mapGlow)" />

        {/* Major roads */}
        <line x1="50" y1="0" x2="50" y2="100" stroke="#1d4ed8" strokeWidth="0.8" opacity="0.6" />
        <line x1="0" y1="50" x2="100" y2="50" stroke="#1d4ed8" strokeWidth="0.8" opacity="0.6" />
        <line x1="20" y1="0" x2="80" y2="100" stroke="#1e3a8a" strokeWidth="0.5" opacity="0.4" />
        <line x1="80" y1="0" x2="20" y2="100" stroke="#1e3a8a" strokeWidth="0.5" opacity="0.4" />
        <line x1="0" y1="25" x2="100" y2="25" stroke="#1e3a8a" strokeWidth="0.4" opacity="0.3" />
        <line x1="0" y1="75" x2="100" y2="75" stroke="#1e3a8a" strokeWidth="0.4" opacity="0.3" />
        <line x1="25" y1="0" x2="25" y2="100" stroke="#1e3a8a" strokeWidth="0.4" opacity="0.3" />
        <line x1="75" y1="0" x2="75" y2="100" stroke="#1e3a8a" strokeWidth="0.4" opacity="0.3" />

        {/* City blocks */}
        {[...Array(20)].map((_, i) => (
          <rect key={i} x={Math.random() * 80 + 5} y={Math.random() * 80 + 5} width={Math.random() * 6 + 2} height={Math.random() * 6 + 2}
            fill="#0f172a" stroke="#1e3a8a" strokeWidth="0.3" opacity="0.5" rx="0.3" />
        ))}

        {/* Nagpur landmarks text */}
        <text x="48" y="43" fill="#3b82f6" fontSize="2" opacity="0.7" textAnchor="middle">SITABULDI</text>
        <text x="65" y="48" fill="#3b82f6" fontSize="1.8" opacity="0.6" textAnchor="middle">GANDHIBAGH</text>
        <text x="33" y="62" fill="#3b82f6" fontSize="1.8" opacity="0.6" textAnchor="middle">DHARAMPETH</text>
        <text x="60" y="30" fill="#3b82f6" fontSize="1.8" opacity="0.6" textAnchor="middle">LAKADGANJ</text>
        <text x="45" y="23" fill="#3b82f6" fontSize="1.8" opacity="0.6" textAnchor="middle">COTTON MKT</text>
        <text x="78" y="65" fill="#3b82f6" fontSize="1.8" opacity="0.6" textAnchor="middle">AJNI</text>

        {/* Nag River */}
        <path d="M 15 35 Q 35 30 50 50 Q 65 70 85 65" fill="none" stroke="#1d4ed8" strokeWidth="1.2" opacity="0.5" strokeDasharray="3,2" />
        <text x="50" y="60" fill="#2563eb" fontSize="1.5" opacity="0.4" textAnchor="middle" transform="rotate(-15, 50, 60)">Nag River</text>
      </svg>

      {/* Glow center */}
      <div className="absolute" style={{
        top: "35%", left: "45%", transform: "translate(-50%, -50%)",
        width: 300, height: 300, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(29,78,216,0.12) 0%, transparent 70%)",
        pointerEvents: "none"
      }} />

      {/* NAGPUR label */}
      <div className="absolute bottom-6 right-6 text-right" style={{ pointerEvents: "none" }}>
        <div className="text-4xl font-black tracking-widest" style={{
          color: "transparent",
          WebkitTextStroke: "1px rgba(59,130,246,0.3)",
          textShadow: "0 0 60px rgba(59,130,246,0.2)"
        }}>NAGPUR</div>
        <div className="text-xs text-blue-800 tracking-widest font-mono">MAHARASHTRA · INDIA</div>
      </div>

      {/* Toilet pins */}
      {toilets.map(t => (
        <MapToiletPin key={t.id} toilet={t} selected={selectedToilet?.id === t.id} onClick={onPinClick} />
      ))}
    </div>
  );
}

// ─── TOAST ────────────────────────────────────────────────────────────────────
function Toast({ message, visible }) {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 transition-all duration-500"
      style={{ opacity: visible ? 1 : 0, transform: `translateX(-50%) translateY(${visible ? 0 : 20}px)` }}>
      <div className="px-5 py-3 rounded-xl text-sm font-medium text-black shadow-2xl"
        style={{ background: "#00e676", boxShadow: "0 0 30px rgba(0,230,118,0.4)" }}>
        {message}
      </div>
    </div>
  );
}

// ─── LEGEND ───────────────────────────────────────────────────────────────────
function Legend() {
  return (
    <div className="absolute bottom-4 left-4 z-20 p-3 rounded-xl text-xs"
      style={{ background: "rgba(6,10,22,0.9)", border: "1px solid rgba(255,255,255,0.08)", backdropFilter: "blur(12px)" }}>
      <div className="text-gray-400 font-medium mb-2 text-xs">Cleanliness Grade</div>
      {Object.entries(GRADE_CONFIG).map(([g, cfg]) => (
        <div key={g} className="flex items-center gap-2 mb-1">
          <div className="w-4 h-4 rounded-full flex items-center justify-center text-xs font-bold"
            style={{ background: cfg.color, color: "#000", fontSize: 9 }}>{g}</div>
          <span className="text-gray-400">{cfg.label}</span>
          <span className="text-gray-600 font-mono text-xs">
            {g === "A" ? "90+" : g === "B" ? "75-89" : g === "C" ? "60-74" : "<60"}
          </span>
        </div>
      ))}
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function SmartToiletFinder() {
  const [toilets, setToilets] = useState(NAGPUR_TOILETS);
  const [selectedToilet, setSelectedToilet] = useState(null);
  const [showSearch, setShowSearch] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: "" });
  const [view, setView] = useState("map"); // map | admin

  const showToast = (msg) => {
    setToast({ visible: true, message: msg });
    setTimeout(() => setToast({ visible: false, message: "" }), 3000);
  };

  const handlePinClick = (toilet) => {
    setSelectedToilet(prev => prev?.id === toilet.id ? null : toilet);
    setShowSearch(false);
  };

  const handleSearchSelect = (toilet) => {
    setSelectedToilet(toilet);
    setShowSearch(false);
  };

  const handleGradeSubmit = ({ grade, score }) => {
    // Update a random toilet's grade to simulate real-time update
    setToilets(prev => prev.map((t, i) =>
      i === 0 ? { ...t, grade, score, lastUpdated: "just now" } : t
    ));
    showToast(`✅ Grade ${grade} submitted to map — live update!`);
    setShowUpload(false);
    setSelectedToilet(null);
  };

  const alertCount = toilets.filter(t => t.grade === "D").length;

  return (
    <div className="relative w-full h-screen overflow-hidden" style={{ fontFamily: "'DM Mono', 'Fira Code', monospace", background: "#050c1a" }}>
      {/* Map */}
      <NagpurMap3D toilets={toilets} selectedToilet={selectedToilet} onPinClick={handlePinClick} />

      {/* Selected toilet popup */}
      {selectedToilet && !showSearch && !showUpload && (
        <ToiletPopup toilet={selectedToilet} onClose={() => setSelectedToilet(null)} />
      )}

      {/* Top bar */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3">
        <div className="flex items-center gap-3 px-5 py-2.5 rounded-2xl"
          style={{ background: "rgba(6,10,22,0.95)", border: "1px solid rgba(255,255,255,0.1)", backdropFilter: "blur(16px)" }}>
          <span className="text-xl">🚻</span>
          <div>
            <div className="text-white font-black text-sm tracking-wide">SmartToilet Finder</div>
            <div className="text-gray-500 text-xs">Nagpur · {toilets.length} locations tracked</div>
          </div>
        </div>
      </div>

      {/* Left controls */}
      <div className="absolute left-4 top-1/2 -translate-y-1/2 z-20 flex flex-col gap-3">
        <button onClick={() => { setShowSearch(s => !s); setShowUpload(false); setSelectedToilet(null); }}
          className="group w-12 h-12 rounded-xl flex flex-col items-center justify-center transition-all hover:scale-110"
          style={{
            background: showSearch ? "rgba(0,229,255,0.2)" : "rgba(6,10,22,0.9)",
            border: showSearch ? "1px solid #00e5ff" : "1px solid rgba(255,255,255,0.1)",
            backdropFilter: "blur(12px)"
          }}>
          <span className="text-lg">🔍</span>
          <span className="text-xs text-gray-500 group-hover:text-gray-300" style={{ fontSize: 8 }}>Search</span>
        </button>
        <button onClick={() => { setShowUpload(s => !s); setShowSearch(false); setSelectedToilet(null); }}
          className="group w-12 h-12 rounded-xl flex flex-col items-center justify-center transition-all hover:scale-110"
          style={{
            background: showUpload ? "rgba(0,229,255,0.2)" : "rgba(6,10,22,0.9)",
            border: showUpload ? "1px solid #00e5ff" : "1px solid rgba(255,255,255,0.1)",
            backdropFilter: "blur(12px)"
          }}>
          <span className="text-lg">📤</span>
          <span className="text-xs text-gray-500 group-hover:text-gray-300" style={{ fontSize: 8 }}>Upload</span>
        </button>
        <button onClick={() => setShowAdmin(true)}
          className="group w-12 h-12 rounded-xl flex flex-col items-center justify-center transition-all hover:scale-110 relative"
          style={{ background: "rgba(6,10,22,0.9)", border: "1px solid rgba(255,255,255,0.1)", backdropFilter: "blur(12px)" }}>
          <span className="text-lg">🛡️</span>
          <span className="text-xs text-gray-500 group-hover:text-gray-300" style={{ fontSize: 8 }}>Admin</span>
          {alertCount > 0 && (
            <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-white flex items-center justify-center font-bold"
              style={{ background: "#f44336", fontSize: 9 }}>{alertCount}</div>
          )}
        </button>
      </div>

      {/* Search nearby button (bottom) */}
      {!showSearch && !showUpload && (
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-20">
          <button onClick={() => { setShowSearch(true); setSelectedToilet(null); }}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm transition-all hover:scale-105"
            style={{
              background: "linear-gradient(135deg, #0077b6, #00b4d8)",
              boxShadow: "0 4px 24px rgba(0,180,216,0.4)",
              color: "#fff"
            }}>
            <span>🔍</span> Search Nearby Toilets
          </button>
        </div>
      )}

      {/* Upload FAB */}
      {!showUpload && !showSearch && (
        <button onClick={() => setShowUpload(true)}
          className="absolute bottom-4 right-4 z-20 w-14 h-14 rounded-2xl flex items-center justify-center text-2xl transition-all hover:scale-110"
          style={{
            background: "linear-gradient(135deg, #0077b6, #00b4d8)",
            boxShadow: "0 4px 24px rgba(0,180,216,0.5)"
          }}>
          📸
        </button>
      )}

      {/* Panels */}
      {showSearch && <SearchPanel toilets={toilets} onSelect={handleSearchSelect} onClose={() => setShowSearch(false)} />}
      {showUpload && <UploadPanel onClose={() => setShowUpload(false)} onGradeSubmit={handleGradeSubmit} />}

      {/* Admin Dashboard */}
      {showAdmin && <AdminDashboard toilets={toilets} onClose={() => setShowAdmin(false)} />}

      {/* Legend */}
      <Legend />

      {/* Live indicator */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-2 px-3 py-1.5 rounded-full text-xs"
        style={{ background: "rgba(6,10,22,0.9)", border: "1px solid rgba(255,255,255,0.08)" }}>
        <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
        <span className="text-gray-400">LIVE</span>
      </div>

      {/* Toast */}
      <Toast message={toast.message} visible={toast.visible} />
    </div>
  );
}
