// ─── Componenti UI condivisi ──────────────────────────────────────────

const { useState, useEffect, useRef, useMemo } = React;

// icona lucide-style come SVG inline (evitiamo dipendenze complesse)
function Icon({ name, size=16, stroke=1.6, className="", color }) {
  const paths = {
    play:      <polygon points="7,5 19,12 7,19" />,
    pause:     <g><rect x="6" y="5" width="4" height="14" /><rect x="14" y="5" width="4" height="14" /></g>,
    record:    <circle cx="12" cy="12" r="6" />,
    chevron:   <polyline points="9 6 15 12 9 18" fill="none" />,
    chevrond:  <polyline points="6 9 12 15 18 9" fill="none" />,
    chevronu:  <polyline points="6 15 12 9 18 15" fill="none" />,
    chevronl:  <polyline points="15 6 9 12 15 18" fill="none" />,
    arrow:     <g><line x1="5" y1="12" x2="19" y2="12"/><polyline points="13 6 19 12 13 18"/></g>,
    mic:       <g><rect x="9" y="3" width="6" height="12" rx="3"/><path d="M5 11a7 7 0 0 0 14 0"/><line x1="12" y1="18" x2="12" y2="22"/></g>,
    video:     <g><rect x="3" y="6" width="13" height="12" rx="2"/><polygon points="16 10 22 6 22 18 16 14"/></g>,
    upload:    <g><path d="M12 16V4"/><polyline points="6 10 12 4 18 10"/><path d="M4 20h16"/></g>,
    paperclip: <path d="M21 11l-8.5 8.5a5 5 0 0 1-7-7L14 4a3.5 3.5 0 0 1 5 5L10.5 17.5a2 2 0 0 1-3-3L15 7"/>,
    check:     <polyline points="4 12 10 18 20 6" fill="none"/>,
    x:         <g><line x1="6" y1="6" x2="18" y2="18"/><line x1="18" y1="6" x2="6" y2="18"/></g>,
    search:    <g><circle cx="11" cy="11" r="7"/><line x1="16.5" y1="16.5" x2="21" y2="21"/></g>,
    plus:      <g><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></g>,
    send:      <g><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></g>,
    folder:    <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>,
    home:      <g><path d="M3 11l9-8 9 8"/><path d="M5 10v10h14V10"/></g>,
    book:      <path d="M4 4h11a4 4 0 0 1 4 4v12a3 3 0 0 0-3-3H4z"/>,
    users:     <g><circle cx="9" cy="8" r="3.5"/><path d="M2 20a7 7 0 0 1 14 0"/><circle cx="17" cy="9" r="3"/><path d="M16 20a5 5 0 0 1 6-4"/></g>,
    inbox:     <g><path d="M3 13l3-8h12l3 8"/><path d="M3 13v6a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-6h-6a2 2 0 0 1-4 0H3z"/></g>,
    chat:      <path d="M4 4h16v12H8l-4 4z"/>,
    settings:  <g><circle cx="12" cy="12" r="3"/><path d="M19 12a7 7 0 0 0-.1-1.2l2-1.6-2-3.4-2.4.9a7 7 0 0 0-2-1.2L14 3h-4l-.5 2.5a7 7 0 0 0-2 1.2l-2.4-.9-2 3.4 2 1.6A7 7 0 0 0 5 12a7 7 0 0 0 .1 1.2l-2 1.6 2 3.4 2.4-.9a7 7 0 0 0 2 1.2L10 21h4l.5-2.5a7 7 0 0 0 2-1.2l2.4.9 2-3.4-2-1.6A7 7 0 0 0 19 12z"/></g>,
    calendar:  <g><rect x="3" y="5" width="18" height="16" rx="2"/><line x1="3" y1="10" x2="21" y2="10"/><line x1="8" y1="3" x2="8" y2="7"/><line x1="16" y1="3" x2="16" y2="7"/></g>,
    clock:     <g><circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 16 14"/></g>,
    loop:      <g><polyline points="17 3 21 7 17 11"/><path d="M3 13v-2a4 4 0 0 1 4-4h14"/><polyline points="7 21 3 17 7 13"/><path d="M21 11v2a4 4 0 0 1-4 4H3"/></g>,
    speed:     <g><circle cx="12" cy="13" r="8"/><path d="M12 13l4-3"/><path d="M8 3h8"/></g>,
    bookmark:  <path d="M6 3h12v18l-6-4-6 4z"/>,
    note:      <g><path d="M5 4h10l4 4v12H5z"/><path d="M15 4v4h4"/></g>,
    bell:      <g><path d="M6 9a6 6 0 0 1 12 0v5l2 2H4l2-2z"/><path d="M10 20a2 2 0 0 0 4 0"/></g>,
    pencil:    <g><path d="M4 20l4-1 11-11-3-3L5 16z"/><line x1="14" y1="6" x2="17" y2="9"/></g>,
    file:      <g><path d="M6 3h8l4 4v14H6z"/><path d="M14 3v4h4"/></g>,
    music:     <g><path d="M9 18V6l10-2v12"/><circle cx="7" cy="18" r="2.5"/><circle cx="17" cy="16" r="2.5"/></g>,
    frame:     <g><rect x="3" y="5" width="18" height="14" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/><line x1="8" y1="5" x2="8" y2="19"/><line x1="16" y1="5" x2="16" y2="19"/></g>,
    tag:       <g><path d="M3 12V4h8l10 10-8 8z"/><circle cx="7.5" cy="7.5" r="1.2" fill="currentColor" stroke="none"/></g>,
    download:  <g><path d="M12 4v12"/><polyline points="6 10 12 16 18 10"/><path d="M4 20h16"/></g>,
    star:      <polygon points="12 3 15 9.5 22 10.3 17 15 18.3 22 12 18.5 5.7 22 7 15 2 10.3 9 9.5"/>,
    sparkle:   <g><path d="M12 3v18"/><path d="M3 12h18"/><path d="M5.5 5.5l13 13"/><path d="M18.5 5.5l-13 13"/></g>,
    eye:       <g><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></g>,
    grid:      <g><rect x="4" y="4" width="7" height="7"/><rect x="13" y="4" width="7" height="7"/><rect x="4" y="13" width="7" height="7"/><rect x="13" y="13" width="7" height="7"/></g>,
    list:      <g><line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="18" x2="20" y2="18"/></g>,
    filter:    <polygon points="3 4 21 4 14 13 14 21 10 19 10 13"/>,
    menu:      <g><line x1="4" y1="7" x2="20" y2="7"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="17" x2="20" y2="17"/></g>,
    warning:   <g><path d="M12 4l10 17H2z"/><line x1="12" y1="10" x2="12" y2="15"/><circle cx="12" cy="18" r="0.6" fill="currentColor"/></g>,
    tip:       <g><path d="M9 18h6"/><path d="M10 21h4"/><path d="M12 3a6 6 0 0 0-4 10.5c1 1 1.5 2 1.5 3.5h5c0-1.5.5-2.5 1.5-3.5A6 6 0 0 0 12 3z"/></g>,
    skip:      <g><polygon points="5 4 15 12 5 20"/><line x1="19" y1="5" x2="19" y2="19"/></g>,
    rewind:    <g><polygon points="19 20 9 12 19 4"/><line x1="5" y1="5" x2="5" y2="19"/></g>,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" className={className} style={color?{color}:undefined}>
      {paths[name]}
    </svg>
  );
}

