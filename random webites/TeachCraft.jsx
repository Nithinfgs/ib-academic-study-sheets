import { useState, useEffect, useRef } from "react";

const SUBJECTS = ["Biology", "Chemistry", "Physics", "Mathematics", "History", "English", "Geography", "Computer Science", "Art", "Music"];
const GRADES = ["Grade 6", "Grade 7", "Grade 8", "Grade 9", "Grade 10", "Grade 11", "Grade 12"];
const DURATIONS = ["30 minutes", "45 minutes", "60 minutes", "90 minutes"];
const LEVELS = ["Basic", "Standard", "Advanced"];

const INSIGHTS = [
  { icon: "📈", text: "Lessons with interactive activities increased student comprehension by 18%." },
  { icon: "🧠", text: "Students perform better when practice questions are included before the lesson conclusion." },
  { icon: "🎯", text: "Visual diagrams reduce average concept-mastery time by 22% for STEM topics." },
  { icon: "💬", text: "Discussion prompts boost class participation rates by up to 35%." },
];

const DEMO_STRUGGLES = [
  { concept: "Energy conversion in photosynthesis", subject: "Biology" },
  { concept: "Balancing chemical equations", subject: "Chemistry" },
  { concept: "Quadratic formula application", subject: "Mathematics" },
  { concept: "Newton's third law examples", subject: "Physics" },
];

const SAVED_LESSONS = [
  { id: 1, subject: "Biology", topic: "Cell Division", grade: "Grade 10", date: "Mar 20", activities: 3, questions: 5 },
  { id: 2, subject: "Chemistry", topic: "Periodic Table", grade: "Grade 9", date: "Mar 22", activities: 2, questions: 4 },
  { id: 3, subject: "Mathematics", topic: "Quadratic Equations", grade: "Grade 11", date: "Mar 25", activities: 4, questions: 6 },
];

async function callClaude(systemPrompt, userPrompt) {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
    }),
  });
  const data = await response.json();
  return data.content?.map(b => b.text || "").join("\n") || "";
}

function Spinner() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, color: "#a78bfa" }}>
      <div style={{
        width: 20, height: 20, border: "2px solid #a78bfa33", borderTop: "2px solid #a78bfa",
        borderRadius: "50%", animation: "spin 0.8s linear infinite"
      }} />
      <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 13 }}>Generating with AI…</span>
    </div>
  );
}

function Tag({ children, color = "#a78bfa22", text = "#a78bfa" }) {
  return (
    <span style={{
      background: color, color: text, borderRadius: 6, padding: "2px 10px",
      fontSize: 11, fontFamily: "'DM Mono', monospace", fontWeight: 600, letterSpacing: 1
    }}>{children}</span>
  );
}

function Card({ children, style = {} }) {
  return (
    <div style={{
      background: "#1a1625", border: "1px solid #2d2640", borderRadius: 14,
      padding: "22px 24px", ...style
    }}>{children}</div>
  );
}

function SectionTitle({ children, accent }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
      {accent && <span style={{ fontSize: 18 }}>{accent}</span>}
      <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#e2d9f3", fontFamily: "'Fraunces', serif", letterSpacing: 0.3 }}>{children}</h3>
    </div>
  );
}

