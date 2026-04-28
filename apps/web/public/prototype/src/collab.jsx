// ─── COLLAB (Paolo Marchetti · Coach senior) ─────────────────────────
// Persona con scope ridotto: solo i propri 5 studenti, la coda assegnata
// da Marco, le chat coi propri, e l'archivio feedback dati.
// NON vede: MRR, churn, library edit, altri studenti, fatturazione.

// ─── NAV DESKTOP (sidebar) ───────────────────────────────────────────
const COLLAB_NAV = [
  { id:"dashboard", label:"Overview",    icon:"home" },
  { id:"students",  label:"I miei studenti", icon:"users" },
  { id:"review",    label:"Da correggere", icon:"inbox", badge:"3" },
  { id:"chat",      label:"Chat",         icon:"chat", badge:"3" },
  { id:"feedback",  label:"Archivio feedback", icon:"book" },
];

// ─── TABS MOBILE ─────────────────────────────────────────────────────
const COLLAB_TABS = [
  { id:"dashboard", label:"Overview",  icon:"home" },
  { id:"review",    label:"Correggi",  icon:"inbox", badge:true },
  { id:"students",  label:"Studenti",  icon:"users" },
  { id:"chat",      label:"Chat",      icon:"chat", badge:true },
];

// ─── SIDEBAR DESKTOP ─────────────────────────────────────────────────
function CollabSidebar({ route, onRoute }) {
  const p = window.COLLAB_PROFILE;
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
        <div className="mt-4 font-display text-[13px] text-[#C9BDB1] leading-[1.1]" style={{fontWeight:600,textTransform:"uppercase",letterSpacing:"0.02em"}}>
          Accompagni i primi passi.<br/>Marco prende il <span className="text-[var(--amber)]">testimone</span>.
        </div>
      </div>
      <div className="px-4 pt-4 pb-2">
        <div className="font-mono text-[9px] uppercase tracking-[0.22em] text-[#9E8E82] mb-2 px-1">Vista collab · web</div>
      </div>
      <nav className="flex-1 px-3 py-1 space-y-0.5 overflow-y-auto no-scrollbar">
        {COLLAB_NAV.map(it=>{
          const active = route===it.id;
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
        <Avatar initials={p.initials} size={34} tone="sand"/>
        <div className="flex-1 min-w-0">
          <div className="text-[13px] truncate">{p.name}</div>
          <div className="font-mono text-[10px] uppercase tracking-wider text-[#9E8E82]">{p.role.toLowerCase()}</div>
        </div>
      </div>
    </aside>
  );
}

// ─── DASHBOARD DESKTOP ───────────────────────────────────────────────
function CollabDashboard({ nav }) {
  const p = window.COLLAB_PROFILE;
  const s = window.COLLAB_STATS;
  const queue = window.COLLAB_QUEUE || [];
  const students = window.COLLAB_STUDENTS || [];

  return (
    <div className="min-h-full bg-paper fade-in">
      <div className="max-w-[1200px] mx-auto px-10 py-10">

        <div className="flex items-end justify-between mb-10">
          <div>
            <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-smoke mb-3">Martedì 21 aprile · coach senior</div>
            <h1 className="font-editorial text-[56px]">Ciao <span className="italic-ember">{p.name.split(" ")[0]}</span>.</h1>
            <div className="text-[15px] text-smoke mt-3 max-w-[520px]">
              Hai <span className="text-ink font-medium">{s.assigned} video</span> assegnati da Marco e <span className="text-ink font-medium">{s.unreadMsgs} messaggi</span> dai tuoi studenti.
            </div>
          </div>
          <div className="text-right">
            <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-smoke mb-1">{p.tagline}</div>
            <div className="font-mono text-[10px] text-smoke">{p.yearsWithMarco} anni con Marco · {p.studentsAssigned} studenti</div>
          </div>
        </div>

        {/* KPI operativi — SOLO lato collab (niente MRR/churn) */}
        <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-smoke mb-3">Oggi</div>
        <div className="grid grid-cols-4 gap-4 mb-12">
          <StatCard label="Da correggere"      value={s.assigned}      sub="assegnati da Marco" ember/>
          <StatCard label="I miei studenti"    value={s.myStudents}    sub="tutti base/intermedi"/>
          <StatCard label="Messaggi non letti" value={s.unreadMsgs}    sub="in chat 1:1"/>
          <StatCard label="Feedback settimana" value={s.sentThisWeek}  sub="inviati questa settimana"/>
        </div>

        {/* Coda priority */}
        <div className="flex items-end justify-between mb-5">
          <EditorialH kicker="Priorità di oggi">Coda video da <span className="italic-ember">correggere</span></EditorialH>
          <button onClick={()=>nav("review")} className="h-8 px-3 border border-line rounded-[2px] text-[12px] text-smoke hover:text-ink">
            Apri tutti ({queue.length})
          </button>
        </div>

        <div className="bg-paper-2 border border-line rounded-[3px] overflow-hidden mb-12">
          {queue.length === 0 && (
            <div className="p-8 text-center text-[13px] text-smoke">Nessun video in coda.</div>
          )}
          {queue.map((q,i)=>(
            <button key={q.id} onClick={()=>nav("review")} className="w-full flex items-center gap-5 p-5 text-left hover:bg-sand transition border-t border-line first:border-t-0 group">
              <Avatar initials={q.initials} size={46} tone="ink"/>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                  <span className="font-display text-xl">{q.student}</span>
                  <Tag>assegnato da {q.assignedBy}</Tag>
                </div>
                <div className="text-[13px] text-smoke truncate">{q.title} · {q.exerciseRef}</div>
              </div>
              <Thumb label={"take · "+q.duration} dark aspect="16/9" className="w-40"/>
              <div className="text-right">
                <div className="font-mono text-[11px] uppercase tracking-wider text-smoke mb-1">in attesa</div>
                <div className="text-[14px]">{q.waiting}</div>
              </div>
              <Icon name="chevron" size={14} className="text-smoke group-hover:text-ink transition"/>
            </button>
          ))}
        </div>

        {/* I miei studenti — preview 5 card */}
        <div className="flex items-end justify-between mb-5">
          <EditorialH kicker="I 5 studenti assegnati">I tuoi <span className="italic-ember">allievi</span></EditorialH>
          <button onClick={()=>nav("students")} className="h-8 px-3 border border-line rounded-[2px] text-[12px] text-smoke hover:text-ink">
            Tutti i profili
          </button>
        </div>
        <div className="grid grid-cols-5 gap-3 mb-12">
          {students.map(s=>(
            <button key={s.name} onClick={()=>nav("students")} className="text-left bg-paper-2 border border-line rounded-[3px] p-4 hover:border-ink transition">
              <Avatar initials={s.i} size={40} tone={s.flag?"ember":"ink"}/>
              <div className="font-display text-[15px] mt-3 truncate">{s.name}</div>
              <div className="font-mono text-[9px] uppercase tracking-wider text-smoke mt-1">{s.level}</div>
              <div className="mt-3">
                <div className="h-[3px] bg-line rounded-full overflow-hidden">
                  <div className="h-full bg-ember rounded-full" style={{width:s.prog+"%"}}/>
                </div>
                <div className="flex justify-between mt-1.5">
                  <span className="font-mono text-[9px] text-smoke">{s.prog}%</span>
                  <span className="font-mono text-[9px] text-smoke">{s.lastActive}</span>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Strip info — scope + handoff a Marco */}
        <div className="bg-ink text-paper rounded-[3px] p-8 grid grid-cols-3 gap-8">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--amber)] mb-2">Cosa fai</div>
            <div className="font-editorial text-[22px] leading-[1.2]">Accompagni i primi mesi.</div>
            <div className="text-[12px] text-[#C9BDB1] mt-2">Video-feedback, chat, annotazioni. Stessa qualità del metodo di Marco.</div>
          </div>
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--amber)] mb-2">Cosa non vedi</div>
            <div className="font-editorial text-[22px] leading-[1.2]">Business & contratti.</div>
            <div className="text-[12px] text-[#C9BDB1] mt-2">MRR, fatturazione, percorsi ad alti livelli. Marco resta il riferimento unico.</div>
          </div>
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--amber)] mb-2">Handoff</div>
            <div className="font-editorial text-[22px] leading-[1.2]">Mese 3 → Marco.</div>
            <div className="text-[12px] text-[#C9BDB1] mt-2">Passi le redini di ogni studente quando raggiunge il livello intermedio.</div>
          </div>
        </div>

      </div>
    </div>
  );
}

