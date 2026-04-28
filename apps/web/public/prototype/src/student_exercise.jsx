// ─── STUDENTE 3: Exercise Submission ──────────────────────────────────

function StudentExercise({ nav }) {
  const [mode, setMode] = React.useState("record"); // record | upload | review
  const [recording, setRecording] = React.useState(false);
  const [hasTake, setHasTake] = React.useState(false);
  const [noteText, setNoteText] = React.useState("Ho avuto difficoltà con il passaggio al 0:40 — sentivo il polso che si chiudeva.");

  return (
    <div className="min-h-full bg-paper fade-in">
      <div className="max-w-[1180px] mx-auto px-12 py-12">
        <button onClick={()=>nav("home")} className="flex items-center gap-2 text-[13px] text-smoke hover:text-ink mb-8">
          <Icon name="chevronl" size={14}/> Torna al piano
        </button>

        <div className="grid grid-cols-12 gap-10">
          {/* Istruzioni esercizio */}
          <div className="col-span-5">
            <Tag>Esercizio · E-229</Tag>
            <h1 className="font-display text-[44px] leading-[1.05] mt-4 mb-5">
              Pennata alternata — <span className="italic-ember">crome a 120 bpm</span>
            </h1>

            <div className="flex items-center gap-4 mb-8 text-sm">
              <span className="inline-flex items-center gap-1.5 text-smoke"><Icon name="clock" size={14}/> Entro <strong className="text-ink">domenica 26 apr</strong></span>
              <span className="inline-flex items-center gap-1.5 text-smoke"><Icon name="speed" size={14}/> <strong className="text-ink">120 bpm</strong></span>
            </div>

            <div className="border-l-2 border-ember pl-5 mb-8">
              <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-ember mb-2">Istruzioni di Marco</div>
              <p className="text-[15px] leading-[1.65] text-ink mb-3">
                "Luca, voglio due minuti filati di crome pulite. Metronomo sul 2 e 4, non sul 1. Se senti che il polso si blocca, <em>fermati</em> e ricomincia."
              </p>
              <p className="text-[15px] leading-[1.65] text-ink">
                "Riprenditi la mano destra in primo piano. Voglio vedere il gesto, non la faccia."
              </p>
            </div>

            <div className="bg-paper-2 border border-line rounded-[3px] overflow-hidden mb-4">
              <button onClick={()=>window.mpToast && window.mpToast("Riproduci video-esempio", "info")} className="block w-full text-left">
                <Thumb label="video-esempio · marco · 1:24" dark aspect="16/9">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-14 h-14 rounded-full bg-paper/95 flex items-center justify-center text-ink"><Icon name="play" size={18}/></div>
                  </div>
                </Thumb>
              </button>
              <div className="px-4 py-3 flex items-center justify-between">
                <div className="text-[12px] text-smoke">Video-esempio di Marco</div>
                <button onClick={()=>window.mpToast && window.mpToast("Apertura HD · v2", "info")} className="text-[12px] text-ember font-medium hover:underline">Apri in HD</button>
              </div>
            </div>
          </div>

          {/* Area registrazione */}
          <div className="col-span-7">
            {/* Toggle modalità */}
            <div className="flex items-center gap-1 bg-paper-2 border border-line p-1 rounded-[3px] w-fit mb-4">
              {[
                {id:"record", label:"Registra dal browser", icon:"record"},
                {id:"upload", label:"Carica un file", icon:"upload"},
              ].map(m=>(
                <button key={m.id} onClick={()=>{setMode(m.id); setHasTake(false); setRecording(false);}} className={"h-9 px-4 rounded-[2px] flex items-center gap-2 text-[12px] font-medium "+(mode===m.id?"bg-ink text-paper":"text-smoke hover:text-ink")}>
                  <Icon name={m.icon} size={13}/> {m.label}
                </button>
              ))}
            </div>

            {/* Viewport registrazione */}
            <div className="relative bg-ink rounded-[3px] overflow-hidden" style={{aspectRatio:"16/9"}}>
              <div className="absolute inset-0 thumb-stripe opacity-30"/>

              {mode==="record" && !hasTake && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-paper">
                  {recording ? (
                    <>
                      <div className="flex items-center gap-2 mb-5 font-mono text-[11px] uppercase tracking-[0.2em] text-ember">
                        <span className="w-2 h-2 rounded-full bg-ember animate-pulse"/> REC · 00:47
                      </div>
                      <div className="font-display text-3xl mb-2">Sto registrando</div>
                      <div className="text-[13px] text-[#8A8A92] mb-6">Metronomo attivo · 120 bpm · click sul 2 e 4</div>
                      <Waveform progress={0.4} dark/>
                      <button onClick={()=>{setRecording(false); setHasTake(true);}} className="mt-6 w-16 h-16 rounded-full bg-ember flex items-center justify-center rec-pulse">
                        <div className="w-5 h-5 bg-white rounded-[2px]"/>
                      </button>
                      <div className="text-[11px] uppercase tracking-wider font-mono text-[#8A8A92] mt-3">Stop · spazio</div>
                    </>
                  ) : (
                    <>
                      <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#8A8A92] mb-5">Webcam + microfono pronti</div>
                      <div className="font-display text-3xl mb-8">Quando sei <span className="italic-ember">pronto</span>, premi il cerchio.</div>
                      <button onClick={()=>setRecording(true)} className="w-20 h-20 rounded-full bg-ember flex items-center justify-center rec-pulse hover:scale-105 transition">
                        <div className="w-6 h-6 bg-white rounded-full"/>
                      </button>
                      <div className="mt-4 flex items-center gap-5 text-[11px] font-mono uppercase tracking-wider text-[#8A8A92]">
                        <span><Icon name="video" size={11} className="inline mr-1"/>webcam hd</span>
                        <span><Icon name="mic" size={11} className="inline mr-1"/>audio stereo</span>
                        <span>click 120 bpm</span>
                      </div>
                    </>
                  )}
                </div>
              )}

              {mode==="upload" && !hasTake && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-paper">
                  <div className="w-16 h-16 rounded-full border-2 border-dashed border-[#8A8A92] flex items-center justify-center mb-5">
                    <Icon name="upload" size={22} className="text-[#8A8A92]"/>
                  </div>
                  <div className="font-display text-2xl mb-2">Trascina qui il tuo video</div>
                  <div className="text-[13px] text-[#8A8A92]">o <button onClick={()=>setHasTake(true)} className="text-ember underline">scegli un file</button> · max 500MB · mp4/mov</div>
                </div>
              )}

              {hasTake && (
                <div className="absolute inset-0 flex items-center justify-center text-paper">
                  <div className="text-center">
                    <button onClick={()=>window.mpToast && window.mpToast("Anteprima take_01", "info")} className="w-16 h-16 rounded-full bg-paper/95 flex items-center justify-center text-ink mx-auto mb-4 cursor-pointer hover:scale-105 transition"><Icon name="play" size={20}/></button>
                    <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#8A8A92]">take_01 · 2:04</div>
                  </div>
                </div>
              )}
            </div>

            {/* Preview controls */}
            {hasTake && (
              <div className="mt-3 flex items-center justify-between bg-paper-2 border border-line rounded-[3px] px-4 py-3 slide-up">
                <div className="flex items-center gap-3">
                  <Icon name="check" size={15} className="text-[#7BB07B]"/>
                  <span className="text-[13px]">Take pronto · 2:04 · 84MB</span>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={()=>{setHasTake(false); setRecording(false);}} className="h-8 px-3 text-[12px] text-smoke hover:text-ink inline-flex items-center gap-1.5"><Icon name="record" size={12}/> Rifai</button>
                  <button onClick={()=>window.mpToast && window.mpToast("Anteprima take_01", "info")} className="h-8 px-3 text-[12px] text-ember font-medium hover:underline">Anteprima</button>
                </div>
              </div>
            )}

            {/* Nota per Marco */}
            <div className="mt-6">
              <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-smoke mb-2">Nota per Marco (facoltativa)</div>
              <textarea value={noteText} onChange={e=>setNoteText(e.target.value)} rows={3}
                className="w-full bg-paper-2 border border-line rounded-[3px] p-4 text-[14px] leading-relaxed text-ink focus:outline-none focus:border-ink resize-none"/>
            </div>

            {/* Invia */}
            <div className="mt-5 flex items-center justify-between">
              <div className="text-[12px] text-smoke">Marco riceve una notifica. Di solito risponde entro 24h.</div>
              <EmberButton size="lg" icon="send" disabled={!hasTake} onClick={()=>{ window.mpToast && window.mpToast("Take inviato a Marco", "ok"); setTimeout(()=>nav("home"), 500); }}>
                Invia a Marco
              </EmberButton>
            </div>
          </div>
        </div>

        {/* Storico */}
        <div className="mt-20 border-t border-line pt-10">
          <EditorialH kicker="Le tue submissions precedenti">
            Tutto quello che hai <span className="italic-ember">mandato</span> finora.
          </EditorialH>
          <div className="mt-6 grid grid-cols-3 gap-4">
            {window.PAST_SUBMISSIONS.map(s=>(
              <button key={s.id} onClick={()=> s.status==="feedback" ? nav("feedback") : window.mpToast && window.mpToast("Submission: "+s.title+" · "+s.status, "info")} className="text-left bg-paper-2 border border-line rounded-[3px] p-5 hover:border-ink transition">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-mono text-[10px] uppercase tracking-wider text-smoke">{s.id} · {s.date}</span>
                  <StatusPill status={s.status}/>
                </div>
                <div className="font-display text-xl leading-tight">{s.title}</div>
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

Object.assign(window, { StudentExercise });
