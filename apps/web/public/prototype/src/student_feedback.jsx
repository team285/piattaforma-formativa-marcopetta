// ─── STUDENTE 4: Feedback Viewer (KILLER FEATURE, dark) ──────────────

function StudentFeedback({ nav }) {
  const annotations = window.ANNOTATIONS;
  const rating = window.RATING;
  const totalSec = 140;
  const [active, setActive] = React.useState(2);
  const [sideBySide, setSideBySide] = React.useState(false);
  const [loop, setLoop] = React.useState(false);
  const [playing, setPlaying] = React.useState(false);
  const [speed, setSpeed] = React.useState("1x");
  const current = annotations[active];
  const currentT = current.t / totalSec;

  const dots = annotations.map(a=>({ t: a.t/totalSec, color: window.AnnotationColor(a.type) }));

  return (
    <div className="min-h-full bg-ink text-paper fade-in grain-dark">
      <div className="max-w-[1480px] mx-auto px-8 py-6">

        <div className="flex items-center justify-between mb-5">
          <button onClick={()=>nav("home")} className="flex items-center gap-2 text-[13px] text-[#8A8A92] hover:text-paper">
            <Icon name="chevronl" size={14}/> Il tuo piano
          </button>
          <div className="text-center">
            <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#8A8A92] mb-1">Feedback di Marco su</div>
            <div className="font-display text-xl">12 bar in La — <span className="italic-ember">pentatonica</span></div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={()=>setSideBySide(!sideBySide)} className={"h-9 px-3 rounded-[2px] font-mono text-[10px] uppercase tracking-wider flex items-center gap-1.5 "+(sideBySide?"bg-ember text-white":"bg-ink-2 text-[#8A8A92] border border-line-dark")}>
              <Icon name="frame" size={12}/> Side-by-side
            </button>
            <button onClick={()=>setLoop(!loop)} className={"h-9 px-3 rounded-[2px] font-mono text-[10px] uppercase tracking-wider flex items-center gap-1.5 "+(loop?"bg-ember text-white":"bg-ink-2 text-[#8A8A92] border border-line-dark")}>
              <Icon name="loop" size={12}/> Loop A-B
            </button>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-6">

          {/* VIDEO + TIMELINE */}
          <div className="col-span-8">
            <div className={"grid gap-3 "+(sideBySide?"grid-cols-2":"grid-cols-1")}>
              <div className="relative bg-black rounded-[3px] overflow-hidden" style={{aspectRatio:"16/9"}}>
                <div className="absolute inset-0 thumb-stripe opacity-40"/>
                <div className="absolute top-3 left-3 font-mono text-[10px] uppercase tracking-[0.22em] text-[#8A8A92]">Tu · take_05</div>
                <div className="absolute bottom-3 left-3 font-mono text-[10px] text-[#8A8A92]">01:04 / 02:20</div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <button onClick={()=>setPlaying(v=>!v)} className="w-16 h-16 rounded-full bg-paper/95 flex items-center justify-center text-ink cursor-pointer hover:scale-105 transition"><Icon name={playing?"pause":"play"} size={18}/></button>
                </div>
              </div>
              {sideBySide && (
                <div className="relative bg-black rounded-[3px] overflow-hidden" style={{aspectRatio:"16/9"}}>
                  <div className="absolute inset-0 thumb-stripe opacity-40"/>
                  <div className="absolute top-3 left-3 font-mono text-[10px] uppercase tracking-[0.22em] text-ember">Marco · esempio</div>
                </div>
              )}
            </div>

            {/* Timeline a puntini */}
            <div className="mt-5 bg-ink-2 border border-line-dark rounded-[3px] p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#8A8A92]">8 annotazioni · 1 video-risposta</div>
                <div className="font-mono text-[10px] text-[#8A8A92]">02:20</div>
              </div>
              <Waveform dark dots={dots} progress={currentT}/>
              <div className="mt-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button onClick={()=>setActive(a=>Math.max(0,a-1))} className="w-9 h-9 rounded-full bg-ink-3 flex items-center justify-center hover:bg-[#24242A]"><Icon name="rewind" size={13}/></button>
                  <button onClick={()=>setPlaying(v=>!v)} className="w-11 h-11 rounded-full bg-ember flex items-center justify-center text-white"><Icon name={playing?"pause":"play"} size={15}/></button>
                  <button onClick={()=>setActive(a=>Math.min(annotations.length-1,a+1))} className="w-9 h-9 rounded-full bg-ink-3 flex items-center justify-center hover:bg-[#24242A]"><Icon name="skip" size={13}/></button>
                </div>
                <div className="flex items-center gap-1 bg-ink-3 rounded-[2px] p-1">
                  {["0.5x","1x","1.5x"].map(s=>(
                    <button key={s} onClick={()=>setSpeed(s)} className={"px-2 h-6 font-mono text-[10px] uppercase tracking-wider rounded-[1px] "+(s===speed?"bg-ember text-white":"text-[#8A8A92] hover:text-paper")}>{s}</button>
                  ))}
                </div>
                <div className="flex items-center gap-3 text-[11px] font-mono uppercase tracking-wider text-[#8A8A92]">
                  <span className="flex items-center gap-1.5"><span className="marquee-dot bg-[#7BB07B]"/>ok {annotations.filter(a=>a.type==="ok").length}</span>
                  <span className="flex items-center gap-1.5"><span className="marquee-dot bg-[#F2B744]"/>tip {annotations.filter(a=>a.type==="tip").length}</span>
                  <span className="flex items-center gap-1.5"><span className="marquee-dot bg-[#E04A3A]"/>warning {annotations.filter(a=>a.type==="warning").length}</span>
                  <span className="flex items-center gap-1.5"><span className="marquee-dot bg-ember"/>video {annotations.filter(a=>a.type==="video").length}</span>
                </div>
              </div>
            </div>

            {/* Rating radar */}
            <div className="mt-5 bg-ink-2 border border-line-dark rounded-[3px] p-6">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#8A8A92] mb-1">Valutazione</div>
                  <div className="font-display text-2xl">La <span className="italic-ember">fotografia</span> di questa take</div>
                </div>
                {(() => {
                  const avg = rating.reduce((a,r)=>a+r.value,0)/rating.length;
                  const intPart = Math.floor(avg);
                  const decPart = Math.round((avg-intPart)*10);
                  return <div className="font-display text-5xl">{intPart}.<span className="text-[#8A8A92] text-3xl">{decPart}</span></div>;
                })()}
              </div>

              <div className="grid grid-cols-5 gap-6">
                {rating.map(r=>(
                  <div key={r.label}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[12px] text-[#C9C9D0]">{r.label}</span>
                      <span className="font-mono text-[11px] text-paper">{r.value.toFixed(1)}</span>
                    </div>
                    <div className="h-1 rounded-full bg-ink-3 overflow-hidden">
                      <div className="h-full bg-ember" style={{width:`${r.value*20}%`}}/>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* LISTA ANNOTAZIONI */}
          <div className="col-span-4">
            <div className="flex items-center justify-between mb-3">
              <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#8A8A92]">Commenti al secondo</div>
              <div className="font-mono text-[10px] text-[#8A8A92]">{active+1} / {annotations.length}</div>
            </div>

            <div className="space-y-2 max-h-[620px] overflow-y-auto no-scrollbar pr-2">
              {annotations.map((a,i)=>{
                const isActive = i===active;
                const color = window.AnnotationColor(a.type);
                const label = {ok:"OK", tip:"TIP", warning:"WARN", video:"VIDEO"}[a.type];
                return (
                  <button key={i} onClick={()=>setActive(i)} className={"w-full text-left rounded-[3px] p-4 border transition "+(isActive? "bg-ink-3 border-ember" : "bg-ink-2 border-line-dark hover:border-[#4A3A32]")}>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-mono text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded-[2px]" style={{color, background:`${color}22`}}>{label}</span>
                      <span className="font-mono text-[11px] text-[#8A8A92]">{a.sec}</span>
                      {isActive && <span className="ml-auto font-mono text-[10px] text-ember">PLAYING</span>}
                    </div>
                    {a.type==="video" ? (
                      <div>
                        <div className="relative rounded-[2px] overflow-hidden bg-ember/15 border border-ember/40 p-3 flex items-center gap-3 mb-3">
                          <div className="w-12 h-12 rounded-[2px] bg-ember flex items-center justify-center text-white"><Icon name="play" size={14}/></div>
                          <div className="flex-1 min-w-0">
                            <div className="text-[12px] font-medium text-paper">Video-risposta di Marco</div>
                            <div className="font-mono text-[10px] text-[#F2B744]">{a.duration} · con testo</div>
                          </div>
                        </div>
                        <div className="text-[13px] text-[#D9D9DE] leading-[1.55]">{a.text}</div>
                      </div>
                    ) : (
                      <div className="text-[13px] text-[#D9D9DE] leading-[1.55]">{a.text}</div>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="mt-5">
              <EmberButton full size="lg" icon="record" onClick={()=>nav("exercise")}>Rispondi con nuovo video</EmberButton>
              <button onClick={()=>nav("chat")} className="mt-3 w-full h-10 rounded-[2px] border border-line-dark text-[13px] text-[#C9C9D0] hover:text-paper hover:border-[#4A3A32]">Scrivi a Marco in chat</button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

Object.assign(window, { StudentFeedback });
