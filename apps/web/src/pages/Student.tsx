/**
 * Student — entry point /student/* per la vista nativa TSX studente.
 * Pagine caricate via lazy() per code splitting.
 */

import { Routes, Route, Navigate } from "react-router-dom";
import { Suspense, lazy } from "react";
import { StudentSidebar } from "../components/student/StudentSidebar";
import { MobileNav, MobileNavItem } from "../components/MobileNav";
import { MPToastHost } from "../components/ui";

const StudentHome = lazy(() =>
  import("./student/Home").then((m) => ({ default: m.StudentHome }))
);
const StudentLesson = lazy(() =>
  import("./student/Lesson").then((m) => ({ default: m.StudentLesson }))
);
const StudentExercise = lazy(() =>
  import("./student/Exercise").then((m) => ({ default: m.StudentExercise }))
);
const StudentFeedback = lazy(() =>
  import("./student/Feedback").then((m) => ({ default: m.StudentFeedback }))
);
const StudentChat = lazy(() =>
  import("./student/Chat").then((m) => ({ default: m.StudentChat }))
);
const StudentCommunity = lazy(() =>
  import("./student/Community").then((m) => ({ default: m.StudentCommunity }))
);
const StudentAccount = lazy(() =>
  import("./student/Account").then((m) => ({ default: m.StudentAccount }))
);

const STUDENT_NAV_MOBILE: MobileNavItem[] = [
  { id: "home", label: "Il tuo piano", icon: "home", to: "/student/home" },
  { id: "lesson", label: "Lezione", icon: "play", to: "/student/lezione" },
  { id: "exercise", label: "Esercizio", icon: "record", to: "/student/esercizio", badgeKey: "exercise" },
  { id: "feedback", label: "Feedback", icon: "inbox", to: "/student/feedback", badgeKey: "feedback" },
  { id: "chat", label: "Chat con Marco", icon: "chat", to: "/student/chat", badgeKey: "chat" },
  { id: "community", label: "Community", icon: "users", to: "/student/community" },
];

function PageFallback() {
  return (
    <div className="min-h-full bg-paper flex items-center justify-center">
      <div className="font-mono text-[11px] text-smoke">Carico…</div>
    </div>
  );
}

export default function Student() {
  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-paper">
      <MobileNav nav={STUDENT_NAV_MOBILE} variant="student" />
      <StudentSidebar />
      <main className="flex-1 min-w-0">
        <Suspense fallback={<PageFallback />}>
          <Routes>
            <Route path="home" element={<StudentHome />} />
            <Route path="lezione" element={<StudentLesson />} />
            <Route path="esercizio" element={<StudentExercise />} />
            <Route path="feedback" element={<StudentFeedback />} />
            <Route path="chat" element={<StudentChat />} />
            <Route path="community" element={<StudentCommunity />} />
            <Route path="account" element={<StudentAccount />} />
            <Route path="*" element={<Navigate to="/student/home" replace />} />
          </Routes>
        </Suspense>
      </main>
      <MPToastHost />
    </div>
  );
}