// ─── STUDENTS DESKTOP ────────────────────────────────────────────────
function CollabStudents({ nav }) {
  const students = window.COLLAB_STUDENTS || [];
  const [search, setSearch] = React.useState("");
  const q = search.trim().toLowerCase();
  const filtered = students.filter(s => !q || s.name.toLowerCase().includes(q) || s.level.toLowerCase().includes(q));

  return (
    <div className="min-h-full bg-paper fade-in">
      <div className="max-w-[1200px] mx-auto px-10 py-8">
        <div className="flex items-end justify-between pb-6 border-b border-line">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-smoke mb-2">
              {students.length} studenti assegnati · tutti principianti/base
            </div>
            <h1 className="font-editorial text-[52px]">I tuoi <span className="italic-ember">allievi</span>.</h1>
          </div>
        </div>

        <div className="mt-6 flex items-center gap-3">
          <div className="flex items-center gap-2 bg-paper-2 border border-line rounded-[3px] px-3 h-10 flex-1 max-w-[420px]">
            <Icon name="search" size={14} className="text-smoke"/>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Cerca…" className="flex-1 bg-transparent outline-none text-[13px] text-ink placeholder:text-smoke"/>
            {search && <button onClick={()=>setSearch("")} className="text-smoke hover:text-ink"><Icon name="x" size={13}/></button>}
          </div>
        </div>

        <div className="mt-6 font-mono text-[10px] uppercase tracking-[0.22em] text-smoke mb-3">
          {filtered.length} {filtered.length===1?"risultato":"risultati"}
        </div>

        <div className="grid grid-cols-3 gap-4">
          {filtered.map(s=>(
            <button key={s.name}
              onClick={()=>window.mpToast && window.mpToast("Profilo dettagliato · demo limitata", "info")}
              className="text-left bg-paper-2 border border-line rounded-[3px] p-5 hover:border-ink transition group">
              <div className="flex items-start gap-4">
                <Avatar initials={s.i} size={52} tone={s.flag?"ember":"ink"}/>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="font-display text-[22px] leading-[1.05] truncate">{s.name}</div>
                    {s.flag && <span className="w-2 h-2 rounded-full bg-ember flex-shrink-0 mt-2"/>}
                  </div>
                  <div className="font-mono text-[10px] uppercase tracking-wider text-smoke mt-1">
                    {s.level} · {s.lastActive}
                  </div>
                </div>
              </div>
              <div className="mt-4">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-mono text-[10px] uppercase tracking-wider text-smoke">Percorso</span>
                  <span className="font-mono text-[11px] text-ink">{s.prog}%</span>
                </div>
                <div className="h-[3px] bg-line rounded-full overflow-hidden">
                  <div className="h-full bg-ember rounded-full" style={{width:s.prog+"%"}}/>
                </div>
              </div>
              {s.flag && (
                <div className="mt-4 text-[12px] text-ember inline-flex items-center gap-1.5">
                  <Icon name="inbox" size={12}/> {s.flag}
                </div>
              )}
              <div className="mt-4 pt-4 border-t border-line flex items-center justify-between text-[12px]">
                <span className="text-smoke group-hover:text-ink transition">Apri profilo</span>
                <Icon name="chevron" size={13} className="text-smoke group-hover:text-ink transition"/>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── REVIEW DESKTOP (queue focused) ──────────────────────────────────
function CollabReview({ nav }) {
  const queue = window.COLLAB_QUEUE || [];
  return (
    <div className="min-h-full bg-paper fade-in">
      <div className="max-w-[1100px] mx-auto px-10 py-10">
        <div className="flex items-end justify-between mb-8">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-smoke mb-2">Assegnati da Marco · {queue.length} video</div>
            <h1 className="font-editorial text-[52px]">Da <span className="italic-ember">correggere</span>.</h1>
          </div>
        </div>
        <div className="bg-paper-2 border border-line rounded-[3px] overflow-hidden">
          {queue.map((q,i)=>(
            <div key={q.id} className="w-full flex items-center gap-5 p-5 text-left border-t border-line first:border-t-0">
              <Avatar initials={q.initials} size={46} tone="ink"/>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                  <span className="font-display text-xl">{q.student}</span>
                  <Tag>assegnato da {q.assignedBy}</Tag>
                </div>
                <div className="text-[13px] text-smoke truncate">{q.title} · {q.exerciseRef}</div>
              </div>
              <Thumb label={"take · "+q.duration} dark aspect="16/9" className="w-40"/>
              <div className="text-right">
                <div className="font-mono text-[11px] uppercase tracking-wider text-smoke mb-1">in attesa</div>
                <div className="text-[14px]">{q.waiting}</div>
              </div>
              <button
                onClick={()=>window.mpToast && window.mpToast("Correzione aperta · "+q.student.split(" ")[0], "info")}
                className="h-10 px-4 rounded-[2px] bg-ink text-paper text-[12px] font-display uppercase tracking-wider">
                Correggi
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── FEEDBACK ARCHIVE DESKTOP ────────────────────────────────────────
function CollabFeedback() {
  const history = window.COLLAB_FEEDBACK_HISTORY || [];
  return (
    <div className="min-h-full bg-paper fade-in">
      <div className="max-w-[1100px] mx-auto px-10 py-10">
        <div className="flex items-end justify-between mb-8">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-smoke mb-2">Archivio feedback · {history.length} inviati</div>
            <h1 className="font-editorial text-[52px]">Cosa hai <span className="italic-ember">risposto</span>.</h1>
          </div>
        </div>
        <div className="bg-paper-2 border border-line rounded-[3px] overflow-hidden">
          {history.map(h=>(
            <div key={h.id} className="flex items-center gap-5 p-5 border-t border-line first:border-t-0">
              <Avatar initials={h.initials} size={44} tone="ink"/>
              <div className="flex-1 min-w-0">
                <div className="font-display text-[18px] truncate">{h.student}</div>
                <div className="text-[12px] text-smoke truncate">{h.title}</div>
              </div>
              <div className="text-right">
                <div className="font-mono text-[10px] uppercase tracking-wider text-smoke">data</div>
                <div className="text-[13px]">{h.date}</div>
              </div>
              <div className="text-right">
                <div className="font-mono text-[10px] uppercase tracking-wider text-smoke">annotazioni</div>
                <div className="text-[13px]">{h.annotations}</div>
              </div>
              <div className="text-right">
                <div className="font-mono text-[10px] uppercase tracking-wider text-smoke">rating medio</div>
                <div className="text-[13px]">{h.ratingAvg}/5</div>
              </div>
              <StatusPill status="delivered"/>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── SHELL DESKTOP ───────────────────────────────────────────────────
function CollabDesktop({ route, onRoute }) {
  const renderScreen = () => {
    if (route==="dashboard") return <CollabDashboard nav={onRoute}/>;
    if (route==="students")  return <CollabStudents nav={onRoute}/>;
    if (route==="review")    return <CollabReview nav={onRoute}/>;
    if (route==="feedback")  return <CollabFeedback/>;
    if (route==="chat")      return <window.StudentChat nav={onRoute} perspective="collab"/>;
    return <CollabDashboard nav={onRoute}/>;
  };
  return (
    <div className="flex min-h-screen">
      <CollabSidebar route={route} onRoute={onRoute}/>
      <main className="flex-1 min-w-0">{renderScreen()}</main>
    </div>
  );
}

// ─── MOBILE ──────────────────────────────────────────────────────────

function CollabMBottomTab({ route, onRoute }) {
  return (
    <div style={{margin:"0 14px", borderRadius:26, overflow:"hidden", position:"relative",
      boxShadow:"0 10px 30px rgba(0,0,0,0.45), 0 0 0 0.5px rgba(250,247,242,0.08)"}}>
      <div style={{position:"absolute", inset:0, background:"rgba(11,11,13,0.82)",
        backdropFilter:"blur(22px) saturate(180%)", WebkitBackdropFilter:"blur(22px) saturate(180%)"}}/>
      <div style={{position:"relative", display:"flex", padding:"10px 6px"}}>
        {COLLAB_TABS.map(t=>{
          const active = route===t.id;
          return (
            <button key={t.id} onClick={()=>onRoute(t.id)} style={{flex:1, display:"flex", flexDirection:"column",
              alignItems:"center", gap:3, padding:"8px 0", color: active?"#F2B744":"#8A8A92"}}>
              <div style={{position:"relative"}}>
                <Icon name={t.icon} size={20} stroke={active?2:1.6}/>
                {t.badge && <div style={{position:"absolute", top:-2, right:-4, width:7, height:7, borderRadius:99, background:"#F2B744", boxShadow:"0 0 0 1.5px #0B0B0D"}}/>}
              </div>
              <span style={{fontSize:10, fontWeight: active?600:500, letterSpacing:"0.02em"}}>{t.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function CollabMDashboard({ nav }) {
  const p = window.COLLAB_PROFILE;
  const s = window.COLLAB_STATS;
  const queue = window.COLLAB_QUEUE || [];
  const students = window.COLLAB_STUDENTS || [];

  return (
    <div style={{background:"#0B0B0D", color:"#F5F3ED", minHeight:"100%", paddingBottom:140}}>
      <div style={{padding:"68px 22px 14px 22px"}}>
        <div style={{fontFamily:"JetBrains Mono,monospace", fontSize:10, letterSpacing:"0.22em", textTransform:"uppercase", color:"#8A8A92", marginBottom:10}}>
          coach senior · oggi
        </div>
        <h1 style={{fontFamily:"'Big Shoulders Display',sans-serif", fontWeight:800, textTransform:"uppercase", fontSize:34, lineHeight:1.02, letterSpacing:"-0.01em", color:"#F5F3ED", margin:0}}>
          Ciao {p.name.split(" ")[0]}.<br/>
          <em style={{color:"#F2B744", fontStyle:"normal"}}>{s.assigned} video</em> ti aspettano.
        </h1>
      </div>

      {/* KPI tiles 2×2 */}
      <div style={{padding:"10px 16px 0", display:"grid", gridTemplateColumns:"1fr 1fr", gap:10}}>
        {[
          {l:"Da correggere",      v:s.assigned,     s:"da Marco", ember:true},
          {l:"I miei studenti",    v:s.myStudents,   s:"base/intermedio"},
          {l:"Messaggi non letti", v:s.unreadMsgs,   s:"in chat"},
          {l:"Feedback settimana", v:s.sentThisWeek, s:"inviati"},
        ].map((k,i)=>(
          <div key={i} style={{
            background: k.ember?"#E04A3A":"#141417",
            border:"1px solid "+(k.ember?"#E04A3A":"#24242A"),
            borderRadius:14, padding:"14px 14px",
          }}>
            <div style={{fontFamily:"JetBrains Mono,monospace", fontSize:9, textTransform:"uppercase", letterSpacing:"0.18em", color: k.ember?"rgba(255,255,255,0.85)":"#8A8A92", marginBottom:8}}>{k.l}</div>
            <div style={{fontFamily:"'Big Shoulders Display',sans-serif", fontWeight:800, fontSize:36, lineHeight:1, color: k.ember?"#fff":"#F5F3ED"}}>{k.v}</div>
            <div style={{fontSize:10, color: k.ember?"rgba(255,255,255,0.85)":"#9A9AA2", marginTop:4}}>{k.s}</div>
          </div>
        ))}
      </div>

      {/* Coda compatta */}
      <div style={{padding:"20px 16px 6px", display:"flex", justifyContent:"space-between", alignItems:"baseline"}}>
        <div style={{fontFamily:"JetBrains Mono,monospace", fontSize:10, letterSpacing:"0.22em", textTransform:"uppercase", color:"#8A8A92"}}>
          coda · {queue.length}
        </div>
        <button onClick={()=>nav("review")} style={{fontSize:11, color:"#F2B744", fontFamily:"JetBrains Mono,monospace", letterSpacing:"0.1em", textTransform:"uppercase"}}>
          apri tutti →
        </button>
      </div>
      <div style={{padding:"0 16px", display:"flex", flexDirection:"column", gap:8}}>
        {queue.slice(0,3).map(q=>(
          <button key={q.id} onClick={()=>nav("review")} style={{background:"#141417", border:"1px solid #24242A", borderRadius:12, padding:12, textAlign:"left", display:"flex", gap:10, alignItems:"center"}}>
            <Avatar initials={q.initials} size={36} tone="ember"/>
            <div style={{flex:1, minWidth:0}}>
              <div style={{fontFamily:"'Big Shoulders Display',sans-serif", fontWeight:700, fontSize:15, textTransform:"uppercase", letterSpacing:"0.01em"}}>{q.student}</div>
              <div style={{fontSize:11, color:"#9A9AA2", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap"}}>{q.title}</div>
            </div>
            <div style={{textAlign:"right", flexShrink:0}}>
              <div style={{fontFamily:"JetBrains Mono,monospace", fontSize:9, color:"#8A8A92", textTransform:"uppercase", letterSpacing:"0.12em"}}>attesa</div>
              <div style={{fontSize:12}}>{q.waiting}</div>
            </div>
            <Icon name="chevron" size={13} color="#9A9AA2"/>
          </button>
        ))}
      </div>

      {/* Studenti rapidi — avatar row */}
      <div style={{padding:"22px 16px 6px"}}>
        <div style={{fontFamily:"JetBrains Mono,monospace", fontSize:10, letterSpacing:"0.22em", textTransform:"uppercase", color:"#8A8A92", marginBottom:10}}>
          i tuoi 5 allievi
        </div>
        <div style={{display:"flex", gap:10, overflowX:"auto"}} className="no-scrollbar">
          {students.map(st=>(
            <button key={st.name} onClick={()=>nav("students")} style={{flexShrink:0, width:110, background:"#141417", border:"1px solid #24242A", borderRadius:12, padding:12, textAlign:"left"}}>
              <Avatar initials={st.i} size={36} tone={st.flag?"ember":"ink"}/>
              <div style={{fontFamily:"'Big Shoulders Display',sans-serif", fontWeight:700, fontSize:13, textTransform:"uppercase", letterSpacing:"0.01em", marginTop:8, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap"}}>{st.name}</div>
              <div style={{fontFamily:"JetBrains Mono,monospace", fontSize:9, color:"#8A8A92", textTransform:"uppercase", letterSpacing:"0.1em", marginTop:2}}>{st.level}</div>
              <div style={{height:3, background:"#24242A", borderRadius:99, overflow:"hidden", marginTop:8}}>
                <div style={{height:"100%", width:st.prog+"%", background:"#F2B744"}}/>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Footer scope strip */}
      <div style={{padding:"22px 16px 0"}}>
        <div style={{background:"#141417", border:"1px solid #24242A", borderRadius:14, padding:14}}>
          <div style={{fontFamily:"JetBrains Mono,monospace", fontSize:9, letterSpacing:"0.22em", textTransform:"uppercase", color:"#F2B744", marginBottom:6}}>scope</div>
          <div style={{fontSize:13, color:"#D9D9DE", lineHeight:1.45}}>
            Accompagni i primi 3 mesi. Marco prende il testimone al livello intermedio. Niente business, niente contratti.
          </div>
        </div>
      </div>
    </div>
  );
}

function CollabMStudents({ nav }) {
  const students = window.COLLAB_STUDENTS || [];
  return (
    <div style={{background:"#0B0B0D", color:"#F5F3ED", minHeight:"100%", paddingBottom:140}}>
      <div style={{padding:"68px 22px 14px 22px"}}>
        <div style={{fontFamily:"JetBrains Mono,monospace", fontSize:10, letterSpacing:"0.22em", textTransform:"uppercase", color:"#8A8A92", marginBottom:10}}>
          {students.length} studenti assegnati
        </div>
        <h1 style={{fontFamily:"'Big Shoulders Display',sans-serif", fontWeight:800, textTransform:"uppercase", fontSize:34, lineHeight:1.02, letterSpacing:"-0.01em", margin:0}}>
          I tuoi <em style={{color:"#F2B744", fontStyle:"normal"}}>allievi</em>.
        </h1>
      </div>
      <div style={{padding:"10px 16px 0", display:"flex", flexDirection:"column", gap:10}}>
        {students.map(s=>(
          <button key={s.name} onClick={()=>window.mpToast && window.mpToast("Profilo dettagliato · demo limitata", "info")}
            style={{background:"#141417", border:"1px solid "+(s.flag?"rgba(224,74,58,0.4)":"#24242A"), borderRadius:14, padding:14, display:"flex", gap:12, alignItems:"center", textAlign:"left"}}>
            <Avatar initials={s.i} size={44} tone={s.flag?"ember":"ink"}/>
            <div style={{flex:1, minWidth:0}}>
              <div style={{display:"flex", alignItems:"center", gap:6, marginBottom:4}}>
                <span style={{fontFamily:"'Big Shoulders Display',sans-serif", fontWeight:800, fontSize:17, textTransform:"uppercase", letterSpacing:"0.01em"}}>{s.name}</span>
                {s.flag && <span style={{width:6, height:6, borderRadius:99, background:"#E04A3A"}}/>}
              </div>
              <div style={{fontFamily:"JetBrains Mono,monospace", fontSize:9, color:"#8A8A92", textTransform:"uppercase", letterSpacing:"0.12em", marginBottom:6}}>
                {s.level} · {s.lastActive}
              </div>
              <div style={{height:3, background:"#24242A", borderRadius:99, overflow:"hidden"}}>
                <div style={{height:"100%", width:s.prog+"%", background:"#F2B744"}}/>
              </div>
              {s.flag && <div style={{fontSize:11, color:"#E04A3A", marginTop:6}}>{s.flag}</div>}
            </div>
            <Icon name="chevron" size={13} color="#9A9AA2"/>
          </button>
        ))}
      </div>
    </div>
  );
}

function CollabMReview({ nav }) {
  const queue = window.COLLAB_QUEUE || [];
  return (
    <div style={{background:"#0B0B0D", color:"#F5F3ED", minHeight:"100%", paddingBottom:140}}>
      <div style={{padding:"68px 22px 14px 22px"}}>
        <div style={{fontFamily:"JetBrains Mono,monospace", fontSize:10, letterSpacing:"0.22em", textTransform:"uppercase", color:"#8A8A92", marginBottom:10}}>
          {queue.length} video · assegnati da Marco
        </div>
        <h1 style={{fontFamily:"'Big Shoulders Display',sans-serif", fontWeight:800, textTransform:"uppercase", fontSize:34, lineHeight:1.02, letterSpacing:"-0.01em", margin:0}}>
          Da <em style={{color:"#F2B744", fontStyle:"normal"}}>correggere</em>.
        </h1>
      </div>
      <div style={{padding:"10px 16px 0", display:"flex", flexDirection:"column", gap:10}}>
        {queue.map(q=>(
          <button key={q.id}
            onClick={()=>window.mpToast && window.mpToast("Correzione aperta · "+q.student.split(" ")[0], "info")}
            style={{background:"#141417", border:"1px solid #24242A", borderRadius:14, padding:14, textAlign:"left", display:"flex", gap:12, alignItems:"flex-start"}}>
            <div style={{position:"relative", width:68, height:80, borderRadius:10, overflow:"hidden", background:"repeating-linear-gradient(135deg,#141417 0 12px,#1D1D22 12px 24px)", flexShrink:0}}>
              <div style={{position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center"}}>
                <div style={{width:30, height:30, borderRadius:99, background:"rgba(250,247,242,0.95)", color:"#0B0B0D", display:"flex", alignItems:"center", justifyContent:"center"}}>
                  <Icon name="play" size={11}/>
                </div>
              </div>
              <div style={{position:"absolute", bottom:5, left:7, fontFamily:"JetBrains Mono,monospace", fontSize:9, color:"#F5F3ED", letterSpacing:"0.15em"}}>{q.duration}</div>
            </div>
            <div style={{flex:1, minWidth:0}}>
              <div style={{display:"flex", alignItems:"center", gap:6, marginBottom:5}}>
                <Avatar initials={q.initials} size={22}/>
                <span style={{fontSize:12.5, fontWeight:600}}>{q.student}</span>
              </div>
              <div style={{fontFamily:"'Big Shoulders Display',sans-serif", fontWeight:800, fontSize:17, textTransform:"uppercase", letterSpacing:"0.005em", lineHeight:1.15, marginBottom:5}}>{q.title}</div>
              <div style={{fontFamily:"JetBrains Mono,monospace", fontSize:9, color:"#9A9AA2", textTransform:"uppercase", letterSpacing:"0.1em"}}>{q.exerciseRef} · attesa {q.waiting}</div>
            </div>
            <Icon name="chevron" size={13} color="#9A9AA2"/>
          </button>
        ))}
      </div>
    </div>
  );
}

function CollabMobile({ route, onRoute }) {
  const screen = (() => {
    if (route==="dashboard") return <CollabMDashboard nav={onRoute}/>;
    if (route==="review")    return <CollabMReview nav={onRoute}/>;
    if (route==="students")  return <CollabMStudents nav={onRoute}/>;
    if (route==="chat")      return <window.MSChat nav={onRoute} perspective="collab"/>;
    return <CollabMDashboard nav={onRoute}/>;
  })();
  return (
    <div style={{minHeight:"100vh", background:"#0B0B0D", padding:"48px 20px 80px", display:"flex", gap:36, justifyContent:"center", alignItems:"flex-start", flexWrap:"wrap"}}>
      <div style={{display:"flex", flexDirection:"column", alignItems:"center", gap:18}}>
        <div style={{fontFamily:"JetBrains Mono,monospace", fontSize:10, textTransform:"uppercase", letterSpacing:"0.22em", color:"#9A9AA2"}}>Collab · mobile</div>
        <div style={{position:"relative"}}>
          <window.IOSDevice width={390} height={844}>{screen}</window.IOSDevice>
          <div style={{position:"absolute", bottom:24, left:0, right:0, zIndex:60, pointerEvents:"none"}}>
            <div style={{pointerEvents:"auto"}}>
              <CollabMBottomTab route={route} onRoute={onRoute}/>
            </div>
          </div>
        </div>
        <div style={{display:"flex", gap:8, flexWrap:"wrap", justifyContent:"center", maxWidth:420}}>
          {COLLAB_TABS.map(q=>(
            <button key={q.id} onClick={()=>onRoute(q.id)} style={{height:30, padding:"0 11px", borderRadius:99, fontSize:11, fontWeight:500,
              background: route===q.id?"#F5F3ED":"transparent", color: route===q.id?"#0B0B0D":"#9A9AA2",
              border: route===q.id?"none":"1px solid #24242A"}}>{q.label}</button>
          ))}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { CollabDesktop, CollabMobile });
