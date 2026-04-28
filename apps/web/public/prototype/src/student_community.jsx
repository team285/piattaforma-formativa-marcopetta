// ─── STUDENTE 6: Community Hub ──────────────────────────────────────

const COMMUNITY_POSTS = [
  {
    id:"P-221",
    author:"Sara Verdi", initials:"SV", level:"Intermedio",
    time:"2 ore fa",
    exercise:"12 bar in La — pentatonica",
    title:"La mia terza take. Finalmente respira.",
    body:"Ho provato con il click sul 2 e 4 come ci ha detto Marco. È un altro pianeta. Mi sentite nel passaggio a 0:52?",
    duration:"1:48",
    listens: 14,
    claps: 9,
    replies: 4,
    weekPick: true,
    coachReply: true,
  },
  {
    id:"P-220",
    author:"Andrea Ferri", initials:"AF", level:"Avanzato",
    time:"ieri",
    exercise:"Shuffle in Mi — groove",
    title:"Shuffle lento. Cerco il groove, non la velocità.",
    body:"Prima settimana che mi tolgo dai 16mi. È più difficile di quanto pensassi stare fermo.",
    duration:"2:14",
    listens: 28,
    claps: 17,
    replies: 7,
  },
  {
    id:"P-218",
    author:"Giulia Romano", initials:"GR", level:"Intermedio",
    time:"2 giorni fa",
    exercise:"Legato — hammer & pull",
    title:"Legato tre note per corda. Aiuto sull'indice!",
    body:"Qualcuno ha trucchi per non perdere pressione sull'indice quando scendo? Io mi irrigidisco.",
    duration:"0:52",
    listens: 41,
    claps: 12,
    replies: 11,
  },
  {
    id:"P-217",
    author:"Dario Lombardi", initials:"DL", level:"Intermedio avanzato",
    time:"3 giorni fa",
    exercise:"Fraseggio dorico",
    title:"Dorico sul 6° — respirando.",
    body:"Prima volta che sento davvero il modo e non le scale. Marco aveva ragione: è una faccenda di tempo.",
    duration:"1:20",
    listens: 33,
    claps: 22,
    replies: 3,
  },
];