function LessonOutput({ lesson }) {
  if (!lesson) return null;
  const sections = lesson.split(/\n(?=##|###|\*\*[A-Z])/).filter(s => s.trim());
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {sections.map((sec, i) => {
        const lines = sec.trim().split("\n");
        const title = lines[0].replace(/^#+\s*|\*\*/g, "").replace(/\*\*$/, "").trim();
        const body = lines.slice(1).join("\n").replace(/\*\*/g, "").trim();
        const icons = ["📖", "💡", "🎯", "✏️", "🔬", "💬", "🏆"];
        return (
          <div key={i} style={{
            background: "#211c30", border: "1px solid #2d2640", borderRadius: 12,
            padding: "14px 18px", borderLeft: "3px solid #7c3aed"
          }}>
            <div style={{ fontFamily: "'Fraunces', serif", fontWeight: 700, color: "#c4b5fd", fontSize: 14, marginBottom: 8 }}>
              {icons[i % icons.length]} {title}
            </div>
            <div style={{ color: "#b0a8c8", fontSize: 13, lineHeight: 1.7, whiteSpace: "pre-wrap", fontFamily: "'DM Sans', sans-serif" }}>
              {body}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function TeachCraft() {
  const [tab, setTab] = useState("generator");
  const [form, setForm] = useState({ subject: "Biology", topic: "Photosynthesis", grade: "Grade 10", duration: "45 minutes", objectives: "", level: "Standard" });
  const [loading, setLoading] = useState(false);
  const [lesson, setLesson] = useState(null);
  const [adaptive, setAdaptive] = useState(null);
  const [adaptiveLoading, setAdaptiveLoading] = useState(false);
  const [selectedStruggle, setSelectedStruggle] = useState(null);
  const [saved, setSaved] = useState(SAVED_LESSONS);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [insightIdx, setInsightIdx] = useState(0);
  const workspaceRef = useRef(null);

  useEffect(() => {
    const t = setInterval(() => setInsightIdx(i => (i + 1) % INSIGHTS.length), 4000);
    return () => clearInterval(t);
  }, []);

  async function generateLesson() {
    setLoading(true);
    setLesson(null);
    setSaveSuccess(false);
    try {
      const result = await callClaude(
        "You are TeachCraft, an AI teaching assistant. Generate a structured lesson plan in clean text (no markdown symbols like *, #). Use clear section headers like: INTRODUCTION, CONCEPT EXPLANATION, CLASSROOM ACTIVITY, PRACTICE QUESTIONS, ASSESSMENT. Each section should be 2-4 sentences or bullet items. Keep it concise and practical for teachers.",
        `Subject: ${form.subject}\nTopic: ${form.topic}\nGrade: ${form.grade}\nDuration: ${form.duration}\nExplanation Level: ${form.level}\nObjectives: ${form.objectives || "General understanding of the topic"}`
      );
      setLesson(result);
      setTimeout(() => workspaceRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    } catch (e) {
      setLesson("Error generating lesson. Please check your connection and try again.");
    }
    setLoading(false);
  }

  async function generateAdaptive(struggle) {
    setSelectedStruggle(struggle);
    setAdaptiveLoading(true);
    setAdaptive(null);
    try {
      const result = await callClaude(
        "You are TeachCraft, an adaptive teaching assistant. Given a concept students are struggling with, suggest 3-4 targeted teaching strategies in plain text without markdown. Format as numbered strategies with a brief title and 1-2 sentence explanation each.",
        `Students are struggling with: ${struggle.concept} (${struggle.subject}). Suggest targeted remediation strategies for this specific confusion.`
      );
      setAdaptive(result);
    } catch (e) {
      setAdaptive("Could not generate suggestions. Please try again.");
    }
    setAdaptiveLoading(false);
  }

  function saveLesson() {
    if (!lesson) return;
    const newLesson = {
      id: Date.now(), subject: form.subject, topic: form.topic, grade: form.grade,
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      activities: 3, questions: 5
    };
    setSaved(prev => [newLesson, ...prev]);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  }

  const tabs = [
    { id: "generator", label: "Lesson Generator", icon: "✦" },
    { id: "adaptive", label: "Adaptive Suggestions", icon: "◈" },
    { id: "library", label: "Lesson Library", icon: "⊞" },
  ];

  return (
    <div style={{
      minHeight: "100vh", background: "#0f0c1a", color: "#e2d9f3",
      fontFamily: "'DM Sans', sans-serif",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:wght@400;600;700;900&family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500;600&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.5; } }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: #0f0c1a; }
        ::-webkit-scrollbar-thumb { background: #2d2640; border-radius: 10px; }
        .tab-btn { transition: all 0.2s; }
        .tab-btn:hover { background: #211c30 !important; }
        .btn-primary { transition: all 0.18s; cursor: pointer; }
        .btn-primary:hover { transform: translateY(-1px); box-shadow: 0 8px 24px #7c3aed44 !important; }
        .lib-row:hover { background: #211c30 !important; }
        .input-field { transition: border 0.2s; }
        .input-field:focus { outline: none; border-color: #7c3aed !important; }
        .struggle-card { transition: all 0.15s; cursor: pointer; }
        .struggle-card:hover { border-color: #7c3aed !important; transform: translateY(-2px); }
      `}</style>

      {/* Header */}
      <div style={{
        background: "linear-gradient(135deg, #1a1625 0%, #150f22 100%)",
        borderBottom: "1px solid #2d2640", padding: "0 32px",
        display: "flex", alignItems: "center", justifyContent: "space-between", height: 64
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{
            width: 36, height: 36, background: "linear-gradient(135deg, #7c3aed, #a855f7)",
            borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 18, boxShadow: "0 4px 14px #7c3aed44"
          }}>✦</div>
          <div>
            <div style={{ fontFamily: "'Fraunces', serif", fontWeight: 900, fontSize: 20, letterSpacing: -0.5, lineHeight: 1 }}>TeachCraft</div>
            <div style={{ fontSize: 10, color: "#6d5f8a", fontFamily: "'DM Mono', monospace", letterSpacing: 2 }}>AI LESSON GENERATOR</div>
          </div>
          <div style={{ marginLeft: 16, display: "flex", gap: 6 }}>
            {["LessonLens", "StudySync", "PathPilot"].map(p => (
              <Tag key={p}>{p}</Tag>
            ))}
          </div>
        </div>
        <div style={{
          background: "#211c30", border: "1px solid #2d2640", borderRadius: 10,
          padding: "8px 16px", display: "flex", alignItems: "center", gap: 10, maxWidth: 320, overflow: "hidden"
        }}>
          <span style={{ animation: "pulse 4s ease-in-out infinite", fontSize: 14 }}>{INSIGHTS[insightIdx].icon}</span>
          <span style={{
            fontSize: 11, color: "#9d89c4", fontFamily: "'DM Sans', sans-serif",
            animation: "fadeUp 0.5s ease", key: insightIdx, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis"
          }}>{INSIGHTS[insightIdx].text}</span>
        </div>
      </div>

      {/* Nav Tabs */}
      <div style={{
        background: "#13101f", borderBottom: "1px solid #1e1a2e",
        display: "flex", padding: "0 32px", gap: 4
      }}>
        {tabs.map(t => (
          <button key={t.id} className="tab-btn" onClick={() => setTab(t.id)} style={{
            padding: "14px 20px", background: tab === t.id ? "#1a1625" : "transparent",
            border: "none", borderBottom: tab === t.id ? "2px solid #7c3aed" : "2px solid transparent",
            color: tab === t.id ? "#c4b5fd" : "#6d5f8a", cursor: "pointer",
            fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 600,
            display: "flex", alignItems: "center", gap: 8, transition: "all 0.2s"
          }}>
            <span>{t.icon}</span>{t.label}
          </button>
        ))}
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "28px 24px" }}>

        {/* === LESSON GENERATOR TAB === */}
        {tab === "generator" && (
          <div style={{ display: "grid", gridTemplateColumns: "380px 1fr", gap: 24, animation: "fadeUp 0.3s ease" }}>
            {/* Form */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <Card>
                <SectionTitle accent="✦">Generate Lesson Plan</SectionTitle>
                {[
                  { label: "Subject", key: "subject", type: "select", options: SUBJECTS },
                  { label: "Topic", key: "topic", type: "text", placeholder: "e.g. Photosynthesis" },
                  { label: "Grade Level", key: "grade", type: "select", options: GRADES },
                  { label: "Duration", key: "duration", type: "select", options: DURATIONS },
                  { label: "Explanation Level", key: "level", type: "select", options: LEVELS },
                ].map(field => (
                  <div key={field.key} style={{ marginBottom: 14 }}>
                    <label style={{ fontSize: 11, color: "#6d5f8a", fontFamily: "'DM Mono', monospace", letterSpacing: 1, display: "block", marginBottom: 6 }}>
                      {field.label.toUpperCase()}
                    </label>
                    {field.type === "select" ? (
                      <select className="input-field" value={form[field.key]} onChange={e => setForm(f => ({ ...f, [field.key]: e.target.value }))} style={{
                        width: "100%", background: "#211c30", border: "1px solid #2d2640", borderRadius: 8,
                        color: "#e2d9f3", padding: "9px 12px", fontSize: 13, fontFamily: "'DM Sans', sans-serif"
                      }}>
                        {field.options.map(o => <option key={o}>{o}</option>)}
                      </select>
                    ) : (
                      <input className="input-field" type="text" value={form[field.key]} placeholder={field.placeholder}
                        onChange={e => setForm(f => ({ ...f, [field.key]: e.target.value }))} style={{
                          width: "100%", background: "#211c30", border: "1px solid #2d2640", borderRadius: 8,
                          color: "#e2d9f3", padding: "9px 12px", fontSize: 13, fontFamily: "'DM Sans', sans-serif"
                        }} />
                    )}
                  </div>
                ))}
                <div style={{ marginBottom: 18 }}>
                  <label style={{ fontSize: 11, color: "#6d5f8a", fontFamily: "'DM Mono', monospace", letterSpacing: 1, display: "block", marginBottom: 6 }}>
                    LEARNING OBJECTIVES (OPTIONAL)
                  </label>
                  <textarea className="input-field" value={form.objectives} rows={3} placeholder="e.g. Students will understand the light and dark reactions..."
                    onChange={e => setForm(f => ({ ...f, objectives: e.target.value }))} style={{
                      width: "100%", background: "#211c30", border: "1px solid #2d2640", borderRadius: 8,
                      color: "#e2d9f3", padding: "9px 12px", fontSize: 13, fontFamily: "'DM Sans', sans-serif",
                      resize: "vertical"
                    }} />
                </div>
                <button className="btn-primary" onClick={generateLesson} disabled={loading} style={{
                  width: "100%", background: loading ? "#2d2640" : "linear-gradient(135deg, #7c3aed, #a855f7)",
                  border: "none", borderRadius: 10, padding: "12px", color: "#fff",
                  fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 14,
                  boxShadow: "0 4px 16px #7c3aed33", cursor: loading ? "not-allowed" : "pointer"
                }}>
                  {loading ? "Generating…" : "✦ Generate Lesson Plan"}
                </button>
              </Card>

              {/* Improvement Tips */}
              <Card>
                <SectionTitle accent="💡">Improvement Suggestions</SectionTitle>
                {["Add visual diagrams to explain energy conversion.", "Include a hands-on activity for better retention.", "Use real-world examples to make concepts relatable.", "Add a short quiz before the conclusion."].map((tip, i) => (
                  <div key={i} style={{
                    padding: "8px 12px", background: "#211c30", borderRadius: 8, marginBottom: 8,
                    fontSize: 12, color: "#b0a8c8", fontFamily: "'DM Sans', sans-serif",
                    borderLeft: "2px solid #7c3aed55", display: "flex", gap: 8, alignItems: "flex-start"
                  }}>
                    <span style={{ color: "#7c3aed", marginTop: 1 }}>→</span> {tip}
                  </div>
                ))}
              </Card>
            </div>

            {/* Output Workspace */}
            <div ref={workspaceRef}>
              {!lesson && !loading && (
                <div style={{
                  background: "#1a1625", border: "1px dashed #2d2640", borderRadius: 14,
                  height: 420, display: "flex", flexDirection: "column",
                  alignItems: "center", justifyContent: "center", gap: 16
                }}>
                  <div style={{ fontSize: 48, opacity: 0.2 }}>✦</div>
                  <div style={{ fontSize: 15, color: "#4a3f6b", fontFamily: "'Fraunces', serif", fontWeight: 600 }}>Your lesson plan will appear here</div>
                  <div style={{ fontSize: 12, color: "#3d3358", fontFamily: "'DM Mono', monospace" }}>Fill in the form and click Generate</div>
                </div>
              )}
              {loading && (
                <Card style={{ minHeight: 200, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Spinner />
                </Card>
              )}
              {lesson && !loading && (
                <div style={{ animation: "fadeUp 0.4s ease" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                    <div>
                      <div style={{ fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: 18, color: "#e2d9f3" }}>
                        {form.subject}: {form.topic}
                      </div>
                      <div style={{ fontSize: 12, color: "#6d5f8a", marginTop: 4, display: "flex", gap: 8 }}>
                        <Tag>{form.grade}</Tag>
                        <Tag>{form.duration}</Tag>
                        <Tag>{form.level}</Tag>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 10 }}>
                      <button onClick={saveLesson} style={{
                        background: saveSuccess ? "#16a34a22" : "#211c30", border: `1px solid ${saveSuccess ? "#16a34a" : "#2d2640"}`,
                        borderRadius: 8, padding: "8px 16px", color: saveSuccess ? "#4ade80" : "#9d89c4",
                        fontSize: 12, fontFamily: "'DM Mono', monospace", cursor: "pointer", transition: "all 0.2s"
                      }}>
                        {saveSuccess ? "✓ Saved!" : "⊕ Save to Library"}
                      </button>
                    </div>
                  </div>
                  <LessonOutput lesson={lesson} />
                </div>
              )}
            </div>
          </div>
        )}

        {/* === ADAPTIVE SUGGESTIONS TAB === */}
        {tab === "adaptive" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, animation: "fadeUp 0.3s ease" }}>
            <div>
              <Card>
                <SectionTitle accent="◈">Student Struggle Detection</SectionTitle>
                <div style={{ fontSize: 12, color: "#6d5f8a", marginBottom: 16, fontFamily: "'DM Mono', monospace" }}>
                  DATA FROM LESSONLENS — SELECT A CONCEPT TO GENERATE TEACHING STRATEGIES
                </div>
                {DEMO_STRUGGLES.map((s, i) => (
                  <div key={i} className="struggle-card" onClick={() => generateAdaptive(s)} style={{
                    padding: "14px 16px", background: selectedStruggle?.concept === s.concept ? "#2a1f42" : "#211c30",
                    border: `1px solid ${selectedStruggle?.concept === s.concept ? "#7c3aed" : "#2d2640"}`,
                    borderRadius: 10, marginBottom: 10, display: "flex", justifyContent: "space-between", alignItems: "center"
                  }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "#c4b5fd", marginBottom: 4 }}>{s.concept}</div>
                      <Tag>{s.subject}</Tag>
                    </div>
                    <div style={{ fontSize: 10, color: "#a78bfa", fontFamily: "'DM Mono', monospace" }}>
                      {selectedStruggle?.concept === s.concept ? "SELECTED ✓" : "ANALYZE →"}
                    </div>
                  </div>
                ))}
              </Card>
            </div>
            <div>
              <Card style={{ minHeight: 300 }}>
                <SectionTitle accent="🎯">Targeted Teaching Strategies</SectionTitle>
                {!adaptive && !adaptiveLoading && (
                  <div style={{ color: "#4a3f6b", fontSize: 13, fontFamily: "'DM Mono', monospace", textAlign: "center", paddingTop: 60 }}>
                    Select a concept on the left to generate strategies
                  </div>
                )}
                {adaptiveLoading && <Spinner />}
                {adaptive && !adaptiveLoading && (
                  <div style={{ animation: "fadeUp 0.35s ease" }}>
                    <div style={{ marginBottom: 12, padding: "8px 12px", background: "#211c30", borderRadius: 8, fontSize: 11, color: "#a78bfa", fontFamily: "'DM Mono', monospace" }}>
                      STRATEGIES FOR: {selectedStruggle?.concept?.toUpperCase()}
                    </div>
                    <div style={{ color: "#b0a8c8", fontSize: 13, lineHeight: 1.8, whiteSpace: "pre-wrap", fontFamily: "'DM Sans', sans-serif" }}>
                      {adaptive}
                    </div>
                  </div>
                )}
              </Card>

              <Card style={{ marginTop: 16 }}>
                <SectionTitle accent="📊">Teaching Insights</SectionTitle>
                {INSIGHTS.map((ins, i) => (
                  <div key={i} style={{
                    padding: "10px 14px", background: "#211c30", borderRadius: 8, marginBottom: 8,
                    display: "flex", gap: 12, alignItems: "flex-start"
                  }}>
                    <span style={{ fontSize: 16 }}>{ins.icon}</span>
                    <span style={{ fontSize: 12, color: "#9d89c4", lineHeight: 1.6 }}>{ins.text}</span>
                  </div>
                ))}
              </Card>
            </div>
          </div>
        )}

        {/* === LESSON LIBRARY TAB === */}
        {tab === "library" && (
          <div style={{ animation: "fadeUp 0.3s ease" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <div>
                <h2 style={{ margin: 0, fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: 22 }}>Lesson Library</h2>
                <div style={{ fontSize: 12, color: "#6d5f8a", marginTop: 4 }}>{saved.length} saved lessons</div>
              </div>
              <input placeholder="Search lessons..." style={{
                background: "#1a1625", border: "1px solid #2d2640", borderRadius: 8,
                color: "#e2d9f3", padding: "9px 16px", fontSize: 13, fontFamily: "'DM Sans', sans-serif", width: 220
              }} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
              {saved.map(lesson => (
                <div key={lesson.id} className="lib-row" style={{
                  background: "#1a1625", border: "1px solid #2d2640", borderRadius: 14,
                  padding: "20px", cursor: "pointer", transition: "all 0.15s"
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                    <Tag>{lesson.subject}</Tag>
                    <span style={{ fontSize: 11, color: "#4a3f6b", fontFamily: "'DM Mono', monospace" }}>{lesson.date}</span>
                  </div>
                  <div style={{ fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: 16, color: "#e2d9f3", marginBottom: 6 }}>{lesson.topic}</div>
                  <div style={{ fontSize: 12, color: "#6d5f8a", marginBottom: 16 }}>{lesson.grade}</div>
                  <div style={{ display: "flex", gap: 10 }}>
                    <div style={{ flex: 1, background: "#211c30", borderRadius: 8, padding: "8px", textAlign: "center" }}>
                      <div style={{ fontSize: 18, fontWeight: 700, color: "#a78bfa", fontFamily: "'Fraunces', serif" }}>{lesson.activities}</div>
                      <div style={{ fontSize: 10, color: "#4a3f6b", fontFamily: "'DM Mono', monospace" }}>ACTIVITIES</div>
                    </div>
                    <div style={{ flex: 1, background: "#211c30", borderRadius: 8, padding: "8px", textAlign: "center" }}>
                      <div style={{ fontSize: 18, fontWeight: 700, color: "#a78bfa", fontFamily: "'Fraunces', serif" }}>{lesson.questions}</div>
                      <div style={{ fontSize: 10, color: "#4a3f6b", fontFamily: "'DM Mono', monospace" }}>QUESTIONS</div>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
                    <button style={{
                      flex: 1, background: "#211c30", border: "1px solid #2d2640", borderRadius: 7,
                      color: "#9d89c4", fontSize: 11, padding: "7px", cursor: "pointer", fontFamily: "'DM Mono', monospace"
                    }}>EDIT</button>
                    <button style={{
                      flex: 1, background: "#7c3aed22", border: "1px solid #7c3aed44", borderRadius: 7,
                      color: "#a78bfa", fontSize: 11, padding: "7px", cursor: "pointer", fontFamily: "'DM Mono', monospace"
                    }}>USE</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
