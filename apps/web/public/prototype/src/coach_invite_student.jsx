// ─── COACH 6c: Invita / Inserisci nuovo studente (drawer) ────────────

const PIANI_PRESET = [
  { id:"m3",     label:"3 mesi · base",       months:3,  price:99 },
  { id:"m6",     label:"6 mesi · standard",   months:6,  price:89 },
  { id:"m12",    label:"12 mesi · premium",   months:12, price:79 },
  { id:"custom", label:"Personalizzato",      months:0,  price:0  },
];

const STRUMENTI = [
  "Chitarra elettrica",
  "Chitarra acustica",
  "Chitarra classica",
  "Basso elettrico",
  "Basso acustico",
];

const LIVELLI = [
  "Principiante",
  "Intermedio",
  "Intermedio avanzato",
  "Avanzato",
];

const OBIETTIVI = [
  "Suonare in band",
  "Scrivere canzoni",
  "Improvvisazione",
  "Tecnica pura",
  "Registrazione in studio",
  "Hobby / piacere personale",
];

const FONTI = [
  "Instagram",
  "YouTube",
  "TikTok",
  "Ricerca Google",
  "Passaparola",
  "Evento dal vivo",
  "Sito web",
  "Altro",
];

const GENERI = [
  "Blues","Rock","Metal","Jazz","Fusion","Pop","Funk","R&B","Country","Classical",
];

// NB: contratto e pagamento sono gestiti nel gestionale esterno di Marco —
// l'app raccoglie solo durata percorso (per scadenza) + privacy/marketing (legale).
const INITIAL_FORM = {
  nome:"", cognome:"", email:"", telefono:"", dataNascita:"", citta:"",
  strumento:"", livello:"", anniEsperienza:"",
  obiettivo:"", generi:[], artistiRef:"",
  piano:"", durataMesi:"", dataInizio:"",
  fonte:"", noteCommerciali:"",
  interesseMasterclass:false, interesseRetreat:false, takePubbliche:false,
  tagUpsell:"",
  privacyGDPR:false, consensoMarketing:false,
};

