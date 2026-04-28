/**
 * Preview / Coach — vista nativa TSX collegata al DB.
 *
 * Stesso componente montato sia su /coach/* (canonical) che /preview/* (legacy).
 * Le route inner sono replicate per coprire entrambi i base path:
 *   - /coach/dashboard       → relativo "dashboard"
 *   - /preview/coach/dashboard → relativo "coach/dashboard"
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
          {/* Mount canonical: /coach/* */}
          <Route path="dashboard" element={<CoachDashboard />} />
          <Route path="studenti" element={<CoachStudenti />} />
          <Route path="team" element={<CoachTeam />} />
          <Route path="libreria" element={<CoachLibreria />} />
          <Route path="review" element={<CoachReview />} />
          <Route path="chat" element={<CoachChat />} />
          <Route path="impostazioni" element={<CoachImpostazioni />} />

          {/* Mount legacy: /preview/coach/* */}
          <Route path="coach/dashboard" element={<CoachDashboard />} />
          <Route path="coach/studenti" element={<CoachStudenti />} />
          <Route path="coach/team" element={<CoachTeam />} />
          <Route path="coach/libreria" element={<CoachLibreria />} />
          <Route path="coach/review" element={<CoachReview />} />
          <Route path="coach/chat" element={<CoachChat />} />
          <Route path="coach/impostazioni" element={<CoachImpostazioni />} />
          <Route path="coach" element={<Navigate to="/coach/dashboard" replace />} />

          <Route path="*" element={<Navigate to="/coach/dashboard" replace />} />
        </Routes>
      </main>
      <MPToastHost />
    </div>
  );
}
