import { useState, useEffect, useRef } from "react";

// ── Palette & theme ──────────────────────────────────────────────────────────
// Dark-navy base, electric-teal accent, amber warning, crimson danger
// Font: "Syne" display + "DM Sans" body — loaded via @import in the style block

// ── Simulated Data ───────────────────────────────────────────────────────────
const STUDENTS = [
  {
    id: 1, name: "Aisha Rajan", avatar: "AR", grade: "10-A",
    quizAvg: 85, studyHours: 4.2, comprehension: 88, attendance: 96, assignmentRate: 92,
    riskScore: 18,
    subjects: { Biology: 87, Chemistry: 82, Physics: 84, Math: 90, English: 88 },
    predictedScores: { Biology: 89, Chemistry: 84, Physics: 86, Math: 92, English: 90 },
    trend: [78, 81, 83, 85, 86, 88, 85, 87],
    studyTrend: [3.5, 4.0, 4.2, 4.0, 4.5, 4.2, 4.3, 4.2],
    alerts: [],
    interventions: [],
    strengths: ["Mathematics", "Biology"], weaknesses: [],
    dropoutRisk: 4,
  },
  {
    id: 2, name: "Ben Okafor", avatar: "BO", grade: "10-A",
    quizAvg: 58, studyHours: 1.5, comprehension: 52, attendance: 74, assignmentRate: 61,
    riskScore: 71,
    subjects: { Biology: 61, Chemistry: 44, Physics: 55, Math: 62, English: 68 },
    predictedScores: { Biology: 59, Chemistry: 41, Physics: 52, Math: 60, English: 65 },
    trend: [72, 68, 64, 61, 58, 55, 58, 56],
    studyTrend: [2.5, 2.0, 1.8, 1.5, 1.2, 1.5, 1.3, 1.5],
    alerts: ["Engagement dropped 35% in 2 weeks", "Chemistry comprehension critically low"],
    interventions: ["Schedule 1-on-1 tutoring in Chemistry", "Assign targeted review: Chemical Reactions", "Enable StudySync daily reminders"],
    strengths: ["English"], weaknesses: ["Chemistry", "Physics"],
    dropoutRisk: 28,
  },
  {
    id: 3, name: "Cleo Martinez", avatar: "CM", grade: "10-A",
    quizAvg: 73, studyHours: 2.8, comprehension: 70, attendance: 88, assignmentRate: 79,
    riskScore: 42,
    subjects: { Biology: 75, Chemistry: 61, Physics: 70, Math: 78, English: 80 },
    predictedScores: { Biology: 74, Chemistry: 59, Physics: 68, Math: 76, English: 81 },
    trend: [70, 72, 74, 72, 71, 73, 70, 73],
    studyTrend: [3.0, 2.8, 2.6, 2.9, 2.8, 2.7, 2.9, 2.8],
    alerts: ["Chemistry predicted below 60%"],
    interventions: ["Recommend Chemistry study group", "Review chemical bonding concepts"],
    strengths: ["English", "Math"], weaknesses: ["Chemistry"],
    dropoutRisk: 11,
  },
  {
    id: 4, name: "Dev Sharma", avatar: "DS", grade: "10-A",
    quizAvg: 91, studyHours: 5.5, comprehension: 93, attendance: 98, assignmentRate: 97,
    riskScore: 8,
    subjects: { Biology: 92, Chemistry: 90, Physics: 93, Math: 95, English: 87 },
    predictedScores: { Biology: 93, Chemistry: 91, Physics: 94, Math: 96, English: 88 },
    trend: [87, 88, 90, 91, 92, 91, 92, 91],
    studyTrend: [5.0, 5.2, 5.5, 5.3, 5.6, 5.4, 5.5, 5.5],
    alerts: [],
    interventions: ["Consider advanced enrichment material"],
    strengths: ["Math", "Physics", "Biology"], weaknesses: [],
    dropoutRisk: 2,
  },
  {
    id: 5, name: "Elena Novak", avatar: "EN", grade: "10-A",
    quizAvg: 47, studyHours: 1.0, comprehension: 41, attendance: 65, assignmentRate: 48,
    riskScore: 89,
    subjects: { Biology: 50, Chemistry: 38, Physics: 44, Math: 52, English: 51 },
    predictedScores: { Biology: 47, Chemistry: 34, Physics: 40, Math: 49, English: 50 },
    trend: [65, 60, 55, 52, 49, 47, 45, 47],
    studyTrend: [2.0, 1.8, 1.5, 1.2, 1.0, 0.8, 1.0, 1.0],
    alerts: ["CRITICAL: Attendance at 65%", "All subjects predicted below passing", "Study activity near zero"],
    interventions: ["Immediate counselor referral", "Parent-teacher conference required", "Daily check-in protocol", "Simplified catch-up plan for all subjects"],
    strengths: [], weaknesses: ["Chemistry", "Physics", "Biology"],
    dropoutRisk: 61,
  },
  {
    id: 6, name: "Finn Adeyemi", avatar: "FA", grade: "10-A",
    quizAvg: 66, studyHours: 2.2, comprehension: 63, attendance: 83, assignmentRate: 72,
    riskScore: 55,
    subjects: { Biology: 68, Chemistry: 57, Physics: 62, Math: 71, English: 72 },
    predictedScores: { Biology: 66, Chemistry: 54, Physics: 60, Math: 69, English: 73 },
    trend: [68, 67, 66, 65, 67, 64, 66, 66],
    studyTrend: [2.5, 2.4, 2.2, 2.0, 2.3, 2.1, 2.2, 2.2],
    alerts: ["Chemistry below 60", "Assignment rate declining"],
    interventions: ["Chemistry peer tutoring", "Weekly assignment check-ins"],
    strengths: ["English"], weaknesses: ["Chemistry", "Physics"],
    dropoutRisk: 18,
  },
];