function CoachInviteStudent({ open, onClose }) {
  const [form, setForm] = React.useState(INITIAL_FORM);
  const [triedSubmit, setTriedSubmit] = React.useState(false);
  const drawerRef = React.useRef(null);

  // Reset form quando il drawer si chiude
  React.useEffect(() => {
    if (!open) {
      setTimeout(() => { setForm(INITIAL_FORM); setTriedSubmit(false); }, 300);
    } else {
      // scroll interno al top ogni volta che si apre
      if (drawerRef.current) drawerRef.current.scrollTop = 0;
    }
  }, [open]);

  // ESC per chiudere
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const update = (key, value) => setForm(f => ({...f, [key]: value}));

  const onPianoChange = (pianoId) => {
    const preset = PIANI_PRESET.find(p=>p.id===pianoId);
    if (!preset) return update("piano", pianoId);
    setForm(f => ({
      ...f,
      piano: pianoId,
      durataMesi: preset.months || f.durataMesi,
    }));
  };

  const toggleGenere = (g) => {
    setForm(f => ({
      ...f,
      generi: f.generi.includes(g) ? f.generi.filter(x=>x!==g) : [...f.generi, g],
    }));
  };

  const dataFine = React.useMemo(() => {
    if (!form.dataInizio || !form.durataMesi) return "";
    const d = new Date(form.dataInizio);
    d.setMonth(d.getMonth() + Number(form.durataMesi));
    return d.toISOString().slice(0,10);
  }, [form.dataInizio, form.durataMesi]);

  const requiredMissing = () => {
    const missing = [];
    if (!form.nome.trim()) missing.push("nome");
    if (!form.cognome.trim()) missing.push("cognome");
    if (!form.email.trim()) missing.push("email");
    if (!form.strumento) missing.push("strumento");
    if (!form.livello) missing.push("livello");
    if (!form.piano) missing.push("piano");
    if (!form.dataInizio) missing.push("data inizio");
    if (!form.privacyGDPR) missing.push("privacy GDPR");
    return missing;
  };

  const submit = () => {
    setTriedSubmit(true);
    const missing = requiredMissing();
    if (missing.length) {
      window.mpToast && window.mpToast("Mancano "+missing.length+" campi obbligatori", "warn");
      return;
    }
    window.mpToast && window.mpToast("Invito inviato a "+form.email, "ok");
    setTimeout(onClose, 400);
  };

  const saveDraft = () => {
    window.mpToast && window.mpToast("Bozza salvata · riprendi quando vuoi", "info");
    setTimeout(onClose, 300);
  };

  if (!open) return null;

  const err = (key) => triedSubmit && !form[key];
  const errClass = (key) => err(key) ? " border-[var(--ember)]" : " border-line";

  return (
    <div className="fixed inset-0 z-[9000]" style={{animation:"fadeIn 0.25s"}}>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-ink/60"
        style={{backdropFilter:"blur(2px)"}}
      />

      {/* Drawer */}
      <div
        className="absolute top-0 right-0 h-full w-full max-w-[600px] bg-paper text-ink shadow-2xl flex flex-col"
        style={{animation:"slideInRight 0.32s cubic-bezier(.2,.7,.2,1)"}}>

        {/* Header */}
        <div className="flex-shrink-0 px-8 pt-7 pb-5 border-b border-line bg-paper">
          <div className="flex items-start justify-between">
            <div>
              <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-smoke mb-1.5">
                Nuovo ingaggio
              </div>
              <h2 className="font-display text-[38px] leading-[1.02]">
                Invita uno <span className="italic-ember">studente</span>.
              </h2>
            </div>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full border border-line flex items-center justify-center text-smoke hover:text-ink hover:border-ink transition">
              <Icon name="x" size={14}/>
            </button>
          </div>
        </div>

        {/* Body scrollable */}
        <div ref={drawerRef} className="flex-1 overflow-y-auto px-8 py-6 no-scrollbar">

          {/* SEZIONE 1 — Anagrafica */}
          <SectionHeader kicker="01 · Anagrafica" title="Chi è?"/>
          <div className="grid grid-cols-2 gap-3 mt-4">
            <Field label="Nome *" error={err("nome")}>
              <input value={form.nome} onChange={e=>update("nome", e.target.value)}
                className={"w-full h-10 px-3 bg-paper-2 border rounded-[2px] text-[13px] focus:outline-none focus:border-ink transition"+errClass("nome")}/>
            </Field>
            <Field label="Cognome *" error={err("cognome")}>
              <input value={form.cognome} onChange={e=>update("cognome", e.target.value)}
                className={"w-full h-10 px-3 bg-paper-2 border rounded-[2px] text-[13px] focus:outline-none focus:border-ink transition"+errClass("cognome")}/>
            </Field>
          </div>
          <Field label="Email *" error={err("email")}>
            <input type="email" value={form.email} onChange={e=>update("email", e.target.value)}
              placeholder="nome@dominio.it"
              className={"w-full h-10 px-3 bg-paper-2 border rounded-[2px] text-[13px] focus:outline-none focus:border-ink transition"+errClass("email")}/>
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Telefono">
              <input value={form.telefono} onChange={e=>update("telefono", e.target.value)}
                placeholder="+39 …"
                className="w-full h-10 px-3 bg-paper-2 border border-line rounded-[2px] text-[13px] focus:outline-none focus:border-ink transition"/>
            </Field>
            <Field label="Data di nascita">
              <input type="date" value={form.dataNascita} onChange={e=>update("dataNascita", e.target.value)}
                className="w-full h-10 px-3 bg-paper-2 border border-line rounded-[2px] text-[13px] focus:outline-none focus:border-ink transition"/>
            </Field>
          </div>
          <Field label="Città">
            <input value={form.citta} onChange={e=>update("citta", e.target.value)}
              className="w-full h-10 px-3 bg-paper-2 border border-line rounded-[2px] text-[13px] focus:outline-none focus:border-ink transition"/>
          </Field>

          <Divider/>

          {/* SEZIONE 2 — Profilo musicale */}
          <SectionHeader kicker="02 · Profilo musicale" title="Da dove parte?"/>
          <div className="grid grid-cols-2 gap-3 mt-4">
            <Field label="Strumento *" error={err("strumento")}>
              <select value={form.strumento} onChange={e=>update("strumento", e.target.value)}
                className={"w-full h-10 px-3 bg-paper-2 border rounded-[2px] text-[13px] focus:outline-none focus:border-ink transition"+errClass("strumento")}>
                <option value="">— seleziona —</option>
                {STRUMENTI.map(s=><option key={s} value={s}>{s}</option>)}
              </select>
            </Field>
            <Field label="Livello dichiarato *" error={err("livello")}>
              <select value={form.livello} onChange={e=>update("livello", e.target.value)}
                className={"w-full h-10 px-3 bg-paper-2 border rounded-[2px] text-[13px] focus:outline-none focus:border-ink transition"+errClass("livello")}>
                <option value="">— seleziona —</option>
                {LIVELLI.map(s=><option key={s} value={s}>{s}</option>)}
              </select>
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Anni di esperienza">
              <input type="number" min="0" max="80" value={form.anniEsperienza} onChange={e=>update("anniEsperienza", e.target.value)}
                className="w-full h-10 px-3 bg-paper-2 border border-line rounded-[2px] text-[13px] focus:outline-none focus:border-ink transition"/>
            </Field>
            <Field label="Obiettivo principale">
              <select value={form.obiettivo} onChange={e=>update("obiettivo", e.target.value)}
                className="w-full h-10 px-3 bg-paper-2 border border-line rounded-[2px] text-[13px] focus:outline-none focus:border-ink transition">
                <option value="">— seleziona —</option>
                {OBIETTIVI.map(s=><option key={s} value={s}>{s}</option>)}
              </select>
            </Field>
          </div>

          <Field label="Generi preferiti (multi)">
            <div className="flex flex-wrap gap-1.5">
              {GENERI.map(g=>{
                const on = form.generi.includes(g);
                return (
                  <button key={g} type="button" onClick={()=>toggleGenere(g)}
                    className={"h-8 px-3 rounded-[2px] text-[11px] font-mono uppercase tracking-wider transition "+(on?"bg-ink text-paper":"bg-paper-2 border border-line text-smoke hover:text-ink")}>
                    {g}
                  </button>
                );
              })}
            </div>
          </Field>

          <Field label="Artisti di riferimento" hint="Da cosa possiamo agganciare il percorso didattico">
            <textarea rows={2} value={form.artistiRef} onChange={e=>update("artistiRef", e.target.value)}
              placeholder="es. Nuno Bettencourt, Gilmour, John Mayer…"
              className="w-full px-3 py-2 bg-paper-2 border border-line rounded-[2px] text-[13px] leading-relaxed focus:outline-none focus:border-ink transition resize-none"/>
          </Field>

          <Divider/>

          {/* SEZIONE 3 — Piano commerciale */}
          <SectionHeader kicker="03 · Piano commerciale" title="Come si aggancia?"/>

          <Field label="Durata percorso *" error={err("piano")} hint="Contratto e pagamento li gestisci nel tuo gestionale esterno. Qui ci serve solo la durata per calcolare la scadenza nell'app.">
            <div className="grid grid-cols-2 gap-2">
              {PIANI_PRESET.map(p=>{
                const on = form.piano === p.id;
                return (
                  <button key={p.id} type="button" onClick={()=>onPianoChange(p.id)}
                    className={"text-left px-3 py-2.5 rounded-[2px] border transition "+(on?"bg-ink text-paper border-ink":"bg-paper-2 border-line hover:border-ink")}>
                    <div className="font-display text-[15px] leading-none mb-1">{p.label}</div>
                    <div className={"font-mono text-[10px] uppercase tracking-wider "+(on?"text-[#9E8E82]":"text-smoke")}>
                      {p.months ? `${p.months} mesi` : "Durata custom"}
                    </div>
                  </button>
                );
              })}
            </div>
          </Field>

          <div className="grid grid-cols-2 gap-3 mt-4">
            <Field label="Durata (mesi)">
              <input type="number" min="1" max="60" value={form.durataMesi} onChange={e=>update("durataMesi", e.target.value)}
                className="w-full h-10 px-3 bg-paper-2 border border-line rounded-[2px] text-[13px] focus:outline-none focus:border-ink transition"/>
            </Field>
            <Field label="Data inizio *" error={err("dataInizio")}>
              <input type="date" value={form.dataInizio} onChange={e=>update("dataInizio", e.target.value)}
                className={"w-full h-10 px-3 bg-paper-2 border rounded-[2px] text-[13px] focus:outline-none focus:border-ink transition"+errClass("dataInizio")}/>
            </Field>
          </div>

          <Field label="Data fine (calcolata)">
            <input readOnly value={dataFine || "—"}
              className="w-full h-10 px-3 bg-sand border border-line rounded-[2px] text-[13px] text-smoke"/>
          </Field>

          <Field label="Come ci ha conosciuti?">
            <select value={form.fonte} onChange={e=>update("fonte", e.target.value)}
              className="w-full h-10 px-3 bg-paper-2 border border-line rounded-[2px] text-[13px] focus:outline-none focus:border-ink transition">
              <option value="">— seleziona —</option>
              {FONTI.map(s=><option key={s} value={s}>{s}</option>)}
            </select>
          </Field>

          <Field label="Note commerciali" hint="Contesto utile per te (non condiviso con lo studente)">
            <textarea rows={2} value={form.noteCommerciali} onChange={e=>update("noteCommerciali", e.target.value)}
              placeholder="es. referral di Andrea, pagamento in 3 rate, vuole iniziare a maggio…"
              className="w-full px-3 py-2 bg-paper-2 border border-line rounded-[2px] text-[13px] leading-relaxed focus:outline-none focus:border-ink transition resize-none"/>
          </Field>

          <Divider/>

          {/* SEZIONE 4 — Opportunità future (cross/upsell) */}
          <SectionHeader kicker="04 · Opportunità future" title="Dove lo porti?"/>
          <div className="space-y-2 mt-4">
            <CheckboxRow
              checked={form.interesseMasterclass}
              onChange={v=>update("interesseMasterclass", v)}
              label="Interessato a masterclass di gruppo"
              hint="Upsell naturale dopo i primi 3 mesi."/>
            <CheckboxRow
              checked={form.interesseRetreat}
              onChange={v=>update("interesseRetreat", v)}
              label="Interessato a retreat dal vivo"
              hint="Evento annuale · upsell premium."/>
            <CheckboxRow
              checked={form.takePubbliche}
              onChange={v=>update("takePubbliche", v)}
              label="Disponibile a take pubbliche in community"
              hint="Se sì, Marco può sceglierlo come 'pick della settimana'."/>
          </div>

          <Field label="Tag cross-sell" hint="Parole chiave per riprendere la conversazione tra 3-6 mesi">
            <input value={form.tagUpsell} onChange={e=>update("tagUpsell", e.target.value)}
              placeholder="es. songwriting, home-studio, live band…"
              className="w-full h-10 px-3 bg-paper-2 border border-line rounded-[2px] text-[13px] focus:outline-none focus:border-ink transition"/>
          </Field>

          <Divider/>

          {/* SEZIONE 5 — Privacy */}
          <SectionHeader kicker="05 · Privacy" title="L'ultimo passo."/>
          <div className="text-[12px] text-smoke mt-2 mb-3 leading-relaxed">
            Contratto e pagamento sono gestiti nel tuo gestionale esterno (non nell'app).
            Qui ti serve solo la conferma legale per registrare lo studente.
          </div>

          <div className="mt-4 space-y-2">
            <CheckboxRow
              checked={form.privacyGDPR}
              onChange={v=>update("privacyGDPR", v)}
              label="Privacy GDPR accettata *"
              hint="Obbligatorio per procedere."
              error={err("privacyGDPR")}/>
            <CheckboxRow
              checked={form.consensoMarketing}
              onChange={v=>update("consensoMarketing", v)}
              label="Consenso a comunicazioni commerciali"
              hint="Necessario per campagne upsell future."/>
          </div>

          <div className="h-4"/>
        </div>

        {/* Footer sticky */}
        <div className="flex-shrink-0 px-8 py-4 border-t border-line bg-paper flex items-center gap-3">
          <button onClick={onClose}
            className="h-10 px-4 text-[13px] text-smoke hover:text-ink">
            Annulla
          </button>
          <div className="ml-auto flex items-center gap-2">
            <button onClick={saveDraft}
              className="h-10 px-4 border border-line rounded-[2px] text-[13px] text-smoke hover:text-ink hover:border-ink transition">
              Salva bozza
            </button>
            <EmberButton size="md" icon="send" onClick={submit}>
              Invita studente
            </EmberButton>
          </div>
        </div>

      </div>

      <style>{`
        @keyframes slideInRight { from { transform: translateX(100%); } to { transform: translateX(0); } }
      `}</style>
    </div>
  );
}

// ─── sub-components locali al drawer ────────────────────────────────

function SectionHeader({ kicker, title }) {
  return (
    <div>
      <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-ember mb-1.5">{kicker}</div>
      <div className="font-display text-[24px] leading-none">{title}</div>
    </div>
  );
}

function Field({ label, children, hint, error }) {
  return (
    <div className="mt-3">
      <div className={"font-mono text-[10px] uppercase tracking-wider mb-1.5 "+(error?"text-[var(--ember)]":"text-smoke")}>{label}</div>
      {children}
      {hint && <div className="font-mono text-[10px] text-smoke mt-1 leading-relaxed">{hint}</div>}
    </div>
  );
}

function CheckboxRow({ checked, onChange, label, hint, error }) {
  return (
    <button type="button" onClick={()=>onChange(!checked)}
      className={"w-full text-left flex items-start gap-3 px-3 py-2.5 rounded-[2px] border transition "+(checked?"bg-paper-2 border-ink":"bg-paper-2 border-line hover:border-ink")}>
      <div className={"w-4 h-4 rounded-[2px] flex items-center justify-center flex-shrink-0 mt-0.5 border "+(checked?"bg-ink border-ink":error?"border-[var(--ember)]":"border-line bg-paper")}>
        {checked && <Icon name="check" size={11} className="text-paper"/>}
      </div>
      <div className="flex-1 min-w-0">
        <div className={"text-[13px] font-medium "+(error?"text-[var(--ember)]":"text-ink")}>{label}</div>
        {hint && <div className="font-mono text-[10px] text-smoke mt-0.5 leading-relaxed">{hint}</div>}
      </div>
    </button>
  );
}

function Divider() {
  return <div className="my-7 border-t border-line"/>;
}

Object.assign(window, { CoachInviteStudent });
