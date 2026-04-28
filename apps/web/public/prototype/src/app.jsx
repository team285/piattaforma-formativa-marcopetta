// ─── APP SHELL ─ 6 modalità: studente/coach/collab × mobile/desktop ───

const COACH_NAV = [
  { id:"dashboard", label:"Overview",    icon:"home" },
  { id:"students",  label:"Studenti",    icon:"grid" },
  { id:"team",      label:"Team coach",  icon:"users" },
  { id:"library",   label:"Libreria",    icon:"book" },
  { id:"review",    label:"Da correggere", icon:"inbox", badge:"5" },
  { id:"chat",      label:"Chat",        icon:"chat" },
  { id:"settings",  label:"Impostazioni", icon:"settings" },
];

function ViewSwitch({ persona, device, onChange }) {
  const resetAll = () => {
    ["mp_persona","mp_device","mp_smr","mp_sdr","mp_cmr","mp_cdr","mp_collabdr","mp_collabmr"].forEach(k => localStorage.removeItem(k));
    window.mpToast && window.mpToast("Stato app resettato", "info");
    setTimeout(()=> window.location.reload(), 400);
  };
  return (
    <div style={{position:"fixed", top:14, right:14, zIndex:999, display:"flex", gap:8}}>
      <div style={{display:"flex", alignItems:"center", gap:4, padding:5, background:"#0B0B0D", borderRadius:99, border:"1px solid #24242A", boxShadow:"0 6px 20px rgba(0,0,0,0.4)"}}>
        <div style={{fontFamily:"JetBrains Mono,monospace", fontSize:9, letterSpacing:"0.2em", textTransform:"uppercase", color:"#9A9AA2", padding:"0 8px 0 10px"}}>vista</div>
        {[
          {p:"student", d:"mobile",  l:"Studente · app"},
          {p:"student", d:"desktop", l:"Studente · web"},
          {p:"coach",   d:"mobile",  l:"Marco · app"},
          {p:"coach",   d:"desktop", l:"Marco · web"},
          {p:"collab",  d:"mobile",  l:"Collab · app"},
          {p:"collab",  d:"desktop", l:"Collab · web"},
        ].map(v=>{
          const active = persona===v.p && device===v.d;
          return (
            <button key={v.p+v.d} onClick={()=>onChange(v.p, v.d)} style={{height:26, padding:"0 11px", borderRadius:99, fontSize:10.5, fontWeight:600, fontFamily:"'Big Shoulders Display',sans-serif", textTransform:"uppercase", letterSpacing:"0.05em", background: active?"#F2B744":"transparent", color: active?"#0B0B0D":"#9A9AA2"}}>{v.l}</button>
          );
        })}
      </div>
      <button
        onClick={resetAll}
        title="Reset stato app (localStorage)"
        style={{height:36, padding:"0 10px", background:"#0B0B0D", border:"1px solid #24242A", borderRadius:99, color:"#9A9AA2", fontSize:10.5, fontFamily:"'Big Shoulders Display',sans-serif", fontWeight:600, textTransform:"uppercase", letterSpacing:"0.05em", display:"inline-flex", alignItems:"center", gap:6, boxShadow:"0 6px 20px rgba(0,0,0,0.4)"}}>
        <Icon name="x" size={12}/> Reset
      </button>
    </div>
  );
}

