// ─── COACH 8: Library Manager ────────────────────────────────────────

function CoachLibrary({ nav }) {
  const [view, setView] = React.useState("grid");
  const [expanded, setExpanded] = React.useState({C1:true, C2:true, M11:true, M21:true});
  const [selected, setSelected] = React.useState("M11");
  const [search, setSearch] = React.useState("");
  const [activeFilter, setActiveFilter] = React.useState(null);

  const toggle = (id) => setExpanded(e => ({...e, [id]: !e[id]}));

  // flatten lessons of selected module for the grid
  const tree = window.LIBRARY_TREE;
  let gridLessons = [];
  let selectedModuleTitle = "";
  tree.forEach(c => c.modules.forEach(m => {
    if (m.id === selected) { gridLessons = m.lessons; selectedModuleTitle = m.title; }
  }));
  if (gridLessons.length === 0) {
    tree.forEach(c => c.modules.forEach(m => gridLessons = gridLessons.concat(m.lessons)));
    selectedModuleTitle = "Tutte";
  }
  const q = search.trim().toLowerCase();
  if (q) gridLessons = gridLessons.filter(l => (l.title||"").toLowerCase().includes(q));

  const totalLessons = tree.reduce((acc,c)=>acc+c.modules.reduce((a,m)=>a+m.lessons.length,0),0);

  return (
    <div className="min-h-full bg-paper fade-in">
      <div className="max-w-[1400px] mx-auto px-10 py-8">
        <div className="flex items-end justify-between mb-2">
          <EditorialH kicker="La tua libreria">L'<span className="italic-ember">IP</span> di Marco</EditorialH>
          <EmberButton icon="plus" onClick={()=>window.mpToast && window.mpToast("Upload · in arrivo (richiede backend)", "info")}>Carica nuova lezione</EmberButton>
        </div>
        <div className="inline-flex items-center gap-2 mt-3 mb-8 bg-[rgba(219,85,35,0.08)] border border-[rgba(219,85,35,0.3)] rounded-[2px] px-3 py-1.5">
          <Icon name="warning" size={12} className="text-ember"/>
          <span className="font-mono text-[10px] uppercase tracking-wider text-ember">v1 — struttura da finalizzare con Marco</span>
        </div>

        {/* Filtri */}
        <div className="flex items-center gap-2 mb-6 flex-wrap">
          <div className="relative flex-1 min-w-[260px] max-w-[360px]">
            <Icon name="search" size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-smoke"/>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder={`Cerca in ${totalLessons} lezioni…`} className="w-full h-10 pl-9 pr-3 bg-paper-2 border border-line rounded-[2px] text-[13px] focus:outline-none focus:border-ink"/>
            {search && <button onClick={()=>setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-smoke hover:text-ink"><Icon name="x" size={12}/></button>}
          </div>
          {["Tecnica","Livello","Stile","Durata","Tag"].map(f=>{
            const active = activeFilter===f;
            return (
              <button key={f} onClick={()=>{ setActiveFilter(active?null:f); if (!active) window.mpToast && window.mpToast("Filtro "+f+" · v2", "info"); }} className={"h-10 px-3 border rounded-[2px] text-[12px] inline-flex items-center gap-1.5 "+(active?"border-ink text-ink bg-sand":"border-line text-smoke hover:text-ink")}>{f} <Icon name="chevrond" size={11}/></button>
            );
          })}
          <div className="ml-auto flex items-center gap-1 bg-paper-2 border border-line rounded-[2px] p-1">
            <button onClick={()=>setView("grid")} className={"w-8 h-8 rounded-[2px] "+(view==="grid"?"bg-ink text-paper":"text-smoke")}><Icon name="grid" size={13} className="mx-auto"/></button>
            <button onClick={()=>setView("list")} className={"w-8 h-8 rounded-[2px] "+(view==="list"?"bg-ink text-paper":"text-smoke")}><Icon name="list" size={13} className="mx-auto"/></button>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-6">
          {/* Tree */}
          <div className="col-span-3">
            <div className="bg-paper-2 border border-line rounded-[3px] p-3 sticky top-6">
              <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-smoke px-2 py-2 flex items-center justify-between">
                <span>Struttura</span><button onClick={()=>window.mpToast && window.mpToast("Nuovo modulo · in arrivo", "info")} className="text-ember"><Icon name="plus" size={11}/></button>
              </div>
              {tree.map(c=>(
                <div key={c.id}>
                  <button onClick={()=>toggle(c.id)} className="w-full flex items-center gap-2 px-2 h-8 text-left hover:bg-sand rounded-[2px]">
                    <Icon name={expanded[c.id]?"chevrond":"chevron"} size={11}/>
                    <Icon name="folder" size={13} className="text-ember"/>
                    <span className="text-[13px] font-medium">{c.title}</span>
                    <span className="ml-auto font-mono text-[10px] text-smoke">{c.modules.reduce((a,m)=>a+m.lessons.length,0)}</span>
                  </button>
                  {expanded[c.id] && c.modules.map(m=>(
                    <div key={m.id}>
                      <button onClick={()=>setSelected(m.id)} className={"w-full flex items-center gap-2 pl-7 pr-2 h-8 text-left rounded-[2px] "+(selected===m.id?"bg-ink text-paper":"hover:bg-sand")}>
                        <Icon name="folder" size={11}/>
                        <span className="text-[12px] truncate">{m.title}</span>
                        <span className={"ml-auto font-mono text-[10px] "+(selected===m.id?"text-[#9E8E82]":"text-smoke")}>{m.lessons.length}</span>
                      </button>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Grid lezioni */}
          <div className="col-span-9">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-smoke">{gridLessons.length} lezioni</div>
                <div className="font-display text-2xl">{selectedModuleTitle}</div>
              </div>
              <div className="text-[12px] text-smoke">Ordina: <span className="text-ink">aggiunta di recente</span></div>
            </div>

            {gridLessons.length === 0 && (
              <div className="bg-paper-2 border border-line rounded-[3px] p-10 text-center text-smoke text-[13px]">Nessuna lezione trovata per "{search}".</div>
            )}
            {view==="grid" ? (
              <div className="grid grid-cols-3 gap-4">
                {gridLessons.map(l=>(
                  <div key={l.id} onClick={()=>window.mpToast && window.mpToast("Anteprima: "+l.title, "info")} className="group cursor-pointer">
                    <Thumb label={`lezione · ${l.duration}`} dark aspect="16/10">
                      <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-paper/95 flex items-center justify-center text-ink opacity-0 group-hover:opacity-100 transition"><Icon name="play" size={12}/></div>
                    </Thumb>
                    <div className="mt-3 flex items-center justify-between mb-1">
                      <Tag>tecnica</Tag>
                      <span className="font-mono text-[10px] text-smoke flex items-center gap-1"><Icon name="eye" size={10}/> {l.views}</span>
                    </div>
                    <div className="font-display text-[18px] leading-tight mb-1">{l.title}</div>
                    <div className="flex items-center gap-2 font-mono text-[10px] text-smoke uppercase tracking-wider">
                      <span>{l.duration}</span><span>·</span><span>HD</span><span>·</span><button onClick={(e)=>{e.stopPropagation(); window.mpToast && window.mpToast("Modifica lezione · v2", "info");}} className="text-ember hover:underline">modifica</button>
                    </div>
                  </div>
                ))}
                <button onClick={()=>window.mpToast && window.mpToast("Upload · in arrivo (richiede backend)", "info")} className="border border-dashed border-line rounded-[3px] flex flex-col items-center justify-center gap-2 text-smoke hover:text-ink hover:border-ink transition" style={{aspectRatio:"16/10"}}>
                  <div className="w-10 h-10 rounded-full bg-paper-2 flex items-center justify-center"><Icon name="plus" size={16}/></div>
                  <span className="text-[12px]">Nuova lezione</span>
                </button>
              </div>
            ) : (
              <div className="bg-paper-2 border border-line rounded-[3px]">
                {gridLessons.map(l=>(
                  <button key={l.id} onClick={()=>window.mpToast && window.mpToast("Anteprima: "+l.title, "info")} className="w-full flex items-center gap-4 p-3 border-t border-line first:border-t-0 hover:bg-sand text-left">
                    <Thumb label={l.duration} dark aspect="16/9" className="w-24"/>
                    <div className="flex-1 min-w-0">
                      <div className="text-[14px] font-medium">{l.title}</div>
                      <div className="font-mono text-[10px] uppercase tracking-wider text-smoke mt-0.5">{l.duration} · HD · {l.views} studenti</div>
                    </div>
                    <Tag>tecnica</Tag>
                    <span onClick={(e)=>{e.stopPropagation(); window.mpToast && window.mpToast("Modifica lezione · v2", "info");}} className="text-smoke hover:text-ink inline-flex"><Icon name="pencil" size={14}/></span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { CoachLibrary });
