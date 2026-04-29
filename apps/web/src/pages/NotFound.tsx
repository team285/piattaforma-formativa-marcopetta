/**
 * NotFound — fallback per route non riconosciute.
 * Editorial style coerente col resto dell'app.
 */

import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-paper flex items-center justify-center px-5 md:px-10">
      <div className="max-w-md text-center">
        <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-smoke mb-3">
          Pagina non trovata
        </div>
        <h1 className="font-editorial text-[60px] md:text-[88px] leading-[0.95] mb-6">
          404 — <span className="italic-ember">silenzio</span>.
        </h1>
        <p className="text-smoke text-[15px] leading-relaxed mb-8">
          Questa pagina non esiste, è stata spostata o non hai i permessi per vederla. Torna alla
          home e riparti da lì.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 h-11 px-6 rounded-[2px] bg-ink text-paper text-[13px] font-display uppercase tracking-wider hover:bg-ink-2 transition"
          style={{ fontWeight: 700 }}
        >
          Torna alla home
        </Link>
      </div>
    </div>
  );
}
