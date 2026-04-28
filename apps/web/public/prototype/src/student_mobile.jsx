// ─── STUDENTE MOBILE — tutte le schermate in frame iPhone ────────────

const MS_TABS = [
  { id:"home",      label:"Piano",     icon:"home" },
  { id:"community", label:"Sala prove", icon:"users" },
  { id:"chat",      label:"Marco",     icon:"chat" },
  { id:"activity",  label:"Attività",  icon:"bell", badge:true },
];

// Bottom tab bar fissa
function MSBottomTab({ route, onRoute }) {
  return (
    <div style={{margin:"0 14px", borderRadius:26, overflow:"hidden", position:"relative",
      boxShadow:"0 10px 30px rgba(23,17,14,0.35), 0 0 0 0.5px rgba(250,247,242,0.08)"}}>
        <div style={{position:"absolute", inset:0, background:"rgba(23,17,14,0.78)",
          backdropFilter:"blur(22px) saturate(180%)", WebkitBackdropFilter:"blur(22px) saturate(180%)"}}/>
        <div style={{position:"relative", display:"flex", padding:"10px 6px"}}>
          {MS_TABS.map(t=>{
            const active = route===t.id;
            return (
              <button key={t.id} onClick={()=>onRoute(t.id)} style={{flex:1, display:"flex", flexDirection:"column",
                alignItems:"center", gap:3, padding:"8px 0", color: active?"#F2B744":"#8A8A92"}}>
                <div style={{position:"relative"}}>
                  <Icon name={t.icon} size={20} stroke={active?2:1.6}/>
                  {t.badge && <div style={{position:"absolute", top:-2, right:-4, width:7, height:7, borderRadius:99, background:"#F2B744", boxShadow:"0 0 0 1.5px #F5F3ED"}}/>}
                </div>
                <span style={{fontSize:10, fontWeight: active?600:500, letterSpacing:"0.02em"}}>{t.label}</span>
              </button>
            );
          })}
        </div>
    </div>
  );
}

// Header mobile editoriale — compatto
function MSHeader({ kicker, title, right, dark=false }) {
  return (
    <div style={{padding:"68px 22px 14px 22px"}}>
      <div style={{display:"flex", justifyContent:"space-between", alignItems:"flex-start"}}>
        <div>
          {kicker && <div style={{fontFamily:"JetBrains Mono,monospace", fontSize:10, letterSpacing:"0.22em", textTransform:"uppercase", color: dark?"#8A8A92":"#9A9AA2", marginBottom:10}}>{kicker}</div>}
          <h1 style={{fontFamily:"'Big Shoulders Display',sans-serif", fontWeight:800, textTransform:"uppercase", letterSpacing:"-0.01em", fontSize:38, lineHeight:1.02, color: dark?"#0B0B0D":"#F5F3ED", margin:0, maxWidth:320}}>{title}</h1>
        </div>
        {right}
      </div>
    </div>
  );
}

