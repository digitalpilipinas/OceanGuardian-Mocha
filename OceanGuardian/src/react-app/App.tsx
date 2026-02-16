import { BrowserRouter as Router, Routes, Route } from "react-router";
import { AuthProvider } from "@getmocha/users-service/react";
import Layout from "@/react-app/components/Layout";
import { GamificationProvider } from "@/react-app/components/GamificationProvider";
import HomePage from "@/react-app/pages/Home";
import MapViewPage from "@/react-app/pages/MapView";
import ReportSighting from "@/react-app/pages/ReportSighting";
import MissionsPage from "@/react-app/pages/Missions";
import CreateMission from "@/react-app/pages/CreateMission";
import MissionDetail from "@/react-app/pages/MissionDetail";
import ProfilePage from "@/react-app/pages/Profile";
import LeaderboardPage from "@/react-app/pages/Leaderboard";
import AuthCallback from "@/react-app/pages/AuthCallback";
import SettingsPage from "@/react-app/pages/Settings";

import CoralScan from "@/react-app/pages/CoralScan";
import ScientistDashboard from "@/react-app/pages/ScientistDashboard";
import AdminDashboard from "@/react-app/pages/AdminDashboard";
import AmbassadorDashboard from "@/react-app/pages/AmbassadorDashboard";
import { Toaster } from "@/react-app/components/ui/toaster";
import LearningHub from "@/react-app/pages/LearningHub";
import DailyQuiz from "@/react-app/components/DailyQuiz";
import FactLibrary from "@/react-app/components/FactLibrary";
import DeepDiveLessons from "@/react-app/components/DeepDiveLessons";
import LessonView from "@/react-app/pages/LessonView";

export default function App() {
  return (
    <AuthProvider>
      <GamificationProvider>
        <Router>
          <Layout>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/map" element={<MapViewPage />} />
              <Route path="/report" element={<ReportSighting />} />
              <Route path="/coral-scan" element={<CoralScan />} />
              <Route path="/scientist/dashboard" element={<ScientistDashboard />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/ambassador" element={<AmbassadorDashboard />} />
              <Route path="/missions" element={<MissionsPage />} />
              <Route path="/missions/create" element={<CreateMission />} />
              <Route path="/missions/:id" element={<MissionDetail />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/profile/:id" element={<ProfilePage />} />
              <Route path="/leaderboard" element={<LeaderboardPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/learning" element={<LearningHub />} />
              <Route path="/learning/quiz" element={<DailyQuiz />} />
              <Route path="/learning/facts" element={<FactLibrary />} />
              <Route path="/learning/lessons" element={<DeepDiveLessons />} />
              <Route path="/learning/lessons/:slug" element={<LessonView />} />
              <Route path="/auth/callback" element={<AuthCallback />} />
            </Routes>
            <Toaster />
          </Layout>
        </Router>
      </GamificationProvider>
    </AuthProvider>
  );
}