function Sidebar({ route, onRoute }) {
  const user = window.COACH;
  return (
    <aside className="w-[248px] bg-ink text-paper flex flex-col border-r border-line-dark">
      <div className="px-5 pt-6 pb-5 border-b border-line-dark">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-[2px] bg-[var(--amber)] flex items-center justify-center font-display text-xl text-black" style={{fontWeight:900}}>P</div>
          <div>
            <div className="font-display text-[17px] leading-none">Marco Petta</div>
            <div className="font-mono text-[9px] uppercase tracking-[0.22em] text-[#9E8E82] mt-1">metodo p.g.t.</div>
          </div>
        </div>
        <div className="mt-4 font-display text-[15px] text-[#C9BDB1] leading-[1.05]" style={{fontWeight:700,textTransform:"uppercase",letterSpacing:"0.02em"}}>
          Smetti di suonare a caso.<br/>Inizia a <span className="text-[var(--amber)]">capire</span>.
        </div>
      </div>
      <div className="px-4 pt-4 pb-2">
        <div className="font-mono text-[9px] uppercase tracking-[0.22em] text-[#9E8E82] mb-2 px-1">Vista coach · web</div>
      </div>
      <nav className="flex-1 px-3 py-1 space-y-0.5 overflow-y-auto no-scrollbar">
        {COACH_NAV.map(it=>{
          const active = route===it.id || (it.id==="students" && route==="student");
          return (
            <button key={it.id} onClick={()=>onRoute(it.id)} className={"w-full flex items-center gap-3 px-3 h-10 rounded-[2px] text-left transition "+(active?"bg-[var(--amber)] text-black":"text-[#C9BDB1] hover:bg-ink-2")}>
              <Icon name={it.icon} size={15}/>
              <span className="text-[13px] flex-1" style={active?{fontWeight:600}:{}}>{it.label}</span>
              {it.badge && <span className={"text-[10px] font-mono px-1.5 h-5 rounded-full flex items-center "+(active?"bg-black/20 text-black":"bg-[var(--amber)] text-black")} style={{fontWeight:700}}>{it.badge}</span>}
            </button>
          );
        })}
      </nav>
      <div className="px-4 py-4 border-t border-line-dark flex items-center gap-3">
        <Avatar initials={user.initials} size={34} tone="ember"/>
        <div className="flex-1 min-w-0">
          <div className="text-[13px] truncate">{user.fullName}</div>
          <div className="font-mono text-[10px] uppercase tracking-wider text-[#9E8E82]">coach · admin</div>
        </div>
      </div>
    </aside>
  );
}

// Legge query string ?persona=...&device=...&dev=1
// Quando il prototipo è embedded in MPCoach App via iframe, l'app esterna
// passa il ruolo dell'utente loggato + il device viewport detection.
// Se i parametri sono presenti, sovrascrivono il localStorage.
function readQueryString() {
  if (typeof window === "undefined") return {};
  try {
    const u = new URL(window.location.href);
    return {
      persona: u.searchParams.get("persona"),  // "student" | "coach" | "collab"
      device:  u.searchParams.get("device"),    // "mobile" | "desktop"
      dev:     u.searchParams.get("dev") === "1",
    };
  } catch (_e) { return {}; }
}

const QS = readQueryString();
const QS_HAS_OVERRIDE = !!(QS.persona || QS.device);
const SHOW_VIEWSWITCH = QS.dev || !QS_HAS_OVERRIDE;