const AI_INSIGHTS = [
  "Students who review material within 24 hours perform 18% better on assessments.",
  "Low study frequency (< 2 hrs/week) correlates with 40% higher academic risk.",
  "Attendance below 80% is the strongest single predictor of course failure.",
  "Comprehension scores below 55% predict exam failure with 78% accuracy.",
  "Students using spaced repetition improve retention by 23% on average.",
];

// ── Utility helpers ───────────────────────────────────────────────────────────
const riskColor = (score) => {
  if (score <= 30) return { text: "#22d3a3", bg: "rgba(34,211,163,0.12)", label: "Low Risk" };
  if (score <= 60) return { text: "#f59e0b", bg: "rgba(245,158,11,0.12)", label: "Moderate" };
  return { text: "#f43f5e", bg: "rgba(244,63,94,0.12)", label: "High Risk" };
};

const subjectColor = (score) => {
  if (score >= 75) return "#22d3a3";
  if (score >= 60) return "#f59e0b";
  return "#f43f5e";
};

// ── Mini sparkline (pure SVG) ─────────────────────────────────────────────────
function Sparkline({ data, color = "#22d3a3", height = 36 }) {
  const w = 100, h = height;
  const min = Math.min(...data), max = Math.max(...data);
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / (max - min || 1)) * (h - 4) - 2;
    return `${x},${y}`;
  }).join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} style={{ width: "100%", height }} preserveAspectRatio="none">
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
      <polyline points={`0,${h} ${pts} ${w},${h}`} fill={color} fillOpacity="0.08" stroke="none" />
    </svg>
  );
}