function StudentCommunity({ nav }) {
  const [filter, setFilter] = React.useState("all");
  const [playingId, setPlayingId] = React.useState(null);
  const [reactions, setReactions] = React.useState({}); // { postId: { claps: true } }
  const [openComment, setOpenComment] = React.useState(null);
  const [commentText, setCommentText] = React.useState("");
  const [expandedThread, setExpandedThread] = React.useState(null);

  const toggleReaction = (postId, kind) => {
    setReactions(prev => ({
      ...prev,
      [postId]: { ...(prev[postId]||{}), [kind]: !(prev[postId] && prev[postId][kind]) }
    }));
  };
  const isReacted = (postId, kind) => !!(reactions[postId] && reactions[postId][kind]);

  const postComment = (postId, authorName) => {
    if (!commentText.trim()) return;
    window.mpToast && window.mpToast("Commento pubblicato", "ok");
    setCommentText("");
    setOpenComment(null);
  };

  const filters = [
    { id:"all",     label:"Tutti" },
    { id:"week",    label:"Esercizio della settimana" },
    { id:"mine",    label:"I miei" },
    { id:"hot",     label:"Più ascoltati" },
    { id:"coach",   label:"Con risposta di Marco" },
  ];

  let displayed = COMMUNITY_POSTS;
  if (filter === "week")  displayed = COMMUNITY_POSTS.filter(p => p.weekPick);
  if (filter === "mine")  displayed = []; // no mine in mock
  if (filter === "hot")   displayed = [...COMMUNITY_POSTS].sort((a,b)=>b.listens-a.listens);
  if (filter === "coach") displayed = COMMUNITY_POSTS.filter(p => p.coachReply);

  return (
    <div className="min-h-full bg-paper fade-in">
      <div className="max-w-[1180px] mx-auto px-12 py-12">

        {/* Hero editoriale */}
        <div className="flex items-end justify-between mb-10">
          <div>
            <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-smoke mb-5">Hub · 28 studenti attivi</div>
            <h1 className="font-editorial text-[60px] max-w-[720px]">
              <span className="italic-ember">Ascoltatevi</span><br/>tra di voi.
            </h1>
            <p className="text-[15px] text-smoke max-w-[520px] mt-5 leading-relaxed">
              Tutti gli studenti di Marco condividono qui le loro take. Niente like, niente punteggi.
              Ascolti, applausi, commenti — come in una sala prove vera.
            </p>
          </div>
          <EmberButton size="lg" icon="record" onClick={()=>nav("exercise")}>Condividi la tua take</EmberButton>
        </div>

        {/* Highlight della settimana */}
        <div className="bg-ink text-paper rounded-[3px] p-8 mb-12 relative overflow-hidden">
          <div className="absolute -right-20 -bottom-20 w-80 h-80 rounded-full" style={{background:"radial-gradient(circle, rgba(242,183,68,0.25), transparent 60%)"}}/>
          <div className="relative grid grid-cols-12 gap-8 items-center">
            <div className="col-span-7">
              <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-ember mb-3 flex items-center gap-2">
                <Icon name="star" size={11}/> pick della settimana · scelta da marco
              </div>
              <div className="font-display text-3xl leading-tight mb-2">"Sara ha capito una cosa importante su questo 12 bar. <span className="italic-ember">Ascoltatela.</span>"</div>
              <div className="flex items-center gap-3 mt-5">
                <Avatar initials="SV" size={36} tone="ember"/>
                <div>
                  <div className="text-[14px] text-paper">Sara Verdi</div>
                  <div className="font-mono text-[10px] uppercase tracking-wider text-[#8A8A92]">12 bar in La · 1:48</div>
                </div>
              </div>
            </div>
            <div className="col-span-5">
              <div className="bg-ink-2 border border-line-dark rounded-[3px] p-4">
                <Waveform dark progress={0.42}/>
                <div className="flex items-center justify-between mt-3">
                  <button onClick={()=>setPlayingId(playingId==="P-221"?null:"P-221")} className="w-11 h-11 rounded-full bg-ember flex items-center justify-center text-white"><Icon name={playingId==="P-221"?"pause":"play"} size={15}/></button>
                  <div className="font-mono text-[11px] text-[#8A8A92]">{playingId==="P-221"?"00:46 / 01:48":"00:00 / 01:48"}</div>
                  <button onClick={()=>window.mpToast && window.mpToast("Apri su mobile il post di Sara", "info")} className="h-9 px-3 rounded-[2px] bg-ink-3 text-[11px] font-mono uppercase tracking-wider text-[#C9C9D0]">Apri</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filtri */}
        <div className="flex items-center gap-2 mb-8 flex-wrap border-b border-line pb-4">
          {filters.map(f=>(
            <button key={f.id} onClick={()=>setFilter(f.id)} className={"h-9 px-3.5 rounded-[2px] text-[12px] font-medium "+(filter===f.id?"bg-ink text-paper":"text-smoke hover:text-ink border border-line")}>{f.label}</button>
          ))}
          <div className="ml-auto text-[12px] text-smoke">Ordina: <span className="text-ink">più recenti</span></div>
        </div>

        {/* Feed */}
        <div className="space-y-6">
          {displayed.length === 0 && (
            <div className="text-center py-16 text-smoke text-[13px]">
              {filter==="mine" ? "Non hai ancora condiviso take. Registra la tua prima." : "Nessun post per questo filtro."}
            </div>
          )}
          {displayed.map(p=>(
            <article key={p.id} className="grid grid-cols-12 gap-6 pb-8 border-b border-line">
              {/* Autore */}
              <div className="col-span-3">
                <div className="flex items-center gap-3">
                  <Avatar initials={p.initials} size={44}/>
                  <div>
                    <div className="font-display text-xl leading-none">{p.author}</div>
                    <div className="font-mono text-[10px] uppercase tracking-wider text-smoke mt-1.5">{p.level}</div>
                    <div className="text-[12px] text-smoke mt-0.5">{p.time}</div>
                  </div>
                </div>
                {p.weekPick && (
                  <div className="inline-flex items-center gap-1.5 mt-4 font-mono text-[10px] uppercase tracking-wider text-ember">
                    <Icon name="star" size={11}/> pick di Marco
                  </div>
                )}
              </div>

              {/* Contenuto */}
              <div className="col-span-9">
                <div className="flex items-center gap-2 mb-3">
                  <Tag>{p.exercise}</Tag>
                  {p.coachReply && <Tag><span className="text-ember">marco ha risposto</span></Tag>}
                </div>
                <h3 className="font-display text-[26px] leading-[1.15] mb-2">{p.title}</h3>
                <p className="text-[14px] text-smoke leading-relaxed mb-5 max-w-[640px]">"{p.body}"</p>

                {/* Player */}
                <div className="bg-paper-2 border border-line rounded-[3px] p-4 mb-4">
                  <div className="flex items-center gap-4">
                    <button onClick={()=>setPlayingId(playingId===p.id?null:p.id)} className="w-12 h-12 rounded-full bg-ink text-paper flex items-center justify-center hover:bg-ember transition shrink-0">
                      <Icon name={playingId===p.id?"pause":"play"} size={14}/>
                    </button>
                    <div className="flex-1 min-w-0">
                      <Waveform dark={false} progress={playingId===p.id?0.32:0}/>
                    </div>
                    <div className="font-mono text-[11px] text-smoke shrink-0">{p.duration}</div>
                  </div>
                </div>

                {/* Reazioni */}
                <div className="flex items-center gap-5 text-[12px]">
                  <div className="inline-flex items-center gap-1.5 text-smoke">
                    <Icon name="eye" size={13}/>
                    <span><strong className="text-ink">{p.listens + (playingId===p.id?1:0)}</strong> ascolti</span>
                  </div>
                  <button onClick={()=>toggleReaction(p.id,"claps")} className={"inline-flex items-center gap-1.5 "+(isReacted(p.id,"claps")?"text-ember":"text-smoke hover:text-ember")}>
                    <Icon name="sparkle" size={13}/>
                    <span><strong className={isReacted(p.id,"claps")?"text-ember":"text-ink"}>{p.claps + (isReacted(p.id,"claps")?1:0)}</strong> applausi</span>
                  </button>
                  <button onClick={()=>setOpenComment(openComment===p.id?null:p.id)} className={"inline-flex items-center gap-1.5 "+(openComment===p.id?"text-ink":"text-smoke hover:text-ink")}>
                    <Icon name="chat" size={13}/>
                    <span><strong className="text-ink">{p.replies}</strong> risposte</span>
                  </button>
                  <div className="ml-auto flex items-center gap-2">
                    <button onClick={()=>window.mpToast && window.mpToast("Apri su mobile per registrare audio", "info")} className="h-8 px-3 rounded-[2px] border border-line text-[12px] text-smoke hover:text-ink">Rispondi con audio</button>
                    <button onClick={()=>setOpenComment(openComment===p.id?null:p.id)} className={"h-8 px-3 rounded-[2px] border text-[12px] "+(openComment===p.id?"border-ink text-ink bg-sand":"border-line text-smoke hover:text-ink")}>Commenta</button>
                  </div>
                </div>

                {/* Inline comment composer */}
                {openComment===p.id && (
                  <div className="mt-4 bg-paper-2 border border-line rounded-[3px] p-3 slide-up">
                    <textarea value={commentText} onChange={e=>setCommentText(e.target.value)} rows={2} placeholder={"Scrivi a "+p.author.split(" ")[0]+"…"} className="w-full bg-transparent outline-none text-[13px] resize-none placeholder:text-smoke"/>
                    <div className="flex items-center justify-end gap-2 mt-2">
                      <button onClick={()=>{setOpenComment(null); setCommentText("");}} className="h-8 px-3 text-[12px] text-smoke hover:text-ink">Annulla</button>
                      <button onClick={()=>postComment(p.id, p.author)} disabled={!commentText.trim()} className={"h-8 px-4 rounded-[2px] text-[12px] font-medium "+(commentText.trim()?"bg-ink text-paper":"bg-sand text-smoke cursor-not-allowed")}>Pubblica</button>
                    </div>
                  </div>
                )}

                {/* Thread risposte — esempio esteso solo per il primo post */}
                {p.coachReply && (
                  <div className="mt-5 pl-6 border-l-2 border-ember space-y-4">
                    <div className="flex items-start gap-3">
                      <Avatar initials="MP" size={32}/>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-display text-[15px]">Marco Petta</span>
                          <span className="font-mono text-[9px] uppercase tracking-wider bg-ember text-white px-1.5 py-0.5 rounded-[2px]">coach</span>
                          <span className="font-mono text-[10px] text-smoke">1 ora fa</span>
                        </div>
                        <p className="text-[13.5px] text-ink leading-relaxed">"Sara, il passaggio a 0:52 è tuo. Hai smesso di correre. Chi vuole capire cosa intendo, ascolti quella frase col click sotto e conti. È tutto lì."</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Avatar initials="AF" size={32} tone="sand"/>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-display text-[15px]">Andrea Ferri</span>
                          <span className="font-mono text-[10px] text-smoke">45 min fa</span>
                        </div>
                        <p className="text-[13.5px] text-ink leading-relaxed">"Te lo dico, respira proprio. Me la sono riascoltata 3 volte. Grazie Sara."</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Avatar initials="LB" size={32} tone="sand"/>
                      <div className="flex-1 bg-paper-2 border border-line rounded-[3px] p-3 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-ink text-paper flex items-center justify-center"><Icon name="play" size={12}/></div>
                        <div className="flex-1">
                          <div className="text-[12px] font-medium">Risposta audio di Luca Bianchi</div>
                          <div className="font-mono text-[10px] uppercase tracking-wider text-smoke">0:24 · 20 min fa</div>
                        </div>
                      </div>
                    </div>
                    {expandedThread===p.id ? (
                      <>
                        <div className="flex items-start gap-3">
                          <Avatar initials="GR" size={32} tone="sand"/>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-display text-[15px]">Giulia Romano</span>
                              <span className="font-mono text-[10px] text-smoke">15 min fa</span>
                            </div>
                            <p className="text-[13.5px] text-ink leading-relaxed">"Ho provato con il click sul 2 e 4. Incredibile la differenza, grazie."</p>
                          </div>
                        </div>
                        <button onClick={()=>setExpandedThread(null)} className="text-[12px] text-smoke hover:text-ink">Riduci thread ↑</button>
                      </>
                    ) : (
                      <button onClick={()=>setExpandedThread(p.id)} className="text-[12px] text-ember font-medium hover:underline">Vedi altre {p.replies-3} risposte →</button>
                    )}
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-12 bg-paper-2 border border-line rounded-[3px] p-8 text-center">
          <div className="font-display text-2xl mb-2">"Siete la mia <span className="italic-ember">sala prove</span> distribuita."</div>
          <div className="text-[13px] text-smoke mb-5">— Marco</div>
          <EmberButton icon="record" onClick={()=>nav("exercise")}>Condividi la tua take</EmberButton>
        </div>

      </div>
    </div>
  );
}

Object.assign(window, { StudentCommunity });
