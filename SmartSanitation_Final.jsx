import { useState, useEffect, useRef } from "react";

// ─── GOOGLE FONTS + GLOBAL STYLES ────────────────────────────────────────────
const Styles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600&display=swap');
    * { box-sizing: border-box; margin:0; padding:0; }
    :root {
      --primary: #0B6E4F; --primary-light: #E8F5F0; --primary-mid: #1a9a6f;
      --blue: #1a73e8; --surface: #ffffff; --bg: #f0f4f8;
      --border: #e2e8f0; --text: #1a2332; --text2: #4a5568; --text3: #94a3b8;
      --gradeA: #16a34a; --gradeA-bg: #dcfce7; --gradeA-bd: #bbf7d0;
      --gradeB: #ca8a04; --gradeB-bg: #fef9c3; --gradeB-bd: #fde68a;
      --gradeC: #ea580c; --gradeC-bg: #ffedd5; --gradeC-bd: #fed7aa;
      --gradeD: #dc2626; --gradeD-bg: #fee2e2; --gradeD-bd: #fecaca;
      --shadow: 0 4px 16px rgba(0,0,0,0.1); --radius: 16px;
    }
    body { font-family:'Outfit',sans-serif; background:#f0f4f8; }
    .mono { font-family:'JetBrains Mono',monospace; }
    .scrollbar-hide::-webkit-scrollbar { display:none; }
    .scrollbar-hide { -ms-overflow-style:none; scrollbar-width:none; }
    @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
    @keyframes fadeIn { from{opacity:0} to{opacity:1} }
    @keyframes pulseRing { 0%,100%{transform:scale(1);opacity:.6} 50%{transform:scale(1.6);opacity:0} }
    @keyframes slideUp { from{transform:translateY(100%)} to{transform:translateY(0)} }
    @keyframes spin { to{transform:rotate(360deg)} }
    @keyframes scanLine { 0%{top:0%} 100%{top:100%} }
    @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }
    @keyframes glow { 0%,100%{box-shadow:0 0 20px rgba(0,230,118,0.4)} 50%{box-shadow:0 0 40px rgba(0,230,118,0.8)} }
    .fade-up { animation:fadeUp 0.4s ease forwards; }
    .fade-in { animation:fadeIn 0.3s ease forwards; }
    .slide-up { animation:slideUp 0.35s cubic-bezier(0.4,0,0.2,1) forwards; }
    .pulse-anim { animation:pulse 2s infinite; }
    .glow-anim { animation:glow 2s infinite; }
  `}</style>
);

// ═══════════════════════════════════════════════════════════════════════════════
// DATA
// ═══════════════════════════════════════════════════════════════════════════════

const TOILETS = [
  { id:1, name:"Sitabuldi Market Public Toilet", area:"Sitabuldi", grade:"A", score:94, rating:4.5, reviews:128, distance:0.3, status:"Open", water:true, soap:true, handDryer:true, wheelchair:false, lastCleaned:"10 min ago", x:50, y:45, lat:21.146, lng:79.088, staffId:"EMP001", displayCode:"NMC-STB-001", issues:[], queue:2 },
  { id:2, name:"Itwari Station Facility", area:"Itwari", grade:"C", score:62, rating:3.1, reviews:74, distance:0.7, status:"Open", water:true, soap:false, handDryer:false, wheelchair:false, lastCleaned:"3 hrs ago", x:33, y:38, lat:21.151, lng:79.075, staffId:"EMP002", displayCode:"NMC-ITW-002", issues:["Wet floor","No soap"], queue:0, alert:true },
  { id:3, name:"Sadar Market Toilet Block", area:"Sadar", grade:"A", score:91, rating:4.3, reviews:96, distance:1.1, status:"Open", water:true, soap:true, handDryer:false, wheelchair:true, lastCleaned:"25 min ago", x:44, y:56, lat:21.138, lng:79.082, staffId:"EMP001", displayCode:"NMC-SAD-003", issues:[], queue:1 },
  { id:4, name:"Dharampeth Community Toilet", area:"Dharampeth", grade:"B", score:78, rating:3.8, reviews:42, distance:1.4, status:"Open", water:true, soap:true, handDryer:false, wheelchair:false, lastCleaned:"1 hr ago", x:26, y:62, lat:21.131, lng:79.062, staffId:"EMP003", displayCode:"NMC-DHP-004", issues:["Minor litter"], queue:0 },
  { id:5, name:"Gandhibagh Public WC", area:"Gandhibagh", grade:"A", score:88, rating:4.1, reviews:61, distance:0.9, status:"Open", water:true, soap:true, handDryer:true, wheelchair:true, lastCleaned:"45 min ago", x:67, y:48, lat:21.143, lng:79.101, staffId:"EMP004", displayCode:"NMC-GDB-005", issues:[], queue:3 },
  { id:6, name:"Lakadganj Facility", area:"Lakadganj", grade:"B", score:81, rating:3.9, reviews:33, distance:1.6, status:"Maintenance", water:false, soap:false, handDryer:false, wheelchair:false, lastCleaned:"6 hrs ago", x:61, y:30, lat:21.158, lng:79.095, staffId:"EMP002", displayCode:"NMC-LKD-006", issues:["Under maintenance"], queue:0 },
  { id:7, name:"Nandanvan Park Toilet", area:"Nandanvan", grade:"D", score:34, rating:1.8, reviews:19, distance:1.9, status:"Open", water:false, soap:false, handDryer:false, wheelchair:false, lastCleaned:"12 hrs ago", x:64, y:72, lat:21.122, lng:79.098, staffId:"EMP003", displayCode:"NMC-NDV-007", issues:["Overflow","No water","Heavy litter"], queue:0, alert:true },
  { id:8, name:"Cotton Market WC", area:"Cotton Market", grade:"B", score:74, rating:3.6, reviews:51, distance:1.2, status:"Open", water:true, soap:false, handDryer:false, wheelchair:false, lastCleaned:"2 hrs ago", x:47, y:22, lat:21.165, lng:79.082, staffId:"EMP004", displayCode:"NMC-CTN-008", issues:["Low soap"], queue:1 },
];

const EMPLOYEES = [
  { id:"EMP001", name:"Suresh Wankhede", zone:"Sitabuldi / Sadar", phone:"9823100001", email:"suresh@nmc.gov.in", password:"emp001", lastUpload:"Today 9:14 AM", compliant:true, uploads:22, assignedToilets:[1,3] },
  { id:"EMP002", name:"Meena Thakre", zone:"Itwari / Lakadganj", phone:"9823100002", email:"meena@nmc.gov.in", password:"emp002", lastUpload:"Yesterday 5:30 PM", compliant:false, uploads:18, assignedToilets:[2,6] },
  { id:"EMP003", name:"Dilip Rao", zone:"Dharampeth / Nandanvan", phone:"9823100003", email:"dilip@nmc.gov.in", password:"emp003", lastUpload:"2 days ago", compliant:false, uploads:11, assignedToilets:[4,7] },
  { id:"EMP004", name:"Kavita Borkar", zone:"Gandhibagh / Cotton Mkt", phone:"9823100004", email:"kavita@nmc.gov.in", password:"emp004", lastUpload:"Today 10:02 AM", compliant:true, uploads:25, assignedToilets:[5,8] },
];

const ADMINS = [
  { id:"ADM001", name:"Rajesh Shukla", email:"admin@nmc.gov.in", password:"admin123", role:"admin", designation:"Sanitation Officer" },
  { id:"ADM002", name:"Priya Deshmukh", email:"priya@nmc.gov.in", password:"admin456", role:"admin", designation:"Senior Inspector" },
];

const PENDING_UPLOADS = [
  { id:"UPL001", toiletId:1, toiletName:"Sitabuldi Market Public Toilet", staffName:"Suresh Wankhede", uploadedAt:"Today 9:14 AM", aiScore:94, aiGrade:"A", issues:[], status:"pending", photos:3 },
  { id:"UPL002", toiletId:2, toiletName:"Itwari Station Facility", staffName:"Meena Thakre", uploadedAt:"Today 8:45 AM", aiScore:62, aiGrade:"C", issues:["Wet floor detected","No soap visible"], status:"pending", photos:2, urgent:true },
  { id:"UPL003", toiletId:7, toiletName:"Nandanvan Park Toilet", staffName:"Dilip Rao", uploadedAt:"Today 7:30 AM", aiScore:34, aiGrade:"D", issues:["Overflow detected","No water","Heavy litter","Broken door"], status:"pending", photos:4, urgent:true },
  { id:"UPL004", toiletId:8, toiletName:"Cotton Market WC", staffName:"Kavita Borkar", uploadedAt:"Today 10:02 AM", aiScore:74, aiGrade:"B", issues:["Low soap dispenser"], status:"pending", photos:2 },
];

const ALERTS = [
  { id:"ALT001", type:"critical", toilet:"Nandanvan Park Toilet", issue:"AI detected overflow + Grade D hygiene", time:"7:30 AM", resolved:false },
  { id:"ALT002", type:"critical", toilet:"Itwari Station Facility", issue:"Score dropped — wet floor & no soap detected", time:"8:45 AM", resolved:false },
  { id:"ALT003", type:"warning", toilet:"Lakadganj Facility", issue:"Staff Meena Thakre has not uploaded in 2 days", time:"Yesterday", resolved:false },
  { id:"ALT004", type:"warning", toilet:"Dharampeth Community Toilet", issue:"Staff Dilip Rao overdue — 2 days", time:"2 days ago", resolved:false },
];

const YOLO_ISSUES = [
  { class:"Heavy Dirt/Stains", deduction:25, icon:"🟤" },
  { class:"Broken Fixtures", deduction:20, icon:"🔧" },
  { class:"Waste/Litter", deduction:20, icon:"🗑️" },
  { class:"No Hygiene Items", deduction:10, icon:"🧴" },
  { class:"Poor Lighting", deduction:10, icon:"💡" },
  { class:"Water Puddles", deduction:15, icon:"💧" },
];

// ═══════════════════════════════════════════════════════════════════════════════
// SHARED HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

const GRADE_COL  = { A:"#16a34a", B:"#ca8a04", C:"#ea580c", D:"#dc2626" };
const GRADE_BG   = { A:"#dcfce7", B:"#fef9c3", C:"#ffedd5", D:"#fee2e2" };
const GRADE_BD   = { A:"#86efac", B:"#fde68a", C:"#fdba74", D:"#fca5a5" };
const GRADE_LBL  = { A:"Excellent", B:"Good", C:"Average", D:"Poor" };

// Dark theme colors (v2 style)
const DARK_GRADE = { A:"#00e676", B:"#ffeb3b", C:"#ff9800", D:"#f44336" };
const DARK_BG    = { A:"rgba(0,230,118,0.12)", B:"rgba(255,235,59,0.12)", C:"rgba(255,152,0,0.12)", D:"rgba(244,67,54,0.12)" };

const GradeBadge = ({ grade, score, size="md", dark=false }) => {
  if (!grade) return null;
  const sizes = { sm:"text-xs px-2 py-0.5 font-semibold", md:"text-sm px-2.5 py-1 font-bold", lg:"text-base px-3.5 py-1.5 font-bold" };
  const col = dark ? DARK_GRADE[grade] : GRADE_COL[grade];
  const bg  = dark ? DARK_BG[grade]   : GRADE_BG[grade];
  const bd  = dark ? `${col}40`        : GRADE_BD[grade];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full ${sizes[size]}`} style={{ color:col, background:bg, border:`1.5px solid ${bd}` }}>
      {grade}{score!==undefined && <span style={{ opacity:.7, fontSize:"0.75em" }}>·{score}</span>}
    </span>
  );
};

