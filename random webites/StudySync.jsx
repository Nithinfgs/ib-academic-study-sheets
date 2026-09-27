import { useState, useEffect, useRef } from "react";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis } from "recharts";

// ─── DEMO DATA ────────────────────────────────────────────────────────────────
const DEMO_SESSIONS = [
  { id: 1, student: "Arjun", subject: "Biology", topic: "Photosynthesis", duration: 45, difficulty: "Medium", understanding: 75, date: "2025-03-24", time: "10:00" },
  { id: 2, student: "Arjun", subject: "Chemistry", topic: "Reaction Balancing", duration: 60, difficulty: "Hard", understanding: 40, date: "2025-03-24", time: "21:30" },
  { id: 3, student: "Arjun", subject: "Math", topic: "Calculus", duration: 35, difficulty: "Medium", understanding: 80, date: "2025-03-25", time: "09:15" },
  { id: 4, student: "Arjun", subject: "Biology", topic: "Cell Respiration", duration: 40, difficulty: "Easy", understanding: 85, date: "2025-03-25", time: "14:00" },
  { id: 5, student: "Arjun", subject: "Chemistry", topic: "Organic Chemistry", duration: 55, difficulty: "Hard", understanding: 35, date: "2025-03-26", time: "20:00" },
  { id: 6, student: "Arjun", subject: "Physics", topic: "Thermodynamics", duration: 30, difficulty: "Medium", understanding: 70, date: "2025-03-26", time: "11:00" },
  { id: 7, student: "Arjun", subject: "Math", topic: "Statistics", duration: 38, difficulty: "Easy", understanding: 90, date: "2025-03-27", time: "08:30" },
  { id: 8, student: "Arjun", subject: "Biology", topic: "DNA Replication", duration: 42, difficulty: "Medium", understanding: 65, date: "2025-03-27", time: "15:00" },
];

const CLASS_DATA = [
  { name: "Arjun", studyTime: 42, retention: 67, engagement: 88, chemistry: 38, biology: 75, math: 85, physics: 70 },
  { name: "Meera", studyTime: 38, retention: 72, engagement: 76, chemistry: 55, biology: 80, math: 70, physics: 65 },
  { name: "Ravi", studyTime: 55, retention: 58, engagement: 92, chemistry: 30, biology: 65, math: 78, physics: 60 },
  { name: "Priya", studyTime: 29, retention: 81, engagement: 65, chemistry: 45, biology: 88, math: 92, physics: 75 },
  { name: "Kiran", studyTime: 47, retention: 63, engagement: 80, chemistry: 42, biology: 72, math: 68, physics: 55 },
];

const RETENTION_DATA = [
  { topic: "Photosynthesis", retention: 82, subject: "Biology", lastStudied: "1 day ago" },
  { topic: "Cell Respiration", retention: 64, subject: "Biology", lastStudied: "2 days ago" },
  { topic: "DNA Replication", retention: 47, subject: "Biology", lastStudied: "1 day ago" },
  { topic: "Calculus", retention: 78, subject: "Math", lastStudied: "2 days ago" },
  { topic: "Statistics", retention: 91, subject: "Math", lastStudied: "Today" },
  { topic: "Reaction Balancing", retention: 31, subject: "Chemistry", lastStudied: "3 days ago" },
  { topic: "Organic Chemistry", retention: 28, subject: "Chemistry", lastStudied: "2 days ago" },
  { topic: "Thermodynamics", retention: 65, subject: "Physics", lastStudied: "2 days ago" },
];

const SCHEDULE = [
  { day: "Monday", sessions: [{ subject: "Biology", duration: 40, color: "#4ade80" }, { type: "break", duration: 10 }, { subject: "Math", duration: 30, color: "#60a5fa" }] },
  { day: "Tuesday", sessions: [{ subject: "Physics", duration: 35, color: "#f472b6" }, { type: "break", duration: 10 }, { subject: "Biology", duration: 25, color: "#4ade80" }] },
  { day: "Wednesday", sessions: [{ subject: "Chemistry", duration: 30, color: "#fb923c" }, { type: "break", duration: 15 }, { subject: "Math", duration: 40, color: "#60a5fa" }] },
  { day: "Thursday", sessions: [{ subject: "Biology", duration: 45, color: "#4ade80" }] },
  { day: "Friday", sessions: [{ subject: "Chemistry", duration: 25, color: "#fb923c" }, { type: "break", duration: 10 }, { subject: "Physics", duration: 30, color: "#f472b6" }] },
];

const SUBJECT_COLORS = { Biology: "#4ade80", Math: "#60a5fa", Chemistry: "#fb923c", Physics: "#f472b6" };

// ─── WEEKLY PROGRESS DATA ────────────────────────────────────────────────────
const PROGRESS_DATA = [
  { day: "Mon", Biology: 45, Math: 30, Chemistry: 0, Physics: 0 },
  { day: "Tue", Biology: 40, Math: 0, Chemistry: 60, Physics: 30 },
  { day: "Wed", Biology: 0, Math: 35, Chemistry: 55, Physics: 0 },
  { day: "Thu", Biology: 42, Math: 38, Chemistry: 0, Physics: 0 },
  { day: "Fri", Biology: 0, Math: 0, Chemistry: 25, Physics: 30 },
  { day: "Sat", Biology: 50, Math: 40, Chemistry: 0, Physics: 35 },
  { day: "Sun", Biology: 25, Math: 30, Chemistry: 0, Physics: 0 },
];

