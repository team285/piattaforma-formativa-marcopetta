// ─── STUDENTE 1: Home "Il tuo piano della settimana" ──────────────────

function StudentHome({ nav }) {
  const lessons = window.LESSONS_THIS_WEEK;
  const exercises = window.EXERCISES_THIS_WEEK;
  const hasNewFb = exercises.some(e=>e.newFeedback);

  return (
    <div className="min-h-full bg-paper fade-in">
      <div className="max-w-[1180px] mx-auto px-12 py-14">

        {/* Intestazione editoriale */}
        <div className="flex items-start justify-between mb-16">
          <div>
            <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-smoke mb-5">
              Martedì 21 aprile · settimana 3 di 26
            </div>
            <h1 className="font-editorial text-[64px] max-w-[780px]">
              Ciao Luca. Ecco cosa <span className="italic-ember text-[64px]">senti</span>
              <br/>questa <span className="italic-ember text-[64px]">settimana</span>.
            </h1>
          </div>
          {hasNewFb && (
            <button onClick={()=>nav("feedback")} className="group flex items-center gap-3 bg-ember text-white px-4 h-11 rounded-[2px] hover:bg-[var(--ember-2)] transition">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full rounded-full bg-white opacity-60 animate-ping"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
              </span>
              <span className="font-medium text-[13px]">Nuovo feedback da Marco</span>
              <Icon name="arrow" size={15}/>
            </button>
          )}
        </div>

        {/* Card percorso attivo */}
        <div className="bg-ink text-paper rounded-[3px] p-8 mb-14 relative overflow-hidden">
          <div className="absolute -right-24 -top-24 w-80 h-80 rounded-full" style={{background:"radial-gradient(circle, rgba(242,183,68,0.25), transparent 60%)"}}/>
          <div className="relative grid grid-cols-12 gap-8">
            <div className="col-span-5">
              <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#8A8A92] mb-3">Percorso attivo</div>
              <div className="font-display text-3xl leading-tight mb-1">Linguaggio & <span className="italic-ember">Tempo</span></div>
              <div className="text-sm text-[#C9C9D0]">6 mesi · one-to-one con Marco Petta</div>
            </div>
            <div className="col-span-3">
              <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#8A8A92] mb-3">Attivo fino al</div>
              <div className="font-display text-2xl">14 ott 2026</div>
              <div className="text-sm text-[#C9C9D0]">— 172 giorni residui</div>
            </div>
            <div className="col-span-4">
              <div className="flex items-center justify-between mb-3">
                <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#8A8A92]">Mese 3 di 6</span>
                <span className="font-mono text-[11px] text-[#C9C9D0]">42%</span>
              </div>
              <div className="h-[3px] w-full bg-[#3A2E27] rounded-full overflow-hidden">
                <div className="h-full bg-ember" style={{width:"42%"}}/>
              </div>
              <div className="flex items-center gap-6 mt-5 text-xs text-[#C9C9D0]">
                <div><span className="text-paper font-medium">14</span> lezioni ricevute</div>
                <div><span className="text-paper font-medium">11</span> esercizi inviati</div>
                <div><span className="text-paper font-medium">8</span> feedback</div>
              </div>
            </div>
          </div>
        </div>

        {/* Assegnato questa settimana */}
        <div className="mb-6 flex items-end justify-between">
          <EditorialH kicker="Questa settimana Marco ti ha assegnato">
            Tre <span className="italic-ember">lezioni</span>, due <span className="italic-ember">esercizi</span>.
          </EditorialH>
          <div className="text-sm text-smoke max-w-[280px] text-right">
            Niente catalogo. Quello che vedi qui è quello che Marco vuole che tu faccia adesso.
          </div>
        </div>

        {/* Griglia lezioni */}
        <div className="grid grid-cols-3 gap-5 mb-14">
          {lessons.map((l,i)=>(
            <button key={l.id} onClick={()=>nav("lesson")} className="text-left group">
              <div className="relative">
                <Thumb label={`lezione · ${l.duration}`} dark={true} aspect="16/10">
                  {l.status==="in-progress" && (
                    <div className="absolute bottom-0 left-0 h-0.5 bg-ember" style={{width:`${(l.progress||0)*100}%`}}/>
                  )}
                  <div className="absolute top-3 right-3">
                    <div className="w-10 h-10 rounded-full bg-paper/95 flex items-center justify-center text-ink group-hover:bg-ember group-hover:text-white transition">
                      <Icon name="play" size={14}/>
                    </div>
                  </div>
                </Thumb>
              </div>
              <div className="mt-4 flex items-center gap-2 mb-1.5">
                <StatusPill status={l.status}/>
                <span className="font-mono text-[10px] uppercase tracking-wider text-smoke">{l.chapter}</span>
              </div>
              <div className="font-display text-[22px] leading-[1.15] mb-2">{l.title}</div>
              <div className="text-[13px] text-smoke italic leading-snug">"{l.note}"</div>
            </button>
          ))}
        </div>

        {/* Esercizi */}
        <div className="border-t border-line pt-10">
          <div className="flex items-end justify-between mb-6">
            <EditorialH kicker="Esercizi">
              Due cose da <span className="italic-ember">registrare</span>.
            </EditorialH>
          </div>

          <div className="grid grid-cols-2 gap-5">
            {exercises.map(ex=>(
              <button key={ex.id} onClick={()=> ex.status==="feedback" ? nav("feedback") : nav("exercise") } className="text-left bg-paper-2 border border-line rounded-[3px] p-6 hover:border-[var(--ink)] transition relative">
                {ex.newFeedback && <div className="absolute top-5 right-5 w-2 h-2 rounded-full bg-ember"/>}
                <div className="flex items-center gap-2 mb-3">
                  <StatusPill status={ex.status}/>
                  <Tag>bpm {ex.bpm}</Tag>
                </div>
                <div className="font-display text-2xl leading-[1.15] mb-3">{ex.title}</div>
                <div className="text-[13px] text-smoke italic mb-4">"{ex.note}"</div>
                <div className="flex items-center justify-between text-[12px] pt-3 border-t border-line">
                  <span className="font-mono uppercase tracking-wider text-smoke">Entro {ex.due}</span>
                  <span className="inline-flex items-center gap-1 text-ink font-medium">
                    {ex.status==="feedback" ? "Vedi feedback" : "Registra"} <Icon name="chevron" size={12}/>
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

Object.assign(window, { StudentHome });
