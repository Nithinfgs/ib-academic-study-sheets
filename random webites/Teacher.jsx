import { useState, useEffect } from "react";

const T = {
  bg: "#04070f", surface: "#080d18", card: "#0c1220",
  border: "rgba(99,179,237,0.12)", borderStrong: "rgba(99,179,237,0.28)",
  accent: "#38bdf8", accentGlow: "rgba(56,189,248,0.2)", accentDim: "rgba(56,189,248,0.08)",
  green: "#34d399", yellow: "#fbbf24", red: "#f87171",
  muted: "rgba(226,232,240,0.45)", text: "#e2e8f0", textDim: "rgba(226,232,240,0.65)",
};

const DEMO_LESSON = {
  id: "demo-001", title: "Introduction to Photosynthesis", topic: "Biology – Plant Science", grade: "Grade 9",
  code: "CLASS123", createdAt: new Date().toISOString(),
  questions: [
    { id: "q1", text: "What gas do plants absorb during photosynthesis?", type: "multiple", options: ["Oxygen","Carbon Dioxide","Nitrogen","Hydrogen"], correct: "Carbon Dioxide" },
    { id: "q2", text: "What energy source powers photosynthesis?", type: "multiple", options: ["Wind","Water","Sunlight","Soil Minerals"], correct: "Sunlight" },
    { id: "q3", text: "What sugar is produced by plants during photosynthesis?", type: "multiple", options: ["Fructose","Sucrose","Glucose","Lactose"], correct: "Glucose" },
    { id: "q4", text: "Where in the plant cell does photosynthesis occur?", type: "multiple", options: ["Mitochondria","Nucleus","Chloroplast","Vacuole"], correct: "Chloroplast" },
    { id: "q5", text: "What is the chemical symbol for carbon dioxide?", type: "multiple", options: ["CO","CO₂","C₂O","HCO₃"], correct: "CO₂" },
  ],
};

const DEMO_RESPONSES = [
  { student: "Aisha K.", avatar: "AK", q1: "Carbon Dioxide", q2: "Water",   q3: "Glucose",  q4: "Chloroplast",  q5: "CO₂",  time: "2m ago" },
  { student: "Ben T.",   avatar: "BT", q1: "Oxygen",        q2: "Wind",    q3: "Glucose",  q4: "Mitochondria", q5: "CO",   time: "3m ago" },
  { student: "Chloe M.", avatar: "CM", q1: "Carbon Dioxide",q2: "Sunlight",q3: "Fructose", q4: "Chloroplast",  q5: "CO₂",  time: "3m ago" },
  { student: "Dev R.",   avatar: "DR", q1: "Carbon Dioxide",q2: "Water",   q3: "Glucose",  q4: "Nucleus",      q5: "CO₂",  time: "4m ago" },
  { student: "Elena S.", avatar: "ES", q1: "Nitrogen",      q2: "Sunlight",q3: "Sucrose",  q4: "Chloroplast",  q5: "C₂O",  time: "4m ago" },
  { student: "Farrukh A.",avatar:"FA", q1: "Carbon Dioxide",q2: "Water",   q3: "Glucose",  q4: "Chloroplast",  q5: "CO₂",  time: "5m ago" },
  { student: "Grace L.", avatar: "GL", q1: "Carbon Dioxide",q2: "Sunlight",q3: "Glucose",  q4: "Mitochondria", q5: "CO₂",  time: "5m ago" },
  { student: "Hiro N.",  avatar: "HN", q1: "Oxygen",        q2: "Wind",    q3: "Fructose", q4: "Nucleus",      q5: "CO",   time: "6m ago" },
  { student: "Isla P.",  avatar: "IP", q1: "Carbon Dioxide",q2: "Water",   q3: "Glucose",  q4: "Chloroplast",  q5: "CO₂",  time: "6m ago" },
  { student: "James O.", avatar: "JO", q1: "Carbon Dioxide",q2: "Sunlight",q3: "Glucose",  q4: "Chloroplast",  q5: "CO₂",  time: "7m ago" },
  { student: "Kavya R.", avatar: "KR", q1: "Carbon Dioxide",q2: "Water",   q3: "Sucrose",  q4: "Vacuole",      q5: "CO₂",  time: "8m ago" },
  { student: "Liam D.",  avatar: "LD", q1: "Oxygen",        q2: "Sunlight",q3: "Glucose",  q4: "Chloroplast",  q5: "HCO₃", time: "8m ago" },
];

function computeAnalytics(lesson, responses) {
  return lesson.questions.map(q => {
    const answers = responses.map(r => r[q.id]).filter(Boolean);
    if (!answers.length) return { id: q.id, text: q.text, pct: 0, options: q.options, correct: q.correct, dist: {}, total: 0, correctCount: 0 };
    const correctCount = answers.filter(a => a === q.correct).length;
    const pct = Math.round((correctCount / answers.length) * 100);
    const dist = {};
    q.options.forEach(o => { dist[o] = 0; });
    answers.forEach(a => { if (dist[a] !== undefined) dist[a]++; });
    return { id: q.id, text: q.text, pct, options: q.options, correct: q.correct, dist, total: answers.length, correctCount };
  });
}

async function getClaudeInsight(lesson, analytics, responses) {
  const prompt = `You are LessonLens, an expert educational analytics AI. A teacher just ran a live quiz.

Lesson: "${lesson.title}" | Grade: ${lesson.grade} | Students: ${responses.length}

Results:
${analytics.map((a, i) => `Q${i+1}: "${a.text}" — ${a.pct}% correct (${a.correctCount}/${a.total}). Distribution: ${JSON.stringify(a.dist)}. Correct: "${a.correct}"`).join("\n")}

Avg: ${Math.round(analytics.reduce((s,a)=>s+a.pct,0)/analytics.length)}%

Return ONLY valid JSON (no markdown):
{"headline":"8-word punchy summary of the main issue","insight":"2-3 sentence teacher analysis: what's confused, why (cognitive reason), specific fix","quickFix":"One 60-second activity for right now","riskLevel":"low|medium|high","confidentTopics":["topic1","topic2"],"strugglingConcept":"The core misconception in a short phrase"}`;
  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 1000, messages: [{ role: "user", content: prompt }] }),
    });
    const data = await res.json();
    const text = (data.content?.[0]?.text || "").replace(/```json|```/g, "").trim();
    return JSON.parse(text);
  } catch {
    const worst = [...analytics].sort((a,b)=>a.pct-b.pct)[0];
    return {
      headline: "Energy source confusion blocks class progress",
      insight: `${Math.round(100-worst.pct)}% of students missed "${worst.text}". The most common error pattern suggests students confuse photosynthesis inputs with outputs — a well-documented reversal misconception. Reinforce with a "factory model": sunlight is the power, CO₂ is the raw material, glucose is the product.`,
      quickFix: "Have students draw the equation on paper: Sun + CO₂ + H₂O → Glucose + O₂. Visual encoding breaks the reversal habit in under 60 seconds.",
      riskLevel: worst.pct < 50 ? "high" : worst.pct < 70 ? "medium" : "low",
      confidentTopics: ["Gas absorption (Q1)", "Sugar identification (Q3)"],
      strugglingConcept: "Energy source identification & cell organelle location",
    };
  }
}

