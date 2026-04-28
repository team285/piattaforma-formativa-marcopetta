// ─── COACH 7: Team — gestione coach collaboratori + assegnazione studenti ──
// Marco vede il suo team (Marco fondatore + Paolo senior), può aggiungere
// nuovi coach e riassegnare studenti da un coach all'altro.
// Lo stato vive in window.STUDENTS_LIST / window.COACHES (mutato in-place)
// così il resto della app (CoachStudents, CoachStudent) vede i cambi.

const TEAM_SPECIALTY_PRESETS = [
  "tecnica","fraseggio","composizione","tecnica base","coordinazione","metronomo",
  "improvvisazione","teoria","groove","song-writing","registrazione","performance",
];

const TEAM_ROLE_PRESETS = [
  "Coach senior","Coach junior","Assistente didattico","Coach specialista",
];

function CoachTeam({ nav }) {
  const [tick, setTick] = React.useState(0); // force re-render after window mutation
  const [selectedCoachId, setSelectedCoachId] = React.useState(null);
  const [addOpen, setAddOpen] = React.useState(false);

  const bump = () => setTick(t => t + 1);

  const coaches = window.COACHES || [];
  const students = window.STUDENTS_LIST || [];

  const countByCoach = React.useMemo(() => {
    const map = {};
    coaches.forEach(c => { map[c.id] = 0; });
    students.forEach(s => { if (map[s.coachId] != null) map[s.coachId]++; });
    return map;
  }, [tick, coaches.length, students.length]);

  const reassign = (studentName, newCoachId) => {
    const s = students.find(x => x.name === studentName);
    if (!s) return;
    const prevCoach = coaches.find(c => c.id === s.coachId);
    const newCoach = coaches.find(c => c.id === newCoachId);
    s.coachId = newCoachId;
    bump();
    window.mpToast && window.mpToast(
      `${studentName.split(" ")[0]} spostato da ${prevCoach?.name.split(" ")[0] || "?"} a ${newCoach?.name.split(" ")[0] || "?"}`,
      "ok"
    );
  };

  const addCoach = (coachData) => {
    coaches.push(coachData);
    bump();
    window.mpToast && window.mpToast(`Coach ${coachData.name.split(" ")[0]} aggiunto al team`, "ok");
  };

  const removeCoach = (coachId) => {
    const coach = coaches.find(c => c.id === coachId);
    if (!coach || coach.locked) return;
    const assigned = students.filter(s => s.coachId === coachId);
    if (assigned.length > 0) {
      window.mpToast && window.mpToast(
        `Riassegna prima i ${assigned.length} studenti di ${coach.name.split(" ")[0]}`, "warn"
      );
      return;
    }
    const idx = coaches.findIndex(c => c.id === coachId);
    if (idx > -1) coaches.splice(idx, 1);
    setSelectedCoachId(null);
    bump();
    window.mpToast && window.mpToast(`Coach ${coach.name.split(" ")[0]} rimosso dal team`, "ok");
  };

  if (selectedCoachId) {
    const coach = coaches.find(c => c.id === selectedCoachId);
    if (!coach) { setSelectedCoachId(null); return null; }
    return (
      <CoachTeamDetail
        coach={coach}
        allCoaches={coaches}
        students={students.filter(s => s.coachId === selectedCoachId)}
        allStudentsCount={students.length}
        onBack={()=>setSelectedCoachId(null)}
        onReassign={reassign}
        onRemoveCoach={removeCoach}
      />
    );
  }

  return (
    <div className="min-h-full bg-paper fade-in">
      <div className="max-w-[1280px] mx-auto px-10 py-10">

        {/* Hero */}
        <div className="flex items-end justify-between pb-6 border-b border-line mb-8">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-smoke mb-2">
              {coaches.length} coach attivi · {students.length} studenti totali
            </div>
            <h1 className="font-editorial text-[56px]">Il tuo <span className="italic-ember">team</span>.</h1>
            <div className="text-[14px] text-smoke mt-3 max-w-[520px]">
              Gestisci i coach del metodo e assegna gli studenti. Tu resti il fondatore — gli altri coprono i primi mesi o specializzazioni.
            </div>
          </div>
          <button
            onClick={()=>setAddOpen(true)}
            className="h-10 px-4 rounded-[2px] border border-ink bg-ink text-paper text-[13px] hover:bg-ink-2 transition inline-flex items-center gap-2">
            <Icon name="plus" size={14}/> Aggiungi coach
          </button>
        </div>

        {/* Grid coach */}
        <div className="grid grid-cols-3 gap-4">
          {coaches.map(c => {
            const count = countByCoach[c.id] || 0;
            const fill = Math.min(100, Math.round((count / (c.maxStudents || 10)) * 100));
            const full = count >= (c.maxStudents || 10);
            return (
              <button
                key={c.id}
                onClick={()=>setSelectedCoachId(c.id)}
                className="text-left bg-paper-2 border border-line rounded-[3px] p-5 hover:border-ink transition group">
                <div className="flex items-start gap-4">
                  <Avatar initials={c.initials} size={52} tone={c.tone || "ink"}/>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="font-display text-[22px] leading-[1.05] truncate">{c.name}</div>
                        <div className="font-mono text-[10px] uppercase tracking-wider text-smoke mt-1">{c.role}</div>
                      </div>
                      {c.locked && <Tag>fondatore</Tag>}
                    </div>
                  </div>
                </div>

                {/* Tagline */}
                <div className="mt-4 text-[13px] text-smoke leading-[1.4]">{c.tagline}</div>

                {/* Specialties */}
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {(c.specialties || []).slice(0,4).map(s => (
                    <span key={s} className="font-mono text-[9px] uppercase tracking-wider text-smoke bg-paper border border-line rounded-[2px] px-2 py-0.5">{s}</span>
                  ))}
                </div>

                {/* Capacity bar */}
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-mono text-[10px] uppercase tracking-wider text-smoke">studenti</span>
                    <span className="font-mono text-[11px] text-ink">{count} / {c.maxStudents}</span>
                  </div>
                  <div className="h-[3px] bg-line rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{width:fill+"%", background: full ? "var(--ember)" : "var(--amber)"}}/>
                  </div>
                </div>

                {/* Stats row */}
                <div className="mt-4 pt-4 border-t border-line grid grid-cols-2 gap-3 text-[12px]">
                  <div>
                    <div className="font-mono text-[9px] uppercase tracking-wider text-smoke">feedback sett.</div>
                    <div className="text-[14px] mt-0.5">{c.feedbackThisWeek}</div>
                  </div>
                  <div>
                    <div className="font-mono text-[9px] uppercase tracking-wider text-smoke">risposta media</div>
                    <div className="text-[14px] mt-0.5">{c.avgResponseTime}</div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-line flex items-center justify-between text-[12px]">
                  <span className="text-smoke group-hover:text-ink transition">Apri team & assegna</span>
                  <Icon name="chevron" size={13} className="text-smoke group-hover:text-ink transition"/>
                </div>
              </button>
            );
          })}

          {/* Add-coach placeholder card */}
          <button
            onClick={()=>setAddOpen(true)}
            className="text-left bg-paper border-2 border-dashed border-line rounded-[3px] p-5 hover:border-ink hover:bg-paper-2 transition flex flex-col items-center justify-center text-center min-h-[340px]">
            <div className="w-12 h-12 rounded-full border-2 border-ink flex items-center justify-center mb-4">
              <Icon name="plus" size={18}/>
            </div>
            <div className="font-display text-[18px]">Aggiungi coach</div>
            <div className="text-[12px] text-smoke mt-2 max-w-[220px]">Espandi il team per scalare senza perdere qualità didattica.</div>
          </button>
        </div>

        {/* Info strip — scope */}
        <div className="mt-10 bg-ink text-paper rounded-[3px] p-8 grid grid-cols-3 gap-8">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--amber)] mb-2">Come funziona</div>
            <div className="font-editorial text-[22px] leading-[1.2]">Assegni tu, ogni volta.</div>
            <div className="text-[12px] text-[#C9BDB1] mt-2">Clicca un coach e trascina (figurativamente) gli studenti giusti. Nessuna auto-assegnazione.</div>
          </div>
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--amber)] mb-2">Scope coach</div>
            <div className="font-editorial text-[22px] leading-[1.2]">Ognuno vede i suoi.</div>
            <div className="text-[12px] text-[#C9BDB1] mt-2">Ogni coach vede solo i propri studenti. Niente business, niente altri team.</div>
          </div>
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--amber)] mb-2">Handoff</div>
            <div className="font-editorial text-[22px] leading-[1.2]">Scalate, non diluite.</div>
            <div className="text-[12px] text-[#C9BDB1] mt-2">Un coach viene rimosso solo dopo aver riassegnato tutti i suoi studenti.</div>
          </div>
        </div>

      </div>

      <AddCoachDrawer open={addOpen} onClose={()=>setAddOpen(false)} onSaved={addCoach}/>
    </div>
  );
}

