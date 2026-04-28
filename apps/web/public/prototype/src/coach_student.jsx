// ─── COACH 7: Student Detail + Assign Flow ───────────────────────────

function CoachStudent({ nav }) {
  const [tab, setTab] = React.useState("plan");
  const [cart, setCart] = React.useState([
    { id:"L-040", title:"Le note blu — il 5♭ che racconta", due:"ven 24 apr", note:"Dopo la pentatonica." },
    { id:"L-060", title:"Click sul 2 e 4", due:"dom 26 apr", note:"Fondamentale prima del prossimo esercizio." },
  ]);
  const [expanded, setExpanded] = React.useState({C1:true, C2:true, M21:true});
  const [search, setSearch] = React.useState("");

  const toggle = (id) => setExpanded(e => ({...e, [id]: !e[id]}));
  const addToCart = (l) => {
    if (!cart.find(c=>c.id===l.id)) {
      setCart([...cart, {id:l.id, title:l.title, due:"dom 26 apr", note:""}]);
      window.mpToast && window.mpToast("Aggiunto: "+l.title, "ok");
    } else {
      window.mpToast && window.mpToast("Già in coda", "info");
    }
  };
  const removeCart = (id) => setCart(cart.filter(c=>c.id!==id));
  const clearCart = () => { if (cart.length){ setCart([]); window.mpToast && window.mpToast("Coda svuotata", "info"); } };
  const assignCart = () => {
    if (!cart.length) { window.mpToast && window.mpToast("Coda vuota", "warn"); return; }
    window.mpToast && window.mpToast("Assegnate "+cart.length+" lezioni a Luca", "ok");
    setCart([]);
  };
  const [radarFlash, setRadarFlash] = React.useState(false);
  const refreshRadar = () => {
    setRadarFlash(true);
    window.mpToast && window.mpToast("Mappa aggiornata", "ok");
    setTimeout(()=>setRadarFlash(false), 600);
  };

  const radar = window.SKILLS_RADAR;

  return (
    <div className="min-h-full bg-paper fade-in">
      <div className="max-w-[1400px] mx-auto px-10 py-8">
        <button onClick={()=>nav("students")} className="flex items-center gap-2 text-[13px] text-smoke hover:text-ink mb-6">
          <Icon name="chevronl" size={14}/> Studenti
        </button>

        {/* Header studente */}
        <div className="flex items-start gap-6 pb-8 border-b border-line">
          <Avatar initials="LB" size={88} tone="ink"/>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="font-editorial text-[44px]">Luca Bianchi</h1>
              <Tag>attivo</Tag>
            </div>
            <div className="flex items-center gap-5 text-sm text-smoke">
              <span>Chitarra elettrica</span><span>·</span>
              <span>Intermedio avanzato</span><span>·</span>
              <span>Percorso <strong className="text-ink">6 mesi</strong> · fino al <strong className="text-ink">14 ott 2026</strong></span>
            </div>
            <div className="mt-5 grid grid-cols-4 gap-6 max-w-[720px]">
              {[["Lezioni ricevute","14"],["Esercizi inviati","11"],["Video-risposte","3"],["Settimane consecutive","7"]].map(([k,v])=>(
                <div key={k}>
                  <div className="font-mono text-[10px] uppercase tracking-wider text-smoke">{k}</div>
                  <div className="font-display text-2xl mt-1">{v}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <EmberButton icon="chat" onClick={()=>nav("chat")}>Scrivi a Luca</EmberButton>
            <button onClick={()=>window.mpToast && window.mpToast("Profilo completo · in arrivo", "info")} className="h-10 px-4 border border-line rounded-[2px] text-[13px] text-smoke hover:text-ink">Vedi profilo</button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 mt-6 mb-6 border-b border-line">
          {[["plan","Piano corrente"],["history","Storico"],["notes","Note private"]].map(([id,l])=>(
            <button key={id} onClick={()=>setTab(id)} className={"h-11 px-5 text-[13px] font-medium -mb-px "+(tab===id?"border-b-2 border-ink text-ink":"text-smoke hover:text-ink")}>{l}</button>
          ))}
        </div>

        {tab==="plan" && (
          <div className="grid grid-cols-12 gap-8">
            {/* Col: piano assegnato */}
            <div className="col-span-5">
              <EditorialH kicker="Assegnato questa settimana">Cosa sta <span className="italic-ember">facendo</span> Luca</EditorialH>
              <div className="mt-5 space-y-3">
                {window.LESSONS_THIS_WEEK.slice(0,3).map(l=>(
                  <div key={l.id} className="bg-paper-2 border border-line rounded-[3px] p-4 flex items-center gap-4">
                    <Thumb label={l.duration} dark aspect="16/9" className="w-28 flex-shrink-0"/>
                    <div className="flex-1 min-w-0">
                      <div className="text-[14px] font-medium truncate">{l.title}</div>
                      <div className="font-mono text-[10px] text-smoke uppercase tracking-wider mt-1">{l.chapter}</div>
                    </div>
                    <StatusPill status={l.status}/>
                  </div>
                ))}
                {window.EXERCISES_THIS_WEEK.map(e=>(
                  <div key={e.id} className="border border-dashed border-[#C9BEAE] rounded-[3px] p-4 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-[2px] bg-sand flex items-center justify-center text-ink"><Icon name="record" size={14}/></div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[14px] font-medium truncate">{e.title}</div>
                      <div className="font-mono text-[10px] text-smoke uppercase tracking-wider mt-1">Esercizio · entro {e.due}</div>
                    </div>
                    <StatusPill status={e.status}/>
                  </div>
                ))}
              </div>

              {/* Radar */}
              <div className="mt-10 bg-ink text-paper rounded-[3px] p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#9E8E82] mb-1">Mappa competenze</div>
                    <div className="font-display text-2xl">La sua <span className="italic-ember">geografia</span></div>
                  </div>
                  <button onClick={refreshRadar} className="text-[11px] font-mono uppercase tracking-wider text-ember hover:underline">Aggiorna</button>
                </div>
                <div style={{transition:"opacity 0.3s", opacity:radarFlash?0.4:1}}>
                  <SkillRadar data={radar}/>
                </div>
              </div>
            </div>

            {/* Col: assegna nuovi contenuti */}
            <div className="col-span-7">
              <div className="bg-paper-2 border border-line rounded-[3px] p-6">
                <div className="flex items-center justify-between mb-4">
                  <EditorialH kicker="Assegna nuovi contenuti">Monta la <span className="italic-ember">settimana</span></EditorialH>
                  <span className="font-mono text-[10px] uppercase tracking-wider text-smoke">30 secondi e sei fuori</span>
                </div>

                <div className="grid grid-cols-2 gap-5 mt-5">
                  {/* Libreria */}
                  <div>
                    <div className="relative mb-3">
                      <Icon name="search" size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-smoke"/>
                      <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Cerca lezioni, tag, tecniche…" className="w-full h-10 pl-9 pr-3 bg-paper border border-line rounded-[2px] text-[13px] focus:outline-none focus:border-ink"/>
                    </div>
                    <div className="max-h-[480px] overflow-y-auto no-scrollbar border border-line rounded-[2px] bg-paper">
                      {window.LIBRARY_TREE.map(c=>(
                        <div key={c.id}>
                          <button onClick={()=>toggle(c.id)} className="w-full flex items-center gap-2 px-3 h-9 text-left hover:bg-sand">
                            <Icon name={expanded[c.id]?"chevrond":"chevron"} size={12}/>
                            <Icon name="folder" size={13} className="text-ember"/>
                            <span className="text-[13px] font-medium">{c.title}</span>
                          </button>
                          {expanded[c.id] && c.modules.map(m=>(
                            <div key={m.id}>
                              <button onClick={()=>toggle(m.id)} className="w-full flex items-center gap-2 pl-8 pr-3 h-8 text-left hover:bg-sand">
                                <Icon name={expanded[m.id]?"chevrond":"chevron"} size={11}/>
                                <span className="text-[12px] text-smoke">{m.title}</span>
                                <span className="ml-auto font-mono text-[10px] text-smoke">{m.lessons.length}</span>
                              </button>
                              {expanded[m.id] && m.lessons.map(l=>(
                                <button key={l.id} onClick={()=>addToCart(l)} className="w-full flex items-center gap-2 pl-12 pr-3 h-8 text-left hover:bg-sand group">
                                  <Icon name="video" size={11} className="text-smoke"/>
                                  <span className="text-[12px] text-ink truncate flex-1">{l.title}</span>
                                  <span className="font-mono text-[10px] text-smoke group-hover:hidden">{l.duration}</span>
                                  <Icon name="plus" size={12} className="text-ember hidden group-hover:block"/>
                                </button>
                              ))}
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Cart */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-smoke">In assegnazione ({cart.length})</div>
                      <button onClick={clearCart} className="font-mono text-[10px] uppercase tracking-wider text-smoke hover:text-ink">svuota</button>
                    </div>
                    <div className="space-y-2">
                      {cart.length===0 && (
                        <div className="border border-dashed border-line rounded-[2px] p-6 text-center text-[13px] text-smoke">
                          Trascina o clicca una lezione a sinistra per aggiungerla.
                        </div>
                      )}
                      {cart.map(c=>(
                        <div key={c.id} className="bg-paper border border-line rounded-[2px] p-3">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div className="text-[13px] font-medium leading-snug flex-1">{c.title}</div>
                            <button onClick={()=>removeCart(c.id)} className="text-smoke hover:text-ink"><Icon name="x" size={12}/></button>
                          </div>
                          <div className="flex items-center gap-2 mb-2">
                            <div className="flex items-center gap-1.5 border border-line rounded-[2px] px-2 h-7 text-[11px] text-smoke">
                              <Icon name="calendar" size={11}/> {c.due}
                            </div>
                            <div className="flex items-center gap-1.5 border border-line rounded-[2px] px-2 h-7 text-[11px] text-smoke">
                              <Icon name="tag" size={11}/> priorità
                            </div>
                          </div>
                          <input defaultValue={c.note} placeholder="Nota per Luca…" className="w-full h-8 px-2 border border-line rounded-[2px] text-[12px] focus:outline-none focus:border-ink"/>
                        </div>
                      ))}
                    </div>

                    <div className="mt-4 pt-4 border-t border-line flex items-center justify-between">
                      <div className="text-[12px] text-smoke">Luca riceverà una notifica subito.</div>
                    </div>
                    <EmberButton size="lg" full icon="send" onClick={assignCart}>Assegna a Luca ({cart.length})</EmberButton>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {tab==="history" && (
          <div className="grid grid-cols-3 gap-4">
            {[
              { m:"Feb 2026", items:[
                { t:"Accordi aperti · pulizia", s:"consegnato · feedback · 3.2" },
                { t:"Muting palmo base", s:"consegnato · feedback · 3.5" },
                { t:"Barré F — prima settimana", s:"consegnato · feedback · 2.9" },
              ]},
              { m:"Mar 2026", items:[
                { t:"Pennata alt. crome 90bpm", s:"consegnato · feedback · 3.4" },
                { t:"Arpeggi Cmaj7 · legato", s:"consegnato · feedback · 3.8" },
                { t:"Shuffle in Mi — groove", s:"consegnato · feedback · 3.6" },
                { t:"Legato 3 note per corda", s:"consegnato · feedback · 3.9" },
              ]},
              { m:"Apr 2026", items:[
                { t:"Arpeggi Dm7 / G7", s:"consegnato · feedback · 4.0" },
                { t:"Shuffle lento a 70bpm", s:"consegnato · feedback · 3.7" },
                { t:"12 bar in La — pentatonica", s:"feedback in corso" },
                { t:"Pennata alt. crome 120bpm", s:"in assegnazione" },
              ]},
            ].map(col=>(
              <div key={col.m} className="bg-paper-2 border border-line rounded-[3px] p-5">
                <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-smoke mb-4">{col.m}</div>
                {col.items.map((it,i)=>(
                  <div key={i} className="py-2 border-t border-line first:border-t-0">
                    <div className="text-[13px]">{it.t}</div>
                    <div className="font-mono text-[10px] text-smoke uppercase tracking-wider mt-0.5">{it.s}</div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}

        {tab==="notes" && (
          <div className="bg-paper-2 border border-line rounded-[3px] p-6 max-w-3xl">
            <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-smoke mb-3">Solo tu vedi queste note</div>
            <textarea defaultValue={"Luca ha un problema di tensione nel polso destro quando accelera. Capire se è solo tecnica o anche respirazione.\n\nAmmira Nuno Bettencourt — possiamo costruire un arco su quel vocabolario.\n\nPer il mese 4: spingere più sul tempo, meno sulla tecnica.\nOk a video-risposte settimanali, lui le apprezza."} rows={10} className="w-full bg-transparent text-[14px] leading-[1.7] focus:outline-none resize-none"/>
          </div>
        )}

      </div>
    </div>
  );
}

// Radar SVG
function SkillRadar({ data }) {
  const N = data.length;
  const cx=140, cy=140, R=100;
  const pt = (i, v) => {
    const a = (Math.PI*2*i)/N - Math.PI/2;
    const r = (v/5)*R;
    return [cx + Math.cos(a)*r, cy + Math.sin(a)*r];
  };
  const poly = data.map((d,i)=>pt(i,d.value).join(",")).join(" ");
  return (
    <svg viewBox="0 0 280 280" className="w-full">
      {[1,2,3,4,5].map(lvl=>{
        const pp = data.map((_,i)=>pt(i,lvl).join(",")).join(" ");
        return <polygon key={lvl} points={pp} fill="none" stroke="#3A2E27" strokeWidth="0.8"/>;
      })}
      {data.map((d,i)=>{
        const [x,y] = pt(i,5);
        return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="#3A2E27" strokeWidth="0.6"/>;
      })}
      <polygon points={poly} fill="rgba(242,183,68,0.25)" stroke="#F2B744" strokeWidth="1.5"/>
      {data.map((d,i)=>{
        const [x,y] = pt(i,5);
        const dx = x-cx, dy = y-cy;
        const ox = x + dx*0.15, oy = y + dy*0.15;
        return (
          <g key={i}>
            <circle cx={pt(i,d.value)[0]} cy={pt(i,d.value)[1]} r="3" fill="#F2B744"/>
            <text x={ox} y={oy+4} fill="#C9BDB1" fontSize="10" fontFamily="JetBrains Mono" textAnchor="middle" style={{textTransform:"uppercase",letterSpacing:"0.15em"}}>{d.label}</text>
          </g>
        );
      })}
    </svg>
  );
}

Object.assign(window, { CoachStudent, SkillRadar });
