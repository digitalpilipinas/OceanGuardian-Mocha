import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router';
import { ArrowRight, Waves, Activity, Users, Shield, Globe, CheckCircle, Award, Quote, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';
import { Button } from '@/react-app/components/ui/button';

const LandingPage = () => {
    // Animation variants
    const fadeIn = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
    };

    const staggerContainer = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2
            }
        }
    };

    return (
        <div className="min-h-screen bg-[#e0e5ec] text-slate-800 font-sans overflow-x-hidden">

            {/* Navbar - Glassmorphism */}
            <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4 flex justify-between items-center backdrop-blur-md bg-white/30 border-b border-white/20">
                <div className="flex items-center gap-2">
                    <div className="p-2 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 shadow-lg">
                        <Waves className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-600 to-blue-800">
                        OceanGuardian
                    </span>
                </div>
                <div className="hidden md:flex items-center gap-8">
                    <a href="#features" className="text-sm font-medium hover:text-blue-600 transition-colors">Features</a>
                    <a href="#impact" className="text-sm font-medium hover:text-blue-600 transition-colors">Impact</a>
                    <a href="#about" className="text-sm font-medium hover:text-blue-600 transition-colors">About</a>
                </div>
                <div className="flex gap-4">
                    <Link to="/login">
                        <Button variant="ghost" className="hover:bg-white/20">Log In</Button>
                    </Link>
                    <Link to="/dashboard">
                        <Button className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white shadow-lg shadow-blue-500/30 rounded-full px-6">
                            Get Started
                        </Button>
                    </Link>
                </div>
            </nav>

            {/* Hero Section - Neomorphism Base + Glassmorphism Elements */}
            <header className="relative pt-32 pb-20 px-6 lg:px-12 flex flex-col lg:flex-row items-center justify-between min-h-screen">

                {/* Background Elements */}
                <div className="absolute top-20 left-10 w-72 h-72 bg-cyan-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
                <div className="absolute top-20 right-10 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
                <div className="absolute -bottom-8 left-20 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>

                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={staggerContainer}
                    className="lg:w-1/2 z-10"
                >
                    <motion.div variants={fadeIn} className="inline-block px-4 py-1.5 mb-6 rounded-full bg-[#e0e5ec] shadow-[5px_5px_10px_#bed1e6,-5px_-5px_10px_#ffffff] text-blue-600 font-semibold text-sm uppercase tracking-wider">
                        🌊 Join the Movement
                    </motion.div>

                    <motion.h1 variants={fadeIn} className="text-5xl lg:text-7xl font-extrabold leading-tight mb-6 text-slate-800">
                        Protect Our <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-blue-600">
                            Future Today
                        </span>
                    </motion.h1>

                    <motion.p variants={fadeIn} className="text-lg text-slate-600 mb-8 max-w-lg leading-relaxed">
                        Empowering communities to restore marine ecosystems through gamified missions, real-time monitoring, and global collaboration.
                    </motion.p>

                    <motion.div variants={fadeIn} className="flex flex-wrap gap-4">
                        <Link to="/dashboard">
                            <button className="px-8 py-4 rounded-xl bg-[#e0e5ec] text-blue-700 font-bold shadow-[6px_6px_12px_#b8b9be,-6px_-6px_12px_#ffffff] hover:shadow-[inset_6px_6px_12px_#b8b9be,inset_-6px_-6px_12px_#ffffff] transition-all flex items-center gap-2 group">
                                Start Your Journey
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </button>
                        </Link>
                        <a href="#features">
                            <button className="px-8 py-4 rounded-xl bg-transparent border border-white/40 hover:bg-white/20 transition-all font-medium text-slate-700 backdrop-blur-sm">
                                Learn More
                            </button>
                        </a>
                    </motion.div>

                    <motion.div variants={fadeIn} className="mt-12 flex items-center gap-8">
                        <div className="flex -space-x-4">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="w-10 h-10 rounded-full border-2 border-[#e0e5ec] bg-gray-300 overflow-hidden">
                                    <img src={`https://i.pravatar.cc/100?img=${10 + i}`} alt="User" />
                                </div>
                            ))}
                        </div>
                        <div className="text-sm font-medium text-slate-600">
                            <span className="text-blue-600 font-bold">2,000+</span> Guardians Active
                        </div>
                    </motion.div>
                </motion.div>

                {/* Hero Visual - Glassmorphism Card */}
                <motion.div
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="lg:w-1/2 mt-12 lg:mt-0 relative"
                >
                    <div className="relative z-10 bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-6 shadow-2xl transform rotate-1 hover:rotate-0 transition-transform duration-500">
                        <img
                            src="https://images.unsplash.com/photo-1546026423-cc4642628d2b?auto=format&fit=crop&q=80&w=2574&ixlib=rb-4.0.3"
                            alt="Ocean Life"
                            className="rounded-2xl shadow-inner w-full h-auto object-cover max-h-[500px]"
                        />

                        {/* Floating Stat Cards - Glassmorphism */}
                        <motion.div
                            animate={{ y: [0, -10, 0] }}
                            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                            className="absolute -left-8 top-12 bg-white/20 backdrop-blur-xl border border-white/30 p-4 rounded-2xl shadow-xl flex items-center gap-3"
                        >
                            <div className="p-2 bg-green-400/20 rounded-lg">
                                <Shield className="w-6 h-6 text-green-700" />
                            </div>
                            <div>
                                <p className="text-xs text-slate-800 font-semibold">Coral Health</p>
                                <p className="text-sm font-bold text-green-800">Excellent</p>
                            </div>
                        </motion.div>

                        <motion.div
                            animate={{ y: [0, 10, 0] }}
                            transition={{ repeat: Infinity, duration: 5, ease: "easeInOut", delay: 1 }}
                            className="absolute -right-8 bottom-20 bg-white/20 backdrop-blur-xl border border-white/30 p-4 rounded-2xl shadow-xl flex items-center gap-3"
                        >
                            <div className="p-2 bg-blue-400/20 rounded-lg">
                                <Activity className="w-6 h-6 text-blue-700" />
                            </div>
                            <div>
                                <p className="text-xs text-slate-800 font-semibold">New Mission</p>
                                <p className="text-sm font-bold text-blue-800">Reef Cleanup</p>
                            </div>
                        </motion.div>
                    </div>
                </motion.div>
            </header>

            {/* Features Section - Neomorphism Cards */}
            <section id="features" className="py-24 px-6 lg:px-12 bg-[#e0e5ec]">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center max-w-3xl mx-auto mb-16"
                >
                    <h2 className="text-3xl md:text-4xl font-bold mb-4 text-slate-800">Powered by Technology, Driven by Community</h2>
                    <p className="text-slate-600">Our platform combines cutting-edge tools with social gamification to make ocean conservation engaging and effective.</p>
                </motion.div>

                <div className="grid md:grid-cols-3 gap-8">
                    <FeatureCard
                        icon={<Globe className="w-8 h-8 text-blue-500" />}
                        title="Global Missions"
                        desc="Participate in localized cleanup missions or join global challenges to earn rewards and badges."
                    />
                    <FeatureCard
                        icon={<Activity className="w-8 h-8 text-cyan-500" />}
                        title="Coral AI Monitoring"
                        desc="Upload photos of coral reefs and let our AI analyze health indicators to track restoration progress."
                    />
                    <FeatureCard
                        icon={<Users className="w-8 h-8 text-purple-500" />}
                        title="Community Hub"
                        desc="Connect with other Guardians, compete on leaderboards, and share your impact with the world."
                    />
                </div>
            </section>

            {/* How It Works - Glassmorphism Steps */}
            <section className="py-24 px-6 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-[#e0e5ec] to-blue-50/50"></div>
                <div className="max-w-7xl mx-auto relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-3xl md:text-4xl font-bold mb-4 text-slate-800">How It Works</h2>
                        <p className="text-slate-600 max-w-2xl mx-auto">Start your journey to becoming an Ocean Guardian in three simple steps.</p>
                    </motion.div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                step: "01",
                                title: "Join a Mission",
                                desc: "Browse local cleanup events or digital challenges that fit your location and skills.",
                                icon: <Globe className="w-6 h-6 text-white" />,
                                color: "from-blue-400 to-blue-600"
                            },
                            {
                                step: "02",
                                title: "Log Your Impact",
                                desc: "Record your findings, upload photos of coral, or verify others' reports to earn XP.",
                                icon: <CheckCircle className="w-6 h-6 text-white" />,
                                color: "from-cyan-400 to-cyan-600"
                            },
                            {
                                step: "03",
                                title: "Earn Rewards",
                                desc: "Unlock badges, climb the leaderboard, and trade points for eco-friendly gear.",
                                icon: <Award className="w-6 h-6 text-white" />,
                                color: "from-purple-400 to-purple-600"
                            }
                        ].map((item, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.2 }}
                                className="relative p-8 rounded-3xl bg-white/40 backdrop-blur-md border border-white/50 shadow-xl hover:shadow-2xl transition-all group"
                            >
                                <div className={`absolute top-0 right-0 p-4 font-black text-6xl text-slate-900/5 group-hover:text-slate-900/10 transition-colors select-none`}>
                                    {item.step}
                                </div>
                                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${item.color} shadow-lg flex items-center justify-center mb-6 text-white mb-6 group-hover:scale-110 transition-transform`}>
                                    {item.icon}
                                </div>
                                <h3 className="text-xl font-bold text-slate-800 mb-3">{item.title}</h3>
                                <p className="text-slate-600">{item.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Stats Section - Soft Neomorphism */}
            <section id="impact" className="py-20 px-6">
                <div className="max-w-6xl mx-auto p-12 rounded-[3rem] bg-[#e0e5ec] shadow-[20px_20px_60px_#bebebe,-20px_-20px_60px_#ffffff]">
                    <div className="grid md:grid-cols-3 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-slate-300">
                        <div className="p-4">
                            <div className="text-4xl font-extrabold text-blue-600 mb-2">150+</div>
                            <div className="text-slate-600 font-medium">Missions Completed</div>
                        </div>
                        <div className="p-4">
                            <div className="text-4xl font-extrabold text-cyan-600 mb-2">5,000kg</div>
                            <div className="text-slate-600 font-medium">Waste Removed</div>
                        </div>
                        <div className="p-4">
                            <div className="text-4xl font-extrabold text-purple-600 mb-2">24/7</div>
                            <div className="text-slate-600 font-medium">Reef Monitoring</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Community Voices - Neomorphism bubbles */}
            <section className="py-24 px-6 bg-[#e0e5ec]">
                <div className="max-w-7xl mx-auto">
                    <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center text-slate-800">Community Voices</h2>
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
                                className="p-8 rounded-3xl bg-[#e0e5ec] shadow-[8px_8px_16px_#bebebe,-8px_-8px_16px_#ffffff] relative"
                            >
                                <Quote className="absolute top-8 right-8 w-8 h-8 text-blue-500/20" />
                                <p className="text-slate-600 mb-6 italic relative z-10">"{t.text}"</p>
                                <div className="flex items-center gap-4">
                                    <img src={t.img} alt={t.name} className="w-12 h-12 rounded-full border-2 border-white shadow-md" />
                                    <div>
                                        <div className="font-bold text-slate-800">{t.name}</div>
                                        <div className="text-xs text-blue-600 font-medium uppercase tracking-wide">{t.role}</div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Partners Ticker */}
            <section className="py-12 bg-white/50 backdrop-blur-sm border-y border-white/40 overflow-hidden">
                <div className="max-w-7xl mx-auto px-6 mb-8 text-center text-sm font-semibold text-slate-500 uppercase tracking-widest">Trusted by Organizations Worldwide</div>

                <div className="flex justify-center gap-12 md:gap-20 opacity-60 grayscale hover:grayscale-0 transition-all duration-500 flex-wrap px-6">
                    {/* Placeholders for logos (using text for now as specific logos weren't provided, but styled nicely) */}
                    {['OceanAlliance', 'ReefCheck', 'BlueFrontier', 'MarineLife', 'EcoSystems'].map((partner) => (
                        <div key={partner} className="text-2xl font-black text-slate-300 select-none flex items-center gap-2">
                            <div className="w-8 h-8 bg-slate-300 rounded-full"></div>
                            {partner}
                        </div>
                    ))}
                </div>
            </section>

            {/* Call to Action */}
            <section className="py-20 px-6 text-center">
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    className="max-w-4xl mx-auto bg-gradient-to-br from-blue-600 to-cyan-500 rounded-3xl p-12 text-white shadow-2xl relative overflow-hidden"
                >
                    <div className="absolute top-0 left-0 w-full h-full bg-white/10 backdrop-blur-[2px]"></div>
                    <div className="relative z-10">
                        <h2 className="text-3xl md:text-5xl font-bold mb-6">Ready to Make a Splash?</h2>
                        <p className="text-blue-100 text-lg mb-8 max-w-2xl mx-auto">Join thousands of Ocean Guardians today and start earning rewards for saving our planet.</p>
                        <Link to="/signup">
                            <button className="px-10 py-4 bg-white text-blue-600 rounded-full font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all">
                                Create Free Account
                            </button>
                        </Link>
                    </div>
                </motion.div>
            </section>

            {/* Enhanced Footer */}
            <footer className="bg-slate-900 text-slate-300 py-20 px-6 rounded-t-[3rem] mt-12">
                <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-12">
                    <div className="col-span-2">
                        <div className="flex items-center gap-2 mb-6">
                            <div className="p-2 rounded-lg bg-blue-600">
                                <Waves className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-2xl font-bold text-white">OceanGuardian</span>
                        </div>
                        <p className="mb-8 text-slate-400 max-w-sm leading-relaxed">
                            Join the world's most active community of ocean defenders. Together, we can turn the tide on plastic pollution and restore our marine ecosystems.
                        </p>
                        <div className="flex gap-4">
                            {[Facebook, Twitter, Instagram, Linkedin].map((Icon, i) => (
                                <a key={i} href="#" className="w-10 h-10 rounded-full bg-white/5 hover:bg-blue-600 flex items-center justify-center transition-colors">
                                    <Icon className="w-5 h-5 text-white" />
                                </a>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h4 className="text-white font-bold mb-6">Platform</h4>
                        <ul className="space-y-4">
                            <li><a href="#" className="hover:text-blue-400 transition-colors">Missions</a></li>
                            <li><a href="#" className="hover:text-blue-400 transition-colors">Coral AI</a></li>
                            <li><a href="#" className="hover:text-blue-400 transition-colors">Community</a></li>
                            <li><a href="#" className="hover:text-blue-400 transition-colors">Leaderboard</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-white font-bold mb-6">Company</h4>
                        <ul className="space-y-4">
                            <li><a href="#" className="hover:text-blue-400 transition-colors">About Us</a></li>
                            <li><a href="#" className="hover:text-blue-400 transition-colors">Careers</a></li>
                            <li><a href="#" className="hover:text-blue-400 transition-colors">Blog</a></li>
                            <li><a href="#" className="hover:text-blue-400 transition-colors">Contact</a></li>
                        </ul>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto mt-16 pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-500">
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

// Helper Component for Feature Cards (Neomorphism)
const FeatureCard = ({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) => {
    return (
        <motion.div
            whileHover={{ y: -10 }}
            className="p-8 rounded-3xl bg-[#e0e5ec] shadow-[8px_8px_16px_#bebebe,-8px_-8px_16px_#ffffff] transition-all"
        >
            <div className="w-14 h-14 rounded-2xl bg-[#e0e5ec] shadow-[inset_5px_5px_10px_#bebebe,inset_-5px_-5px_10px_#ffffff] flex items-center justify-center mb-6">
                {icon}
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-3">{title}</h3>
            <p className="text-slate-600 leading-relaxed">{desc}</p>
            <div className="mt-6 flex items-center text-blue-600 font-medium cursor-pointer group">
                Learn more <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </div>
        </motion.div>
    )
}

export default LandingPage;