// ── Risk Gauge ────────────────────────────────────────────────────────────────
function RiskGauge({ score, size = 120 }) {
  const { text: color, label } = riskColor(score);
  const r = size * 0.38, cx = size / 2, cy = size / 2;
  const angle = (score / 100) * 180 - 90;
  const rad = (angle * Math.PI) / 180;
  const needleX = cx + r * 0.78 * Math.cos(rad);
  const needleY = cy + r * 0.78 * Math.sin(rad);
  const arc = (pct, col) => {
    const a1 = -180, a2 = a1 + pct * 180;
    const r1 = (a1 * Math.PI) / 180, r2 = (a2 * Math.PI) / 180;
    const x1 = cx + r * Math.cos(r1), y1 = cy + r * Math.sin(r1);
    const x2 = cx + r * Math.cos(r2), y2 = cy + r * Math.sin(r2);
    const lg = pct > 0.5 ? 1 : 0;
    return <path d={`M${x1},${y1} A${r},${r} 0 ${lg},1 ${x2},${y2}`} fill="none" stroke={col} strokeWidth="8" strokeLinecap="round" />;
  };
  return (
    <svg width={size} height={size * 0.65} viewBox={`0 0 ${size} ${size * 0.65}`}>
      {arc(1, "rgba(255,255,255,0.06)")}
      {arc(score / 100, color)}
      <line x1={cx} y1={cy} x2={needleX} y2={needleY} stroke={color} strokeWidth="2.5" strokeLinecap="round" />
      <circle cx={cx} cy={cy} r="4" fill={color} />
      <text x={cx} y={cy - 14} textAnchor="middle" fill={color} fontSize="18" fontWeight="700" fontFamily="Syne">{score}</text>
      <text x={cx} y={cy - 2} textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="8" fontFamily="DM Sans">{label}</text>
    </svg>
  );
}

// ── Bar chart (inline SVG) ────────────────────────────────────────────────────
function SubjectBars({ subjects, predicted }) {
  const entries = Object.entries(subjects);
  const barH = 18, gap = 10, pad = 8;
  const totalH = entries.length * (barH + gap) + pad;
  return (
    <svg width="100%" height={totalH} viewBox={`0 0 260 ${totalH}`} preserveAspectRatio="none">
      {entries.map(([subj, score], i) => {
        const y = pad / 2 + i * (barH + gap);
        const pred = predicted[subj];
        const col = subjectColor(score);
        return (
          <g key={subj}>
            <text x="0" y={y + barH - 5} fill="rgba(255,255,255,0.5)" fontSize="9" fontFamily="DM Sans">{subj}</text>
            <rect x="70" y={y} width={Math.max(1, (score / 100) * 165)} height={barH} rx="3" fill={col} fillOpacity="0.7" />
            <rect x={70 + (score / 100) * 165} y={y} width={Math.max(1, ((pred - score) / 100) * 165)} height={barH} rx="3" fill={col} fillOpacity="0.25" />
            <text x="240" y={y + barH - 5} fill={col} fontSize="9" fontWeight="700" fontFamily="DM Sans">{score}%</text>
          </g>
        );
      })}
    </svg>
  );
}

// ── Donut ─────────────────────────────────────────────────────────────────────
function Donut({ pct, color, label, size = 70 }) {
  const r = 26, cx = size / 2, cy = size / 2, circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="6" />
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth="6"
        strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
        transform={`rotate(-90 ${cx} ${cy})`} />
      <text x={cx} y={cy + 4} textAnchor="middle" fill={color} fontSize="12" fontWeight="700" fontFamily="Syne">{pct}%</text>
      <text x={cx} y={cy + 14} textAnchor="middle" fill="rgba(255,255,255,0.35)" fontSize="6" fontFamily="DM Sans">{label}</text>
    </svg>
  );
}

// ── Student Card ──────────────────────────────────────────────────────────────
function StudentCard({ student, onClick, selected }) {
  const { text: col, bg, label } = riskColor(student.riskScore);
  return (
    <div onClick={() => onClick(student)} style={{
      background: selected ? "rgba(34,211,163,0.08)" : "rgba(255,255,255,0.03)",
      border: selected ? "1px solid rgba(34,211,163,0.4)" : "1px solid rgba(255,255,255,0.07)",
      borderRadius: 14, padding: "14px 16px", cursor: "pointer",
      transition: "all 0.2s", marginBottom: 8,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{
          width: 38, height: 38, borderRadius: "50%", background: bg,
          border: `2px solid ${col}`, display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 12, fontWeight: 700, color: col, fontFamily: "Syne", flexShrink: 0,
        }}>{student.avatar}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#fff", fontFamily: "Syne", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{student.name}</div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 1 }}>Quiz avg {student.quizAvg}% · {student.studyHours}h/wk</div>
        </div>
        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: col, fontFamily: "Syne", lineHeight: 1 }}>{student.riskScore}</div>
          <div style={{ fontSize: 9, color: col, marginTop: 2 }}>{label}</div>
        </div>
      </div>
      {student.alerts.length > 0 && (
        <div style={{ marginTop: 8, fontSize: 10, color: "#f59e0b", background: "rgba(245,158,11,0.08)", borderRadius: 6, padding: "4px 8px" }}>
          ⚠ {student.alerts[0]}
        </div>
      )}
      <div style={{ marginTop: 8, height: 28 }}>
        <Sparkline data={student.trend} color={col} height={28} />
      </div>
    </div>
  );
}

