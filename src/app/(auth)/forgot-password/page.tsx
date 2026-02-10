"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ChevronLeft, Mail, Phone, Lock, ArrowRight, CheckCircle2, ShieldCheck, KeyRound } from "lucide-react"
import { cn } from "@/lib/utils"

export default function ForgotPasswordPage() {
    const router = useRouter()
    const [step, setStep] = useState<1 | 2 | 3 | 4>(1) // 1: Input, 2: OTP, 3: Reset, 4: Success
    const [method, setMethod] = useState<"email" | "phone">("email")
    const [identifier, setIdentifier] = useState("")
    const [otp, setOtp] = useState(["", "", "", ""])
    const [newPassword, setNewPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const [timer, setTimer] = useState(30)

    // Timer for OTP resend
    useEffect(() => {
        let interval: NodeJS.Timeout
        if (step === 2 && timer > 0) {
            interval = setInterval(() => setTimer((t) => t - 1), 1000)
        }
        return () => clearInterval(interval)
    }, [step, timer])

    const handleSendOTP = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")
        if (!identifier) {
            setError("Please enter your details")
            return
        }

        setLoading(true)
        // Mock API call
        await new Promise(resolve => setTimeout(resolve, 1500))
        setLoading(false)
        setStep(2)
        setTimer(30)
    }

    const handleVerifyOTP = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")
        const code = otp.join("")
        if (code.length !== 4) {
            setError("Please enter the complete 4-digit code")
            return
        }

        setLoading(true)
        // Mock verification
        await new Promise(resolve => setTimeout(resolve, 1500))
        setLoading(false)
        setStep(3)
    }

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")

        if (newPassword.length < 8) {
            setError("Password must be at least 8 characters")
            return
        }
        if (newPassword !== confirmPassword) {
            setError("Passwords do not match")
            return
        }

        setLoading(true)
        // Mock API call
        await new Promise(resolve => setTimeout(resolve, 1500))
        setLoading(false)
        setStep(4)
    }

    const handleOtpChange = (index: number, value: string) => {
        if (value.length > 1) return
        const newOtp = [...otp]
        newOtp[index] = value
        setOtp(newOtp)

        // Auto focus next
        if (value && index < 3) {
            document.getElementById(`otp-${index + 1}`)?.focus()
        }
    }

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-card rounded-[2rem] shadow-xl p-8 relative overflow-hidden border border-border">

                {/* Back Button (Only visible in early steps) */}
                {step < 4 && (
                    <button
                        onClick={() => step === 1 ? router.back() : setStep(prev => (prev - 1) as any)}
                        className="absolute top-6 left-6 p-2 rounded-full hover:bg-accent text-muted-foreground transition-colors"
                    >
                        <ChevronLeft size={24} />
                    </button>
                )}

                <div className="mt-12">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="h-16 w-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mx-auto mb-4">
                            {step === 1 && <KeyRound size={32} />}
                            {step === 2 && <ShieldCheck size={32} />}
                            {step === 3 && <Lock size={32} />}
                            {step === 4 && <CheckCircle2 size={32} className="text-green-600" />}
                        </div>
                        <h1 className="text-2xl font-bold text-foreground">
                            {step === 1 && "Forgot Password?"}
                            {step === 2 && "Verification Code"}
                            {step === 3 && "Reset Password"}
                            {step === 4 && "Password Updated!"}
                        </h1>
                        <p className="text-muted-foreground text-sm mt-2 px-4">
                            {step === 1 && "Don't worry! It happens. Please enter the address associated with your account."}
                            {step === 2 && `We have sent a verification code to ${identifier}.`}
                            {step === 3 && "Create a new strong password for your account."}
                            {step === 4 && "Your password has been successfully reset. You can now login with your new credentials."}
                        </p>
                    </div>

                    {/* Step 1: Input */}
                    {step === 1 && (
                        <form onSubmit={handleSendOTP} className="space-y-6">
                            {/* Method Toggle */}
                            <div className="flex bg-muted p-1 rounded-xl">
                                <button
                                    type="button"
                                    onClick={() => setMethod("email")}
                                    className={cn(
                                        "flex-1 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2",
                                        method === "email" ? "bg-card text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"
                                    )}
                                >
                                    <Mail size={16} /> Email
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setMethod("phone")}
                                    className={cn(
                                        "flex-1 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2",
                                        method === "phone" ? "bg-card text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"
                                    )}
                                >
                                    <Phone size={16} /> SMS
                                </button>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider ml-1">
                                    {method === "email" ? "Email Address" : "Phone Number"}
                                </label>
                                <input
                                    type={method === "email" ? "email" : "tel"}
                                    value={identifier}
                                    onChange={(e) => setIdentifier(e.target.value)}
                                    placeholder={method === "email" ? "john@example.com" : "+1 234 567 890"}
                                    className="w-full h-12 rounded-xl bg-muted border border-border px-4 focus:bg-card focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all font-semibold text-foreground placeholder:text-muted-foreground"
                                />
                            </div>

                            {error && <p className="text-red-500 text-xs font-bold text-center bg-red-50 p-2 rounded-lg">{error}</p>}

                            <button
                                type="submit"
                                disabled={loading || !identifier}
                                className="w-full h-14 bg-primary text-primary-foreground rounded-xl font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? "Sending..." : "Send Verification Code"}
                            </button>
                        </form>
                    )}

                    {/* Step 2: OTP */}
                    {step === 2 && (
                        <form onSubmit={handleVerifyOTP} className="space-y-8">
                            <div className="flex justify-center gap-3">
                                {otp.map((digit, i) => (
                                    <input
                                        key={i}
                                        id={`otp-${i}`}
                                        type="text"
                                        maxLength={1}
                                        value={digit}
                                        onChange={(e) => handleOtpChange(i, e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === "Backspace" && !digit && i > 0) {
                                                document.getElementById(`otp-${i - 1}`)?.focus()
                                            }
                                        }}
                                        className="w-14 h-16 rounded-xl border-2 border-border text-center text-2xl font-bold focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/5 transition-all bg-background text-foreground"
                                    />
                                ))}
                            </div>

                            <div className="text-center">
                                {timer > 0 ? (
                                    <p className="text-muted-foreground text-xs font-bold">Resend code in <span className="text-primary">{timer}s</span></p>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => setTimer(30)}
                                        className="text-primary text-xs font-bold hover:underline"
                                    >
                                        Resend Code
                                    </button>
                                )}
                            </div>

                            {error && <p className="text-red-500 text-xs font-bold text-center bg-red-50 p-2 rounded-lg">{error}</p>}

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full h-14 bg-primary text-primary-foreground rounded-xl font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all flex items-center justify-center gap-2"
                            >
                                {loading ? "Verifying..." : "Verify Code"}
                            </button>
                        </form>
                    )}

                    {/* Step 3: Reset */}
                    {step === 3 && (
                        <form onSubmit={handleResetPassword} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider ml-1">New Password</label>
                                <input
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="Min. 8 characters"
                                    className="w-full h-12 rounded-xl bg-muted border border-border px-4 focus:bg-card focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all font-semibold text-foreground placeholder:text-muted-foreground"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider ml-1">Confirm Password</label>
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Re-enter password"
                                    className="w-full h-12 rounded-xl bg-muted border border-border px-4 focus:bg-card focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all font-semibold text-foreground placeholder:text-muted-foreground"
                                />
                            </div>

                            {error && <p className="text-red-500 text-xs font-bold text-center bg-red-50 p-2 rounded-lg">{error}</p>}

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full h-14 bg-primary text-primary-foreground rounded-xl font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all flex items-center justify-center gap-2"
                            >
                                {loading ? "Resetting..." : "Reset Password"}
                            </button>
                        </form>
                    )}

                    {/* Step 4: Success */}
                    {step === 4 && (
                        <div className="space-y-6">
                            <div className="bg-green-50 text-green-700 p-4 rounded-xl text-center text-sm font-medium">
                                Your account has been secured with a new password. You can now log in.
                            </div>
                            <Link href="/login" className="w-full h-14 bg-primary text-primary-foreground rounded-xl font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all flex items-center justify-center gap-2">
                                Return to Login
                            </Link>
                        </div>
                    )}
                </div>

                {/* Footer safe area padding */}
                <div className="h-6" />
            </div>
        </div>
    )
}
