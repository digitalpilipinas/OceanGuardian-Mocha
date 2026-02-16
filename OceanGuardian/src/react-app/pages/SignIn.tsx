import React, { useState } from "react";
import { Waves, Mail, ArrowRight, UserCircle, Loader2 } from "lucide-react";
import { Button } from "@/react-app/components/ui/button";
import { Input } from "@/react-app/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/react-app/components/ui/card";
import { useToast } from "@/react-app/components/ui/use-toast";
import { motion, AnimatePresence } from "framer-motion";

export default function SignIn() {
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [step, setStep] = useState<"email" | "otp">("email");
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();

    const handleSendOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch("/api/auth/otp/send", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });
            if (res.ok) {
                setStep("otp");
                toast({
                    title: "OTP Sent",
                    description: "Check your email for the verification code.",
                });
            } else {
                const data = await res.json();
                toast({
                    title: "Error",
                    description: data.error || "Failed to send OTP",
                    variant: "destructive",
                });
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "Something went wrong. Please try again.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch("/api/auth/otp/verify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, otp }),
            });
            if (res.ok) {
                toast({
                    title: "Welcome!",
                    description: "You have signed in successfully.",
                });
                window.location.href = "/"; // Force reload to refresh auth state
            } else {
                const data = await res.json();
                toast({
                    title: "Invalid OTP",
                    description: data.error || "Please check the code and try again.",
                    variant: "destructive",
                });
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "Something went wrong. Please try again.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleGuestLogin = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/auth/guest", { method: "POST" });
            if (res.ok) {
                toast({
                    title: "Guest Session Started",
                    description: "You're now browsing as a guest.",
                });
                window.location.href = "/";
            } else {
                toast({
                    title: "Error",
                    description: "Failed to start guest session.",
                    variant: "destructive",
                });
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "Something went wrong.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4 py-12 relative z-10">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                className="w-full max-w-md"
            >
                <div className="flex flex-col items-center mb-8">
                    <div className="p-4 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 shadow-[0_0_25px_rgba(6,182,212,0.4)] mb-6 animate-float-slow">
                        <Waves className="h-10 w-10 text-white" />
                    </div>
                    <h1 className="text-4xl font-bold text-white mb-2 drop-shadow-lg text-center">
                        Welcome Back
                    </h1>
                    <p className="text-cyan-100/80 text-center text-lg">Guardian</p>
                </div>

                <Card className="bg-slate-900/40 backdrop-blur-xl border-white/10 shadow-2xl rounded-3xl overflow-hidden">
                    <CardHeader className="text-center pb-2">
                        <CardTitle className="text-xl font-semibold text-white">
                            {step === "email" ? "Sign In" : "Verify Email"}
                        </CardTitle>
                        <CardDescription className="text-slate-400">
                            {step === "email"
                                ? "Enter your email to access your dashboard"
                                : `We've sent a code to ${email}`}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <AnimatePresence mode="wait">
                            {step === "email" ? (
                                <motion.form
                                    key="email-step"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    onSubmit={handleSendOtp}
                                    className="space-y-4"
                                >
                                    <div className="space-y-2">
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-3.5 h-5 w-5 text-cyan-500/70" />
                                            <Input
                                                type="email"
                                                placeholder="email@example.com"
                                                className="pl-10 h-12 rounded-xl bg-slate-950/50 border-white/10 text-white placeholder:text-slate-500 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                required
                                            />
                                        </div>
                                    </div>
                                    <Button
                                        type="submit"
                                        className="w-full h-12 rounded-xl text-lg font-bold bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-[0_0_30px_rgba(6,182,212,0.5)] transition-all"
                                        disabled={loading}
                                    >
                                        {loading ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : null}
                                        {loading ? "Sending..." : "Send Code"}
                                        {!loading && <ArrowRight className="ml-2 h-5 w-5" />}
                                    </Button>
                                </motion.form>
                            ) : (
                                <motion.form
                                    key="otp-step"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    onSubmit={handleVerifyOtp}
                                    className="space-y-4"
                                >
                                    <div className="space-y-2">
                                        <Input
                                            type="text"
                                            placeholder="000000"
                                            className="h-14 text-center text-3xl tracking-[0.5em] rounded-xl bg-slate-950/50 border-white/10 text-white focus:ring-cyan-500/50 focus:border-cyan-500/50 font-mono"
                                            value={otp}
                                            onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                                            required
                                            autoFocus
                                        />
                                    </div>
                                    <Button
                                        type="submit"
                                        className="w-full h-12 rounded-xl text-lg font-bold bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-[0_0_30px_rgba(6,182,212,0.5)] transition-all"
                                        disabled={loading || otp.length < 6}
                                    >
                                        {loading ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : null}
                                        {loading ? "Verifying..." : "Sign In"}
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        type="button"
                                        className="w-full text-slate-400 hover:text-white hover:bg-white/5"
                                        onClick={() => setStep("email")}
                                        disabled={loading}
                                    >
                                        Change Email
                                    </Button>
                                </motion.form>
                            )}
                        </AnimatePresence>
                    </CardContent>
                    <CardFooter className="flex flex-col gap-4 pb-8">
                        <div className="relative w-full">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-white/10"></span>
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-transparent px-2 text-slate-500 font-medium">Or continue with</span>
                            </div>
                        </div>
                        <Button
                            variant="outline"
                            className="w-full h-12 rounded-xl border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white hover:border-white/20 transition-all font-medium"
                            onClick={handleGuestLogin}
                            disabled={loading}
                        >
                            <UserCircle className="mr-2 h-5 w-5 text-cyan-400" />
                            Guest Access
                        </Button>
                    </CardFooter>
                </Card>
                <p className="mt-8 text-center text-xs text-slate-500 px-8">
                    By continuing, you agree to our terms and community guidelines for ocean protection.
                </p>
            </motion.div>
        </div>
    );
}
