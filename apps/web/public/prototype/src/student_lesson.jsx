// ─── STUDENTE 2: Lesson Player (dark) ─────────────────────────────────

function StudentLesson({ nav }) {
  const [tab,setTab] = React.useState("tab");
  const [speed,setSpeed] = React.useState("1x");
  const [loop,setLoop] = React.useState(false);
  const [playing, setPlaying] = React.useState(false);
  const [activeChapter, setActiveChapter] = React.useState(1);
  const [bookmarked, setBookmarked] = React.useState(false);
  const toggleBookmark = () => {
    setBookmarked(v => {
      window.mpToast && window.mpToast(v ? "Bookmark rimosso" : "Bookmark aggiunto al capitolo", "ok");
      return !v;
    });
  };
  const chapters = [
    { t:0.00, title:"Intro — il problema del polso" },
    { t:0.18, title:"Demo lenta a 60bpm" },
    { t:0.42, title:"Il gesto giusto — mano destra" },
    { t:0.68, title:"Errori più comuni" },
    { t:0.88, title:"Come allenarlo questa settimana" },
  ];

  return (
    <div className="min-h-full bg-ink text-paper fade-in">
      <div className="max-w-[1480px] mx-auto px-10 py-8">

        {/* breadcrumb */}
        <div className="flex items-center justify-between mb-6">
          <button onClick={()=>nav("home")} className="flex items-center gap-2 text-[13px] text-[#8A8A92] hover:text-paper">
            <Icon name="chevronl" size={14}/> Il tuo piano
          </button>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.22em] text-[#8A8A92]">
              <span>Tecnica · Modulo 2</span>
              <span>·</span>
              <span>Lezione 14 di 32</span>
            </div>
            <button onClick={toggleBookmark}
              className={"h-9 px-3 rounded-[2px] font-mono text-[10px] uppercase tracking-wider flex items-center gap-1.5 transition "+(bookmarked?"bg-ember text-white":"bg-ink-2 text-[#8A8A92] border border-line-dark hover:text-paper")}>
              <Icon name="bookmark" size={12}/> {bookmarked?"Bookmark":"Salva capitolo"}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-8">

          {/* Player */}
          <div className="col-span-8">
            <div className="relative bg-black rounded-[3px] overflow-hidden" style={{aspectRatio:"16/9"}}>
              <div className="absolute inset-0 thumb-stripe opacity-40"/>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <button onClick={()=>setPlaying(v=>!v)} className="w-20 h-20 rounded-full bg-paper/95 flex items-center justify-center text-ink mx-auto mb-4 hover:bg-ember hover:text-white transition cursor-pointer">
                    <Icon name={playing?"pause":"play"} size={24}/>
                  </button>
                  <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#8A8A92]">Marco Petta — demo HD</div>
                </div>
              </div>
              {/* Chapter markers overlay */}
              <div className="absolute bottom-3 left-4 right-4">
                <div className="relative h-1 bg-white/15 rounded-full">
                  <div className="absolute left-0 top-0 bottom-0 bg-ember rounded-full" style={{width:"38%"}}/>
                  {chapters.map((c,i)=>(
                    <div key={i} className="absolute -top-1 w-[2px] h-3 bg-paper/80" style={{left:`${c.t*100}%`}}/>
                  ))}
                </div>
              </div>
            </div>

            {/* Controlli */}
            <div className="mt-4 flex items-center gap-3 bg-ink-2 border border-line-dark rounded-[3px] p-3">
              <button onClick={()=>window.mpToast && window.mpToast("-10 sec", "info")} className="w-9 h-9 rounded-full bg-ink-3 flex items-center justify-center hover:bg-[#24242A]"><Icon name="rewind" size={14}/></button>
              <button onClick={()=>setPlaying(v=>!v)} className="w-11 h-11 rounded-full bg-ember flex items-center justify-center text-white"><Icon name={playing?"pause":"play"} size={16}/></button>
              <button onClick={()=>window.mpToast && window.mpToast("+10 sec", "info")} className="w-9 h-9 rounded-full bg-ink-3 flex items-center justify-center hover:bg-[#24242A]"><Icon name="skip" size={14}/></button>

              <div className="flex-1 mx-3">
                <div className="flex items-center justify-between text-[11px] font-mono text-[#8A8A92] mb-1.5">
                  <span>09:14</span>
                  <span>24:10</span>
                </div>
                <div className="h-[3px] w-full rounded-full bg-ink-3">
                  <div className="h-full bg-ember rounded-full" style={{width:"38%"}}/>
                </div>
              </div>

              {/* Velocità */}
              <div className="flex items-center gap-1 bg-ink-3 rounded-[3px] p-1">
                {["0.5x","0.75x","1x","1.25x"].map(s=>(
                  <button key={s} onClick={()=>setSpeed(s)} className={"px-2 h-7 font-mono text-[10px] uppercase tracking-wider rounded-[2px] "+(speed===s?"bg-ember text-white":"text-[#8A8A92] hover:text-paper")}>{s}</button>
                ))}
              </div>

              {/* Loop A-B */}
              <button onClick={()=>setLoop(!loop)} className={"h-9 px-3 rounded-[2px] font-mono text-[10px] uppercase tracking-wider flex items-center gap-1.5 "+(loop?"bg-ember text-white":"bg-ink-3 text-[#8A8A92]")}>
                <Icon name="loop" size={12}/> Loop A-B
              </button>
            </div>

            {/* Titolo + note */}
            <div className="mt-8">
              <Tag dark>Tecnica · Mano destra</Tag>
              <h1 className="font-display text-4xl mt-3 mb-5 leading-tight">Pennata alternata — <span className="italic-ember">il polso libero</span></h1>

              {/* Capitoli */}
              <div className="grid grid-cols-2 gap-x-10 gap-y-2 border-t border-line-dark pt-5">
                {chapters.map((c,i)=>{
                  const active = i===activeChapter;
                  return (
                    <button key={i} onClick={()=>{ setActiveChapter(i); setPlaying(true); }} className="flex items-center gap-4 py-1.5 group cursor-pointer text-left w-full">
                      <span className={"font-mono text-[11px] w-10 "+(active?"text-ember":"text-[#8A8A92]")}>{Math.floor(c.t*24)}:{String(Math.floor((c.t*24%1)*60)).padStart(2,'0')}</span>
                      <span className={"flex-1 text-[14px] group-hover:text-paper "+(active?"text-paper font-semibold":"text-[#C9C9D0]")}>{c.title}</span>
                      {active && <span className="w-1.5 h-1.5 rounded-full bg-ember"/>}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Footer CTA esercizio */}
            <div className="mt-10 border border-ember rounded-[3px] p-6 flex items-center justify-between bg-[rgba(242,183,68,0.06)]">
              <div>
                <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#F2B744] mb-2">Esercizio collegato · scadenza domenica</div>
                <div className="font-display text-2xl">Pennata alternata — crome a 120 bpm</div>
                <div className="text-[13px] text-[#C9C9D0] mt-1 italic">"Metronomo sul 2 e 4. Due minuti filati."</div>
              </div>
              <EmberButton icon="record" onClick={()=>nav("exercise")}>Registra il tuo video</EmberButton>
            </div>
          </div>

          {/* Sidebar tab/spartito/note */}
          <div className="col-span-4">
            <div className="flex items-center gap-1 mb-4 bg-ink-2 p-1 rounded-[3px]">
              {[
                {id:"tab",label:"Tab sincronizzata"},
                {id:"sheet",label:"Spartito"},
                {id:"notes",label:"Note"},
              ].map(t=>(
                <button key={t.id} onClick={()=>setTab(t.id)} className={"flex-1 h-8 text-[11px] font-mono uppercase tracking-wider rounded-[2px] "+(tab===t.id?"bg-ink-3 text-paper":"text-[#8A8A92]")}>{t.label}</button>
              ))}
            </div>

            {tab==="tab" && (
              <div className="bg-ink-2 border border-line-dark rounded-[3px] p-5 font-mono text-[11px] text-[#C9C9D0] leading-[2.1]">
                <div className="flex items-center justify-between mb-3 text-[10px] uppercase tracking-wider text-[#8A8A92]">
                  <span>tab · auto-scroll</span>
                  <span className="text-ember">bar 14 · 0:42</span>
                </div>
                {["e|--5--8--5--7--5--8--5--7--|","B|--5--8--5--7--5--8--5--7--|","G|--5--7--5--7--5--7--5--7--|","D|--7--7--7--7--7--7--7--7--|","A|---------------------------|","E|---------------------------|"].map((r,i)=>(
                  <div key={i} className={i===2?"text-ember":""}>{r}</div>
                ))}
                <div className="mt-6 text-[10px] uppercase tracking-wider text-[#8A8A92]">bar 15 →</div>
                {["e|--7--8--7--5--3--5--3--2--|","B|--5--5--5--3--3--3--1--1--|"].map((r,i)=>(
                  <div key={i}>{r}</div>
                ))}
              </div>
            )}

            {tab==="sheet" && (
              <div className="bg-paper-2 rounded-[3px] p-8">
                <svg viewBox="0 0 300 160" className="w-full text-ink">
                  {[0,1,2,3,4].map(i=>(<line key={i} x1="10" x2="290" y1={40+i*8} y2={40+i*8} stroke="currentColor" strokeWidth="0.6"/>))}
                  <path d="M14 56 Q18 48 22 56 T30 56" stroke="currentColor" strokeWidth="1.2" fill="none"/>
                  {[0,1,2,3,4,5,6,7].map(i=>(
                    <g key={i}><ellipse cx={50+i*28} cy={44+(i%3)*4} rx="4" ry="3" fill="currentColor"/><line x1={54+i*28} y1={44+(i%3)*4} x2={54+i*28} y2={20+(i%3)*4} stroke="currentColor" strokeWidth="1"/></g>
                  ))}
                  <line x1="280" x2="280" y1="40" y2="72" stroke="currentColor" strokeWidth="0.6"/>
                </svg>
                <div className="mt-4 font-mono text-[10px] uppercase tracking-wider text-smoke text-center">bar 14 — pennata alt. 16mi</div>
              </div>
            )}

            {tab==="notes" && (
              <div className="bg-ink-2 border border-line-dark rounded-[3px] p-5">
                <div className="text-[10px] font-mono uppercase tracking-wider text-[#8A8A92] mb-3">Le tue note · sincronizzate a 0:42</div>
                <textarea defaultValue={"polso si chiude quando accelero\nprovare a registrare con specchio\nsentire il gomito, non la spalla"} className="w-full bg-transparent text-[13px] text-[#D9D9DE] leading-relaxed focus:outline-none resize-none" rows={6}/>
                <div className="mt-3 pt-3 border-t border-line-dark flex items-center justify-between text-[11px] font-mono text-[#8A8A92]">
                  <span>salvato · 21 apr 10:14</span>
                  <button onClick={()=>window.mpToast && window.mpToast("Nota al minuto · v2", "info")} className="text-ember hover:underline">+ nota al minuto</button>
                </div>
              </div>
            )}

            {/* Risorse scaricabili */}
            <div className="mt-5 bg-ink-2 border border-line-dark rounded-[3px] p-5">
              <div className="text-[10px] font-mono uppercase tracking-wider text-[#8A8A92] mb-3">Risorse della lezione</div>
              {[
                {name:"polso-libero-tab.pdf", size:"124 kB", icon:"file"},
                {name:"backing-track-100bpm.mp3", size:"3.4 MB", icon:"music"},
                {name:"polso-libero.gp", size:"18 kB", icon:"note"},
              ].map(r=>(
                <button key={r.name} onClick={()=>window.mpToast && window.mpToast("Download: "+r.name, "ok")} className="w-full flex items-center gap-3 py-2.5 border-t border-line-dark first:border-t-0 group cursor-pointer text-left">
                  <div className="w-8 h-8 rounded-[2px] bg-ink-3 flex items-center justify-center text-[#8A8A92]"><Icon name={r.icon} size={14}/></div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] text-[#D9D9DE] truncate">{r.name}</div>
                    <div className="font-mono text-[10px] text-[#8A8A92]">{r.size}</div>
                  </div>
                  <span className="opacity-0 group-hover:opacity-100 text-ember"><Icon name="download" size={14}/></span>
                </button>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

Object.assign(window, { StudentLesson });
