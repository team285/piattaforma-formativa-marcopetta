// ─── STUDENTE DESKTOP — versione web (dashboard editoriale) ────────

const SD_NAV = [
  { id:"home",     label:"Piano",         icon:"home" },
  { id:"lesson",   label:"Lezione",        icon:"video" },
  { id:"exercise", label:"Esercizi",       icon:"record" },
  { id:"feedback", label:"Feedback",       icon:"inbox", badge:"1" },
  { id:"community", label:"Sala prove",    icon:"users" },
  { id:"chat",     label:"Chat con Marco", icon:"chat" },
  { id:"activity", label:"Notifiche",      icon:"bell" },
];

function SDSidebar({ route, onRoute }) {
  const u = window.STUDENT;
  return (
    <aside className="w-[260px] bg-ink text-paper flex flex-col border-r border-line-dark">
      <div className="px-5 pt-6 pb-5 border-b border-line-dark">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-[2px] bg-ember flex items-center justify-center font-display text-xl text-white">P</div>
          <div>
            <div className="font-display text-[17px] leading-none">Marco Petta</div>
            <div className="font-mono text-[9px] uppercase tracking-[0.22em] text-[#9E8E82] mt-1">il tuo percorso</div>
          </div>
        </div>
        <div className="mt-4 font-display text-[13px] italic text-[#C9BDB1] leading-snug">
          "Ciao <span className="text-ember">{u.name}</span>.<br/>
          Siamo al mese 3 di 6."
        </div>
      </div>
      <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto no-scrollbar">
        {SD_NAV.map(it=>{
          const active = route===it.id;
          return (
            <button key={it.id} onClick={()=>onRoute(it.id)} className={"w-full flex items-center gap-3 px-3 h-10 rounded-[2px] text-left transition "+(active?"bg-ember text-white":"text-[#C9BDB1] hover:bg-ink-2")}>
              <Icon name={it.icon} size={15}/>
              <span className="text-[13px] flex-1">{it.label}</span>
              {it.badge && <span className={"text-[10px] font-mono px-1.5 h-5 rounded-full flex items-center "+(active?"bg-white/25 text-white":"bg-ember text-white")}>{it.badge}</span>}
            </button>
          );
        })}
      </nav>
      <div className="px-4 py-4 border-t border-line-dark flex items-center gap-3">
        <Avatar initials={u.initials} size={34} tone="ink"/>
        <div className="flex-1 min-w-0">
          <div className="text-[13px] truncate">{u.fullName}</div>
          <div className="font-mono text-[10px] uppercase tracking-wider text-[#9E8E82]">6 mesi · attivo</div>
        </div>
      </div>
    </aside>
  );
}

function StudentDesktop({ route, onRoute }) {
  const renderScreen = () => {
    if (route==="home")      return <window.StudentHome nav={onRoute}/>;
    if (route==="lesson")    return <window.StudentLesson nav={onRoute}/>;
    if (route==="exercise")  return <window.StudentExercise nav={onRoute}/>;
    if (route==="feedback")  return <window.StudentFeedback nav={onRoute}/>;
    if (route==="community") return <window.StudentCommunity nav={onRoute}/>;
    if (route==="chat")      return <window.StudentChat nav={onRoute}/>;
    if (route==="activity")  return <SDActivityDesktop nav={onRoute}/>;
    return <window.StudentHome nav={onRoute}/>;
  };
  return (
    <div className="flex min-h-screen">
      <SDSidebar route={route} onRoute={onRoute}/>
      <main className="flex-1 min-w-0">{renderScreen()}</main>
    </div>
  );
}

