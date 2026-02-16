import React from 'react';
import { motion, Variants } from 'framer-motion';
import { Link } from 'react-router';
import { ArrowRight, Waves, Activity, Users, Shield, Globe, CheckCircle, Award, Quote, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';
import { Button } from '@/react-app/components/ui/button';

const LandingPage = () => {
    // Animation variants
    const fadeIn: Variants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
    };

    const staggerContainer: Variants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2
            }
        }
    };

    const bubbleVariants: Variants = {
        animate: () => ({
            y: [0, -1000],
            opacity: [0, 0.5, 0],
            transition: {
                duration: Math.random() * 10 + 10,
                repeat: Infinity,
                delay: Math.random() * 5,
                ease: "linear"
            }
        })
    };

    return (
        <div className="min-h-screen bg-slate-900 text-white font-sans overflow-x-hidden relative selection:bg-cyan-500/30">
            {/* Deep Ocean Gradient Background */}
            <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-900 via-blue-950 to-slate-950 z-0"></div>

            {/* Ambient Light Effects */}
            <div className="fixed top-0 left-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-[128px] pointer-events-none z-0 mix-blend-screen animate-pulse"></div>
            <div className="fixed bottom-0 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[128px] pointer-events-none z-0 mix-blend-screen"></div>

            {/* Bubble Particles */}
            <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
                {[...Array(20)].map((_, i) => (
                    <motion.div
                        key={i}
                        custom={i}
                        variants={bubbleVariants}
                        animate="animate"
                        className="absolute rounded-full bg-white/10 backdrop-blur-sm border border-white/20"
                        style={{
                            width: Math.random() * 20 + 10,
                            height: Math.random() * 20 + 10,
                            left: `${Math.random() * 100}%`,
                            bottom: '-10%'
                        }}
                    />
                ))}
            </div>

            {/* Navbar - Dark Glass */}
            <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4 flex justify-between items-center backdrop-blur-md bg-slate-900/50 border-b border-white/10">
                <div className="flex items-center gap-2">
                    <div className="p-2 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 shadow-[0_0_15px_rgba(6,182,212,0.5)]">
                        <Waves className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-200 to-blue-400">
                        OceanGuardian
                    </span>
                </div>
                <div className="hidden md:flex items-center gap-8">
                    <a href="#features" className="text-sm font-medium text-slate-300 hover:text-cyan-400 transition-colors">Features</a>
                    <a href="#impact" className="text-sm font-medium text-slate-300 hover:text-cyan-400 transition-colors">Impact</a>
                    <a href="#howitworks" className="text-sm font-medium text-slate-300 hover:text-cyan-400 transition-colors">How it Works</a>
                </div>
                <div className="flex gap-4">
                    <Link to="/login">
                        <Button variant="ghost" className="text-slate-300 hover:text-white hover:bg-white/10">Log In</Button>
                    </Link>
                    <Link to="/dashboard">
                        <Button className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-[0_0_20px_rgba(6,182,212,0.4)] rounded-full px-6 border border-white/10">
                            Get Started
                        </Button>
                    </Link>
                </div>
            </nav>

            {/* Hero Section */}
            <header className="relative pt-32 pb-20 px-6 lg:px-12 flex flex-col lg:flex-row items-center justify-between min-h-screen z-10">
                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={staggerContainer}
                    className="lg:w-1/2 z-10"
                >
                    <motion.div variants={fadeIn} className="inline-flex items-center gap-2 px-4 py-1.5 mb-6 rounded-full bg-cyan-900/30 border border-cyan-500/30 text-cyan-300 font-semibold text-sm uppercase tracking-wider shadow-[0_0_15px_rgba(6,182,212,0.2)]">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                        </span>
                        Join the Movement
                    </motion.div>

                    <motion.h1 variants={fadeIn} className="text-5xl lg:text-7xl font-extrabold leading-tight mb-6 text-white drop-shadow-lg">
                        Protect Our <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-blue-200 to-purple-300 drop-shadow-[0_0_10px_rgba(6,182,212,0.5)]">
                            Future Today
                        </span>
                    </motion.h1>

                    <motion.p variants={fadeIn} className="text-lg text-slate-300 mb-8 max-w-lg leading-relaxed">
                        Dive into a global mission to restore marine ecosystems. Gamified actions, real-time AI monitoring, and a community that creates waves of change.
                    </motion.p>

                    <motion.div variants={fadeIn} className="flex flex-wrap gap-4">
                        <Link to="/dashboard">
                            <button className="px-8 py-4 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 text-white font-bold shadow-[0_10px_30px_rgba(6,182,212,0.4)] hover:shadow-[0_10px_40px_rgba(6,182,212,0.6)] hover:-translate-y-1 transition-all flex items-center gap-2 group border border-white/10">
                                Start Your Journey
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </button>
                        </Link>
                        <a href="#features">
                            <button className="px-8 py-4 rounded-xl bg-white/5 border border-white/20 hover:bg-white/10 hover:border-white/40 transition-all font-medium text-white backdrop-blur-sm">
                                Learn More
                            </button>
                        </a>
                    </motion.div>

                    <motion.div variants={fadeIn} className="mt-12 flex items-center gap-8">
                        <div className="flex -space-x-4">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="w-10 h-10 rounded-full border-2 border-slate-900 bg-slate-800 overflow-hidden relative">
                                    <img src={`https://i.pravatar.cc/100?img=${10 + i}`} alt="User" className="w-full h-full object-cover" />
                                </div>
                            ))}
                        </div>
                        <div className="text-sm font-medium text-slate-400">
                            <span className="text-cyan-400 font-bold">2,000+</span> Guardians Active
                        </div>
                    </motion.div>
                </motion.div>

                {/* Hero Visual - Deep Glass Card */}
                <motion.div
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="lg:w-1/2 mt-12 lg:mt-0 relative perspective-1000"
                >
                    <div className="relative z-10 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-2xl border border-white/20 rounded-3xl p-4 shadow-[0_20px_50px_rgba(0,0,0,0.5)] transform rotate-y-6 hover:rotate-y-0 transition-transform duration-700">
                        <img
                            src="https://images.unsplash.com/photo-1583212235753-b254a44f9979?q=80&w=2070&auto=format&fit=crop"
                            alt="Ocean Life"
                            className="rounded-2xl shadow-inner w-full h-auto object-cover max-h-[500px]"
                        />

                        {/* Floating Glass Stats */}
                        <motion.div
                            animate={{ y: [0, -15, 0] }}
                            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                            className="absolute -left-6 top-10 bg-slate-900/80 backdrop-blur-xl border border-white/20 p-4 rounded-2xl shadow-2xl flex items-center gap-3"
                        >
                            <div className="p-2 bg-green-500/20 rounded-lg border border-green-500/30">
                                <Shield className="w-6 h-6 text-green-400" />
                            </div>
                            <div>
                                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Coral Health</p>
                                <p className="text-sm font-bold text-green-400">Optimal</p>
                            </div>
                        </motion.div>

                        <motion.div
                            animate={{ y: [0, 15, 0] }}
                            transition={{ repeat: Infinity, duration: 5, ease: "easeInOut", delay: 1 }}
                            className="absolute -right-6 bottom-16 bg-slate-900/80 backdrop-blur-xl border border-white/20 p-4 rounded-2xl shadow-2xl flex items-center gap-3"
                        >
                            <div className="p-2 bg-blue-500/20 rounded-lg border border-blue-500/30">
                                <Activity className="w-6 h-6 text-blue-400" />
                            </div>
                            <div>
                                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">New Mission</p>
                                <p className="text-sm font-bold text-blue-400">Reef Cleanup</p>
                            </div>
                        </motion.div>
                    </div>
                </motion.div>
            </header>

            {/* Features Section - Deep Glass Cards */}
            <section id="features" className="py-24 px-6 lg:px-12 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center max-w-3xl mx-auto mb-16"
                >
                    <h2 className="text-3xl md:text-5xl font-bold mb-4 text-white">Powered by Tech, Driven by Heroes</h2>
                    <p className="text-slate-400 text-lg">Our platform combines cutting-edge AI with social gamification to make ocean conservation engaging, effective, and fun.</p>
                </motion.div>

                <div className="grid md:grid-cols-3 gap-8">
                    <FeatureCard
                        icon={<Globe className="w-8 h-8 text-cyan-400" />}
                        title="Global Missions"
                        desc="Participate in localized cleanup missions or join global challenges to earn rewards and badges."
                        color="cyan"
                    />
                    <FeatureCard
                        icon={<Activity className="w-8 h-8 text-purple-400" />}
                        title="AI Coral Viz"
                        desc="Upload photos of coral reefs and let our AI analyze health indicators to track restoration progress."
                        color="purple"
                    />
                    <FeatureCard
                        icon={<Users className="w-8 h-8 text-blue-400" />}
                        title="Community Hub"
                        desc="Connect with other Guardians, compete on leaderboards, and share your impact with the world."
                        color="blue"
                    />
                </div>
            </section>

            {/* How It Works - Glassmorphism Steps */}
            <section id="howitworks" className="py-24 px-6 relative overflow-hidden z-10">
                <div className="max-w-7xl mx-auto relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">How It Works</h2>
                        <p className="text-slate-400 max-w-2xl mx-auto">Start your journey to becoming an Ocean Guardian in three simple steps.</p>
                    </motion.div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                step: "01",
                                title: "Join a Mission",
                                desc: "Browse local cleanup events or digital challenges that fit your location and skills.",
                                icon: <Globe className="w-6 h-6 text-white" />,
                                color: "from-blue-500 to-blue-700"
                            },
                            {
                                step: "02",
                                title: "Log Your Impact",
                                desc: "Record your findings, upload photos of coral, or verify others' reports to earn XP.",
                                icon: <CheckCircle className="w-6 h-6 text-white" />,
                                color: "from-cyan-500 to-cyan-700"
                            },
                            {
                                step: "03",
                                title: "Earn Rewards",
                                desc: "Unlock badges, climb the leaderboard, and trade points for eco-friendly gear.",
                                icon: <Award className="w-6 h-6 text-white" />,
                                color: "from-purple-500 to-purple-700"
                            }
                        ].map((item, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.2 }}
                                className="relative p-8 rounded-3xl bg-white/5 backdrop-blur-md border border-white/10 shadow-xl hover:bg-white/10 hover:shadow-cyan-900/50 transition-all group"
                            >
                                <div className={`absolute top-0 right-0 p-4 font-black text-6xl text-white/5 group-hover:text-white/10 transition-colors select-none`}>
                                    {item.step}
                                </div>
                                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${item.color} shadow-lg flex items-center justify-center mb-6 text-white mb-6 group-hover:scale-110 transition-transform`}>
                                    {item.icon}
                                </div>
                                <h3 className="text-xl font-bold text-white mb-3">{item.title}</h3>
                                <p className="text-slate-400 leading-relaxed">{item.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>


            {/* Stats Section - Floating Glass Blocks */}
            <section id="impact" className="py-20 px-6 relative z-10">
                <div className="max-w-6xl mx-auto">
                    <div className="grid md:grid-cols-3 gap-8 text-center">
                        {[
                            { value: "150+", label: "Missions Completed", color: "text-blue-400" },
                            { value: "5,000kg", label: "Waste Removed", color: "text-cyan-400" },
                            { value: "24/7", label: "Reef Monitoring", color: "text-purple-400" }
                        ].map((stat, i) => (
                            <motion.div
                                key={i}
                                whileHover={{ y: -5 }}
                                className="p-8 rounded-3xl bg-slate-900/40 backdrop-blur-md border border-white/10 shadow-lg relative overflow-hidden group"
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                <div className={`text-5xl font-extrabold ${stat.color} mb-2 drop-shadow-md`}>{stat.value}</div>
                                <div className="text-slate-400 font-medium uppercase tracking-wider text-sm">{stat.label}</div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Community Voices - Dark Bubbles */}
            <section className="py-24 px-6 relative z-10">
                <div className="max-w-7xl mx-auto">
                    <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center text-white">Community Voices</h2>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[
                            {
                                name: "Alex Rivera",
                                role: "Oceanographer",
                                text: "The data collected by OceanGuardian users has been invaluable for our local reef restoration projects. It's citizen science at its best.",
                                img: "https://i.pravatar.cc/100?img=11"
                            },
                            {
                                name: "Sarah Chen",
                                role: "Top Contributor",
                                text: "I love how the gamification keeps me motivated. Cleaning up the beach feels like a quest now, not a chore!",
                                img: "https://i.pravatar.cc/100?img=5"
                            },
                            {
                                name: "Marcus Johnson",
                                role: "Dive Instructor",
                                text: "My students use the app to log sightings during dives. It's a fantastic educational tool that makes a real impact.",
                                img: "https://i.pravatar.cc/100?img=33"
                            }
                        ].map((t, i) => (
                            <motion.div
                                key={i}
                                whileHover={{ scale: 1.02 }}
                                className="p-8 rounded-3xl bg-white/5 backdrop-blur-md border border-white/10 shadow-lg relative group hover:bg-white/10 transition-colors"
                            >
                                <Quote className="absolute top-8 right-8 w-8 h-8 text-white/5 group-hover:text-cyan-500/20 transition-colors" />
                                <p className="text-slate-300 mb-6 italic relative z-10">"{t.text}"</p>
                                <div className="flex items-center gap-4">
                                    <img src={t.img} alt={t.name} className="w-12 h-12 rounded-full border-2 border-white/20 shadow-md group-hover:border-cyan-400 transition-colors" />
                                    <div>
                                        <div className="font-bold text-white">{t.name}</div>
                                        <div className="text-xs text-cyan-400 font-medium uppercase tracking-wide">{t.role}</div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Partners Ticker */}
            <section className="py-12 bg-black/20 backdrop-blur-sm border-y border-white/5 overflow-hidden z-10 relative">
                <div className="max-w-7xl mx-auto px-6 mb-8 text-center text-sm font-semibold text-slate-500 uppercase tracking-widest">Trusted by Organizations Worldwide</div>

                <div className="flex justify-center gap-12 md:gap-20 opacity-50 grayscale hover:grayscale-0 transition-all duration-500 flex-wrap px-6 text-slate-400">
                    {/* Placeholders for logos */}
                    {['OceanAlliance', 'ReefCheck', 'BlueFrontier', 'MarineLife', 'EcoSystems'].map((partner) => (
                        <div key={partner} className="text-2xl font-black select-none flex items-center gap-2 hover:text-white transition-colors">
                            <div className="w-8 h-8 bg-slate-600 rounded-full"></div>
                            {partner}
                        </div>
                    ))}
                </div>
            </section>

            {/* Call to Action - Glowing Portal */}
            <section className="py-24 px-6 text-center relative z-10">
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    className="max-w-4xl mx-auto bg-gradient-to-b from-cyan-600/20 to-blue-900/40 rounded-[3rem] p-12 text-white shadow-[0_0_50px_rgba(6,182,212,0.2)] border border-cyan-500/30 relative overflow-hidden backdrop-blur-xl"
                >
                    <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-400/20 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/20 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2"></div>

                    <div className="relative z-10">
                        <h2 className="text-3xl md:text-5xl font-bold mb-6 drop-shadow-lg">Ready to Make a Splash?</h2>
                        <p className="text-cyan-100 text-lg mb-8 max-w-2xl mx-auto">Join thousands of Ocean Guardians today and start earning rewards for saving our planet.</p>
                        <Link to="/signup">
                            <button className="px-12 py-5 bg-white text-blue-900 rounded-full font-extrabold text-lg shadow-[0_0_20px_rgba(255,255,255,0.4)] hover:shadow-[0_0_30px_rgba(255,255,255,0.6)] hover:scale-105 transition-all">
                                Create Free Account
                            </button>
                        </Link>
                    </div>
                </motion.div>
            </section>

            {/* Footer */}
            <footer className="bg-slate-950 text-slate-300 py-20 px-6 mt-12 border-t border-white/5 relative z-10">
                <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-12">
                    <div className="col-span-2">
                        <div className="flex items-center gap-2 mb-6">
                            <div className="p-2 rounded-lg bg-blue-600 shadow-[0_0_15px_rgba(37,99,235,0.5)]">
                                <Waves className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-2xl font-bold text-white">OceanGuardian</span>
                        </div>
                        <p className="mb-8 text-slate-400 max-w-sm leading-relaxed">
                            Join the world's most active community of ocean defenders. Together, we can turn the tide on plastic pollution and restore our marine ecosystems.
                        </p>
                        <div className="flex gap-4">
                            {[Facebook, Twitter, Instagram, Linkedin].map((Icon, i) => (
                                <a key={i} href="#" className="w-10 h-10 rounded-full bg-white/5 hover:bg-blue-600 hover:text-white hover:scale-110 flex items-center justify-center transition-all">
                                    <Icon className="w-5 h-5 text-slate-400 hover:text-white" />
                                </a>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h4 className="text-white font-bold mb-6">Platform</h4>
                        <ul className="space-y-4">
                            <li><a href="#" className="hover:text-cyan-400 transition-colors">Missions</a></li>
                            <li><a href="#" className="hover:text-cyan-400 transition-colors">Coral AI</a></li>
                            <li><a href="#" className="hover:text-cyan-400 transition-colors">Community</a></li>
                            <li><a href="#" className="hover:text-cyan-400 transition-colors">Leaderboard</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-white font-bold mb-6">Company</h4>
                        <ul className="space-y-4">
                            <li><a href="#" className="hover:text-cyan-400 transition-colors">About Us</a></li>
                            <li><a href="#" className="hover:text-cyan-400 transition-colors">Careers</a></li>
                            <li><a href="#" className="hover:text-cyan-400 transition-colors">Blog</a></li>
                            <li><a href="#" className="hover:text-cyan-400 transition-colors">Contact</a></li>
                        </ul>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto mt-16 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-500">
                    <div>© 2026 OceanGuardian. All rights reserved.</div>
                    <div className="flex gap-8">
                        <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
                        <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
                    </div>
                </div>
            </footer>
        </div>
    );
};

// Helper Component for Feature Cards (Deep Glassmorphism)
const FeatureCard = ({ icon, title, desc, color }: { icon: React.ReactNode, title: string, desc: string, color: string }) => {
    return (
        <motion.div
            whileHover={{ y: -10 }}
            className="p-8 rounded-3xl bg-white/5 backdrop-blur-md border border-white/10 shadow-lg hover:border-white/20 hover:bg-white/10 transition-all group"
        >
            <div className={`w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center mb-6 shadow-inner border border-white/5 group-hover:scale-110 transition-transform`}>
                {icon}
            </div>
            <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
            <p className="text-slate-400 leading-relaxed">{desc}</p>
            <div className={`mt-6 flex items-center text-${color}-400 font-medium cursor-pointer group-hover:text-${color}-300`}>
                Learn more <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </div>
        </motion.div>
    )
}

export default LandingPage;