// ─── SCHERMATA HOME MOBILE
function MSHome({ nav, goTab }) {
  return (
    <div style={{background:"#0B0B0D", minHeight:"100%", paddingBottom:120}}>
      <MSHeader
        kicker="Mar 21 apr · sett. 3 di 26"
        title={<>Ciao Luca.<br/><em style={{color:"#F2B744", }}>Senti</em> questa settimana.</>}
        right={<button onClick={()=>goTab("activity")} style={{position:"relative", width:40, height:40, borderRadius:99, background:"#141417", color:"#F5F3ED", display:"flex", alignItems:"center", justifyContent:"center"}}>
          <Icon name="bell" size={16}/>
          <span style={{position:"absolute", top:8, right:9, width:8, height:8, borderRadius:99, background:"#F2B744", boxShadow:"0 0 0 2px #0B0B0D"}}/>
        </button>}
      />

      {/* Alert feedback nuovo */}
      <button onClick={()=>nav("feedback")} style={{display:"flex", margin:"0 18px 16px", width:"calc(100% - 36px)", background:"#F2B744", color:"#0B0B0D", borderRadius:14, padding:"14px 16px", alignItems:"center", gap:12, textAlign:"left"}}>
        <div style={{width:38, height:38, borderRadius:10, background:"rgba(11,11,13,0.12)", display:"flex", alignItems:"center", justifyContent:"center"}}>
          <Icon name="inbox" size={16}/>
        </div>
        <div style={{flex:1}}>
          <div style={{fontSize:11, fontFamily:"JetBrains Mono,monospace", textTransform:"uppercase", letterSpacing:"0.15em", opacity:0.75}}>nuovo feedback</div>
          <div style={{fontSize:14, fontWeight:600, marginTop:2}}>Marco ha commentato il tuo 12 bar</div>
        </div>
        <Icon name="chevron" size={14}/>
      </button>

      {/* Card percorso */}
      <div style={{margin:"0 18px 22px", background:"#141417", color:"#F5F3ED", borderRadius:18, padding:22, position:"relative", overflow:"hidden"}}>
        <div style={{position:"absolute", right:-40, top:-40, width:180, height:180, borderRadius:99, background:"radial-gradient(circle, rgba(242,183,68,0.35), transparent 60%)"}}/>
        <div style={{position:"relative"}}>
          <div style={{fontFamily:"JetBrains Mono,monospace", fontSize:10, letterSpacing:"0.22em", textTransform:"uppercase", color:"#8A8A92", marginBottom:8}}>Percorso attivo</div>
          <div style={{fontFamily:"'Big Shoulders Display',sans-serif", fontWeight:800, textTransform:"uppercase", letterSpacing:"0.005em", fontSize:26, lineHeight:1.1}}>Linguaggio & <em style={{color:"#F2B744", }}>Tempo</em></div>
          <div style={{fontSize:12, color:"#C9C9D0", marginTop:4}}>6 mesi · fino al 14 ott 2026</div>
          <div style={{display:"flex", justifyContent:"space-between", fontSize:10, fontFamily:"JetBrains Mono,monospace", textTransform:"uppercase", letterSpacing:"0.15em", color:"#8A8A92", marginTop:18, marginBottom:6}}>
            <span>mese 3 di 6</span><span>42%</span>
          </div>
          <div style={{height:3, background:"#3A2E27", borderRadius:99, overflow:"hidden"}}>
            <div style={{height:"100%", width:"42%", background:"#F2B744"}}/>
          </div>
        </div>
      </div>

      {/* Sezione lezioni */}
      <div style={{padding:"4px 22px 10px"}}>
        <div style={{fontFamily:"JetBrains Mono,monospace", fontSize:10, letterSpacing:"0.22em", textTransform:"uppercase", color:"#9A9AA2", marginBottom:6}}>Assegnate da Marco</div>
        <div style={{fontFamily:"'Big Shoulders Display',sans-serif", fontWeight:800, textTransform:"uppercase", letterSpacing:"0.005em", fontSize:26, lineHeight:1.1}}>Tre <em style={{color:"#F2B744"}}>lezioni</em>.</div>
      </div>

      <div style={{display:"flex", gap:12, padding:"10px 18px 4px", overflowX:"auto"}} className="no-scrollbar">
        {window.LESSONS_THIS_WEEK.map(l=>(
          <button key={l.id} onClick={()=>nav("lesson")} style={{minWidth:220, maxWidth:220, textAlign:"left"}}>
            <div style={{position:"relative", width:220, height:130, borderRadius:12, overflow:"hidden"}}>
              <div style={{position:"absolute", inset:0, background:"repeating-linear-gradient(135deg,#141417 0 12px,#1D1D22 12px 24px)"}}/>
              <div style={{position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center"}}>
                <div style={{width:46, height:46, borderRadius:99, background:"rgba(250,247,242,0.95)", display:"flex", alignItems:"center", justifyContent:"center", color:"#F5F3ED"}}><Icon name="play" size={14}/></div>
              </div>
              <div style={{position:"absolute", bottom:8, left:10, fontFamily:"JetBrains Mono,monospace", fontSize:10, color:"#8A8A92", textTransform:"uppercase", letterSpacing:"0.15em"}}>{l.duration}</div>
              {l.status==="in-progress" && <div style={{position:"absolute", bottom:0, left:0, height:3, background:"#F2B744", width:`${(l.progress||0)*100}%`}}/>}
            </div>
            <div style={{marginTop:10, marginBottom:3}}><StatusPill status={l.status}/></div>
            <div style={{fontFamily:"'Big Shoulders Display',sans-serif", fontWeight:800, textTransform:"uppercase", letterSpacing:"0.005em", fontSize:18, lineHeight:1.15}}>{l.title}</div>
          </button>
        ))}
      </div>

      {/* Esercizi */}
      <div style={{padding:"24px 22px 10px"}}>
        <div style={{fontFamily:"JetBrains Mono,monospace", fontSize:10, letterSpacing:"0.22em", textTransform:"uppercase", color:"#9A9AA2", marginBottom:6}}>Esercizi</div>
        <div style={{fontFamily:"'Big Shoulders Display',sans-serif", fontWeight:800, textTransform:"uppercase", letterSpacing:"0.005em", fontSize:26, lineHeight:1.1}}>Due da <em style={{color:"#F2B744"}}>registrare</em>.</div>
      </div>

      <div style={{padding:"8px 18px", display:"flex", flexDirection:"column", gap:12}}>
        {window.EXERCISES_THIS_WEEK.map(ex=>(
          <button key={ex.id} onClick={()=> ex.status==="feedback" ? nav("feedback") : nav("exercise")}
            style={{background:"#141417", border:"1px solid #24242A", borderRadius:14, padding:16, textAlign:"left", position:"relative", minHeight:56}}>
            {ex.newFeedback && <div style={{position:"absolute", top:14, right:14, width:8, height:8, borderRadius:99, background:"#F2B744"}}/>}
            <div style={{display:"flex", gap:8, marginBottom:8, alignItems:"center", flexWrap:"wrap"}}>
              <StatusPill status={ex.status}/>
              <Tag>bpm {ex.bpm}</Tag>
            </div>
            <div style={{fontFamily:"'Big Shoulders Display',sans-serif", fontWeight:800, textTransform:"uppercase", letterSpacing:"0.005em", fontSize:20, lineHeight:1.2, marginBottom:6}}>{ex.title}</div>
            <div style={{fontSize:12.5, color:"#9A9AA2", }}>"{ex.note}"</div>
            <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", borderTop:"1px solid #24242A", marginTop:12, paddingTop:10, fontSize:11}}>
              <span style={{fontFamily:"JetBrains Mono,monospace", textTransform:"uppercase", letterSpacing:"0.15em", color:"#9A9AA2"}}>entro {ex.due}</span>
              <span style={{color:"#F5F3ED", fontWeight:600, display:"inline-flex", alignItems:"center", gap:4}}>
                {ex.status==="feedback"?"Vedi feedback":"Registra"} <Icon name="chevron" size={11}/>
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── COMMUNITY MOBILE
function MSCommunity({ nav }) {
  const POSTS = [
    { id:"p1", a:"Andrea Ferri",   i:"AF", l:"Avanzato",       t:"ieri",         ex:"Shuffle in Mi",    title:"Shuffle lento. Cerco il groove.",  d:"2:14", claps:17, replies:7, mine:false, hot:true,  coach:false },
    { id:"p2", a:"Giulia Romano",  i:"GR", l:"Intermedio",     t:"2 giorni fa",  ex:"Legato",           title:"Aiuto sull'indice!",               d:"0:52", claps:12, replies:11, mine:false, hot:false, coach:true  },
    { id:"p3", a:"Dario Lombardi", i:"DL", l:"Int. avanzato",  t:"3 giorni fa",  ex:"Fraseggio dorico", title:"Dorico sul 6° — respirando.",      d:"1:20", claps:22, replies:3, mine:false, hot:true,  coach:false },
    { id:"p4", a:"Luca Bianchi",   i:"LB", l:"Intermedio",     t:"4 giorni fa",  ex:"12 bar in La",     title:"Prima take del 12 bar.",           d:"1:48", claps:8,  replies:4, mine:true,  hot:false, coach:true  },
  ];
  const FILTERS = [
    { id:"all",   label:"Tutti" },
    { id:"week",  label:"Esercizio della settimana" },
    { id:"mine",  label:"I miei" },
    { id:"hot",   label:"Più ascoltati" },
    { id:"coach", label:"Con risposta di Marco" },
  ];
  const [filter, setFilter] = React.useState("all");
  const [reactions, setReactions] = React.useState({});
  const [playingId, setPlayingId] = React.useState(null);
  const [openComment, setOpenComment] = React.useState(null);
  const [commentText, setCommentText] = React.useState("");
  const toggleReaction = (postId, kind) => {
    const key = postId+":"+kind;
    const wasOn = !!reactions[key];
    setReactions(r => ({...r, [key]: !wasOn}));
    window.mpToast && window.mpToast(wasOn ? "Reazione rimossa" : "Reazione inviata", "ok");
  };
  const isReacted = (postId, kind) => !!reactions[postId+":"+kind];
  const postComment = () => {
    if (!commentText.trim()) return;
    window.mpToast && window.mpToast("Commento pubblicato", "ok");
    setCommentText("");
    setOpenComment(null);
  };
  const displayed = POSTS.filter(p => {
    if (filter==="mine")  return p.mine;
    if (filter==="hot")   return p.hot;
    if (filter==="coach") return p.coach;
    if (filter==="week")  return p.ex.includes("12 bar") || p.ex.includes("Shuffle");
    return true;
  });
  const togglePlay = (id) => {
    const next = playingId===id ? null : id;
    setPlayingId(next);
    window.mpToast && window.mpToast(next ? "Play" : "Pausa", "info");
  };

  return (
    <div style={{background:"#0B0B0D", minHeight:"100%", paddingBottom:130, position:"relative"}}>
      <MSHeader kicker="Sala prove · 28 studenti" title={<><em style={{color:"#F2B744", }}>Ascoltatevi</em> tra di voi.</>}/>

      {/* Pick della settimana */}
      <div style={{margin:"0 18px 16px", background:"#141417", color:"#F5F3ED", borderRadius:18, padding:20, position:"relative", overflow:"hidden"}}>
        <div style={{position:"absolute", right:-30, bottom:-30, width:160, height:160, borderRadius:99, background:"radial-gradient(circle, rgba(242,183,68,0.35), transparent 60%)"}}/>
        <div style={{position:"relative"}}>
          <div style={{fontFamily:"JetBrains Mono,monospace", fontSize:10, letterSpacing:"0.2em", textTransform:"uppercase", color:"#F2B744", marginBottom:8, display:"flex", alignItems:"center", gap:6}}><Icon name="star" size={11}/> pick di marco</div>
          <div style={{fontFamily:"'Big Shoulders Display',sans-serif", fontWeight:800, textTransform:"uppercase", letterSpacing:"0.005em", fontSize:20, lineHeight:1.2, marginBottom:14}}>"Sara ha capito una cosa importante su questo 12 bar."</div>
          <div style={{display:"flex", alignItems:"center", gap:10, marginBottom:12}}>
            <Avatar initials="SV" size={32} tone="ember"/>
            <div>
              <div style={{fontSize:13}}>Sara Verdi</div>
              <div style={{fontFamily:"JetBrains Mono,monospace", fontSize:10, textTransform:"uppercase", letterSpacing:"0.15em", color:"#8A8A92"}}>12 bar · 1:48</div>
            </div>
          </div>
          <div style={{display:"flex", alignItems:"center", gap:12, background:"#1A1A1F", border:"1px solid #24242A", borderRadius:12, padding:"10px 12px"}}>
            <button onClick={()=>togglePlay("pick")} style={{width:38, height:38, borderRadius:99, background:"#F2B744", color:"#0B0B0D", display:"flex", alignItems:"center", justifyContent:"center"}}><Icon name={playingId==="pick"?"pause":"play"} size={13}/></button>
            <div style={{flex:1}}><Waveform dark progress={0.42}/></div>
            <div style={{fontFamily:"JetBrains Mono,monospace", fontSize:10, color:"#8A8A92"}}>01:48</div>
          </div>
        </div>
      </div>

      {/* CTA Condividi la tua take */}
      <button
        onClick={()=>nav("exercise")}
        style={{display:"flex", alignItems:"center", justifyContent:"center", gap:10, margin:"0 18px 16px", width:"calc(100% - 36px)", height:52, borderRadius:14, background:"#F2B744", color:"#0B0B0D", fontFamily:"'Big Shoulders Display',sans-serif", fontWeight:800, textTransform:"uppercase", letterSpacing:"0.05em", fontSize:14, boxShadow:"0 8px 22px rgba(242,183,68,0.25)"}}>
        <span style={{width:18, height:18, borderRadius:99, border:"1.5px solid #0B0B0D", display:"inline-flex", alignItems:"center", justifyContent:"center"}}>
          <span style={{width:6, height:6, borderRadius:99, background:"#0B0B0D"}}/>
        </span>
        Condividi la tua take
      </button>

      {/* Filtri scrollabili */}
      <div style={{display:"flex", gap:8, padding:"4px 18px 14px", overflowX:"auto"}} className="no-scrollbar">
        {FILTERS.map(f=>{
          const active = filter===f.id;
          return (
            <button
              key={f.id}
              onClick={()=>setFilter(f.id)}
              style={{flexShrink:0, height:34, padding:"0 14px", borderRadius:99, background:active?"#F5F3ED":"transparent", color:active?"#0B0B0D":"#9A9AA2", border:active?"none":"1px solid #24242A", fontSize:12, fontWeight:500, whiteSpace:"nowrap"}}>
              {f.label}
            </button>
          );
        })}
      </div>

      {/* Posts */}
      <div style={{padding:"4px 18px", display:"flex", flexDirection:"column", gap:16}}>
        {displayed.length === 0 && (
          <div style={{padding:"32px 0", textAlign:"center", color:"#8A8A92", fontSize:13}}>Nessun post in questa selezione.</div>
        )}
        {displayed.map(p=>{
          const clapped = isReacted(p.id, "clap");
          const playing = playingId===p.id;
          return (
            <article key={p.id} style={{background:"#141417", border:"1px solid #24242A", borderRadius:14, padding:16}}>
              <div style={{display:"flex", gap:10, alignItems:"center", marginBottom:10}}>
                <Avatar initials={p.i} size={34}/>
                <div style={{flex:1, minWidth:0}}>
                  <div style={{fontFamily:"'Big Shoulders Display',sans-serif", fontWeight:800, textTransform:"uppercase", letterSpacing:"0.005em", fontSize:16}}>{p.a}{p.mine && <span style={{fontSize:10, color:"#F2B744", marginLeft:6, fontFamily:"JetBrains Mono,monospace", textTransform:"uppercase", letterSpacing:"0.15em"}}>tu</span>}</div>
                  <div style={{fontFamily:"JetBrains Mono,monospace", fontSize:10, textTransform:"uppercase", letterSpacing:"0.15em", color:"#9A9AA2"}}>{p.l} · {p.t}</div>
                </div>
                <Tag>{p.ex}</Tag>
              </div>
              <div style={{fontFamily:"'Big Shoulders Display',sans-serif", fontWeight:800, textTransform:"uppercase", letterSpacing:"0.005em", fontSize:19, lineHeight:1.2, marginBottom:10}}>{p.title}</div>
              <div style={{display:"flex", alignItems:"center", gap:10, background:"#0B0B0D", border:"1px solid #24242A", borderRadius:10, padding:"8px 10px", marginBottom:10}}>
                <button onClick={()=>togglePlay(p.id)} style={{width:36, height:36, borderRadius:99, background:playing?"#F2B744":"#141417", color:playing?"#0B0B0D":"#F5F3ED", display:"flex", alignItems:"center", justifyContent:"center"}}><Icon name={playing?"pause":"play"} size={12}/></button>
                <div style={{flex:1}}><Waveform dark={false} progress={playing?0.3:0}/></div>
                <div style={{fontFamily:"JetBrains Mono,monospace", fontSize:10, color:"#9A9AA2"}}>{p.d}</div>
              </div>
              <div style={{display:"flex", gap:14, fontSize:12, color:"#9A9AA2", alignItems:"center"}}>
                <button onClick={()=>toggleReaction(p.id, "clap")} style={{display:"inline-flex", alignItems:"center", gap:5, color:clapped?"#F2B744":"#9A9AA2"}}>
                  <Icon name="sparkle" size={12}/>{p.claps + (clapped?1:0)}
                </button>
                <button onClick={()=>setOpenComment(openComment===p.id?null:p.id)} style={{display:"inline-flex", alignItems:"center", gap:5, color:openComment===p.id?"#F5F3ED":"#9A9AA2"}}>
                  <Icon name="chat" size={12}/>{p.replies}
                </button>
                <button
                  onClick={()=>setOpenComment(openComment===p.id?null:p.id)}
                  style={{marginLeft:"auto", height:28, padding:"0 12px", borderRadius:99, border:"1px solid "+(openComment===p.id?"#F5F3ED":"#24242A"), color:openComment===p.id?"#F5F3ED":"#9A9AA2", fontSize:11, fontWeight:500}}>
                  Commenta
                </button>
              </div>
              {p.coach && <div style={{marginTop:8, fontFamily:"JetBrains Mono,monospace", fontSize:9, textTransform:"uppercase", letterSpacing:"0.18em", color:"#F2B744"}}>· risposta di marco</div>}

              {openComment===p.id && (
                <div style={{marginTop:12, paddingTop:12, borderTop:"1px solid #24242A"}}>
                  <textarea
                    value={commentText}
                    onChange={e=>setCommentText(e.target.value)}
                    rows={2}
                    placeholder={"Scrivi a "+p.a.split(" ")[0]+"…"}
                    style={{width:"100%", background:"#0B0B0D", border:"1px solid #24242A", borderRadius:10, padding:"10px 12px", color:"#F5F3ED", fontSize:13, outline:"none", resize:"none", fontFamily:"inherit", boxSizing:"border-box"}}
                  />
                  <div style={{display:"flex", alignItems:"center", justifyContent:"space-between", marginTop:8, gap:8}}>
                    <button
                      onClick={()=>window.mpToast && window.mpToast("Registra risposta audio · v2", "info")}
                      style={{height:32, padding:"0 12px", borderRadius:99, border:"1px solid #24242A", color:"#9A9AA2", fontSize:11, display:"inline-flex", alignItems:"center", gap:6}}>
                      <Icon name="mic" size={12}/> Audio
                    </button>
                    <div style={{display:"flex", gap:8}}>
                      <button
                        onClick={()=>{ setOpenComment(null); setCommentText(""); }}
                        style={{height:32, padding:"0 12px", borderRadius:99, color:"#9A9AA2", fontSize:11}}>
                        Annulla
                      </button>
                      <button
                        onClick={postComment}
                        disabled={!commentText.trim()}
                        style={{height:32, padding:"0 14px", borderRadius:99, background:commentText.trim()?"#F2B744":"#24242A", color:commentText.trim()?"#0B0B0D":"#5A5A62", fontSize:11, fontWeight:600}}>
                        Pubblica
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </article>
          );
        })}
      </div>

    </div>
  );
}

// ─── CHAT MOBILE — stile WhatsApp
// perspective "student" → thread singolo con Marco (window.CHAT)
// perspective "coach"   → inbox di 3 thread (window.COACH_CHATS), tap per aprire
// perspective "collab"  → inbox di 3 thread (window.COLLAB_CHATS), tap per aprire
function MSChat({ nav, perspective="student" }) {
  const [msg,setMsg] = React.useState("");
  const isCoach = perspective === "coach" || perspective === "collab";
  const coachChats = perspective === "collab"
    ? (window.COLLAB_CHATS || [])
    : (window.COACH_CHATS || []);
  const [activeId, setActiveId] = React.useState(null); // null in coach/collab = inbox view
  const [inboxSearch, setInboxSearch] = React.useState("");
  const meRole = isCoach ? "coach" : "student";

  // chat attiva: per student è sempre Marco; per coach è la selezionata (o null = inbox)
  const chat = isCoach
    ? (activeId ? coachChats.find(c => c.id === activeId) : null)
    : { id:"marco", name:"Marco Petta", initials:"MP", status:"visto oggi alle 08:31", messages: window.CHAT };

  // reset composer al cambio thread
  React.useEffect(()=>{ setMsg(""); }, [activeId]);

  // typing indicator con timer (spegne dopo 6s)
  const [typing, setTyping] = React.useState(true);
  React.useEffect(()=>{
    setTyping(true);
    const t = setTimeout(()=>setTyping(false), 6000);
    return ()=>clearTimeout(t);
  }, [activeId]);

  // Palette chat — tema Marco Petta (ink/amber)
  const WA = {
    headerBg: "#141417",
    wallpaper: "#0B0B0D",
    wallpaperPattern: "radial-gradient(rgba(242,183,68,0.035) 1px, transparent 1px)",
    inBubble: "#1D1D22",
    outBubble: "#F2B744",
    inText: "#F5F3ED",
    outText: "#0B0B0D",
    subtext: "#9A9AA2",
    tick: "#0B0B0D",
    composerBg: "#141417",
    composerInput: "#1D1D22",
    micBg: "#F2B744",
    micFg: "#0B0B0D",
  };

  // ─── INBOX mobile (solo coach) ───────────────────────────────────
  if (isCoach && !chat) {
    const filtered = coachChats.filter(c =>
      !inboxSearch || c.name.toLowerCase().includes(inboxSearch.toLowerCase())
    );
    return (
      <div style={{background:"#0B0B0D", minHeight:"100%", display:"flex", flexDirection:"column", position:"relative"}}>
        {/* Header inbox */}
        <div style={{background:"#141417", padding:"58px 16px 14px", flexShrink:0, boxShadow:"0 1px 0 rgba(0,0,0,0.2)"}}>
          <div style={{display:"flex", alignItems:"center", gap:8, marginBottom:10}}>
            <button onClick={()=>nav && nav("home")} style={{width:32, height:32, display:"flex", alignItems:"center", justifyContent:"center", color:"#F5F3ED"}}>
              <Icon name="chevronl" size={16}/>
            </button>
            <div style={{fontFamily:"JetBrains Mono,monospace", fontSize:10, letterSpacing:"0.2em", textTransform:"uppercase", color:WA.subtext}}>
              {perspective === "collab" ? "collab · inbox" : "coach · inbox"}
            </div>
          </div>
          <div style={{fontFamily:"'Big Shoulders Display',sans-serif", fontWeight:800, fontSize:34, letterSpacing:"0.01em", textTransform:"uppercase", color:"#F5F3ED", lineHeight:1}}>
            Chat · <span style={{color:"#F2B744"}}>{coachChats.length}</span>
          </div>
          <div style={{position:"relative", marginTop:14}}>
            <span style={{position:"absolute", left:10, top:"50%", transform:"translateY(-50%)", color:WA.subtext}}>
              <Icon name="search" size={13}/>
            </span>
            <input
              value={inboxSearch}
              onChange={e=>setInboxSearch(e.target.value)}
              placeholder="Cerca studente…"
              style={{
                width:"100%", height:36, paddingLeft:32, paddingRight:12,
                background:"#1D1D22", border:"1px solid #24242A", borderRadius:2,
                fontSize:13, outline:"none", color:"#F5F3ED",
              }}
            />
          </div>
        </div>

        {/* Lista */}
        <div style={{flex:1, overflowY:"auto", paddingBottom:108}}>
          {filtered.map(c=>(
            <button key={c.id} onClick={()=>setActiveId(c.id)}
              style={{
                display:"flex", gap:12, width:"100%", textAlign:"left",
                padding:"14px 16px",
                borderBottom:"1px solid #1D1D22",
                background:"transparent",
              }}>
              <div style={{position:"relative", flexShrink:0}}>
                <div style={{width:48, height:48, borderRadius:99, background:c.unread>0?"#F2B744":"#1D1D22", color:c.unread>0?"#0B0B0D":"#F5F3ED", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'Big Shoulders Display',sans-serif", fontWeight:800, fontSize:15, textTransform:"uppercase"}}>{c.initials}</div>
                {c.online && (
                  <span style={{position:"absolute", right:-1, bottom:-1, width:13, height:13, borderRadius:99, background:"#7BB07B", border:"2px solid #0B0B0D"}}/>
                )}
              </div>
              <div style={{flex:1, minWidth:0}}>
                <div style={{display:"flex", justifyContent:"space-between", alignItems:"baseline", gap:8}}>
                  <div style={{fontFamily:"'Big Shoulders Display',sans-serif", fontWeight:700, fontSize:17, textTransform:"uppercase", letterSpacing:"0.01em", color:"#F5F3ED", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap"}}>
                    {c.name}
                  </div>
                  <div style={{flexShrink:0, fontFamily:"JetBrains Mono,monospace", fontSize:10, color:WA.subtext}}>{c.lastTime}</div>
                </div>
                <div style={{fontFamily:"JetBrains Mono,monospace", fontSize:9, letterSpacing:"0.08em", textTransform:"uppercase", color:WA.subtext, marginTop:3, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap"}}>
                  {c.level}
                </div>
                <div style={{display:"flex", alignItems:"center", gap:8, marginTop:5}}>
                  <div style={{flex:1, minWidth:0, fontSize:12.5, color:c.unread>0?"#F5F3ED":WA.subtext, lineHeight:1.35, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap"}}>
                    {c.lastPreview}
                  </div>
                  {c.unread>0 && (
                    <span style={{flexShrink:0, minWidth:20, height:20, padding:"0 6px", borderRadius:99, background:"#F2B744", color:"#0B0B0D", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"JetBrains Mono,monospace", fontSize:10, fontWeight:700}}>
                      {c.unread}
                    </span>
                  )}
                </div>
              </div>
            </button>
          ))}
          {filtered.length===0 && (
            <div style={{textAlign:"center", color:WA.subtext, fontSize:13, padding:"60px 20px"}}>
              Nessuna conversazione per "{inboxSearch}"
            </div>
          )}
        </div>
      </div>
    );
  }

  // ─── THREAD (comune a student + coach con chat selezionata) ──────
  const peerName = chat?.name || "";
  const peerInitials = chat?.initials || "";
  const peerStatus = chat?.status || "";
  const messages = chat?.messages || [];

  const onBack = () => {
    if (isCoach) setActiveId(null);
    else nav && nav("home");
  };

  return (
    <div style={{background:WA.wallpaper, minHeight:"100%", display:"flex", flexDirection:"column", position:"relative"}}>
      {/* Header WhatsApp */}
      <div style={{background:WA.headerBg, padding:"58px 10px 10px", display:"flex", alignItems:"center", gap:10, position:"sticky", top:0, zIndex:5, boxShadow:"0 1px 0 rgba(0,0,0,0.2)"}}>
        <button onClick={onBack} style={{width:32, height:32, display:"flex", alignItems:"center", justifyContent:"center", color:"#F5F3ED"}}>
          <Icon name="chevronl" size={16}/>
        </button>
        <div style={{width:40, height:40, borderRadius:99, background:"#F2B744", color:"#0B0B0D", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'Big Shoulders Display',sans-serif", fontWeight:800, fontSize:14, textTransform:"uppercase"}}>{peerInitials}</div>
        <div style={{flex:1, minWidth:0, lineHeight:1.15}}>
          <div style={{fontSize:15, fontWeight:600, color:"#F5F3ED", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", fontFamily:"'Big Shoulders Display',sans-serif", textTransform:"uppercase", letterSpacing:"0.01em"}}>{peerName}</div>
          <div style={{fontSize:11, color:WA.subtext, marginTop:2, fontFamily:"JetBrains Mono,monospace", letterSpacing:"0.05em"}}>{peerStatus}</div>
        </div>
        <button onClick={()=>window.mpToast && window.mpToast("Videochiamata · v2", "info")} style={{width:36, height:36, display:"flex", alignItems:"center", justifyContent:"center", color:"#F5F3ED"}}><Icon name="video" size={17}/></button>
        <button onClick={()=>window.mpToast && window.mpToast("Impostazioni chat · v2", "info")} style={{width:36, height:36, display:"flex", alignItems:"center", justifyContent:"center", color:"#F5F3ED"}}><Icon name="settings" size={16}/></button>
      </div>

      {/* Wallpaper + messaggi */}
      <div style={{flex:1, overflowY:"auto", padding:"14px 8px 100px", display:"flex", flexDirection:"column", gap:4,
        backgroundImage: WA.wallpaperPattern,
        backgroundSize: "18px 18px",
      }}>
        {/* Banner data */}
        <div style={{alignSelf:"center", background:"rgba(29,29,34,0.85)", color:WA.subtext, fontSize:10, padding:"4px 12px", borderRadius:2, marginBottom:6, backdropFilter:"blur(8px)", fontFamily:"JetBrains Mono,monospace", letterSpacing:"0.2em", textTransform:"uppercase"}}>OGGI</div>

        {/* Banner cifratura */}
        <div style={{alignSelf:"center", background:"rgba(29,29,34,0.85)", color:"#F2B744", fontSize:11, padding:"6px 12px", borderRadius:2, marginBottom:10, textAlign:"center", maxWidth:"90%", lineHeight:1.45, backdropFilter:"blur(8px)", fontFamily:"JetBrains Mono,monospace", letterSpacing:"0.03em"}}>
          🔒 Messaggi crittografati end-to-end — solo tu e {peerName.split(" ")[0]}.
        </div>

        {messages.map((m,i)=>{
          const isMe = m.from === meRole;
          const prev = messages[i-1];
          const grouped = prev && prev.from === m.from;
          return (
            <div key={i} style={{display:"flex", justifyContent: isMe?"flex-end":"flex-start", marginTop: grouped?1:6, padding:"0 4px"}}>
              <div style={{
                maxWidth:"78%",
                background: isMe ? WA.outBubble : WA.inBubble,
                color: isMe ? WA.outText : WA.inText,
                borderRadius: 3,
                borderTopLeftRadius: !isMe && !grouped ? 0 : 3,
                borderTopRightRadius: isMe && !grouped ? 0 : 3,
                padding: m.attach ? "4px 4px 6px" : "6px 10px 6px 10px",
                fontSize: 14.5,
                lineHeight: 1.4,
                position:"relative",
                boxShadow: isMe ? "0 1px 0 rgba(0,0,0,0.12)" : "0 1px 0 rgba(0,0,0,0.4)",
                minWidth: 70,
              }}>
                {!grouped && (
                  <div style={{
                    position:"absolute", top:0,
                    [isMe?"right":"left"]: -6,
                    width:0, height:0,
                    borderTop: `8px solid ${isMe ? WA.outBubble : WA.inBubble}`,
                    [isMe?"borderLeft":"borderRight"]: "6px solid transparent",
                  }}/>
                )}

                {m.attach && (
                  <div style={{background:"rgba(0,0,0,0.25)", borderRadius:2, overflow:"hidden", marginBottom:4, position:"relative"}}>
                    <div style={{aspectRatio:"4/3", background:"repeating-linear-gradient(135deg,#141417 0 10px,#1D1D22 10px 20px)", position:"relative"}}>
                      <div style={{position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center"}}>
                        <div style={{width:48, height:48, borderRadius:99, background:"rgba(11,11,13,0.65)", border:"2px solid rgba(242,183,68,0.9)", color:"#F2B744", display:"flex", alignItems:"center", justifyContent:"center"}}>
                          <Icon name="play" size={16}/>
                        </div>
                      </div>
                      <div style={{position:"absolute", top:6, left:8, fontFamily:"JetBrains Mono,monospace", fontSize:10, color:"#F5F3ED", background:"rgba(11,11,13,0.7)", padding:"2px 6px", borderRadius:2, letterSpacing:"0.05em"}}>▶ {m.attach.length}</div>
                      <div style={{position:"absolute", bottom:6, right:8, fontSize:10, color:"#9A9AA2", fontFamily:"JetBrains Mono,monospace"}}>📎 {m.attach.label}</div>
                    </div>
                  </div>
                )}

                <div style={{padding: m.attach ? "0 6px" : 0, paddingRight: 54}}>{m.text}</div>

                {/* Timestamp + tick */}
                <div style={{
                  position:"absolute", bottom:4, right:8,
                  display:"flex", alignItems:"center", gap:3,
                  fontSize:10.5, color: isMe ? "rgba(11,11,13,0.55)" : WA.subtext,
                  fontFamily:"JetBrains Mono,monospace",
                }}>
                  <span>{m.t.replace(/^[a-zà-ù]+ /i,"")}</span>
                  {isMe && (
                    <svg width="15" height="11" viewBox="0 0 16 11" fill="none">
                      <path d="M11.071 0.653a.498.498 0 00-.707-.012L5.284 5.628 3.637 3.98a.5.5 0 00-.707.708l2 2a.5.5 0 00.707 0L11.071 1.36a.498.498 0 000-.707z" fill={WA.tick}/>
                      <path d="M15.071 0.653a.498.498 0 00-.707-.012L9.284 5.628 8.637 4.98a.5.5 0 10-.707.708l1 1a.5.5 0 00.707 0L15.071 1.36a.498.498 0 000-.707z" fill={WA.tick}/>
                    </svg>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {/* Typing indicator */}
        {typing && (
          <div style={{display:"flex", justifyContent:"flex-start", marginTop:6, padding:"0 4px"}} className="slide-up">
            <div style={{background:WA.inBubble, borderRadius:3, borderTopLeftRadius:0, padding:"9px 12px", display:"flex", gap:3, alignItems:"center"}}>
              <span style={{width:6, height:6, borderRadius:99, background:"#9A9AA2", opacity:0.9}} className="animate-pulse"/>
              <span style={{width:6, height:6, borderRadius:99, background:"#9A9AA2", opacity:0.6}} className="animate-pulse"/>
              <span style={{width:6, height:6, borderRadius:99, background:"#9A9AA2", opacity:0.3}} className="animate-pulse"/>
            </div>
          </div>
        )}
      </div>

      {/* Composer */}
      <div style={{position:"absolute", bottom:108, left:0, right:0, padding:"8px 8px 0", display:"flex", gap:6, alignItems:"flex-end"}}>
        <div style={{flex:1, background:WA.composerInput, borderRadius:3, padding:"4px 6px 4px 10px", display:"flex", gap:4, alignItems:"center", minHeight:40, border:"1px solid #24242A"}}>
          <button onClick={()=>window.mpToast && window.mpToast("Emoji picker · v2", "info")} style={{width:30, height:30, display:"flex", alignItems:"center", justifyContent:"center", color:WA.subtext, fontSize:18}}>😊</button>
          <input
            value={msg}
            onChange={e=>setMsg(e.target.value)}
            placeholder={"Scrivi a "+peerName.split(" ")[0]+"…"}
            onKeyDown={e=>{ if(e.key==="Enter" && msg){ window.mpToast && window.mpToast("Messaggio inviato a "+peerName.split(" ")[0], "ok"); setMsg(""); }}}
            style={{flex:1, background:"transparent", outline:"none", fontSize:14.5, padding:"0 6px", border:"none", color:"#F5F3ED"}}/>
          <button onClick={()=>window.mpToast && window.mpToast("Allega file · v2", "info")} style={{width:30, height:30, display:"flex", alignItems:"center", justifyContent:"center", color:WA.subtext, transform:"rotate(-30deg)"}}><Icon name="paperclip" size={16}/></button>
          {!msg && <button onClick={()=>window.mpToast && window.mpToast("Video-messaggio · v2", "info")} style={{width:30, height:30, display:"flex", alignItems:"center", justifyContent:"center", color:WA.subtext}}><Icon name="video" size={16}/></button>}
        </div>
        <button
          onClick={()=>{
            if(msg){ window.mpToast && window.mpToast("Messaggio inviato a "+peerName.split(" ")[0], "ok"); setMsg(""); }
            else { window.mpToast && window.mpToast("Registra audio · v2", "info"); }
          }}
          style={{width:44, height:44, borderRadius:3, background:WA.micBg, color:WA.micFg, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, boxShadow:"0 2px 8px rgba(242,183,68,0.35)"}}>
          <Icon name={msg?"send":"mic"} size={16} stroke={2}/>
        </button>
      </div>
    </div>
  );
}

// ─── ATTIVITÀ / NOTIFICHE MOBILE
function MSActivity({ nav }) {
  const groups = [
    { when:"Oggi", items:[
      { type:"feedback", title:"Marco ha lasciato feedback", body:"8 annotazioni · 1 video-risposta · sul 12 bar in La", time:"10:14", unread:true, route:"feedback" },
      { type:"message", title:"Nuovo messaggio da Marco", body:"\"C'è una cosa sul polso di cui dobbiamo parlare.\"", time:"08:31", unread:true, route:"chat" },
      { type:"community", title:"Sara ti ha menzionato", body:"\"Luca, ascolta il mio passaggio a 0:52\"", time:"07:40", route:"community" },
    ]},
    { when:"Ieri", items:[
      { type:"assign", title:"Marco ti ha assegnato 3 lezioni", body:"Questa settimana · 2 esercizi con scadenza", time:"ieri 18:20", route:"home" },
      { type:"reminder", title:"Promemoria esercizio", body:"Pennata alternata a 120bpm scade domenica", time:"ieri 09:00", route:"exercise" },
    ]},
    { when:"Questa settimana", items:[
      { type:"community", title:"Marco ha scelto la take di Sara come pick della settimana", body:"Clicca per ascoltare", time:"lun 22 apr", route:"community" },
      { type:"system", title:"Percorso rinnovabile tra 172 giorni", body:"Parla con Marco per confermare il prossimo blocco", time:"lun 22 apr" },
    ]},
  ];

  const icon = (t) => ({ feedback:"inbox", message:"chat", community:"users", assign:"plus", reminder:"clock", system:"bell" }[t]) || "bell";
  const color = (t) => ({ feedback:"#F2B744", message:"#F5F3ED", community:"#7BB07B", assign:"#F2B744", reminder:"#E04A3A", system:"#9A9AA2" }[t]);

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
    <div style={{background:"#0B0B0D", minHeight:"100%", paddingBottom:120}}>
      <MSHeader
        kicker="attività · 2 non letti"
        title={<>Le cose <em style={{color:"#F2B744"}}>arrivate</em>.</>}
        right={<button onClick={markAllRead} style={{height:34, padding:"0 12px", borderRadius:99, border:"1px solid #24242A", fontSize:12, color:"#9A9AA2"}}>Segna tutto letto</button>}
      />

      {groups.map(g=>(
        <div key={g.when} style={{padding:"0 18px", marginBottom:22}}>
          <div style={{fontFamily:"JetBrains Mono,monospace", fontSize:10, textTransform:"uppercase", letterSpacing:"0.22em", color:"#9A9AA2", margin:"12px 4px 10px"}}>{g.when}</div>
          <div style={{background:"#141417", border:"1px solid #24242A", borderRadius:14, overflow:"hidden"}}>
            {g.items.map((n,i)=>(
              <button key={i} onClick={()=>n.route && nav(n.route)} style={{width:"100%", display:"flex", gap:12, alignItems:"flex-start", padding:"14px 14px", borderTop: i===0?"none":"1px solid #24242A", textAlign:"left", background: n.unread?"rgba(242,183,68,0.04)":"transparent", cursor:n.route?"pointer":"default"}}>
                <div style={{width:36, height:36, borderRadius:10, flexShrink:0, background: color(n.type)+"22", color: color(n.type), display:"flex", alignItems:"center", justifyContent:"center"}}>
                  <Icon name={icon(n.type)} size={15}/>
                </div>
                <div style={{flex:1, minWidth:0}}>
                  <div style={{display:"flex", alignItems:"center", gap:6, marginBottom:2}}>
                    <div style={{fontSize:13.5, fontWeight:600, color:"#F5F3ED"}}>{n.title}</div>
                    {n.unread && <div style={{width:6, height:6, borderRadius:99, background:"#F2B744"}}/>}
                  </div>
                  <div style={{fontSize:12.5, color:"#9A9AA2", lineHeight:1.4}}>{n.body}</div>
                  <div style={{fontFamily:"JetBrains Mono,monospace", fontSize:10, textTransform:"uppercase", letterSpacing:"0.15em", color:"#6D6D75", marginTop:5}}>{n.time}</div>
                </div>
                <Icon name="chevron" size={12} className="text-smoke"/>
              </button>
            ))}
          </div>
        </div>
      ))}

      {/* Preferenze */}
      <div style={{padding:"0 18px"}}>
        <div style={{fontFamily:"JetBrains Mono,monospace", fontSize:10, textTransform:"uppercase", letterSpacing:"0.22em", color:"#9A9AA2", margin:"12px 4px 10px"}}>Notifiche push</div>
        <div style={{background:"#141417", border:"1px solid #24242A", borderRadius:14, overflow:"hidden"}}>
          {prefs.map((p,i)=>(
            <button key={p.k} onClick={()=>togglePref(i)} style={{width:"100%", display:"flex", alignItems:"center", gap:12, padding:"13px 14px", borderTop:i===0?"none":"1px solid #24242A", background:"transparent", textAlign:"left", cursor:"pointer"}}>
              <div style={{flex:1}}>
                <div style={{fontSize:13.5, color:"#F5F3ED"}}>{p.k}</div>
                <div style={{fontSize:11, color:"#9A9AA2"}}>{p.s}</div>
              </div>
              <div style={{width:44, height:26, borderRadius:99, background:p.v?"#F2B744":"#2A2A30", position:"relative", transition:"background 0.2s"}}>
                <div style={{position:"absolute", top:2, left:p.v?20:2, width:22, height:22, borderRadius:99, background:"#fff", transition:"left 0.2s", boxShadow:"0 1px 3px rgba(0,0,0,0.15)"}}/>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── LESSON MOBILE (dark)
function MSLesson({ nav }) {
  const [playing, setPlaying] = React.useState(false);
  const [speed, setSpeed] = React.useState("1x");
  const [loopAB, setLoopAB] = React.useState(false);
  const [bookmarked, setBookmarked] = React.useState(false);
  const [activeChapter, setActiveChapter] = React.useState(1);
  return (
    <div style={{background:"#141417", color:"#F5F3ED", minHeight:"100%", paddingBottom:130}}>
      <div style={{paddingTop:56, padding:"56px 16px 14px", display:"flex", justifyContent:"space-between", alignItems:"center"}}>
        <button onClick={()=>nav("home")} style={{width:38, height:38, borderRadius:99, background:"rgba(255,255,255,0.08)", color:"#F5F3ED", display:"flex", alignItems:"center", justifyContent:"center"}}><Icon name="chevronl" size={15}/></button>
        <div style={{fontFamily:"JetBrains Mono,monospace", fontSize:10, textTransform:"uppercase", letterSpacing:"0.2em", color:"#8A8A92"}}>Lezione 14 · Tecnica</div>
        <button onClick={()=>setBookmarked(v=>{ window.mpToast && window.mpToast(v?"Bookmark rimosso":"Bookmark aggiunto", "ok"); return !v; })} style={{width:38, height:38, borderRadius:99, background:bookmarked?"#F2B744":"rgba(255,255,255,0.08)", color:bookmarked?"#0B0B0D":"#F5F3ED", display:"flex", alignItems:"center", justifyContent:"center"}}><Icon name="bookmark" size={14}/></button>
      </div>

      <div style={{margin:"6px 14px", borderRadius:14, overflow:"hidden", position:"relative", aspectRatio:"16/10", background:"#000"}}>
        <div style={{position:"absolute", inset:0, background:"repeating-linear-gradient(135deg,#141417 0 12px,#1D1D22 12px 24px)", opacity:0.5}}/>
        <div style={{position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center"}}>
          <button onClick={()=>setPlaying(v=>!v)} style={{width:64, height:64, borderRadius:99, background:"rgba(250,247,242,0.95)", color:"#0B0B0D", display:"flex", alignItems:"center", justifyContent:"center", border:"none"}}><Icon name={playing?"pause":"play"} size={20}/></button>
        </div>
        <div style={{position:"absolute", bottom:10, left:12, right:12, height:3, background:"rgba(255,255,255,0.15)", borderRadius:99}}>
          <div style={{height:"100%", width:"38%", background:"#F2B744", borderRadius:99}}/>
        </div>
      </div>

      {/* Controlli */}
      <div style={{margin:"14px 14px 0", background:"#1A1A1F", borderRadius:14, padding:12, display:"flex", gap:10, alignItems:"center"}}>
        <button onClick={()=>window.mpToast && window.mpToast("-10 sec", "info")} style={{width:38, height:38, borderRadius:99, background:"#1D1D22", color:"#F5F3ED", display:"flex", alignItems:"center", justifyContent:"center"}}><Icon name="rewind" size={13}/></button>
        <button onClick={()=>setPlaying(v=>!v)} style={{width:48, height:48, borderRadius:99, background:"#F2B744", color:"#0B0B0D", display:"flex", alignItems:"center", justifyContent:"center"}}><Icon name={playing?"pause":"play"} size={16}/></button>
        <button onClick={()=>window.mpToast && window.mpToast("+10 sec", "info")} style={{width:38, height:38, borderRadius:99, background:"#1D1D22", color:"#F5F3ED", display:"flex", alignItems:"center", justifyContent:"center"}}><Icon name="skip" size={13}/></button>
        <div style={{flex:1, display:"flex", flexDirection:"column", gap:2, marginLeft:6}}>
          <div style={{display:"flex", justifyContent:"space-between", fontFamily:"JetBrains Mono,monospace", fontSize:10, color:"#8A8A92"}}><span>09:14</span><span>24:10</span></div>
          <div style={{height:3, background:"#1D1D22", borderRadius:99}}><div style={{height:"100%", width:"38%", background:"#F2B744", borderRadius:99}}/></div>
        </div>
      </div>

      <div style={{display:"flex", gap:6, padding:"10px 14px", overflowX:"auto"}} className="no-scrollbar">
        {["0.5x","0.75x","1x","1.25x"].map(s=>(
          <button key={s} onClick={()=>setSpeed(s)} style={{flexShrink:0, height:32, padding:"0 12px", borderRadius:99, background:s===speed?"#F2B744":"#1A1A1F", color:s===speed?"#0B0B0D":"#8A8A92", fontSize:11, fontFamily:"JetBrains Mono,monospace", textTransform:"uppercase", letterSpacing:"0.12em", border:"none"}}>{s}</button>
        ))}
        <button onClick={()=>{ setLoopAB(v=>!v); window.mpToast && window.mpToast(loopAB?"Loop off":"Loop A-B attivo", "info"); }} style={{flexShrink:0, height:32, padding:"0 12px", borderRadius:99, background:loopAB?"#F2B744":"#1A1A1F", color:loopAB?"#0B0B0D":"#8A8A92", fontSize:11, fontFamily:"JetBrains Mono,monospace", textTransform:"uppercase", letterSpacing:"0.12em", border:"none"}}>Loop A-B</button>
      </div>

      <div style={{padding:"10px 18px 0"}}>
        <Tag dark>Tecnica · Mano destra</Tag>
        <h1 style={{fontFamily:"'Big Shoulders Display',sans-serif", fontWeight:800, textTransform:"uppercase", letterSpacing:"0.005em", fontSize:28, lineHeight:1.12, margin:"10px 0 12px"}}>Pennata alternata — <em style={{color:"#F2B744"}}>il polso libero</em></h1>
        <p style={{fontSize:13.5, color:"#C9C9D0", lineHeight:1.55, marginBottom:18}}>"Concentrati sul respiro del polso. Non forzare. Se senti tensione, fermati e ricomincia."</p>
      </div>

      {/* Capitoli compatti */}
      <div style={{padding:"6px 18px"}}>
        <div style={{fontFamily:"JetBrains Mono,monospace", fontSize:10, textTransform:"uppercase", letterSpacing:"0.22em", color:"#8A8A92", marginBottom:8}}>Capitoli</div>
        {[
          {t:"0:00", title:"Intro — il problema del polso"},
          {t:"4:24", title:"Demo lenta a 60bpm"},
          {t:"10:05", title:"Il gesto giusto"},
          {t:"16:20", title:"Errori più comuni"},
          {t:"21:08", title:"Come allenarlo questa settimana"},
        ].map((c,i)=>{
          const active = i===activeChapter;
          return (
            <button key={i} onClick={()=>{ setActiveChapter(i); setPlaying(true); window.mpToast && window.mpToast("Salto a "+c.t, "info"); }} style={{width:"100%", display:"flex", alignItems:"center", gap:12, padding:"10px 0", borderTop: i===0?"none":"1px solid #24242A", background:"transparent", textAlign:"left", cursor:"pointer"}}>
              <span style={{fontFamily:"JetBrains Mono,monospace", fontSize:11, color: active?"#F2B744":"#8A8A92", width:40}}>{c.t}</span>
              <span style={{flex:1, fontSize:13.5, color: active?"#F5F3ED":"#C9C9D0", fontWeight:active?600:400}}>{c.title}</span>
              {active && <div style={{width:6, height:6, borderRadius:99, background:"#F2B744"}}/>}
            </button>
          );
        })}
      </div>

      {/* CTA esercizio */}
      <div style={{margin:"20px 14px 0", border:"1px solid #F2B744", background:"rgba(242,183,68,0.08)", borderRadius:14, padding:16}}>
        <div style={{fontFamily:"JetBrains Mono,monospace", fontSize:10, color:"#F2B744", textTransform:"uppercase", letterSpacing:"0.22em", marginBottom:8}}>Esercizio collegato · scade domenica</div>
        <div style={{fontFamily:"'Big Shoulders Display',sans-serif", fontWeight:800, textTransform:"uppercase", letterSpacing:"0.005em", fontSize:20, lineHeight:1.15, marginBottom:12}}>Pennata alt. — crome a 120 bpm</div>
        <button onClick={()=>nav("exercise")} style={{width:"100%", height:48, borderRadius:12, background:"#F2B744", color:"#0B0B0D", fontWeight:600, fontSize:14, display:"flex", alignItems:"center", justifyContent:"center", gap:8}}>
          <Icon name="record" size={15}/> Registra il tuo video
        </button>
      </div>
    </div>
  );
}

// ─── EXERCISE MOBILE (record)
function MSExercise({ nav }) {
  const [rec, setRec] = React.useState(false);
  const [has, setHas] = React.useState(false);
  return (
    <div style={{background:"#0B0B0D", minHeight:"100%", paddingBottom:130}}>
      <div style={{padding:"56px 16px 0", display:"flex", justifyContent:"space-between", alignItems:"center"}}>
        <button onClick={()=>nav("home")} style={{width:38, height:38, borderRadius:99, background:"#141417", display:"flex", alignItems:"center", justifyContent:"center", color:"#F5F3ED"}}><Icon name="chevronl" size={15}/></button>
        <div style={{fontFamily:"JetBrains Mono,monospace", fontSize:10, textTransform:"uppercase", letterSpacing:"0.2em", color:"#9A9AA2"}}>Esercizio · E-229</div>
        <div style={{width:38}}/>
      </div>

      <div style={{padding:"18px 22px 8px"}}>
        <Tag>bpm 120 · entro dom 26 apr</Tag>
        <h1 style={{fontFamily:"'Big Shoulders Display',sans-serif", fontWeight:800, textTransform:"uppercase", letterSpacing:"0.005em", fontSize:30, lineHeight:1.1, margin:"10px 0 14px"}}>Pennata alt. — <em style={{color:"#F2B744"}}>crome a 120</em></h1>
        <div style={{borderLeft:"2px solid #F2B744", paddingLeft:14, marginBottom:16}}>
          <div style={{fontFamily:"JetBrains Mono,monospace", fontSize:10, letterSpacing:"0.22em", textTransform:"uppercase", color:"#F2B744", marginBottom:6}}>Istruzioni di Marco</div>
          <p style={{fontSize:13.5, lineHeight:1.55, color:"#F5F3ED", margin:0}}>"Luca, due minuti filati di crome pulite. Metronomo sul 2 e 4. Riprendi la mano destra in primo piano."</p>
        </div>

        <button onClick={()=>window.mpToast && window.mpToast("Riproduci video-esempio", "info")} style={{width:"100%", borderRadius:12, overflow:"hidden", marginBottom:18, background:"#141417", border:"none", padding:0, cursor:"pointer", display:"block"}}>
          <div style={{position:"relative", aspectRatio:"16/10"}}>
            <div style={{position:"absolute", inset:0, background:"repeating-linear-gradient(135deg,#141417 0 12px,#1D1D22 12px 24px)"}}/>
            <div style={{position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center"}}>
              <div style={{width:46, height:46, borderRadius:99, background:"rgba(250,247,242,0.95)", color:"#0B0B0D", display:"flex", alignItems:"center", justifyContent:"center"}}><Icon name="play" size={14}/></div>
            </div>
          </div>
          <div style={{padding:"10px 14px", display:"flex", justifyContent:"space-between", alignItems:"center", fontSize:12}}>
            <span style={{color:"#9A9AA2"}}>Video-esempio di Marco · 1:24</span>
            <span style={{color:"#F2B744", fontWeight:600}}>HD</span>
          </div>
        </button>
      </div>

      {/* Registrazione */}
      <div style={{padding:"0 14px"}}>
        <div style={{position:"relative", aspectRatio:"3/4", borderRadius:18, overflow:"hidden", background:"#141417"}}>
          <div style={{position:"absolute", inset:0, background:"repeating-linear-gradient(135deg,#141417 0 12px,#1D1D22 12px 24px)", opacity:0.4}}/>
          <div style={{position:"absolute", inset:0, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:24, color:"#F5F3ED", textAlign:"center"}}>
            {!has && !rec && (
              <>
                <div style={{fontFamily:"JetBrains Mono,monospace", fontSize:10, textTransform:"uppercase", letterSpacing:"0.2em", color:"#8A8A92", marginBottom:14}}>fotocamera retro · mic stereo · 120bpm</div>
                <div style={{fontFamily:"'Big Shoulders Display',sans-serif", fontWeight:800, textTransform:"uppercase", letterSpacing:"0.005em", fontSize:24, lineHeight:1.2, marginBottom:24}}>Quando sei <em style={{color:"#F2B744"}}>pronto</em>, tocca il cerchio.</div>
                <button onClick={()=>setRec(true)} className="rec-pulse" style={{width:82, height:82, borderRadius:99, background:"#F2B744", display:"flex", alignItems:"center", justifyContent:"center"}}>
                  <div style={{width:26, height:26, borderRadius:99, background:"#fff"}}/>
                </button>
              </>
            )}
            {rec && (
              <>
                <div style={{display:"flex", alignItems:"center", gap:8, marginBottom:16, fontFamily:"JetBrains Mono,monospace", fontSize:11, textTransform:"uppercase", letterSpacing:"0.2em", color:"#F2B744"}}>
                  <span style={{width:9, height:9, borderRadius:99, background:"#F2B744"}} className="rec-pulse"/>REC · 00:47
                </div>
                <div style={{width:200}}><Waveform dark progress={0.5}/></div>
                <button onClick={()=>{setRec(false); setHas(true);}} style={{marginTop:20, width:72, height:72, borderRadius:99, background:"#F2B744", display:"flex", alignItems:"center", justifyContent:"center"}}>
                  <div style={{width:24, height:24, background:"#fff", borderRadius:4}}/>
                </button>
              </>
            )}
            {has && (
              <>
                <div style={{width:60, height:60, borderRadius:99, background:"rgba(250,247,242,0.95)", color:"#0B0B0D", display:"flex", alignItems:"center", justifyContent:"center", marginBottom:16}}><Icon name="play" size={20}/></div>
                <div style={{fontFamily:"JetBrains Mono,monospace", fontSize:10, textTransform:"uppercase", letterSpacing:"0.2em", color:"#8A8A92"}}>take_01 · 2:04</div>
              </>
            )}
          </div>
        </div>

        {has && (
          <div style={{display:"flex", gap:10, marginTop:12}}>
            <button onClick={()=>{setHas(false); setRec(false);}} style={{flex:1, height:44, borderRadius:12, background:"#141417", color:"#9A9AA2", fontSize:13, display:"flex", alignItems:"center", justifyContent:"center", gap:6}}><Icon name="record" size={13}/> Rifai</button>
            <button onClick={()=>window.mpToast && window.mpToast("Anteprima take_01", "info")} style={{flex:1, height:44, borderRadius:12, background:"#141417", color:"#F5F3ED", fontSize:13, fontWeight:600}}>Anteprima</button>
          </div>
        )}

        <div style={{marginTop:18}}>
          <div style={{fontFamily:"JetBrains Mono,monospace", fontSize:10, letterSpacing:"0.22em", textTransform:"uppercase", color:"#9A9AA2", marginBottom:6}}>Nota per Marco</div>
          <textarea defaultValue="Ho avuto difficoltà al 0:40 — sentivo il polso che si chiudeva." rows={3} style={{width:"100%", background:"#141417", border:"1px solid #24242A", borderRadius:12, padding:12, fontSize:13.5, lineHeight:1.5, resize:"none", outline:"none"}}/>
        </div>

        <button onClick={()=>{ window.mpToast && window.mpToast("Take inviato a Marco", "ok"); setTimeout(()=>nav("home"), 500); }} disabled={!has} style={{width:"100%", height:52, borderRadius:14, marginTop:16, background: has?"#F2B744":"#24242A", color: has?"#0B0B0D":"#6D6D75", fontWeight:600, fontSize:15, display:"flex", alignItems:"center", justifyContent:"center", gap:8}}>
          <Icon name="send" size={15}/> Invia a Marco
        </button>
      </div>
    </div>
  );
}

// ─── FEEDBACK MOBILE (dark, killer)
function MSFeedback({ nav }) {
  const annotations = window.ANNOTATIONS;
  const totalSec = 140;
  const [active, setActive] = React.useState(2);
  const [playing, setPlaying] = React.useState(false);
  const dots = annotations.map(a=>({ t: a.t/totalSec, color: window.AnnotationColor(a.type) }));
  return (
    <div style={{background:"#141417", color:"#F5F3ED", minHeight:"100%", paddingBottom:130}}>
      <div style={{paddingTop:56, padding:"56px 16px 0", display:"flex", justifyContent:"space-between", alignItems:"center"}}>
        <button onClick={()=>nav("home")} style={{width:38, height:38, borderRadius:99, background:"rgba(255,255,255,0.08)", color:"#F5F3ED", display:"flex", alignItems:"center", justifyContent:"center"}}><Icon name="chevronl" size={15}/></button>
        <div style={{textAlign:"center"}}>
          <div style={{fontFamily:"JetBrains Mono,monospace", fontSize:9, textTransform:"uppercase", letterSpacing:"0.22em", color:"#8A8A92"}}>Feedback · 12 bar in La</div>
          <div style={{fontFamily:"'Big Shoulders Display',sans-serif", fontWeight:800, textTransform:"uppercase", letterSpacing:"0.005em", fontSize:15, marginTop:2}}>da <em style={{color:"#F2B744"}}>Marco</em></div>
        </div>
        <div style={{width:38}}/>
      </div>

      <div style={{margin:"14px 14px 0", borderRadius:14, overflow:"hidden", position:"relative", aspectRatio:"16/10", background:"#000"}}>
        <div style={{position:"absolute", inset:0, background:"repeating-linear-gradient(135deg,#141417 0 12px,#1D1D22 12px 24px)", opacity:0.5}}/>
        <div style={{position:"absolute", top:10, left:12, fontFamily:"JetBrains Mono,monospace", fontSize:9, textTransform:"uppercase", letterSpacing:"0.2em", color:"#8A8A92"}}>tu · take_05</div>
        <div style={{position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center"}}>
          <button onClick={()=>setPlaying(v=>!v)} style={{width:60, height:60, borderRadius:99, background:"rgba(250,247,242,0.95)", color:"#0B0B0D", display:"flex", alignItems:"center", justifyContent:"center", border:"none", cursor:"pointer"}}><Icon name={playing?"pause":"play"} size={18}/></button>
        </div>
      </div>

      <div style={{margin:"14px 14px 0", background:"#1A1A1F", borderRadius:14, padding:12}}>
        <Waveform dark dots={dots} progress={annotations[active].t/totalSec}/>
        <div style={{display:"flex", justifyContent:"space-between", fontSize:10, fontFamily:"JetBrains Mono,monospace", color:"#8A8A92", marginTop:4}}>
          <span>8 note · 1 video-risposta</span><span>02:20</span>
        </div>
      </div>

      {/* Rating compatto */}
      <div style={{margin:"14px 14px 0", background:"#1A1A1F", borderRadius:14, padding:16}}>
        <div style={{display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12}}>
          <div>
            <div style={{fontFamily:"JetBrains Mono,monospace", fontSize:9, textTransform:"uppercase", letterSpacing:"0.22em", color:"#8A8A92"}}>Valutazione</div>
            <div style={{fontFamily:"'Big Shoulders Display',sans-serif", fontWeight:800, textTransform:"uppercase", letterSpacing:"0.005em", fontSize:18, marginTop:2}}>La <em style={{color:"#F2B744"}}>fotografia</em></div>
          </div>
          {(() => {
            const avg = window.RATING.reduce((a,r)=>a+r.value,0)/window.RATING.length;
            const intPart = Math.floor(avg);
            const decPart = Math.round((avg-intPart)*10);
            return <div style={{fontFamily:"'Big Shoulders Display',sans-serif", fontWeight:800, textTransform:"uppercase", letterSpacing:"0.005em", fontSize:34}}>{intPart}.<span style={{color:"#8A8A92", fontSize:22}}>{decPart}</span></div>;
          })()}
        </div>
        <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:"10px 18px"}}>
          {window.RATING.map(r=>(
            <div key={r.label}>
              <div style={{display:"flex", justifyContent:"space-between", marginBottom:4, fontSize:11}}><span style={{color:"#C9C9D0"}}>{r.label}</span><span style={{fontFamily:"JetBrains Mono,monospace"}}>{r.value.toFixed(1)}</span></div>
              <div style={{height:3, background:"#1D1D22", borderRadius:99}}><div style={{height:"100%", width:`${r.value*20}%`, background:"#F2B744"}}/></div>
            </div>
          ))}
        </div>
      </div>

      {/* Annotazioni */}
      <div style={{padding:"18px 16px 8px"}}>
        <div style={{fontFamily:"JetBrains Mono,monospace", fontSize:10, textTransform:"uppercase", letterSpacing:"0.22em", color:"#8A8A92", marginBottom:10}}>Commenti al secondo</div>
        <div style={{display:"flex", flexDirection:"column", gap:8}}>
          {annotations.map((a,i)=>{
            const color = window.AnnotationColor(a.type);
            const label = {ok:"OK", tip:"TIP", warning:"WARN", video:"VIDEO"}[a.type];
            const isActive = i===active;
            return (
              <button key={i} onClick={()=>setActive(i)} style={{textAlign:"left", borderRadius:12, padding:12, border:"1px solid "+(isActive?"#F2B744":"#24242A"), background: isActive?"#1D1D22":"#1A1A1F"}}>
                <div style={{display:"flex", alignItems:"center", gap:8, marginBottom:6}}>
                  <span style={{fontFamily:"JetBrains Mono,monospace", fontSize:10, textTransform:"uppercase", letterSpacing:"0.12em", padding:"2px 6px", borderRadius:3, color, background: color+"22"}}>{label}</span>
                  <span style={{fontFamily:"JetBrains Mono,monospace", fontSize:10, color:"#8A8A92"}}>{a.sec}</span>
                </div>
                {a.type==="video" ? (
                  <>
                    <div style={{display:"flex", alignItems:"center", gap:10, background:"rgba(242,183,68,0.12)", border:"1px solid rgba(242,183,68,0.4)", borderRadius:8, padding:8, marginBottom:8}}>
                      <div style={{width:40, height:40, borderRadius:6, background:"#F2B744", color:"#0B0B0D", display:"flex", alignItems:"center", justifyContent:"center"}}><Icon name="play" size={13}/></div>
                      <div>
                        <div style={{fontSize:12, fontWeight:600}}>Video-risposta di Marco</div>
                        <div style={{fontFamily:"JetBrains Mono,monospace", fontSize:10, color:"#F2B744"}}>{a.duration} · con testo</div>
                      </div>
                    </div>
                    <div style={{fontSize:12.5, color:"#D9D9DE", lineHeight:1.55}}>{a.text}</div>
                  </>
                ) : (
                  <div style={{fontSize:12.5, color:"#D9D9DE", lineHeight:1.55}}>{a.text}</div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div style={{padding:"14px 14px 0"}}>
        <button onClick={()=>nav("exercise")} style={{width:"100%", height:52, borderRadius:14, background:"#F2B744", color:"#0B0B0D", fontWeight:600, fontSize:15, display:"flex", alignItems:"center", justifyContent:"center", gap:8}}>
          <Icon name="record" size={15}/> Rispondi con nuovo video
        </button>
      </div>
    </div>
  );
}

// ─── LOCK SCREEN HERO (mostra le push di Marco)
function MSLockScreen() {
  return (
    <div style={{background:"#000", minHeight:"100%", position:"relative", overflow:"hidden"}}>
      {/* fondale evocativo */}
      <div style={{position:"absolute", inset:0, background:"radial-gradient(ellipse at 30% 20%, rgba(242,183,68,0.18), transparent 50%), radial-gradient(ellipse at 70% 80%, rgba(23,17,14,1), rgba(0,0,0,1))"}}/>
      <div style={{position:"absolute", inset:0, background:"repeating-linear-gradient(135deg, rgba(255,255,255,0.008) 0 1px, transparent 1px 3px)"}}/>

      <div style={{position:"relative", padding:"96px 16px 0", color:"#F5F3ED", textAlign:"center"}}>
        <div style={{fontSize:13, letterSpacing:"0.02em", opacity:0.7}}>martedì 21 aprile</div>
        <div style={{fontFamily:"-apple-system, system-ui", fontSize:86, fontWeight:300, lineHeight:1, marginTop:6}}>07:42</div>
      </div>

      {/* Notifiche push */}
      <div style={{position:"relative", padding:"46px 12px 0", display:"flex", flexDirection:"column", gap:8}}>
        {[
          { app:"Marco Petta", title:"Nuovo feedback da Marco", body:"8 annotazioni sul tuo 12 bar in La. 1 video-risposta.", when:"ora" },
          { app:"Marco Petta", title:"Promemoria · esercizio in scadenza", body:"Pennata alt. a 120bpm — hai tempo fino a domenica.", when:"2 min fa" },
          { app:"Marco Petta", title:"Sara ti ha menzionato in Sala prove", body:'"Luca, ascolta il passaggio a 0:52."', when:"1 ora fa" },
        ].map((n,i)=>(
          <div key={i} style={{borderRadius:20, padding:"12px 14px", position:"relative", overflow:"hidden"}}>
            <div style={{position:"absolute", inset:0, background:"rgba(255,255,255,0.14)", backdropFilter:"blur(24px) saturate(180%)", WebkitBackdropFilter:"blur(24px) saturate(180%)"}}/>
            <div style={{position:"relative", display:"flex", gap:10, alignItems:"flex-start"}}>
              <div style={{width:36, height:36, borderRadius:8, background:"#F2B744", display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", flexShrink:0, fontFamily:"'Big Shoulders Display',sans-serif", fontWeight:800, textTransform:"uppercase", letterSpacing:"0.005em", fontSize:18}}>P</div>
              <div style={{flex:1, minWidth:0, color:"#F5F3ED"}}>
                <div style={{display:"flex", justifyContent:"space-between", alignItems:"baseline", marginBottom:2}}>
                  <span style={{fontSize:12, fontWeight:600, opacity:0.9}}>{n.app}</span>
                  <span style={{fontSize:11, opacity:0.55}}>{n.when}</span>
                </div>
                <div style={{fontSize:14, fontWeight:600, marginBottom:2}}>{n.title}</div>
                <div style={{fontSize:13, opacity:0.8, lineHeight:1.35}}>{n.body}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* footer */}
      <div style={{position:"absolute", bottom:46, left:0, right:0, display:"flex", justifyContent:"space-between", padding:"0 32px", color:"rgba(255,255,255,0.75)"}}>
        <div style={{width:42, height:42, borderRadius:99, background:"rgba(255,255,255,0.1)", display:"flex", alignItems:"center", justifyContent:"center"}}><Icon name="video" size={15}/></div>
        <div style={{width:42, height:42, borderRadius:99, background:"rgba(255,255,255,0.1)", display:"flex", alignItems:"center", justifyContent:"center"}}><Icon name="mic" size={15}/></div>
      </div>
    </div>
  );
}

// ─── SHELL MOBILE — wrapper che renderizza la schermata dentro iPhone frame
function StudentMobile({ route, onRoute }) {
  // Map route -> screen. Abbiamo un main tab system + schermate deep (lesson, exercise, feedback, lock)
  const deepRoutes = ["lesson","exercise","feedback","lock"];
  const isDeep = deepRoutes.includes(route);
  const mainTab = isDeep ? "home" : route;

  const screen = (() => {
    if (route==="home")      return <MSHome nav={onRoute} goTab={onRoute}/>;
    if (route==="community") return <MSCommunity nav={onRoute}/>;
    if (route==="chat")      return <MSChat nav={onRoute}/>;
    if (route==="activity")  return <MSActivity nav={onRoute}/>;
    if (route==="lesson")    return <MSLesson nav={onRoute}/>;
    if (route==="exercise")  return <MSExercise nav={onRoute}/>;
    if (route==="feedback")  return <MSFeedback nav={onRoute}/>;
    if (route==="lock")      return <MSLockScreen/>;
    return <MSHome nav={onRoute}/>;
  })();

  const darkLock = route==="lock";

  return (
    <div style={{minHeight:"100vh", background:"#0B0B0D", padding:"48px 20px 80px", display:"flex", gap:36, justifyContent:"center", alignItems:"flex-start", flexWrap:"wrap"}}>

      {/* Hero iPhone (interattivo) */}
      <div style={{display:"flex", flexDirection:"column", alignItems:"center", gap:18}}>
        <div style={{fontFamily:"JetBrains Mono,monospace", fontSize:10, textTransform:"uppercase", letterSpacing:"0.22em", color:"#9A9AA2"}}>Studente · mobile</div>
        <div style={{position:"relative"}}>
          <window.IOSDevice width={390} height={844} dark={darkLock}>
            {screen}
          </window.IOSDevice>
          {route!=="lock" && (
            <div style={{position:"absolute", bottom:24, left:0, right:0, zIndex:60, pointerEvents:"none"}}>
              <div style={{pointerEvents:"auto"}}>
                <MSBottomTab route={mainTab} onRoute={onRoute}/>
              </div>
            </div>
          )}
        </div>

        {/* Quick links */}
        <div style={{display:"flex", gap:8, flexWrap:"wrap", justifyContent:"center", maxWidth:420}}>
          {[
            {id:"home", l:"Piano"},
            {id:"lesson", l:"Lezione"},
            {id:"exercise", l:"Registra"},
            {id:"feedback", l:"Feedback"},
            {id:"community", l:"Sala prove"},
            {id:"chat", l:"Chat"},
            {id:"activity", l:"Attività"},
            {id:"lock", l:"Lock screen"},
          ].map(q=>(
            <button key={q.id} onClick={()=>onRoute(q.id)} style={{height:30, padding:"0 11px", borderRadius:99, fontSize:11, fontWeight:500,
              background: route===q.id?"#F5F3ED":"#0B0B0D", color: route===q.id?"#0B0B0D":"#9A9AA2",
              border: route===q.id?"none":"1px solid #24242A"}}>{q.l}</button>
          ))}
        </div>
      </div>

    </div>
  );
}

Object.assign(window, { StudentMobile, MSChat });
