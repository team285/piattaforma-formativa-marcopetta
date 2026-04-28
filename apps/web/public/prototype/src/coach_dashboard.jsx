// ─── COACH 6: Dashboard ──────────────────────────────────────────────
// Layout: Hero → KPI oggi (4) → KPI business (3) → Coda video (operativo)
//          → Percorsi scadenza + settimana lavorata → Analytics approfondimento

function CoachDashboard({ nav }) {
  const s = window.COACH_STATS;
  const a = window.COACH_ANALYTICS;
  const [filter, setFilter] = React.useState("all"); // all | urgent | overdue
  const [sortMode, setSortMode] = React.useState("urgency"); // urgency | recent
  const [showFilter, setShowFilter] = React.useState(false);

  const waitingHours = (w) => {
    if (!w) return 0;
    const n = parseInt(w, 10);
    return isNaN(n) ? 0 : n;
  };

  let queue = [...(window.COACH_QUEUE || [])];
  if (filter === "urgent")  queue = queue.filter(q => q.urgent);
  if (filter === "overdue") queue = queue.filter(q => waitingHours(q.waiting) >= 24);
  queue.sort((a,b) => sortMode === "urgency"
    ? waitingHours(b.waiting) - waitingHours(a.waiting)
    : waitingHours(a.waiting) - waitingHours(b.waiting));

  return (
    <div className="min-h-full bg-paper fade-in">
      <div className="max-w-[1280px] mx-auto px-10 py-10">

        <div className="flex items-end justify-between mb-10">
          <div>
            <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-smoke mb-3">Martedì 21 aprile</div>
            <h1 className="font-editorial text-[56px]">Buongiorno <span className="italic-ember">Marco</span>.</h1>
          </div>
          <div className="text-right text-sm text-smoke max-w-[300px]">
            <span className="text-ink">5 video</span> ti aspettano. Il più vecchio è di <span className="text-ember font-medium">Luca</span>, 2 giorni fa.
          </div>
        </div>

        {/* KPI OPERATIVI — cosa fare oggi */}
        <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-smoke mb-3">Oggi</div>
        <div className="grid grid-cols-4 gap-4 mb-6">
          <StatCard label="Attivi questa settimana" value={s.activeStudents} sub={`su ${(window.STUDENTS_LIST||[]).length} studenti totali`}/>
          <StatCard label="Video da correggere" value={s.toReview} sub="2 in ritardo" ember/>
          <StatCard label="Messaggi non letti" value={s.unreadMsgs} sub="in chat 1:1"/>
          <StatCard label="Percorsi in scadenza" value={s.expiringMonth} sub="questo mese"/>
        </div>

        {/* KPI BUSINESS — salute del progetto */}
        <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-smoke mb-3">Salute del progetto</div>
        <div className="grid grid-cols-3 gap-4 mb-12">
          <StatCard label="MRR stimato" value={`€${a.mrr.toLocaleString('it-IT')}`} sub="ricorrente mensile"/>
          <StatCard label="A rischio churn" value={a.atRisk} sub="inattivi 7+ giorni" warn/>
          <StatCard label="Tempo medio risposta" value={a.avgResponseTime} sub="SLA ultimi 30 gg"/>
        </div>

        {/* Priority queue */}
        <div className="flex items-end justify-between mb-5">
          <EditorialH kicker="Priorità di oggi">Coda video da <span className="italic-ember">correggere</span></EditorialH>
          <div className="flex items-center gap-2">
            <button onClick={()=>setShowFilter(v=>!v)} className={"h-8 px-3 border rounded-[2px] text-[12px] inline-flex items-center gap-1.5 "+(showFilter||filter!=="all"?"border-ink text-ink bg-sand":"border-line text-smoke hover:text-ink")}>
              <Icon name="filter" size={12}/> Filtra{filter!=="all" && <span className="ml-1 font-mono text-[10px] text-ember">· {filter==="urgent"?"urgenti":"oltre 24h"}</span>}
            </button>
            <button onClick={()=>setSortMode(m => m==="urgency"?"recent":"urgency")} className="h-8 px-3 border border-line rounded-[2px] text-[12px] text-smoke hover:text-ink">
              Ordina per {sortMode==="urgency"?"urgenza":"più recenti"}
            </button>
          </div>
        </div>

        {showFilter && (
          <div className="mb-3 flex items-center gap-2 flex-wrap bg-paper-2 border border-line rounded-[2px] p-3 slide-up">
            {[
              {id:"all",     label:"Tutti ("+(window.COACH_QUEUE||[]).length+")"},
              {id:"urgent",  label:"Solo urgenti"},
              {id:"overdue", label:"Oltre 24h"},
            ].map(f=>(
              <button key={f.id} onClick={()=>setFilter(f.id)} className={"h-8 px-3 rounded-[2px] text-[12px] border "+(filter===f.id?"bg-ink text-paper border-ink":"border-line text-smoke hover:text-ink")}>{f.label}</button>
            ))}
          </div>
        )}

        <div className="bg-paper-2 border border-line rounded-[3px] overflow-hidden">
          {queue.length === 0 && (
            <div className="p-8 text-center text-[13px] text-smoke">Nessun video per questo filtro.</div>
          )}
          {queue.map((q,i)=>(
            <button key={q.id} onClick={()=>nav("review")} className={"w-full flex items-center gap-5 p-5 text-left hover:bg-sand transition border-t border-line first:border-t-0 group"}>
              <Avatar initials={q.initials} size={46} tone={q.urgent?"ember":"ink"}/>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                  <span className="font-display text-xl">{q.student}</span>
                  {q.urgent && <Tag><span className="text-ember">in ritardo</span></Tag>}
                </div>
                <div className="text-[13px] text-smoke truncate">{q.title} · {q.exerciseRef}</div>
              </div>
              <div className="hidden md:block">
                <Thumb label={"take · "+q.duration} dark aspect="16/9" className="w-40"/>
              </div>
              <div className="text-right">
                <div className="font-mono text-[11px] uppercase tracking-wider text-smoke mb-1">in attesa</div>
                <div className="text-[14px]">{q.waiting}</div>
              </div>
              <div className="pl-4">
                <EmberButton size="sm" icon="arrow" outline>Rivedi</EmberButton>
              </div>
            </button>
          ))}
        </div>

        {/* Due sezioni secondarie */}
        <div className="grid grid-cols-2 gap-6 mt-12">
          <div className="bg-paper-2 border border-line rounded-[3px] p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-smoke">Percorsi in scadenza</div>
              <button onClick={()=>nav("students")} className="text-[12px] text-ember hover:underline">Vedi tutti</button>
            </div>
            {[
              {n:"Andrea Ferri", d:"fine 30 apr · 9 giorni", t:"Percorso 3 mesi"},
              {n:"Chiara De Luca", d:"fine 12 mag · 21 giorni", t:"Percorso 6 mesi"},
            ].map((p,i)=>(
              <div key={i} className="flex items-center gap-4 py-3 border-t border-line first:border-t-0">
                <Avatar initials={p.n.split(" ").map(x=>x[0]).join("")} size={34}/>
                <div className="flex-1">
                  <div className="text-[14px]">{p.n}</div>
                  <div className="font-mono text-[11px] text-smoke uppercase tracking-wider">{p.t}</div>
                </div>
                <div className="text-[12px] text-smoke">{p.d}</div>
              </div>
            ))}
          </div>

          <div className="bg-ink text-paper rounded-[3px] p-6 relative overflow-hidden">
            <div className="absolute -right-12 -bottom-12 w-52 h-52 rounded-full" style={{background:"radial-gradient(circle, rgba(219,85,35,0.3), transparent 60%)"}}/>
            <div className="relative">
              <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#9E8E82] mb-3">Questa settimana</div>
              <div className="font-display text-3xl mb-1">18 ore di <span className="italic-ember">lavoro</span> dirette</div>
              <div className="text-[13px] text-[#C9BDB1] mb-5">8 video corretti · 14 assegnazioni · 23 messaggi</div>
              <div className="grid grid-cols-7 gap-1.5">
                {[2,4,3,5,6,2,1].map((h,i)=>(
                  <div key={i} className="flex flex-col items-center gap-1">
                    <div className="w-full h-14 rounded-[2px] bg-ink-3 flex items-end">
                      <div className="w-full bg-ember rounded-[2px]" style={{height:`${h*14}%`}}/>
                    </div>
                    <span className="font-mono text-[9px] uppercase tracking-wider text-[#9E8E82]">{["L","M","M","G","V","S","D"][i]}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ═══ APPROFONDISCI ═══════════════════════════════════════════════ */}
        <div className="mt-16 mb-6 flex items-end justify-between">
          <EditorialH kicker="Approfondisci">L'andamento della <span className="italic-ember">classe</span></EditorialH>
          <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-smoke">Aggiornato · 2 min fa</div>
        </div>

        {/* Row 1: Trend (2/3) + Radar classe (1/3) */}
        <div className="grid grid-cols-3 gap-6 mb-6">
          <div className="col-span-2 bg-paper-2 border border-line rounded-[3px] p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-smoke mb-1">Trend ultime 8 settimane</div>
                <div className="font-display text-2xl">Take ricevute vs feedback <span className="italic-ember">inviati</span></div>
              </div>
              <div className="flex gap-4 text-[11px]">
                <span className="inline-flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-ink"/> Take</span>
                <span className="inline-flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-ember"/> Feedback</span>
              </div>
            </div>
            <TrendChart data={a.trend}/>
            <div className="mt-4 text-[12px] text-smoke">
              Questa settimana <span className="text-ink font-medium">+5 take</span> rispetto alla media. <span className="text-ember">Stai accumulando coda.</span>
            </div>
          </div>

          <div className="bg-ink text-paper rounded-[3px] p-6">
            <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#9E8E82] mb-1">Radar medio classe</div>
            <div className="font-display text-2xl mb-5">Dove migliora <span className="italic-ember">la classe</span></div>
            <ClassRadar data={a.classRadar}/>
            <div className="mt-5 pt-5 border-t border-[#24242A]">
              <div className="flex justify-between text-[12px]">
                <div>
                  <div className="text-[#9E8E82] text-[10px] uppercase tracking-wider font-mono mb-1">Più alto</div>
                  <div className="font-medium">Tempo · 72</div>
                </div>
                <div className="text-right">
                  <div className="text-[#9E8E82] text-[10px] uppercase tracking-wider font-mono mb-1">Da lavorare</div>
                  <div className="font-medium text-ember">Orecchio · 58</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Row 2: Heatmap (2/3) + Top lezioni/esercizi (1/3) */}
        <div className="grid grid-cols-3 gap-6 mb-6">
          <div className="col-span-2 bg-paper-2 border border-line rounded-[3px] p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-smoke mb-1">Heatmap invii · 4 settimane</div>
                <div className="font-display text-2xl">Quando gli studenti <span className="italic-ember">registrano</span></div>
              </div>
              <div className="text-[11px] text-smoke">Pianifica le tue correzioni di conseguenza</div>
            </div>
            <SubmitHeatmap data={a.heatmap}/>
            <div className="mt-4 text-[12px] text-smoke">
              Picco il <span className="text-ink font-medium">giovedì sera</span> e la <span className="text-ink font-medium">domenica pomeriggio</span>. Le take arrivano a ondate — ok rispondere il mattino dopo.
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <div className="bg-paper-2 border border-line rounded-[3px] p-5">
              <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-smoke mb-4">Lezioni più viste</div>
              <TopList items={a.topLessons.map(l=>({label:l.title, value:l.views, delta:l.delta, unit:"views"}))}/>
            </div>
            <div className="bg-paper-2 border border-line rounded-[3px] p-5">
              <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-smoke mb-4">Esercizi più inviati</div>
              <TopList items={a.topExercises.map(e=>({label:e.title, value:e.submissions, unit:"take"}))}/>
            </div>
          </div>
        </div>

        {/* Row 3: Leaderboard */}
        <div className="grid grid-cols-2 gap-6">
          <LeaderboardCard title="Studenti più attivi" kicker="ultime 4 settimane" items={a.mostActive} tone="ink"/>
          <LeaderboardCard title="Maggiore crescita" kicker="radar · ultimi 30 gg" items={a.mostImproved} tone="ember"/>
        </div>

      </div>
    </div>
  );
}

// ─── StatCard ────────────────────────────────────────────────────────
function StatCard({ label, value, sub, ember, warn }) {
  const base = "border rounded-[3px] p-5 ";
  const cls = ember ? "bg-ember text-white border-ember"
           : warn  ? "bg-paper-2 border-ember/40"
           :         "bg-paper-2 border-line";
  const labelCls = ember ? "text-white/70" : warn ? "text-ember" : "text-smoke";
  const subCls   = ember ? "text-white/80" : "text-smoke";
  return (
    <div className={base+cls}>
      <div className={"font-mono text-[10px] uppercase tracking-[0.22em] mb-4 "+labelCls}>{label}</div>
      <div className="font-display text-[56px] leading-none">{value}</div>
      <div className={"text-[12px] mt-2 "+subCls}>{sub}</div>
    </div>
  );
}

// ─── TrendChart ──────────────────────────────────────────────────────
// Line chart SVG: asse Y auto-scaled, 2 serie (submitted/feedback), punti + etichette.
function TrendChart({ data }) {
  const W = 620, H = 180, P = { t:10, r:10, b:26, l:28 };
  const innerW = W - P.l - P.r, innerH = H - P.t - P.b;
  const max = Math.max(...data.flatMap(d => [d.submitted, d.feedback])) + 2;
  const x = (i) => P.l + (innerW / (data.length - 1)) * i;
  const y = (v) => P.t + innerH - (v / max) * innerH;
  const pathFor = (key) => data.map((d,i) => (i===0?"M":"L")+x(i)+","+y(d[key])).join(" ");
  const gridY = [0, max/2, max].map(v => Math.round(v));
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H} style={{overflow:"visible"}}>
      {/* griglia orizzontale */}
      {gridY.map((v,i) => (
        <g key={i}>
          <line x1={P.l} x2={W-P.r} y1={y(v)} y2={y(v)} stroke="#E8E2D4" strokeDasharray="2 3"/>
          <text x={P.l-6} y={y(v)+3} fontSize="9" fontFamily="JetBrains Mono,monospace" fill="#8A8A92" textAnchor="end">{v}</text>
        </g>
      ))}
      {/* etichette X */}
      {data.map((d,i) => (
        <text key={i} x={x(i)} y={H-8} fontSize="9" fontFamily="JetBrains Mono,monospace" fill="#8A8A92" textAnchor="middle">{d.w}</text>
      ))}
      {/* area feedback (ember soft) */}
      <path d={pathFor("feedback") + ` L${x(data.length-1)},${y(0)} L${x(0)},${y(0)} Z`} fill="#F2B744" fillOpacity="0.08"/>
      {/* linea feedback */}
      <path d={pathFor("feedback")} fill="none" stroke="#F2B744" strokeWidth="2"/>
      {/* linea submitted */}
      <path d={pathFor("submitted")} fill="none" stroke="#0B0B0D" strokeWidth="2"/>
      {/* punti */}
      {data.map((d,i) => (
        <g key={i}>
          <circle cx={x(i)} cy={y(d.submitted)} r="3" fill="#0B0B0D"/>
          <circle cx={x(i)} cy={y(d.feedback)} r="3" fill="#F2B744"/>
        </g>
      ))}
      {/* badge settimana corrente */}
      <g transform={`translate(${x(data.length-1)}, ${y(data[data.length-1].submitted)})`}>
        <circle r="6" fill="#0B0B0D" fillOpacity="0.15"/>
        <text x="10" y="-8" fontSize="10" fontFamily="JetBrains Mono,monospace" fill="#0B0B0D" fontWeight="700">{data[data.length-1].submitted}</text>
      </g>
    </svg>
  );
}

