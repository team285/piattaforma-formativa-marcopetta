// ─── COACH 8: Settings — gestione account studenti + profilo Marco ──
// Accessibile solo dalla vista coach desktop, nav "Impostazioni".
// Sostituisce il placeholder SettingsStub. Marco può modificare
// nome/cognome/email/password di ogni studente e resettare la password.
// Persistenza mock: mutazione in-place di window.STUDENTS_LIST.

const DEFAULT_STUDENT_PASSWORD = "chitarra2026";

function deriveStudentEmail(fullName) {
  const normalized = fullName.toLowerCase()
    .replace(/[àá]/g, "a").replace(/[èé]/g, "e").replace(/[ìí]/g, "i")
    .replace(/[òó]/g, "o").replace(/[ùú]/g, "u")
    .replace(/[^a-z ]/g, "");
  const parts = normalized.split(" ").filter(Boolean);
  return parts.join(".") + "@mail.it";
}

function generateTempPassword() {
  const sA = ["blues","rock","funk","jazz","note","riff","ritmo","groove","strada","vento","cielo","luce"];
  const sB = ["mare","ponte","festa","corsa","sera","vita","sogno","onda","alba","spazio"];
  const a = sA[Math.floor(Math.random()*sA.length)];
  const b = sB[Math.floor(Math.random()*sB.length)];
  const n = Math.floor(Math.random()*90)+10;
  return a + b + n + "!";
}

