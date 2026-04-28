// ─── CHAT DESKTOP — stile WhatsApp, tema Marco Petta (paper/amber) ───
// perspective "student" = thread singolo con Marco (window.CHAT)
// perspective "coach"   = inbox (320px) + thread attivo su window.COACH_CHATS
// perspective "collab"  = inbox (320px) + thread attivo su window.COLLAB_CHATS

function StudentChat({ nav, perspective="student" }) {
  const isCoach = perspective === "coach" || perspective === "collab";
  const coachChats = perspective === "collab"
    ? (window.COLLAB_CHATS || [])
    : (window.COACH_CHATS || []);

  // stato chat attiva (solo coach)
  const [activeId, setActiveId] = React.useState(isCoach ? (coachChats[0]?.id || null) : null);
  const [inboxSearch, setInboxSearch] = React.useState("");

  const activeCoachChat = isCoach ? (coachChats.find(c => c.id === activeId) || coachChats[0]) : null;

  // shape normalizzata per render thread
  const chat = isCoach
    ? activeCoachChat
    : {
        id:"marco",
        name:"Marco Petta", initials:"MP",
        status:"visto oggi alle 08:31",
        messages: window.CHAT,
      };

  const peerName = chat?.name || "";
  const peerInitials = chat?.initials || "";
  const peerStatus = chat?.status || "";
  const meRole = isCoach ? "coach" : "student";
  const messages = chat?.messages || [];

  // Typing + scroll reset ad ogni cambio di chat
  const [typing, setTyping] = React.useState(true);
  const [msg, setMsg] = React.useState("");
  const scrollerRef = React.useRef(null);

  React.useEffect(()=>{
    setTyping(true);
    const t = setTimeout(()=>setTyping(false), 6000);
    return ()=>clearTimeout(t);
  }, [chat?.id]);

  React.useEffect(()=>{
    if (scrollerRef.current) scrollerRef.current.scrollTop = scrollerRef.current.scrollHeight;
    setMsg("");
  }, [chat?.id]);

  // Palette chat desktop — tema Marco Petta (paper/amber)
  const PAL = {
    bodyBg: "#F5F3ED",
    wallpaper: "radial-gradient(rgba(11,11,13,0.04) 1px, transparent 1px)",
    headerBg: "#ECE8DE",
    headerBorder: "#D8D2C4",
    outBubble: "#F2B744",
    outText: "#0B0B0D",
    inBubble: "#0B0B0D",
    inText: "#F5F3ED",
    subtext: "#6D6D75",
    subtextDark: "#9A9AA2",
    tickOnAmber: "#0B0B0D",
    composerBg: "#ECE8DE",
    composerInput: "#FFFFFF",
    composerBorder: "#D8D2C4",
    inboxBg: "#ECE8DE",
    inboxBorder: "#D8D2C4",
    inboxActive: "#F5F3ED",
  };

  // ─── INBOX (solo coach) ────────────────────────────────────────────
  const filteredChats = coachChats.filter(c =>
    !inboxSearch || c.name.toLowerCase().includes(inboxSearch.toLowerCase())
  );

  const renderInbox = () => (
    <div style={{
      width:340, flexShrink:0,
      background:PAL.inboxBg, borderRight:`1px solid ${PAL.inboxBorder}`,
      display:"flex", flexDirection:"column", height:"100vh",
    }}>
      {/* Header inbox */}
      <div style={{padding:"18px 20px 14px", borderBottom:`1px solid ${PAL.inboxBorder}`, flexShrink:0}}>
        <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-smoke mb-1.5">conversazioni</div>
        <h2 className="font-editorial text-[30px]">
          Chat · <span className="italic-ember">{coachChats.length}</span>
        </h2>
        <div style={{position:"relative", marginTop:14}}>
          <span style={{position:"absolute", left:10, top:"50%", transform:"translateY(-50%)", color:"#6D6D75", display:"flex"}}>
            <Icon name="search" size={13}/>
          </span>
          <input
            value={inboxSearch}
            onChange={e=>setInboxSearch(e.target.value)}
            placeholder="Cerca studente…"
            style={{
              width:"100%", height:36, paddingLeft:32, paddingRight:12,
              background:"#F5F3ED", border:`1px solid ${PAL.inboxBorder}`, borderRadius:2,
              fontSize:13, outline:"none",
            }}
          />
        </div>
      </div>

      {/* Lista thread */}
      <div style={{flex:1, overflowY:"auto"}} className="no-scrollbar">
        {filteredChats.map(c => {
          const on = c.id === activeId;
          return (
            <button key={c.id} onClick={()=>setActiveId(c.id)}
              style={{
                display:"flex", gap:12, width:"100%", textAlign:"left",
                padding:"14px 18px 14px 15px",
                borderBottom:`1px solid ${PAL.inboxBorder}`,
                background: on ? PAL.inboxActive : "transparent",
                borderLeft: on ? "3px solid #F2B744" : "3px solid transparent",
                transition:"background 0.15s",
                cursor:"pointer",
              }}
              className={on?"":"hover:bg-paper"}>
              <div style={{position:"relative", flexShrink:0}}>
                <Avatar initials={c.initials} size={44} tone={c.unread>0?"ember":"ink"}/>
                {c.online && (
                  <span style={{
                    position:"absolute", right:-1, bottom:-1,
                    width:12, height:12, borderRadius:99, background:"#7BB07B",
                    border:"2px solid "+(on?PAL.inboxActive:PAL.inboxBg),
                  }}/>
                )}
              </div>
              <div style={{flex:1, minWidth:0}}>
                <div className="flex items-baseline justify-between gap-2">
                  <div className="font-display text-[16px] leading-none truncate">{c.name}</div>
                  <div className="font-mono text-[10px] text-smoke flex-shrink-0">{c.lastTime}</div>
                </div>
                <div className="font-mono text-[9px] uppercase tracking-wider text-smoke mt-1.5 truncate">{c.level}</div>
                <div className="flex items-center gap-2 mt-1.5">
                  <div className="text-[12px] text-smoke truncate flex-1" style={{lineHeight:1.3}}>
                    {c.lastPreview}
                  </div>
                  {c.unread>0 && (
                    <span style={{
                      flexShrink:0, minWidth:18, height:18, padding:"0 5px",
                      borderRadius:99, background:"#F2B744", color:"#0B0B0D",
                      display:"flex", alignItems:"center", justifyContent:"center",
                      fontFamily:"JetBrains Mono,monospace", fontSize:10, fontWeight:700,
                    }}>
                      {c.unread}
                    </span>
                  )}
                </div>
              </div>
            </button>
          );
        })}
        {filteredChats.length===0 && (
          <div style={{textAlign:"center", color:PAL.subtext, fontSize:13, padding:"40px 20px"}}>
            Nessuna conversazione per "{inboxSearch}"
          </div>
        )}
      </div>

      {/* Footer inbox */}
      <div style={{padding:"12px 18px", borderTop:`1px solid ${PAL.inboxBorder}`, flexShrink:0}}>
        <button
          onClick={()=>window.mpToast && window.mpToast("Nuova conversazione · v2", "info")}
          className="w-full h-9 rounded-[2px] border border-line text-[12px] text-smoke hover:text-ink hover:border-ink transition inline-flex items-center justify-center gap-2">
          <Icon name="plus" size={13}/> Nuova conversazione
        </button>
      </div>
    </div>
  );

  // ─── THREAD ────────────────────────────────────────────────────────
  const renderThread = () => (
    <div style={{flex:1, display:"flex", flexDirection:"column", height:"100vh", minWidth:0}}>
      {/* Header */}
      <div style={{background:PAL.headerBg, borderBottom:`1px solid ${PAL.headerBorder}`, padding:"14px 28px", display:"flex", alignItems:"center", gap:14, flexShrink:0}}>
        {!isCoach && (
          <>
            <button onClick={()=>nav && nav("home")} className="flex items-center gap-1.5 text-[12px] text-smoke hover:text-ink" style={{fontFamily:"JetBrains Mono,monospace", letterSpacing:"0.1em", textTransform:"uppercase"}}>
              <Icon name="chevronl" size={13}/> indietro
            </button>
            <div style={{width:1, height:24, background:PAL.headerBorder, margin:"0 6px"}}/>
          </>
        )}
        <Avatar initials={peerInitials} size={42} tone="ember"/>
        <div style={{flex:1, minWidth:0}}>
          <div style={{fontFamily:"'Big Shoulders Display',sans-serif", fontWeight:800, fontSize:20, textTransform:"uppercase", letterSpacing:"0.01em", color:"#0B0B0D", lineHeight:1}}>{peerName}</div>
          <div style={{fontFamily:"JetBrains Mono,monospace", fontSize:10, letterSpacing:"0.15em", textTransform:"uppercase", color:PAL.subtext, marginTop:4}}>{peerStatus}</div>
        </div>
        {perspective === "coach" && (
          <button
            onClick={()=>{
              if (peerName === "Luca Bianchi") nav && nav("student");
              else window.mpToast && window.mpToast("Profilo dettagliato · demo limitata a Luca", "info");
            }}
            className="h-9 px-3 rounded-[2px] border border-line text-[11px] font-mono uppercase tracking-wider text-smoke hover:text-ink hover:border-ink transition inline-flex items-center gap-1.5">
            <Icon name="users" size={12}/> apri profilo
          </button>
        )}
        {perspective === "collab" && (
          <button
            onClick={()=>window.mpToast && window.mpToast("Profilo studente · demo limitata", "info")}
            className="h-9 px-3 rounded-[2px] border border-line text-[11px] font-mono uppercase tracking-wider text-smoke hover:text-ink hover:border-ink transition inline-flex items-center gap-1.5">
            <Icon name="users" size={12}/> apri profilo
          </button>
        )}
        <button onClick={()=>window.mpToast && window.mpToast("Cerca nei messaggi · v2", "info")} className="hover:bg-sand" style={{width:36, height:36, borderRadius:2, display:"flex", alignItems:"center", justifyContent:"center", color:PAL.subtext}}><Icon name="search" size={16}/></button>
        <button onClick={()=>window.mpToast && window.mpToast("Videochiamata · v2", "info")} className="hover:bg-sand" style={{width:36, height:36, borderRadius:2, display:"flex", alignItems:"center", justifyContent:"center", color:PAL.subtext}}><Icon name="video" size={16}/></button>
        <button onClick={()=>window.mpToast && window.mpToast("Impostazioni chat · v2", "info")} className="hover:bg-sand" style={{width:36, height:36, borderRadius:2, display:"flex", alignItems:"center", justifyContent:"center", color:PAL.subtext}}><Icon name="settings" size={16}/></button>
      </div>

      {/* Wallpaper + messaggi */}
      <div ref={scrollerRef} style={{flex:1, overflowY:"auto", padding:"20px 28px 24px", display:"flex", flexDirection:"column", gap:4, backgroundImage:PAL.wallpaper, backgroundSize:"18px 18px"}}>
        <div style={{maxWidth:820, width:"100%", margin:"0 auto", display:"flex", flexDirection:"column", gap:4}}>

          {/* Banner data */}
          <div style={{alignSelf:"center", background:"rgba(11,11,13,0.06)", color:PAL.subtext, fontSize:10, padding:"4px 12px", borderRadius:2, marginBottom:8, fontFamily:"JetBrains Mono,monospace", letterSpacing:"0.2em", textTransform:"uppercase"}}>questa settimana</div>

          {/* Banner cifratura */}
          <div style={{alignSelf:"center", background:"rgba(11,11,13,0.06)", color:"#8C6319", fontSize:11, padding:"6px 14px", borderRadius:2, marginBottom:14, textAlign:"center", maxWidth:520, lineHeight:1.45, fontFamily:"JetBrains Mono,monospace", letterSpacing:"0.03em"}}>
            🔒 Messaggi crittografati end-to-end — solo tu e {peerName.split(" ")[0]}.
          </div>

          {messages.map((m, i) => {
            const isMe = m.from === meRole;
            const prev = messages[i-1];
            const next = messages[i+1];
            const grouped = prev && prev.from === m.from;
            const lastInGroup = !next || next.from !== m.from;
            return (
              <div key={i} style={{display:"flex", justifyContent: isMe?"flex-end":"flex-start", marginTop: grouped?1:8, padding:"0 4px"}} className="slide-up">
                <div style={{
                  maxWidth:"65%",
                  background: isMe ? PAL.outBubble : PAL.inBubble,
                  color: isMe ? PAL.outText : PAL.inText,
                  borderRadius: 3,
                  borderTopLeftRadius: !isMe && !grouped ? 0 : 3,
                  borderTopRightRadius: isMe && !grouped ? 0 : 3,
                  padding: m.attach ? "4px 4px 6px" : "8px 12px 8px 12px",
                  fontSize: 14.5,
                  lineHeight: 1.5,
                  position:"relative",
                  boxShadow: isMe ? "0 2px 6px rgba(242,183,68,0.25)" : "0 2px 6px rgba(11,11,13,0.18)",
                  minWidth: 80,
                }}>
                  {!grouped && (
                    <div style={{
                      position:"absolute", top:0,
                      [isMe?"right":"left"]: -7,
                      width:0, height:0,
                      borderTop: `10px solid ${isMe ? PAL.outBubble : PAL.inBubble}`,
                      [isMe?"borderLeft":"borderRight"]: "7px solid transparent",
                    }}/>
                  )}

                  {m.attach && (
                    <div style={{background:isMe?"rgba(11,11,13,0.1)":"rgba(0,0,0,0.35)", borderRadius:2, overflow:"hidden", marginBottom:6, position:"relative"}}>
                      <div style={{aspectRatio:"16/10", background:"repeating-linear-gradient(135deg,#141417 0 12px,#1D1D22 12px 24px)", position:"relative"}}>
                        <div style={{position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center"}}>
                          <div style={{width:52, height:52, borderRadius:99, background:"rgba(11,11,13,0.65)", border:"2px solid rgba(242,183,68,0.9)", color:"#F2B744", display:"flex", alignItems:"center", justifyContent:"center"}}>
                            <Icon name="play" size={18}/>
                          </div>
                        </div>
                        <div style={{position:"absolute", top:8, left:10, fontFamily:"JetBrains Mono,monospace", fontSize:10, color:"#F5F3ED", background:"rgba(11,11,13,0.75)", padding:"2px 8px", borderRadius:2, letterSpacing:"0.08em"}}>▶ {m.attach.length}</div>
                        <div style={{position:"absolute", bottom:8, right:10, fontSize:10, color:"#9A9AA2", fontFamily:"JetBrains Mono,monospace"}}>📎 {m.attach.label}</div>
                      </div>
                    </div>
                  )}

                  <div style={{padding: m.attach ? "2px 8px 2px" : 0, paddingRight: lastInGroup ? 64 : 8, paddingBottom: 2}}>{m.text}</div>

                  {lastInGroup && (
                    <div style={{
                      position:"absolute", bottom:4, right:10,
                      display:"flex", alignItems:"center", gap:3,
                      fontSize:10.5,
                      color: isMe ? "rgba(11,11,13,0.55)" : PAL.subtextDark,
                      fontFamily:"JetBrains Mono,monospace",
                    }}>
                      <span>{m.t.replace(/^[a-zà-ù]+ /i,"")}</span>
                      {isMe && (
                        <svg width="15" height="11" viewBox="0 0 16 11" fill="none">
                          <path d="M11.071 0.653a.498.498 0 00-.707-.012L5.284 5.628 3.637 3.98a.5.5 0 00-.707.708l2 2a.5.5 0 00.707 0L11.071 1.36a.498.498 0 000-.707z" fill={PAL.tickOnAmber}/>
                          <path d="M15.071 0.653a.498.498 0 00-.707-.012L9.284 5.628 8.637 4.98a.5.5 0 10-.707.708l1 1a.5.5 0 00.707 0L15.071 1.36a.498.498 0 000-.707z" fill={PAL.tickOnAmber}/>
                        </svg>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Typing */}
          {typing && (
            <div style={{display:"flex", justifyContent:"flex-start", marginTop:8, padding:"0 4px"}} className="slide-up">
              <div style={{background:PAL.inBubble, color:PAL.inText, borderRadius:3, borderTopLeftRadius:0, padding:"11px 14px", display:"inline-flex", alignItems:"center", gap:4, boxShadow:"0 2px 6px rgba(11,11,13,0.18)", position:"relative"}}>
                <div style={{position:"absolute", top:0, left:-7, width:0, height:0, borderTop:`10px solid ${PAL.inBubble}`, borderRight:"7px solid transparent"}}/>
                <span style={{width:6, height:6, borderRadius:99, background:"#9A9AA2", opacity:0.9}} className="animate-pulse"/>
                <span style={{width:6, height:6, borderRadius:99, background:"#9A9AA2", opacity:0.6}} className="animate-pulse" />
                <span style={{width:6, height:6, borderRadius:99, background:"#9A9AA2", opacity:0.3}} className="animate-pulse"/>
                <span style={{marginLeft:8, fontSize:11, fontFamily:"JetBrains Mono,monospace", textTransform:"uppercase", letterSpacing:"0.12em", color:PAL.subtextDark}}>{peerName.split(" ")[0]} sta scrivendo</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Composer */}
      <div style={{background:PAL.composerBg, borderTop:`1px solid ${PAL.composerBorder}`, padding:"14px 28px 16px", flexShrink:0}}>
        <div style={{maxWidth:820, margin:"0 auto", display:"flex", gap:8, alignItems:"flex-end"}}>
          <div style={{flex:1, background:PAL.composerInput, border:`1px solid ${PAL.composerBorder}`, borderRadius:3, padding:"6px 8px 6px 12px", display:"flex", gap:4, alignItems:"center", minHeight:44}}>
            <button onClick={()=>window.mpToast && window.mpToast("Emoji picker · v2", "info")} style={{width:32, height:32, display:"flex", alignItems:"center", justifyContent:"center", color:PAL.subtext, fontSize:18}}>😊</button>
            <button onClick={()=>window.mpToast && window.mpToast("Allega file · v2", "info")} style={{width:32, height:32, display:"flex", alignItems:"center", justifyContent:"center", color:PAL.subtext, transform:"rotate(-30deg)"}}><Icon name="paperclip" size={16}/></button>
            <input
              value={msg}
              onChange={e=>setMsg(e.target.value)}
              placeholder={`Scrivi a ${peerName.split(" ")[0]}…`}
              onKeyDown={e=>{ if(e.key==="Enter" && msg){ window.mpToast && window.mpToast("Messaggio inviato a "+peerName.split(" ")[0], "ok"); setMsg(""); }}}
              style={{flex:1, background:"transparent", outline:"none", fontSize:14.5, padding:"0 8px", border:"none", color:"#0B0B0D"}}
            />
            <button onClick={()=>window.mpToast && window.mpToast("Video-messaggio · v2", "info")} style={{width:32, height:32, display:"flex", alignItems:"center", justifyContent:"center", color:PAL.subtext}}><Icon name="video" size={16}/></button>
          </div>
          <button
            onClick={()=>{
              if(msg) { window.mpToast && window.mpToast("Messaggio inviato a "+peerName.split(" ")[0], "ok"); setMsg(""); }
              else { window.mpToast && window.mpToast("Registra messaggio vocale · v2", "info"); }
            }}
            style={{width:44, height:44, borderRadius:3, background:"#F2B744", color:"#0B0B0D", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, boxShadow:"0 2px 8px rgba(242,183,68,0.35)"}}
          >
            <Icon name={msg?"send":"mic"} size={16} stroke={2}/>
          </button>
        </div>
        <div style={{maxWidth:820, margin:"8px auto 0", textAlign:"center", fontFamily:"JetBrains Mono,monospace", fontSize:10, color:PAL.subtext, textTransform:"uppercase", letterSpacing:"0.18em"}}>
          end-to-end tra te e {peerName.split(" ")[0]}
        </div>
      </div>
    </div>
  );

  // ─── Layout finale ────────────────────────────────────────────────
  if (isCoach) {
    return (
      <div style={{background:PAL.bodyBg, height:"100vh", display:"flex"}}>
        {renderInbox()}
        {renderThread()}
      </div>
    );
  }
  return (
    <div style={{background:PAL.bodyBg, height:"100vh", display:"flex"}}>
      {renderThread()}
    </div>
  );
}

Object.assign(window, { StudentChat });
