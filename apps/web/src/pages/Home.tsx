import { useAuth } from "../lib/auth";
import { useState } from "react";

/**
 * Home — l'intero prototipo MPCoach servito come iframe full-screen.
 *
 * Strategia di porting:
 * - Il prototipo (21 schermate JSX, ViewSwitch, dati mock) è copiato in
 *   public/prototype/ e servito statico da Vercel.
 * - Il login Supabase è la cornice esterna: per vedere il prototipo
 *   bisogna essere autenticati.
 * - Sessioni successive: porteremo gradualmente le pagine in TSX nativo
 *   collegate al DB Supabase, sostituendo pezzi dell'iframe.
 */
export default function Home() {
  const { profile, signOut } = useAuth();
  const [headerOpen, setHeaderOpen] = useState(true);

  if (!profile) {
    return (
      <div className="min-h-screen bg-ink text-paper flex items-center justify-center">
        <div className="text-smoke-2 font-mono text-sm">Caricamento profilo…</div>
      </div>
    );
  }

  return (
    <div style={{ position: "fixed", inset: 0, background: "#0B0B0D" }}>
      {/* Mini header sticky con info user + logout (collassabile) */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          background: "rgba(11,11,13,0.92)",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
          color: "#F5F3ED",
          borderBottom: "1px solid #24242A",
          height: headerOpen ? 36 : 14,
          transition: "height 0.2s ease",
          display: "flex",
          alignItems: "center",
          padding: headerOpen ? "0 16px" : 0,
          fontFamily: "JetBrains Mono, monospace",
          fontSize: 10,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          gap: 12,
          overflow: "hidden",
        }}
      >
        {headerOpen && (
          <>
            <span style={{ color: "#F2B744", fontWeight: 600 }}>MPCoach</span>
            <span style={{ color: "#6D6D75" }}>·</span>
            <span style={{ color: "#9A9AA2" }}>
              {profile.full_name} · {profile.role}
            </span>
            <span style={{ flex: 1 }} />
            <button
              onClick={() => setHeaderOpen(false)}
              style={{
                background: "transparent",
                border: "none",
                color: "#6D6D75",
                cursor: "pointer",
                fontSize: 10,
                fontFamily: "inherit",
                letterSpacing: "0.18em",
                textTransform: "uppercase",
              }}
              title="Nascondi barra"
            >
              nascondi
            </button>
            <button
              onClick={signOut}
              style={{
                background: "transparent",
                border: "1px solid #24242A",
                color: "#F2B744",
                padding: "4px 10px",
                borderRadius: 2,
                cursor: "pointer",
                fontSize: 10,
                fontFamily: "inherit",
                letterSpacing: "0.18em",
                textTransform: "uppercase",
              }}
            >
              esci
            </button>
          </>
        )}
        {!headerOpen && (
          <button
            onClick={() => setHeaderOpen(true)}
            style={{
              position: "absolute",
              top: 0,
              left: "50%",
              transform: "translateX(-50%)",
              background: "rgba(242,183,68,0.15)",
              border: "1px solid rgba(242,183,68,0.4)",
              color: "#F2B744",
              padding: "1px 12px",
              borderRadius: "0 0 4px 4px",
              cursor: "pointer",
              fontSize: 9,
              fontFamily: "JetBrains Mono, monospace",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              borderTop: "none",
            }}
            title="Mostra barra"
          >
            ↓ MPCoach ↓
          </button>
        )}
      </div>

      {/* Iframe del prototipo full-screen */}
      <iframe
        src="/prototype/index.html"
        title="MPCoach — applicazione"
        style={{
          position: "absolute",
          top: headerOpen ? 36 : 14,
          left: 0,
          right: 0,
          bottom: 0,
          width: "100%",
          height: headerOpen ? "calc(100% - 36px)" : "calc(100% - 14px)",
          border: "none",
          transition: "top 0.2s ease, height 0.2s ease",
        }}
      />
    </div>
  );
}
