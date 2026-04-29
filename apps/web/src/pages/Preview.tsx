/**
 * Preview / Coach — vista nativa TSX collegata al DB.
 *
 * Stesso componente montato sia su /coach/* (canonical) che /preview/* (legacy).
 * Pagine caricate via lazy() per code splitting (riduce bundle iniziale).
 */

import { Routes, Route, Navigate } from "react-router-dom";
import { Suspense, lazy } from "react";
import { CoachSidebar } from "../components/coach/CoachSidebar";
import { MobileNav, MobileNavItem } from "../components/MobileNav";
import { MPToastHost } from "../components/ui";

const CoachDashboard = lazy(() =>
  import("./coach/Dashboard").then((m) => ({ default: m.CoachDashboard }))
);
const CoachStudenti = lazy(() =>
  import("./coach/Studenti").then((m) => ({ default: m.CoachStudenti }))
);
const CoachStudentDetail = lazy(() =>
  import("./coach/StudentDetail").then((m) => ({ default: m.CoachStudentDetail }))
);
const CoachImpostazioni = lazy(() =>
  import("./coach/Impostazioni").then((m) => ({ default: m.CoachImpostazioni }))
);
const CoachTeam = lazy(() => import("./coach/Team").then((m) => ({ default: m.CoachTeam })));
const CoachLibreria = lazy(() =>
  import("./coach/Libreria").then((m) => ({ default: m.CoachLibreria }))
);
const CoachReview = lazy(() =>
  import("./coach/Review").then((m) => ({ default: m.CoachReview }))
);
const CoachReviewDetail = lazy(() =>
  import("./coach/ReviewDetail").then((m) => ({ default: m.CoachReviewDetail }))
);
const CoachChat = lazy(() => import("./coach/Chat").then((m) => ({ default: m.CoachChat })));

const COACH_NAV_MOBILE: MobileNavItem[] = [
  { id: "dashboard", label: "Overview", icon: "home", to: "/coach/dashboard" },
  { id: "students", label: "Studenti", icon: "grid", to: "/coach/studenti" },
  { id: "team", label: "Team coach", icon: "users", to: "/coach/team" },
  { id: "library", label: "Libreria", icon: "book", to: "/coach/libreria" },
  { id: "review", label: "Da correggere", icon: "inbox", to: "/coach/review", badgeKey: "review" },
  { id: "chat", label: "Chat", icon: "chat", to: "/coach/chat", badgeKey: "chat" },
  { id: "settings", label: "Impostazioni", icon: "settings", to: "/coach/impostazioni" },
];

function PageFallback() {
  return (
    <div className="min-h-full bg-paper flex items-center justify-center">
      <div className="font-mono text-[11px] text-smoke">Carico…</div>
    </div>
  );
}

export default function Preview() {
  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-paper">
      <MobileNav nav={COACH_NAV_MOBILE} variant="coach" />
      <CoachSidebar />
      <main className="flex-1 min-w-0">
        <Suspense fallback={<PageFallback />}>
          <Routes>
            {/* Mount canonical: /coach/* */}
            <Route path="dashboard" element={<CoachDashboard />} />
            <Route path="studenti" element={<CoachStudenti />} />
            <Route path="studenti/:id" element={<CoachStudentDetail />} />
            <Route path="team" element={<CoachTeam />} />
            <Route path="libreria" element={<CoachLibreria />} />
            <Route path="review" element={<CoachReview />} />
            <Route path="review/:id" element={<CoachReviewDetail />} />
            <Route path="chat" element={<CoachChat />} />
            <Route path="impostazioni" element={<CoachImpostazioni />} />

            {/* Mount legacy: /preview/coach/* */}
            <Route path="coach/dashboard" element={<CoachDashboard />} />
            <Route path="coach/studenti" element={<CoachStudenti />} />
            <Route path="coach/studenti/:id" element={<CoachStudentDetail />} />
            <Route path="coach/team" element={<CoachTeam />} />
            <Route path="coach/libreria" element={<CoachLibreria />} />
            <Route path="coach/review" element={<CoachReview />} />
            <Route path="coach/review/:id" element={<CoachReviewDetail />} />
            <Route path="coach/chat" element={<CoachChat />} />
            <Route path="coach/impostazioni" element={<CoachImpostazioni />} />
            <Route path="coach" element={<Navigate to="/coach/dashboard" replace />} />

            <Route path="*" element={<Navigate to="/coach/dashboard" replace />} />
          </Routes>
        </Suspense>
      </main>
      <MPToastHost />
    </div>
  );
}