// ── Stat Pill ─────────────────────────────────────────────────────────────────
function StatPill({ label, value, color = "#22d3a3", sub }) {
  return (
    <div style={{
      background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: 12, padding: "14px 18px", flex: 1, minWidth: 120,
    }}>
      <div style={{ fontSize: 22, fontWeight: 800, color, fontFamily: "Syne" }}>{value}</div>
      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", marginTop: 2 }}>{label}</div>
      {sub && <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

// ── Main App ──────────────────────────────────────────────────────────────────
export default function PathPilot() {
  const [view, setView] = useState("teacher"); // "teacher" | "student"
  const [selectedStudent, setSelectedStudent] = useState(STUDENTS[1]);
  const [insightIdx, setInsightIdx] = useState(0);
  const [animIn, setAnimIn] = useState(true);

  useEffect(() => {
    const t = setInterval(() => {
      setInsightIdx(i => (i + 1) % AI_INSIGHTS.length);
    }, 4000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    setAnimIn(false);
    const t = setTimeout(() => setAnimIn(true), 50);
    return () => clearTimeout(t);
  }, [selectedStudent]);

  const atRisk = STUDENTS.filter(s => s.riskScore > 60).length;
  const moderate = STUDENTS.filter(s => s.riskScore > 30 && s.riskScore <= 60).length;
  const avgPred = Math.round(STUDENTS.flatMap(s => Object.values(s.predictedScores)).reduce((a, b) => a + b, 0) / (STUDENTS.length * 5));
  const avgComp = Math.round(STUDENTS.reduce((a, s) => a + s.comprehension, 0) / STUDENTS.length);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #080e1a; }
        ::-webkit-scrollbar { width: 4px; } 
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }
        .nav-btn { transition: all 0.2s; }
        .nav-btn:hover { background: rgba(255,255,255,0.08) !important; }
        .fade-in { animation: fadeUp 0.35s ease forwards; }
        @keyframes fadeUp { from { opacity:0; transform: translateY(12px); } to { opacity:1; transform:none; } }
        .pulse { animation: pulse 2s infinite; }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
        .chip { display:inline-flex; align-items:center; gap:4px; font-size:10px; padding:3px 8px; border-radius:20px; font-family:'DM Sans'; font-weight:500; }
      `}</style>

      <div style={{ fontFamily: "'DM Sans', sans-serif", background: "#080e1a", minHeight: "100vh", color: "#fff" }}>

        {/* ── Header ── */}
        <div style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 56 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 9, background: "linear-gradient(135deg,#22d3a3,#0ea5e9)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>🧭</div>
            <span style={{ fontFamily: "Syne", fontWeight: 800, fontSize: 18, letterSpacing: "-0.5px" }}>PathPilot</span>
            <span style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", marginLeft: 2 }}>Teacher Intelligence Suite · v3</span>
          </div>
          <div style={{ display: "flex", gap: 4 }}>
            {["teacher", "student"].map(v => (
              <button key={v} className="nav-btn" onClick={() => setView(v)} style={{
                background: view === v ? "rgba(34,211,163,0.12)" : "transparent",
                border: view === v ? "1px solid rgba(34,211,163,0.3)" : "1px solid transparent",
                color: view === v ? "#22d3a3" : "rgba(255,255,255,0.45)",
                borderRadius: 8, padding: "6px 14px", fontSize: 12, fontWeight: 600,
                cursor: "pointer", fontFamily: "DM Sans", textTransform: "capitalize",
              }}>{v === "teacher" ? "🏫 Teacher Dashboard" : "👤 Student Profile"}</button>
            ))}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#22d3a3" }} className="pulse" />
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>Live · 10-A · Semester 2</span>
          </div>
        </div>

        {/* ── AI Insight Banner ── */}
        <div style={{ background: "rgba(34,211,163,0.06)", borderBottom: "1px solid rgba(34,211,163,0.1)", padding: "8px 24px", display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 10, fontWeight: 700, color: "#22d3a3", fontFamily: "Syne", letterSpacing: 1 }}>AI INSIGHT</span>
          <span style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", transition: "opacity 0.5s" }}>{AI_INSIGHTS[insightIdx]}</span>
        </div>

        {view === "teacher" ? (
          <TeacherDashboard students={STUDENTS} atRisk={atRisk} moderate={moderate} avgPred={avgPred} avgComp={avgComp} onSelect={(s) => { setSelectedStudent(s); setView("student"); }} />
        ) : (
          <StudentDashboard student={selectedStudent} animIn={animIn} onBack={() => setView("teacher")} onSelect={setSelectedStudent} />
        )}
      </div>
    </>
  );
}

// ── Teacher Dashboard ─────────────────────────────────────────────────────────
function TeacherDashboard({ students, atRisk, moderate, avgPred, avgComp, onSelect }) {
  const [sortBy, setSortBy] = useState("risk");
  const sorted = [...students].sort((a, b) => sortBy === "risk" ? b.riskScore - a.riskScore : a.name.localeCompare(b.name));

  const subjectRisk = ["Biology", "Chemistry", "Physics", "Math", "English"].map(subj => ({
    subj,
    avg: Math.round(students.reduce((a, s) => a + s.subjects[subj], 0) / students.length),
    atRisk: students.filter(s => s.subjects[subj] < 60).length,
  })).sort((a, b) => a.avg - b.avg);

  return (
    <div style={{ padding: 24, display: "grid", gridTemplateColumns: "320px 1fr", gap: 20, maxHeight: "calc(100vh - 100px)", overflow: "hidden" }}>

      {/* LEFT: Student list */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16, overflow: "hidden" }}>
        {/* Sort */}
        <div style={{ display: "flex", gap: 6 }}>
          {["risk", "name"].map(s => (
            <button key={s} onClick={() => setSortBy(s)} style={{
              background: sortBy === s ? "rgba(34,211,163,0.1)" : "rgba(255,255,255,0.04)",
              border: sortBy === s ? "1px solid rgba(34,211,163,0.3)" : "1px solid rgba(255,255,255,0.07)",
              color: sortBy === s ? "#22d3a3" : "rgba(255,255,255,0.4)",
              borderRadius: 7, padding: "5px 12px", fontSize: 11, cursor: "pointer", fontFamily: "DM Sans",
            }}>Sort by {s === "risk" ? "⚠ Risk" : "Name"}</button>
          ))}
        </div>
        <div style={{ overflowY: "auto", flex: 1, paddingRight: 4 }}>
          {sorted.map(s => <StudentCard key={s.id} student={s} onClick={onSelect} selected={false} />)}
        </div>
      </div>

      {/* RIGHT: Analytics */}
      <div style={{ overflowY: "auto", display: "flex", flexDirection: "column", gap: 16 }}>

        {/* Stats row */}
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <StatPill label="Total Students" value={students.length} color="#22d3a3" />
          <StatPill label="High Risk" value={atRisk} color="#f43f5e" sub="need intervention" />
          <StatPill label="Moderate Risk" value={moderate} color="#f59e0b" sub="watch closely" />
          <StatPill label="Avg Predicted Score" value={`${avgPred}%`} color="#0ea5e9" />
          <StatPill label="Avg Comprehension" value={`${avgComp}%`} color="#a78bfa" />
        </div>

        {/* Risk distribution */}
        <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, padding: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 700, fontFamily: "Syne", marginBottom: 16 }}>Class Risk Distribution</div>
          <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
            <div style={{ display: "flex", gap: 16 }}>
              {[
                { label: "Low Risk", count: students.filter(s => s.riskScore <= 30).length, color: "#22d3a3" },
                { label: "Moderate", count: students.filter(s => s.riskScore > 30 && s.riskScore <= 60).length, color: "#f59e0b" },
                { label: "High Risk", count: students.filter(s => s.riskScore > 60).length, color: "#f43f5e" },
              ].map(({ label, count, color }) => (
                <div key={label} style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 28, fontWeight: 800, color, fontFamily: "Syne" }}>{count}</div>
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>{label}</div>
                  <div style={{ fontSize: 10, color }}>({Math.round(count / students.length * 100)}%)</div>
                </div>
              ))}
            </div>
            {/* Visual bar */}
            <div style={{ flex: 1 }}>
              <div style={{ height: 16, borderRadius: 8, overflow: "hidden", display: "flex" }}>
                {[
                  { pct: students.filter(s => s.riskScore <= 30).length / students.length, color: "#22d3a3" },
                  { pct: students.filter(s => s.riskScore > 30 && s.riskScore <= 60).length / students.length, color: "#f59e0b" },
                  { pct: students.filter(s => s.riskScore > 60).length / students.length, color: "#f43f5e" },
                ].map(({ pct, color }, i) => (
                  <div key={i} style={{ width: `${pct * 100}%`, background: color, opacity: 0.8 }} />
                ))}
              </div>
              <div style={{ marginTop: 8, fontSize: 11, color: "rgba(255,255,255,0.4)" }}>
                {Math.round(atRisk / students.length * 100)}% of class at high academic risk
              </div>
            </div>
          </div>
        </div>

        {/* Subject risk table */}
        <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, padding: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 700, fontFamily: "Syne", marginBottom: 4 }}>Subject Difficulty Rankings</div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginBottom: 16 }}>Sorted by class average ↑</div>
          {subjectRisk.map(({ subj, avg, atRisk: ar }) => (
            <div key={subj} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
              <div style={{ width: 70, fontSize: 12, color: "rgba(255,255,255,0.6)" }}>{subj}</div>
              <div style={{ flex: 1, height: 8, background: "rgba(255,255,255,0.06)", borderRadius: 4, overflow: "hidden" }}>
                <div style={{ width: `${avg}%`, height: "100%", background: subjectColor(avg), borderRadius: 4, transition: "width 1s ease" }} />
              </div>
              <div style={{ width: 36, fontSize: 12, fontWeight: 700, color: subjectColor(avg), fontFamily: "Syne" }}>{avg}%</div>
              {ar > 0 && <span className="chip" style={{ background: "rgba(244,63,94,0.12)", color: "#f43f5e", border: "1px solid rgba(244,63,94,0.2)" }}>⚠ {ar} at-risk</span>}
            </div>
          ))}
        </div>

        {/* Intervention queue */}
        <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, padding: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 700, fontFamily: "Syne", marginBottom: 16 }}>🚨 Priority Interventions</div>
          {students.filter(s => s.riskScore > 50).sort((a, b) => b.riskScore - a.riskScore).map(s => (
            <div key={s.id} style={{ marginBottom: 14, paddingBottom: 14, borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                <div style={{ fontSize: 12, fontWeight: 600, fontFamily: "Syne", color: "#fff" }}>{s.name}</div>
                <span className="chip" style={{ background: riskColor(s.riskScore).bg, color: riskColor(s.riskScore).text, border: `1px solid ${riskColor(s.riskScore).text}33` }}>
                  Risk {s.riskScore}
                </span>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {s.interventions.slice(0, 2).map((inv, i) => (
                  <span key={i} className="chip" style={{ background: "rgba(14,165,233,0.1)", color: "#38bdf8", border: "1px solid rgba(14,165,233,0.2)" }}>
                    💡 {inv}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Dropout risk */}
        <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, padding: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 700, fontFamily: "Syne", marginBottom: 4 }}>Dropout Risk Indicator</div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginBottom: 16 }}>Predictive probability based on attendance + performance trends</div>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            {students.map(s => (
              <div key={s.id} style={{ textAlign: "center" }}>
                <Donut pct={s.dropoutRisk} color={s.dropoutRisk > 40 ? "#f43f5e" : s.dropoutRisk > 15 ? "#f59e0b" : "#22d3a3"} label="dropout" size={64} />
                <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", marginTop: 2, width: 64 }}>{s.name.split(" ")[0]}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Student Dashboard ─────────────────────────────────────────────────────────
function StudentDashboard({ student, animIn, onBack, onSelect }) {
  const { text: rCol } = riskColor(student.riskScore);

  return (
    <div className={animIn ? "fade-in" : ""} style={{ padding: 24, display: "grid", gridTemplateColumns: "260px 1fr", gap: 20, maxHeight: "calc(100vh - 100px)", overflow: "hidden" }}>

      {/* LEFT: Profile sidebar */}
      <div style={{ display: "flex", flexDirection: "column", gap: 14, overflowY: "auto" }}>
        <button onClick={onBack} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, padding: "6px 12px", fontSize: 11, color: "rgba(255,255,255,0.5)", cursor: "pointer", textAlign: "left" }}>← Back to class</button>

        {/* Student switcher */}
        <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", fontWeight: 600, letterSpacing: 1 }}>SELECT STUDENT</div>
        {STUDENTS.map(s => (
          <div key={s.id} onClick={() => onSelect(s)} style={{
            display: "flex", alignItems: "center", gap: 10, cursor: "pointer",
            background: s.id === student.id ? "rgba(34,211,163,0.08)" : "rgba(255,255,255,0.02)",
            border: s.id === student.id ? "1px solid rgba(34,211,163,0.3)" : "1px solid transparent",
            borderRadius: 10, padding: "8px 12px", transition: "all 0.2s",
          }}>
            <div style={{ width: 28, height: 28, borderRadius: "50%", background: riskColor(s.riskScore).bg, border: `1.5px solid ${riskColor(s.riskScore).text}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 700, color: riskColor(s.riskScore).text, fontFamily: "Syne" }}>{s.avatar}</div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, color: "#fff", fontFamily: "Syne" }}>{s.name}</div>
              <div style={{ fontSize: 9, color: riskColor(s.riskScore).text }}>Risk: {s.riskScore}</div>
            </div>
          </div>
        ))}
      </div>

      {/* RIGHT: Student detail */}
      <div style={{ overflowY: "auto", display: "flex", flexDirection: "column", gap: 16 }}>

        {/* Header card */}
        <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, padding: 20, display: "flex", gap: 24, alignItems: "center" }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ width: 60, height: 60, borderRadius: "50%", background: riskColor(student.riskScore).bg, border: `3px solid ${rCol}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, fontWeight: 800, color: rCol, fontFamily: "Syne", margin: "0 auto 8px" }}>{student.avatar}</div>
            <div style={{ fontSize: 16, fontWeight: 800, fontFamily: "Syne" }}>{student.name}</div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>Grade {student.grade}</div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <RiskGauge score={student.riskScore} size={130} />
          </div>

          <div style={{ flex: 1, display: "flex", flexWrap: "wrap", gap: 12 }}>
            {[
              { label: "Quiz Average", value: `${student.quizAvg}%`, color: subjectColor(student.quizAvg) },
              { label: "Study Hours/wk", value: `${student.studyHours}h`, color: student.studyHours < 2 ? "#f43f5e" : "#22d3a3" },
              { label: "Comprehension", value: `${student.comprehension}%`, color: subjectColor(student.comprehension) },
              { label: "Attendance", value: `${student.attendance}%`, color: student.attendance < 80 ? "#f43f5e" : "#22d3a3" },
              { label: "Assignment Rate", value: `${student.assignmentRate}%`, color: subjectColor(student.assignmentRate) },
              { label: "Dropout Risk", value: `${student.dropoutRisk}%`, color: student.dropoutRisk > 30 ? "#f43f5e" : "#22d3a3" },
            ].map(({ label, value, color }) => (
              <div key={label} style={{ background: "rgba(255,255,255,0.04)", borderRadius: 10, padding: "8px 14px", minWidth: 100 }}>
                <div style={{ fontSize: 18, fontWeight: 800, color, fontFamily: "Syne" }}>{value}</div>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", marginTop: 1 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Alerts */}
        {student.alerts.length > 0 && (
          <div style={{ background: "rgba(244,63,94,0.06)", border: "1px solid rgba(244,63,94,0.2)", borderRadius: 14, padding: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#f43f5e", fontFamily: "Syne", marginBottom: 10 }}>🚨 Active Alerts</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {student.alerts.map((a, i) => (
                <div key={i} style={{ fontSize: 12, color: "rgba(255,255,255,0.7)", padding: "6px 10px", background: "rgba(244,63,94,0.08)", borderRadius: 8, borderLeft: "3px solid #f43f5e" }}>{a}</div>
              ))}
            </div>
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          {/* Subject performance */}
          <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, padding: 18 }}>
            <div style={{ fontSize: 13, fontWeight: 700, fontFamily: "Syne", marginBottom: 4 }}>Subject Performance</div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", marginBottom: 14 }}>Current · Predicted (faded extension)</div>
            <SubjectBars subjects={student.subjects} predicted={student.predictedScores} />
          </div>

          {/* Performance trend */}
          <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, padding: 18 }}>
            <div style={{ fontSize: 13, fontWeight: 700, fontFamily: "Syne", marginBottom: 4 }}>Performance Trend</div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", marginBottom: 14 }}>Last 8 weeks (quiz avg)</div>
            <Sparkline data={student.trend} color={rCol} height={80} />
            <div style={{ marginTop: 12 }}>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", marginBottom: 8 }}>Study Activity (hours/wk)</div>
              <Sparkline data={student.studyTrend} color="#0ea5e9" height={50} />
            </div>
          </div>
        </div>

        {/* Predicted scores */}
        <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, padding: 18 }}>
          <div style={{ fontSize: 13, fontWeight: 700, fontFamily: "Syne", marginBottom: 4 }}>Predicted Exam Scores</div>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", marginBottom: 16 }}>AI prediction based on quiz trend, comprehension & study activity</div>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            {Object.entries(student.predictedScores).map(([subj, score]) => (
              <div key={subj} style={{ background: "rgba(255,255,255,0.04)", borderRadius: 12, padding: "12px 16px", minWidth: 120, borderTop: `3px solid ${subjectColor(score)}` }}>
                <div style={{ fontSize: 20, fontWeight: 800, color: subjectColor(score), fontFamily: "Syne" }}>{score}%</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", marginTop: 2 }}>{subj}</div>
                {score < 60 && <div style={{ fontSize: 9, color: "#f43f5e", marginTop: 4 }}>⚠ Below passing</div>}
              </div>
            ))}
          </div>
        </div>

        {/* Strengths & weaknesses + Interventions */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, padding: 18 }}>
            <div style={{ fontSize: 13, fontWeight: 700, fontFamily: "Syne", marginBottom: 12 }}>Learning Profile</div>
            {student.strengths.length > 0 && (
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 10, color: "#22d3a3", fontWeight: 600, marginBottom: 6 }}>STRENGTHS</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {student.strengths.map(s => <span key={s} className="chip" style={{ background: "rgba(34,211,163,0.1)", color: "#22d3a3", border: "1px solid rgba(34,211,163,0.2)" }}>✓ {s}</span>)}
                </div>
              </div>
            )}
            {student.weaknesses.length > 0 && (
              <div>
                <div style={{ fontSize: 10, color: "#f43f5e", fontWeight: 600, marginBottom: 6 }}>NEEDS SUPPORT</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {student.weaknesses.map(s => <span key={s} className="chip" style={{ background: "rgba(244,63,94,0.1)", color: "#f43f5e", border: "1px solid rgba(244,63,94,0.2)" }}>✗ {s}</span>)}
                </div>
              </div>
            )}
            {student.strengths.length === 0 && student.weaknesses.length === 0 && (
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>Balanced across all subjects</div>
            )}
          </div>

          <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, padding: 18 }}>
            <div style={{ fontSize: 13, fontWeight: 700, fontFamily: "Syne", marginBottom: 12 }}>💡 Recommended Interventions</div>
            {student.interventions.length > 0
              ? student.interventions.map((inv, i) => (
                <div key={i} style={{ fontSize: 11, color: "rgba(255,255,255,0.65)", padding: "7px 10px", background: "rgba(14,165,233,0.06)", borderRadius: 8, marginBottom: 6, borderLeft: "3px solid #0ea5e9" }}>{inv}</div>
              ))
              : <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>No interventions needed. Student is on track.</div>
            }
          </div>
        </div>
      </div>
    </div>
  );
}