// ─── CoachTeamDetail — drill-down su un coach con riassegnazione ────
function CoachTeamDetail({ coach, allCoaches, students, allStudentsCount, onBack, onReassign, onRemoveCoach }) {
  const [reassignFor, setReassignFor] = React.useState(null); // student name
  const otherCoaches = allCoaches.filter(c => c.id !== coach.id);

  return (
    <div className="min-h-full bg-paper fade-in">
      <div className="max-w-[1280px] mx-auto px-10 py-10">

        {/* Back */}
        <button onClick={onBack} className="font-mono text-[11px] uppercase tracking-wider text-smoke hover:text-ink inline-flex items-center gap-1.5 mb-6">
          <Icon name="chevronl" size={12}/> Torna al team
        </button>

        {/* Coach header card */}
        <div className="bg-ink text-paper rounded-[3px] p-8 flex items-start gap-6 mb-8">
          <Avatar initials={coach.initials} size={84} tone={coach.tone || "ember"}/>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3">
              <div className="font-editorial text-[38px] leading-[1.05]">{coach.name}</div>
              {coach.locked && <span className="font-mono text-[10px] uppercase tracking-wider text-[var(--amber)] bg-[var(--amber)]/10 px-2 py-1 rounded-[2px] border border-[var(--amber)]/30">fondatore</span>}
            </div>
            <div className="font-mono text-[11px] uppercase tracking-wider text-[#C9BDB1] mt-2">{coach.role}</div>
            <div className="text-[14px] text-[#C9BDB1] mt-3 max-w-[640px]">{coach.bio}</div>
            <div className="mt-5 flex flex-wrap gap-1.5">
              {(coach.specialties || []).map(s => (
                <span key={s} className="font-mono text-[10px] uppercase tracking-wider text-[var(--amber)] bg-[var(--amber)]/10 border border-[var(--amber)]/25 rounded-[2px] px-2 py-1">{s}</span>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-2 items-end">
            {!coach.locked && (
              <button
                onClick={()=>onRemoveCoach(coach.id)}
                className="h-8 px-3 border border-[var(--ember)]/40 rounded-[2px] text-[11px] text-[var(--ember)] hover:bg-[var(--ember)] hover:text-white transition font-mono uppercase tracking-wider">
                Rimuovi coach
              </button>
            )}
          </div>
        </div>

        {/* Stats strip */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-paper-2 border border-line rounded-[3px] p-5">
            <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-smoke mb-3">Studenti assegnati</div>
            <div className="font-display text-[48px] leading-none">{students.length}</div>
            <div className="text-[12px] text-smoke mt-2">su {coach.maxStudents} max</div>
          </div>
          <div className="bg-paper-2 border border-line rounded-[3px] p-5">
            <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-smoke mb-3">Feedback settimana</div>
            <div className="font-display text-[48px] leading-none">{coach.feedbackThisWeek}</div>
            <div className="text-[12px] text-smoke mt-2">inviati negli ultimi 7 gg</div>
          </div>
          <div className="bg-paper-2 border border-line rounded-[3px] p-5">
            <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-smoke mb-3">Risposta media</div>
            <div className="font-display text-[48px] leading-none">{coach.avgResponseTime}</div>
            <div className="text-[12px] text-smoke mt-2">SLA ultimi 30 gg</div>
          </div>
          <div className="bg-paper-2 border border-line rounded-[3px] p-5">
            <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-smoke mb-3">Quota su team</div>
            <div className="font-display text-[48px] leading-none">{allStudentsCount ? Math.round((students.length/allStudentsCount)*100) : 0}%</div>
            <div className="text-[12px] text-smoke mt-2">degli studenti attivi</div>
          </div>
        </div>

        {/* Students list */}
        <div className="flex items-end justify-between mb-5">
          <EditorialH kicker="Studenti assegnati">I suoi <span className="italic-ember">{students.length}</span></EditorialH>
        </div>

        {students.length === 0 && (
          <div className="bg-paper-2 border border-dashed border-line rounded-[3px] p-10 text-center text-smoke text-[13px]">
            Nessuno studente assegnato. Aprine uno dalla lista e spostalo su {coach.name.split(" ")[0]}.
          </div>
        )}

        <div className="bg-paper-2 border border-line rounded-[3px] overflow-hidden">
          {students.map(s => (
            <div key={s.name} className="flex items-center gap-5 p-5 border-t border-line first:border-t-0">
              <Avatar initials={s.i} size={44} tone={s.flag?"ember":"ink"}/>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3">
                  <span className="font-display text-[19px]">{s.name}</span>
                  {s.flag && <Tag><span className="text-ember">{s.flag}</span></Tag>}
                </div>
                <div className="text-[12px] text-smoke mt-1">{s.level} · {s.lastActive}</div>
              </div>
              <div className="w-32">
                <div className="font-mono text-[10px] uppercase tracking-wider text-smoke mb-1">percorso</div>
                <div className="h-[3px] bg-line rounded-full overflow-hidden">
                  <div className="h-full bg-ember rounded-full" style={{width:s.prog+"%"}}/>
                </div>
                <div className="font-mono text-[10px] text-ink mt-1">{s.prog}%</div>
              </div>
              <div className="relative">
                <button
                  onClick={()=>setReassignFor(reassignFor === s.name ? null : s.name)}
                  className="h-9 px-3 rounded-[2px] border border-line text-[12px] text-smoke hover:border-ink hover:text-ink transition inline-flex items-center gap-1.5">
                  <Icon name="users" size={12}/> Sposta a
                </button>
                {reassignFor === s.name && (
                  <div className="absolute top-full right-0 mt-2 w-[240px] bg-paper border border-ink rounded-[2px] shadow-2xl z-50 p-1 slide-up">
                    <div className="font-mono text-[9px] uppercase tracking-wider text-smoke px-2 py-1.5 border-b border-line">
                      Riassegna a un altro coach
                    </div>
                    {otherCoaches.map(c => (
                      <button
                        key={c.id}
                        onClick={()=>{ onReassign(s.name, c.id); setReassignFor(null); }}
                        className="w-full flex items-center gap-3 px-2 py-2 rounded-[2px] text-left hover:bg-paper-2 transition">
                        <Avatar initials={c.initials} size={28} tone={c.tone || "ink"}/>
                        <div className="flex-1 min-w-0">
                          <div className="text-[12px]">{c.name}</div>
                          <div className="font-mono text-[9px] uppercase tracking-wider text-smoke">{c.role}</div>
                        </div>
                      </button>
                    ))}
                    {otherCoaches.length === 0 && (
                      <div className="px-3 py-4 text-center text-[12px] text-smoke">
                        Aggiungi prima un secondo coach.
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}

// ─── AddCoachDrawer — creazione nuovo coach ─────────────────────────
const ADD_COACH_INITIAL = {
  nome:"", cognome:"", email:"", role:"Coach senior",
  tagline:"", bio:"", maxStudents:10,
  specialties:[], customSpecialty:"",
};

function AddCoachDrawer({ open, onClose, onSaved }) {
  const [form, setForm] = React.useState(ADD_COACH_INITIAL);
  const [triedSubmit, setTriedSubmit] = React.useState(false);
  const drawerRef = React.useRef(null);

  React.useEffect(()=>{
    if (!open) {
      setTimeout(()=>{ setForm(ADD_COACH_INITIAL); setTriedSubmit(false); }, 300);
    } else if (drawerRef.current) drawerRef.current.scrollTop = 0;
  }, [open]);

  React.useEffect(()=>{
    if (!open) return;
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const update = (k, v) => setForm(f => ({...f, [k]: v}));

  const toggleSpecialty = (s) => {
    setForm(f => ({
      ...f,
      specialties: f.specialties.includes(s) ? f.specialties.filter(x=>x!==s) : [...f.specialties, s],
    }));
  };

  const addCustomSpecialty = () => {
    const s = form.customSpecialty.trim();
    if (!s) return;
    if (form.specialties.includes(s)) return;
    setForm(f => ({...f, specialties:[...f.specialties, s], customSpecialty:""}));
  };

  const requiredMissing = () => {
    const m = [];
    if (!form.nome.trim()) m.push("nome");
    if (!form.cognome.trim()) m.push("cognome");
    if (!form.email.trim()) m.push("email");
    if (!form.role) m.push("ruolo");
    if (form.specialties.length === 0) m.push("almeno una specialità");
    return m;
  };

  const submit = () => {
    setTriedSubmit(true);
    const missing = requiredMissing();
    if (missing.length) {
      window.mpToast && window.mpToast("Mancano "+missing.length+" campi obbligatori", "warn");
      return;
    }
    const initials = (form.nome[0]||"") + (form.cognome[0]||"");
    const id = (form.nome+"_"+form.cognome).toLowerCase().replace(/[^a-z]/g,"_")+"_"+Math.floor(Math.random()*1000);
    const newCoach = {
      id,
      name: form.nome.trim()+" "+form.cognome.trim(),
      initials: initials.toUpperCase(),
      role: form.role,
      tagline: form.tagline.trim() || form.role + " · " + form.specialties.slice(0,2).join(", "),
      tone: "ink",
      specialties: form.specialties,
      locked: false,
      avgResponseTime: "—",
      feedbackThisWeek: 0,
      maxStudents: Number(form.maxStudents) || 10,
      bio: form.bio.trim() || "Nuovo coach nel team di Marco.",
    };
    onSaved(newCoach);
    setTimeout(onClose, 300);
  };

  if (!open) return null;
  const err = (k) => triedSubmit && !form[k];
  const errClass = (k) => err(k) ? " border-[var(--ember)]" : " border-line";

  return (
    <div className="fixed inset-0 z-[9000]" style={{animation:"fadeIn 0.25s"}}>
      <div onClick={onClose} className="absolute inset-0 bg-ink/60" style={{backdropFilter:"blur(2px)"}}/>
      <div className="absolute top-0 right-0 h-full w-full max-w-[560px] bg-paper text-ink shadow-2xl flex flex-col"
        style={{animation:"slideInRight 0.32s cubic-bezier(.2,.7,.2,1)"}}>

        {/* Header */}
        <div className="flex-shrink-0 px-8 pt-7 pb-5 border-b border-line bg-paper">
          <div className="flex items-start justify-between">
            <div>
              <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-smoke mb-1.5">Nuovo coach</div>
              <h2 className="font-editorial text-[38px] leading-[1.02]">Aggiungi al <span className="italic-ember">team</span>.</h2>
            </div>
            <button onClick={onClose} className="w-9 h-9 rounded-full border border-line flex items-center justify-center text-smoke hover:text-ink hover:border-ink transition">
              <Icon name="x" size={14}/>
            </button>
          </div>
        </div>

        {/* Body */}
        <div ref={drawerRef} className="flex-1 overflow-y-auto px-8 py-6 no-scrollbar">

          {/* Anagrafica */}
          <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-ember mb-1.5">01 · Chi è</div>
          <div className="font-display text-[24px] leading-none">Contatti base</div>
          <div className="grid grid-cols-2 gap-3 mt-4">
            <div>
              <div className={"font-mono text-[10px] uppercase tracking-wider mb-1.5 "+(err("nome")?"text-[var(--ember)]":"text-smoke")}>Nome *</div>
              <input value={form.nome} onChange={e=>update("nome", e.target.value)}
                className={"w-full h-10 px-3 bg-paper-2 border rounded-[2px] text-[13px] focus:outline-none focus:border-ink transition"+errClass("nome")}/>
            </div>
            <div>
              <div className={"font-mono text-[10px] uppercase tracking-wider mb-1.5 "+(err("cognome")?"text-[var(--ember)]":"text-smoke")}>Cognome *</div>
              <input value={form.cognome} onChange={e=>update("cognome", e.target.value)}
                className={"w-full h-10 px-3 bg-paper-2 border rounded-[2px] text-[13px] focus:outline-none focus:border-ink transition"+errClass("cognome")}/>
            </div>
          </div>
          <div className="mt-3">
            <div className={"font-mono text-[10px] uppercase tracking-wider mb-1.5 "+(err("email")?"text-[var(--ember)]":"text-smoke")}>Email *</div>
            <input type="email" value={form.email} onChange={e=>update("email", e.target.value)}
              placeholder="coach@dominio.it"
              className={"w-full h-10 px-3 bg-paper-2 border rounded-[2px] text-[13px] focus:outline-none focus:border-ink transition"+errClass("email")}/>
          </div>

          <div className="my-7 border-t border-line"/>

          {/* Ruolo */}
          <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-ember mb-1.5">02 · Ruolo nel team</div>
          <div className="font-display text-[24px] leading-none">Che tipo di coach è?</div>
          <div className="mt-4 flex flex-wrap gap-2">
            {TEAM_ROLE_PRESETS.map(r=>(
              <button key={r} onClick={()=>update("role", r)}
                className={"h-9 px-3 rounded-[2px] text-[12px] border "+(form.role===r?"bg-ink text-paper border-ink":"border-line text-smoke hover:border-ink")}>
                {r}
              </button>
            ))}
          </div>
          <div className="mt-3">
            <div className="font-mono text-[10px] uppercase tracking-wider mb-1.5 text-smoke">Tagline (opzionale)</div>
            <input value={form.tagline} onChange={e=>update("tagline", e.target.value)}
              placeholder="es. Chitarrista sessionista · 4 anni con Marco"
              className="w-full h-10 px-3 bg-paper-2 border border-line rounded-[2px] text-[13px] focus:outline-none focus:border-ink transition"/>
          </div>

          <div className="my-7 border-t border-line"/>

          {/* Specialità */}
          <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-ember mb-1.5">03 · Specialità</div>
          <div className="font-display text-[24px] leading-none">Cosa sa fare meglio?</div>
          <div className={"mt-4 flex flex-wrap gap-2 "+(triedSubmit && form.specialties.length===0?"ring-2 ring-[var(--ember)] rounded-[2px] p-2":"")}>
            {TEAM_SPECIALTY_PRESETS.map(s=>{
              const on = form.specialties.includes(s);
              return (
                <button key={s} onClick={()=>toggleSpecialty(s)}
                  className={"h-8 px-3 rounded-[2px] text-[11px] font-mono uppercase tracking-wider border "+(on?"bg-ember text-white border-ember":"border-line text-smoke hover:border-ink")}>
                  {s}
                </button>
              );
            })}
          </div>
          <div className="mt-3 flex gap-2">
            <input value={form.customSpecialty} onChange={e=>update("customSpecialty", e.target.value)}
              onKeyDown={e=>{ if(e.key==="Enter"){ e.preventDefault(); addCustomSpecialty(); }}}
              placeholder="Aggiungi specialità custom (invio)"
              className="flex-1 h-10 px-3 bg-paper-2 border border-line rounded-[2px] text-[13px] focus:outline-none focus:border-ink transition"/>
            <button onClick={addCustomSpecialty}
              className="h-10 px-3 rounded-[2px] border border-line text-[12px] text-smoke hover:border-ink hover:text-ink transition">
              Aggiungi
            </button>
          </div>
          {form.specialties.length > 0 && (
            <div className="mt-3 text-[11px] text-smoke">Selezionate: {form.specialties.join(" · ")}</div>
          )}

          <div className="my-7 border-t border-line"/>

          {/* Capacità */}
          <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-ember mb-1.5">04 · Capacità</div>
          <div className="font-display text-[24px] leading-none">Quanti studenti massimi?</div>
          <div className="mt-4 flex items-center gap-4">
            <input type="range" min="3" max="25" value={form.maxStudents}
              onChange={e=>update("maxStudents", e.target.value)}
              className="flex-1"/>
            <div className="font-display text-[28px] min-w-[48px] text-right">{form.maxStudents}</div>
          </div>
          <div className="font-mono text-[10px] text-smoke mt-2">
            Marco raccomanda 8–12 per coach senior, 3–5 per coach junior/specialista.
          </div>

          <div className="my-7 border-t border-line"/>

          {/* Bio */}
          <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-ember mb-1.5">05 · Bio</div>
          <div className="font-display text-[24px] leading-none">Come lo presenti?</div>
          <div className="mt-4">
            <textarea value={form.bio} onChange={e=>update("bio", e.target.value)}
              rows={4}
              placeholder="Descrizione breve — verrà mostrata nella sua vista collab e agli studenti assegnati."
              className="w-full px-3 py-2.5 bg-paper-2 border border-line rounded-[2px] text-[13px] focus:outline-none focus:border-ink transition resize-none"/>
          </div>
        </div>

        {/* Footer sticky */}
        <div className="flex-shrink-0 px-8 py-5 border-t border-line bg-paper-2 flex items-center justify-between gap-3">
          <button onClick={onClose}
            className="h-10 px-4 rounded-[2px] border border-line text-[13px] text-smoke hover:text-ink hover:border-ink transition">
            Annulla
          </button>
          <button onClick={submit}
            className="h-10 px-5 rounded-[2px] bg-ink text-paper text-[13px] font-display uppercase tracking-wider hover:bg-ink-2 transition inline-flex items-center gap-2">
            <Icon name="check" size={13}/> Aggiungi coach
          </button>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { CoachTeam });