// Thumbnail placeholder: striscia diagonale con etichetta mono
function Thumb({ label="video", dark=true, aspect="16/9", children, className="", ember=false }) {
  return (
    <div className={"relative overflow-hidden rounded-[3px] "+(dark?"bg-ink-2":"bg-sand")+" "+className} style={{aspectRatio:aspect}}>
      <div className={"absolute inset-0 "+(dark?"thumb-stripe":"thumb-stripe-light")+" opacity-80"} />
      <div className="absolute inset-0 flex items-end p-3">
        <div className={"font-mono text-[10px] tracking-widest uppercase "+(dark?"text-[#9E8E82]":"text-[#6B625B]")}>{label}</div>
      </div>
      {ember && <div className="absolute top-3 left-3 w-1.5 h-1.5 rounded-full bg-ember"></div>}
      {children}
    </div>
  );
}

// Avatar: iniziali, stile editorial — tone="ember" ora è AMBER con testo ink
function Avatar({ initials="MP", size=36, tone="ink", ring=false }) {
  const bg = tone==="ink" ? "var(--ink-3)" : tone==="ember" ? "var(--amber)" : "var(--sand)";
  const fg = (tone==="sand" || tone==="ember") ? "var(--ink)" : "var(--paper)";
  return (
    <div
      className={"flex items-center justify-center font-display tracking-tight "+(ring?"ring-2 ring-offset-2 ring-[var(--amber)] ring-offset-[var(--ink)]":"")}
      style={{width:size,height:size,borderRadius:99,background:bg,color:fg,fontSize:size*0.42,fontWeight:700}}
    >
      {initials}
    </div>
  );
}

