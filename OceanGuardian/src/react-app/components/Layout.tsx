import { useLocation } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import OceanBackground from "@/react-app/components/OceanBackground";
import Sidebar from "@/react-app/components/Sidebar";
import BottomNav from "@/react-app/components/BottomNav";
import TopBar from "@/react-app/components/TopBar";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();

  const isLandingPage = location.pathname === "/" || location.pathname === "/login";

  if (isLandingPage) {
    return (
        <div className="min-h-screen bg-background relative selection:bg-primary/30">
        <main className="relative z-10 transition-all duration-500">
          <AnimatePresence>
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-background text-foreground overflow-hidden selection:bg-primary/30">
      {/* Ocean Background Layer */}
      <OceanBackground bubbleDensity="low" variant="deep" />

      {/* Desktop Navigation */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden relative z-10">
        <TopBar />

        <main className="flex-1 overflow-y-auto overflow-x-hidden pt-4 pb-28 md:pb-8 px-4 md:px-8">
          <div className="max-w-7xl mx-auto">
            <AnimatePresence>
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, scale: 0.98, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 1.02, y: -10 }}
                transition={{ duration: 0.18, ease: [0.23, 1, 0.32, 1] }}
                className="w-full"
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>

        {/* Mobile Navigation */}
        <BottomNav />
      </div>
    </div>
  );
}
