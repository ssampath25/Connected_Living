"use client"

import { useState, useEffect } from "react"
import {
    ArrowLeft,
    Edit2,
    Phone,
    Mail,
    Home,
    Calendar,
    Users,
    Car,
    Receipt,
    Lock,
    Settings,
    HelpCircle,
    LogOut,
    ChevronRight,
    Camera,
    Loader2,
    Check,
    X,
    Upload
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { api, UserItem } from "@/lib/api"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useUI } from "@/components/providers/ui-provider"

export default function ProfilePage() {
    const router = useRouter()
    const [user, setUser] = useState<UserItem | null>(null)
    const [loading, setLoading] = useState(true)
    const [isEditing, setIsEditing] = useState(false)
    const [editName, setEditName] = useState("")
    const { setInteractivityDisabled } = useUI()

    // OTP Modal State
    const [modal, setModal] = useState<{
        isOpen: boolean
        type: 'phone' | 'email' | 'password' | null
        step: 'method' | 'confirm' | 'otp' | 'password-check' | 'new-value' | 'success' // method only for password
        target?: string // where OTP was sent
    }>({ isOpen: false, type: null, step: 'confirm' })

    const [otpInput, setOtpInput] = useState("")
    const [currentPassword, setCurrentPassword] = useState("")
    const [newValue, setNewValue] = useState("")
    const [loadingAction, setLoadingAction] = useState(false)

    useEffect(() => {
        fetchUser()
    }, [])

    useEffect(() => {
        setInteractivityDisabled(isEditing || modal.isOpen)
        // Cleanup on unmount
        return () => setInteractivityDisabled(false)
    }, [isEditing, modal.isOpen, setInteractivityDisabled])

    const fetchUser = async () => {
        try {
            const userData = await api.getUserProfile()
            if (userData) {
                setUser(userData)
                setEditName(userData.name)
            }
        } catch (error) {
            console.error("Failed to fetch profile", error)
        } finally {
            setLoading(false)
        }
    }

    const handleSaveProfile = async () => {
        setLoadingAction(true)
        try {
            const updated = await api.updateUserProfile({ name: editName })
            setUser(updated)
            setIsEditing(false)
        } catch (e) {
            console.error(e)
        } finally {
            setLoadingAction(false)
        }
    }

    // --- OTP FLOW HANDLERS ---

    const startEdit = (field: 'phone' | 'email' | 'password') => {
        if (!user) return

        if (field === 'phone') {
            // Verify via Email
            setModal({ isOpen: true, type: 'phone', step: 'confirm', target: user.email })
        } else if (field === 'email') {
            // Verify via Phone
            setModal({ isOpen: true, type: 'email', step: 'confirm', target: user.phone })
        } else if (field === 'password') {
            // Ask which method
            setModal({ isOpen: true, type: 'password', step: 'method' })
        }
        setOtpInput("")
        setCurrentPassword("")
        setNewValue("")
    }

    const sendOtp = async (method?: 'email' | 'phone') => {
        setLoadingAction(true)
        const target = method === 'email' ? user?.email : user?.phone
        try {
            // In password flow, we might choose. In others, it's fixed.
            const finalTarget = modal.target || target
            if (finalTarget) {
                await api.sendOTP(finalTarget, method || (modal.type === 'phone' ? 'email' : 'phone'))
                setModal(prev => ({ ...prev, step: 'otp', target: finalTarget }))
            }
        } catch (e) {
            console.error(e)
        } finally {
            setLoadingAction(false)
        }
    }

    const verifyOtp = async () => {
        setLoadingAction(true)
        try {
            const isValid = await api.verifyOTP(otpInput)
            if (isValid) {
                setModal(prev => ({ ...prev, step: 'new-value' }))
            } else {
                alert("Invalid OTP (Try 1234)")
            }
        } catch (e) {
            console.error(e)
        } finally {
            setLoadingAction(false)
        }
    }

    const verifyCurrentPassword = async () => {
        setLoadingAction(true)
        try {
            const isValid = await api.verifyPassword(currentPassword)
            if (isValid) {
                setModal(prev => ({ ...prev, step: 'new-value' }))
            } else {
                alert("Incorrect Password (Try password123)")
            }
        } catch (e) {
            console.error(e)
        } finally {
            setLoadingAction(false)
        }
    }

    const submitChange = async () => {
        setLoadingAction(true)
        try {
            if (modal.type === 'phone') {
                await api.updateUserProfile({ phone: newValue })
            } else if (modal.type === 'email') {
                await api.updateUserProfile({ email: newValue })
            } else if (modal.type === 'password') {
                await api.changePassword(newValue)
            }

            // Refresh local data
            const updated = await api.getUserProfile()
            if (updated) setUser(updated)

            setModal(prev => ({ ...prev, step: 'success' }))
            setTimeout(() => setModal({ isOpen: false, type: null, step: 'confirm' }), 2000)
        } catch (e) {
            console.error(e)
        } finally {
            setLoadingAction(false)
        }
    }

    const handleLogout = () => {
        if (confirm("Are you sure you want to log out?")) {
            router.push('/login')
        }
    }

    const menuItems = [
        { icon: Receipt, label: "Payment History", sub: "View all transactions", href: "/payments" },
        { icon: HelpCircle, label: "Help & Support", sub: "Get help", href: "/support" },
    ]

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    if (!user) return null

    return (
        <div className="min-h-screen bg-background pb-24 relative">
            {/* Header */}
            <div className="bg-card p-4 flex items-center justify-between shadow-sm sticky top-0 z-10 border-b border-border">
                <button onClick={() => isEditing ? setIsEditing(false) : router.back()} className="p-2 -ml-2 text-primary">
                    {isEditing ? <X size={24} /> : <ArrowLeft size={24} />}
                </button>
                <h1 className="text-xl font-bold text-primary">
                    {isEditing ? "Edit Profile" : "Profile"}
                </h1>
                <button
                    onClick={() => isEditing ? handleSaveProfile() : setIsEditing(true)}
                    className="p-2 -mr-2 text-primary disabled:opacity-50"
                    disabled={loadingAction || modal.isOpen}
                >
                    {loadingAction ? <Loader2 size={24} className="animate-spin" /> : isEditing ? <Check size={24} /> : <Edit2 size={24} />}
                </button>
            </div>

            <div className="p-6">
                {/* Profile Card */}
                <div className="flex flex-col items-center mb-8">
                    <div className="relative group">
                        <div className={cn(
                            "h-28 w-28 rounded-full bg-primary/10 border-4 border-card shadow-sm flex items-center justify-center text-primary overflow-hidden",
                            isEditing && "opacity-90"
                        )}>
                            {/* Avatar */}
                            {user.avatar ? (
                                <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" />
                            ) : (
                                <span className="text-3xl font-bold">{user.name.charAt(0)}</span>
                            )}
                        </div>
                        {isEditing && (
                            <div className="absolute inset-0 bg-black/30 rounded-full flex items-center justify-center text-white cursor-pointer">
                                <Upload size={24} />
                            </div>
                        )}
                        {!isEditing && (
                            <div className="absolute bottom-0 right-0 bg-primary p-2 rounded-full border-2 border-card text-white">
                                <Camera size={16} />
                            </div>
                        )}
                    </div>

                    {isEditing ? (
                        <div className="mt-4 w-full max-w-xs text-center">
                            <label className="text-xs text-muted-foreground mb-1 block">Full Name</label>
                            <Input
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                className="text-center font-bold text-lg border-border focus:border-primary"
                            />
                        </div>
                    ) : (
                        <h2 className="mt-4 text-2xl font-bold text-foreground">{user.name}</h2>
                    )}
                    <p className="text-muted-foreground text-sm mt-1">{user.role} • Unit {user.unitId}</p>
                </div>

                <div className={cn(
                    "transition-all duration-300",
                    modal.isOpen && "pointer-events-none opacity-50 grayscale select-none"
                )}>
                    {/* Info Card */}
                    <div className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden mb-6">
                        <div className="p-4 flex items-center justify-between">
                            <Info content={<div className="flex items-center gap-4">
                                <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center flex-shrink-0"><Phone size={20} /></div>
                                <div><p className="text-xs text-muted-foreground mb-0.5">Phone</p><p className="text-sm font-semibold text-foreground">{user.phone}</p></div>
                            </div>} />
                            {isEditing && <Button variant="ghost" size="sm" onClick={() => startEdit('phone')} className="text-primary"><Edit2 size={16} /></Button>}
                        </div>
                        <div className="h-[1px] bg-border mx-14"></div>

                        <div className="p-4 flex items-center justify-between">
                            <Info content={<div className="flex items-center gap-4">
                                <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center flex-shrink-0"><Mail size={20} /></div>
                                <div><p className="text-xs text-muted-foreground mb-0.5">Email</p><p className="text-sm font-semibold text-foreground">{user.email}</p></div>
                            </div>} />
                            {isEditing && <Button variant="ghost" size="sm" onClick={() => startEdit('email')} className="text-primary"><Edit2 size={16} /></Button>}
                        </div>
                        <div className="h-[1px] bg-border mx-14"></div>

                        <InfoRow icon={Home} label="Unit" value={user.unitId || "N/A"} />
                        <div className="h-[1px] bg-border mx-14"></div>
                        <InfoRow icon={Calendar} label="Member Since" value="Jan 2024" />
                    </div>

                    <div className={cn(
                        "space-y-4 transition-all duration-300",
                        (isEditing || modal.isOpen) && "pointer-events-none opacity-50 grayscale select-none"
                    )}>
                        {/* Menu Items */}
                        {menuItems.map((item, index) => (
                            <Link key={index} href={item.href}>
                                <div className="bg-card p-4 rounded-2xl shadow-sm border border-border flex items-center justify-between mb-4 hover:bg-accent transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                                            <item.icon size={24} />
                                        </div>
                                        <div>
                                            <p className="font-bold text-foreground leading-tight">{item.label}</p>
                                            <p className="text-xs text-muted-foreground mt-1">{item.sub}</p>
                                        </div>
                                    </div>
                                    <ChevronRight size={20} className="text-muted-foreground" />
                                </div>
                            </Link>
                        ))}

                        {/* Change Password - Special Case */}
                        <button
                            onClick={() => startEdit('password')}
                            className="w-full bg-card p-4 rounded-2xl shadow-sm border border-border flex items-center justify-between mb-4 hover:bg-accent transition-colors"
                        >
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                                    <Lock size={24} />
                                </div>
                                <div className="text-left">
                                    <p className="font-bold text-foreground leading-tight">Change Password</p>
                                    <p className="text-xs text-muted-foreground mt-1">Update your password</p>
                                </div>
                            </div>
                            {isEditing ? <Edit2 size={18} className="text-primary" /> : <ChevronRight size={20} className="text-muted-foreground" />}
                        </button>

                        {/* Settings Link */}
                        <Link href="/more">
                            <div className="bg-card p-4 rounded-2xl shadow-sm border border-border flex items-center justify-between mb-4 hover:bg-accent transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                                        <Settings size={24} />
                                    </div>
                                    <div>
                                        <p className="font-bold text-foreground leading-tight">Settings</p>
                                        <p className="text-xs text-muted-foreground mt-1">App preferences</p>
                                    </div>
                                </div>
                                <ChevronRight size={20} className="text-muted-foreground" />
                            </div>
                        </Link>

                        {/* Logout */}
                        <button
                            onClick={handleLogout}
                            className="w-full bg-red-500/5 p-4 rounded-2xl flex items-center justify-between group hover:bg-red-500/10 border border-red-500/10 transition-colors"
                        >
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center group-hover:bg-red-500/20">
                                    <LogOut size={24} />
                                </div>
                                <div className="text-left">
                                    <p className="font-bold text-red-500 leading-tight">Logout</p>
                                    <p className="text-xs text-red-400 dark:text-red-500/70 mt-1">Sign out of your account</p>
                                </div>
                            </div>
                            <ChevronRight size={20} className="text-red-500/30" />
                        </button>
                    </div>
                </div>
            </div>

            {/* --- OTP MODAL --- */}
            {modal.isOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-card rounded-2xl w-full max-w-sm p-6 shadow-xl animate-in fade-in zoom-in-95 duration-200 relative">
                        <button
                            onClick={() => setModal({ ...modal, isOpen: false })}
                            className="absolute top-4 right-4 text-muted-foreground hover:text-foreground p-1"
                        >
                            <X size={20} />
                        </button>

                        {modal.step === 'method' && (
                            <div className="space-y-4">
                                <h3 className="text-lg font-bold text-center text-foreground">Verify Identity</h3>
                                <p className="text-sm text-center text-muted-foreground">How do you want to verify your identity?</p>
                                <Button onClick={() => sendOtp('email')} className="w-full bg-primary hover:bg-primary/90">
                                    Send OTP to Email
                                </Button>
                                <Button onClick={() => sendOtp('phone')} className="w-full bg-primary hover:bg-primary/90">
                                    Send OTP to Phone
                                </Button>
                                <Button onClick={() => setModal({ ...modal, step: 'password-check' })} variant="outline" className="w-full">
                                    Use Current Password
                                </Button>
                                <Button onClick={() => setModal({ ...modal, isOpen: false })} variant="ghost" className="w-full text-muted-foreground">Cancel</Button>
                            </div>
                        )}

                        {modal.step === 'confirm' && (
                            <div className="space-y-4 text-center">
                                <h3 className="text-lg font-bold text-foreground">Update {modal.type === 'phone' ? 'Phone' : 'Email'}</h3>
                                <p className="text-sm text-muted-foreground">
                                    For security, we will send an OTP to your {modal.type === 'phone' ? 'Registered Email' : 'Mobile Number'} ({modal.target}).
                                </p>
                                <Button onClick={() => sendOtp()} className="w-full bg-primary hover:bg-primary/90" disabled={loadingAction}>
                                    {loadingAction ? <Loader2 className="animate-spin" /> : "Send OTP"}
                                </Button>
                                <Button onClick={() => setModal({ ...modal, isOpen: false })} variant="ghost" className="w-full text-muted-foreground">Cancel</Button>
                            </div>
                        )}

                        {modal.step === 'otp' && (
                            <div className="space-y-4 text-center">
                                <h3 className="text-lg font-bold text-foreground">Enter OTP</h3>
                                <p className="text-sm text-muted-foreground">Sent to {modal.target}</p>
                                <Input
                                    className="text-center text-2xl tracking-widest border-border"
                                    placeholder="0000"
                                    maxLength={4}
                                    value={otpInput}
                                    onChange={(e) => setOtpInput(e.target.value)}
                                />
                                <Button onClick={verifyOtp} className="w-full bg-primary hover:bg-primary/90" disabled={loadingAction || otpInput.length < 4}>
                                    {loadingAction ? <Loader2 className="animate-spin" /> : "Verify Code"}
                                </Button>
                                <div className="text-xs text-muted-foreground">Mock OTP: 1234</div>
                            </div>
                        )}

                        {modal.step === 'password-check' && (
                            <div className="space-y-4 text-center">
                                <h3 className="text-lg font-bold">Current Password</h3>
                                <p className="text-sm text-gray-500">Enter your current password to continue</p>
                                <Input
                                    type="password"
                                    placeholder="Current Password"
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                />
                                <Button onClick={verifyCurrentPassword} className="w-full bg-indigo-600 hover:bg-indigo-700" disabled={loadingAction || !currentPassword}>
                                    {loadingAction ? <Loader2 className="animate-spin" /> : "Verify Password"}
                                </Button>
                                <div className="text-xs text-gray-400">Mock Pass: password123</div>
                            </div>
                        )}

                        {modal.step === 'new-value' && (
                            <div className="space-y-4 text-center">
                                <h3 className="text-lg font-bold text-foreground">
                                    {modal.type === 'password' ? 'Set New Password' : (modal.type === 'phone' ? 'Enter New Phone' : 'Enter New Email')}
                                </h3>
                                <Input
                                    type={modal.type === 'password' ? 'password' : 'text'}
                                    placeholder={modal.type === 'password' ? 'New Password' : 'New Value'}
                                    value={newValue}
                                    onChange={(e) => setNewValue(e.target.value)}
                                    className="border-border"
                                />
                                <Button onClick={submitChange} className="w-full bg-primary hover:bg-primary/90" disabled={loadingAction || !newValue}>
                                    {loadingAction ? <Loader2 className="animate-spin" /> : "Update"}
                                </Button>
                            </div>
                        )}

                        {modal.step === 'success' && (
                            <div className="space-y-4 text-center py-4">
                                <div className="h-16 w-16 bg-green-100 dark:bg-green-500/20 rounded-full flex items-center justify-center text-green-600 dark:text-green-500 mx-auto">
                                    <Check size={32} />
                                </div>
                                <h3 className="text-xl font-bold text-foreground">Updated!</h3>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}

function InfoRow({ icon: Icon, label, value }: { icon: any, label: string, value: string }) {
    return (
        <Info content={<div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center flex-shrink-0"><Icon size={20} /></div>
            <div><p className="text-xs text-muted-foreground mb-0.5">{label}</p><p className="text-sm font-semibold text-foreground">{value}</p></div>
        </div>} />
    )
}

function Info({ content }: { content: React.ReactNode }) {
    return <div className="p-4">{content}</div>
}