function App() {
  const [persona, setPersona] = React.useState(() => {
    if (QS.persona === "student" || QS.persona === "coach" || QS.persona === "collab") return QS.persona;
    return localStorage.getItem("mp_persona") || "student";
  });
  const [device, setDevice] = React.useState(() => {
    if (QS.device === "mobile" || QS.device === "desktop") return QS.device;
    return localStorage.getItem("mp_device") || "mobile";
  });

  const [studentMobileRoute, setSMR] = React.useState(() => localStorage.getItem("mp_smr") || "home");
  const [studentDesktopRoute, setSDR] = React.useState(() => localStorage.getItem("mp_sdr") || "home");
  const [coachMobileRoute, setCMR] = React.useState(() => localStorage.getItem("mp_cmr") || "review");
  const [coachDesktopRoute, setCDR] = React.useState(() => localStorage.getItem("mp_cdr") || "dashboard");
  const [collabMobileRoute, setCollabMR] = React.useState(() => localStorage.getItem("mp_collabmr") || "dashboard");
  const [collabDesktopRoute, setCollabDR] = React.useState(() => localStorage.getItem("mp_collabdr") || "dashboard");

  React.useEffect(()=>{ localStorage.setItem("mp_persona", persona); }, [persona]);
  React.useEffect(()=>{ localStorage.setItem("mp_device", device); }, [device]);
  React.useEffect(()=>{ localStorage.setItem("mp_smr", studentMobileRoute); }, [studentMobileRoute]);
  React.useEffect(()=>{ localStorage.setItem("mp_sdr", studentDesktopRoute); }, [studentDesktopRoute]);
  React.useEffect(()=>{ localStorage.setItem("mp_cmr", coachMobileRoute); }, [coachMobileRoute]);
  React.useEffect(()=>{ localStorage.setItem("mp_cdr", coachDesktopRoute); }, [coachDesktopRoute]);
  React.useEffect(()=>{ localStorage.setItem("mp_collabmr", collabMobileRoute); }, [collabMobileRoute]);
  React.useEffect(()=>{ localStorage.setItem("mp_collabdr", collabDesktopRoute); }, [collabDesktopRoute]);

  const handleChange = (p, d) => { setPersona(p); setDevice(d); };

  let content;
  let label = "";
  if (persona==="student" && device==="mobile") {
    content = <window.StudentMobile route={studentMobileRoute} onRoute={setSMR}/>;
    label = "Studente · app mobile · " + studentMobileRoute;
  } else if (persona==="student" && device==="desktop") {
    content = <window.StudentDesktop route={studentDesktopRoute} onRoute={setSDR}/>;
    label = "Studente · web desktop · " + studentDesktopRoute;
  } else if (persona==="coach" && device==="mobile") {
    content = <window.CoachMobile route={coachMobileRoute} onRoute={setCMR}/>;
    label = "Coach · app mobile · " + coachMobileRoute;
  } else if (persona==="coach" && device==="desktop") {
    const renderCoach = () => {
      if (coachDesktopRoute==="dashboard") return <window.CoachDashboard nav={setCDR}/>;
      if (coachDesktopRoute==="students")  return <window.CoachStudents nav={setCDR}/>;
      if (coachDesktopRoute==="student")   return <window.CoachStudent nav={setCDR}/>;
      if (coachDesktopRoute==="team")      return <window.CoachTeam nav={setCDR}/>;
      if (coachDesktopRoute==="library")   return <window.CoachLibrary nav={setCDR}/>;
      if (coachDesktopRoute==="review")    return <window.CoachReview nav={setCDR}/>;
      if (coachDesktopRoute==="chat")      return <window.StudentChat nav={setCDR} perspective="coach"/>;
      if (coachDesktopRoute==="settings")  return <window.CoachSettings nav={setCDR}/>;
      // Fallback: route sconosciuta (es. localStorage legacy) → torna alla dashboard
      return <window.CoachDashboard nav={setCDR}/>;
    };
    content = (
      <div className="flex min-h-screen">
        <Sidebar route={coachDesktopRoute} onRoute={setCDR}/>
        <main className="flex-1 min-w-0">{renderCoach()}</main>
      </div>
    );
    label = "Coach · web desktop · " + coachDesktopRoute;
  } else if (persona==="collab" && device==="mobile") {
    content = <window.CollabMobile route={collabMobileRoute} onRoute={setCollabMR}/>;
    label = "Collab · app mobile · " + collabMobileRoute;
  } else {
    content = <window.CollabDesktop route={collabDesktopRoute} onRoute={setCollabDR}/>;
    label = "Collab · web desktop · " + collabDesktopRoute;
  }

  return (
    <>
      {SHOW_VIEWSWITCH && (
        <ViewSwitch persona={persona} device={device} onChange={handleChange}/>
      )}
      <div data-screen-label={label}>{content}</div>
      <window.MPToastHost/>
    </>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App/>);