// Tag sand
function Tag({ children, dark=false }) {
  return <span className={"inline-flex items-center font-mono text-[10px] tracking-widest uppercase px-1.5 py-0.5 rounded-sm "+(dark?"bg-ink-3 text-[#C9BDB1]":"bg-[#E3DCCE] text-[#4A4039]")}>{children}</span>;
}

// Pulsante Ember — REMAPPED: ora AMBER primary con testo INK (come il CTA "INIZIA" nello screen)
function EmberButton({ children, size="md", icon, onClick, disabled, full=false, outline=false, tone="amber" }) {
  const sizeCls = size==="sm" ? "h-8 px-3 text-[12px]" : size==="lg" ? "h-12 px-6 text-[14px]" : "h-10 px-4 text-[13px]";
  let base;
  if (outline) {
    base = "border border-[var(--amber)] text-[var(--amber)] hover:bg-[var(--amber)] hover:text-black";
  } else if (tone === "gradient") {
    base = "gradient-amber text-black hover:brightness-110";
  } else if (tone === "red") {
    base = "bg-[var(--ember)] text-white hover:bg-[var(--ember-2)]";
  } else {
    // default AMBER
    base = "bg-[var(--amber)] text-black hover:bg-[var(--amber-2)]";
  }
  return (
    <button onClick={onClick} disabled={disabled} className={"inline-flex items-center justify-center gap-2 font-display tracking-[0.06em] uppercase transition rounded-[2px] "+sizeCls+" "+base+(full?" w-full":"")+(disabled?" opacity-40 cursor-not-allowed":"")} style={{fontWeight:700}}>
      {icon && <Icon name={icon} size={size==="sm"?13:15}/>}
      {children}
    </button>
  );
}

// Pill colorato per stati
function StatusPill({ status }) {
  const map = {
    "completed":   { label:"Completata",        bg:"rgba(123,176,123,0.14)", fg:"#7BB07B" },
    "in-progress": { label:"In corso",          bg:"rgba(242,183,68,0.18)",  fg:"#F2B744" },
    "new":         { label:"Da guardare",       bg:"rgba(242,183,68,0.14)",  fg:"#F2B744" },
    "assigned":    { label:"Da consegnare",     bg:"rgba(242,242,242,0.08)", fg:"#9A9AA2" },
    "delivered":   { label:"Consegnato",        bg:"rgba(242,183,68,0.18)",  fg:"#F2B744" },
    "feedback":    { label:"Feedback ricevuto", bg:"rgba(214,56,41,0.14)",   fg:"#E04A3A" },
    "archived":    { label:"Archiviato",        bg:"transparent",            fg:"#6D6D75" },
  };
  const s = map[status] || map["new"];
  return (
    <span className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider px-2 py-1 rounded-sm" style={{background:s.bg,color:s.fg}}>
      <span className="marquee-dot" style={{background:s.fg}}></span>{s.label}
    </span>
  );
}

