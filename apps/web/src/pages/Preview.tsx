/**
 * Preview — entry point per la versione nativa TSX in sviluppo.
 *
 * URL: /preview/coach/dashboard, /preview/coach/studenti, ecc.
 *
 * Strategia: durante il porting, le pagine native vivono qui sotto
 * /preview/. Quando una pagina è completa e stable, la promuoviamo a
 * route principale (/coach/dashboard, ecc.) sostituendo il fallback
 * iframe del prototipo.
 *
 * In Home.tsx puoi cliccare un pulsante "anteprima vista nativa" che
 * apre /preview/coach/dashboard in una tab parallela.
 */

import { Routes, Route, Navigate } from "react-router-dom";
import { CoachSidebar } from "../components/coach/CoachSidebar";
import { CoachDashboard } from "./coach/Dashboard";
import { MPToastHost } from "../components/ui";

function ComingSoon({ title, prototypeRoute }: { title: string; prototypeRoute?: string }) {
  return (
    <div className="min-h-screen bg-paper">
      <div className="max-w-2xl mx-auto px-10 py-20 text-center">
        <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-smoke mb-3">
          In porting
        </div>
        <h1 className="font-editorial text-[44px] mb-4">
          <span className="italic-ember">{title}</span>
        </h1>
        <p className="text-smoke text-[15px] leading-relaxed max-w-md mx-auto mb-8">
          Questa schermata sta per essere portata in versione nativa. Per ora puoi vederla nel
          prototipo demo.
        </p>
        {prototypeRoute && (
          <a
            href={`/prototype/index.html?persona=coach&device=desktop&dev=1`}
            className="inline-flex h-10 px-4 items-center bg-ink text-paper rounded-[2px] font-display tracking-wider text-[13px] uppercase hover:bg-ink-2 transition"
            target="_blank"
            rel="noreferrer"
          >
            Apri nel prototipo →
          </a>
        )}
      </div>
    </div>
  );
}

export default function Preview() {
  return (
    <div className="flex min-h-screen bg-paper">
      <CoachSidebar />
      <main className="flex-1 min-w-0">
        <Routes>
          <Route path="coach/dashboard" element={<CoachDashboard />} />
          <Route path="coach/studenti" element={<ComingSoon title="Studenti" prototypeRoute="students" />} />
          <Route path="coach/team" element={<ComingSoon title="Team coach" prototypeRoute="team" />} />
          <Route path="coach/libreria" element={<ComingSoon title="Libreria" prototypeRoute="library" />} />
          <Route path="coach/review" element={<ComingSoon title="Da correggere" prototypeRoute="review" />} />
          <Route path="coach/chat" element={<ComingSoon title="Chat" prototypeRoute="chat" />} />
          <Route
            path="coach/impostazioni"
            element={<ComingSoon title="Impostazioni" prototypeRoute="settings" />}
          />
          <Route path="coach" element={<Navigate to="/preview/coach/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/preview/coach/dashboard" replace />} />
        </Routes>
      </main>
      <MPToastHost />
    </div>
  );
}