const StarRating = ({ rating, size=14 }) => {
  const full = Math.floor(rating), half = rating % 1 >= 0.5;
  return (
    <span className="inline-flex items-center gap-0.5">
      {[1,2,3,4,5].map(i => (
        <svg key={i} width={size} height={size} viewBox="0 0 20 20" fill={i<=full ? "#f59e0b" : (i===full+1&&half) ? "url(#half)" : "#e2e8f0"}>
          <defs><linearGradient id="half"><stop offset="50%" stopColor="#f59e0b"/><stop offset="50%" stopColor="#e2e8f0"/></linearGradient></defs>
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
        </svg>
      ))}
    </span>
  );
};

const ScoreRing = ({ score, size=64 }) => {
  const r = (size-10)/2, circ = 2*Math.PI*r;
  const col = score>=90?"#16a34a":score>=75?"#ca8a04":score>=60?"#ea580c":"#dc2626";
  const offset = circ-(score/100)*circ;
  return (
    <div className="relative flex items-center justify-center" style={{ width:size, height:size }}>
      <svg width={size} height={size} style={{ transform:"rotate(-90deg)", position:"absolute" }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#f1f5f9" strokeWidth="7"/>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={col} strokeWidth="7" strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset} style={{ transition:"stroke-dashoffset 1s ease" }}/>
      </svg>
      <div style={{ textAlign:"center", position:"relative" }}>
        <div className="font-black" style={{ fontSize:size*0.22, lineHeight:1, color:col }}>{score}</div>
        <div style={{ fontSize:size*0.12, color:"#94a3b8", lineHeight:1 }}>/100</div>
      </div>
    </div>
  );
};

function Toast({ msg, visible }) {
  return (
    <div className="fixed bottom-8 left-1/2 z-[9999] pointer-events-none transition-all duration-500"
      style={{ transform:`translateX(-50%) translateY(${visible?0:24}px)`, opacity:visible?1:0 }}>
      <div className="px-6 py-3 rounded-2xl text-sm font-bold text-black shadow-2xl"
        style={{ background:"#00e676", boxShadow:"0 0 40px rgba(0,230,118,0.5)", fontFamily:"monospace" }}>
        {msg}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ANDROID LOGIN SCREEN (dark v2 style)
// ═══════════════════════════════════════════════════════════════════════════════

function AndroidLogin({ onLogin }) {
  const [mode, setMode] = useState("public");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const roles = [
    { key:"public",   label:"Public",    icon:"🌏", desc:"Browse & find toilets" },
    { key:"employee", label:"Employee",  icon:"🧹", desc:"Upload daily photos" },
    { key:"admin",    label:"Admin",     icon:"🛡️", desc:"Government access" },
  ];

  const hints = {
    employee:"suresh@nmc.gov.in / emp001",
    admin:"admin@nmc.gov.in / admin123",
  };

  const doLogin = async () => {
    if (mode==="public") { onLogin({ role:"public", name:"Citizen" }); return; }
    setLoading(true); setError("");
    await new Promise(r => setTimeout(r, 900));
    if (mode==="employee") {
      const emp = EMPLOYEES.find(e => e.email===email && e.password===password);
      if (emp) { onLogin({ ...emp, role:"employee" }); return; }
    } else {
      const adm = ADMINS.find(a => a.email===email && a.password===password);
      if (adm) { onLogin({ ...adm, role:"admin" }); return; }
    }
    setError("Invalid credentials. Please try again.");
    setLoading(false);
  };

  return (
    <div className="min-h-full flex flex-col relative overflow-hidden"
      style={{ background:"#030912", fontFamily:"'JetBrains Mono',monospace" }}>
      {/* Grid bg */}
      <div className="absolute inset-0 opacity-[0.15]">
        <svg width="100%" height="100%">
          <defs><pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M40 0L0 0 0 40" fill="none" stroke="#1e40af" strokeWidth="0.5"/>
          </pattern></defs>
          <rect width="100%" height="100%" fill="url(#grid)"/>
        </svg>
      </div>
      <div className="absolute" style={{ top:"20%", left:"50%", transform:"translateX(-50%)", width:260, height:260, borderRadius:"50%", background:"radial-gradient(circle,#0077b6,transparent)", opacity:0.08 }}/>

      <div className="relative z-10 flex flex-col flex-1 px-5 pt-10 pb-6">
        {/* Logo */}
        <div className="text-center mb-8">
          <div style={{ fontSize:44 }}>🚻</div>
          <div className="font-black text-white text-2xl mt-2">SmartToilet</div>
          <div style={{ color:"#00b4d8", fontSize:10, letterSpacing:"0.15em", marginTop:4 }}>NAGPUR MUNICIPAL CORPORATION</div>
          <div style={{ color:"#4b5563", fontSize:10, marginTop:2 }}>Swachh Bharat Digital Initiative</div>
        </div>

        {/* Role Tabs */}
        <div style={{ marginBottom:20 }}>
          <div style={{ color:"#6b7280", fontSize:10, marginBottom:8, letterSpacing:"0.1em" }}>SELECT ACCESS ROLE</div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8 }}>
            {roles.map(r => (
              <button key={r.key} onClick={() => { setMode(r.key); setError(""); setEmail(""); setPassword(""); }}
                style={{ display:"flex", flexDirection:"column", alignItems:"center", padding:"10px 6px", borderRadius:12, cursor:"pointer",
                  background: mode===r.key ? "rgba(0,180,216,0.15)" : "rgba(255,255,255,0.03)",
                  border: mode===r.key ? "1px solid #00b4d8" : "1px solid rgba(255,255,255,0.07)" }}>
                <span style={{ fontSize:20, marginBottom:4 }}>{r.icon}</span>
                <span style={{ fontSize:10, fontWeight:700, color: mode===r.key ? "#00b4d8" : "#9ca3af" }}>{r.label}</span>
                <span style={{ fontSize:8, color:"#4b5563", marginTop:2, textAlign:"center", lineHeight:1.3 }}>{r.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Form */}
        <div style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:16, padding:16 }}>
          {mode==="public" ? (
            <button onClick={doLogin} style={{ width:"100%", padding:"14px 0", borderRadius:12, border:"none", cursor:"pointer", background:"linear-gradient(135deg,#0077b6,#00b4d8)", color:"#fff", fontWeight:700, fontSize:14, display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
              🌏 Enter as Public User
            </button>
          ) : (
            <>
              <div style={{ marginBottom:12 }}>
                <div style={{ color:"#6b7280", fontSize:9, letterSpacing:"0.1em", marginBottom:6 }}>OFFICIAL EMAIL</div>
                <input value={email} onChange={e=>setEmail(e.target.value)}
                  style={{ width:"100%", padding:"10px 12px", borderRadius:10, background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)", color:"#fff", fontSize:13, outline:"none" }}
                  placeholder={mode==="admin"?"admin@nmc.gov.in":"employee@nmc.gov.in"}/>
              </div>
              <div style={{ marginBottom:12 }}>
                <div style={{ color:"#6b7280", fontSize:9, letterSpacing:"0.1em", marginBottom:6 }}>PASSWORD</div>
                <div style={{ position:"relative" }}>
                  <input value={password} onChange={e=>setPassword(e.target.value)} type={showPass?"text":"password"}
                    onKeyDown={e=>e.key==="Enter"&&doLogin()}
                    style={{ width:"100%", padding:"10px 40px 10px 12px", borderRadius:10, background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)", color:"#fff", fontSize:13, outline:"none" }}
                    placeholder="••••••••"/>
                  <button onClick={()=>setShowPass(!showPass)} style={{ position:"absolute", right:10, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", fontSize:14 }}>
                    {showPass?"🙈":"👁️"}
                  </button>
                </div>
              </div>
              {hints[mode] && (
                <div style={{ marginBottom:10, padding:"8px 10px", borderRadius:8, background:"rgba(0,180,216,0.08)", border:"1px solid rgba(0,180,216,0.2)", color:"#00b4d8", fontSize:10 }}>
                  💡 Demo: {hints[mode]}
                </div>
              )}
              {error && (
                <div style={{ marginBottom:10, padding:"8px 10px", borderRadius:8, background:"rgba(244,67,54,0.1)", border:"1px solid rgba(244,67,54,0.3)", color:"#f44336", fontSize:10 }}>
                  ⚠️ {error}
                </div>
              )}
              <button onClick={doLogin} disabled={loading}
                style={{ width:"100%", padding:"14px 0", borderRadius:12, border:"none", cursor:"pointer", background: loading?"rgba(255,255,255,0.1)":"linear-gradient(135deg,#0077b6,#00b4d8)", color: loading?"#6b7280":"#fff", fontWeight:700, fontSize:14, display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
                {loading ? <>⏳ Authenticating...</> : `${mode==="admin"?"🛡️":"🧹"} Sign In`}
              </button>
            </>
          )}
        </div>

        <div style={{ textAlign:"center", marginTop:16, color:"#374151", fontSize:10 }}>
          🔒 Secure · NMC Official System · v4.0
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ANDROID PUBLIC MAP (dark v2 style)
// ═══════════════════════════════════════════════════════════════════════════════

function DarkMapBg({ toilets, selected, onPin }) {
  return (
    <div className="absolute inset-0" style={{ background:"#0a0f1a" }}>
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        <rect width="100" height="100" fill="#0c1420"/>
        <path d="M8 40 Q20 35 28 42 Q38 50 50 48 Q62 46 72 52 Q82 58 90 55" fill="none" stroke="#0d2d3d" strokeWidth="3" opacity="0.8"/>
        <rect x="15" y="55" width="12" height="10" rx="2" fill="#0d2010" opacity="0.6"/>
        <rect x="60" y="64" width="14" height="12" rx="2" fill="#0d2010" opacity="0.5"/>
        {[[0,50,100,50],[50,0,50,100],[0,25,100,35],[0,75,100,68],[20,0,28,100],[72,0,76,100]].map(([x1,y1,x2,y2],i) => (
          <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#1a2535" strokeWidth={i<2?"1.8":"1.1"}/>
        ))}
        {[["SITABULDI",50,43],["SADAR",44,53],["GANDHIBAGH",67,45],["ITWARI",33,36],["DHARAMPETH",26,59],["LAKADGANJ",61,27],["NANDANVAN",64,70],["COTTON MKT",47,20]].map(([t,x,y]) => (
          <text key={t} x={x} y={y} textAnchor="middle" fill="#2a3a50" fontSize="2.1" fontFamily="monospace" fontWeight="700">{t}</text>
        ))}
        <rect x="46" y="46" width="8" height="8" rx="1" fill="#1e3a5f" opacity="0.8"/>
        <text x="50" y="52.5" textAnchor="middle" fill="#3b82f6" fontSize="1.6" fontFamily="monospace">★NMC</text>
      </svg>
      {/* User location */}
      <div className="absolute" style={{ left:"50%", top:"50%", transform:"translate(-50%,-50%)", zIndex:5 }}>
        <div className="absolute rounded-full" style={{ width:32, height:32, top:-16, left:-16, background:"rgba(0,180,216,0.2)", animation:"pulseRing 2s infinite" }}/>
        <div style={{ width:14, height:14, borderRadius:"50%", background:"#00b4d8", border:"2px solid #fff", boxShadow:"0 0 12px rgba(0,180,216,0.8)" }}/>
      </div>
      {/* Pins */}
      {toilets.map(t => {
        const col = DARK_GRADE[t.grade];
        const isSel = selected?.id===t.id;
        return (
          <div key={t.id} onClick={()=>onPin(t)} className="absolute cursor-pointer"
            style={{ left:`${t.x}%`, top:`${t.y}%`, transform:"translate(-50%,-100%)", zIndex:isSel?20:10 }}>
            <div style={{ display:"flex", flexDirection:"column", alignItems:"center", filter: isSel?`drop-shadow(0 0 10px ${col})`:"drop-shadow(0 2px 6px rgba(0,0,0,0.5))", transform: isSel?"scale(1.25)":"scale(1)", transition:"all 0.2s" }}>
              <div style={{ width:28, height:28, borderRadius:"50%", background:col, display:"flex", alignItems:"center", justifyContent:"center", fontWeight:900, fontSize:12, color:"#000", border:"2px solid rgba(255,255,255,0.3)" }}>{t.grade}</div>
              <div style={{ width:0, height:0, borderLeft:"5px solid transparent", borderRight:"5px solid transparent", borderTop:`7px solid ${col}`, marginTop:-1 }}/>
            </div>
            {t.alert && <div style={{ position:"absolute", top:-2, right:-2, width:12, height:12, borderRadius:"50%", background:"#f44336", border:"2px solid #000", display:"flex", alignItems:"center", justifyContent:"center", fontSize:7, color:"#fff", fontWeight:900 }}>!</div>}
          </div>
        );
      })}
    </div>
  );
}

function AndroidPublicMap({ user, onLogout }) {
  const [selected, setSelected] = useState(null);
  const [panel, setPanel] = useState(null);
  const [searchQ, setSearchQ] = useState("");
  const [filterGrade, setFilterGrade] = useState("all");
  const [toast, setToast] = useState({ v:false, m:"" });

  const showToast = m => { setToast({ v:true, m }); setTimeout(()=>setToast({ v:false, m:"" }), 3000); };
  const filtered = TOILETS.filter(t => filterGrade==="all"||t.grade===filterGrade).filter(t => t.name.toLowerCase().includes(searchQ.toLowerCase())||t.area.toLowerCase().includes(searchQ.toLowerCase()));

  return (
    <div className="relative w-full h-full overflow-hidden" style={{ fontFamily:"monospace" }}>
      <DarkMapBg toilets={TOILETS} selected={selected} onPin={t=>{ setSelected(prev=>prev?.id===t.id?null:t); setPanel(null); }}/>

      {/* Top bar */}
      <div className="absolute top-3 left-3 right-3 z-20 flex items-center justify-between">
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl" style={{ background:"rgba(4,8,18,0.95)", border:"1px solid rgba(255,255,255,0.1)", backdropFilter:"blur(14px)" }}>
          <span>🚻</span>
          <div>
            <div className="font-black text-white" style={{ fontSize:12 }}>SmartToilet</div>
            <div style={{ color:"#4b5563", fontSize:9 }}>{TOILETS.length} verified · Nagpur</div>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="px-2.5 py-1.5 rounded-xl" style={{ background:"rgba(4,8,18,0.9)", border:"1px solid rgba(255,255,255,0.08)", color:"#9ca3af", fontSize:10 }}>
            🌏 {user.name}
          </div>
          <button onClick={onLogout} style={{ padding:"6px 10px", borderRadius:10, background:"rgba(4,8,18,0.9)", border:"1px solid rgba(255,255,255,0.08)", color:"#6b7280", fontSize:10, cursor:"pointer" }}>Exit</button>
        </div>
      </div>

      {/* Grade filter pills */}
      <div className="absolute z-20" style={{ top:62, left:12, display:"flex", gap:6 }}>
        {["all","A","B","C","D"].map(g => (
          <button key={g} onClick={()=>setFilterGrade(g)} style={{ padding:"4px 10px", borderRadius:20, border:"none", cursor:"pointer", fontSize:10, fontWeight:700,
            background: filterGrade===g ? (g==="all"?"#00b4d8":DARK_GRADE[g]) : "rgba(4,8,18,0.85)",
            color: filterGrade===g ? "#000" : "#6b7280" }}>
            {g==="all"?"All":g}
          </button>
        ))}
      </div>

      {/* Selected popup */}
      {selected && !panel && (
        <div className="absolute z-30 rounded-2xl p-4" style={{ left:`${Math.min(selected.x+4,55)}%`, top:`${Math.max(selected.y-40,5)}%`, width:230, background:"rgba(4,8,18,0.97)", border:`1px solid ${DARK_GRADE[selected.grade]}40`, backdropFilter:"blur(14px)" }}>
          <button onClick={()=>setSelected(null)} style={{ position:"absolute", top:8, right:8, background:"none", border:"none", color:"#6b7280", cursor:"pointer", fontSize:16 }}>✕</button>
          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:10 }}>
            <span style={{ fontSize:20 }}>🚻</span>
            <div>
              <div style={{ color:"#fff", fontWeight:700, fontSize:11, lineHeight:1.3 }}>{selected.name}</div>
              <div style={{ color:"#6b7280", fontSize:9 }}>{selected.area}</div>
            </div>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
            <GradeBadge grade={selected.grade} score={selected.score} size="sm" dark/>
            <span style={{ color:DARK_GRADE[selected.grade], fontSize:10 }}>{GRADE_LBL[selected.grade]}</span>
          </div>
          <div style={{ width:"100%", height:4, borderRadius:2, background:"rgba(255,255,255,0.08)", marginBottom:8 }}>
            <div style={{ height:4, borderRadius:2, width:`${selected.score}%`, background:`linear-gradient(90deg,${DARK_GRADE[selected.grade]}66,${DARK_GRADE[selected.grade]})` }}/>
          </div>
          <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:8 }}>
            {selected.water && <span style={{ fontSize:9, padding:"2px 6px", borderRadius:20, background:"rgba(0,230,118,0.1)", color:"#00e676" }}>💧 Water</span>}
            {selected.soap  && <span style={{ fontSize:9, padding:"2px 6px", borderRadius:20, background:"rgba(0,230,118,0.1)", color:"#00e676" }}>🧼 Soap</span>}
            {selected.wheelchair && <span style={{ fontSize:9, padding:"2px 6px", borderRadius:20, background:"rgba(0,180,216,0.1)", color:"#00b4d8" }}>♿</span>}
          </div>
          <div style={{ display:"flex", justifyContent:"space-between", color:"#6b7280", fontSize:9 }}>
            <span>⭐ {selected.rating} ({selected.reviews})</span>
            <span style={{ color: selected.status==="Open"?"#00e676":"#ff9800" }}>{selected.status==="Open"?"🟢 Open":"🟡 "+selected.status}</span>
          </div>
          {selected.issues?.length > 0 && (
            <div style={{ marginTop:8, padding:"6px 8px", borderRadius:8, background:"rgba(244,67,54,0.1)", border:"1px solid rgba(244,67,54,0.2)" }}>
              {selected.issues.map((iss,i) => <div key={i} style={{ color:"#f87171", fontSize:9 }}>⚠️ {iss}</div>)}
            </div>
          )}
          <div style={{ marginTop:8, fontSize:9, color:"#4b5563" }}>Code: <span style={{ color:"#00b4d8" }} className="mono">{selected.displayCode}</span></div>
        </div>
      )}

      {/* Bottom search bar */}
      {!panel && (
        <div className="absolute bottom-5 left-3 right-3 z-20">
          <button onClick={()=>setPanel("search")} className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl font-bold text-white"
            style={{ background:"linear-gradient(135deg,#0077b6,#00b4d8)", boxShadow:"0 4px 20px rgba(0,180,216,0.4)", fontSize:14 }}>
            🔍 Search Nearby Toilets
          </button>
        </div>
      )}

      {/* Search Panel */}
      {panel==="search" && (
        <div className="absolute left-0 bottom-0 right-0 z-40 rounded-t-3xl overflow-hidden"
          style={{ maxHeight:"70%", background:"rgba(4,8,18,0.98)", border:"1px solid rgba(255,255,255,0.1)", backdropFilter:"blur(16px)" }}>
          <div style={{ padding:"16px 16px 12px" }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12 }}>
              <div style={{ color:"#fff", fontWeight:700, fontSize:13 }}>🔍 Find a Toilet</div>
              <button onClick={()=>setPanel(null)} style={{ width:28, height:28, borderRadius:"50%", background:"rgba(255,255,255,0.08)", border:"none", color:"#9ca3af", cursor:"pointer", fontSize:14 }}>✕</button>
            </div>
            <input value={searchQ} onChange={e=>setSearchQ(e.target.value)} placeholder="Name or area..."
              style={{ width:"100%", padding:"10px 12px", borderRadius:10, background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.1)", color:"#fff", fontSize:13, outline:"none", marginBottom:10 }}/>
            <div style={{ display:"flex", gap:6 }}>
              {["all","A","B","C","D"].map(g => (
                <button key={g} onClick={()=>setFilterGrade(g)} style={{ padding:"5px 10px", borderRadius:20, border:"none", cursor:"pointer", fontSize:10, fontWeight:700,
                  background: filterGrade===g ? (g==="all"?"#00b4d8":DARK_GRADE[g]) : "rgba(255,255,255,0.05)",
                  color: filterGrade===g ? "#000" : "#6b7280" }}>
                  {g==="all"?"All":g}
                </button>
              ))}
            </div>
          </div>
          <div style={{ overflowY:"auto", maxHeight:280, padding:"0 12px 16px" }} className="scrollbar-hide">
            {filtered.map(t => (
              <div key={t.id} onClick={()=>{ setSelected(t); setPanel(null); }} style={{ padding:"12px", borderRadius:14, marginBottom:8, cursor:"pointer",
                background:"rgba(255,255,255,0.03)", border:`1px solid ${selected?.id===t.id?"#00b4d8":"rgba(255,255,255,0.07)"}` }}>
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:4 }}>
                  <div style={{ color:"#fff", fontWeight:600, fontSize:12, flex:1, paddingRight:8 }}>{t.name}</div>
                  <GradeBadge grade={t.grade} score={t.score} size="sm" dark/>
                </div>
                <div style={{ display:"flex", justifyContent:"space-between", color:"#6b7280", fontSize:10 }}>
                  <span>📍 {t.area} · {t.distance}km</span>
                  <span style={{ color: t.status==="Open"?"#00e676":"#ff9800" }}>{t.status}</span>
                </div>
              </div>
            ))}
            {filtered.length===0 && <div style={{ textAlign:"center", color:"#4b5563", fontSize:12, padding:20 }}>No results found</div>}
          </div>
        </div>
      )}

      <Toast msg={toast.m} visible={toast.v}/>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ANDROID EMPLOYEE PORTAL (dark style)
// ═══════════════════════════════════════════════════════════════════════════════

function AndroidEmployeePortal({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState("upload");
  const [uploadStep, setUploadStep] = useState("idle");
  const [uploadFiles, setUploadFiles] = useState([]);
  const [selectedToiletId, setSelectedToiletId] = useState(null);
  const [aiResult, setAiResult] = useState(null);
  const [toast, setToast] = useState({ v:false, m:"" });
  const fileRef = useRef();

  const myToilets = TOILETS.filter(t => user.assignedToilets?.includes(t.id));
  const showToast = m => { setToast({ v:true, m }); setTimeout(()=>setToast({ v:false, m:"" }), 3000); };

  const handleFiles = fs => {
    setUploadFiles(Array.from(fs).slice(0,5).map(f => ({ file:f, url:URL.createObjectURL(f), name:f.name })));
    setUploadStep("preview");
  };

  const runAI = async () => {
    setUploadStep("analyzing");
    await new Promise(r => setTimeout(r, 2800));
    const issues = [...YOLO_ISSUES].sort(()=>Math.random()-0.5).slice(0, Math.floor(Math.random()*3)+1);
    const score = Math.max(0, 100 - issues.reduce((s,i)=>s+i.deduction, 0));
    const grade = score>=90?"A":score>=75?"B":score>=60?"C":"D";
    setAiResult({ score, grade, issues });
    setUploadStep("result");
  };

  const submitReport = () => {
    setUploadStep("done");
    showToast("📤 Photos submitted — pending admin review");
    setTimeout(()=>{ setUploadStep("idle"); setUploadFiles([]); setAiResult(null); setSelectedToiletId(null); }, 2500);
  };

  const bgStyle = { background:"rgba(4,8,18,0.95)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:14 };

  return (
    <div className="flex flex-col h-full" style={{ background:"#030912", fontFamily:"monospace", color:"#fff" }}>
      {/* Header */}
      <div style={{ padding:"12px 14px 10px", background:"rgba(0,0,0,0.6)", borderBottom:"1px solid rgba(255,255,255,0.07)" }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div>
            <div style={{ fontWeight:900, fontSize:14, color:"#00e676" }}>🧹 Staff Portal</div>
            <div style={{ color:"#4b5563", fontSize:9 }}>{user.name} · {user.zone}</div>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <div style={{ fontSize:9, padding:"4px 8px", borderRadius:8, background: user.compliant?"rgba(0,230,118,0.1)":"rgba(255,152,0,0.1)", color: user.compliant?"#00e676":"#ff9800", border:`1px solid ${user.compliant?"rgba(0,230,118,0.3)":"rgba(255,152,0,0.3)"}` }}>
              {user.compliant ? "✅ Compliant" : "⚠️ Overdue"}
            </div>
            <button onClick={onLogout} style={{ padding:"4px 8px", borderRadius:8, background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.1)", color:"#6b7280", fontSize:10, cursor:"pointer" }}>Exit</button>
          </div>
        </div>
        {/* Tabs */}
        <div style={{ display:"flex", gap:6, marginTop:10 }}>
          {[["upload","📸 Upload"],["toilets","🚻 My Toilets"],["history","📋 History"]].map(([key,label]) => (
            <button key={key} onClick={()=>setActiveTab(key)} style={{ flex:1, padding:"6px 0", borderRadius:8, border:"none", cursor:"pointer", fontSize:10, fontWeight:700,
              background: activeTab===key ? "rgba(0,230,118,0.2)" : "rgba(255,255,255,0.04)",
              color: activeTab===key ? "#00e676" : "#6b7280",
              borderBottom: activeTab===key ? "2px solid #00e676" : "2px solid transparent" }}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{ flex:1, overflowY:"auto", padding:"12px 12px 80px" }} className="scrollbar-hide">

        {/* UPLOAD TAB */}
        {activeTab==="upload" && (
          <>
            <div style={{ marginBottom:10, fontSize:11, color:"#9ca3af" }}>Daily Photo Upload · AI Analysis</div>

            {/* Select toilet */}
            {uploadStep==="idle" && (
              <>
                <div style={{ marginBottom:12 }}>
                  <div style={{ color:"#6b7280", fontSize:10, marginBottom:6 }}>SELECT ASSIGNED TOILET</div>
                  {myToilets.map(t => (
                    <div key={t.id} onClick={()=>setSelectedToiletId(t.id)} style={{ ...bgStyle, padding:"10px 12px", marginBottom:6, cursor:"pointer",
                      border: selectedToiletId===t.id ? "1px solid #00b4d8" : "1px solid rgba(255,255,255,0.08)" }}>
                      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                        <div>
                          <div style={{ fontWeight:700, fontSize:12 }}>{t.name}</div>
                          <div style={{ color:"#6b7280", fontSize:9, marginTop:2 }}>Code: <span style={{ color:"#00b4d8" }}>{t.displayCode}</span></div>
                        </div>
                        <GradeBadge grade={t.grade} score={t.score} size="sm" dark/>
                      </div>
                    </div>
                  ))}
                </div>
                {selectedToiletId && (
                  <>
                    <input type="file" ref={fileRef} multiple accept="image/*" style={{ display:"none" }} onChange={e=>handleFiles(e.target.files)}/>
                    <button onClick={()=>fileRef.current.click()}
                      style={{ width:"100%", padding:"30px 0", borderRadius:14, border:"2px dashed rgba(0,180,216,0.4)", background:"rgba(0,180,216,0.05)", color:"#00b4d8", fontSize:13, fontWeight:700, cursor:"pointer", textAlign:"center" }}>
                      <div style={{ fontSize:32, marginBottom:6 }}>📸</div>
                      Tap to upload toilet photos<br/>
                      <span style={{ fontSize:10, color:"#4b5563" }}>Up to 5 photos · JPG, PNG</span>
                    </button>
                  </>
                )}
              </>
            )}

            {/* Preview */}
            {uploadStep==="preview" && (
              <>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:6, marginBottom:12 }}>
                  {uploadFiles.map((f,i) => (
                    <div key={i} style={{ aspectRatio:"4/3", borderRadius:10, overflow:"hidden", background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.08)", display:"flex", alignItems:"center", justifyContent:"center", position:"relative" }}>
                      <img src={f.url} alt="" style={{ width:"100%", height:"100%", objectFit:"cover" }} onError={e=>{ e.target.style.display="none"; }}/>
                      <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center", background:"rgba(0,0,0,0.4)" }}>
                        <div style={{ textAlign:"center" }}>
                          <div style={{ fontSize:28 }}>🖼️</div>
                          <div style={{ fontSize:9, color:"#9ca3af", marginTop:2 }}>Photo {i+1}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{ display:"flex", gap:8 }}>
                  <button onClick={()=>{ setUploadStep("idle"); setUploadFiles([]); }} style={{ flex:1, padding:"12px 0", borderRadius:12, border:"1px solid rgba(255,255,255,0.15)", background:"rgba(255,255,255,0.04)", color:"#9ca3af", fontSize:12, cursor:"pointer" }}>
                    🗑️ Clear
                  </button>
                  <button onClick={runAI} style={{ flex:2, padding:"12px 0", borderRadius:12, border:"none", background:"linear-gradient(135deg,#0077b6,#00b4d8)", color:"#fff", fontSize:12, fontWeight:700, cursor:"pointer" }}>
                    🤖 Run AI Analysis
                  </button>
                </div>
              </>
            )}

            {/* Analyzing */}
            {uploadStep==="analyzing" && (
              <div style={{ textAlign:"center", padding:"40px 0" }}>
                <div style={{ fontSize:48, marginBottom:12 }}>🤖</div>
                <div style={{ color:"#00b4d8", fontWeight:700, marginBottom:8 }}>AI Analyzing Photos...</div>
                <div style={{ color:"#4b5563", fontSize:11 }}>YOLO v8 Object Detection</div>
                <div style={{ margin:"16px auto", width:160, height:4, borderRadius:2, background:"rgba(255,255,255,0.08)", overflow:"hidden" }}>
                  <div style={{ width:"70%", height:"100%", background:"linear-gradient(90deg,#0077b6,#00b4d8)", animation:"pulse 0.8s infinite alternate", borderRadius:2 }}/>
                </div>
                {YOLO_ISSUES.slice(0,3).map(iss => (
                  <div key={iss.class} style={{ color:"#4b5563", fontSize:10, marginBottom:3 }}>{iss.icon} Scanning for {iss.class}...</div>
                ))}
              </div>
            )}

            {/* AI Result */}
            {uploadStep==="result" && aiResult && (
              <>
                <div style={{ ...bgStyle, padding:14, marginBottom:12 }}>
                  <div style={{ color:"#9ca3af", fontSize:10, marginBottom:8 }}>🤖 AI ANALYSIS RESULT</div>
                  <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:10 }}>
                    <div style={{ textAlign:"center" }}>
                      <div style={{ fontWeight:900, fontSize:52, lineHeight:1, color:DARK_GRADE[aiResult.grade] }}>{aiResult.grade}</div>
                      <div style={{ fontSize:10, color:DARK_GRADE[aiResult.grade] }}>{GRADE_LBL[aiResult.grade]}</div>
                    </div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontWeight:900, fontSize:32, color:"#fff" }}>{aiResult.score}<span style={{ fontSize:14, color:"#4b5563" }}>/100</span></div>
                      <div style={{ color:"#6b7280", fontSize:10, marginBottom:6 }}>Hygiene Score</div>
                      <div style={{ height:6, borderRadius:3, background:"rgba(255,255,255,0.08)" }}>
                        <div style={{ height:6, borderRadius:3, width:`${aiResult.score}%`, background:`linear-gradient(90deg,${DARK_GRADE[aiResult.grade]}66,${DARK_GRADE[aiResult.grade]})` }}/>
                      </div>
                    </div>
                  </div>
                  <div style={{ color:"#6b7280", fontSize:10, marginBottom:6 }}>DETECTED ISSUES:</div>
                  {aiResult.issues.map(iss => (
                    <div key={iss.class} style={{ display:"flex", justifyContent:"space-between", padding:"6px 8px", borderRadius:8, marginBottom:4, background:"rgba(244,67,54,0.08)", border:"1px solid rgba(244,67,54,0.15)" }}>
                      <span style={{ color:"#fca5a5", fontSize:11 }}>{iss.icon} {iss.class}</span>
                      <span style={{ color:"#f87171", fontSize:11 }}>-{iss.deduction} pts</span>
                    </div>
                  ))}
                  {aiResult.issues.length===0 && <div style={{ color:"#00e676", fontSize:11 }}>✅ No issues detected — excellent condition!</div>}
                </div>
                <button onClick={submitReport} style={{ width:"100%", padding:"14px 0", borderRadius:12, border:"none", background:"linear-gradient(135deg,#00e676,#00b4d8)", color:"#000", fontSize:13, fontWeight:900, cursor:"pointer" }}>
                  📤 Submit for Admin Review
                </button>
              </>
            )}

            {/* Done */}
            {uploadStep==="done" && (
              <div style={{ textAlign:"center", padding:"40px 0" }}>
                <div style={{ fontSize:56 }}>✅</div>
                <div style={{ color:"#00e676", fontWeight:700, marginTop:8, fontSize:14 }}>Submitted!</div>
                <div style={{ color:"#6b7280", fontSize:11, marginTop:4 }}>Admin will review & verify</div>
              </div>
            )}
          </>
        )}

        {/* MY TOILETS TAB */}
        {activeTab==="toilets" && myToilets.map(t => (
          <div key={t.id} style={{ ...bgStyle, padding:14, marginBottom:8 }}>
            <div style={{ display:"flex", alignItems:"start", justifyContent:"space-between", marginBottom:8 }}>
              <div style={{ flex:1, paddingRight:8 }}>
                <div style={{ fontWeight:700, fontSize:13 }}>{t.name}</div>
                <div style={{ color:"#4b5563", fontSize:10, marginTop:2 }}>{t.area} · Code: <span style={{ color:"#00b4d8" }}>{t.displayCode}</span></div>
              </div>
              <GradeBadge grade={t.grade} score={t.score} size="sm" dark/>
            </div>
            <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
              {t.water && <span style={{ fontSize:9, padding:"3px 8px", borderRadius:20, background:"rgba(0,230,118,0.1)", color:"#00e676" }}>💧 Water</span>}
              {t.soap  && <span style={{ fontSize:9, padding:"3px 8px", borderRadius:20, background:"rgba(0,230,118,0.1)", color:"#00e676" }}>🧼 Soap</span>}
              <span style={{ fontSize:9, padding:"3px 8px", borderRadius:20, background: t.status==="Open"?"rgba(0,230,118,0.1)":"rgba(255,152,0,0.1)", color: t.status==="Open"?"#00e676":"#ff9800" }}>{t.status}</span>
            </div>
            {t.issues?.length > 0 && (
              <div style={{ marginTop:8, fontSize:10, color:"#f87171" }}>⚠️ {t.issues.join(", ")}</div>
            )}
          </div>
        ))}

        {/* HISTORY TAB */}
        {activeTab==="history" && PENDING_UPLOADS.filter(u=>myToilets.some(t=>t.id===u.toiletId)).map(u => (
          <div key={u.id} style={{ ...bgStyle, padding:12, marginBottom:8 }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"start", marginBottom:6 }}>
              <div style={{ flex:1 }}>
                <div style={{ fontWeight:600, fontSize:12 }}>{u.toiletName}</div>
                <div style={{ color:"#6b7280", fontSize:10 }}>{u.uploadedAt} · {u.photos} photos</div>
              </div>
              <GradeBadge grade={u.aiGrade} score={u.aiScore} size="sm" dark/>
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:6 }}>
              <span style={{ fontSize:10, padding:"3px 8px", borderRadius:20, background:"rgba(0,180,216,0.1)", color:"#00b4d8" }}>⏳ Pending Review</span>
              {u.urgent && <span style={{ fontSize:10, padding:"3px 8px", borderRadius:20, background:"rgba(244,67,54,0.1)", color:"#f44336" }}>🚨 Urgent</span>}
            </div>
          </div>
        ))}
      </div>

      <Toast msg={toast.m} visible={toast.v}/>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ANDROID APP WRAPPER (routes login → role screens)
// ═══════════════════════════════════════════════════════════════════════════════

function AndroidApp() {
  const [currentUser, setCurrentUser] = useState(null);

  if (!currentUser) return <AndroidLogin onLogin={setCurrentUser}/>;
  if (currentUser.role==="employee") return <AndroidEmployeePortal user={currentUser} onLogout={()=>setCurrentUser(null)}/>;
  if (currentUser.role==="admin") {
    return (
      <div style={{ display:"flex", flexDirection:"column", height:"100%", background:"#030912", alignItems:"center", justifyContent:"center", padding:24 }}>
        <div style={{ fontSize:48 }}>🛡️</div>
        <div style={{ color:"#00e676", fontWeight:900, fontSize:16, marginTop:8 }}>Admin Portal</div>
        <div style={{ color:"#6b7280", fontSize:11, marginTop:4, textAlign:"center" }}>Admin panel is available on the web interface. Switch to "Web App" view above.</div>
        <button onClick={()=>setCurrentUser(null)} style={{ marginTop:16, padding:"10px 20px", borderRadius:12, background:"rgba(255,255,255,0.08)", border:"1px solid rgba(255,255,255,0.15)", color:"#9ca3af", fontSize:12, cursor:"pointer" }}>← Back to Login</button>
      </div>
    );
  }
  return <AndroidPublicMap user={currentUser} onLogout={()=>setCurrentUser(null)}/>;
}

// ═══════════════════════════════════════════════════════════════════════════════
// WEB MAP (light v3 style)
// ═══════════════════════════════════════════════════════════════════════════════

function LightMapView({ toilets, selected, onSelect }) {
  return (
    <div className="relative w-full h-full overflow-hidden" style={{ background:"#e8f0d8" }}>
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        <rect width="100" height="100" fill="#e8ede0"/>
        <rect x="15" y="55" width="12" height="10" rx="2" fill="#c8dba4" opacity="0.8"/>
        <rect x="60" y="64" width="14" height="12" rx="2" fill="#c8dba4" opacity="0.7"/>
        <path d="M8 40 Q20 35 28 42 Q38 50 50 48 Q62 46 72 52 Q82 58 90 55" fill="none" stroke="#a8d5e8" strokeWidth="3" opacity="0.7"/>
        {[[0,50,100,50],[50,0,50,100],[0,25,100,35],[0,75,100,68],[20,0,28,100],[72,0,76,100]].map(([x1,y1,x2,y2],i) => (
          <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#fff" strokeWidth={i<2?"2.2":"1.4"}/>
        ))}
        {[["SITABULDI",50,43],["SADAR",44,53],["GANDHIBAGH",67,45],["ITWARI",33,36],["DHARAMPETH",26,59],["LAKADGANJ",61,27],["NANDANVAN",64,70],["COTTON MKT",47,20]].map(([t,x,y]) => (
          <text key={t} x={x} y={y} textAnchor="middle" fill="#6b7280" fontSize="2" fontFamily="Outfit,sans-serif" fontWeight="600">{t}</text>
        ))}
        <rect x="46" y="46" width="8" height="8" rx="1" fill="#fbbf24" opacity="0.5"/>
        <text x="50" y="52.5" textAnchor="middle" fill="#92400e" fontSize="1.6" fontFamily="Outfit,sans-serif">★NMC</text>
      </svg>
      <div className="absolute" style={{ left:"50%", top:"50%", transform:"translate(-50%,-50%)", zIndex:5 }}>
        <div className="absolute rounded-full" style={{ width:36, height:36, top:-18, left:-18, background:"rgba(26,115,232,0.15)", animation:"pulseRing 2s infinite" }}/>
        <div style={{ width:18, height:18, borderRadius:"50%", background:"#1a73e8", border:"2.5px solid #fff", boxShadow:"0 2px 8px rgba(26,115,232,0.4)" }}/>
      </div>
      {toilets.map(t => {
        const isSel = selected?.id===t.id;
        const col = GRADE_COL[t.grade];
        return (
          <div key={t.id} onClick={()=>onSelect(t)} className="absolute cursor-pointer"
            style={{ left:`${t.x}%`, top:`${t.y}%`, transform:"translate(-50%,-100%)", zIndex:isSel?20:10, transition:"transform 0.2s" }}>
            <div style={{ display:"flex", flexDirection:"column", alignItems:"center", filter:isSel?`drop-shadow(0 4px 12px ${col}80)`:"drop-shadow(0 2px 6px rgba(0,0,0,0.25))", transform:isSel?"scale(1.2)":"scale(1)" }}>
              <div style={{ width:30, height:30, borderRadius:"50%", background:col, display:"flex", alignItems:"center", justifyContent:"center", fontWeight:900, fontSize:13, color:"#fff", border:"2px solid #fff" }}>{t.grade}</div>
              <div style={{ width:0, height:0, borderLeft:"6px solid transparent", borderRight:"6px solid transparent", borderTop:`8px solid ${col}`, marginTop:-1 }}/>
            </div>
            {t.alert && <div style={{ position:"absolute", top:-2, right:-2, width:14, height:14, borderRadius:"50%", background:"#ef4444", border:"2px solid #fff", display:"flex", alignItems:"center", justifyContent:"center", fontSize:8, color:"#fff", fontWeight:900 }}>!</div>}
          </div>
        );
      })}
      {/* Map controls */}
      <div className="absolute top-3 right-3 flex flex-col gap-1.5">
        {["+","−"].map((b,i) => (
          <button key={i} style={{ width:36, height:36, borderRadius:10, display:"flex", alignItems:"center", justifyContent:"center", background:"#fff", border:"1px solid #e2e8f0", fontSize:16, fontWeight:600, cursor:"pointer", color:"#374151" }}>{b}</button>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// WEB ADMIN PANEL (light v3 style)
// ═══════════════════════════════════════════════════════════════════════════════

function WebAdminPanel() {
  const [tab, setTab] = useState("overview");
  const [uploads, setUploads] = useState(PENDING_UPLOADS);
  const [alerts, setAlerts] = useState(ALERTS);
  const [toilets, setToilets] = useState(TOILETS);
  const [toast, setToast] = useState({ v:false, m:"" });

  const showToast = m => { setToast({ v:true, m }); setTimeout(()=>setToast({ v:false, m:"" }), 3000); };
  const approveUpload = id => { setUploads(u=>u.map(x=>x.id===id?{ ...x, status:"approved" }:x)); showToast("✅ Upload approved & score published"); };
  const rejectUpload  = id => { setUploads(u=>u.map(x=>x.id===id?{ ...x, status:"rejected" }:x)); showToast("❌ Upload rejected"); };
  const resolveAlert  = id => { setAlerts(a=>a.map(x=>x.id===id?{ ...x, resolved:true }:x)); showToast("✅ Alert resolved"); };

  const tabs = [
    { key:"overview", label:"Overview",   icon:"📊" },
    { key:"uploads",  label:"Uploads",    icon:"📸", badge: uploads.filter(u=>u.status==="pending").length },
    { key:"alerts",   label:"Alerts",     icon:"🚨", badge: alerts.filter(a=>!a.resolved).length },
    { key:"staff",    label:"Staff",      icon:"👥" },
    { key:"toilets",  label:"Toilets",    icon:"🚻" },
  ];

  const S = { background:"#fff", borderRadius:16, border:"1px solid #e2e8f0", boxShadow:"0 1px 4px rgba(0,0,0,0.06)" };

  return (
    <div style={{ display:"flex", height:"calc(100vh - 60px)", background:"#f0f4f8", fontFamily:"Outfit,sans-serif", overflow:"hidden" }}>
      {/* Sidebar */}
      <div style={{ width:220, background:"#fff", borderRight:"1px solid #e2e8f0", display:"flex", flexDirection:"column", flexShrink:0 }}>
        <div style={{ padding:"20px 16px 16px", borderBottom:"1px solid #f1f5f9" }}>
          <div style={{ fontWeight:900, fontSize:15, color:"#1a2332" }}>Admin Panel</div>
          <div style={{ fontSize:11, color:"#94a3b8", marginTop:2 }}>NMC · Sanitation Dept.</div>
        </div>
        <div style={{ padding:"12px 8px", flex:1 }}>
          {tabs.map(t => (
            <button key={t.key} onClick={()=>setTab(t.key)} style={{ width:"100%", display:"flex", alignItems:"center", gap:10, padding:"10px 12px", borderRadius:10, border:"none", cursor:"pointer", marginBottom:4, position:"relative",
              background: tab===t.key ? "#f0fdf4" : "transparent", color: tab===t.key ? "#0B6E4F" : "#4a5568", fontWeight: tab===t.key ? 700 : 500, fontSize:13 }}>
              <span>{t.icon}</span><span>{t.label}</span>
              {t.badge > 0 && <span style={{ marginLeft:"auto", background: tab===t.key?"#0B6E4F":"#ef4444", color:"#fff", borderRadius:20, fontSize:10, fontWeight:700, padding:"1px 7px" }}>{t.badge}</span>}
            </button>
          ))}
        </div>
        <div style={{ padding:"12px 16px", borderTop:"1px solid #f1f5f9", fontSize:11, color:"#94a3b8" }}>
          <div style={{ fontWeight:600 }}>Rajesh Shukla</div>
          <div>Sanitation Officer</div>
        </div>
      </div>

      {/* Main */}
      <div style={{ flex:1, overflowY:"auto", padding:24 }} className="scrollbar-hide">

        {/* OVERVIEW */}
        {tab==="overview" && (
          <>
            <div style={{ fontWeight:900, fontSize:20, color:"#1a2332", marginBottom:4 }}>Dashboard Overview</div>
            <div style={{ color:"#94a3b8", fontSize:13, marginBottom:20 }}>Real-time sanitation monitoring · Nagpur Municipal Corporation</div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12, marginBottom:20 }}>
              {[
                { icon:"🚻", label:"Published Toilets", val:toilets.length, col:"#0B6E4F" },
                { icon:"📸", label:"Pending Reviews", val:uploads.filter(u=>u.status==="pending").length, col:"#ca8a04" },
                { icon:"🚨", label:"Active Alerts", val:alerts.filter(a=>!a.resolved).length, col:"#dc2626" },
                { icon:"✅", label:"Staff Compliant", val:EMPLOYEES.filter(e=>e.compliant).length, col:"#16a34a" },
              ].map(s => (
                <div key={s.label} style={{ ...S, padding:16 }}>
                  <div style={{ fontSize:24, marginBottom:6 }}>{s.icon}</div>
                  <div style={{ fontWeight:900, fontSize:26, color:s.col }}>{s.val}</div>
                  <div style={{ fontSize:12, color:"#94a3b8", marginTop:2 }}>{s.label}</div>
                </div>
              ))}
            </div>
            {/* Grade distribution */}
            <div style={{ ...S, padding:20, marginBottom:16 }}>
              <div style={{ fontWeight:700, fontSize:15, color:"#1a2332", marginBottom:14 }}>Grade Distribution</div>
              <div style={{ display:"flex", gap:8 }}>
                {["A","B","C","D"].map(g => {
                  const count = toilets.filter(t=>t.grade===g).length;
                  const pct = Math.round((count/toilets.length)*100);
                  return (
                    <div key={g} style={{ flex:1, textAlign:"center" }}>
                      <div style={{ height:80, borderRadius:8, background:GRADE_BG[g], border:`1.5px solid ${GRADE_BD[g]}`, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center" }}>
                        <div style={{ fontWeight:900, fontSize:28, color:GRADE_COL[g] }}>{count}</div>
                        <div style={{ fontSize:10, color:GRADE_COL[g] }}>{pct}%</div>
                      </div>
                      <div style={{ fontWeight:700, fontSize:13, color:GRADE_COL[g], marginTop:4 }}>Grade {g}</div>
                    </div>
                  );
                })}
              </div>
            </div>
            {/* Recent alerts */}
            <div style={{ ...S, padding:20 }}>
              <div style={{ fontWeight:700, fontSize:15, color:"#1a2332", marginBottom:12 }}>Recent Alerts</div>
              {alerts.slice(0,3).map(a => (
                <div key={a.id} style={{ display:"flex", alignItems:"center", gap:12, padding:"10px 0", borderBottom:"1px solid #f8fafc" }}>
                  <div style={{ width:8, height:8, borderRadius:"50%", flexShrink:0, background:a.type==="critical"?"#ef4444":"#f59e0b" }}/>
                  <div style={{ flex:1 }}>
                    <div style={{ fontWeight:600, fontSize:13, color:"#1a2332" }}>{a.toilet}</div>
                    <div style={{ fontSize:11, color:"#94a3b8" }}>{a.issue}</div>
                  </div>
                  <span style={{ fontSize:11, color:"#94a3b8" }}>{a.time}</span>
                  {a.resolved && <span style={{ fontSize:11, color:"#16a34a", fontWeight:600 }}>Resolved</span>}
                </div>
              ))}
            </div>
          </>
        )}

        {/* UPLOADS — photo review */}
        {tab==="uploads" && (
          <>
            <div style={{ fontWeight:900, fontSize:20, color:"#1a2332", marginBottom:4 }}>Photo Review Panel</div>
            <div style={{ color:"#94a3b8", fontSize:13, marginBottom:20 }}>Review AI-analyzed photos uploaded by field employees</div>
            {uploads.map(u => (
              <div key={u.id} style={{ ...S, padding:20, marginBottom:12 }}>
                <div style={{ display:"flex", alignItems:"start", justifyContent:"space-between", marginBottom:12 }}>
                  <div>
                    <div style={{ fontWeight:700, fontSize:15, color:"#1a2332" }}>{u.toiletName}</div>
                    <div style={{ fontSize:12, color:"#94a3b8", marginTop:2 }}>Staff: {u.staffName} · {u.uploadedAt} · {u.photos} photos</div>
                  </div>
                  <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                    {u.urgent && <span style={{ fontSize:11, padding:"3px 8px", borderRadius:20, background:"#fee2e2", color:"#dc2626", fontWeight:700 }}>🚨 Urgent</span>}
                    <GradeBadge grade={u.aiGrade} score={u.aiScore}/>
                  </div>
                </div>
                {/* Photo thumbnails placeholder */}
                <div style={{ display:"flex", gap:8, marginBottom:12 }}>
                  {Array.from({ length:u.photos }).map((_,i) => (
                    <div key={i} style={{ width:80, height:60, borderRadius:10, background:GRADE_BG[u.aiGrade], border:`1px solid ${GRADE_BD[u.aiGrade]}`, display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column" }}>
                      <span style={{ fontSize:20 }}>🖼️</span>
                      <span style={{ fontSize:9, color:GRADE_COL[u.aiGrade], marginTop:2 }}>Photo {i+1}</span>
                    </div>
                  ))}
                </div>
                {/* AI detections */}
                {u.issues.length > 0 && (
                  <div style={{ marginBottom:12 }}>
                    <div style={{ fontSize:11, color:"#64748b", marginBottom:6 }}>AI DETECTED ISSUES:</div>
                    <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
                      {u.issues.map(iss => (
                        <span key={iss} style={{ fontSize:11, padding:"3px 10px", borderRadius:20, background:"#fee2e2", color:"#dc2626", border:"1px solid #fecaca" }}>⚠️ {iss}</span>
                      ))}
                    </div>
                  </div>
                )}
                {u.issues.length===0 && <div style={{ marginBottom:12, fontSize:12, color:"#16a34a" }}>✅ No issues detected by AI</div>}
                {/* Actions */}
                {u.status==="pending" ? (
                  <div style={{ display:"flex", gap:8 }}>
                    <button onClick={()=>approveUpload(u.id)} style={{ flex:1, padding:"10px 0", borderRadius:10, border:"none", background:"#0B6E4F", color:"#fff", fontWeight:700, fontSize:13, cursor:"pointer" }}>
                      ✅ Approve & Publish
                    </button>
                    <button onClick={()=>rejectUpload(u.id)} style={{ flex:1, padding:"10px 0", borderRadius:10, border:"1px solid #fecaca", background:"#fff", color:"#dc2626", fontWeight:600, fontSize:13, cursor:"pointer" }}>
                      ❌ Reject
                    </button>
                  </div>
                ) : (
                  <div style={{ padding:"8px 12px", borderRadius:10, background:u.status==="approved"?"#f0fdf4":"#fee2e2", color:u.status==="approved"?"#16a34a":"#dc2626", fontSize:12, fontWeight:700, textAlign:"center" }}>
                    {u.status==="approved"?"✅ Approved & Published":"❌ Rejected"}
                  </div>
                )}
              </div>
            ))}
          </>
        )}

        {/* ALERTS */}
        {tab==="alerts" && (
          <>
            <div style={{ fontWeight:900, fontSize:20, color:"#1a2332", marginBottom:4 }}>System Alerts</div>
            <div style={{ color:"#94a3b8", fontSize:13, marginBottom:20 }}>Critical and warning alerts requiring attention</div>
            {alerts.map(a => (
              <div key={a.id} style={{ ...S, padding:18, marginBottom:10, borderLeft:`4px solid ${a.type==="critical"?"#ef4444":"#f59e0b"}` }}>
                <div style={{ display:"flex", alignItems:"start", justifyContent:"space-between", gap:12 }}>
                  <div style={{ flex:1 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4 }}>
                      <span style={{ fontSize:16 }}>{a.type==="critical"?"🚨":"⚠️"}</span>
                      <span style={{ fontWeight:700, fontSize:14, color:"#1a2332" }}>{a.toilet}</span>
                      <span style={{ fontSize:11, padding:"2px 8px", borderRadius:20, background:a.type==="critical"?"#fee2e2":"#fef9c3", color:a.type==="critical"?"#dc2626":"#ca8a04", fontWeight:600 }}>
                        {a.type==="critical"?"CRITICAL":"WARNING"}
                      </span>
                    </div>
                    <div style={{ fontSize:13, color:"#64748b", marginBottom:4 }}>{a.issue}</div>
                    <div style={{ fontSize:11, color:"#94a3b8" }}>{a.time}</div>
                  </div>
                  {!a.resolved && (
                    <button onClick={()=>resolveAlert(a.id)} style={{ padding:"8px 14px", borderRadius:10, border:"none", background:"#0B6E4F", color:"#fff", fontWeight:700, fontSize:12, cursor:"pointer" }}>
                      ✅ Resolve
                    </button>
                  )}
                  {a.resolved && <span style={{ fontSize:12, color:"#16a34a", fontWeight:700 }}>✅ Resolved</span>}
                </div>
              </div>
            ))}
          </>
        )}

        {/* STAFF */}
        {tab==="staff" && (
          <>
            <div style={{ fontWeight:900, fontSize:20, color:"#1a2332", marginBottom:4 }}>Staff Compliance Tracker</div>
            <div style={{ color:"#94a3b8", fontSize:13, marginBottom:20 }}>Daily upload compliance for all field employees</div>
            {EMPLOYEES.map(emp => {
              const empToilets = TOILETS.filter(t=>emp.assignedToilets.includes(t.id));
              return (
                <div key={emp.id} style={{ ...S, padding:20, marginBottom:12, borderLeft:`4px solid ${emp.compliant?"#16a34a":"#ef4444"}` }}>
                  <div style={{ display:"flex", alignItems:"start", justifyContent:"space-between", marginBottom:10 }}>
                    <div>
                      <div style={{ fontWeight:700, fontSize:15, color:"#1a2332" }}>{emp.name}</div>
                      <div style={{ fontSize:12, color:"#94a3b8" }}>{emp.id} · {emp.zone}</div>
                      <div style={{ fontSize:12, color:"#94a3b8" }}>📞 {emp.phone}</div>
                    </div>
                    <div style={{ textAlign:"right" }}>
                      <span style={{ fontSize:11, padding:"4px 10px", borderRadius:20, fontWeight:700,
                        background:emp.compliant?"#f0fdf4":"#fee2e2", color:emp.compliant?"#16a34a":"#dc2626" }}>
                        {emp.compliant?"✅ Compliant":"⚠️ "+emp.lastUpload}
                      </span>
                      <div style={{ fontSize:11, color:"#94a3b8", marginTop:4 }}>Total uploads: {emp.uploads}</div>
                    </div>
                  </div>
                  <div style={{ fontSize:11, color:"#64748b", marginBottom:8 }}>ASSIGNED TOILETS:</div>
                  <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
                    {empToilets.map(t => (
                      <div key={t.id} style={{ display:"flex", alignItems:"center", gap:6, padding:"4px 10px", borderRadius:20, background:GRADE_BG[t.grade], border:`1px solid ${GRADE_BD[t.grade]}` }}>
                        <span style={{ fontWeight:700, fontSize:11, color:GRADE_COL[t.grade] }}>{t.grade}</span>
                        <span style={{ fontSize:11, color:"#4a5568" }}>{t.area}</span>
                      </div>
                    ))}
                  </div>
                  {!emp.compliant && (
                    <button style={{ marginTop:12, padding:"8px 16px", borderRadius:10, border:"1px solid #fecaca", background:"#fff", color:"#dc2626", fontWeight:600, fontSize:12, cursor:"pointer" }}>
                      📨 Send Reminder
                    </button>
                  )}
                </div>
              );
            })}
          </>
        )}

        {/* TOILETS */}
        {tab==="toilets" && (
          <>
            <div style={{ fontWeight:900, fontSize:20, color:"#1a2332", marginBottom:4 }}>All Published Toilets</div>
            <div style={{ color:"#94a3b8", fontSize:13, marginBottom:20 }}>Live status overview with display codes for public screens</div>
            {toilets.map(t => (
              <div key={t.id} style={{ ...S, padding:16, marginBottom:8, display:"flex", alignItems:"center", gap:14 }}>
                <div style={{ width:40, height:40, borderRadius:"50%", background:GRADE_COL[t.grade], display:"flex", alignItems:"center", justifyContent:"center", fontWeight:900, fontSize:16, color:"#fff", flexShrink:0 }}>{t.grade}</div>
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:700, fontSize:14, color:"#1a2332" }}>{t.name}</div>
                  <div style={{ fontSize:11, color:"#94a3b8" }}>{t.area} · Score: {t.score}/100 · Display Code: <span style={{ fontFamily:"monospace", fontWeight:700, color:"#0B6E4F" }}>{t.displayCode}</span></div>
                  <div style={{ display:"flex", gap:6, marginTop:4 }}>
                    {t.water && <span style={{ fontSize:10, padding:"2px 6px", borderRadius:20, background:"#e0f2fe", color:"#0369a1" }}>💧</span>}
                    {t.soap  && <span style={{ fontSize:10, padding:"2px 6px", borderRadius:20, background:"#dcfce7", color:"#16a34a" }}>🧼</span>}
                    {t.alert && <span style={{ fontSize:10, padding:"2px 6px", borderRadius:20, background:"#fee2e2", color:"#dc2626" }}>🚨 Alert</span>}
                  </div>
                </div>
                <div style={{ textAlign:"right" }}>
                  <span style={{ fontSize:11, padding:"4px 10px", borderRadius:20, background:t.status==="Open"?"#f0fdf4":"#fef9c3", color:t.status==="Open"?"#16a34a":"#ca8a04", fontWeight:600 }}>{t.status}</span>
                </div>
              </div>
            ))}
          </>
        )}
      </div>
      <Toast msg={toast.m} visible={toast.v}/>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// PUBLIC DISPLAY SCREEN (employee enters code → shows toilet info on big screen)
// ═══════════════════════════════════════════════════════════════════════════════

function PublicDisplayScreen({ onClose }) {
  const [code, setCode] = useState("");
  const [toilet, setToilet] = useState(null);
  const [error, setError] = useState("");
  const [searching, setSearching] = useState(false);
  const [tick, setTick] = useState(0);

  // Live clock tick
  useEffect(() => {
    const iv = setInterval(()=>setTick(t=>t+1), 30000);
    return ()=>clearInterval(iv);
  }, []);

  const now = new Date();
  const timeStr = now.toLocaleTimeString("en-IN",{ hour:"2-digit", minute:"2-digit" });
  const dateStr = now.toLocaleDateString("en-IN",{ weekday:"long", day:"numeric", month:"long", year:"numeric" });

  const handleSearch = async () => {
    setError(""); setToilet(null);
    setSearching(true);
    await new Promise(r=>setTimeout(r, 700));
    const found = TOILETS.find(t => t.displayCode.toUpperCase()===code.toUpperCase().trim());
    if (found) { setToilet(found); }
    else { setError("Invalid code. Please check the code on your employee ID card."); }
    setSearching(false);
  };

  const col = toilet ? GRADE_COL[toilet.grade] : "#0B6E4F";

  return (
    <div style={{ position:"fixed", inset:0, zIndex:1000, background:"rgba(0,0,0,0.85)", display:"flex", alignItems:"center", justifyContent:"center", padding:20, fontFamily:"Outfit,sans-serif" }}>
      <div style={{ background:"#fff", borderRadius:24, overflow:"hidden", width:"100%", maxWidth:900, maxHeight:"95vh", overflowY:"auto", boxShadow:"0 40px 80px rgba(0,0,0,0.5)" }}>
        {/* Header bar */}
        <div style={{ background:"linear-gradient(135deg,#0B6E4F,#1a9a6f)", padding:"16px 24px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            <div style={{ fontSize:32 }}>🚻</div>
            <div>
              <div style={{ fontWeight:900, fontSize:18, color:"#fff" }}>AI Smart Sanitation · Public Display</div>
              <div style={{ fontSize:12, color:"rgba(255,255,255,0.7)" }}>Nagpur Municipal Corporation · Swachh Bharat Digital</div>
            </div>
          </div>
          <div style={{ textAlign:"right", color:"rgba(255,255,255,0.9)" }}>
            <div style={{ fontWeight:700, fontSize:18, fontFamily:"monospace" }}>{timeStr}</div>
            <div style={{ fontSize:11 }}>{dateStr}</div>
          </div>
          <button onClick={onClose} style={{ marginLeft:16, width:36, height:36, borderRadius:"50%", background:"rgba(255,255,255,0.15)", border:"none", color:"#fff", fontSize:18, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>×</button>
        </div>

        <div style={{ padding:28 }}>
          {/* Code input section */}
          {!toilet && (
            <div style={{ maxWidth:500, margin:"0 auto", textAlign:"center" }}>
              <div style={{ fontSize:48, marginBottom:12 }}>🔑</div>
              <div style={{ fontWeight:900, fontSize:22, color:"#1a2332", marginBottom:4 }}>Enter Facility Code</div>
              <div style={{ fontSize:14, color:"#64748b", marginBottom:24 }}>
                Enter your unique employee code to display live status of your assigned toilet facility on this public screen.
              </div>

              {/* Code display examples */}
              <div style={{ display:"flex", flexWrap:"wrap", gap:8, justifyContent:"center", marginBottom:20 }}>
                {TOILETS.slice(0,4).map(t => (
                  <button key={t.id} onClick={()=>setCode(t.displayCode)} style={{ padding:"4px 12px", borderRadius:20, border:`1px solid ${GRADE_BD[t.grade]}`, background:GRADE_BG[t.grade], color:GRADE_COL[t.grade], fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:"monospace" }}>
                    {t.displayCode}
                  </button>
                ))}
                <span style={{ fontSize:12, color:"#94a3b8", alignSelf:"center" }}>← try these</span>
              </div>

              <div style={{ display:"flex", gap:10 }}>
                <input value={code} onChange={e=>setCode(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleSearch()}
                  placeholder="e.g. NMC-STB-001"
                  style={{ flex:1, padding:"14px 18px", borderRadius:12, border:"2px solid #e2e8f0", fontSize:16, fontFamily:"monospace", fontWeight:600, outline:"none", color:"#1a2332", letterSpacing:"0.05em" }}/>
                <button onClick={handleSearch} disabled={!code||searching} style={{ padding:"14px 24px", borderRadius:12, border:"none", background:"linear-gradient(135deg,#0B6E4F,#1a9a6f)", color:"#fff", fontWeight:700, fontSize:14, cursor:"pointer" }}>
                  {searching ? "..." : "Display"}
                </button>
              </div>
              {error && <div style={{ marginTop:12, padding:"10px 14px", borderRadius:10, background:"#fee2e2", color:"#dc2626", fontSize:13, border:"1px solid #fecaca" }}>⚠️ {error}</div>}
            </div>
          )}

          {/* Toilet Public Display */}
          {toilet && (
            <div>
              {/* Back button */}
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
                <button onClick={()=>{ setToilet(null); setCode(""); }} style={{ display:"flex", alignItems:"center", gap:6, padding:"8px 14px", borderRadius:10, border:"1px solid #e2e8f0", background:"#fff", color:"#64748b", fontSize:13, cursor:"pointer" }}>
                  ← Change Facility
                </button>
                <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                  <div style={{ width:10, height:10, borderRadius:"50%", background:"#16a34a", animation:"pulse 2s infinite" }}/>
                  <span style={{ fontSize:13, fontWeight:700, color:"#16a34a" }}>LIVE DATA</span>
                </div>
              </div>

              {/* Toilet name */}
              <div style={{ textAlign:"center", marginBottom:24 }}>
                <div style={{ fontFamily:"monospace", fontSize:12, color:"#94a3b8", marginBottom:4 }}>{toilet.displayCode}</div>
                <div style={{ fontWeight:900, fontSize:28, color:"#1a2332" }}>{toilet.name}</div>
                <div style={{ fontSize:15, color:"#64748b", marginTop:4 }}>📍 {toilet.area}, Nagpur</div>
              </div>

              {/* Main grade display — large, meant for public screen */}
              <div style={{ display:"flex", gap:20, marginBottom:20, padding:28, borderRadius:20, background:`linear-gradient(135deg,${GRADE_BG[toilet.grade]},#fff)`, border:`2px solid ${GRADE_BD[toilet.grade]}` }}>
                <div style={{ textAlign:"center", flexShrink:0 }}>
                  <div style={{ fontWeight:900, fontSize:110, lineHeight:1, color:col }}>{toilet.grade}</div>
                  <div style={{ fontWeight:700, fontSize:18, color:col }}>{GRADE_LBL[toilet.grade]}</div>
                  <div style={{ fontSize:13, color:"#94a3b8", marginTop:4 }}>AI Grade</div>
                </div>
                <div style={{ flex:1, display:"flex", flexDirection:"column", justifyContent:"center" }}>
                  <div style={{ fontWeight:900, fontSize:60, color:"#1a2332", lineHeight:1 }}>{toilet.score}<span style={{ fontSize:24, fontWeight:400, color:"#94a3b8" }}>/100</span></div>
                  <div style={{ fontSize:15, color:"#64748b", marginBottom:16 }}>Hygiene Score (AI Verified)</div>
                  <div style={{ height:14, borderRadius:7, background:"#f1f5f9", overflow:"hidden" }}>
                    <div style={{ height:"100%", borderRadius:7, width:`${toilet.score}%`, background:`linear-gradient(90deg,${col}aa,${col})`, transition:"width 1.2s ease" }}/>
                  </div>
                  <div style={{ display:"flex", alignItems:"center", gap:10, marginTop:12 }}>
                    <StarRating rating={toilet.rating} size={22}/>
                    <span style={{ fontWeight:800, fontSize:22, color:"#374151" }}>{toilet.rating}</span>
                    <span style={{ fontSize:14, color:"#94a3b8" }}>({toilet.reviews} public ratings)</span>
                  </div>
                </div>
                <ScoreRing score={toilet.score} size={130}/>
              </div>

              {/* Status cards */}
              <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12, marginBottom:20 }}>
                {[
                  [toilet.status==="Open", toilet.status==="Open"?"🟢":"🔴", toilet.status==="Maintenance"?"Under Maintenance":toilet.status],
                  [toilet.water, "💧", toilet.water?"Water Available":"No Water"],
                  [toilet.soap,  "🧼", toilet.soap?"Soap Available":"No Soap"],
                  [toilet.wheelchair, "♿", toilet.wheelchair?"Accessible":"Standard Access"],
                ].map(([ok,icon,label],i) => (
                  <div key={i} style={{ padding:16, borderRadius:14, textAlign:"center", background:ok?GRADE_BG.A:"#f8fafc", border:`1.5px solid ${ok?GRADE_BD.A:"#e2e8f0"}` }}>
                    <div style={{ fontSize:28, marginBottom:4 }}>{icon}</div>
                    <div style={{ fontSize:12, fontWeight:700, color:ok?GRADE_COL.A:"#94a3b8" }}>{label}</div>
                  </div>
                ))}
              </div>

              {/* Issues (if any) */}
              {toilet.issues?.length > 0 && (
                <div style={{ padding:16, borderRadius:14, background:"#fee2e2", border:"1px solid #fecaca", marginBottom:16 }}>
                  <div style={{ fontWeight:700, fontSize:14, color:"#dc2626", marginBottom:8 }}>⚠️ Known Issues</div>
                  {toilet.issues.map((iss,i) => <div key={i} style={{ fontSize:13, color:"#b91c1c", marginBottom:3 }}>• {iss}</div>)}
                </div>
              )}

              {/* Footer info */}
              <div style={{ display:"flex", justifyContent:"space-between", padding:"12px 16px", borderRadius:12, background:"#f8fafc", border:"1px solid #e2e8f0", fontSize:12, color:"#94a3b8" }}>
                <span>Last cleaned: {toilet.lastCleaned}</span>
                <span>Staff code: <span style={{ fontFamily:"monospace", color:"#0B6E4F" }}>{toilet.displayCode}</span></span>
                <span>Data verified by AI · Updated live</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// WEB MAP INTERFACE (light, v3 style, for public web visitors)
// ═══════════════════════════════════════════════════════════════════════════════

function WebMapView() {
  const [selected, setSelected] = useState(null);
  const [filterGrade, setFilterGrade] = useState("all");
  const [searchQ, setSearchQ] = useState("");

  const filtered = TOILETS.filter(t => filterGrade==="all"||t.grade===filterGrade).filter(t => t.name.toLowerCase().includes(searchQ.toLowerCase())||t.area.toLowerCase().includes(searchQ.toLowerCase()));

  return (
    <div style={{ height:"calc(100vh - 60px)", display:"flex", overflow:"hidden" }}>
      {/* Sidebar */}
      <div style={{ width:320, background:"#fff", borderRight:"1px solid #e2e8f0", display:"flex", flexDirection:"column", overflowY:"auto" }} className="scrollbar-hide">
        <div style={{ padding:"16px 16px 10px", borderBottom:"1px solid #f1f5f9" }}>
          <div style={{ fontWeight:900, fontSize:16, color:"#1a2332", marginBottom:10 }}>Find a Toilet</div>
          <div style={{ display:"flex", gap:8, padding:"10px 12px", borderRadius:12, border:"1px solid #e2e8f0", background:"#f8fafc", marginBottom:8 }}>
            <span>🔍</span>
            <input value={searchQ} onChange={e=>setSearchQ(e.target.value)} placeholder="Search name or area..." style={{ flex:1, border:"none", background:"transparent", outline:"none", fontSize:13, color:"#1a2332" }}/>
          </div>
          <div style={{ display:"flex", gap:6 }}>
            {["all","A","B","C","D"].map(g => (
              <button key={g} onClick={()=>setFilterGrade(g)} style={{ padding:"5px 10px", borderRadius:20, border:"none", fontSize:11, fontWeight:700, cursor:"pointer",
                background: filterGrade===g?(g==="all"?"#1a73e8":GRADE_COL[g]):GRADE_BG[g]||"#f1f5f9",
                color: filterGrade===g?"#fff":g==="all"?"#374151":GRADE_COL[g] }}>
                {g==="all"?"All":g}
              </button>
            ))}
          </div>
        </div>
        <div style={{ flex:1, padding:"8px 12px 12px" }}>
          {filtered.sort((a,b)=>a.distance-b.distance).map(t => (
            <div key={t.id} onClick={()=>setSelected(t)} style={{ padding:14, borderRadius:14, marginBottom:8, cursor:"pointer",
              background:selected?.id===t.id?"#f0fdf4":"#fff", border:`1.5px solid ${selected?.id===t.id?GRADE_BD.A:"#f1f5f9"}`,
              boxShadow:"0 1px 4px rgba(0,0,0,0.05)" }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}>
                <div style={{ fontWeight:600, fontSize:13, color:"#1a2332", flex:1, paddingRight:8 }}>{t.name}</div>
                <GradeBadge grade={t.grade} score={t.score} size="sm"/>
              </div>
              <div style={{ display:"flex", justifyContent:"space-between", color:"#94a3b8", fontSize:11 }}>
                <span>📍 {t.area} · {t.distance}km</span>
                <span style={{ color:t.status==="Open"?"#16a34a":"#ca8a04", fontWeight:600 }}>{t.status}</span>
              </div>
              <div style={{ display:"flex", gap:5, marginTop:6, flexWrap:"wrap" }}>
                {t.water && <span style={{ fontSize:10, padding:"2px 6px", borderRadius:20, background:"#e0f2fe", color:"#0369a1" }}>💧 Water</span>}
                {t.soap  && <span style={{ fontSize:10, padding:"2px 6px", borderRadius:20, background:"#dcfce7", color:"#16a34a" }}>🧼 Soap</span>}
                {t.alert && <span style={{ fontSize:10, padding:"2px 6px", borderRadius:20, background:"#fee2e2", color:"#dc2626" }}>⚠️</span>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Map */}
      <div style={{ flex:1, position:"relative" }}>
        <LightMapView toilets={filtered} selected={selected} onSelect={setSelected}/>
        {/* Selected detail panel */}
        {selected && (
          <div className="slide-up" style={{ position:"absolute", bottom:16, left:16, right:16, background:"#fff", borderRadius:20, padding:18, boxShadow:"0 8px 40px rgba(0,0,0,0.18)", border:`1.5px solid ${GRADE_BD[selected.grade]}` }}>
            <button onClick={()=>setSelected(null)} style={{ position:"absolute", top:12, right:12, width:28, height:28, borderRadius:"50%", background:"#f1f5f9", border:"none", fontSize:16, color:"#64748b", cursor:"pointer" }}>×</button>
            <div style={{ display:"flex", alignItems:"start", gap:14, marginBottom:12 }}>
              <ScoreRing score={selected.score} size={70}/>
              <div style={{ flex:1 }}>
                <div style={{ fontWeight:700, fontSize:15, color:"#1a2332", marginBottom:2 }}>{selected.name}</div>
                <div style={{ fontSize:12, color:"#94a3b8", marginBottom:6 }}>📍 {selected.area} · {selected.distance} km away</div>
                <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                  <GradeBadge grade={selected.grade} score={selected.score}/>
                  <span style={{ fontSize:12, color:GRADE_COL[selected.grade], fontWeight:600 }}>{GRADE_LBL[selected.grade]}</span>
                  <span style={{ fontSize:12, color:selected.status==="Open"?"#16a34a":"#ca8a04", fontWeight:600, marginLeft:"auto" }}>{selected.status==="Open"?"🟢 Open":"🔴 "+selected.status}</span>
                </div>
              </div>
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:10 }}>
              <StarRating rating={selected.rating} size={14}/>
              <span style={{ fontWeight:700, fontSize:13, color:"#374151" }}>{selected.rating}</span>
              <span style={{ fontSize:12, color:"#94a3b8" }}>({selected.reviews} ratings)</span>
            </div>
            <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
              {selected.water && <span style={{ fontSize:11, padding:"3px 8px", borderRadius:20, background:"#e0f2fe", color:"#0369a1" }}>💧 Water</span>}
              {selected.soap  && <span style={{ fontSize:11, padding:"3px 8px", borderRadius:20, background:"#dcfce7", color:"#16a34a" }}>🧼 Soap</span>}
              {selected.handDryer && <span style={{ fontSize:11, padding:"3px 8px", borderRadius:20, background:"#f0fdf4", color:"#16a34a" }}>🌬️ Hand Dryer</span>}
              {selected.wheelchair && <span style={{ fontSize:11, padding:"3px 8px", borderRadius:20, background:"#ede9fe", color:"#7c3aed" }}>♿ Accessible</span>}
            </div>
            <div style={{ marginTop:10, fontSize:11, color:"#94a3b8" }}>Last cleaned: {selected.lastCleaned} · Display code: <span style={{ fontFamily:"monospace", color:"#0B6E4F", fontWeight:700 }}>{selected.displayCode}</span></div>
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ROOT APP
// ═══════════════════════════════════════════════════════════════════════════════

export default function App() {
  const [view, setView]       = useState("android");
  const [showDisplay, setShowDisplay] = useState(false);

  return (
    <div style={{ minHeight:"100vh", background:"#f0f4f8", fontFamily:"Outfit,sans-serif" }}>
      <Styles/>

      {/* Top Navigation Bar */}
      <div style={{ background:"#fff", borderBottom:"1px solid #e2e8f0", padding:"10px 20px", display:"flex", alignItems:"center", justifyContent:"space-between", height:60, zIndex:50, position:"sticky", top:0 }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ width:36, height:36, borderRadius:10, background:"linear-gradient(135deg,#0B6E4F,#1a9a6f)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:18 }}>🚻</div>
          <div>
            <div style={{ fontWeight:900, fontSize:14, color:"#1a2332" }}>AI Smart Sanitation & Access Locator</div>
            <div style={{ fontSize:10, color:"#94a3b8" }}>Nagpur Municipal Corporation · Swachh Bharat Digital</div>
          </div>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          {/* Public Display button */}
          <button onClick={()=>setShowDisplay(true)} style={{ display:"flex", alignItems:"center", gap:6, padding:"8px 14px", borderRadius:10, border:"1px solid #bbf7d0", background:"#f0fdf4", color:"#0B6E4F", fontSize:12, fontWeight:700, cursor:"pointer" }}>
            📟 Public Display
          </button>
          {[
            { key:"android", label:"📱 Android App" },
            { key:"web",     label:"🌐 Web Map" },
            { key:"admin",   label:"🛡️ Admin Panel" },
          ].map(v => (
            <button key={v.key} onClick={()=>setView(v.key)} style={{ padding:"8px 14px", borderRadius:10, border:"none", cursor:"pointer", fontSize:12, fontWeight:700,
              background: view===v.key ? "linear-gradient(135deg,#0B6E4F,#1a9a6f)" : "#f1f5f9",
              color: view===v.key ? "#fff" : "#374151" }}>
              {v.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      {view==="android" && (
        <div style={{ display:"flex", flexDirection:"column", alignItems:"center", padding:"28px 0" }}>
          <div style={{ textAlign:"center", marginBottom:12 }}>
            <div style={{ fontWeight:700, fontSize:13, color:"#64748b" }}>Android App · Login → Role-Based Interface</div>
            <div style={{ fontSize:11, color:"#94a3b8", marginTop:2 }}>Employees & public users start here · All interactions work</div>
          </div>
          {/* Phone Frame */}
          <div style={{ width:390, background:"#1a1a1a", borderRadius:48, padding:10, boxShadow:"0 40px 80px rgba(0,0,0,0.35), inset 0 2px 4px rgba(255,255,255,0.1)", border:"1px solid #333", position:"relative" }}>
            <div style={{ position:"absolute", top:14, left:"50%", transform:"translateX(-50%)", width:120, height:30, background:"#000", borderRadius:20, zIndex:50 }}/>
            <div style={{ borderRadius:38, overflow:"hidden", height:820, background:"#030912", position:"relative" }}>
              <AndroidApp/>
            </div>
            <div style={{ display:"flex", justifyContent:"center", paddingTop:8, paddingBottom:4 }}>
              <div style={{ width:120, height:5, background:"#333", borderRadius:4 }}/>
            </div>
          </div>
        </div>
      )}

      {view==="web" && <WebMapView/>}
      {view==="admin" && <WebAdminPanel/>}

      {showDisplay && <PublicDisplayScreen onClose={()=>setShowDisplay(false)}/>}
    </div>
  );
}