function CoachSettings({ nav }) {
  const [tick, setTick] = React.useState(0);
  const bump = () => setTick(t => t + 1);

  const [search, setSearch] = React.useState("");
  const [coachFilter, setCoachFilter] = React.useState("all");
  const [editingStudent, setEditingStudent] = React.useState(null);

  const students = window.STUDENTS_LIST || [];
  const coaches = window.COACHES || [];
  const coachById = React.useMemo(() => {
    const m = {}; coaches.forEach(c => m[c.id] = c); return m;
  }, [tick, coaches.length]);
  const marco = window.COACH || {};

  // Normalize: aggiungi email + password di default se mancano
  React.useEffect(() => {
    let changed = false;
    students.forEach(s => {
      if (!s.email) { s.email = deriveStudentEmail(s.name); changed = true; }
      if (!s.password) { s.password = DEFAULT_STUDENT_PASSWORD; changed = true; }
    });
    if (changed) bump();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const q = search.trim().toLowerCase();
  const filtered = students.filter(s => {
    if (coachFilter !== "all" && s.coachId !== coachFilter) return false;
    if (!q) return true;
    return s.name.toLowerCase().includes(q) || (s.email || "").toLowerCase().includes(q);
  });

  return (
    <div className="min-h-full bg-paper fade-in">
      <div className="max-w-[1280px] mx-auto px-10 py-10">

        {/* Header */}
        <div className="flex items-end justify-between pb-6 border-b border-line mb-10">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-smoke mb-2">Impostazioni</div>
            <h1 className="font-editorial text-[56px]">Gestisci <span className="italic-ember">la tua scuola</span>.</h1>
            <div className="text-[14px] text-smoke mt-3 max-w-[560px]">
              Profilo, account degli studenti, preferenze di notifica. Tutto quello che non è didattica ma serve per farla girare.
            </div>
          </div>
        </div>

        {/* ── SEZIONE 1: Profilo Marco ── */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-5">
            <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-ember">01 · Profilo</div>
            <div className="flex-1 border-t border-line"/>
          </div>
          <div className="bg-paper-2 border border-line rounded-[3px] p-6 flex items-start gap-6">
            <Avatar initials={marco.initials || "MP"} size={72} tone="ember"/>
            <div className="flex-1 min-w-0">
              <div className="font-editorial text-[28px]">{marco.fullName || "Marco Petta"}</div>
              <div className="font-mono text-[10px] uppercase tracking-wider text-smoke mt-1">Fondatore · Metodo P.G.T.</div>
              <div className="mt-4 grid grid-cols-2 gap-5 text-[13px]">
                <div>
                  <div className="font-mono text-[10px] uppercase tracking-wider text-smoke mb-1">Email</div>
                  <div className="font-mono">marco@marcopetta.it</div>
                </div>
                <div>
                  <div className="font-mono text-[10px] uppercase tracking-wider text-smoke mb-1">Telefono</div>
                  <div className="font-mono">+39 340 1234567</div>
                </div>
              </div>
            </div>
            <button onClick={()=>window.mpToast && window.mpToast("Modifica profilo coach · in arrivo", "info")}
              className="h-9 px-3 rounded-[2px] border border-line text-[12px] text-smoke hover:text-ink hover:border-ink transition font-mono uppercase tracking-wider">
              Modifica
            </button>
          </div>
        </div>

        {/* ── SEZIONE 2: Account studenti ── */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-5">
            <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-ember">02 · Account studenti</div>
            <div className="flex-1 border-t border-line"/>
          </div>

          {/* Banner informativo */}
          <div className="bg-ink text-paper rounded-[3px] p-6 mb-5 flex items-start gap-5">
            <div className="w-10 h-10 rounded-full bg-[var(--amber)]/10 border border-[var(--amber)]/30 flex items-center justify-center flex-shrink-0">
              <Icon name="warning" size={18} className="text-amber"/>
            </div>
            <div>
              <div className="font-display text-[18px] mb-1.5">Solo tu puoi modificare gli account dei tuoi studenti.</div>
              <div className="text-[13px] text-[#C9BDB1] leading-[1.45] max-w-[640px]">
                Se uno studente dimentica la password, resettala da qui: genereremo una password temporanea da comunicargli. Gli chiederemo di cambiarla al primo login. Ogni modifica viene notificata allo studente via email.
              </div>
            </div>
          </div>

          {/* Toolbar: search + filtro coach */}
          <div className="flex items-center gap-3 flex-wrap mb-4">
            <div className="flex items-center gap-2 bg-paper-2 border border-line rounded-[3px] px-3 h-10 flex-1 min-w-[280px] max-w-[420px]">
              <Icon name="search" size={14} className="text-smoke"/>
              <input
                value={search}
                onChange={e=>setSearch(e.target.value)}
                placeholder="Cerca per nome o email…"
                className="flex-1 bg-transparent outline-none text-[13px] text-ink placeholder:text-smoke"/>
              {search && (
                <button onClick={()=>setSearch("")} className="text-smoke hover:text-ink"><Icon name="x" size={13}/></button>
              )}
            </div>
            {coaches.length > 1 && (
              <div className="flex items-center gap-1 bg-paper-2 border border-line rounded-[3px] p-1 ml-auto">
                <button onClick={()=>setCoachFilter("all")}
                  className={"h-8 px-3 text-[11px] font-mono uppercase tracking-wider rounded-[2px] "+(coachFilter==="all"?"bg-ink text-paper":"text-smoke hover:text-ink")}>
                  Tutti
                </button>
                {coaches.map(c => (
                  <button key={c.id} onClick={()=>setCoachFilter(c.id)}
                    className={"h-8 px-3 text-[11px] font-mono uppercase tracking-wider rounded-[2px] "+(coachFilter===c.id?"bg-ink text-paper":"text-smoke hover:text-ink")}>
                    {c.name.split(" ")[0]}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-smoke mb-3">
            {filtered.length} {filtered.length===1?"studente":"studenti"}
          </div>

          {/* Tabella */}
          <div className="bg-paper-2 border border-line rounded-[3px] overflow-hidden">
            <div className="grid grid-cols-[1.2fr_1.4fr_0.9fr_auto] gap-4 items-center px-5 py-3 border-b border-line bg-paper">
              <div className="font-mono text-[10px] uppercase tracking-wider text-smoke">Studente</div>
              <div className="font-mono text-[10px] uppercase tracking-wider text-smoke">Email</div>
              <div className="font-mono text-[10px] uppercase tracking-wider text-smoke">Coach</div>
              <div className="w-[96px]"/>
            </div>
            {filtered.map(s => {
              const c = coachById[s.coachId];
              return (
                <div key={s.name} className="grid grid-cols-[1.2fr_1.4fr_0.9fr_auto] gap-4 items-center px-5 py-4 border-b border-line last:border-b-0 hover:bg-paper transition">
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar initials={s.i} size={36} tone={s.flag?"ember":"ink"}/>
                    <div className="min-w-0">
                      <div className="text-[14px] truncate">{s.name}</div>
                      <div className="font-mono text-[10px] uppercase tracking-wider text-smoke mt-0.5">{s.level}</div>
                    </div>
                  </div>
                  <div className="text-[12px] truncate font-mono text-smoke">{s.email}</div>
                  <div className="flex items-center gap-2 min-w-0">
                    {c ? (
                      <>
                        <Avatar initials={c.initials} size={22} tone={c.tone || "ink"}/>
                        <span className="text-[12px] truncate">{c.name.split(" ")[0]}</span>
                      </>
                    ) : (
                      <span className="font-mono text-[10px] uppercase tracking-wider text-ember">non assegnato</span>
                    )}
                  </div>
                  <button onClick={()=>setEditingStudent(s)}
                    className="h-8 px-3 rounded-[2px] border border-line text-[11px] text-smoke hover:border-ink hover:text-ink transition font-mono uppercase tracking-wider inline-flex items-center gap-1.5">
                    <Icon name="pencil" size={11}/> Modifica
                  </button>
                </div>
              );
            })}
            {filtered.length === 0 && (
              <div className="p-10 text-center text-smoke text-[13px]">
                Nessuno studente corrisponde ai filtri.
              </div>
            )}
          </div>
        </div>

        {/* ── SEZIONE 3: Notifiche ── */}
        <div>
          <div className="flex items-center gap-3 mb-5">
            <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-ember">03 · Notifiche</div>
            <div className="flex-1 border-t border-line"/>
          </div>
          <div className="bg-paper-2 border border-line rounded-[3px] p-2">
            <NotifRow label="Email quando uno studente invia una nuova take" defaultOn/>
            <NotifRow label="Email riassuntiva settimanale (ogni lunedì 9:00)" defaultOn/>
            <NotifRow label="Push su telefono quando ricevi un nuovo messaggio in chat"/>
            <NotifRow label="Email se uno studente è inattivo da più di 7 giorni" defaultOn/>
            <NotifRow label="Notifica se un coach impiega più di 48h a rispondere a uno studente"/>
          </div>
        </div>

      </div>

      {editingStudent && (
        <EditStudentDrawer
          student={editingStudent}
          onClose={()=>setEditingStudent(null)}
          onSaved={bump}/>
      )}
    </div>
  );
}

function NotifRow({ label, defaultOn = false }) {
  const [on, setOn] = React.useState(defaultOn);
  const toggle = () => {
    setOn(!on);
    window.mpToast && window.mpToast(on ? "Notifica disattivata" : "Notifica attivata", "info");
  };
  return (
    <div className="flex items-center justify-between gap-4 px-4 py-3 border-b border-line last:border-b-0">
      <div className="text-[13px]">{label}</div>
      <button onClick={toggle}
        className={"w-10 h-6 rounded-full relative transition flex-shrink-0 "+(on?"bg-ember":"bg-line")}>
        <span className={"absolute top-0.5 w-5 h-5 rounded-full bg-paper transition "+(on?"left-[18px]":"left-0.5")} style={{boxShadow:"0 1px 3px rgba(0,0,0,0.15)"}}/>
      </button>
    </div>
  );
}

// ─── EditStudentDrawer — modifica nome/cognome/email/password ────
function EditStudentDrawer({ student, onClose, onSaved }) {
  const [nome, setNome] = React.useState("");
  const [cognome, setCognome] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [tempGenerated, setTempGenerated] = React.useState(null);
  const [triedSubmit, setTriedSubmit] = React.useState(false);

  React.useEffect(() => {
    const parts = student.name.split(" ");
    setNome(parts[0] || "");
    setCognome(parts.slice(1).join(" "));
    setEmail(student.email || deriveStudentEmail(student.name));
    setPassword(student.password || DEFAULT_STUDENT_PASSWORD);
    setShowPassword(false);
    setTempGenerated(null);
    setTriedSubmit(false);
  }, [student]);

  React.useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const resetPassword = () => {
    const temp = generateTempPassword();
    setPassword(temp);
    setTempGenerated(temp);
    setShowPassword(true);
    window.mpToast && window.mpToast("Password temporanea generata — copiala prima di chiudere", "ok");
  };

  const copyPassword = () => {
    try {
      navigator.clipboard && navigator.clipboard.writeText(password);
      window.mpToast && window.mpToast("Password copiata negli appunti", "ok");
    } catch (_e) {
      window.mpToast && window.mpToast("Copia non supportata · selezionala a mano", "info");
    }
  };

  const save = () => {
    setTriedSubmit(true);
    const missing = [];
    if (!nome.trim()) missing.push("nome");
    if (!cognome.trim()) missing.push("cognome");
    if (!email.trim() || !email.includes("@")) missing.push("email valida");
    if (!password || password.length < 6) missing.push("password min 6 car.");
    if (missing.length) {
      window.mpToast && window.mpToast("Controlla: " + missing.join(", "), "warn");
      return;
    }
    const oldName = student.name;
    const fullName = nome.trim() + " " + cognome.trim();
    const newInitials = ((nome.trim()[0] || "") + (cognome.trim()[0] || "")).toUpperCase();
    student.name = fullName;
    student.i = newInitials;
    student.email = email.trim();
    student.password = password;
    // Propaga rename ai thread chat (Marco + Paolo) che referenziano questo studente
    [window.COACH_CHATS, window.COLLAB_CHATS].forEach(list => {
      if (!list) return;
      const thread = list.find(c => c.name === oldName);
      if (thread) { thread.name = fullName; thread.initials = newInitials; }
    });
    onSaved();
    window.mpToast && window.mpToast(`Account di ${nome.trim()} aggiornato`, "ok");
    setTimeout(onClose, 300);
  };

  const errBorder = (cond) => triedSubmit && cond ? " border-[var(--ember)]" : " border-line";

  return (
    <div className="fixed inset-0 z-[9000]" style={{animation:"fadeIn 0.25s"}}>
      <div onClick={onClose} className="absolute inset-0 bg-ink/60" style={{backdropFilter:"blur(2px)"}}/>
      <div className="absolute top-0 right-0 h-full w-full max-w-[560px] bg-paper text-ink shadow-2xl flex flex-col"
        style={{animation:"slideInRight 0.32s cubic-bezier(.2,.7,.2,1)"}}>

        {/* Header */}
        <div className="flex-shrink-0 px-8 pt-7 pb-5 border-b border-line bg-paper">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-smoke mb-1.5">Modifica account</div>
              <h2 className="font-editorial text-[32px] leading-[1.02] truncate">{student.name}</h2>
            </div>
            <button onClick={onClose} className="w-9 h-9 rounded-full border border-line flex items-center justify-center text-smoke hover:text-ink hover:border-ink transition flex-shrink-0">
              <Icon name="x" size={14}/>
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-8 py-6 no-scrollbar">

          {/* Nome / Cognome */}
          <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-ember mb-1.5">01 · Nome</div>
          <div className="grid grid-cols-2 gap-3 mt-3">
            <div>
              <div className={"font-mono text-[10px] uppercase tracking-wider mb-1.5 "+(triedSubmit && !nome.trim()?"text-[var(--ember)]":"text-smoke")}>Nome *</div>
              <input value={nome} onChange={e=>setNome(e.target.value)}
                className={"w-full h-10 px-3 bg-paper-2 border rounded-[2px] text-[13px] focus:outline-none focus:border-ink transition"+errBorder(!nome.trim())}/>
            </div>
            <div>
              <div className={"font-mono text-[10px] uppercase tracking-wider mb-1.5 "+(triedSubmit && !cognome.trim()?"text-[var(--ember)]":"text-smoke")}>Cognome *</div>
              <input value={cognome} onChange={e=>setCognome(e.target.value)}
                className={"w-full h-10 px-3 bg-paper-2 border rounded-[2px] text-[13px] focus:outline-none focus:border-ink transition"+errBorder(!cognome.trim())}/>
            </div>
          </div>

          <div className="my-7 border-t border-line"/>

          {/* Email */}
          <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-ember mb-1.5">02 · Email</div>
          <div className="text-[12px] text-smoke mb-3">Usata per login e magic-link di accesso. Lo studente riceverà un'email di conferma se la cambi.</div>
          <input type="email" value={email} onChange={e=>setEmail(e.target.value)}
            className={"w-full h-10 px-3 bg-paper-2 border rounded-[2px] text-[13px] font-mono focus:outline-none focus:border-ink transition"+errBorder(!email.trim() || !email.includes("@"))}/>

          <div className="my-7 border-t border-line"/>

          {/* Password */}
          <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-ember mb-1.5">03 · Password</div>
          <div className="text-[12px] text-smoke mb-3">Se lo studente l'ha dimenticata, genera una password temporanea. Gli chiederemo di cambiarla al primo login successivo.</div>

          <div className="relative">
            <input type={showPassword?"text":"password"} value={password} onChange={e=>setPassword(e.target.value)}
              className={"w-full h-10 pl-3 pr-[90px] bg-paper-2 border rounded-[2px] text-[13px] font-mono focus:outline-none focus:border-ink transition"+errBorder(!password || password.length<6)}/>
            <div className="absolute top-0 right-0 h-10 flex items-center gap-0.5 pr-1">
              <button onClick={()=>setShowPassword(!showPassword)} title={showPassword?"Nascondi":"Mostra"}
                className={"w-8 h-8 rounded-[2px] hover:bg-paper transition flex items-center justify-center "+(showPassword?"text-ink":"text-smoke")}>
                <Icon name="eye" size={14}/>
              </button>
              <button onClick={copyPassword} title="Copia password"
                className="w-8 h-8 rounded-[2px] text-smoke hover:text-ink hover:bg-paper transition flex items-center justify-center">
                <Icon name="paperclip" size={13}/>
              </button>
            </div>
          </div>

          <button onClick={resetPassword}
            className="mt-3 h-9 px-3 rounded-[2px] border border-[var(--ember)]/40 text-[11px] text-[var(--ember)] hover:bg-[var(--ember)] hover:text-white transition font-mono uppercase tracking-wider inline-flex items-center gap-1.5">
            <Icon name="loop" size={11}/> Genera password temporanea
          </button>

          {tempGenerated && (
            <div className="mt-4 bg-ink text-paper rounded-[3px] p-4 border border-[var(--amber)]/30">
              <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-amber mb-2">Nuova password generata</div>
              <div className="font-mono text-[22px] text-paper mb-2 tracking-wide select-all">{tempGenerated}</div>
              <div className="text-[11px] text-[#C9BDB1] leading-[1.4]">
                Copiala e comunicala a <strong>{student.name.split(" ")[0]}</strong> via canale sicuro (chat app, SMS). Verrà nascosta quando chiudi questa vista.
              </div>
            </div>
          )}

        </div>

        {/* Footer sticky */}
        <div className="flex-shrink-0 px-8 py-5 border-t border-line bg-paper-2 flex items-center justify-between gap-3">
          <button onClick={onClose}
            className="h-10 px-4 rounded-[2px] border border-line text-[13px] text-smoke hover:text-ink hover:border-ink transition">
            Annulla
          </button>
          <button onClick={save}
            className="h-10 px-5 rounded-[2px] bg-ink text-paper text-[13px] font-display uppercase tracking-wider hover:bg-ink-2 transition inline-flex items-center gap-2">
            <Icon name="check" size={13}/> Salva modifiche
          </button>
        </div>
      </div>

      <style>{`
        @keyframes slideInRight { from { transform: translateX(100%); } to { transform: translateX(0); } }
      `}</style>
    </div>
  );
}

Object.assign(window, { CoachSettings });
