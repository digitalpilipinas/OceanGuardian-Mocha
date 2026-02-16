import { BrowserRouter as Router, Routes, Route } from "react-router";
import { AuthProvider } from "@getmocha/users-service/react";
import Layout from "@/react-app/components/Layout";
import HomePage from "@/react-app/pages/Home";
import MapViewPage from "@/react-app/pages/MapView";
import ReportSighting from "@/react-app/pages/ReportSighting";
import MissionsPage from "@/react-app/pages/Missions";
import ProfilePage from "@/react-app/pages/Profile";
import AuthCallback from "@/react-app/pages/AuthCallback";

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/map" element={<MapViewPage />} />
            <Route path="/report" element={<ReportSighting />} />
            <Route path="/missions" element={<MissionsPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
          </Routes>
        </Layout>
      </Router>
    </AuthProvider>
  );
}
