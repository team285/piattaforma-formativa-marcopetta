/**
 * Preview — entry point per la versione nativa TSX in sviluppo.
 *
 * URL: /preview/coach/dashboard, /preview/coach/studenti, ecc.
 *
 * Quando le pagine native sono complete e stabili, le promuoviamo a
 * route principale (/coach/...) sostituendo l'iframe del prototipo.
 */

import { Routes, Route, Navigate } from "react-router-dom";
import { CoachSidebar } from "../components/coach/CoachSidebar";
import { CoachDashboard } from "./coach/Dashboard";
import { CoachStudenti } from "./coach/Studenti";
import { CoachImpostazioni } from "./coach/Impostazioni";
import { CoachTeam } from "./coach/Team";
import { CoachLibreria } from "./coach/Libreria";
import { CoachReview } from "./coach/Review";
import { CoachChat } from "./coach/Chat";
import { MPToastHost } from "../components/ui";

export default function Preview() {
  return (
    <div className="flex min-h-screen bg-paper">
      <CoachSidebar />
      <main className="flex-1 min-w-0">
        <Routes>
          <Route path="coach/dashboard" element={<CoachDashboard />} />
          <Route path="coach/studenti" element={<CoachStudenti />} />
          <Route path="coach/team" element={<CoachTeam />} />
          <Route path="coach/libreria" element={<CoachLibreria />} />
          <Route path="coach/review" element={<CoachReview />} />
          <Route path="coach/chat" element={<CoachChat />} />
          <Route path="coach/impostazioni" element={<CoachImpostazioni />} />
          <Route path="coach" element={<Navigate to="/preview/coach/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/preview/coach/dashboard" replace />} />
        </Routes>
      </main>
      <MPToastHost />
    </div>
  );
}
