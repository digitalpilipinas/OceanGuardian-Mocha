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
        <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                className="w-full max-w-md"
            >
                <div className="flex flex-col items-center mb-8">
                    <div className="bg-primary text-primary-foreground p-4 rounded-2xl shadow-lg mb-4">
                        <Waves className="h-8 w-8" />
                    </div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                        OceanGuardian
                    </h1>
                    <p className="text-muted-foreground">Protect our oceans, one report at a time.</p>
                </div>

                <Card className="glass-liquid border-none shadow-2xl rounded-3xl overflow-hidden">
                    <CardHeader className="text-center pb-2">
                        <CardTitle className="text-2xl font-bold">
                            {step === "email" ? "Welcome Back" : "Verify Email"}
                        </CardTitle>
                        <CardDescription>
                            {step === "email"
                                ? "Enter your email to receive a sign-in code"
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
                                            <Mail className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                                            <Input
                                                type="email"
                                                placeholder="email@example.com"
                                                className="pl-10 h-12 rounded-xl focus:ring-primary"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                required
                                            />
                                        </div>
                                    </div>
                                    <Button
                                        type="submit"
                                        className="w-full h-12 rounded-xl text-lg font-semibold"
                                        disabled={loading}
                                    >
                                        {loading ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : null}
                                        {loading ? "Sending..." : "Send Code"}
                                        <ArrowRight className="ml-2 h-5 w-5" />
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
                                            placeholder="6-digit code"
                                            className="h-12 text-center text-2xl tracking-[1em] rounded-xl focus:ring-primary font-mono"
                                            value={otp}
                                            onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                                            required
                                        />
                                    </div>
                                    <Button
                                        type="submit"
                                        className="w-full h-12 rounded-xl text-lg font-semibold"
                                        disabled={loading || otp.length < 6}
                                    >
                                        {loading ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : null}
                                        {loading ? "Verifying..." : "Sign In"}
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        className="w-full"
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
                                <span className="w-full border-t border-muted-foreground/20"></span>
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-transparent px-2 text-muted-foreground font-medium">Or continue with</span>
                            </div>
                        </div>
                        <Button
                            variant="outline"
                            className="w-full h-12 rounded-xl border-none neo-interactive"
                            onClick={handleGuestLogin}
                            disabled={loading}
                        >
                            <UserCircle className="mr-2 h-5 w-5" />
                            Guest Access
                        </Button>
                    </CardFooter>
                </Card>
                <p className="mt-8 text-center text-sm text-muted-foreground px-8">
                    By continuing, you agree to our terms and community guidelines for ocean protection.
                </p>
            </motion.div>
        </div>
    );
}