// ─── ClassRadar ──────────────────────────────────────────────────────
// Radar SVG con 5 assi fissi, etichette esterne, poligono filled ember su tema ink.
function ClassRadar({ data }) {
  const keys = Object.keys(data);
  const n = keys.length;
  const R = 78, CX = 120, CY = 110;
  const angle = (i) => (-Math.PI/2) + (2*Math.PI/n)*i;
  const pt = (val, i) => {
    const r = (val/100) * R;
    return [CX + r*Math.cos(angle(i)), CY + r*Math.sin(angle(i))];
  };
  const poly = keys.map((k,i) => pt(data[k], i).join(",")).join(" ");
  const rings = [25, 50, 75, 100];
  return (
    <svg viewBox="0 0 240 220" width="100%" height={220}>
      {/* rings */}
      {rings.map(r => (
        <polygon key={r} fill="none" stroke="#2A2A30" strokeWidth="1"
          points={keys.map((_,i) => pt(r, i).join(",")).join(" ")}/>
      ))}
      {/* axes */}
      {keys.map((_,i) => {
        const [ex,ey] = pt(100, i);
        return <line key={i} x1={CX} y1={CY} x2={ex} y2={ey} stroke="#2A2A30"/>;
      })}
      {/* polygon */}
      <polygon points={poly} fill="#F2B744" fillOpacity="0.25" stroke="#F2B744" strokeWidth="2"/>
      {keys.map((k,i) => {
        const [vx,vy] = pt(data[k], i);
        return <circle key={i} cx={vx} cy={vy} r="3" fill="#F2B744"/>;
      })}
      {/* labels */}
      {keys.map((k,i) => {
        const [lx,ly] = pt(118, i);
        return (
          <text key={i} x={lx} y={ly+3} fontSize="10" fontFamily="JetBrains Mono,monospace"
            fill="#C9BDB1" textAnchor="middle">{k.toUpperCase()}</text>
        );
      })}
    </svg>
  );
}