function SDActivityDesktop({ nav }) {
  const notifs = [
    {type:"feedback", title:"Marco ha lasciato feedback", body:"8 annotazioni · 1 video-risposta · sul 12 bar in La", time:"10:14", unread:true, route:"feedback"},
    {type:"message", title:"Nuovo messaggio da Marco", body:"\"C'è una cosa sul polso di cui dobbiamo parlare.\"", time:"08:31", unread:true, route:"chat"},
    {type:"community", title:"Sara ti ha menzionato", body:"\"Luca, ascolta il mio passaggio a 0:52\"", time:"07:40", route:"community"},
    {type:"assign", title:"Marco ti ha assegnato 3 lezioni", body:"Questa settimana · 2 esercizi con scadenza", time:"ieri 18:20", route:"home"},
  ];
  const [prefs, setPrefs] = React.useState([
    {k:"Feedback di Marco", v:true, s:"Prioritarie — anche in silenzioso"},
    {k:"Nuove assegnazioni", v:true, s:"Lun/gio mattina"},
    {k:"Scadenze esercizi", v:true, s:"24h prima"},
    {k:"Attività in Sala prove", v:false, s:"Quando Marco sceglie un pick"},
    {k:"Quiet hours", v:true, s:"22:00 — 08:00"},
  ]);
  const togglePref = (i) => setPrefs(prefs.map((p,j)=>j===i?{...p, v:!p.v}:p));
  const markAllRead = () => window.mpToast && window.mpToast("Notifiche segnate come lette", "ok");
  return (
    <div className="min-h-full bg-paper p-12 max-w-5xl">
      <div className="flex items-end justify-between mb-8">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-smoke mb-3">attività · notifiche</div>
          <h1 className="font-editorial text-[56px]">Le cose <span className="italic-ember">arrivate</span>.</h1>
        </div>
        <button onClick={markAllRead} className="h-9 px-3 border border-line rounded-[2px] text-[12px] text-smoke hover:text-ink">Segna tutto letto</button>
      </div>
      <div className="grid grid-cols-2 gap-8">
        <div className="space-y-3">
          {notifs.map((n,i)=>(
            <button key={i} onClick={()=>nav && nav(n.route)} className={"w-full text-left bg-paper-2 border border-line rounded-[2px] p-4 hover:bg-sand transition "+(n.unread?"border-l-2 border-l-ember":"")}>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-[4px] bg-ember/15 text-ember flex items-center justify-center"><Icon name={({feedback:"inbox",message:"chat",community:"users",assign:"plus"})[n.type]} size={13}/></div>
                <div className="flex-1">
                  <div className="text-[13px] font-semibold">{n.title}</div>
                  <div className="text-[12px] text-smoke mt-1">{n.body}</div>
                  <div className="font-mono text-[10px] uppercase tracking-wider text-smoke mt-2">{n.time}</div>
                </div>
                {n.unread && <div className="w-2 h-2 rounded-full bg-ember mt-1"/>}
              </div>
            </button>
          ))}
        </div>
        <div>
          <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-smoke mb-3">preferenze push</div>
          <div className="bg-paper-2 border border-line rounded-[2px] divide-y divide-[var(--line)]">
            {prefs.map((p,i)=>(
              <button key={p.k} onClick={()=>togglePref(i)} className="w-full flex items-center gap-3 p-4 text-left hover:bg-sand transition">
                <div className="flex-1">
                  <div className="text-[13px]">{p.k}</div>
                  <div className="text-[11px] text-smoke">{p.s}</div>
                </div>
                <div style={{width:44, height:26, borderRadius:99, background:p.v?"var(--ember)":"#D4C9B6", position:"relative", transition:"background 0.2s"}}>
                  <div style={{position:"absolute", top:2, left:p.v?20:2, width:22, height:22, borderRadius:99, background:"#fff", transition:"left 0.2s"}}/>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── COACH MOBILE — iPhone con tab coach ────────────────────────────

const CM_TABS = [
  { id:"review",    label:"Correggi",   icon:"inbox", badge:true },
  { id:"students",  label:"Studenti",   icon:"users" },
  { id:"chat",      label:"Chat",       icon:"chat", badge:true },
  { id:"library",   label:"Libreria",   icon:"book" },
];

function CMBottomTab({ route, onRoute }) {
  return (
    <div style={{margin:"0 14px", borderRadius:26, overflow:"hidden", position:"relative",
      boxShadow:"0 10px 30px rgba(0,0,0,0.45), 0 0 0 0.5px rgba(250,247,242,0.08)"}}>
      <div style={{position:"absolute", inset:0, background:"rgba(11,11,13,0.82)",
        backdropFilter:"blur(22px) saturate(180%)", WebkitBackdropFilter:"blur(22px) saturate(180%)"}}/>
      <div style={{position:"relative", display:"flex", padding:"10px 6px"}}>
        {CM_TABS.map(t=>{
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

// Header Coach — uguale a MSHeader studente (Big Shoulders, dark)
function CMHeader({ kicker, title, right }) {
  return (
    <div style={{padding:"68px 22px 14px 22px"}}>
      <div style={{display:"flex", justifyContent:"space-between", alignItems:"flex-start"}}>
        <div>
          {kicker && <div style={{fontFamily:"JetBrains Mono,monospace", fontSize:10, letterSpacing:"0.22em", textTransform:"uppercase", color:"#8A8A92", marginBottom:10}}>{kicker}</div>}
          <h1 style={{fontFamily:"'Big Shoulders Display',sans-serif", fontWeight:800, textTransform:"uppercase", fontSize:38, lineHeight:1.02, letterSpacing:"-0.01em", color:"#F5F3ED", margin:0, maxWidth:320}}>{title}</h1>
        </div>
        {right}
      </div>
    </div>
  );
}

function CMReviewDetail({ item, onBack }) {
  const [rating, setRating] = React.useState(4);
  const [note, setNote] = React.useState("");
  const [playing, setPlaying] = React.useState(false);
  const [marks, setMarks] = React.useState([
    { sec:"0:12", type:"ok",      text:"Attacco pulito." },
    { sec:"0:40", type:"warning", text:"Polso che si chiude." },
  ]);
  const send = () => {
    window.mpToast && window.mpToast("Feedback inviato a "+(item.student.split(" ")[0]||"studente"), "ok");
    setTimeout(onBack, 400);
  };
  const addMark = (type) => {
    const labels = { ok:"Bene qui.", tip:"Prova questo.", warning:"Attenzione." };
    setMarks([...marks, { sec:"1:"+String(10+marks.length*7).padStart(2,"0"), type, text: labels[type] }]);
    window.mpToast && window.mpToast("Annotazione aggiunta", "info");
  };
  return (
    <div style={{background:"#0B0B0D", color:"#F5F3ED", minHeight:"100%", paddingBottom:140}}>
      <div style={{padding:"58px 16px 10px", display:"flex", alignItems:"center", gap:10}}>
        <button onClick={onBack} style={{width:36, height:36, borderRadius:99, background:"#141417", color:"#F5F3ED", display:"flex", alignItems:"center", justifyContent:"center"}}><Icon name="chevronl" size={14}/></button>
        <div style={{flex:1, minWidth:0}}>
          <div style={{fontFamily:"JetBrains Mono,monospace", fontSize:10, textTransform:"uppercase", letterSpacing:"0.2em", color:"#9A9AA2"}}>Review · {item.exerciseRef}</div>
          <div style={{fontFamily:"'Big Shoulders Display',sans-serif", fontWeight:800, textTransform:"uppercase", letterSpacing:"0.005em", fontSize:19, marginTop:2, color:"#F5F3ED", lineHeight:1.1}}>{item.student}</div>
        </div>
      </div>
      <div style={{margin:"8px 14px 0", borderRadius:14, overflow:"hidden", position:"relative", aspectRatio:"16/10", background:"#000"}}>
        <div style={{position:"absolute", inset:0, background:"repeating-linear-gradient(135deg,#141417 0 12px,#1D1D22 12px 24px)", opacity:0.6}}/>
        <div style={{position:"absolute", top:10, left:12, fontFamily:"JetBrains Mono,monospace", fontSize:9, textTransform:"uppercase", letterSpacing:"0.2em", color:"#9A9AA2"}}>{item.student.split(" ")[0]} · take</div>
        <div style={{position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center"}}>
          <button onClick={()=>setPlaying(v=>!v)} style={{width:56, height:56, borderRadius:99, background:"rgba(250,247,242,0.95)", color:"#0B0B0D", display:"flex", alignItems:"center", justifyContent:"center", border:"none", cursor:"pointer"}}><Icon name={playing?"pause":"play"} size={16}/></button>
        </div>
        <div style={{position:"absolute", bottom:10, right:12, fontFamily:"JetBrains Mono,monospace", fontSize:10, color:"#F5F3ED"}}>{item.duration}</div>
      </div>

      {/* Quick annotate buttons */}
      <div style={{padding:"14px 14px 0", display:"flex", gap:8}}>
        {[
          {t:"ok",      l:"OK",   c:"#7BB07B"},
          {t:"tip",     l:"TIP",  c:"#F2B744"},
          {t:"warning", l:"WARN", c:"#E04A3A"},
        ].map(b=>(
          <button key={b.t} onClick={()=>addMark(b.t)} style={{flex:1, height:38, borderRadius:10, background:b.c+"18", border:"1px solid "+b.c+"55", color:b.c, fontFamily:"JetBrains Mono,monospace", fontSize:11, textTransform:"uppercase", letterSpacing:"0.15em", fontWeight:600}}>
            + {b.l}
          </button>
        ))}
      </div>

      {/* Marks list */}
      <div style={{padding:"12px 14px", display:"flex", flexDirection:"column", gap:8}}>
        {marks.map((m,i)=>{
          const color = window.AnnotationColor(m.type);
          const label = {ok:"OK", tip:"TIP", warning:"WARN"}[m.type];
          return (
            <div key={i} style={{background:"#141417", border:"1px solid #24242A", borderRadius:10, padding:"10px 12px"}}>
              <div style={{display:"flex", alignItems:"center", gap:6, marginBottom:4}}>
                <span style={{fontFamily:"JetBrains Mono,monospace", fontSize:10, textTransform:"uppercase", letterSpacing:"0.12em", color, background:color+"22", padding:"2px 6px", borderRadius:3}}>{label}</span>
                <span style={{fontFamily:"JetBrains Mono,monospace", fontSize:10, color:"#8A8A92"}}>{m.sec}</span>
              </div>
              <div style={{fontSize:12.5, color:"#D9D9DE"}}>{m.text}</div>
            </div>
          );
        })}
      </div>

      {/* Rating */}
      <div style={{padding:"8px 14px 0"}}>
        <div style={{fontFamily:"JetBrains Mono,monospace", fontSize:10, textTransform:"uppercase", letterSpacing:"0.22em", color:"#8A8A92", marginBottom:8}}>Valutazione</div>
        <div style={{display:"flex", gap:8}}>
          {[1,2,3,4,5].map(n=>(
            <button key={n} onClick={()=>setRating(n)} style={{width:44, height:44, borderRadius:10, background: n<=rating?"#F2B744":"#141417", border:"1px solid "+(n<=rating?"#F2B744":"#24242A"), color: n<=rating?"#0B0B0D":"#8A8A92", fontFamily:"'Big Shoulders Display',sans-serif", fontWeight:800, fontSize:18}}>{n}</button>
          ))}
        </div>
      </div>

      {/* Nota */}
      <div style={{padding:"14px 14px 0"}}>
        <div style={{fontFamily:"JetBrains Mono,monospace", fontSize:10, textTransform:"uppercase", letterSpacing:"0.22em", color:"#8A8A92", marginBottom:8}}>Nota riassuntiva</div>
        <textarea value={note} onChange={e=>setNote(e.target.value)} rows={3} placeholder={"Scrivi a "+(item.student.split(" ")[0])+"..."}
          style={{width:"100%", background:"#141417", border:"1px solid #24242A", borderRadius:10, padding:12, color:"#F5F3ED", fontSize:13, lineHeight:1.5, resize:"none", outline:"none"}}/>
      </div>

      {/* Invia */}
      <div style={{padding:"16px 14px"}}>
        <button onClick={send} style={{width:"100%", height:50, borderRadius:12, background:"#F2B744", color:"#0B0B0D", fontFamily:"'Big Shoulders Display',sans-serif", fontWeight:800, textTransform:"uppercase", letterSpacing:"0.05em", fontSize:14, display:"flex", alignItems:"center", justifyContent:"center", gap:8}}>
          <Icon name="send" size={14}/> Invia feedback
        </button>
      </div>
    </div>
  );
}

function CMReview({ nav }) {
  const queue = window.COACH_QUEUE || [];
  const [filter, setFilter] = React.useState("all"); // all | overdue | student initials
  const [selected, setSelected] = React.useState(null);

  if (selected) {
    return <CMReviewDetail item={selected} onBack={()=>setSelected(null)}/>;
  }

  const filters = [
    { id:"all",     label:`Tutti (${queue.length})` },
    ...Array.from(new Set(queue.map(q => q.student.split(" ")[0]))).slice(0,3).map(n => ({ id:"s:"+n, label: n })),
    { id:"overdue", label:"Oltre 24h" },
  ];
  let displayed = queue;
  if (filter === "overdue") displayed = queue.filter(q => parseInt(q.waiting, 10) >= 24);
  else if (filter.startsWith("s:")) displayed = queue.filter(q => q.student.split(" ")[0] === filter.slice(2));

  return (
    <div style={{background:"#0B0B0D", color:"#F5F3ED", minHeight:"100%", paddingBottom:130}}>
      <CMHeader
        kicker={`${queue.length} video in coda · oggi`}
        title={<>Ciao Marco.<br/><em style={{color:"#F2B744"}}>Ascolta</em> questi {queue.length}.</>}
      />
      <div style={{display:"flex", gap:6, padding:"4px 18px 14px", overflowX:"auto"}} className="no-scrollbar">
        {filters.map(f=>{
          const active = filter === f.id;
          return (
            <button key={f.id} onClick={()=>setFilter(f.id)} style={{flexShrink:0, height:34, padding:"0 14px", borderRadius:99, background:active?"#F5F3ED":"transparent", color:active?"#0B0B0D":"#9A9AA2", border:active?"none":"1px solid #24242A", fontSize:12, fontWeight:500, whiteSpace:"nowrap"}}>{f.label}</button>
          );
        })}
      </div>
      <div style={{padding:"4px 18px", display:"flex", flexDirection:"column", gap:12}}>
        {displayed.length === 0 && (
          <div style={{padding:"24px 0", textAlign:"center", color:"#8A8A92", fontSize:13}}>Nessun video per questo filtro.</div>
        )}
        {displayed.map((q,i)=>{
          const urgent = q.waiting && parseInt(q.waiting, 10) > 20;
          return (
            <button key={i} onClick={()=>setSelected(q)} style={{background:"#141417", border:"1px solid "+(urgent?"rgba(224,74,58,0.5)":"#24242A"), borderRadius:14, padding:14, textAlign:"left", display:"flex", gap:12, alignItems:"flex-start", cursor:"pointer"}}>
              <div style={{position:"relative", width:72, height:84, borderRadius:10, overflow:"hidden", background:"repeating-linear-gradient(135deg,#141417 0 12px,#1D1D22 12px 24px)", flexShrink:0}}>
                <div style={{position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center"}}>
                  <div style={{width:32, height:32, borderRadius:99, background:"rgba(250,247,242,0.95)", color:"#0B0B0D", display:"flex", alignItems:"center", justifyContent:"center"}}><Icon name="play" size={11}/></div>
                </div>
                <div style={{position:"absolute", bottom:6, left:8, fontFamily:"JetBrains Mono,monospace", fontSize:9, color:"#F5F3ED", textTransform:"uppercase", letterSpacing:"0.15em"}}>{q.duration}</div>
              </div>
              <div style={{flex:1, minWidth:0}}>
                <div style={{display:"flex", alignItems:"center", gap:6, marginBottom:5, flexWrap:"wrap"}}>
                  <Avatar initials={q.initials} size={22}/>
                  <span style={{fontSize:12.5, fontWeight:600, color:"#F5F3ED"}}>{q.student}</span>
                  {urgent && <span style={{fontFamily:"JetBrains Mono,monospace", fontSize:9, color:"#E04A3A", background:"rgba(224,74,58,0.14)", padding:"2px 6px", borderRadius:3, textTransform:"uppercase", letterSpacing:"0.12em"}}>attesa {q.waiting}</span>}
                </div>
                <div style={{fontFamily:"'Big Shoulders Display',sans-serif", fontWeight:800, textTransform:"uppercase", letterSpacing:"0.005em", fontSize:18, lineHeight:1.15, marginBottom:6, color:"#F5F3ED"}}>{q.title}</div>
                <div style={{fontFamily:"JetBrains Mono,monospace", fontSize:10, color:"#9A9AA2", textTransform:"uppercase", letterSpacing:"0.12em"}}>{q.exerciseRef}</div>
              </div>
              <Icon name="chevron" size={13} color="#9A9AA2"/>
            </button>
          );
        })}
      </div>

      <CMOverview/>
    </div>
  );
}

// ─── CMOverview — analytics mobile (sotto la coda) ───────────────────
function CMOverview() {
  const s = window.COACH_STATS;
  const a = window.COACH_ANALYTICS;
  if (!s || !a) return null;

  const kpis = [
    { label:"Studenti attivi", value:s.activeStudents, sub:"nei 3 percorsi" },
    { label:"Messaggi non letti", value:s.unreadMsgs, sub:"chat 1:1" },
    { label:"MRR stimato", value:"€"+a.mrr.toLocaleString('it-IT'), sub:"al mese" },
    { label:"A rischio", value:a.atRisk, sub:"inattivi 7+ gg", warn:true },
    { label:"Tempo medio risposta", value:a.avgResponseTime, sub:"SLA 30 gg" },
    { label:"In scadenza", value:s.expiringMonth, sub:"questo mese" },
  ];

  return (
    <div style={{padding:"32px 18px 20px"}}>
      {/* Section divider */}
      <div style={{display:"flex", alignItems:"center", gap:10, marginBottom:14}}>
        <div style={{flex:1, height:1, background:"#24242A"}}/>
        <div style={{fontFamily:"JetBrains Mono,monospace", fontSize:9, letterSpacing:"0.25em", textTransform:"uppercase", color:"#8A8A92"}}>Overview</div>
        <div style={{flex:1, height:1, background:"#24242A"}}/>
      </div>

      {/* KPI grid 2×3 */}
      <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:24}}>
        {kpis.map((k,i)=>(
          <div key={i} style={{
            background:"#141417",
            border:"1px solid "+(k.warn?"rgba(242,183,68,0.4)":"#24242A"),
            borderRadius:10, padding:"12px 12px 14px",
          }}>
            <div style={{fontFamily:"JetBrains Mono,monospace", fontSize:8.5, letterSpacing:"0.2em", textTransform:"uppercase", color:k.warn?"#F2B744":"#8A8A92", marginBottom:8}}>{k.label}</div>
            <div style={{fontFamily:"'Big Shoulders Display',sans-serif", fontWeight:800, fontSize:28, lineHeight:1, color:"#F5F3ED"}}>{k.value}</div>
            <div style={{fontSize:10.5, color:"#8A8A92", marginTop:4}}>{k.sub}</div>
          </div>
        ))}
      </div>

      {/* Trend */}
      <CMSection kicker="Trend · 8 settimane" title="Take vs feedback"/>
      <div style={{background:"#141417", border:"1px solid #24242A", borderRadius:12, padding:14, marginBottom:20}}>
        <div style={{display:"flex", gap:12, marginBottom:10, fontSize:10.5}}>
          <span style={{display:"inline-flex", alignItems:"center", gap:5, color:"#F5F3ED"}}><span style={{width:8, height:8, borderRadius:99, background:"#F5F3ED"}}/> Take</span>
          <span style={{display:"inline-flex", alignItems:"center", gap:5, color:"#F2B744"}}><span style={{width:8, height:8, borderRadius:99, background:"#F2B744"}}/> Feedback</span>
        </div>
        <CMTrendChart data={a.trend}/>
        <div style={{fontSize:11.5, color:"#9A9AA2", marginTop:8, lineHeight:1.45}}>
          Questa settimana <span style={{color:"#F5F3ED", fontWeight:600}}>+5 take</span> rispetto alla media. Stai accumulando coda.
        </div>
      </div>

      {/* Heatmap */}
      <CMSection kicker="Heatmap invii · 4 settimane" title="Quando registrano"/>
      <div style={{background:"#141417", border:"1px solid #24242A", borderRadius:12, padding:14, marginBottom:20}}>
        <CMHeatmap data={a.heatmap}/>
        <div style={{fontSize:11.5, color:"#9A9AA2", marginTop:10, lineHeight:1.45}}>
          Picco <span style={{color:"#F5F3ED", fontWeight:600}}>giovedì sera</span> + <span style={{color:"#F5F3ED", fontWeight:600}}>domenica pomeriggio</span>.
        </div>
      </div>

      {/* Radar classe */}
      <CMSection kicker="Radar medio classe" title="Dove migliora la classe"/>
      <div style={{background:"#141417", border:"1px solid #24242A", borderRadius:12, padding:14, marginBottom:20, display:"flex", gap:12, alignItems:"center"}}>
        <div style={{width:150, flexShrink:0}}>
          <CMClassRadar data={a.classRadar}/>
        </div>
        <div style={{flex:1, minWidth:0, display:"flex", flexDirection:"column", gap:6}}>
          {Object.entries(a.classRadar).map(([k,v])=>(
            <div key={k} style={{display:"flex", alignItems:"center", gap:8}}>
              <div style={{flex:"0 0 76px", fontFamily:"JetBrains Mono,monospace", fontSize:9.5, textTransform:"uppercase", letterSpacing:"0.1em", color:"#C9BDB1"}}>{k}</div>
              <div style={{flex:1, height:4, background:"#24242A", borderRadius:99, overflow:"hidden"}}>
                <div style={{width:v+"%", height:"100%", background:"#F2B744"}}/>
              </div>
              <div style={{flex:"0 0 22px", textAlign:"right", fontFamily:"JetBrains Mono,monospace", fontSize:11, color:"#F5F3ED", fontWeight:600}}>{v}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Top lezioni */}
      <CMSection kicker="Library" title="Lezioni più viste"/>
      <div style={{background:"#141417", border:"1px solid #24242A", borderRadius:12, padding:14, marginBottom:12}}>
        <CMTopList items={a.topLessons.map(l=>({label:l.title, value:l.views, delta:l.delta, unit:"views"}))} tone="dark"/>
      </div>

      {/* Top esercizi */}
      <CMSection kicker="Library" title="Esercizi più inviati"/>
      <div style={{background:"#141417", border:"1px solid #24242A", borderRadius:12, padding:14, marginBottom:20}}>
        <CMTopList items={a.topExercises.map(e=>({label:e.title, value:e.submissions, unit:"take"}))} tone="dark"/>
      </div>

      {/* Leaderboard */}
      <CMSection kicker="Ultime 4 settimane" title="Studenti più attivi"/>
      <div style={{background:"#141417", border:"1px solid #24242A", borderRadius:12, padding:10, marginBottom:12}}>
        <CMLeaderList items={a.mostActive}/>
      </div>

      <CMSection kicker="Radar · ultimi 30 gg" title="Maggiore crescita" accent/>
      <div style={{background:"linear-gradient(145deg, #1D1810 0%, #141417 100%)", border:"1px solid rgba(242,183,68,0.25)", borderRadius:12, padding:10}}>
        <CMLeaderList items={a.mostImproved} highlightFirst/>
      </div>
    </div>
  );
}

function CMSection({ kicker, title, accent }) {
  return (
    <div style={{marginBottom:10}}>
      <div style={{fontFamily:"JetBrains Mono,monospace", fontSize:9, letterSpacing:"0.22em", textTransform:"uppercase", color:accent?"#F2B744":"#8A8A92", marginBottom:4}}>{kicker}</div>
      <div style={{fontFamily:"'Big Shoulders Display',sans-serif", fontWeight:800, textTransform:"uppercase", fontSize:20, lineHeight:1.05, letterSpacing:"0.005em", color:"#F5F3ED"}}>{title}</div>
    </div>
  );
}

function CMTrendChart({ data }) {
  const W = 320, H = 120, P = { t:6, r:8, b:18, l:22 };
  const iw = W - P.l - P.r, ih = H - P.t - P.b;
  const max = Math.max(...data.flatMap(d => [d.submitted, d.feedback])) + 2;
  const x = (i) => P.l + (iw / (data.length - 1)) * i;
  const y = (v) => P.t + ih - (v / max) * ih;
  const path = (key) => data.map((d,i) => (i===0?"M":"L")+x(i)+","+y(d[key])).join(" ");
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H} style={{display:"block"}}>
      {[0, Math.round(max/2), max].map((v,i) => (
        <g key={i}>
          <line x1={P.l} x2={W-P.r} y1={y(v)} y2={y(v)} stroke="#24242A" strokeDasharray="2 3"/>
          <text x={P.l-4} y={y(v)+3} fontSize="8" fontFamily="JetBrains Mono,monospace" fill="#8A8A92" textAnchor="end">{v}</text>
        </g>
      ))}
      {data.map((d,i) => (
        <text key={i} x={x(i)} y={H-5} fontSize="8" fontFamily="JetBrains Mono,monospace" fill="#8A8A92" textAnchor="middle">{d.w}</text>
      ))}
      <path d={path("feedback") + ` L${x(data.length-1)},${y(0)} L${x(0)},${y(0)} Z`} fill="#F2B744" fillOpacity="0.1"/>
      <path d={path("feedback")} fill="none" stroke="#F2B744" strokeWidth="1.6"/>
      <path d={path("submitted")} fill="none" stroke="#F5F3ED" strokeWidth="1.6"/>
      {data.map((d,i) => (
        <g key={i}>
          <circle cx={x(i)} cy={y(d.submitted)} r="2.2" fill="#F5F3ED"/>
          <circle cx={x(i)} cy={y(d.feedback)} r="2.2" fill="#F2B744"/>
        </g>
      ))}
    </svg>
  );
}

function CMHeatmap({ data }) {
  const days = ["L","M","M","G","V","S","D"];
  const slots = ["0-4","4-8","8-12","12-16","16-20","20-24"];
  const max = Math.max(...data.flat());
  return (
    <div>
      <div style={{display:"grid", gridTemplateColumns:"22px repeat(6, 1fr)", gap:4, marginBottom:4}}>
        <div/>
        {slots.map(s => <div key={s} style={{fontFamily:"JetBrains Mono,monospace", fontSize:8, textTransform:"uppercase", letterSpacing:"0.08em", color:"#8A8A92", textAlign:"center"}}>{s}</div>)}
      </div>
      {data.map((row, di) => (
        <div key={di} style={{display:"grid", gridTemplateColumns:"22px repeat(6, 1fr)", gap:4, marginBottom:4}}>
          <div style={{display:"flex", alignItems:"center", fontFamily:"JetBrains Mono,monospace", fontSize:9.5, textTransform:"uppercase", color:"#8A8A92"}}>{days[di]}</div>
          {row.map((v, hi) => {
            const t = v === 0 ? 0 : (v / max);
            const bg = v === 0 ? "#1D1D22" : `rgba(242,183,68,${(0.18 + t*0.72).toFixed(2)})`;
            const color = t > 0.55 ? "#0B0B0D" : "#C9BDB1";
            return (
              <div key={hi} style={{
                height:26, borderRadius:3, background:bg,
                display:"flex", alignItems:"center", justifyContent:"center",
                fontFamily:"JetBrains Mono,monospace", fontSize:10, fontWeight:600, color,
              }}>
                {v > 0 ? v : ""}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

function CMClassRadar({ data }) {
  const keys = Object.keys(data);
  const n = keys.length;
  const R = 54, CX = 75, CY = 75;
  const angle = (i) => (-Math.PI/2) + (2*Math.PI/n)*i;
  const pt = (val, i) => {
    const r = (val/100) * R;
    return [CX + r*Math.cos(angle(i)), CY + r*Math.sin(angle(i))];
  };
  const poly = keys.map((k,i) => pt(data[k], i).join(",")).join(" ");
  return (
    <svg viewBox="0 0 150 150" width="100%" height={150}>
      {[33, 66, 100].map(r => (
        <polygon key={r} fill="none" stroke="#2A2A30" strokeWidth="0.8"
          points={keys.map((_,i) => pt(r, i).join(",")).join(" ")}/>
      ))}
      {keys.map((_,i) => {
        const [ex,ey] = pt(100, i);
        return <line key={i} x1={CX} y1={CY} x2={ex} y2={ey} stroke="#2A2A30" strokeWidth="0.8"/>;
      })}
      <polygon points={poly} fill="#F2B744" fillOpacity="0.28" stroke="#F2B744" strokeWidth="1.4"/>
      {keys.map((k,i) => {
        const [vx,vy] = pt(data[k], i);
        return <circle key={i} cx={vx} cy={vy} r="2.2" fill="#F2B744"/>;
      })}
    </svg>
  );
}

function CMTopList({ items }) {
  const max = Math.max(...items.map(i => i.value));
  return (
    <div style={{display:"flex", flexDirection:"column", gap:12}}>
      {items.map((it,i) => (
        <div key={i}>
          <div style={{display:"flex", alignItems:"baseline", justifyContent:"space-between", gap:8, marginBottom:5}}>
            <div style={{display:"flex", alignItems:"baseline", gap:8, minWidth:0, flex:1}}>
              <span style={{fontFamily:"JetBrains Mono,monospace", fontSize:9.5, color:"#8A8A92", flexShrink:0}}>{String(i+1).padStart(2,"0")}</span>
              <span style={{fontSize:12.5, color:"#F5F3ED", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap"}}>{it.label}</span>
            </div>
            <div style={{display:"flex", alignItems:"baseline", gap:6, flexShrink:0}}>
              <span style={{fontFamily:"'Big Shoulders Display',sans-serif", fontWeight:800, fontSize:16, lineHeight:1, color:"#F5F3ED"}}>{it.value}</span>
              <span style={{fontFamily:"JetBrains Mono,monospace", fontSize:8.5, textTransform:"uppercase", letterSpacing:"0.1em", color:"#8A8A92"}}>{it.unit}</span>
              {it.delta && <span style={{fontFamily:"JetBrains Mono,monospace", fontSize:9, color:"#F2B744"}}>{it.delta}</span>}
            </div>
          </div>
          <div style={{height:3, background:"#1D1D22", borderRadius:99, overflow:"hidden"}}>
            <div style={{height:"100%", width:((it.value/max)*100)+"%", background:"#F2B744"}}/>
          </div>
        </div>
      ))}
    </div>
  );
}

function CMLeaderList({ items, highlightFirst }) {
  return (
    <div>
      {items.map((p,i)=>(
        <div key={i} style={{display:"flex", alignItems:"center", gap:10, padding:"8px 6px", borderTop:i===0?"none":"1px solid #1D1D22"}}>
          <div style={{width:16, fontFamily:"JetBrains Mono,monospace", fontSize:10.5, color:"#8A8A92"}}>{i+1}</div>
          <Avatar initials={p.i} size={32} tone={highlightFirst && i===0 ? "ember" : "ink"}/>
          <div style={{flex:1, minWidth:0}}>
            <div style={{fontSize:13, color:"#F5F3ED", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap"}}>{p.name}</div>
            <div style={{fontFamily:"JetBrains Mono,monospace", fontSize:9.5, textTransform:"uppercase", letterSpacing:"0.1em", color:"#9A9AA2", marginTop:2}}>{p.metric}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

function CMStudentDetail({ student, onBack, nav }) {
  return (
    <div style={{background:"#0B0B0D", color:"#F5F3ED", minHeight:"100%", paddingBottom:140}}>
      <div style={{padding:"58px 16px 10px", display:"flex", alignItems:"center", gap:10}}>
        <button onClick={onBack} style={{width:36, height:36, borderRadius:99, background:"#141417", color:"#F5F3ED", display:"flex", alignItems:"center", justifyContent:"center"}}><Icon name="chevronl" size={14}/></button>
        <div style={{flex:1, minWidth:0, fontFamily:"JetBrains Mono,monospace", fontSize:10, textTransform:"uppercase", letterSpacing:"0.2em", color:"#9A9AA2"}}>Studente</div>
      </div>

      <div style={{padding:"8px 18px 14px", display:"flex", gap:14, alignItems:"center"}}>
        <Avatar initials={student.i} size={58}/>
        <div style={{flex:1, minWidth:0}}>
          <div style={{fontFamily:"'Big Shoulders Display',sans-serif", fontWeight:800, textTransform:"uppercase", letterSpacing:"0.005em", fontSize:24, lineHeight:1.05, color:"#F5F3ED"}}>{student.name}</div>
          <div style={{fontFamily:"JetBrains Mono,monospace", fontSize:10, textTransform:"uppercase", letterSpacing:"0.15em", color:"#9A9AA2", marginTop:4}}>{student.level} · progressi {student.prog}%</div>
        </div>
      </div>

      <div style={{padding:"0 18px", marginBottom:14}}>
        <div style={{height:4, background:"#24242A", borderRadius:99, overflow:"hidden"}}>
          <div style={{height:"100%", width:student.prog+"%", background:"#F2B744"}}/>
        </div>
      </div>

      {student.flag && (
        <div style={{margin:"0 18px 14px", padding:"10px 12px", background:"rgba(242,183,68,0.08)", border:"1px solid rgba(242,183,68,0.35)", borderRadius:10, color:"#F2B744", fontSize:12, display:"flex", alignItems:"center", gap:8}}>
          <Icon name="warning" size={13}/> {student.flag}
        </div>
      )}

      <div style={{padding:"0 18px", display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:14}}>
        {[
          {k:"Lezioni",     v:"14"},
          {k:"Esercizi",    v:"11"},
          {k:"Ultimo ok",   v:"2 giorni"},
          {k:"Settimane",   v:"7"},
        ].map(s=>(
          <div key={s.k} style={{background:"#141417", border:"1px solid #24242A", borderRadius:10, padding:12}}>
            <div style={{fontFamily:"JetBrains Mono,monospace", fontSize:9, textTransform:"uppercase", letterSpacing:"0.22em", color:"#9A9AA2", marginBottom:4}}>{s.k}</div>
            <div style={{fontFamily:"'Big Shoulders Display',sans-serif", fontWeight:800, fontSize:22, color:"#F5F3ED"}}>{s.v}</div>
          </div>
        ))}
      </div>

      <div style={{padding:"0 18px", display:"flex", flexDirection:"column", gap:10}}>
        <button onClick={()=>nav && nav("chat")} style={{height:48, borderRadius:12, background:"#F2B744", color:"#0B0B0D", fontFamily:"'Big Shoulders Display',sans-serif", fontWeight:800, textTransform:"uppercase", letterSpacing:"0.05em", fontSize:13, display:"flex", alignItems:"center", justifyContent:"center", gap:8}}>
          <Icon name="chat" size={14}/> Scrivi a {student.name.split(" ")[0]}
        </button>
        <button onClick={()=>window.mpToast && window.mpToast("Apri da desktop per assegnare", "info")} style={{height:48, borderRadius:12, background:"#141417", color:"#F5F3ED", border:"1px solid #24242A", fontSize:13, fontWeight:500, display:"flex", alignItems:"center", justifyContent:"center", gap:8}}>
          <Icon name="plus" size={13}/> Assegna nuovo materiale
        </button>
        <button onClick={()=>window.mpToast && window.mpToast("Profilo completo disponibile su desktop", "info")} style={{height:44, borderRadius:12, background:"transparent", color:"#9A9AA2", border:"1px solid #24242A", fontSize:12}}>
          Vedi profilo completo
        </button>
      </div>
    </div>
  );
}

function CMStudents({ nav }) {
  const students = window.STUDENTS_LIST || [
    {name:"Luca Bianchi", i:"LB", level:"Intermedio", prog:42, flag:"1 feedback da fare"},
    {name:"Sara Verdi", i:"SV", level:"Avanzato", prog:68, flag:"pick settimana"},
    {name:"Andrea Ferri", i:"AF", level:"Int. avanzato", prog:55, flag:"in attesa 26h"},
    {name:"Giulia Romano", i:"GR", level:"Intermedio", prog:31},
    {name:"Dario Lombardi", i:"DL", level:"Int. avanzato", prog:48},
  ];
  const [search, setSearch] = React.useState("");
  const [selected, setSelected] = React.useState(null);

  if (selected) return <CMStudentDetail student={selected} onBack={()=>setSelected(null)} nav={nav}/>;

  const q = search.trim().toLowerCase();
  const filtered = q ? students.filter(s => s.name.toLowerCase().includes(q) || s.level.toLowerCase().includes(q)) : students;

  return (
    <div style={{background:"#0B0B0D", color:"#F5F3ED", minHeight:"100%", paddingBottom:130}}>
      <CMHeader
        kicker={`${students.length} studenti attivi`}
        title={<>I tuoi <em style={{color:"#F2B744"}}>studenti</em>.</>}
      />
      <div style={{padding:"4px 18px 14px"}}>
        <div style={{display:"flex", alignItems:"center", gap:10, background:"#141417", border:"1px solid #24242A", borderRadius:14, padding:"11px 14px"}}>
          <Icon name="search" size={15} color="#9A9AA2"/>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Cerca studente…" style={{flex:1, background:"transparent", outline:"none", border:"none", fontSize:13, color:"#F5F3ED"}}/>
          {search && <button onClick={()=>setSearch("")} style={{color:"#9A9AA2", display:"flex"}}><Icon name="x" size={13}/></button>}
        </div>
      </div>
      <div style={{padding:"0 18px", display:"flex", flexDirection:"column", gap:10}}>
        {filtered.length === 0 && (
          <div style={{padding:"24px 0", textAlign:"center", color:"#8A8A92", fontSize:13}}>Nessun risultato per "{search}".</div>
        )}
        {filtered.map((s,i)=>(
          <button key={i} onClick={()=>setSelected(s)} style={{display:"flex", alignItems:"center", gap:12, background:"#141417", border:"1px solid #24242A", borderRadius:14, padding:"14px", textAlign:"left", cursor:"pointer"}}>
            <Avatar initials={s.i} size={44}/>
            <div style={{flex:1, minWidth:0}}>
              <div style={{fontFamily:"'Big Shoulders Display',sans-serif", fontWeight:800, textTransform:"uppercase", letterSpacing:"0.005em", fontSize:18, lineHeight:1.1, color:"#F5F3ED"}}>{s.name}</div>
              <div style={{fontFamily:"JetBrains Mono,monospace", fontSize:10, textTransform:"uppercase", letterSpacing:"0.15em", color:"#9A9AA2", marginTop:3}}>{s.level}</div>
              {s.flag && <div style={{fontSize:11, color:"#F2B744", marginTop:5, display:"inline-flex", alignItems:"center", gap:5}}><span style={{width:6,height:6,borderRadius:99,background:"#F2B744",display:"inline-block"}}/> {s.flag}</div>}
              <div style={{height:3, background:"#24242A", borderRadius:99, marginTop:10}}>
                <div style={{height:"100%", width:s.prog+"%", background:"#F2B744", borderRadius:99}}/>
              </div>
            </div>
            <Icon name="chevron" size={13} color="#9A9AA2"/>
          </button>
        ))}
      </div>
    </div>
  );
}

function CMLibraryMobile() {
  const cats = [
    {cat:"Tecnica", count:14, sub:["Pennata","Legato","Muting","Bending"]},
    {cat:"Teoria", count:11, sub:["Modi","Armonia","12 bar"]},
    {cat:"Fraseggio", count:9, sub:["Dorico","Pentatonica","Mixolidio"]},
    {cat:"Groove", count:8, sub:["Shuffle","Funk","Latin"]},
  ];
  const [expanded, setExpanded] = React.useState(null);
  const lessonsFor = (cat) => {
    const base = {
      Tecnica: ["Pennata alternata · 12 min","Legato · base · 9 min","Muting con palmo · 11 min","Bending controllato · 14 min"],
      Teoria: ["I modi della maggiore · 18 min","12 bar blues · 10 min","Armonia quartale · 15 min"],
      Fraseggio: ["Dorico su II-V · 12 min","Pentatonica mista · 9 min","Mixolidio dominante · 11 min"],
      Groove: ["Shuffle Texas · 13 min","Funk 16th · 10 min","Latin clave · 12 min"],
    };
    return base[cat] || [];
  };
  return (
    <div style={{background:"#0B0B0D", color:"#F5F3ED", minHeight:"100%", paddingBottom:130}}>
      <CMHeader
        kicker="11 lezioni · metodo P.G.T."
        title={<>La tua <em style={{color:"#F2B744"}}>libreria</em>.</>}
        right={<div style={{fontFamily:"JetBrains Mono,monospace", fontSize:9, color:"#F2B744", textTransform:"uppercase", letterSpacing:"0.2em", padding:"5px 9px", background:"rgba(242,183,68,0.1)", border:"1px solid rgba(242,183,68,0.3)", borderRadius:3, marginTop:4}}>v1</div>}
      />
      <div style={{padding:"0 18px", display:"flex", flexDirection:"column", gap:12}}>
        {cats.map(c=>{
          const isOpen = expanded === c.cat;
          return (
            <div key={c.cat} style={{background:"#141417", border:"1px solid "+(isOpen?"rgba(242,183,68,0.45)":"#24242A"), borderRadius:14, overflow:"hidden"}}>
              <button onClick={()=>setExpanded(isOpen?null:c.cat)} style={{width:"100%", padding:16, background:"transparent", border:"none", textAlign:"left", cursor:"pointer"}}>
                <div style={{display:"flex", justifyContent:"space-between", alignItems:"baseline", marginBottom:10}}>
                  <div style={{fontFamily:"'Big Shoulders Display',sans-serif", fontWeight:800, textTransform:"uppercase", letterSpacing:"0.005em", fontSize:20, color:"#F5F3ED"}}>{c.cat}</div>
                  <div style={{display:"flex", alignItems:"center", gap:8}}>
                    <span style={{fontFamily:"JetBrains Mono,monospace", fontSize:10, color:"#9A9AA2", textTransform:"uppercase", letterSpacing:"0.15em"}}>{c.count} lezioni</span>
                    <span style={{color:"#9A9AA2", transform:isOpen?"rotate(90deg)":"none", transition:"transform 0.2s", display:"inline-flex"}}><Icon name="chevron" size={12}/></span>
                  </div>
                </div>
                <div style={{display:"flex", gap:6, flexWrap:"wrap"}}>
                  {c.sub.map(s=>(
                    <span key={s} style={{fontSize:11, padding:"5px 11px", background:"#0B0B0D", border:"1px solid #24242A", borderRadius:99, color:"#C9C9D0"}}>{s}</span>
                  ))}
                </div>
              </button>
              {isOpen && (
                <div style={{borderTop:"1px solid #24242A", padding:"8px 6px 10px"}}>
                  {lessonsFor(c.cat).map((l,i)=>(
                    <button key={i} onClick={()=>window.mpToast && window.mpToast("Apri lezione: "+l.split(" · ")[0], "info")} style={{width:"100%", display:"flex", alignItems:"center", gap:10, padding:"10px 12px", background:"transparent", border:"none", textAlign:"left", cursor:"pointer", borderRadius:8}}>
                      <div style={{width:28, height:28, borderRadius:7, background:"#0B0B0D", border:"1px solid #24242A", display:"flex", alignItems:"center", justifyContent:"center", color:"#F2B744"}}><Icon name="play" size={10}/></div>
                      <span style={{flex:1, fontSize:12.5, color:"#D9D9DE"}}>{l}</span>
                      <Icon name="chevron" size={11} color="#8A8A92"/>
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
        <div style={{background:"rgba(242,183,68,0.06)", border:"1px dashed rgba(242,183,68,0.35)", borderRadius:14, padding:14, marginTop:4}}>
          <div style={{fontFamily:"JetBrains Mono,monospace", fontSize:10, letterSpacing:"0.22em", textTransform:"uppercase", color:"#F2B744", marginBottom:6}}>Struttura v1 · da finalizzare</div>
          <div style={{fontSize:12.5, color:"#C9C9D0", lineHeight:1.5}}>Marco, dobbiamo decidere se aggiungere categorie tipo "Orecchio" o "Improvvisazione" — ne parliamo insieme.</div>
        </div>
        <button onClick={()=>window.mpToast && window.mpToast("Upload disponibile da desktop", "info")} style={{height:52, borderRadius:14, background:"#F2B744", color:"#0B0B0D", fontFamily:"'Big Shoulders Display',sans-serif", fontWeight:800, textTransform:"uppercase", letterSpacing:"0.05em", fontSize:14, display:"flex", alignItems:"center", justifyContent:"center", gap:8, marginTop:4}}>
          <Icon name="plus" size={14}/> Aggiungi lezione
        </button>
      </div>
    </div>
  );
}

function CoachMobile({ route, onRoute }) {
  const screen = (() => {
    if (route==="review")   return <CMReview nav={onRoute}/>;
    if (route==="students") return <CMStudents nav={onRoute}/>;
    if (route==="chat")     return <window.MSChat nav={onRoute} perspective="coach"/>;
    if (route==="library")  return <CMLibraryMobile/>;
    return <CMReview nav={onRoute}/>;
  })();
  return (
    <div style={{minHeight:"100vh", background:"#0B0B0D", padding:"48px 20px 80px", display:"flex", gap:36, justifyContent:"center", alignItems:"flex-start", flexWrap:"wrap"}}>
      <div style={{display:"flex", flexDirection:"column", alignItems:"center", gap:18}}>
        <div style={{fontFamily:"JetBrains Mono,monospace", fontSize:10, textTransform:"uppercase", letterSpacing:"0.22em", color:"#9A9AA2"}}>Coach · mobile</div>
        <div style={{position:"relative"}}>
          <window.IOSDevice width={390} height={844}>{screen}</window.IOSDevice>
          <div style={{position:"absolute", bottom:24, left:0, right:0, zIndex:60, pointerEvents:"none"}}>
            <div style={{pointerEvents:"auto"}}>
              <CMBottomTab route={route} onRoute={onRoute}/>
            </div>
          </div>
        </div>
        <div style={{display:"flex", gap:8, flexWrap:"wrap", justifyContent:"center", maxWidth:420}}>
          {[{id:"review",l:"Correggi"},{id:"students",l:"Studenti"},{id:"chat",l:"Chat"},{id:"library",l:"Libreria"}].map(q=>(
            <button key={q.id} onClick={()=>onRoute(q.id)} style={{height:30, padding:"0 11px", borderRadius:99, fontSize:11, fontWeight:500,
              background: route===q.id?"#F5F3ED":"transparent", color: route===q.id?"#0B0B0D":"#9A9AA2",
              border: route===q.id?"none":"1px solid #24242A"}}>{q.l}</button>
          ))}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { StudentDesktop, CoachMobile });