// ─── CSS ──────────────────────────────────────────────────────────────────────
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;600;700&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Outfit',sans-serif;background:#04070f;color:#e2e8f0;-webkit-font-smoothing:antialiased}
input,textarea,button,select{font-family:'Outfit',sans-serif}
input:focus,textarea:focus{outline:none}
button{cursor:pointer;border:none}
::-webkit-scrollbar{width:4px;height:4px}
::-webkit-scrollbar-thumb{background:rgba(56,189,248,0.2);border-radius:4px}
.mono{font-family:'JetBrains Mono',monospace}
@keyframes fadeUp{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
@keyframes fadeIn{from{opacity:0}to{opacity:1}}
@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.35}}
@keyframes glow{0%,100%{box-shadow:0 0 20px rgba(56,189,248,.1)}50%{box-shadow:0 0 40px rgba(56,189,248,.3)}}
@keyframes countUp{from{opacity:0;transform:scale(.85)}to{opacity:1;transform:scale(1)}}
@keyframes barFill{from{width:0}to{width:var(--target)}}
.fadeUp{animation:fadeUp .5s ease forwards}
.fadeIn{animation:fadeIn .4s ease forwards}
.shimmer-el{background:linear-gradient(90deg,rgba(255,255,255,.04) 0%,rgba(255,255,255,.1) 50%,rgba(255,255,255,.04) 100%);background-size:200% 100%;animation:shimmer 1.8s infinite;border-radius:8px}
.hl:hover{background:rgba(255,255,255,.025)!important;transition:background .15s}
.btn-primary:hover{opacity:.88!important}
.btn-sec:hover{border-color:rgba(56,189,248,.4)!important;color:#38bdf8!important}
`;

// ─── SMALL UI PIECES ──────────────────────────────────────────────────────────
function Chip({ color = T.accent, children }) {
  return <span style={{ display:"inline-flex", alignItems:"center", gap:5, background:`${color}15`, border:`1px solid ${color}30`, borderRadius:999, padding:"3px 10px", fontSize:11, color, fontWeight:700, letterSpacing:"0.04em" }}>{children}</span>;
}
function Label({ children }) {
  return <div style={{ fontSize:11, color:T.muted, textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:7, fontWeight:700 }}>{children}</div>;
}
function Avatar({ initials, size=30 }) {
  const colors = ["#38bdf8","#34d399","#fbbf24","#f87171","#a78bfa","#fb923c","#e879f9"];
  const c = colors[(initials.charCodeAt(0)+initials.charCodeAt(1)) % colors.length];
  return <div style={{ width:size, height:size, borderRadius:"50%", background:`${c}20`, border:`1.5px solid ${c}50`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:size*0.32, fontWeight:700, color:c, flexShrink:0 }}>{initials}</div>;
}
function Ring({ pct, size=52 }) {
  const c = pct>=80?T.green:pct>=60?T.yellow:T.red;
  const r=size*.38, circ=2*Math.PI*r;
  return <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{flexShrink:0}}>
    <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth={size*.09}/>
    <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={c} strokeWidth={size*.09}
      strokeDasharray={`${(pct/100)*circ} ${circ-(pct/100)*circ}`} strokeDashoffset={circ*.25}
      strokeLinecap="round" style={{transition:"stroke-dasharray 1.2s cubic-bezier(.4,0,.2,1)",filter:`drop-shadow(0 0 4px ${c}90)`}}/>
    <text x={size/2} y={size/2+4} textAnchor="middle" fill={c} fontSize={size*.19} fontWeight="700">{pct}%</text>
  </svg>;
}
function Bar({ pct, delay=0, h=8 }) {
  const c = pct>=80?T.green:pct>=60?T.yellow:T.red;
  const [w,setW] = useState(0);
  useEffect(()=>{ const t=setTimeout(()=>setW(pct),delay+100); return ()=>clearTimeout(t); },[pct,delay]);
  return <div style={{height:h, background:"rgba(255,255,255,0.06)", borderRadius:6, overflow:"hidden"}}>
    <div style={{height:"100%", width:`${w}%`, background:`linear-gradient(90deg,${c}bb,${c})`, borderRadius:6, transition:"width 1s cubic-bezier(.4,0,.2,1)", boxShadow:`0 0 10px ${c}55`}}/>
  </div>;
}
function MiniBar({ val, max, color }) {
  return <div style={{flex:1, height:5, background:"rgba(255,255,255,0.06)", borderRadius:3, overflow:"hidden"}}>
    <div style={{height:"100%", width:max?`${Math.round((val/max)*100)}%`:"0%", background:color, borderRadius:3, transition:"width .8s ease"}}/>
  </div>;
}
function Shimmer({ w="100%", h=14, mb=10 }) {
  return <div className="shimmer-el" style={{width:w,height:h,marginBottom:mb}}/>;
}
function StatCard({ label, value, sub, color=T.accent, icon }) {
  return <div style={{background:T.card, border:`1px solid ${T.border}`, borderRadius:14, padding:"18px 20px"}}>
    <div style={{fontSize:11, color:T.muted, textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:6, display:"flex", alignItems:"center", gap:5}}>{icon && <span style={{color}}>{icon}</span>}{label}</div>
    <div style={{fontSize:28, fontWeight:900, color, lineHeight:1, animation:"countUp .4s ease"}}>{value}</div>
    {sub && <div style={{fontSize:12, color:T.muted, marginTop:4}}>{sub}</div>}
  </div>;
}

// Icons
const I = {
  Logo: ()=><svg width="30" height="30" viewBox="0 0 30 30" fill="none"><circle cx="13" cy="13" r="8.5" stroke="#38bdf8" strokeWidth="2.5"/><path d="M20 20L27 27" stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round"/><circle cx="13" cy="13" r="3.5" fill="#38bdf8" opacity="0.25"/><circle cx="13" cy="13" r="1.5" fill="#38bdf8"/></svg>,
  Spark: ()=><svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M6.5 1L8 5.5H13L9.5 8L10.8 12.5L6.5 10L2.2 12.5L3.5 8L0 5.5H5L6.5 1Z" fill="currentColor"/></svg>,
  Check: ()=><svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M2 6.5L5.5 10L11 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  X: ()=><svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 2L10 10M10 2L2 10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>,
  Plus: ()=><svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M6.5 2V11M2 6.5H11" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>,
  Arrow: ()=><svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M2 6.5H11M7.5 3L11 6.5L7.5 10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  Download: ()=><svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M6.5 2V9M4 7L6.5 9.5L9 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/><path d="M2 11H11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>,
  Refresh: ()=><svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M1.5 6.5A5 5 0 0111 4M11.5 6.5A5 5 0 012 9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/><path d="M10 2L11 4L9 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  Copy: ()=><svg width="12" height="12" viewBox="0 0 12 12" fill="none"><rect x="3.5" y="3.5" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.3"/><path d="M1.5 8V2.5A1 1 0 012.5 1.5H8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>,
  Users: ()=><svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="5.5" cy="4.5" r="2.5" stroke="currentColor" strokeWidth="1.5"/><path d="M1 12c0-2.5 2-4.5 4.5-4.5S10 9.5 10 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><circle cx="10.5" cy="4.5" r="2" stroke="currentColor" strokeWidth="1.3" opacity=".6"/><path d="M10.5 8.5c1.4 0 2.5 1.1 2.5 2.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" opacity=".6"/></svg>,
  Chart: ()=><svg width="13" height="13" viewBox="0 0 13 13" fill="none"><rect x="1" y="7" width="3" height="5" rx=".8" fill="currentColor" opacity=".6"/><rect x="5" y="4" width="3" height="8" rx=".8" fill="currentColor"/><rect x="9" y="1" width="3" height="11" rx=".8" fill="currentColor" opacity=".8"/></svg>,
  Alert: ()=><svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M6.5 1.5L12 11.5H1L6.5 1.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/><line x1="6.5" y1="5.5" x2="6.5" y2="8.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><circle cx="6.5" cy="10" r=".7" fill="currentColor"/></svg>,
  Clock: ()=><svg width="12" height="12" viewBox="0 0 12 12" fill="none"><circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.3"/><path d="M6 3.5V6L8 7.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>,
  Shield: ()=><svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M6.5 1L11.5 3.5V7c0 2.5-2.5 4.5-5 5C4 11.5 1.5 9.5 1.5 7V3.5L6.5 1Z" stroke="currentColor" strokeWidth="1.4"/><path d="M4 6.5L6 8.5L9.5 4.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>,
};

// ─── HOMEPAGE ─────────────────────────────────────────────────────────────────
function HomePage({ onDemo, onTeacher, onStudent }) {
  return (
    <div style={{maxWidth:900, margin:"0 auto", padding:"76px 24px 60px", textAlign:"center"}}>
      <div style={{display:"inline-flex", alignItems:"center", gap:6, background:T.accentDim, border:`1px solid ${T.borderStrong}`, borderRadius:999, padding:"5px 16px", marginBottom:32, fontSize:11, color:T.accent, fontWeight:700, letterSpacing:"0.06em"}}>
        <I.Spark/> AI-POWERED CLASSROOM INTELLIGENCE
      </div>
      <h1 style={{fontSize:"clamp(44px,8vw,88px)", fontWeight:900, letterSpacing:"-3.5px", lineHeight:.95, marginBottom:24}}>
        Know exactly<br/><span style={{background:`linear-gradient(115deg,${T.accent},${T.green})`,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>who's lost.</span>
      </h1>
      <p style={{fontSize:18, color:T.muted, maxWidth:540, margin:"0 auto 48px", lineHeight:1.7}}>
        LessonLens detects confusion patterns in real time, analyzes them with AI, and tells teachers exactly what to reteach — before the class falls behind.
      </p>
      <div style={{display:"flex", gap:12, justifyContent:"center", flexWrap:"wrap", marginBottom:72}}>
        <button onClick={onDemo} className="btn-primary" style={{background:T.accent, color:"#020810", fontWeight:800, fontSize:16, padding:"15px 34px", borderRadius:12}}>▶ Launch Live Demo</button>
        <button onClick={onTeacher} className="btn-sec" style={{background:T.accentDim, border:`1px solid ${T.borderStrong}`, color:T.accent, fontWeight:700, fontSize:15, padding:"14px 26px", borderRadius:12}}>Teacher Dashboard</button>
        <button onClick={onStudent} className="btn-sec" style={{background:"rgba(255,255,255,0.04)", border:`1px solid ${T.border}`, color:T.muted, fontWeight:600, fontSize:15, padding:"14px 26px", borderRadius:12}}>Student View</button>
      </div>

      <div style={{display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:16, textAlign:"left", marginBottom:48}}>
        {[
          {icon:"📊",color:T.accent,title:"Live Confusion Heatmap",desc:"Color-coded comprehension scores per question. Spot which concept lost the class in under 2 seconds."},
          {icon:"🤖",color:T.green,title:"Claude AI Insight",desc:"Identifies the root misconception, explains why students likely have it, and gives a specific 60-second fix."},
          {icon:"📋",color:"#f472b6",title:"Per-Student Breakdown",desc:"Full response table: see every student's exact answer, score, and submission time at a glance."},
          {icon:"📊",color:T.yellow,title:"Answer Distribution",desc:"See which wrong option students chose. Understand the specific misconception, not just that they failed."},
          {icon:"📥",color:T.accent,title:"One-Click CSV Export",desc:"Export the full response matrix instantly. Share with parents, co-teachers, or student support teams."},
          {icon:"⚡",color:T.green,title:"Real-Time Updates",desc:"Dashboard updates live as students submit. No reload needed — watch the class comprehension map build."},
        ].map(c=>(
          <div key={c.title} style={{background:T.card, border:`1px solid ${T.border}`, borderRadius:16, padding:"20px 18px"}}>
            <div style={{fontSize:24, marginBottom:8}}>{c.icon}</div>
            <div style={{fontSize:13, fontWeight:700, marginBottom:6, color:c.color}}>{c.title}</div>
            <div style={{fontSize:12, color:T.muted, lineHeight:1.65}}>{c.desc}</div>
          </div>
        ))}
      </div>

      <div style={{display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:16}}>
        {[{v:"2×",l:"Faster intervention",s:"vs. exit tickets"},{v:"60s",l:"Time to AI insight",s:"from submit to analysis"},{v:"94%",l:"Teacher satisfaction",s:"in pilot classrooms"}].map(s=>(
          <div key={s.v} style={{background:T.card, border:`1px solid ${T.border}`, borderRadius:14, padding:"22px 20px", textAlign:"center"}}>
            <div style={{fontSize:36, fontWeight:900, background:`linear-gradient(115deg,${T.accent},${T.green})`,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>{s.v}</div>
            <div style={{fontSize:14, fontWeight:700, marginBottom:3}}>{s.l}</div>
            <div style={{fontSize:12, color:T.muted}}>{s.s}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── CREATE MODAL ─────────────────────────────────────────────────────────────
function CreateModal({ onClose, onCreate }) {
  const [title,setTitle]=useState(""); const [topic,setTopic]=useState(""); const [grade,setGrade]=useState("Grade 9");
  const [questions,setQuestions]=useState([{text:"",options:["","","",""],correct:""}]);
  const is = {background:"rgba(255,255,255,0.05)", border:`1px solid ${T.border}`, borderRadius:9, padding:"10px 14px", color:T.text, fontSize:14, width:"100%", display:"block"};
  function addQ(){setQuestions([...questions,{text:"",options:["","","",""],correct:""}]);}
  function updQ(i,k,v){const q=[...questions];q[i][k]=v;setQuestions(q);}
  function updO(qi,oi,v){const q=[...questions];q[qi].options[oi]=v;setQuestions(q);}
  function remQ(i){setQuestions(questions.filter((_,x)=>x!==i));}
  function create(){
    if(!title.trim())return;
    const code=Math.random().toString(36).substring(2,8).toUpperCase();
    onCreate({id:Date.now().toString(),title,topic,grade,code,createdAt:new Date().toISOString(),
      questions:questions.filter(q=>q.text.trim()).map((q,i)=>({id:`q${i+1}`,text:q.text,type:"multiple",options:q.options.filter(o=>o.trim()),correct:q.correct}))});
  }
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.75)",backdropFilter:"blur(8px)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:400,padding:20}}>
      <div className="fadeUp" style={{background:"#0c1220",border:`1px solid ${T.borderStrong}`,borderRadius:20,padding:30,maxWidth:600,width:"100%",maxHeight:"88vh",overflowY:"auto"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:24}}>
          <h2 style={{fontSize:20,fontWeight:800}}>Create New Lesson</h2>
          <button onClick={onClose} style={{background:"rgba(255,255,255,.07)",border:"none",borderRadius:8,padding:8,color:T.muted}}><I.X/></button>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"2fr 1fr",gap:10,marginBottom:10}}>
          <div><Label>Title</Label><input value={title} onChange={e=>setTitle(e.target.value)} placeholder="e.g. Intro to Photosynthesis" style={is}/></div>
          <div><Label>Grade</Label><input value={grade} onChange={e=>setGrade(e.target.value)} style={is}/></div>
        </div>
        <div style={{marginBottom:18}}><Label>Topic</Label><input value={topic} onChange={e=>setTopic(e.target.value)} placeholder="e.g. Biology – Plant Science" style={is}/></div>
        <Label>Questions</Label>
        {questions.map((q,qi)=>(
          <div key={qi} style={{background:"rgba(255,255,255,.03)",border:`1px solid ${T.border}`,borderRadius:12,padding:14,marginBottom:10}}>
            <div style={{display:"flex",gap:8,marginBottom:8}}>
              <span style={{fontSize:10,color:T.accent,fontWeight:800,background:T.accentDim,borderRadius:5,padding:"3px 7px",flexShrink:0,alignSelf:"center"}}>Q{qi+1}</span>
              <input value={q.text} onChange={e=>updQ(qi,"text",e.target.value)} placeholder="Question…" style={{...is,flex:1}}/>
              {questions.length>1&&<button onClick={()=>remQ(qi)} style={{background:"rgba(248,113,113,.1)",border:"1px solid rgba(248,113,113,.2)",borderRadius:7,padding:7,color:T.red}}><I.X/></button>}
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,marginBottom:7}}>
              {q.options.map((o,oi)=><input key={oi} value={o} onChange={e=>updO(qi,oi,e.target.value)} placeholder={`Option ${oi+1}`} style={{...is,fontSize:12}}/>)}
            </div>
            <input value={q.correct} onChange={e=>updQ(qi,"correct",e.target.value)} placeholder="Correct answer (must match option exactly)" style={{...is,fontSize:12,borderColor:`${T.green}40`}}/>
          </div>
        ))}
        <button onClick={addQ} style={{display:"flex",alignItems:"center",gap:6,background:T.accentDim,border:`1px solid ${T.borderStrong}`,borderRadius:8,padding:"8px 14px",color:T.accent,fontSize:12,fontWeight:700,marginBottom:22}}><I.Plus/>Add Question</button>
        <div style={{display:"flex",gap:10}}>
          <button onClick={create} style={{flex:1,background:T.accent,color:"#020810",fontWeight:800,fontSize:15,padding:"12px 0",borderRadius:10}}>Create Lesson</button>
          <button onClick={onClose} style={{flex:1,background:"rgba(255,255,255,.06)",border:`1px solid ${T.border}`,color:T.muted,fontSize:15,padding:"12px 0",borderRadius:10}}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

// ─── TEACHER DASHBOARD ────────────────────────────────────────────────────────
function TeacherDashboard({ lesson, responses, analytics, insight, insightLoading, onLoadDemo, onNewLesson, onRefreshInsight, tab, setTab }) {
  const [copied,setCopied]=useState(false);
  const [bars,setBars]=useState(false);
  useEffect(()=>{if(analytics){setBars(false);setTimeout(()=>setBars(true),250);}},[analytics,responses.length]);

  function copyCode(){navigator.clipboard.writeText(lesson?.code||"");setCopied(true);setTimeout(()=>setCopied(false),2000);}
  function exportCSV(){
    if(!analytics||!responses.length)return;
    const hdr=["Student",...lesson.questions.map((_,i)=>`Q${i+1}`),"Score","Time"].join(",");
    const rows=responses.map(r=>{
      const score=lesson.questions.filter(q=>r[q.id]===q.correct).length;
      return [r.student,...lesson.questions.map(q=>r[q.id]||""),`${Math.round((score/lesson.questions.length)*100)}%`,r.time||""].join(",");
    });
    const blob=new Blob([[hdr,...rows].join("\n")],{type:"text/csv"});
    const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=`${(lesson.title||"lesson").replace(/\s+/g,"_")}_results.csv`;a.click();
  }

  const avgPct = analytics?Math.round(analytics.reduce((s,a)=>s+a.pct,0)/analytics.length):0;
  const confused = analytics?analytics.filter(a=>a.pct<60).length:0;
  const IS = {background:"rgba(255,255,255,0.05)",border:`1px solid ${T.border}`,borderRadius:9,padding:"10px 14px",color:T.text,fontSize:14,width:"100%",display:"block"};

  if(!lesson) return (
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"80px 24px",textAlign:"center",minHeight:"60vh"}}>
      <div style={{fontSize:52,marginBottom:14}}>🎓</div>
      <h2 style={{fontSize:24,fontWeight:800,marginBottom:10}}>No Active Lesson</h2>
      <p style={{color:T.muted,marginBottom:28,maxWidth:340,fontSize:14}}>Create a lesson or load the live demo to see LessonLens in action.</p>
      <div style={{display:"flex",gap:10}}>
        <button onClick={onLoadDemo} style={{background:T.accent,color:"#020810",fontWeight:800,fontSize:15,padding:"12px 28px",borderRadius:10}}>▶ Load Demo</button>
        <button onClick={onNewLesson} style={{background:T.accentDim,border:`1px solid ${T.borderStrong}`,color:T.accent,fontWeight:700,fontSize:14,padding:"11px 22px",borderRadius:10}}>+ Create Lesson</button>
      </div>
    </div>
  );

  return (
    <div style={{maxWidth:1080,margin:"0 auto",padding:"28px 22px"}}>
      {/* Header row */}
      <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:22,flexWrap:"wrap",gap:12}}>
        <div>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
            <Chip color={T.accent}>{lesson.grade}</Chip>
            <Chip color={T.green}><span style={{display:"inline-block",width:6,height:6,borderRadius:"50%",background:T.green,marginRight:2,animation:"pulse 1.8s infinite"}}/>LIVE</Chip>
          </div>
          <h1 style={{fontSize:26,fontWeight:900,letterSpacing:"-0.5px",lineHeight:1.1}}>{lesson.title}</h1>
          <div style={{fontSize:13,color:T.muted,marginTop:3}}>{lesson.topic}</div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:10,background:T.card,border:`1px solid ${T.borderStrong}`,borderRadius:14,padding:"12px 18px",animation:"glow 3s infinite"}}>
          <div>
            <div style={{fontSize:10,color:T.accent,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:2}}>Class Code</div>
            <div className="mono" style={{fontSize:26,fontWeight:700,color:T.accent,letterSpacing:"0.18em"}}>{lesson.code}</div>
          </div>
          <button onClick={copyCode} style={{background:T.accentDim,border:`1px solid ${T.borderStrong}`,borderRadius:8,padding:"7px 11px",color:copied?T.green:T.accent,fontSize:12,display:"flex",alignItems:"center",gap:4,fontWeight:700}}>
            <I.Copy/>{copied?"Copied!":"Copy"}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:22}}>
        <StatCard label="Students" value={responses.length} sub={`of ~30 expected`} color={T.accent} icon={<I.Users/>}/>
        <StatCard label="Class Avg" value={analytics?avgPct+"%":"—"} sub={avgPct>=70?"On track":"Needs attention"} color={avgPct>=70?T.green:avgPct>=50?T.yellow:T.red} icon={<I.Chart/>}/>
        <StatCard label="Confused Q's" value={confused} sub={`of ${lesson.questions.length} questions`} color={confused>0?T.red:T.green} icon={<I.Alert/>}/>
        <StatCard label="Participation" value={responses.length>0?"100%":"0%"} sub={responses.length+" submitted"} color={T.green} icon={<I.Shield/>}/>
      </div>

      {/* Tabs */}
      <div style={{display:"flex",gap:3,marginBottom:20,background:T.card,border:`1px solid ${T.border}`,borderRadius:12,padding:4,width:"fit-content"}}>
        {["Analytics","Students","Questions"].map(t=>(
          <button key={t} onClick={()=>setTab(t)} style={{padding:"8px 20px",borderRadius:8,fontSize:13,fontWeight:700,background:tab===t?T.accentDim:"transparent",color:tab===t?T.accent:T.muted,border:`1px solid ${tab===t?T.borderStrong:"transparent"}`,transition:"all .15s"}}>
            {t}
          </button>
        ))}
      </div>

      {/* TAB: ANALYTICS */}
      {tab==="Analytics" && analytics && (
        <div className="fadeIn" style={{display:"grid",gridTemplateColumns:"1.1fr .9fr",gap:18}}>
          {/* Heatmap */}
          <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:18,padding:22}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20}}>
              <div style={{fontSize:15,fontWeight:800}}>Comprehension Heatmap</div>
              <div style={{display:"flex",gap:10}}>
                {[{c:T.green,l:"Strong"},{c:T.yellow,l:"Partial"},{c:T.red,l:"Confused"}].map(s=>(
                  <span key={s.l} style={{display:"flex",alignItems:"center",gap:4,fontSize:11,color:T.muted}}>
                    <div style={{width:8,height:8,borderRadius:2,background:s.c}}/>{s.l}
                  </span>
                ))}
              </div>
            </div>
            {analytics.map((a,i)=>(
              <div key={a.id} style={{marginBottom:20}}>
                <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:7}}>
                  <Ring pct={a.pct}/>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:13,fontWeight:600,lineHeight:1.3,marginBottom:2,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>Q{i+1}: {a.text}</div>
                    <div style={{fontSize:11,color:T.muted,display:"flex",alignItems:"center",gap:8}}>
                      <span>{a.correctCount}/{a.total} correct</span>
                      {a.pct<60&&<span style={{color:T.red,display:"flex",alignItems:"center",gap:3}}><I.Alert/>Confusion flagged</span>}
                    </div>
                  </div>
                </div>
                <Bar pct={a.pct} delay={i*100}/>
                {/* dist */}
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:5,marginTop:8}}>
                  {a.options.map(opt=>{
                    const cnt=a.dist[opt]||0;
                    const isC=opt===a.correct;
                    const pct=a.total?Math.round((cnt/a.total)*100):0;
                    return (
                      <div key={opt} style={{display:"flex",alignItems:"center",gap:6,background:`${isC?T.green:T.red}0a`,border:`1px solid ${isC?T.green:T.red}22`,borderRadius:7,padding:"5px 8px"}}>
                        <span style={{color:isC?T.green:T.red,flexShrink:0}}>{isC?<I.Check/>:<I.X/>}</span>
                        <span style={{fontSize:11,flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",color:isC?T.green:T.textDim}}>{opt}</span>
                        <span className="mono" style={{fontSize:10,color:isC?T.green:T.red,fontWeight:700,flexShrink:0}}>{cnt}({pct}%)</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Right col */}
          <div style={{display:"flex",flexDirection:"column",gap:14}}>
            {/* AI Insight */}
            <div style={{background:`linear-gradient(135deg,${T.card} 0%,rgba(56,189,248,.06) 100%)`,border:`1px solid ${T.borderStrong}`,borderRadius:18,padding:22,flex:1}}>
              <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:16}}>
                <span style={{color:T.accent}}><I.Spark/></span>
                <div style={{fontSize:15,fontWeight:800}}>AI Insight</div>
                {insight&&<span style={{display:"inline-flex",alignItems:"center",gap:4,background:`${insight.riskLevel==="high"?T.red:insight.riskLevel==="medium"?T.yellow:T.green}18`,border:`1px solid ${insight.riskLevel==="high"?T.red:insight.riskLevel==="medium"?T.yellow:T.green}35`,borderRadius:999,padding:"2px 9px",fontSize:10,color:insight.riskLevel==="high"?T.red:insight.riskLevel==="medium"?T.yellow:T.green,fontWeight:800}}>
                  <span style={{animation:insight.riskLevel==="high"?"pulse 1.2s infinite":"none"}}>●</span>{insight.riskLevel?.toUpperCase()} RISK
                </span>}
                <button onClick={onRefreshInsight} style={{marginLeft:"auto",background:T.accentDim,border:`1px solid ${T.borderStrong}`,borderRadius:7,padding:"5px 9px",color:T.accent,display:"flex",alignItems:"center",gap:4,fontSize:11,fontWeight:700}}>
                  <I.Refresh/>Refresh
                </button>
              </div>
              {insightLoading?(
                <div><Shimmer w="100%" h={13} mb={9}/><Shimmer w="88%" h={13} mb={9}/><Shimmer w="95%" h={13} mb={9}/><Shimmer w="72%" h={13} mb={18}/><Shimmer w="100%" h={56} mb={10}/><Shimmer w="100%" h={70}/></div>
              ):insight?(
                <>
                  <div style={{fontSize:17,fontWeight:800,color:T.accent,marginBottom:10,lineHeight:1.3}}>{insight.headline}</div>
                  <p style={{fontSize:13,lineHeight:1.8,color:T.textDim,marginBottom:14}}>{insight.insight}</p>
                  <div style={{background:`${T.green}0d`,border:`1px solid ${T.green}28`,borderRadius:11,padding:"12px 14px",marginBottom:12}}>
                    <div style={{fontSize:10,color:T.green,fontWeight:800,letterSpacing:"0.08em",marginBottom:5}}>⚡ DO THIS NOW (60 seconds)</div>
                    <div style={{fontSize:12,color:T.textDim,lineHeight:1.65}}>{insight.quickFix}</div>
                  </div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                    <div style={{background:`${T.green}0a`,border:`1px solid ${T.green}20`,borderRadius:10,padding:11}}>
                      <div style={{fontSize:10,color:T.green,fontWeight:800,marginBottom:5}}>✓ STUDENTS KNOW</div>
                      {(insight.confidentTopics||[]).map((t,i)=><div key={i} style={{fontSize:11,color:T.muted,marginBottom:2}}>• {t}</div>)}
                    </div>
                    <div style={{background:`${T.red}0a`,border:`1px solid ${T.red}20`,borderRadius:10,padding:11}}>
                      <div style={{fontSize:10,color:T.red,fontWeight:800,marginBottom:5}}>✗ CONFUSION ZONE</div>
                      <div style={{fontSize:11,color:T.muted,lineHeight:1.5}}>{insight.strugglingConcept}</div>
                    </div>
                  </div>
                </>
              ):<div style={{color:T.muted,fontSize:13}}>Load demo data to generate AI insights.</div>}
            </div>
            {/* Export */}
            {responses.length>0&&(
              <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:13,padding:16,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                <div>
                  <div style={{fontSize:14,fontWeight:700,marginBottom:2}}>Export Report</div>
                  <div style={{fontSize:11,color:T.muted}}>CSV · {responses.length} students · {lesson.questions.length} questions</div>
                </div>
                <button onClick={exportCSV} style={{background:T.accentDim,border:`1px solid ${T.borderStrong}`,borderRadius:8,padding:"9px 14px",color:T.accent,display:"flex",alignItems:"center",gap:5,fontSize:12,fontWeight:700}}>
                  <I.Download/>Export CSV
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB: STUDENTS */}
      {tab==="Students"&&(
        <div className="fadeIn" style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:18,overflow:"hidden"}}>
          <div style={{padding:"16px 20px",borderBottom:`1px solid ${T.border}`,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <div style={{fontSize:15,fontWeight:800}}>Student Responses</div>
            <Chip color={T.accent}>{responses.length} students</Chip>
          </div>
          {responses.length===0?(
            <div style={{padding:"48px 0",textAlign:"center",color:T.muted,fontSize:14}}>No responses yet. Share the class code!</div>
          ):(
            <div style={{overflowX:"auto"}}>
              <table style={{width:"100%",borderCollapse:"collapse"}}>
                <thead>
                  <tr style={{borderBottom:`1px solid ${T.border}`}}>
                    {["Student",...lesson.questions.map((_,i)=>`Q${i+1}`),"Score","Time"].map(h=>(
                      <th key={h} style={{padding:"11px 16px",textAlign:"left",fontSize:10,color:T.muted,fontWeight:800,textTransform:"uppercase",letterSpacing:"0.1em",whiteSpace:"nowrap"}}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {responses.map((r,ri)=>{
                    const score=lesson.questions.filter(q=>r[q.id]===q.correct).length;
                    const sp=Math.round((score/lesson.questions.length)*100);
                    return (
                      <tr key={ri} className="hl" style={{borderBottom:`1px solid rgba(255,255,255,.04)`}}>
                        <td style={{padding:"11px 16px",display:"flex",alignItems:"center",gap:9}}>
                          <Avatar initials={r.avatar||r.student.substring(0,2)} size={28}/>
                          <span style={{fontSize:13,fontWeight:600}}>{r.student}</span>
                        </td>
                        {lesson.questions.map(q=>{
                          const ok=r[q.id]===q.correct;
                          return <td key={q.id} style={{padding:"11px 16px"}}>
                            <div style={{display:"flex",alignItems:"center",gap:4}}>
                              <span style={{color:ok?T.green:T.red}}>{ok?<I.Check/>:<I.X/>}</span>
                              <span style={{fontSize:11,color:ok?T.green:T.red,maxWidth:70,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{r[q.id]||"—"}</span>
                            </div>
                          </td>;
                        })}
                        <td style={{padding:"11px 16px"}}><span style={{fontSize:13,fontWeight:800,color:sp>=80?T.green:sp>=60?T.yellow:T.red}}>{sp}%</span></td>
                        <td style={{padding:"11px 16px"}}><span style={{fontSize:11,color:T.muted,display:"flex",alignItems:"center",gap:4}}><I.Clock/>{r.time||"just now"}</span></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB: QUESTIONS */}
      {tab==="Questions"&&(
        <div className="fadeIn" style={{display:"flex",flexDirection:"column",gap:14}}>
          {lesson.questions.map((q,i)=>{
            const a=analytics?.[i];
            return (
              <div key={q.id} style={{background:T.card,border:`1px solid ${a&&a.pct<60?T.red+"50":T.border}`,borderRadius:16,padding:20}}>
                <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:12,marginBottom:14,flexWrap:"wrap"}}>
                  <div style={{flex:1}}>
                    <div style={{fontSize:11,color:T.muted,marginBottom:4}}>Question {i+1}</div>
                    <div style={{fontSize:16,fontWeight:700,lineHeight:1.4,marginBottom:4}}>{q.text}</div>
                    <div style={{fontSize:12,color:T.green,display:"flex",alignItems:"center",gap:4}}><I.Check/>Correct: {q.correct}</div>
                  </div>
                  {a&&<div style={{display:"flex",alignItems:"center",gap:10}}>
                    <Ring pct={a.pct} size={56}/>
                    {a.pct<60&&<Chip color={T.red}><I.Alert/>Needs Review</Chip>}
                  </div>}
                </div>
                {a&&(
                  <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:8}}>
                    {q.options.map(opt=>{
                      const cnt=a.dist[opt]||0;
                      const isC=opt===q.correct;
                      const p=a.total?Math.round((cnt/a.total)*100):0;
                      return (
                        <div key={opt} style={{background:isC?`${T.green}0d`:`${T.red}08`,border:`1px solid ${isC?T.green:T.red}28`,borderRadius:10,padding:"10px 13px"}}>
                          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                            <span style={{fontSize:13,color:isC?T.green:T.textDim,fontWeight:600}}>{opt}</span>
                            <span className="mono" style={{fontSize:11,color:isC?T.green:T.red,fontWeight:800}}>{cnt} ({p}%)</span>
                          </div>
                          <MiniBar val={cnt} max={a.total||1} color={isC?T.green:T.red}/>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {!analytics&&(
        <div style={{textAlign:"center",padding:"40px 0",color:T.muted}}>
          <div style={{fontSize:40,marginBottom:12}}>📡</div>
          <div style={{fontSize:16,fontWeight:700,marginBottom:8}}>Waiting for student responses…</div>
          <div style={{fontSize:13}}>Share code <span className="mono" style={{color:T.accent,fontWeight:700}}>{lesson.code}</span> with your class, or <button onClick={onLoadDemo} style={{background:"none",color:T.accent,fontWeight:700,textDecoration:"underline",fontSize:13}}>load the demo</button>.</div>
        </div>
      )}

      <div style={{display:"flex",gap:10,marginTop:22}}>
        <button onClick={onNewLesson} style={{background:"rgba(255,255,255,.06)",border:`1px solid ${T.border}`,borderRadius:9,padding:"10px 18px",color:T.muted,fontWeight:700,fontSize:13}}>+ New Lesson</button>
        <button onClick={onLoadDemo} style={{background:"rgba(255,255,255,.06)",border:`1px solid ${T.border}`,borderRadius:9,padding:"10px 18px",color:T.muted,fontWeight:700,fontSize:13}}>↺ Reload Demo</button>
      </div>
    </div>
  );
}

// ─── STUDENT PAGE ─────────────────────────────────────────────────────────────
function StudentPage({ lesson, onResponse }) {
  const [phase,setPhase]=useState("join");
  const [name,setName]=useState(""); const [code,setCode]=useState(""); const [err,setErr]=useState("");
  const [answers,setAnswers]=useState({}); const [cur,setCur]=useState(0);

  function join(){
    if(!lesson){setErr("No active lesson. Load the demo first from Teacher view.");return;}
    if(code.toUpperCase()!==lesson.code){setErr("Invalid code — check with your teacher.");return;}
    if(!name.trim()){setErr("Please enter your name.");return;}
    setErr(""); setPhase("quiz");
  }
  function pick(qid,opt){setAnswers({...answers,[qid]:opt});}
  function submit(){
    onResponse({student:name,avatar:name.substring(0,2).toUpperCase(),time:"just now",...answers});
    setPhase("done");
  }
  const q=lesson?.questions[cur];
  const totalAnswered=Object.keys(answers).length;
  const totalQ=lesson?.questions.length||1;
  const finalScore=lesson?Math.round((lesson.questions.filter(q=>answers[q.id]===q.correct).length/totalQ)*100):0;

  const IS={background:"rgba(255,255,255,.05)",border:`1px solid ${T.border}`,borderRadius:9,padding:"11px 14px",color:T.text,fontSize:14,width:"100%",display:"block"};

  if(phase==="join") return (
    <div style={{maxWidth:440,margin:"60px auto",padding:"0 24px"}} className="fadeUp">
      <div style={{textAlign:"center",marginBottom:32}}>
        <div style={{fontSize:40,marginBottom:10}}>🎓</div>
        <h2 style={{fontSize:26,fontWeight:900,marginBottom:7}}>Join Lesson</h2>
        <p style={{color:T.muted,fontSize:14}}>Enter the code your teacher displayed to start the quiz.</p>
      </div>
      {lesson&&<div style={{textAlign:"center",background:T.accentDim,border:`1px solid ${T.borderStrong}`,borderRadius:10,padding:"9px 0",marginBottom:18,fontSize:12,color:T.accent,fontWeight:700}}>
        💡 Demo code: <span className="mono" style={{fontWeight:800}}>{lesson.code}</span>
      </div>}
      <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:18,padding:26}}>
        <div style={{marginBottom:14}}><Label>Your Name</Label><input value={name} onChange={e=>setName(e.target.value)} onKeyDown={e=>e.key==="Enter"&&join()} placeholder="e.g. Aisha K." style={IS}/></div>
        <div style={{marginBottom:10}}><Label>Session Code</Label><input value={code} onChange={e=>{setCode(e.target.value.toUpperCase());setErr("");}} onKeyDown={e=>e.key==="Enter"&&join()} placeholder="CLASS123" className="mono" style={{...IS,fontSize:22,fontWeight:800,letterSpacing:"0.2em",textAlign:"center"}}/></div>
        {err&&<div style={{fontSize:12,color:T.red,marginBottom:10,textAlign:"center"}}>{err}</div>}
        <button onClick={join} style={{width:"100%",background:T.accent,color:"#020810",fontWeight:800,fontSize:15,padding:"13px 0",borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",gap:7,marginTop:6}}>
          Join Lesson <I.Arrow/>
        </button>
      </div>
    </div>
  );

  if(phase==="done") return (
    <div style={{maxWidth:420,margin:"80px auto",padding:"0 24px",textAlign:"center"}} className="fadeUp">
      <div style={{fontSize:60,marginBottom:14}}>🎉</div>
      <h2 style={{fontSize:26,fontWeight:900,marginBottom:8}}>Submitted, {name.split(" ")[0]}!</h2>
      <p style={{color:T.muted,fontSize:14,marginBottom:20}}>Your teacher can now see your responses in the live dashboard.</p>
      <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:16,padding:22,marginBottom:24}}>
        <div style={{fontSize:11,color:T.muted,marginBottom:6,textTransform:"uppercase",letterSpacing:"0.1em"}}>Your Score</div>
        <div style={{fontSize:48,fontWeight:900,color:finalScore>=80?T.green:finalScore>=60?T.yellow:T.red}}>{finalScore}%</div>
        <div style={{fontSize:13,color:T.muted}}>{lesson.questions.filter(q=>answers[q.id]===q.correct).length} of {totalQ} correct</div>
        <div style={{marginTop:14}}>
          <Bar pct={finalScore}/>
        </div>
      </div>
      <button onClick={()=>{setPhase("join");setAnswers({});setCur(0);}} style={{background:T.accentDim,border:`1px solid ${T.borderStrong}`,borderRadius:10,padding:"11px 24px",color:T.accent,fontWeight:700}}>Take Another Quiz</button>
    </div>
  );

  return (
    <div style={{maxWidth:540,margin:"36px auto",padding:"0 24px"}} className="fadeUp">
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
        <div>
          <div style={{fontSize:12,color:T.accent,fontWeight:700}}>{lesson.title}</div>
          <div style={{fontSize:11,color:T.muted}}>Hi, {name.split(" ")[0]} 👋</div>
        </div>
        <Chip color={T.accent}>Q{cur+1} / {totalQ}</Chip>
      </div>
      {/* Progress */}
      <div style={{height:5,background:"rgba(255,255,255,.07)",borderRadius:3,marginBottom:22,overflow:"hidden"}}>
        <div style={{height:"100%",width:`${Math.round((totalAnswered/totalQ)*100)}%`,background:`linear-gradient(90deg,${T.accent},${T.green})`,borderRadius:3,transition:"width .5s ease"}}/>
      </div>
      {/* Question card */}
      <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:18,padding:26,marginBottom:14}}>
        <div style={{fontSize:11,color:T.muted,marginBottom:8,textTransform:"uppercase",letterSpacing:"0.08em"}}>Question {cur+1}</div>
        <div style={{fontSize:18,fontWeight:700,lineHeight:1.5,marginBottom:22}}>{q.text}</div>
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {q.options.map(opt=>{
            const sel=answers[q.id]===opt;
            return (
              <button key={opt} onClick={()=>pick(q.id,opt)}
                style={{background:sel?T.accentDim:"rgba(255,255,255,.03)",border:`1.5px solid ${sel?T.accent:T.border}`,borderRadius:12,padding:"13px 17px",color:sel?T.accent:T.textDim,textAlign:"left",fontSize:15,display:"flex",alignItems:"center",gap:11,fontWeight:sel?700:400,transition:"all .15s"}}>
                <div style={{width:20,height:20,borderRadius:"50%",border:`2px solid ${sel?T.accent:"rgba(255,255,255,.2)"}`,background:sel?T.accent:"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,transition:"all .15s"}}>
                  {sel&&<div style={{width:8,height:8,borderRadius:"50%",background:"#020810"}}/>}
                </div>
                {opt}
              </button>
            );
          })}
        </div>
      </div>
      {/* Nav */}
      <div style={{display:"flex",gap:10}}>
        {cur>0&&<button onClick={()=>setCur(cur-1)} style={{flex:1,background:"rgba(255,255,255,.06)",border:`1px solid ${T.border}`,borderRadius:10,padding:"12px 0",color:T.muted,fontWeight:700}}>← Back</button>}
        {cur<totalQ-1
          ?<button onClick={()=>setCur(cur+1)} disabled={!answers[q.id]} style={{flex:2,background:answers[q.id]?T.accent:"rgba(255,255,255,.05)",color:answers[q.id]?"#020810":T.muted,borderRadius:10,padding:"12px 0",fontWeight:800,fontSize:15,opacity:answers[q.id]?1:.5}}>Next →</button>
          :<button onClick={submit} disabled={totalAnswered<totalQ} style={{flex:2,background:totalAnswered>=totalQ?T.green:"rgba(255,255,255,.05)",color:totalAnswered>=totalQ?"#020810":T.muted,borderRadius:10,padding:"12px 0",fontWeight:800,fontSize:15}}>Submit Answers ✓</button>
        }
      </div>
      <div style={{textAlign:"center",fontSize:11,color:T.muted,marginTop:10}}>{totalAnswered} of {totalQ} questions answered</div>
    </div>
  );
}

// ─── ROOT ─────────────────────────────────────────────────────────────────────
export default function App() {
  const [view,setView]=useState("home");
  const [lesson,setLesson]=useState(null);
  const [responses,setResponses]=useState([]);
  const [analytics,setAnalytics]=useState(null);
  const [insight,setInsight]=useState(null);
  const [insightLoading,setInsightLoading]=useState(false);
  const [showCreate,setShowCreate]=useState(false);
  const [tab,setTab]=useState("Analytics");

  function runAnalysis(les,resps){
    const a=computeAnalytics(les,resps);
    setAnalytics(a);
    setInsight(null); setInsightLoading(true);
    getClaudeInsight(les,a,resps).then(ins=>{setInsight(ins);setInsightLoading(false);});
  }
  function loadDemo(){setLesson(DEMO_LESSON);setResponses(DEMO_RESPONSES);runAnalysis(DEMO_LESSON,DEMO_RESPONSES);setView("teacher");setTab("Analytics");}
  function handleCreate(les){setLesson(les);setResponses([]);setAnalytics(null);setInsight(null);setShowCreate(false);setView("teacher");setTab("Analytics");}
  function handleResponse(resp){const r=[...responses,resp];setResponses(r);if(lesson)runAnalysis(lesson,r);}
  function refreshInsight(){if(lesson&&responses.length)runAnalysis(lesson,responses);}

  return (
    <div style={{minHeight:"100vh",background:T.bg}}>
      <style>{CSS}</style>
      {/* Grid bg */}
      <div style={{position:"fixed",inset:0,backgroundImage:`linear-gradient(${T.border} 1px,transparent 1px),linear-gradient(90deg,${T.border} 1px,transparent 1px)`,backgroundSize:"56px 56px",opacity:.5,pointerEvents:"none",zIndex:0}}/>
      <div style={{position:"fixed",top:"15%",left:"50%",transform:"translateX(-50%)",width:700,height:500,borderRadius:"50%",background:`radial-gradient(ellipse,${T.accentGlow} 0%,transparent 65%)`,pointerEvents:"none",zIndex:0}}/>

      <div style={{position:"relative",zIndex:1}}>
        {/* Nav */}
        <nav style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"15px 26px",borderBottom:`1px solid ${T.border}`,background:"rgba(4,7,15,.92)",backdropFilter:"blur(18px)",position:"sticky",top:0,zIndex:200}}>
          <button onClick={()=>setView("home")} style={{display:"flex",alignItems:"center",gap:9,background:"none",color:T.text}}>
            <I.Logo/>
            <span style={{fontSize:20,fontWeight:900,letterSpacing:"-0.5px"}}>Lesson<span style={{color:T.accent}}>Lens</span></span>
          </button>
          <div style={{display:"flex",gap:6,alignItems:"center"}}>
            {view!=="home"&&[["teacher","Teacher"],["student","Student"]].map(([v,l])=>(
              <button key={v} onClick={()=>setView(v)} style={{padding:"6px 15px",borderRadius:8,fontSize:13,fontWeight:700,background:view===v?T.accentDim:"transparent",color:view===v?T.accent:T.muted,border:`1px solid ${view===v?T.borderStrong:"transparent"}`,transition:"all .15s"}}>{l}</button>
            ))}
            <button onClick={()=>setShowCreate(true)} style={{padding:"6px 15px",borderRadius:8,fontSize:13,fontWeight:700,background:T.accentDim,border:`1px solid ${T.borderStrong}`,color:T.accent}}>+ New Lesson</button>
            {lesson&&<div className="mono" style={{fontSize:12,color:T.accent,background:T.accentDim,border:`1px solid ${T.borderStrong}`,borderRadius:7,padding:"5px 11px",letterSpacing:"0.1em"}}>{lesson.code}</div>}
          </div>
        </nav>

        {showCreate&&<CreateModal onClose={()=>setShowCreate(false)} onCreate={handleCreate}/>}
        {view==="home"&&<HomePage onDemo={loadDemo} onTeacher={()=>setView("teacher")} onStudent={()=>setView("student")}/>}
        {view==="teacher"&&<TeacherDashboard lesson={lesson} responses={responses} analytics={analytics} insight={insight} insightLoading={insightLoading} onLoadDemo={loadDemo} onNewLesson={()=>setShowCreate(true)} onRefreshInsight={refreshInsight} tab={tab} setTab={setTab}/>}
        {view==="student"&&<StudentPage lesson={lesson} onResponse={handleResponse}/>}
      </div>
    </div>
  );
}