// ─── SubmitHeatmap ───────────────────────────────────────────────────
// Grid 7×6: righe = giorni, colonne = fasce di 4 ore. Intensità = conteggio submit.
function SubmitHeatmap({ data }) {
  const days = ["L","M","M","G","V","S","D"];
  const slots = ["0–4","4–8","8–12","12–16","16–20","20–24"];
  const max = Math.max(...data.flat());
  const tone = (v) => {
    if (v === 0) return { bg:"#EEE8DA", text:"transparent" };
    const t = v / max;
    // da paper-2 verso ember
    const alpha = 0.12 + t * 0.82;
    return { bg:`rgba(242,183,68,${alpha.toFixed(2)})`, text: t > 0.6 ? "#0B0B0D" : "#6D6D75" };
  };
  return (
    <div>
      {/* header fasce orarie */}
      <div className="grid gap-1.5 mb-2" style={{gridTemplateColumns:"28px repeat(6, 1fr)"}}>
        <div/>
        {slots.map(s => (
          <div key={s} className="font-mono text-[9px] uppercase tracking-wider text-smoke text-center">{s}</div>
        ))}
      </div>
      {/* righe giorni */}
      {data.map((row, di) => (
        <div key={di} className="grid gap-1.5 mb-1.5" style={{gridTemplateColumns:"28px repeat(6, 1fr)"}}>
          <div className="flex items-center font-mono text-[10px] uppercase tracking-wider text-smoke">{days[di]}</div>
          {row.map((v, hi) => {
            const t = tone(v);
            return (
              <div key={hi} className="h-9 rounded-[2px] flex items-center justify-center font-mono text-[11px] font-medium"
                style={{background:t.bg, color:t.text}}>
                {v > 0 ? v : ""}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

// ─── TopList ─────────────────────────────────────────────────────────
function TopList({ items }) {
  const max = Math.max(...items.map(i => i.value));
  return (
    <div className="flex flex-col gap-3">
      {items.map((it,i) => (
        <div key={i}>
          <div className="flex items-baseline justify-between mb-1.5">
            <div className="flex items-baseline gap-2 min-w-0">
              <span className="font-mono text-[10px] text-smoke">{String(i+1).padStart(2,"0")}</span>
              <span className="text-[13px] truncate">{it.label}</span>
            </div>
            <div className="flex items-baseline gap-2 flex-shrink-0">
              <span className="font-display text-[18px] leading-none">{it.value}</span>
              <span className="font-mono text-[9px] uppercase tracking-wider text-smoke">{it.unit}</span>
              {it.delta && <span className="font-mono text-[10px] text-ember">{it.delta}</span>}
            </div>
          </div>
          <div className="h-1 bg-sand rounded-[1px] overflow-hidden">
            <div className="h-full bg-ink" style={{width:`${(it.value/max)*100}%`}}/>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── LeaderboardCard ─────────────────────────────────────────────────
function LeaderboardCard({ title, kicker, items, tone }) {
  const isInk = tone === "ink";
  const cardCls = isInk ? "bg-ink text-paper" : "bg-paper-2 border border-line";
  const kickerCls = isInk ? "text-[#9E8E82]" : "text-smoke";
  const metricCls = isInk ? "text-[#C9BDB1]" : "text-smoke";
  const rowBorder = isInk ? "border-[#24242A]" : "border-line";
  return (
    <div className={"rounded-[3px] p-6 " + cardCls}>
      <div className={"font-mono text-[10px] uppercase tracking-[0.22em] mb-1 " + kickerCls}>{kicker}</div>
      <div className="font-display text-2xl mb-5">{title}</div>
      {items.map((p,i) => (
        <div key={i} className={"flex items-center gap-4 py-3 border-t first:border-t-0 "+rowBorder}>
          <div className={"font-mono text-[12px] "+kickerCls} style={{width:18}}>{i+1}</div>
          <Avatar initials={p.i} size={34} tone={isInk && i===0 ? "ember" : "ink"}/>
          <div className="flex-1 min-w-0">
            <div className="text-[14px]">{p.name}</div>
            <div className={"font-mono text-[11px] uppercase tracking-wider "+metricCls}>{p.metric}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

Object.assign(window, { CoachDashboard });
