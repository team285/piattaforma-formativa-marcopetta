/**
 * Student — entry point /student/* per la vista nativa TSX studente.
 * Sidebar + 6 viste connesse al DB Supabase reale.
 */

import { Routes, Route, Navigate } from "react-router-dom";
import { StudentSidebar } from "../components/student/StudentSidebar";
import { StudentHome } from "./student/Home";
import { StudentLesson } from "./student/Lesson";
import { StudentExercise } from "./student/Exercise";
import { StudentFeedback } from "./student/Feedback";
import { StudentChat } from "./student/Chat";
import { StudentCommunity } from "./student/Community";
import { MPToastHost } from "../components/ui";

export default function Student() {
  return (
    <div className="flex min-h-screen bg-paper">
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
