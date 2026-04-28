// ─── COACH 6b: Students List (desktop) ────────────────────────────────

function CoachStudents({ nav }) {
  const [tick, setTick] = React.useState(0);
  const bump = () => setTick(t => t + 1);
  const students = window.STUDENTS_LIST || [];
  const coaches = window.COACHES || [];
  const coachById = React.useMemo(() => {
    const m = {}; coaches.forEach(c => m[c.id] = c); return m;
  }, [tick, coaches.length]);

  const [search, setSearch] = React.useState("");
  const [levelFilter, setLevelFilter] = React.useState("all");
  const [coachFilter, setCoachFilter] = React.useState("all"); // all | coach.id
  const [sort, setSort] = React.useState("recent");
  const [inviteOpen, setInviteOpen] = React.useState(false);
  const [reassignFor, setReassignFor] = React.useState(null);

  const levels = ["all", ...Array.from(new Set(students.map(s=>s.level)))];
  const q = search.trim().toLowerCase();

  const reassign = (studentName, newCoachId) => {
    const s = students.find(x => x.name === studentName);
    if (!s) return;
    const prev = coachById[s.coachId];
    const next = coachById[newCoachId];
    s.coachId = newCoachId;
    bump();
    window.mpToast && window.mpToast(
      `${studentName.split(" ")[0]} spostato da ${prev?.name.split(" ")[0] || "?"} a ${next?.name.split(" ")[0] || "?"}`,
      "ok"
    );
  };

  const filtered = students.filter(s => {
    if (levelFilter !== "all" && s.level !== levelFilter) return false;
    if (coachFilter !== "all" && s.coachId !== coachFilter) return false;
    if (q && !s.name.toLowerCase().includes(q) && !s.level.toLowerCase().includes(q)) return false;
    return true;
  });

  const sorted = [...filtered].sort((a,b)=>{
    if (sort==="progress") return b.prog - a.prog;
    if (sort==="name") return a.name.localeCompare(b.name);
    return 0;
  });

  const flagged = students.filter(s=>s.flag).length;

  const openStudent = (s) => {
    if (s.name === "Luca Bianchi") {
      nav("student");
    } else {
      window.mpToast && window.mpToast("Profilo dettagliato · demo limitata a Luca", "info");
    }
  };

  return (
    <div className="min-h-full bg-paper fade-in">
      <div className="max-w-[1400px] mx-auto px-10 py-8">

        {/* Header editoriale */}
        <div className="flex items-end justify-between pb-6 border-b border-line">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-smoke mb-2">
              {students.length} studenti attivi · {flagged} richiedono attenzione
            </div>
            <h1 className="font-editorial text-[52px]">
              I tuoi <span className="italic-ember">studenti</span>.
            </h1>
          </div>
          <button
            onClick={()=>setInviteOpen(true)}
            className="h-10 px-4 rounded-[2px] border border-ink text-[13px] hover:bg-ink hover:text-paper transition inline-flex items-center gap-2">
            <Icon name="plus" size={14}/> Invita studente
          </button>
        </div>

        {/* Toolbar: search + filtri + sort */}
        <div className="mt-6 flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 bg-paper-2 border border-line rounded-[3px] px-3 h-10 flex-1 min-w-[280px] max-w-[420px]">
            <Icon name="search" size={14} className="text-smoke"/>
            <input
              value={search}
              onChange={e=>setSearch(e.target.value)}
              placeholder="Cerca per nome o livello…"
              className="flex-1 bg-transparent outline-none text-[13px] text-ink placeholder:text-smoke"/>
            {search && (
              <button onClick={()=>setSearch("")} className="text-smoke hover:text-ink"><Icon name="x" size={13}/></button>
            )}
          </div>

          <div className="flex items-center gap-1 bg-paper-2 border border-line rounded-[3px] p-1">
            {levels.map(l=>(
              <button
                key={l}
                onClick={()=>setLevelFilter(l)}
                className={"h-8 px-3 text-[11px] font-mono uppercase tracking-wider rounded-[2px] "+(levelFilter===l?"bg-ink text-paper":"text-smoke hover:text-ink")}>
                {l==="all" ? "Tutti" : l}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1 bg-paper-2 border border-line rounded-[3px] p-1 ml-auto">
            {[
              {id:"recent", l:"Recenti"},
              {id:"progress", l:"Progresso"},
              {id:"name", l:"A–Z"},
            ].map(s=>(
              <button
                key={s.id}
                onClick={()=>setSort(s.id)}
                className={"h-8 px-3 text-[11px] font-mono uppercase tracking-wider rounded-[2px] "+(sort===s.id?"bg-ink text-paper":"text-smoke hover:text-ink")}>
                {s.l}
              </button>
            ))}
          </div>
        </div>

        {/* Coach filter chip row */}
        {coaches.length > 1 && (
          <div className="mt-3 flex items-center gap-2 flex-wrap">
            <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-smoke mr-1">Coach</span>
            <button
              onClick={()=>setCoachFilter("all")}
              className={"h-8 px-3 rounded-[2px] text-[11px] font-mono uppercase tracking-wider border "+(coachFilter==="all"?"bg-ink text-paper border-ink":"border-line text-smoke hover:border-ink")}>
              Tutti ({students.length})
            </button>
            {coaches.map(c => {
              const n = students.filter(s => s.coachId === c.id).length;
              const active = coachFilter === c.id;
              return (
                <button
                  key={c.id}
                  onClick={()=>setCoachFilter(c.id)}
                  className={"h-8 px-3 rounded-[2px] text-[11px] font-mono uppercase tracking-wider border inline-flex items-center gap-2 "+(active?"bg-ink text-paper border-ink":"border-line text-smoke hover:border-ink")}>
                  <Avatar initials={c.initials} size={18} tone={c.tone || "ink"}/>
                  {c.name.split(" ")[0]} ({n})
                </button>
              );
            })}
          </div>
        )}

        {/* Risultati */}
        <div className="mt-6 font-mono text-[10px] uppercase tracking-[0.22em] text-smoke mb-3">
          {sorted.length} {sorted.length===1?"risultato":"risultati"}
        </div>

        {sorted.length === 0 && (
          <div className="py-20 text-center text-smoke text-[14px]">
            Nessuno studente corrisponde ai filtri.
          </div>
        )}

        {/* Grid studenti */}
        <div className="grid grid-cols-3 gap-4">
          {sorted.map((s)=>{
            const assigned = coachById[s.coachId];
            const otherCoaches = coaches.filter(c => c.id !== s.coachId);
            const reassignOpen = reassignFor === s.name;
            return (
              <div
                key={s.name}
                className="relative bg-paper-2 border border-line rounded-[3px] p-5 hover:border-ink transition group">
                <button
                  onClick={()=>openStudent(s)}
                  className="w-full text-left"
                  title="Apri profilo">
                  <div className="flex items-start gap-4">
                    <Avatar initials={s.i} size={52} tone={s.flag?"ember":"ink"}/>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="font-display text-[22px] leading-[1.05] truncate">{s.name}</div>
                        {s.flag && <span className="w-2 h-2 rounded-full bg-ember flex-shrink-0 mt-2"/>}
                      </div>
                      <div className="font-mono text-[10px] uppercase tracking-wider text-smoke mt-1">
                        {s.level} · {s.lastActive}
                      </div>
                    </div>
                  </div>

                  {/* Progresso percorso */}
                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-mono text-[10px] uppercase tracking-wider text-smoke">Percorso</span>
                      <span className="font-mono text-[11px] text-ink">{s.prog}%</span>
                    </div>
                    <div className="h-[3px] bg-line rounded-full overflow-hidden">
                      <div className="h-full bg-ember rounded-full" style={{width:s.prog+"%"}}/>
                    </div>
                  </div>

                  {/* Flag */}
                  {s.flag && (
                    <div className="mt-4 text-[12px] text-ember inline-flex items-center gap-1.5">
                      <Icon name="inbox" size={12}/> {s.flag}
                    </div>
                  )}
                </button>

                {/* Coach assegnato + reassign */}
                <div className="mt-4 pt-4 border-t border-line flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    {assigned ? (
                      <>
                        <Avatar initials={assigned.initials} size={22} tone={assigned.tone || "ink"}/>
                        <div className="min-w-0">
                          <div className="font-mono text-[9px] uppercase tracking-wider text-smoke leading-none">Coach</div>
                          <div className="text-[12px] truncate leading-tight mt-0.5">{assigned.name.split(" ")[0]}</div>
                        </div>
                      </>
                    ) : (
                      <span className="font-mono text-[10px] uppercase tracking-wider text-ember">Non assegnato</span>
                    )}
                  </div>
                  {otherCoaches.length > 0 && (
                    <div className="relative">
                      <button
                        onClick={(e)=>{ e.stopPropagation(); setReassignFor(reassignOpen ? null : s.name); }}
                        className="h-7 px-2 rounded-[2px] border border-line text-[11px] text-smoke hover:border-ink hover:text-ink transition inline-flex items-center gap-1">
                        <Icon name="users" size={11}/> Sposta
                      </button>
                      {reassignOpen && (
                        <div className="absolute bottom-full right-0 mb-2 w-[220px] bg-paper border border-ink rounded-[2px] shadow-2xl z-50 p-1 slide-up">
                          <div className="font-mono text-[9px] uppercase tracking-wider text-smoke px-2 py-1.5 border-b border-line">
                            Riassegna a
                          </div>
                          {otherCoaches.map(c => (
                            <button
                              key={c.id}
                              onClick={()=>{ reassign(s.name, c.id); setReassignFor(null); }}
                              className="w-full flex items-center gap-2 px-2 py-2 rounded-[2px] text-left hover:bg-paper-2 transition">
                              <Avatar initials={c.initials} size={24} tone={c.tone || "ink"}/>
                              <div className="flex-1 min-w-0">
                                <div className="text-[12px] truncate">{c.name}</div>
                                <div className="font-mono text-[9px] uppercase tracking-wider text-smoke">{c.role}</div>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <button
                  onClick={()=>openStudent(s)}
                  className="mt-3 w-full pt-3 border-t border-line flex items-center justify-between text-[12px] text-smoke hover:text-ink transition">
                  <span>Apri profilo</span>
                  <Icon name="chevron" size={13}/>
                </button>
              </div>
            );
          })}
        </div>

      </div>

      <CoachInviteStudent open={inviteOpen} onClose={()=>setInviteOpen(false)}/>
    </div>
  );
}

Object.assign(window, { CoachStudents });
