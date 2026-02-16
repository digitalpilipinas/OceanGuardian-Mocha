import { Waves, Map, Award, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import { CardContent } from "@/react-app/components/ui/card";
import { Button } from "@/react-app/components/ui/button";
import ActivityFeed from "@/react-app/components/ActivityFeed";
import { useUserProfile } from "@/react-app/hooks/useUserProfile";
import WelcomeHeader from "@/react-app/components/dashboard/WelcomeHeader";
import DashboardStats from "@/react-app/components/dashboard/DashboardStats";
import MapPreview from "@/react-app/components/dashboard/MapPreview";
import MissionsCarousel from "@/react-app/components/dashboard/MissionsCarousel";
import DailyQuizCTA from "@/react-app/components/dashboard/DailyQuizCTA";

export default function Home() {
  const { profile: user } = useUserProfile();

  if (user) {
    return (
      <div className="container mx-auto py-8">
        <WelcomeHeader />

        <DashboardStats />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 mb-10">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-12">

            {/* Live Map Preview */}
            <div className="p-2 rounded-[2.5rem] bg-secondary border border-white/10 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.6)] overflow-hidden">
              <div className="h-[500px] rounded-[2.2rem] overflow-hidden border border-white/5 shadow-inner">
                <MapPreview />
              </div>
            </div>

            {/* Active Missions */}
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <h2 className="text-3xl font-black text-white tracking-tighter flex items-center gap-4">
                  <div className="p-4 rounded-[1.5rem] bg-white/5 border border-white/10">
                    <Award className="h-8 w-8 text-primary" />
                  </div>
                  Active <span className="text-primary italic">Missions</span>
                </h2>
                <Button variant="ghost" className="h-12 rounded-2xl px-6 bg-white/5 hover:bg-white/10 text-[10px] font-black uppercase tracking-widest text-white/60 hover:text-white transition-all group">
                  View All <TrendingUp className="ml-3 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
              <MissionsCarousel />
            </div>

          </div>

          {/* Sidebar Area */}
          <div className="space-y-12">
            <DailyQuizCTA />

            <div className="space-y-8">
              <h2 className="text-2xl font-black text-white tracking-tighter flex items-center gap-4">
                <div className="p-4 rounded-[1.5rem] bg-white/5 border border-white/10">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
                Guardian <span className="text-primary italic">Pulse</span>
              </h2>
              <div className="h-[600px] border border-white/10 bg-secondary overflow-hidden rounded-[2.5rem] shadow-2xl">
                <CardContent className="p-0 h-full">
                  <ActivityFeed />
                </CardContent>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Guest View (Landing Page)
  return (
    <div className="container mx-auto px-4 py-8 pb-20 md:pb-8">
      {/* Hero Section */}
      <section className="text-center py-24 md:py-32 relative overflow-hidden">
        <motion.div
          animate={{
            rotate: [0, 90, 180, 270, 360],
            scale: [1, 1.2, 1, 1.2, 1]
          }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          className="absolute -top-40 -left-20 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px] pointer-events-none opacity-50"
        />
        <motion.div
          animate={{
            rotate: [360, 270, 180, 90, 0],
            scale: [1, 1.3, 1, 1.3, 1]
          }}
          transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-40 -right-20 w-[600px] h-[600px] bg-accent/10 rounded-full blur-[120px] pointer-events-none opacity-30"
        />

        <div className="inline-flex items-center justify-center p-6 bg-secondary/60 border border-white/10 rounded-[2.5rem] mb-12 shadow-2xl relative z-10">
          <Waves className="h-16 w-16 text-primary animate-pulse" />
        </div>
        <h1 className="text-5xl md:text-8xl font-black mb-6 bg-gradient-to-b from-white to-white/60 bg-clip-text text-transparent tracking-tighter uppercase relative z-10 leading-[0.9]">
          Deep Ocean <br />
          <span className="text-accent italic">Intelligence</span>
        </h1>
        <p className="text-xl md:text-2xl text-white/40 mb-12 max-w-2xl mx-auto font-black uppercase tracking-[0.4em] italic relative z-10">
          The Future of Marine Conservation
        </p>
        <div className="flex flex-col sm:flex-row gap-6 justify-center relative z-10">
          <Button size="lg" className="text-xs px-12 h-16 bg-primary text-white rounded-2xl font-black uppercase tracking-[0.3em] hover:scale-105 transition-all shadow-2xl shadow-primary/30" asChild>
            <a href="/map">
              <Map className="mr-4 h-5 w-5" />
              Engage Map
            </a>
          </Button>
          <Button size="lg" className="text-xs px-12 h-16 bg-white/5 border border-white/10 text-white rounded-2xl font-black uppercase tracking-[0.3em] hover:bg-white/10 transition-all">
            Initialize Protocol
          </Button>
        </div>
      </section>

      {/* Quick Stats & Activity Feed */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-10 mb-20 relative z-10">
        <div className="lg:col-span-2 space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-10 bg-secondary/60 border border-white/5 rounded-[3rem] shadow-2xl relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="flex justify-between items-start mb-6">
                <p className="text-[10px] font-black uppercase tracking-widest text-white/20">Total Sightings</p>
                <div className="p-3 bg-primary/20 rounded-2xl">
                  <Map className="h-5 w-5 text-primary" />
                </div>
              </div>
              <div className="text-4xl font-black text-white tracking-tighter mb-2 italic">2,847</div>
              <p className="text-[10px] text-primary font-black uppercase tracking-widest flex items-center gap-2">
                <TrendingUp className="h-3 w-3" />
                +12% Protocol Up-link
              </p>
            </div>

            <div className="p-10 bg-secondary/60 border border-white/5 rounded-[3rem] shadow-2xl relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-tr from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="flex justify-between items-start mb-6">
                <p className="text-[10px] font-black uppercase tracking-widest text-white/20">Active Missions</p>
                <div className="p-3 bg-accent/20 rounded-2xl">
                  <Award className="h-5 w-5 text-accent" />
                </div>
              </div>
              <div className="text-4xl font-black text-white tracking-tighter mb-2 italic">12</div>
              <p className="text-[10px] text-accent/60 font-black uppercase tracking-widest">
                Cleanup Ops Active
              </p>
            </div>

            <div className="p-10 bg-secondary/60 border border-white/5 rounded-[3rem] shadow-2xl relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="flex justify-between items-start mb-6">
                <p className="text-[10px] font-black uppercase tracking-widest text-white/20">Guardians</p>
                <div className="p-3 bg-primary/20 rounded-2xl">
                  <Waves className="h-5 w-5 text-primary" />
                </div>
              </div>
              <div className="text-4xl font-black text-white tracking-tighter mb-2 italic">1,243</div>
              <p className="text-[10px] text-primary/40 font-black uppercase tracking-widest">
                Community Net Secure
              </p>
            </div>
          </div>

          {/* Missions Preview or other content could go here */}
        </div>

        <div className="lg:col-span-1 h-[500px]">
          <ActivityFeed />
        </div>
      </section>

      {/* Features */}
      <section className="mb-24 relative z-10">
        <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-center text-primary mb-6">Core Protocols</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="p-10 bg-secondary/60 border border-white/5 rounded-[3rem] shadow-2xl relative overflow-hidden group hover:border-primary/40 transition-all duration-500">
            <div className="h-16 w-16 bg-primary/20 rounded-2xl flex items-center justify-center mb-10 group-hover:scale-110 transition-transform">
              <Map className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-black text-white tracking-tight mb-4 uppercase">Discover</h3>
            <p className="text-white/40 text-[13px] font-medium leading-relaxed italic">
              Browse the global map to find real-time sightings and cleanup mission coordinates.
            </p>
          </div>

          <div className="p-10 bg-secondary/60 border border-white/5 rounded-[3rem] shadow-2xl relative overflow-hidden group hover:border-primary/40 transition-all duration-500">
            <div className="h-16 w-16 bg-primary/20 rounded-2xl flex items-center justify-center mb-10 group-hover:scale-110 transition-transform">
              <Waves className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-black text-white tracking-tight mb-4 uppercase">Report</h3>
            <p className="text-white/40 text-[13px] font-medium leading-relaxed italic">
              Log marine debris, wildlife sightings, and reef conditions with satellite tags.
            </p>
          </div>

          <div className="p-10 bg-secondary/60 border border-white/5 rounded-[3rem] shadow-2xl relative overflow-hidden group hover:border-accent/40 transition-all duration-500">
            <div className="h-16 w-16 bg-accent/20 rounded-2xl flex items-center justify-center mb-10 group-hover:scale-110 transition-transform">
              <Award className="h-8 w-8 text-accent" />
            </div>
            <h3 className="text-xl font-black text-white tracking-tight mb-4 uppercase">Level Up</h3>
            <p className="text-white/40 text-[13px] font-medium leading-relaxed italic">
              Gain veteran status, unlock unique badges, and dominate the global leaderboards.
            </p>
          </div>

          <div className="p-10 bg-secondary/60 border border-white/5 rounded-[3rem] shadow-2xl relative overflow-hidden group hover:border-primary/40 transition-all duration-500">
            <div className="h-16 w-16 bg-primary/20 rounded-2xl flex items-center justify-center mb-10 group-hover:scale-110 transition-transform">
              <TrendingUp className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-black text-white tracking-tight mb-4 uppercase">Impact</h3>
            <p className="text-white/40 text-[13px] font-medium leading-relaxed italic">
              Track your contribution to global conservation efforts with precise analytics.
            </p>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="text-center py-24 bg-secondary border border-white/5 rounded-[4rem] relative overflow-hidden shadow-[0_32px_64px_-16px_rgba(0,0,0,0.6)]">
        <motion.div
          animate={{
            rotate: 360,
            scale: [1, 1.1, 1]
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute -top-40 -left-40 w-96 h-96 bg-primary/10 rounded-full blur-[100px] pointer-events-none"
        />
        <motion.div
          animate={{
            rotate: -360,
            scale: [1, 1.2, 1]
          }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-40 -right-40 w-96 h-96 bg-accent/5 rounded-full blur-[100px] pointer-events-none"
        />

        <h2 className="text-4xl md:text-6xl font-black mb-6 relative z-10 text-white tracking-tighter uppercase leading-[0.9]">Ready to Secure <br /><span className="text-accent italic">The Deep?</span></h2>
        <p className="text-[10px] text-white/30 font-black uppercase tracking-[0.5em] mb-12 max-w-2xl mx-auto relative z-10 italic">
          Join thousands of ocean guardians protecting marine life and securing our coastal borders.
        </p>
        <Button size="lg" className="text-xs px-16 h-20 bg-primary text-white rounded-[2rem] font-black uppercase tracking-[0.4em] relative z-10 hover:scale-105 transition-all shadow-2xl shadow-primary/40 active:scale-95" asChild>
          <a href="/login">Initialize Access</a>
        </Button>
      </section>
    </div>
  );
}