// Section heading editoriale — ora poster-rock (Big Shoulders heavy, allineato al sito)
function EditorialH({ kicker, children, className="", dark=false }) {
  const headingColor = dark ? "text-paper" : "text-ink";
  return (
    <div className={className}>
      {kicker && <div className={"font-mono text-[10px] uppercase tracking-[0.22em] mb-3 "+(dark?"text-[var(--amber)]":"text-smoke")}>{kicker}</div>}
      <h2 className={"font-editorial text-4xl md:text-5xl "+headingColor}>{children}</h2>
    </div>
  );
}

// Waveform audio / video placeholder
function Waveform({ dark=true, dots=[], className="", progress=0 }) {
  const bars = 120;
  return (
    <div className={"relative w-full h-14 "+className}>
      <svg viewBox={`0 0 ${bars*3} 56`} preserveAspectRatio="none" className="w-full h-full">
        {Array.from({length:bars}).map((_,i)=>{
          const h = 6 + Math.abs(Math.sin(i*0.42)+Math.cos(i*0.17))*20 + (i%7===0?10:0);
          const x = i*3;
          const past = (i/bars) < progress;
          return <rect key={i} x={x} y={28-h/2} width={1.6} height={h} fill={past? "var(--amber)" : (dark?"#2A2A30":"#D4C9B6")} />
        })}
      </svg>
      {dots.map((d,i)=>(
        <div key={i} className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2" style={{left:`calc(${d.t*100}% - 6px)`, background: d.color, borderColor: dark?"#0B0B0D":"#F5F3ED"}} />
      ))}
    </div>
  );
}

function AnnotationColor(type) {
  if (type==="ok")       return "#7BB07B";
  if (type==="tip")      return "#F2B744";
  if (type==="warning")  return "#E04A3A";
  if (type==="video")    return "#D63829";
  return "#9A9AA2";
}

// Toast globale — uso: window.mpToast("Feedback inviato", "ok" | "info" | "warn")
function MPToastHost() {
  const [toasts, setToasts] = React.useState([]);
  React.useEffect(()=>{
    const handler = (e) => {
      const id = Math.random().toString(36).slice(2);
      const t = { id, ...e.detail };
      setToasts(prev => [...prev, t]);
      setTimeout(()=> setToasts(prev => prev.filter(x => x.id !== id)), 2600);
    };
    window.addEventListener("mp-toast", handler);
    return ()=> window.removeEventListener("mp-toast", handler);
  }, []);
  return (
    <div style={{position:"fixed", bottom:20, left:"50%", transform:"translateX(-50%)", zIndex:10000, display:"flex", flexDirection:"column", gap:8, alignItems:"center", pointerEvents:"none"}}>
      {toasts.map(t => {
        const palette = t.tone === "warn"
          ? { bg:"#E04A3A", fg:"#fff", icon:"warning" }
          : t.tone === "info"
          ? { bg:"#141417", fg:"#F5F3ED", icon:"bell" }
          : { bg:"#F2B744", fg:"#0B0B0D", icon:"check" };
        return (
          <div key={t.id} style={{
            background: palette.bg, color: palette.fg,
            padding:"10px 16px", borderRadius:3, minWidth:240, maxWidth:420,
            fontFamily:"'Big Shoulders Display',sans-serif", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.04em", fontSize:13,
            display:"flex", alignItems:"center", gap:10,
            boxShadow:"0 10px 32px rgba(0,0,0,0.4)",
            animation:"mpToastIn 0.22s ease-out",
          }}>
            <Icon name={palette.icon} size={14}/>
            <span>{t.message}</span>
          </div>
        );
      })}
      <style>{`@keyframes mpToastIn { from { opacity:0; transform: translateY(8px);} to { opacity:1; transform:none;} }`}</style>
    </div>
  );
}

window.mpToast = (message, tone="ok") => {
  window.dispatchEvent(new CustomEvent("mp-toast", { detail: { message, tone } }));
};

Object.assign(window, {
  Icon, Thumb, Avatar, Tag, EmberButton, StatusPill, EditorialH, Waveform, AnnotationColor, MPToastHost,
});
