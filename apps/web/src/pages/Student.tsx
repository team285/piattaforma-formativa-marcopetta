/**
 * Student — entry point /student/* per la vista nativa TSX studente.
 * Sidebar + 6 viste connesse al DB Supabase reale.
 */

import { Routes, Route, Navigate } from "react-router-dom";
import { StudentSidebar } from "../components/student/StudentSidebar";
import { MobileNav, MobileNavItem } from "../components/MobileNav";
import { StudentHome } from "./student/Home";
import { StudentLesson } from "./student/Lesson";
import { StudentExercise } from "./student/Exercise";
import { StudentFeedback } from "./student/Feedback";
import { StudentChat } from "./student/Chat";
import { StudentCommunity } from "./student/Community";
import { MPToastHost } from "../components/ui";

const STUDENT_NAV_MOBILE: MobileNavItem[] = [
  { id: "home", label: "Il tuo piano", icon: "home", to: "/student/home" },
  { id: "lesson", label: "Lezione", icon: "play", to: "/student/lezione" },
  { id: "exercise", label: "Esercizio", icon: "record", to: "/student/esercizio" },
  { id: "feedback", label: "Feedback", icon: "inbox", to: "/student/feedback" },
  { id: "chat", label: "Chat con Marco", icon: "chat", to: "/student/chat" },
  { id: "community", label: "Community", icon: "users", to: "/student/community" },
];

export default function Student() {
  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-paper">
      <MobileNav nav={STUDENT_NAV_MOBILE} variant="student" />
      <StudentSidebar />
      <main className="flex-1 min-w-0">
        <Routes>
          <Route path="home" element={<StudentHome />} />
          <Route path="lezione" element={<StudentLesson />} />
          <Route path="esercizio" element={<StudentExercise />} />
          <Route path="feedback" element={<StudentFeedback />} />
          <Route path="chat" element={<StudentChat />} />
          <Route path="community" element={<StudentCommunity />} />
          <Route path="*" element={<Navigate to="/student/home" replace />} />
        </Routes>
      </main>
      <MPToastHost />
    </div>
  );
}
