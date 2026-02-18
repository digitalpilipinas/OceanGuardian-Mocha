import React, { useState } from "react";
import { Waves, Mail, ArrowRight, UserCircle, Loader2, Lock, Eye, EyeOff, Info } from "lucide-react";
import { Button } from "@/react-app/components/ui/button";
import { Input } from "@/react-app/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/react-app/components/ui/card";
import { useToast } from "@/react-app/components/ui/use-toast";
import { motion, AnimatePresence } from "framer-motion";

import { useNavigate, useSearchParams } from "react-router";

type AuthMode = "signin" | "signup";

export default function SignIn() {
    const [searchParams] = useSearchParams();
    const initialMode = (searchParams.get("mode") as AuthMode) || "signin";
    const redirectParam = searchParams.get("redirect");
    const safeRedirect = redirectParam && redirectParam.startsWith("/") && !redirectParam.startsWith("//")
        ? redirectParam
        : "/dashboard";

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [username, setUsername] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [mode, setMode] = useState<AuthMode>(initialMode);
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();

    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const endpoint = mode === "signup" ? "/api/auth/signup" : "/api/auth/login";
        const payload = mode === "signup"
            ? { email, password, username: username || undefined }
            : { email, password };

        try {
            const res = await fetch(endpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (res.ok) {
                toast({
                    title: mode === "signup" ? "Account Created!" : "Welcome Back!",
                    description: mode === "signup"
                        ? "Your guardian account is ready."
                        : "You have signed in successfully.",
                });
                window.dispatchEvent(new Event("og:user-data-refresh"));
                navigate(safeRedirect);
            } else {
                const data = await res.json();
                toast({
                    title: "Error",
                    description: data.error || "Something went wrong",
                    variant: "destructive",
                });
            }
        } catch {
            toast({
                title: "Error",
                description: "Connection failed. Please try again.",
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
                window.dispatchEvent(new Event("og:user-data-refresh"));
                navigate(safeRedirect);
            } else {
                toast({
                    title: "Error",
                    description: "Failed to start guest session.",
                    variant: "destructive",
                });
            }
        } catch {
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
                        {mode === "signin" ? "Welcome Back" : "Join Us"}
                    </h1>
                    <p className="text-cyan-100/80 text-center text-lg">Guardian</p>
                </div>

                <Card className="bg-slate-900/40 backdrop-blur-xl border-white/10 shadow-2xl rounded-3xl overflow-hidden">
                    <CardHeader className="text-center pb-2">
                        <CardTitle className="text-xl font-semibold text-white">
                            {mode === "signin" ? "Sign In" : "Create Account"}
                        </CardTitle>
                        <CardDescription className="text-slate-400">
                            {mode === "signin"
                                ? "Enter your credentials to access your dashboard"
                                : "Set up your guardian account"}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <AnimatePresence mode="wait">
                            <motion.form
                                key={mode}
                                initial={{ opacity: 0, x: mode === "signup" ? 20 : -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: mode === "signup" ? -20 : 20 }}
                                onSubmit={handleSubmit}
                                className="space-y-4"
                            >
                                {/* Username (sign-up only) */}
                                {mode === "signup" && (
                                    <div className="relative">
                                        <UserCircle className="absolute left-3 top-3.5 h-5 w-5 text-cyan-500/70" />
                                        <Input
                                            type="text"
                                            placeholder="Display name (optional)"
                                            className="pl-10 h-12 rounded-xl bg-slate-950/50 border-white/10 text-white placeholder:text-slate-500 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all"
                                            value={username}
                                            onChange={(e) => setUsername(e.target.value)}
                                        />
                                    </div>
                                )}

                                {/* Email */}
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

                                {/* Password */}
                                <div className="relative">
                                    <Lock className="absolute left-3 top-3.5 h-5 w-5 text-cyan-500/70" />
                                    <Input
                                        type={showPassword ? "text" : "password"}
                                        placeholder={mode === "signup" ? "Create a password (min 6 chars)" : "Password"}
                                        className="pl-10 pr-12 h-12 rounded-xl bg-slate-950/50 border-white/10 text-white placeholder:text-slate-500 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        minLength={6}
                                    />
                                    <button
                                        type="button"
                                        className="absolute right-3 top-3.5 text-slate-500 hover:text-slate-300 transition-colors"
                                        onClick={() => setShowPassword(!showPassword)}
                                        tabIndex={-1}
                                    >
                                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                    </button>
                                </div>

                                {/* OTP Note */}
                                <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                                    <Info className="h-4 w-4 text-amber-400 mt-0.5 flex-shrink-0" />
                                    <p className="text-xs text-amber-200/80 leading-relaxed">
                                        OTP (one-time password) login is currently unavailable. Please use email and password to sign in or create an account.
                                    </p>
                                </div>

                                {/* Submit Button */}
                                <Button
                                    type="submit"
                                    className="w-full h-12 rounded-xl text-lg font-bold bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-[0_0_30px_rgba(6,182,212,0.5)] transition-all"
                                    disabled={loading}
                                >
                                    {loading && <Loader2 className="h-5 w-5 animate-spin mr-2" />}
                                    {loading
                                        ? (mode === "signup" ? "Creating..." : "Signing in...")
                                        : (mode === "signup" ? "Create Account" : "Sign In")}
                                    {!loading && <ArrowRight className="ml-2 h-5 w-5" />}
                                </Button>

                                {/* Toggle mode */}
                                <p className="text-center text-sm text-slate-400">
                                    {mode === "signin" ? (
                                        <>
                                            Don't have an account?{" "}
                                            <button
                                                type="button"
                                                className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors"
                                                onClick={() => { setMode("signup"); setPassword(""); }}
                                            >
                                                Sign Up
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            Already have an account?{" "}
                                            <button
                                                type="button"
                                                className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors"
                                                onClick={() => { setMode("signin"); setPassword(""); }}
                                            >
                                                Sign In
                                            </button>
                                        </>
                                    )}
                                </p>
                            </motion.form>
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
