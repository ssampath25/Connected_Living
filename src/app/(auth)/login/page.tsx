"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, Lock, User as UserIcon, Building2, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { api } from "@/lib/api"

export default function LoginPage() {
    const [username, setUsername] = React.useState("")
    const [password, setPassword] = React.useState("")
    const [error, setError] = React.useState("")
    const [showPassword, setShowPassword] = React.useState(false)
    const router = useRouter()
    const [isLoading, setIsLoading] = React.useState(false)
    const [showSplash, setShowSplash] = React.useState(true)

    React.useEffect(() => {
        const timer = setTimeout(() => setShowSplash(false), 2000)
        return () => clearTimeout(timer)
    }, [])

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")
        setIsLoading(true)

        try {
            const response = await api.login(username, password)
            if (response.accessToken) {
                router.push("/dashboard")
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "Invalid username or password")
        } finally {
            setIsLoading(false)
        }
    }


    if (showSplash) {
        return (
            <div className="fixed inset-0 bg-[#1a237e] flex flex-col items-center justify-center z-50 animate-out fade-out duration-700 delay-[1800ms] fill-mode-forwards">
                <div className="flex flex-col items-center animate-in zoom-in-50 duration-700 ease-out">
                    <div className="h-24 w-24 bg-white/10 backdrop-blur-md rounded-3xl flex items-center justify-center mb-6 border border-white/20 shadow-2xl animate-pulse">
                        <Building2 className="h-12 w-12 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Connected Living</h1>
                    <p className="text-indigo-200 text-sm font-medium mt-2 tracking-widest uppercase">Community App</p>
                </div>

                {/* Loader dots */}
                <div className="absolute bottom-12 flex gap-2">
                    <div className="h-2 w-2 bg-white/50 rounded-full animate-bounce delay-75" />
                    <div className="h-2 w-2 bg-white/50 rounded-full animate-bounce delay-150" />
                    <div className="h-2 w-2 bg-white/50 rounded-full animate-bounce delay-300" />
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 flex items-start justify-center relative overflow-hidden animate-in fade-in duration-1000">

            {/* 1. Curved Blue Header Background */}
            <div className="absolute top-0 inset-x-0 h-[45vh] bg-[#1a237e] rounded-b-[3rem] lg:rounded-b-[50%] lg:scale-x-110 flex items-start justify-center pt-16 z-0 shadow-2xl">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }}></div>

                {/* Brand Logo in Header */}
                <div className="text-center text-white relative z-10 animate-in slide-in-from-top-10 duration-700">
                    <div className="h-20 w-20 bg-white/10 backdrop-blur-md rounded-3xl flex items-center justify-center mx-auto mb-4 border border-white/20 shadow-xl">
                        <Building2 className="h-10 w-10 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight">Connected Living</h1>
                    <p className="text-indigo-200 text-sm font-medium mt-1 tracking-wide uppercase">Community Super App</p>
                </div>
            </div>

            {/* 2. Floating Login Card */}
            <div className="w-full max-w-md bg-white/95 backdrop-blur-xl rounded-[2.5rem] shadow-[0_30px_70px_-20px_rgba(26,35,126,0.2)] p-8 relative z-10 mt-[30vh] mx-4 animate-in slide-in-from-bottom-20 duration-700 border border-white/60 ring-1 ring-gray-100/80">
                <div className="mb-10 text-center">
                    <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Welcome Back!</h2>
                    <p className="text-gray-500 font-medium text-sm mt-3 px-4 leading-relaxed">
                        Sign in to manage your <span className="text-[#1a237e] font-bold">Connected Living</span> experience.
                    </p>
                </div>

                <form className="space-y-6" onSubmit={handleLogin}>
                    {error && (
                        <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-xs font-bold flex items-center gap-3 animate-pulse">
                            <span className="h-2 w-2 rounded-full bg-red-500 shrink-0" />
                            {error}
                        </div>
                    )}

                    <div className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-700 ml-1 uppercase tracking-wider">Username</label>
                            <div className="relative group transition-all focus-within:scale-[1.01]">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <UserIcon className="h-5 w-5 text-gray-400 group-focus-within:text-[#1a237e] transition-colors" />
                                </div>
                                <Input
                                    type="text"
                                    className="pl-11 h-14 bg-gray-50 border-gray-100 focus:bg-white focus:border-[#1a237e]/20 focus:ring-4 focus:ring-[#1a237e]/10 rounded-2xl text-base transition-all font-medium text-gray-900 placeholder:text-gray-400 placeholder:font-normal"
                                    placeholder="e.g. resident_101"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-700 ml-1 uppercase tracking-wider">Password</label>
                            <div className="relative group transition-all focus-within:scale-[1.01]">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-[#1a237e] transition-colors" />
                                </div>
                                <Input
                                    type={showPassword ? "text" : "password"}
                                    className="pl-11 pr-11 h-14 bg-gray-50 border-gray-100 focus:bg-white focus:border-[#1a237e]/20 focus:ring-4 focus:ring-[#1a237e]/10 rounded-2xl text-base transition-all font-medium text-gray-900 placeholder:text-gray-400 placeholder:font-normal"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                            <div className="flex justify-end pt-1">
                                <Link href="/forgot-password" className="text-xs font-bold text-[#1a237e] hover:underline">
                                    Forgot Password?
                                </Link>
                            </div>
                        </div>
                    </div>

                    <Button
                        className="w-full h-14 rounded-2xl text-[15px] font-bold tracking-wide bg-[#1a237e] hover:bg-[#1a237e]/90 shadow-lg shadow-indigo-900/20 hover:shadow-indigo-900/40 transition-all hover:-translate-y-0.5 mt-2"
                        type="submit"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <span className="flex items-center gap-2">
                                <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Authenticating...
                            </span>
                        ) : (
                            <span className="flex items-center justify-center gap-2">
                                Sign In <ChevronRight className="h-4 w-4 opacity-70" strokeWidth={3} />
                            </span>
                        )}
                    </Button>
                </form>

                <div className="mt-8 pt-6 border-t border-gray-100 text-center">
                    <p className="text-sm text-gray-500 font-medium italic">
                        Contact your society admin for login credentials.
                    </p>
                </div>
            </div>

            {/* Bottom Credits */}
            <div className="absolute bottom-6 flex gap-4 text-gray-400 text-[10px] font-bold uppercase tracking-widest opacity-50">
                <span>Terms</span>
                <span>•</span>
                <span>Privacy</span>
                <span>•</span>
                <span>Support</span>
            </div>
        </div>
    )
}
