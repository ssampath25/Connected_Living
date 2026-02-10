"use client"

import { useState, useEffect } from "react"
import { useTheme } from "next-themes"
import {
    Moon, Sun, Monitor, Users, Car, ChevronRight,
    Bell, Shield, Phone, FileText, ChevronLeft, Settings, AlertCircle,
    User, Mail, MapPin, Edit2, Check, X as XIcon
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { api } from "@/lib/api"
import { cn } from "@/lib/utils"

interface UserProfile {
    name: string
    email: string
    phone: string
    unit: string
    avatar?: string
}

export default function MorePage() {
    const router = useRouter()
    // View State
    const [currentView, setCurrentView] = useState<"main" | "appearance" | "profile">("main")

    const { theme, setTheme, resolvedTheme } = useTheme()
    const [mounted, setMounted] = useState(false)

    // Profile State
    const [profile, setProfile] = useState<UserProfile>({
        name: "",
        email: "",
        phone: "",
        unit: "",
        avatar: ""
    })
    const [isEditing, setIsEditing] = useState(false)
    const [editedProfile, setEditedProfile] = useState<UserProfile>(profile)

    // Ensure component is mounted to avoid hydration mismatch
    useEffect(() => {
        setMounted(true)
        // Fetch user data
        const loadUser = async () => {
            const user = await api.getCurrentUser()
            if (user) {
                const userProfile = {
                    name: user.name || "Resident",
                    email: user.email || "resident@example.com",
                    phone: user.phone || "+91 98765 43210",
                    unit: "A-101, Tower 1",
                    avatar: user.avatar || ""
                }
                setProfile(userProfile)
                setEditedProfile(userProfile)
            }
        }
        loadUser()
    }, [])
    const [showSOSConfirm, setShowSOSConfirm] = useState(false)

    const handleSOS = async () => {
        try {
            await api.triggerSOS()
            setShowSOSConfirm(false)
            // Optionally redirect or show success
        } catch (error) {
            console.error("Failed to trigger SOS")
        }
    }

    const handleSaveProfile = () => {
        setProfile(editedProfile)
        setIsEditing(false)
        // In real app, would call api.updateProfile(editedProfile)
    }

    const handleCancelEdit = () => {
        setEditedProfile(profile)
        setIsEditing(false)
    }

    // Notification States (Default all true)
    const [notifications, setNotifications] = useState({
        communityChat: true,
        announcements: true,
        events: true,
        amenities: true,
        payments: true
    })

    const toggleNotification = (key: keyof typeof notifications) => {
        setNotifications(prev => ({ ...prev, [key]: !prev[key] }))
    }

    const handleBack = () => {
        if (currentView !== "main") {
            setCurrentView("main")
        } else {
            // Default back behavior handled by existing Link
        }
    }

    if (!mounted) return null

    return (
        <div className="bg-background min-h-screen pb-24 lg:pb-8 transition-colors duration-300">
            {/* Header */}
            <div className="bg-card px-6 pt-6 pb-6 rounded-b-[2rem] border-b border-border flex flex-col gap-4 shadow-sm sticky top-0 z-20">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        {currentView !== "main" && (
                            <button onClick={handleBack} className="p-2 -ml-2 hover:bg-accent rounded-full text-foreground transition-colors">
                                <ChevronLeft className="h-6 w-6" />
                            </button>
                        )}

                        <h1 className="text-3xl font-extrabold text-primary tracking-tight">
                            {currentView === "appearance" ? "Appearance" : currentView === "profile" ? "Edit Profile" : "Settings"}
                        </h1>
                    </div>
                    {currentView === "main" && (
                        <div className="h-10 w-10 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                            <User size={20} />
                        </div>
                    )}
                </div>
            </div>

            <div className="p-6 space-y-8 max-w-3xl mx-auto">

                {currentView === "main" ? (
                    <>
                        {/* --- PROFILE SECTION --- */}
                        <section className="space-y-4">
                            <div className="bg-card rounded-2xl overflow-hidden shadow-sm border border-border">
                                <Link href="/profile" className="w-full flex items-center justify-between p-5 hover:bg-accent/50 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                            <User size={20} />
                                        </div>
                                        <div className="text-left">
                                            <h3 className="font-bold text-foreground">Profile Settings</h3>
                                            <p className="text-xs text-muted-foreground">Manage your profile</p>
                                        </div>
                                    </div>
                                    <ChevronRight size={20} className="text-muted-foreground" />
                                </Link>
                            </div>
                        </section>

                        {/* --- GENERAL SECTION --- */}
                        <section className="space-y-4">
                            <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider ml-1">General</h2>

                            <div className="bg-card rounded-2xl overflow-hidden shadow-sm border border-border divide-y divide-border/50">
                                {/* Appearance Link */}
                                <button
                                    onClick={() => setCurrentView("appearance")}
                                    className="w-full flex items-center justify-between p-5 hover:bg-accent/50 transition-colors"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                            {resolvedTheme === "dark" ? <Moon size={20} /> : <Sun size={20} />}
                                        </div>
                                        <div className="text-left">
                                            <h3 className="font-bold text-foreground">Appearance</h3>
                                            <p className="text-xs text-muted-foreground">Light, Dark, System</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-medium text-muted-foreground capitalize">{theme}</span>
                                        <ChevronRight size={20} className="text-muted-foreground" />
                                    </div>
                                </button>

                                <Link href="/family" className="w-full flex items-center justify-between p-5 hover:bg-accent/50 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
                                            <Users size={20} />
                                        </div>
                                        <div className="text-left">
                                            <h3 className="font-bold text-foreground">Manage Family Members</h3>
                                            <p className="text-xs text-muted-foreground">Add or remove residents</p>
                                        </div>
                                    </div>
                                    <ChevronRight size={20} className="text-muted-foreground" />
                                </Link>

                                <Link href="/vehicles" className="w-full flex items-center justify-between p-5 hover:bg-accent/50 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-500">
                                            <Car size={20} />
                                        </div>
                                        <div className="text-left">
                                            <h3 className="font-bold text-foreground">Manage Vehicles</h3>
                                            <p className="text-xs text-muted-foreground">Update vehicle details</p>
                                        </div>
                                    </div>
                                    <ChevronRight size={20} className="text-muted-foreground" />
                                </Link>
                            </div>
                        </section>


                        {/* --- NOTIFICATION PREFERENCES --- */}
                        <section className="space-y-4">
                            <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider ml-1">Notification Preferences</h2>
                            <div className="bg-card rounded-2xl p-2 shadow-sm border border-border divide-y divide-border/50">
                                {[
                                    { id: 'communityChat', label: 'Community Chat', icon: Bell },
                                    { id: 'announcements', label: 'Announcements', icon: Shield },
                                    { id: 'events', label: 'Events', icon: FileText },
                                    { id: 'amenities', label: 'Amenities Suggestions', icon: Monitor },
                                    { id: 'payments', label: 'Payment Notifications', icon: FileText },
                                ].map((item) => (
                                    <div key={item.id} className="flex items-center justify-between p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                                <item.icon size={18} />
                                            </div>
                                            <span className="font-semibold text-foreground text-sm">{item.label}</span>
                                        </div>
                                        <button
                                            onClick={() => toggleNotification(item.id as keyof typeof notifications)}
                                            className={cn(
                                                "w-11 h-6 rounded-full transition-colors relative",
                                                notifications[item.id as keyof typeof notifications] ? "bg-primary" : "bg-muted"
                                            )}
                                        >
                                            <span className={cn(
                                                "absolute top-1 left-1 bg-white h-4 w-4 rounded-full transition-transform shadow-sm",
                                                notifications[item.id as keyof typeof notifications] ? "translate-x-5" : ""
                                            )} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* --- EMERGENCY CONTACT --- */}
                        <section className="space-y-4">
                            <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider ml-1">Emergency Contacts</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="bg-card p-5 rounded-2xl shadow-sm border border-border flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 rounded-full bg-red-500/10 flex items-center justify-center text-red-500">
                                            <Shield size={20} />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-foreground">Security</h3>
                                            <p className="text-xs text-muted-foreground font-mono">+91 98765 43210</p>
                                        </div>
                                    </div>
                                    <button className="h-9 w-9 rounded-full bg-green-500/10 text-green-500 flex items-center justify-center hover:bg-green-500/20 transition-colors">
                                        <Phone size={18} />
                                    </button>
                                </div>

                                <div className="bg-card p-5 rounded-2xl shadow-sm border border-border flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
                                            <Users size={20} />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-foreground">Facility Manager</h3>
                                            <p className="text-xs text-muted-foreground font-mono">+91 12345 67890</p>
                                        </div>
                                    </div>
                                    <button className="h-9 w-9 rounded-full bg-green-500/10 text-green-500 flex items-center justify-center hover:bg-green-500/20 transition-colors">
                                        <Phone size={18} />
                                    </button>
                                </div>
                            </div>

                            {/* SOS Button inside Emergency Section */}
                            <div className="pt-2">
                                <button
                                    onClick={() => setShowSOSConfirm(true)}
                                    className="w-full bg-red-500/5 hover:bg-red-500/10 border-2 border-red-500/20 rounded-2xl p-4 flex items-center justify-between group transition-all"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="h-12 w-12 rounded-xl bg-red-500/20 text-red-500 flex items-center justify-center group-hover:scale-110 transition-transform animate-pulse">
                                            <AlertCircle size={24} />
                                        </div>
                                        <div className="text-left">
                                            <h3 className="text-lg font-bold text-red-500">SOS / Emergency</h3>
                                            <p className="text-sm text-red-500/80">Trigger immediate security alert</p>
                                        </div>
                                    </div>
                                    <div className="h-10 w-10 rounded-full bg-red-600 text-white flex items-center justify-center shadow-lg shadow-red-500/20">
                                        <span className="font-bold text-lg">!</span>
                                    </div>
                                </button>
                            </div>
                        </section>

                        {/* --- LEGAL DOCS --- */}
                        <section className="space-y-4">
                            <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider ml-1">Legal</h2>
                            <div className="bg-card rounded-2xl overflow-hidden shadow-sm border border-border">
                                <button className="w-full flex items-center justify-between p-5 hover:bg-accent/50 transition-colors border-b border-border/50">
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                                            <FileText size={20} />
                                        </div>
                                        <div className="text-left">
                                            <h3 className="font-bold text-foreground">Community Guidelines</h3>
                                            <p className="text-xs text-muted-foreground">PDF • 2.4 MB</p>
                                        </div>
                                    </div>
                                    <ChevronRight size={20} className="text-muted-foreground" />
                                </button>
                                <button className="w-full flex items-center justify-between p-5 hover:bg-accent/50 transition-colors border-b border-border/50">
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                                            <FileText size={20} />
                                        </div>
                                        <div className="text-left">
                                            <h3 className="font-bold text-foreground">Terms of Service</h3>
                                            <p className="text-xs text-muted-foreground">Legal Agreement</p>
                                        </div>
                                    </div>
                                    <ChevronRight size={20} className="text-muted-foreground" />
                                </button>
                                <button className="w-full flex items-center justify-between p-5 hover:bg-accent/50 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                                            <FileText size={20} />
                                        </div>
                                        <div className="text-left">
                                            <h3 className="font-bold text-foreground">Privacy Policy</h3>
                                            <p className="text-xs text-muted-foreground">Data usage & rights</p>
                                        </div>
                                    </div>
                                    <ChevronRight size={20} className="text-muted-foreground" />
                                </button>
                            </div>
                        </section>

                        <div className="text-center pt-8 pb-4">
                            <p className="text-xs text-muted-foreground font-medium">Connected Living App • v1.0.2</p>
                        </div>
                    </>
                ) : currentView === "profile" ? (
                    // --- PROFILE EDIT VIEW ---
                    <div className="animate-in slide-in-from-right duration-300 space-y-6">
                        {/* Avatar Section */}
                        <div className="flex justify-center">
                            <div className="relative">
                                <div className="h-24 w-24 rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white text-4xl font-bold overflow-hidden border-4 border-primary/20">
                                    {profile.avatar ? (
                                        <img src={profile.avatar} alt="Profile" className="h-full w-full object-cover" />
                                    ) : (
                                        profile.name.charAt(0).toUpperCase()
                                    )}
                                </div>
                                <button className="absolute -bottom-2 -right-2 h-8 w-8 bg-primary text-white rounded-xl flex items-center justify-center shadow-lg">
                                    <Edit2 size={14} />
                                </button>
                            </div>
                        </div>

                        {/* Form Fields */}
                        <section className="space-y-4">
                            <div className="bg-card rounded-2xl p-4 shadow-sm border border-border space-y-4">
                                {/* Name Field */}
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Full Name</label>
                                    <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl border border-border">
                                        <User size={18} className="text-muted-foreground" />
                                        <input
                                            type="text"
                                            value={editedProfile.name}
                                            onChange={(e) => setEditedProfile({ ...editedProfile, name: e.target.value })}
                                            className="flex-1 bg-transparent outline-none text-foreground font-medium"
                                            placeholder="Enter your name"
                                        />
                                    </div>
                                </div>

                                {/* Email Field */}
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Email</label>
                                    <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl border border-border">
                                        <Mail size={18} className="text-muted-foreground" />
                                        <input
                                            type="email"
                                            value={editedProfile.email}
                                            onChange={(e) => setEditedProfile({ ...editedProfile, email: e.target.value })}
                                            className="flex-1 bg-transparent outline-none text-foreground font-medium"
                                            placeholder="Enter your email"
                                        />
                                    </div>
                                </div>

                                {/* Phone Field */}
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Phone</label>
                                    <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl border border-border">
                                        <Phone size={18} className="text-muted-foreground" />
                                        <input
                                            type="tel"
                                            value={editedProfile.phone}
                                            onChange={(e) => setEditedProfile({ ...editedProfile, phone: e.target.value })}
                                            className="flex-1 bg-transparent outline-none text-foreground font-medium"
                                            placeholder="Enter your phone"
                                        />
                                    </div>
                                </div>

                                {/* Unit Field (Read-only) */}
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Unit / Flat</label>
                                    <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-xl border border-border">
                                        <MapPin size={18} className="text-muted-foreground" />
                                        <span className="flex-1 text-muted-foreground font-medium">{editedProfile.unit}</span>
                                        <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">Read-only</span>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Action Buttons */}
                        <div className="grid grid-cols-2 gap-4 pt-4">
                            <button
                                onClick={handleCancelEdit}
                                className="py-4 bg-muted hover:bg-accent rounded-2xl font-bold text-foreground transition-colors flex items-center justify-center gap-2"
                            >
                                <XIcon size={18} />
                                Cancel
                            </button>
                            <button
                                onClick={handleSaveProfile}
                                className="py-4 bg-primary hover:bg-primary/90 rounded-2xl font-bold text-white transition-colors shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
                            >
                                <Check size={18} />
                                Save Changes
                            </button>
                        </div>
                    </div>
                ) : (
                    // --- APPEARANCE SUB-VIEW ---
                    <div className="animate-in slide-in-from-right duration-300">
                        <section className="space-y-4">
                            <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider ml-1">Choose a Theme</h2>
                            <div className="bg-card rounded-2xl overflow-hidden shadow-sm border border-border divide-y divide-border/50">
                                {/* Light Mode */}
                                <button
                                    onClick={() => setTheme("light")}
                                    className="w-full flex items-center justify-between p-5 hover:bg-accent/50 transition-colors"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-500">
                                            <Sun size={20} />
                                        </div>
                                        <span className="font-bold text-foreground">Light Mode</span>
                                    </div>
                                    {theme === "light" && (
                                        <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center text-white">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                        </div>
                                    )}
                                </button>

                                {/* Dark Mode */}
                                <button
                                    onClick={() => setTheme("dark")}
                                    className="w-full flex items-center justify-between p-5 hover:bg-accent/50 transition-colors"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 rounded-full bg-slate-500/10 flex items-center justify-center text-slate-500">
                                            <Moon size={20} />
                                        </div>
                                        <span className="font-bold text-foreground">Dark Mode</span>
                                    </div>
                                    {theme === "dark" && (
                                        <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center text-white">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                        </div>
                                    )}
                                </button>

                                {/* System Default */}
                                <button
                                    onClick={() => setTheme("system")}
                                    className="w-full flex items-center justify-between p-5 hover:bg-accent/50 transition-colors"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                                            <Monitor size={20} />
                                        </div>
                                        <span className="font-bold text-foreground">System Default</span>
                                    </div>
                                    {theme === "system" && (
                                        <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center text-white">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                        </div>
                                    )}
                                </button>
                            </div>
                        </section>
                    </div>
                )}
            </div>
            {/* SOS Confirmation Modal */}
            {showSOSConfirm && (
                <div className="fixed inset-0 bg-black/60 z-[100] backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-card rounded-3xl p-6 w-full max-w-xs text-center space-y-4 animate-in zoom-in-95 duration-200">
                        <div className="h-20 w-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto text-red-500 mb-2">
                            <AlertCircle size={40} />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-foreground">Are you sure?</h3>
                            <p className="text-sm text-muted-foreground mt-2">
                                This will immediately alert security with your location and details.
                            </p>
                        </div>
                        <div className="grid grid-cols-2 gap-3 pt-2">
                            <button
                                onClick={() => setShowSOSConfirm(false)}
                                className="w-full py-3 bg-muted hover:bg-accent rounded-xl font-bold text-foreground transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSOS}
                                className="w-full py-3 bg-red-600 hover:bg-red-700 rounded-xl font-bold text-white shadow-lg shadow-red-500/20 transition-all active:scale-95"
                            >
                                YES, ALERT
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
