// ─── COACH 9: Review Tool (KILLER, dark, full screen) ────────────────

function CoachReview({ nav }) {
  const annotations = window.ANNOTATIONS;
  const totalSec = 140;
  const [notes, setNotes] = React.useState(annotations);
  const [active, setActive] = React.useState(2);
  const [showPopup, setShowPopup] = React.useState(false);
  const [popupT, setPopupT] = React.useState("1:24");
  const [popupType, setPopupType] = React.useState("tip");
  const [popupText, setPopupText] = React.useState("");
  const [popupMedia, setPopupMedia] = React.useState("text"); // text | video | both
  const [popupRecording, setPopupRecording] = React.useState(false);
  const [popupHasVideo, setPopupHasVideo] = React.useState(false);
  const [ratings, setRatings] = React.useState({ Tempo:3.5, Tono:4, Tecnica:3, Groove:4, Espressione:4.5 });
  const [playing, setPlaying] = React.useState(false);
  const [speed, setSpeed] = React.useState("1x");
  const [loopAB, setLoopAB] = React.useState(false);

  const dots = notes.map(a=>({ t: a.t/totalSec, color: window.AnnotationColor(a.type) }));

  const saveAnnotation = () => {
    if (!popupText.trim() && !popupHasVideo) return;
    const t = 100;
    const entry = popupHasVideo
      ? { t, sec:popupT, type:"video", text: popupText || "Guarda la mia video-risposta.", duration:"0:38", textPlus: popupText }
      : { t, sec:popupT, type:popupType, text:popupText };
    setNotes([...notes, entry].sort((a,b)=>a.t-b.t));
    setShowPopup(false); setPopupText(""); setPopupHasVideo(false); setPopupRecording(false); setPopupMedia("text");
  };

  // tasto N per nuova annotazione — ignora se focus in input/textarea
  React.useEffect(()=>{
    const h = (e) => {
      const tag = document.activeElement && document.activeElement.tagName;
      const inField = tag === "INPUT" || tag === "TEXTAREA";
      if (e.key==="n" && !showPopup && !inField) { setShowPopup(true); setPopupT("1:24"); }
      if (e.key==="Escape") setShowPopup(false);
    };
    window.addEventListener("keydown", h);
    return ()=>window.removeEventListener("keydown", h);
  },[showPopup]);

  return (
    <div className="min-h-full bg-ink text-paper fade-in grain-dark">
      <div className="max-w-[1600px] mx-auto px-8 py-5">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-5">
          <button onClick={()=>nav("dashboard")} className="flex items-center gap-2 text-[13px] text-[#9E8E82] hover:text-paper">
            <Icon name="chevronl" size={14}/> Coda
          </button>
          <div className="flex items-center gap-3">
            <Avatar initials="LB" size={32}/>
            <div>
              <div className="text-[14px]"><span className="text-paper">Luca Bianchi</span> · 12 bar in La — pentatonica</div>
              <div className="font-mono text-[10px] uppercase tracking-wider text-[#9E8E82]">take_05 · inviato 2 giorni fa · 120bpm</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={()=>window.mpToast && window.mpToast("Bozza salvata", "ok")} className="h-9 px-3 rounded-[2px] border border-line-dark text-[12px] text-[#C9BDB1] hover:text-paper">Salva bozza</button>
            <EmberButton icon="video" onClick={()=>{ setShowPopup(true); setPopupMedia("video"); setPopupT("1:24"); }}>Registra video-risposta</EmberButton>
          </div>
        </div>

        <div className="grid grid-cols-10 gap-6">

          {/* Video 70% */}
          <div className="col-span-7">
            <div className="relative bg-black rounded-[3px] overflow-hidden" style={{aspectRatio:"16/9"}}>
              <div className="absolute inset-0 thumb-stripe opacity-40"/>
              <div className="absolute top-3 left-3 font-mono text-[10px] uppercase tracking-[0.22em] text-[#9E8E82]">luca · take_05 · 01:40</div>
              <div className="absolute top-3 right-3 flex items-center gap-2">
                <span className="font-mono text-[10px] uppercase tracking-wider bg-ink-3 border border-line-dark px-2 py-1 rounded-[2px] text-[#C9BDB1]">full hd</span>
                <span className="font-mono text-[10px] uppercase tracking-wider bg-ink-3 border border-line-dark px-2 py-1 rounded-[2px] text-[#C9BDB1]">mano destra cam</span>
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <button onClick={()=>setPlaying(v=>!v)} className="w-16 h-16 rounded-full bg-paper/95 flex items-center justify-center text-ink hover:scale-105 transition"><Icon name={playing?"pause":"play"} size={18}/></button>
              </div>

              {/* Popup annotazione inline */}
              {showPopup && (
                <div className="absolute left-10 bottom-20 w-[420px] bg-ink-2 border border-ember rounded-[3px] p-4 slide-up shadow-2xl" style={{boxShadow:"0 20px 60px rgba(0,0,0,0.6)"}}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-ember"/>
                      <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-ember">Nuova annotazione</span>
                    </div>
                    <div className="font-mono text-[11px] text-[#C9BDB1]">@ {popupT}</div>
                  </div>

                  {/* Media toggle */}
                  <div className="flex items-center gap-1 bg-ink-3 rounded-[2px] p-1 mb-3">
                    {[
                      {id:"text",  l:"Testo",       i:"note"},
                      {id:"video", l:"Video",       i:"video"},
                      {id:"both",  l:"Testo+Video", i:"sparkle"},
                    ].map(m=>(
                      <button key={m.id} onClick={()=>setPopupMedia(m.id)} className={"flex-1 h-8 text-[11px] font-medium tracking-wide rounded-[1px] flex items-center justify-center gap-1.5 "+(popupMedia===m.id?"bg-ember text-white":"text-[#9E8E82] hover:text-paper")}>
                        <Icon name={m.i} size={11}/> {m.l}
                      </button>
                    ))}
                  </div>

                  {/* Category (solo se c'è testo senza video) */}
                  {popupMedia!=="video" && (
                    <div className="flex items-center gap-2 mb-3">
                      {[
                        {t:"tip",  l:"TIP",  c:"#D6A23D"},
                        {t:"ok",   l:"OK",   c:"#5C8C55"},
                        {t:"warning", l:"WARN", c:"#C94A3D"},
                      ].map(x=>(
                        <button key={x.t} onClick={()=>setPopupType(x.t)} className={"h-7 px-2.5 rounded-[2px] font-mono text-[10px] uppercase tracking-wider border "+(popupType===x.t?"border-transparent":"border-line-dark")} style={popupType===x.t?{background:`${x.c}22`, color:x.c, borderColor:x.c}:{color:"#9E8E82"}}>{x.l}</button>
                      ))}
                    </div>
                  )}

                  {/* Video recorder */}
                  {(popupMedia==="video" || popupMedia==="both") && (
                    <div className="mb-3 rounded-[2px] border border-line-dark bg-ink-3 overflow-hidden">
                      {!popupHasVideo ? (
                        <div className="p-4 flex items-center gap-4">
                          <button onClick={()=>{ if(popupRecording){setPopupRecording(false); setPopupHasVideo(true);} else setPopupRecording(true); }} className={"w-12 h-12 rounded-full flex items-center justify-center shrink-0 "+(popupRecording?"bg-ember rec-pulse":"bg-ember hover:scale-105 transition")}>
                            {popupRecording ? <div className="w-4 h-4 bg-white rounded-[2px]"/> : <div className="w-4 h-4 bg-white rounded-full"/>}
                          </button>
                          <div className="flex-1">
                            <div className="text-[13px] text-paper">{popupRecording ? "REC · 00:14" : "Registra video-risposta"}</div>
                            <div className="font-mono text-[10px] uppercase tracking-wider text-[#9E8E82]">{popupRecording ? "Premi stop quando hai finito" : "Webcam + microfono · fino a 2 min"}</div>
                          </div>
                        </div>
                      ) : (
                        <div className="p-3 flex items-center gap-3">
                          <div className="w-14 h-10 rounded-[2px] bg-ember flex items-center justify-center"><Icon name="play" size={12} className="text-white"/></div>
                          <div className="flex-1">
                            <div className="text-[12px] text-paper">Video-risposta pronta · 0:38</div>
                            <div className="font-mono text-[10px] uppercase tracking-wider text-[#9E8E82]">mano destra · close-up</div>
                          </div>
                          <button onClick={()=>setPopupHasVideo(false)} className="text-[11px] font-mono uppercase tracking-wider text-[#9E8E82] hover:text-ember">rifai</button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Textarea */}
                  {popupMedia!=="video" && (
                    <textarea autoFocus value={popupText} onChange={e=>setPopupText(e.target.value)} rows={3} placeholder={popupMedia==="both"?"Aggiungi una nota al video…":"Commento a Luca…"} className="w-full bg-ink-3 border border-line-dark rounded-[2px] p-3 text-[13px] text-paper focus:outline-none focus:border-ember resize-none placeholder:text-[#6B625B]"/>
                  )}
                  {popupMedia==="video" && (
                    <input value={popupText} onChange={e=>setPopupText(e.target.value)} placeholder="Didascalia breve (facoltativa)" className="w-full h-9 bg-ink-3 border border-line-dark rounded-[2px] px-3 text-[12px] text-paper focus:outline-none focus:border-ember placeholder:text-[#6B625B]"/>
                  )}

                  <div className="flex items-center justify-between mt-3">
                    <div className="font-mono text-[10px] uppercase tracking-wider text-[#9E8E82]">Enter per salvare · Esc</div>
                    <div className="flex items-center gap-2">
                      <button onClick={()=>{setShowPopup(false); setPopupHasVideo(false); setPopupRecording(false);}} className="h-8 px-3 text-[12px] text-[#9E8E82] hover:text-paper">Annulla</button>
                      <EmberButton size="sm" onClick={saveAnnotation}>Salva</EmberButton>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Pro controls */}
            <div className="mt-4 bg-ink-2 border border-line-dark rounded-[3px] p-4">
              <div className="flex items-center gap-3">
                <button onClick={()=>window.mpToast && window.mpToast("-5 sec", "info")} className="w-9 h-9 rounded-full bg-ink-3 flex items-center justify-center hover:bg-[#24242A]"><Icon name="rewind" size={13}/></button>
                <button onClick={()=>setPlaying(v=>!v)} className="w-11 h-11 rounded-full bg-ember flex items-center justify-center text-white"><Icon name={playing?"pause":"play"} size={15}/></button>
                <button onClick={()=>window.mpToast && window.mpToast("+5 sec", "info")} className="w-9 h-9 rounded-full bg-ink-3 flex items-center justify-center hover:bg-[#24242A]"><Icon name="skip" size={13}/></button>

                <div className="flex-1 mx-3">
                  <Waveform dark dots={dots} progress={0.55}/>
                </div>

                <div className="flex items-center gap-1 bg-ink-3 rounded-[2px] p-1">
                  {["0.25x","0.5x","1x","1.5x","2x"].map(s=>(
                    <button key={s} onClick={()=>setSpeed(s)} className={"px-2 h-7 font-mono text-[10px] uppercase tracking-wider rounded-[1px] "+(s===speed?"bg-ember text-white":"text-[#9E8E82] hover:text-paper")}>{s}</button>
                  ))}
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-line-dark flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button onClick={()=>window.mpToast && window.mpToast("Frame · usa ← →", "info")} className="h-8 px-3 rounded-[2px] bg-ink-3 text-[11px] font-mono uppercase tracking-wider text-[#C9BDB1] hover:text-paper flex items-center gap-1.5"><Icon name="frame" size={11}/> frame a frame</button>
                  <button onClick={()=>{ setLoopAB(v=>!v); window.mpToast && window.mpToast(loopAB?"Loop A-B off":"Loop A-B attivo", "info"); }} className={"h-8 px-3 rounded-[2px] text-[11px] font-mono uppercase tracking-wider flex items-center gap-1.5 "+(loopAB?"bg-ember text-white":"bg-ink-3 text-[#C9BDB1] hover:text-paper")}><Icon name="loop" size={11}/> Loop A-B</button>
                  <button onClick={()=>window.mpToast && window.mpToast("Marker a 0:40", "info")} className="h-8 px-3 rounded-[2px] bg-ink-3 text-[11px] font-mono uppercase tracking-wider text-[#C9BDB1] hover:text-paper">Marker 0:40</button>
                </div>
                <button onClick={()=>setShowPopup(true)} className="h-8 px-3 rounded-[2px] bg-ember text-white text-[11px] font-mono uppercase tracking-wider flex items-center gap-1.5">
                  <kbd className="bg-white/20 px-1.5 py-0.5 rounded-[1px] font-mono text-[10px]">N</kbd> Nuova annotazione
                </button>
              </div>
            </div>

            {/* Rating sliders */}
            <div className="mt-5 bg-ink-2 border border-line-dark rounded-[3px] p-6">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#9E8E82] mb-1">Valutazione — ultimo take</div>
                  <div className="font-display text-2xl">Dai un <span className="italic-ember">punteggio</span></div>
                </div>
                {(() => {
                  const vals = Object.values(ratings);
                  const avg = vals.length ? vals.reduce((a,b)=>a+b,0)/vals.length : 0;
                  const intPart = Math.floor(avg);
                  const decPart = Math.round((avg-intPart)*10);
                  return <div className="font-display text-5xl">{intPart}.<span className="text-[#9E8E82] text-3xl">{decPart}</span></div>;
                })()}
              </div>
              <div className="grid grid-cols-5 gap-5">
                {Object.entries(ratings).map(([k,v])=>(
                  <div key={k}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[12px] text-[#C9BDB1]">{k}</span>
                      <span className="font-mono text-[11px] text-paper">{v.toFixed(1)}</span>
                    </div>
                    <input type="range" min="0" max="5" step="0.5" value={v} onChange={e=>setRatings({...ratings, [k]:parseFloat(e.target.value)})} className="w-full"/>
                  </div>
                ))}
              </div>
            </div>

            {/* Invia */}
            <div className="mt-6 flex items-center justify-between">
              <div className="text-[12px] text-[#9E8E82]">Luca riceve notifica + riepilogo email.</div>
              <EmberButton size="lg" icon="send" onClick={()=>{ window.mpToast && window.mpToast("Feedback inviato a Luca · "+notes.length+" annotazioni", "ok"); setTimeout(()=>nav("dashboard"), 500); }}>Invia feedback a Luca</EmberButton>
            </div>
          </div>

          {/* Annotazioni 30% */}
          <div className="col-span-3">
            <div className="flex items-center justify-between mb-3">
              <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#9E8E82]">{notes.length} annotazioni · live</div>
              <button onClick={()=>setShowPopup(true)} className="text-ember font-mono text-[10px] uppercase tracking-wider inline-flex items-center gap-1"><Icon name="plus" size={11}/> Nuova</button>
            </div>

            <div className="space-y-2 max-h-[720px] overflow-y-auto no-scrollbar pr-1">
              {notes.map((a,i)=>{
                const color = window.AnnotationColor(a.type);
                const label = {ok:"OK", tip:"TIP", warning:"WARN", video:"VIDEO"}[a.type];
                const isActive = i===active;
                return (
                  <div key={i} onClick={()=>setActive(i)} className={"rounded-[3px] p-3 border transition cursor-pointer "+(isActive?"bg-ink-3 border-ember":"bg-ink-2 border-line-dark hover:border-[#4A3A32]")}>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="font-mono text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded-[2px]" style={{color, background:`${color}22`}}>{label}</span>
                      <span className="font-mono text-[11px] text-[#9E8E82]">{a.sec}</span>
                      <div className="ml-auto flex items-center gap-1">
                        <button onClick={(e)=>{e.stopPropagation(); window.mpToast && window.mpToast("Modifica annotazione · v2", "info");}} className="text-[#9E8E82] hover:text-paper"><Icon name="pencil" size={11}/></button>
                        <button onClick={(e)=>{e.stopPropagation(); setNotes(notes.filter((_,j)=>j!==i)); window.mpToast && window.mpToast("Annotazione rimossa", "info");}} className="text-[#9E8E82] hover:text-paper"><Icon name="x" size={11}/></button>
                      </div>
                    </div>
                    <div className="text-[12.5px] text-[#E6DDD1] leading-[1.55]">{a.text}</div>
                  </div>
                );
              })}
            </div>

            <div className="mt-5 bg-ink-2 border border-line-dark rounded-[3px] p-4">
              <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#9E8E82] mb-2">Shortcut</div>
              <div className="space-y-1.5 text-[12px] text-[#C9BDB1]">
                <div className="flex justify-between"><span>Nuova annotazione</span><kbd className="bg-ink-3 px-1.5 rounded-[1px] font-mono text-[10px]">N</kbd></div>
                <div className="flex justify-between"><span>Play / pausa</span><kbd className="bg-ink-3 px-1.5 rounded-[1px] font-mono text-[10px]">Space</kbd></div>
                <div className="flex justify-between"><span>Frame ±1</span><kbd className="bg-ink-3 px-1.5 rounded-[1px] font-mono text-[10px]">← →</kbd></div>
                <div className="flex justify-between"><span>Loop A-B</span><kbd className="bg-ink-3 px-1.5 rounded-[1px] font-mono text-[10px]">L</kbd></div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

Object.assign(window, { CoachReview });
