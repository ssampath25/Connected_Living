"use client"

import { useState } from "react"
import { useTheme } from "next-themes"
import { Moon, Sun, Monitor, ChevronLeft, Shield, User, Clock, LogOut, ChevronRight, ShieldAlert } from "lucide-react"
import Link from "next/link"

export default function SecuritySettingsPage() {
    const { theme, setTheme, resolvedTheme } = useTheme()
    const [currentView, setCurrentView] = useState<"main" | "appearance">("main")

    return (
        <div className="flex flex-col min-h-screen bg-background pb-24 lg:pb-0">
            {/* Header */}
            <div className="bg-card px-6 py-6 rounded-b-[2rem] border-b border-border shadow-sm sticky top-0 z-20">
                <div className="flex items-center gap-3">
                    {currentView !== "main" ? (
                        <button onClick={() => setCurrentView("main")} className="p-2 -ml-2 hover:bg-accent rounded-full">
                            <ChevronLeft className="h-6 w-6" />
                        </button>
                    ) : (
                        <Link href="/gate" className="lg:hidden p-2 -ml-2 hover:bg-accent rounded-full">
                            <ChevronLeft className="h-6 w-6" />
                        </Link>
                    )}
                    <div className="flex-1">
                        <h1 className="text-2xl font-extrabold text-green-600 tracking-tight">
                            {currentView === "appearance" ? "Appearance" : "Settings"}
                        </h1>
                    </div>
                    <div className="h-10 w-10 bg-green-500/10 rounded-xl flex items-center justify-center text-green-600">
                        <Shield size={20} />
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
                {currentView === "main" ? (
                    <>
                        {/* Guard Profile Card */}
                        <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-5 text-white">
                            <div className="flex items-center gap-4">
                                <div className="h-14 w-14 bg-white/20 rounded-full flex items-center justify-center text-2xl font-bold backdrop-blur-sm">
                                    SG
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg">Security Guard</h3>
                                    <p className="text-white/80 text-sm">Gate 1 • Day Shift</p>
                                </div>
                            </div>
                        </div>

                        {/* Shift Info */}
                        <section className="space-y-3">
                            <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider ml-1">Current Shift</h2>
                            <div className="bg-card rounded-2xl p-4 border border-border flex items-center gap-4">
                                <div className="h-12 w-12 bg-green-500/10 rounded-xl flex items-center justify-center text-green-600">
                                    <Clock size={24} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-foreground">Day Shift</h3>
                                    <p className="text-xs text-muted-foreground">6:00 AM - 2:00 PM • Gate 1</p>
                                </div>
                            </div>
                        </section>

                        {/* Settings Menu */}
                        <section className="space-y-3">
                            <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider ml-1">Settings</h2>
                            <div className="bg-card rounded-2xl overflow-hidden border border-border divide-y divide-border/50">
                                <Link
                                    href="/security-settings/blacklist"
                                    className="w-full flex items-center justify-between p-4 hover:bg-accent/50 transition-colors"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 rounded-full bg-red-500/10 flex items-center justify-center text-red-500">
                                            <ShieldAlert size={20} />
                                        </div>
                                        <div className="text-left">
                                            <h3 className="font-bold text-foreground">Blacklist Management</h3>
                                            <p className="text-xs text-muted-foreground">Flagged individuals & alerts</p>
                                        </div>
                                    </div>
                                    <ChevronRight size={20} className="text-muted-foreground" />
                                </Link>

                                <button
                                    onClick={() => setCurrentView("appearance")}
                                    className="w-full flex items-center justify-between p-4 hover:bg-accent/50 transition-colors"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 rounded-full bg-green-500/10 flex items-center justify-center text-green-600">
                                            {resolvedTheme === "dark" ? <Moon size={20} /> : <Sun size={20} />}
                                        </div>
                                        <div className="text-left">
                                            <h3 className="font-bold text-foreground">Appearance</h3>
                                            <p className="text-xs text-muted-foreground">Light, Dark, System</p>
                                        </div>
                                    </div>
                                    <ChevronRight size={20} className="text-muted-foreground" />
                                </button>
                            </div>
                        </section>

                        {/* Logout */}
                        <button
                            onClick={() => {
                                if (confirm("Are you sure you want to log out?")) {
                                    window.location.href = '/login'
                                }
                            }}
                            className="w-full bg-red-500/10 text-red-500 rounded-2xl p-4 font-bold flex items-center justify-center gap-2 hover:bg-red-500/20 transition-colors"
                        >
                            <LogOut size={20} />
                            Logout
                        </button>

                        {/* App Version */}
                        <div className="text-center pt-4">
                            <p className="text-xs text-muted-foreground">Connected Living Security • v1.0.2</p>
                        </div>
                    </>
                ) : (
                    // Appearance Settings
                    <div className="space-y-4">
                        <div className="bg-card rounded-2xl overflow-hidden border border-border divide-y divide-border/50">
                            <button
                                onClick={() => setTheme("light")}
                                className="w-full flex items-center justify-between p-4 hover:bg-accent/50 transition-colors"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="h-10 w-10 rounded-full bg-yellow-500/10 flex items-center justify-center text-yellow-600">
                                        <Sun size={20} />
                                    </div>
                                    <span className="font-semibold text-foreground">Light</span>
                                </div>
                                {theme === "light" && (
                                    <div className="h-6 w-6 bg-green-500 rounded-full flex items-center justify-center">
                                        <div className="h-2 w-2 bg-white rounded-full" />
                                    </div>
                                )}
                            </button>

                            <button
                                onClick={() => setTheme("dark")}
                                className="w-full flex items-center justify-between p-4 hover:bg-accent/50 transition-colors"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="h-10 w-10 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                                        <Moon size={20} />
                                    </div>
                                    <span className="font-semibold text-foreground">Dark</span>
                                </div>
                                {theme === "dark" && (
                                    <div className="h-6 w-6 bg-green-500 rounded-full flex items-center justify-center">
                                        <div className="h-2 w-2 bg-white rounded-full" />
                                    </div>
                                )}
                            </button>

                            <button
                                onClick={() => setTheme("system")}
                                className="w-full flex items-center justify-between p-4 hover:bg-accent/50 transition-colors"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="h-10 w-10 rounded-full bg-gray-500/10 flex items-center justify-center text-gray-500">
                                        <Monitor size={20} />
                                    </div>
                                    <span className="font-semibold text-foreground">System</span>
                                </div>
                                {theme === "system" && (
                                    <div className="h-6 w-6 bg-green-500 rounded-full flex items-center justify-center">
                                        <div className="h-2 w-2 bg-white rounded-full" />
                                    </div>
                                )}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
