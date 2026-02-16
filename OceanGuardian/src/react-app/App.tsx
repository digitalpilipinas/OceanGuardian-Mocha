import { BrowserRouter as Router, Routes, Route } from "react-router";
import { Suspense, lazy } from "react";
import Layout from "@/react-app/components/Layout";
import { GamificationProvider } from "@/react-app/components/GamificationProvider";
import { Toaster } from "@/react-app/components/ui/toaster";

// Lazy load pages
const HomePage = lazy(() => import("@/react-app/pages/Home"));
const MapViewPage = lazy(() => import("@/react-app/pages/MapView"));
const ReportSighting = lazy(() => import("@/react-app/pages/ReportSighting"));
const MissionsPage = lazy(() => import("@/react-app/pages/Missions"));
const CreateMission = lazy(() => import("@/react-app/pages/CreateMission"));
const MissionDetail = lazy(() => import("@/react-app/pages/MissionDetail"));
const ProfilePage = lazy(() => import("@/react-app/pages/Profile"));
const LeaderboardPage = lazy(() => import("@/react-app/pages/Leaderboard"));
const SignIn = lazy(() => import("@/react-app/pages/SignIn"));
const SettingsPage = lazy(() => import("@/react-app/pages/Settings"));

const CoralScan = lazy(() => import("@/react-app/pages/CoralScan"));
const ScientistDashboard = lazy(() => import("@/react-app/pages/ScientistDashboard"));
const AdminDashboard = lazy(() => import("@/react-app/pages/AdminDashboard"));
const AmbassadorDashboard = lazy(() => import("@/react-app/pages/AmbassadorDashboard"));

const LearningHub = lazy(() => import("@/react-app/pages/LearningHub"));
const LessonView = lazy(() => import("@/react-app/pages/LessonView"));
const LandingPage = lazy(() => import("@/react-app/pages/LandingPage"));

// Components loaded as pages or large heavy components
const DailyQuiz = lazy(() => import("@/react-app/components/DailyQuiz"));
const FactLibrary = lazy(() => import("@/react-app/components/FactLibrary"));
const DeepDiveLessons = lazy(() => import("@/react-app/components/DeepDiveLessons"));

export default function App() {
  return (
    <GamificationProvider>
      <Router>
        <Layout>
          <Suspense
            fallback={
              <div className="flex items-center justify-center min-h-[50vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sky-500"></div>
              </div>
            }
          >
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/dashboard" element={<HomePage />} />
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
              <Route path="/login" element={<SignIn />} />
            </Routes>
          </Suspense>
          <Toaster />
        </Layout>
      </Router>
    </GamificationProvider>
  );
}