// ─── SUBJECT PIE DATA ─────────────────────────────────────────────────────────
const PIE_DATA = [
  { name: "Biology", value: 172, color: "#4ade80" },
  { name: "Chemistry", value: 115, color: "#fb923c" },
  { name: "Math", value: 143, color: "#60a5fa" },
  { name: "Physics", value: 60, color: "#f472b6" },
];

// ─── UNDERSTANDING TREND ─────────────────────────────────────────────────────
const UNDERSTANDING_TREND = [
  { date: "Mar 20", understanding: 62 },
  { date: "Mar 21", understanding: 58 },
  { date: "Mar 22", understanding: 70 },
  { date: "Mar 23", understanding: 65 },
  { date: "Mar 24", understanding: 58 },
  { date: "Mar 25", understanding: 72 },
  { date: "Mar 26", understanding: 68 },
  { date: "Mar 27", understanding: 75 },
];

// ─── HELPERS ─────────────────────────────────────────────────────────────────
function RetentionBadge({ score }) {
  const color = score >= 75 ? "#4ade80" : score >= 50 ? "#fbbf24" : "#f87171";
  const label = score >= 75 ? "Strong" : score >= 50 ? "Fading" : "Review Now";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <div style={{ width: 36, height: 36, borderRadius: "50%", background: `conic-gradient(${color} ${score * 3.6}deg, #1e293b 0deg)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 700, color }}>
        {score}
      </div>
      <span style={{ fontSize: 11, color, fontFamily: "Space Mono, monospace" }}>{label}</span>
    </div>
  );
}

function StatCard({ label, value, sub, accent }) {
  return (
    <div style={{ background: "#0f1629", border: `1px solid ${accent}22`, borderRadius: 12, padding: "16px 20px", flex: 1, minWidth: 120 }}>
      <div style={{ fontSize: 22, fontWeight: 800, color: accent, fontFamily: "Space Mono, monospace" }}>{value}</div>
      <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>{label}</div>
      {sub && <div style={{ fontSize: 11, color: "#475569", marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

// ─── STUDY LOG MODAL ──────────────────────────────────────────────────────────
function StudyLogModal({ onClose, onSave }) {
  const [form, setForm] = useState({ subject: "Biology", topic: "", duration: 30, difficulty: "Medium", understanding: 70 });
  const subjects = ["Biology", "Math", "Chemistry", "Physics"];
  return (
    <div style={{ position: "fixed", inset: 0, background: "#00000099", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={onClose}>
      <div style={{ background: "#0d1526", border: "1px solid #1e40af44", borderRadius: 16, padding: 28, width: 380, maxWidth: "90vw" }} onClick={e => e.stopPropagation()}>
        <div style={{ fontFamily: "Space Mono, monospace", fontSize: 16, color: "#93c5fd", marginBottom: 20, fontWeight: 700 }}>Log Study Session</div>
        {[
          { label: "Subject", key: "subject", type: "select", opts: subjects },
          { label: "Topic", key: "topic", type: "text", placeholder: "e.g. Photosynthesis" },
          { label: "Duration (min)", key: "duration", type: "number" },
          { label: "Difficulty", key: "difficulty", type: "select", opts: ["Easy", "Medium", "Hard"] },
          { label: `Understanding: ${form.understanding}%`, key: "understanding", type: "range", min: 0, max: 100 },
        ].map(f => (
          <div key={f.key} style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 11, color: "#64748b", marginBottom: 5, textTransform: "uppercase", letterSpacing: 1 }}>{f.label}</div>
            {f.type === "select" ? (
              <select value={form[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                style={{ width: "100%", background: "#0a0f1e", border: "1px solid #1e3a5f", borderRadius: 8, padding: "8px 12px", color: "#e2e8f0", fontSize: 13 }}>
                {f.opts.map(o => <option key={o}>{o}</option>)}
              </select>
            ) : f.type === "range" ? (
              <input type="range" min={f.min} max={f.max} value={form[f.key]}
                onChange={e => setForm(p => ({ ...p, [f.key]: Number(e.target.value) }))}
                style={{ width: "100%", accentColor: "#3b82f6" }} />
            ) : (
              <input type={f.type} value={form[f.key]} placeholder={f.placeholder}
                onChange={e => setForm(p => ({ ...p, [f.key]: f.type === "number" ? Number(e.target.value) : e.target.value }))}
                style={{ width: "100%", background: "#0a0f1e", border: "1px solid #1e3a5f", borderRadius: 8, padding: "8px 12px", color: "#e2e8f0", fontSize: 13, boxSizing: "border-box" }} />
            )}
          </div>
        ))}
        <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
          <button onClick={onClose} style={{ flex: 1, padding: "10px", background: "#1e293b", border: "none", borderRadius: 8, color: "#94a3b8", cursor: "pointer", fontSize: 13 }}>Cancel</button>
          <button onClick={() => { onSave(form); onClose(); }}
            style={{ flex: 2, padding: "10px", background: "linear-gradient(135deg, #1d4ed8, #3b82f6)", border: "none", borderRadius: 8, color: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 700 }}>
            Save Session
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── AI INSIGHTS PANEL ────────────────────────────────────────────────────────
function AIInsightsPanel({ mode }) {
  const [loading, setLoading] = useState(false);
  const [insights, setInsights] = useState(null);
  const [error, setError] = useState(null);

  const prompt = mode === "student"
    ? `You are StudySync AI, an intelligent study optimization assistant. A student named Arjun has these recent study sessions:
- Biology (Photosynthesis): 45 min, understanding 75%, evening
- Chemistry (Reaction Balancing): 60 min, understanding 40%, 9:30 PM
- Math (Calculus): 35 min, understanding 80%, morning
- Biology (Cell Respiration): 40 min, understanding 85%, afternoon  
- Chemistry (Organic Chemistry): 55 min, understanding 35%, 8 PM
- Physics (Thermodynamics): 30 min, understanding 70%, morning
- Math (Statistics): 38 min, understanding 90%, 8:30 AM

Retention scores: Photosynthesis 82%, Cell Respiration 64%, DNA Replication 47%, Calculus 78%, Reaction Balancing 31%, Organic Chemistry 28%.

Provide 4 personalized, specific, actionable study insights as a JSON array. Each insight should have: "icon" (emoji), "title" (short, punchy), "detail" (1-2 sentence actionable advice). Focus on timing patterns, subject difficulty, retention gaps, and optimal session length. Be specific and data-driven. Return ONLY valid JSON, no markdown.`
    : `You are StudySync AI, a teaching intelligence assistant. Here is class study data:
- Arjun: Avg 42 min/session, Chemistry 38% understanding, Biology 75%, Math 85%
- Meera: Avg 38 min/session, Chemistry 55%, Biology 80%, Math 70%
- Ravi: Avg 55 min/session, Chemistry 30%, Biology 65%, Math 78%
- Priya: Avg 29 min/session, Chemistry 45%, Biology 88%, Math 92%
- Kiran: Avg 47 min/session, Chemistry 42%, Biology 72%, Math 68%

Class avg retention: 67%. Chemistry avg understanding: 42%. Biology avg: 76%. Math avg: 79%.

Provide 4 specific teaching insights as a JSON array. Each should have: "icon" (emoji), "title" (short), "detail" (actionable recommendation for the teacher). Focus on struggling subjects, at-risk students, intervention strategies. Return ONLY valid JSON, no markdown.`;

  const generate = async () => {
    setLoading(true); setError(null); setInsights(null);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [{ role: "user", content: prompt }]
        })
      });
      const data = await res.json();
      const text = data.content?.map(b => b.text || "").join("") || "";
      const clean = text.replace(/```json|```/g, "").trim();
      setInsights(JSON.parse(clean));
    } catch (e) {
      setError("Could not generate insights. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div style={{ background: "#080e1d", border: "1px solid #1e3a5f", borderRadius: 16, padding: 20 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <div>
          <div style={{ fontFamily: "Space Mono, monospace", fontSize: 13, color: "#93c5fd", fontWeight: 700 }}>🤖 AI Learning Insights</div>
          <div style={{ fontSize: 11, color: "#475569", marginTop: 2 }}>Powered by Claude</div>
        </div>
        <button onClick={generate} disabled={loading}
          style={{ background: loading ? "#1e293b" : "linear-gradient(135deg,#1d4ed8,#7c3aed)", border: "none", borderRadius: 8, padding: "8px 16px", color: loading ? "#475569" : "#fff", fontSize: 12, cursor: loading ? "not-allowed" : "pointer", fontWeight: 700, transition: "all .2s" }}>
          {loading ? "Analyzing..." : insights ? "Refresh" : "Generate Insights"}
        </button>
      </div>

      {!insights && !loading && !error && (
        <div style={{ textAlign: "center", padding: "24px 0", color: "#334155", fontSize: 13 }}>
          Click "Generate Insights" to get AI-powered analysis of your study patterns
        </div>
      )}

      {loading && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {[1,2,3,4].map(i => (
            <div key={i} style={{ background: "#0d1b33", borderRadius: 10, padding: 14, animation: "pulse 1.5s infinite" }}>
              <div style={{ height: 12, background: "#1e3a5f", borderRadius: 4, width: "40%", marginBottom: 8 }} />
              <div style={{ height: 10, background: "#162035", borderRadius: 4, width: "85%" }} />
              <div style={{ height: 10, background: "#162035", borderRadius: 4, width: "60%", marginTop: 5 }} />
            </div>
          ))}
        </div>
      )}

      {error && <div style={{ color: "#f87171", fontSize: 13, textAlign: "center", padding: 16 }}>{error}</div>}

      {insights && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {insights.map((ins, i) => (
            <div key={i} style={{ background: "#0d1b33", border: "1px solid #1e3a5f44", borderRadius: 10, padding: 14, borderLeft: "3px solid #3b82f6" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
                <span style={{ fontSize: 18 }}>{ins.icon}</span>
                <span style={{ fontFamily: "Space Mono, monospace", fontSize: 12, color: "#93c5fd", fontWeight: 700 }}>{ins.title}</span>
              </div>
              <div style={{ fontSize: 12, color: "#94a3b8", lineHeight: 1.6 }}>{ins.detail}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── STUDENT DASHBOARD ───────────────────────────────────────────────────────
function StudentDashboard({ sessions, setSessions }) {
  const [showLog, setShowLog] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const streak = 7;

  const avgUnderstanding = Math.round(sessions.reduce((s, x) => s + x.understanding, 0) / sessions.length);
  const totalTime = sessions.reduce((s, x) => s + x.duration, 0);
  const lowRetention = RETENTION_DATA.filter(r => r.retention < 50);

  const tabs = ["overview", "history", "retention", "schedule"];

  return (
    <div style={{ minHeight: "100vh", background: "#060c1a", color: "#e2e8f0", fontFamily: "Inter, sans-serif" }}>
      {showLog && <StudyLogModal onClose={() => setShowLog(false)} onSave={f => setSessions(p => [...p, { ...f, id: Date.now(), student: "Arjun", date: new Date().toISOString().split("T")[0], time: new Date().toTimeString().slice(0,5) }])} />}

      {/* Header */}
      <div style={{ background: "#080e1d", borderBottom: "1px solid #1e293b", padding: "0 28px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 60 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ fontSize: 20, fontWeight: 900, fontFamily: "Space Mono, monospace", color: "#3b82f6", letterSpacing: -1 }}>StudySync</div>
            <span style={{ fontSize: 10, background: "#1e3a5f", color: "#93c5fd", padding: "2px 8px", borderRadius: 20, fontFamily: "Space Mono, monospace" }}>STUDENT</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, background: "#0d1b33", padding: "6px 12px", borderRadius: 20, border: "1px solid #fb923c33" }}>
              <span style={{ fontSize: 14 }}>🔥</span>
              <span style={{ fontSize: 13, color: "#fb923c", fontFamily: "Space Mono, monospace", fontWeight: 700 }}>{streak} day streak</span>
            </div>
            <div style={{ width: 34, height: 34, borderRadius: "50%", background: "linear-gradient(135deg,#1d4ed8,#7c3aed)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700 }}>A</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 0, borderTop: "1px solid #0f172a" }}>
          {tabs.map(t => (
            <button key={t} onClick={() => setActiveTab(t)}
              style={{ padding: "12px 20px", background: "none", border: "none", color: activeTab === t ? "#3b82f6" : "#475569", fontSize: 13, cursor: "pointer", borderBottom: activeTab === t ? "2px solid #3b82f6" : "2px solid transparent", textTransform: "capitalize", fontWeight: activeTab === t ? 700 : 400, transition: "all .2s" }}>
              {t}
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding: "24px 28px", maxWidth: 1100, margin: "0 auto" }}>

        {activeTab === "overview" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {/* Stat row */}
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <StatCard label="Total Study Time" value={`${totalTime}m`} sub="This week" accent="#60a5fa" />
              <StatCard label="Avg Understanding" value={`${avgUnderstanding}%`} sub="Across all subjects" accent="#4ade80" />
              <StatCard label="Sessions Logged" value={sessions.length} sub="This week" accent="#f472b6" />
              <StatCard label="Avg Retention" value="67%" sub="Across topics" accent="#fb923c" />
            </div>

            {/* Charts row */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              {/* Weekly bar */}
              <div style={{ background: "#080e1d", border: "1px solid #1e293b", borderRadius: 16, padding: 20 }}>
                <div style={{ fontFamily: "Space Mono, monospace", fontSize: 12, color: "#93c5fd", marginBottom: 14, fontWeight: 700 }}>Study Hours by Subject</div>
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={PROGRESS_DATA} barSize={6}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#0f172a" />
                    <XAxis dataKey="day" stroke="#475569" tick={{ fontSize: 11 }} />
                    <YAxis stroke="#475569" tick={{ fontSize: 11 }} />
                    <Tooltip contentStyle={{ background: "#0d1b33", border: "1px solid #1e3a5f", borderRadius: 8, fontSize: 12 }} />
                    {Object.entries(SUBJECT_COLORS).map(([s, c]) => <Bar key={s} dataKey={s} fill={c} radius={[3,3,0,0]} />)}
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Pie */}
              <div style={{ background: "#080e1d", border: "1px solid #1e293b", borderRadius: 16, padding: 20 }}>
                <div style={{ fontFamily: "Space Mono, monospace", fontSize: 12, color: "#93c5fd", marginBottom: 14, fontWeight: 700 }}>Study Distribution</div>
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <ResponsiveContainer width={160} height={160}>
                    <PieChart>
                      <Pie data={PIE_DATA} cx="50%" cy="50%" innerRadius={40} outerRadius={70} dataKey="value" strokeWidth={0}>
                        {PIE_DATA.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {PIE_DATA.map(d => (
                      <div key={d.name} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ width: 8, height: 8, borderRadius: "50%", background: d.color }} />
                        <span style={{ fontSize: 12, color: "#94a3b8" }}>{d.name}</span>
                        <span style={{ fontSize: 12, color: "#e2e8f0", fontFamily: "Space Mono, monospace" }}>{d.value}m</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Understanding trend */}
            <div style={{ background: "#080e1d", border: "1px solid #1e293b", borderRadius: 16, padding: 20 }}>
              <div style={{ fontFamily: "Space Mono, monospace", fontSize: 12, color: "#93c5fd", marginBottom: 14, fontWeight: 700 }}>Understanding Trend (7 days)</div>
              <ResponsiveContainer width="100%" height={150}>
                <LineChart data={UNDERSTANDING_TREND}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#0f172a" />
                  <XAxis dataKey="date" stroke="#475569" tick={{ fontSize: 11 }} />
                  <YAxis domain={[40, 100]} stroke="#475569" tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={{ background: "#0d1b33", border: "1px solid #1e3a5f", borderRadius: 8, fontSize: 12 }} />
                  <Line type="monotone" dataKey="understanding" stroke="#3b82f6" strokeWidth={2} dot={{ fill: "#3b82f6", r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Log button */}
            <button onClick={() => setShowLog(true)}
              style={{ background: "linear-gradient(135deg,#1d4ed8,#3b82f6)", border: "none", borderRadius: 12, padding: "14px 24px", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", width: "100%", letterSpacing: 0.5 }}>
              + Log New Study Session
            </button>

            {/* AI Insights */}
            <AIInsightsPanel mode="student" />
          </div>
        )}

        {activeTab === "history" && (
          <div style={{ background: "#080e1d", border: "1px solid #1e293b", borderRadius: 16, overflow: "hidden" }}>
            <div style={{ padding: "16px 20px", borderBottom: "1px solid #0f172a", fontFamily: "Space Mono, monospace", fontSize: 12, color: "#93c5fd", fontWeight: 700 }}>Study Session History</div>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#060c1a" }}>
                    {["Date", "Subject", "Topic", "Duration", "Difficulty", "Understanding"].map(h => (
                      <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontSize: 11, color: "#475569", fontWeight: 600, textTransform: "uppercase", letterSpacing: 1 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sessions.map((s, i) => (
                    <tr key={s.id} style={{ borderTop: "1px solid #0f172a", background: i % 2 === 0 ? "transparent" : "#060c1a08" }}>
                      <td style={{ padding: "12px 16px", fontSize: 12, color: "#64748b" }}>{s.date}</td>
                      <td style={{ padding: "12px 16px" }}>
                        <span style={{ background: `${SUBJECT_COLORS[s.subject]}22`, color: SUBJECT_COLORS[s.subject], fontSize: 11, padding: "2px 8px", borderRadius: 20, fontFamily: "Space Mono, monospace" }}>{s.subject}</span>
                      </td>
                      <td style={{ padding: "12px 16px", fontSize: 13, color: "#e2e8f0" }}>{s.topic}</td>
                      <td style={{ padding: "12px 16px", fontSize: 13, color: "#94a3b8", fontFamily: "Space Mono, monospace" }}>{s.duration}m</td>
                      <td style={{ padding: "12px 16px" }}>
                        <span style={{ fontSize: 11, color: s.difficulty === "Hard" ? "#f87171" : s.difficulty === "Medium" ? "#fbbf24" : "#4ade80" }}>{s.difficulty}</span>
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <div style={{ flex: 1, height: 4, background: "#1e293b", borderRadius: 2 }}>
                            <div style={{ width: `${s.understanding}%`, height: "100%", background: s.understanding >= 70 ? "#4ade80" : s.understanding >= 50 ? "#fbbf24" : "#f87171", borderRadius: 2 }} />
                          </div>
                          <span style={{ fontSize: 11, color: "#64748b", fontFamily: "Space Mono, monospace", minWidth: 30 }}>{s.understanding}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "retention" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <StatCard label="Strong Retention" value={RETENTION_DATA.filter(r => r.retention >= 75).length} sub="Topics above 75%" accent="#4ade80" />
              <StatCard label="Review Soon" value={RETENTION_DATA.filter(r => r.retention >= 50 && r.retention < 75).length} sub="Topics 50–75%" accent="#fbbf24" />
              <StatCard label="Critical" value={RETENTION_DATA.filter(r => r.retention < 50).length} sub="Topics below 50%" accent="#f87171" />
            </div>

            {lowRetention.length > 0 && (
              <div style={{ background: "#160b0b", border: "1px solid #7f1d1d", borderRadius: 12, padding: 16 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10, fontSize: 13, color: "#fca5a5", fontFamily: "Space Mono, monospace", fontWeight: 700 }}>
                  ⚠️ Needs Immediate Review
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {lowRetention.map(r => (
                    <span key={r.topic} style={{ background: "#7f1d1d33", color: "#fca5a5", fontSize: 12, padding: "4px 12px", borderRadius: 20, border: "1px solid #7f1d1d" }}>{r.topic} ({r.retention}%)</span>
                  ))}
                </div>
              </div>
            )}

            <div style={{ background: "#080e1d", border: "1px solid #1e293b", borderRadius: 16, overflow: "hidden" }}>
              {RETENTION_DATA.map((r, i) => (
                <div key={r.topic} style={{ padding: "14px 20px", borderBottom: i < RETENTION_DATA.length - 1 ? "1px solid #0f172a" : "none", display: "flex", alignItems: "center", gap: 16 }}>
                  <div style={{ width: 120 }}>
                    <div style={{ fontSize: 13, color: "#e2e8f0", marginBottom: 2 }}>{r.topic}</div>
                    <div style={{ fontSize: 11, color: SUBJECT_COLORS[r.subject] }}>{r.subject}</div>
                  </div>
                  <div style={{ flex: 1, height: 6, background: "#0f172a", borderRadius: 3 }}>
                    <div style={{ width: `${r.retention}%`, height: "100%", background: r.retention >= 75 ? "#4ade80" : r.retention >= 50 ? "#fbbf24" : "#f87171", borderRadius: 3, transition: "width 1s ease" }} />
                  </div>
                  <RetentionBadge score={r.retention} />
                  <div style={{ fontSize: 11, color: "#475569", minWidth: 80, textAlign: "right" }}>{r.lastStudied}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "schedule" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ background: "#080e1d", border: "1px solid #1d4ed844", borderRadius: 12, padding: 16 }}>
              <div style={{ fontSize: 12, color: "#93c5fd", fontFamily: "Space Mono, monospace", fontWeight: 700, marginBottom: 6 }}>🗓 AI-Generated Schedule</div>
              <div style={{ fontSize: 12, color: "#475569" }}>Optimized based on your understanding patterns and retention data</div>
            </div>
            {SCHEDULE.map(day => (
              <div key={day.day} style={{ background: "#080e1d", border: "1px solid #1e293b", borderRadius: 16, padding: 20 }}>
                <div style={{ fontFamily: "Space Mono, monospace", fontSize: 13, color: "#93c5fd", fontWeight: 700, marginBottom: 14 }}>{day.day}</div>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  {day.sessions.map((s, i) =>
                    s.type === "break"
                      ? <div key={i} style={{ padding: "8px 14px", background: "#0f172a", borderRadius: 8, fontSize: 12, color: "#475569" }}>☕ Break {s.duration}m</div>
                      : <div key={i} style={{ padding: "10px 16px", background: `${s.color}11`, border: `1px solid ${s.color}44`, borderRadius: 10 }}>
                          <div style={{ fontSize: 12, color: s.color, fontWeight: 700 }}>{s.subject}</div>
                          <div style={{ fontSize: 11, color: "#64748b", marginTop: 3 }}>{s.duration} minutes</div>
                        </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── TEACHER DASHBOARD ───────────────────────────────────────────────────────
function TeacherDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const tabs = ["overview", "students", "subjects", "insights"];

  const subjectAvg = { Chemistry: 42, Biology: 76, Math: 79, Physics: 65 };
  const classAvgTime = Math.round(CLASS_DATA.reduce((s, x) => s + x.studyTime, 0) / CLASS_DATA.length);
  const classAvgRetention = Math.round(CLASS_DATA.reduce((s, x) => s + x.retention, 0) / CLASS_DATA.length);
  const classAvgEngagement = Math.round(CLASS_DATA.reduce((s, x) => s + x.engagement, 0) / CLASS_DATA.length);

  const radarData = [
    { subject: "Biology", score: 76 },
    { subject: "Math", score: 79 },
    { subject: "Physics", score: 65 },
    { subject: "Chemistry", score: 42 },
    { subject: "Retention", score: classAvgRetention },
    { subject: "Engagement", score: classAvgEngagement },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#060c1a", color: "#e2e8f0", fontFamily: "Inter, sans-serif" }}>
      <div style={{ background: "#080e1d", borderBottom: "1px solid #1e293b", padding: "0 28px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 60 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ fontSize: 20, fontWeight: 900, fontFamily: "Space Mono, monospace", color: "#7c3aed", letterSpacing: -1 }}>StudySync</div>
            <span style={{ fontSize: 10, background: "#3b0764", color: "#c4b5fd", padding: "2px 8px", borderRadius: 20, fontFamily: "Space Mono, monospace" }}>TEACHER</span>
          </div>
          <div style={{ fontSize: 13, color: "#64748b" }}>Class: 10B Science · 5 Students</div>
        </div>
        <div style={{ display: "flex", gap: 0, borderTop: "1px solid #0f172a" }}>
          {tabs.map(t => (
            <button key={t} onClick={() => setActiveTab(t)}
              style={{ padding: "12px 20px", background: "none", border: "none", color: activeTab === t ? "#7c3aed" : "#475569", fontSize: 13, cursor: "pointer", borderBottom: activeTab === t ? "2px solid #7c3aed" : "2px solid transparent", textTransform: "capitalize", fontWeight: activeTab === t ? 700 : 400, transition: "all .2s" }}>
              {t}
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding: "24px 28px", maxWidth: 1100, margin: "0 auto" }}>
        {activeTab === "overview" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <StatCard label="Avg Study Time" value={`${classAvgTime}m`} sub="Per session" accent="#a78bfa" />
              <StatCard label="Class Retention" value={`${classAvgRetention}%`} sub="Avg across topics" accent="#34d399" />
              <StatCard label="Avg Engagement" value={`${classAvgEngagement}%`} sub="Activity rate" accent="#60a5fa" />
              <StatCard label="At-Risk Topics" value="2" sub="Below 50% understanding" accent="#f87171" />
            </div>

            {/* Alert */}
            <div style={{ background: "#160b0b", border: "1px solid #7f1d1d", borderRadius: 12, padding: 16, display: "flex", alignItems: "flex-start", gap: 12 }}>
              <span style={{ fontSize: 20 }}>🚨</span>
              <div>
                <div style={{ fontSize: 13, color: "#fca5a5", fontWeight: 700, marginBottom: 4 }}>Class Alert: Chemistry Struggling</div>
                <div style={{ fontSize: 12, color: "#9ca3af" }}>Average class understanding in Chemistry is 42% — significantly below other subjects. 4 out of 5 students are below 50% comprehension. Consider revisiting reaction balancing fundamentals.</div>
              </div>
            </div>

            {/* Radar + bar */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div style={{ background: "#080e1d", border: "1px solid #1e293b", borderRadius: 16, padding: 20 }}>
                <div style={{ fontFamily: "Space Mono, monospace", fontSize: 12, color: "#c4b5fd", marginBottom: 14, fontWeight: 700 }}>Class Performance Radar</div>
                <ResponsiveContainer width="100%" height={200}>
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="#1e293b" />
                    <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: "#64748b" }} />
                    <Radar name="Class" dataKey="score" stroke="#7c3aed" fill="#7c3aed" fillOpacity={0.3} />
                    <Tooltip contentStyle={{ background: "#0d1b33", border: "1px solid #1e3a5f", borderRadius: 8, fontSize: 12 }} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>

              <div style={{ background: "#080e1d", border: "1px solid #1e293b", borderRadius: 16, padding: 20 }}>
                <div style={{ fontFamily: "Space Mono, monospace", fontSize: 12, color: "#c4b5fd", marginBottom: 14, fontWeight: 700 }}>Subject Difficulty Map</div>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={Object.entries(subjectAvg).map(([k, v]) => ({ subject: k, understanding: v, color: SUBJECT_COLORS[k] }))} layout="vertical" barSize={14}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#0f172a" horizontal={false} />
                    <XAxis type="number" domain={[0, 100]} stroke="#475569" tick={{ fontSize: 11 }} />
                    <YAxis type="category" dataKey="subject" stroke="#475569" tick={{ fontSize: 11 }} width={70} />
                    <Tooltip contentStyle={{ background: "#0d1b33", border: "1px solid #1e3a5f", borderRadius: 8, fontSize: 12 }} />
                    <Bar dataKey="understanding" radius={[0,4,4,0]}>
                      {Object.entries(subjectAvg).map(([k]) => <Cell key={k} fill={SUBJECT_COLORS[k]} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* AI Insights for teacher */}
            <AIInsightsPanel mode="teacher" />
          </div>
        )}

        {activeTab === "students" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ fontFamily: "Space Mono, monospace", fontSize: 12, color: "#c4b5fd", marginBottom: 4, fontWeight: 700 }}>Student Engagement Overview</div>
            {CLASS_DATA.map((s, i) => (
              <div key={s.name} style={{ background: "#080e1d", border: "1px solid #1e293b", borderRadius: 14, padding: "16px 20px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
                  <div style={{ width: 36, height: 36, borderRadius: "50%", background: `hsl(${i * 60 + 200},60%,45%)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, flexShrink: 0 }}>{s.name[0]}</div>
                  <div style={{ minWidth: 80 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "#e2e8f0" }}>{s.name}</div>
                    <div style={{ fontSize: 11, color: "#475569" }}>{s.studyTime}m avg/session</div>
                  </div>
                  <div style={{ flex: 1, display: "flex", gap: 12, flexWrap: "wrap" }}>
                    {[
                      { label: "Engagement", val: s.engagement, color: "#60a5fa" },
                      { label: "Retention", val: s.retention, color: "#4ade80" },
                      { label: "Chemistry", val: s.chemistry, color: "#fb923c" },
                      { label: "Biology", val: s.biology, color: "#4ade80" },
                    ].map(m => (
                      <div key={m.label} style={{ minWidth: 90 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                          <span style={{ fontSize: 10, color: "#475569", textTransform: "uppercase", letterSpacing: 1 }}>{m.label}</span>
                          <span style={{ fontSize: 10, color: m.color, fontFamily: "Space Mono, monospace" }}>{m.val}%</span>
                        </div>
                        <div style={{ height: 4, background: "#1e293b", borderRadius: 2 }}>
                          <div style={{ width: `${m.val}%`, height: "100%", background: m.color, borderRadius: 2 }} />
                        </div>
                      </div>
                    ))}
                  </div>
                  {s.chemistry < 45 && (
                    <span style={{ fontSize: 11, background: "#7f1d1d33", color: "#fca5a5", padding: "3px 10px", borderRadius: 20, border: "1px solid #7f1d1d" }}>⚠ Chemistry Risk</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === "subjects" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {Object.entries(subjectAvg).map(([subj, avg]) => {
              const studs = CLASS_DATA.map(s => ({ name: s.name, score: s[subj.toLowerCase()] }));
              return (
                <div key={subj} style={{ background: "#080e1d", border: `1px solid ${SUBJECT_COLORS[subj]}22`, borderRadius: 16, padding: 20 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                    <div>
                      <div style={{ fontFamily: "Space Mono, monospace", fontSize: 13, color: SUBJECT_COLORS[subj], fontWeight: 700 }}>{subj}</div>
                      <div style={{ fontSize: 11, color: "#475569", marginTop: 2 }}>Class average understanding</div>
                    </div>
                    <div style={{ fontSize: 28, fontWeight: 900, fontFamily: "Space Mono, monospace", color: avg < 50 ? "#f87171" : avg < 70 ? "#fbbf24" : "#4ade80" }}>{avg}%</div>
                  </div>
                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                    {studs.map(st => (
                      <div key={st.name} style={{ flex: 1, minWidth: 80 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                          <span style={{ fontSize: 11, color: "#64748b" }}>{st.name}</span>
                          <span style={{ fontSize: 11, color: st.score < 50 ? "#f87171" : "#94a3b8", fontFamily: "Space Mono, monospace" }}>{st.score}%</span>
                        </div>
                        <div style={{ height: 5, background: "#1e293b", borderRadius: 3 }}>
                          <div style={{ width: `${st.score}%`, height: "100%", background: st.score < 50 ? "#f87171" : SUBJECT_COLORS[subj], borderRadius: 3 }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {activeTab === "insights" && <AIInsightsPanel mode="teacher" />}
      </div>
    </div>
  );
}

// ─── APP ROOT ─────────────────────────────────────────────────────────────────
export default function StudySync() {
  const [view, setView] = useState("home");
  const [sessions, setSessions] = useState(DEMO_SESSIONS);

  if (view === "student") return (
    <div>
      <div style={{ padding: "8px 28px", background: "#04070f", borderBottom: "1px solid #0f172a", display: "flex", alignItems: "center", gap: 12 }}>
        <button onClick={() => setView("home")} style={{ background: "none", border: "none", color: "#475569", fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>← Back</button>
      </div>
      <StudentDashboard sessions={sessions} setSessions={setSessions} />
    </div>
  );
  if (view === "teacher") return (
    <div>
      <div style={{ padding: "8px 28px", background: "#04070f", borderBottom: "1px solid #0f172a" }}>
        <button onClick={() => setView("home")} style={{ background: "none", border: "none", color: "#475569", fontSize: 12, cursor: "pointer" }}>← Back</button>
      </div>
      <TeacherDashboard />
    </div>
  );

  // Home / Role selector
  return (
    <div style={{ minHeight: "100vh", background: "#060c1a", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: "Inter, sans-serif", padding: 24 }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&display=swap');
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.5} }
        * { box-sizing: border-box; }
      `}</style>

      {/* Glow blobs */}
      <div style={{ position: "fixed", top: "20%", left: "15%", width: 300, height: 300, background: "#1d4ed822", borderRadius: "50%", filter: "blur(80px)", pointerEvents: "none" }} />
      <div style={{ position: "fixed", bottom: "20%", right: "15%", width: 250, height: 250, background: "#7c3aed22", borderRadius: "50%", filter: "blur(80px)", pointerEvents: "none" }} />

      <div style={{ position: "relative", zIndex: 1, textAlign: "center", maxWidth: 520 }}>
        <div style={{ fontSize: 11, fontFamily: "Space Mono, monospace", color: "#3b82f6", letterSpacing: 4, marginBottom: 12, textTransform: "uppercase" }}>LessonLens Suite</div>
        <div style={{ fontSize: 52, fontWeight: 900, fontFamily: "Space Mono, monospace", letterSpacing: -2, marginBottom: 8 }}>
          <span style={{ color: "#3b82f6" }}>Study</span><span style={{ color: "#7c3aed" }}>Sync</span>
        </div>
        <div style={{ fontSize: 16, color: "#64748b", marginBottom: 48, lineHeight: 1.6 }}>AI-powered study optimization platform.<br />Learn smarter. Track better. Retain more.</div>

        <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
          {[
            { role: "student", label: "Student Dashboard", icon: "🎓", desc: "Track sessions, view retention & get AI study tips", accent: "#3b82f6", bg: "#1d4ed8" },
            { role: "teacher", label: "Teacher Dashboard", icon: "🏫", desc: "Monitor class engagement & identify struggling students", accent: "#7c3aed", bg: "#6d28d9" },
          ].map(r => (
            <button key={r.role} onClick={() => setView(r.role)}
              style={{ background: "#080e1d", border: `1px solid ${r.accent}33`, borderRadius: 20, padding: "28px 32px", cursor: "pointer", width: 220, textAlign: "left", transition: "all .2s", position: "relative", overflow: "hidden" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = r.accent; e.currentTarget.style.transform = "translateY(-4px)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = `${r.accent}33`; e.currentTarget.style.transform = "translateY(0)"; }}>
              <div style={{ fontSize: 36, marginBottom: 14 }}>{r.icon}</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#e2e8f0", marginBottom: 8, fontFamily: "Space Mono, monospace" }}>{r.label}</div>
              <div style={{ fontSize: 12, color: "#475569", lineHeight: 1.5 }}>{r.desc}</div>
              <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, ${r.bg}, ${r.accent})` }} />
            </button>
          ))}
        </div>

        <div style={{ marginTop: 40, display: "flex", gap: 24, justifyContent: "center", flexWrap: "wrap" }}>
          {[["📚", "8 Features"], ["🤖", "Claude AI Insights"], ["📊", "Live Charts"], ["🔥", "Streak Tracking"]].map(([icon, txt]) => (
            <div key={txt} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#334155" }}>
              <span>{icon}</span><span>{txt}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
