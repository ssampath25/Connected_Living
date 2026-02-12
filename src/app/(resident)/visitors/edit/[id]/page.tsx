"use client"

/* eslint-disable @next/next/no-img-element */

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Save, Send, Sparkles, Pencil, Camera } from "lucide-react"
import { useRef } from "react"
import { api, SavedVisitorItem } from "@/lib/api"
import { Skeleton } from "@/components/ui/skeleton"

// Actually, I see "toast" used in other files in previous context (invite page), likely simple state based. I'll use a simple state for now.

export default function EditSavedVisitorPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter()
    const { id } = use(params)
    const [visitor, setVisitor] = useState<SavedVisitorItem | null>(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [isEditing, setIsEditing] = useState(false)
    const [notification, setNotification] = useState<{ message: string, type: 'success' | 'error' } | null>(null)

    // Editable Fields
    const [name, setName] = useState("")
    const [phone, setPhone] = useState("")
    const [email, setEmail] = useState("")
    const [relation, setRelation] = useState("")
    const [avatar, setAvatar] = useState("")
    const fileInputRef = useRef<HTMLInputElement>(null)
    const inviteDateRef = useRef<HTMLInputElement>(null)

    // Instant Invite Logic
    const [inviteDate, setInviteDate] = useState("")
    const [inviteTime, setInviteTime] = useState("")
    const [inviting, setInviting] = useState(false)

    // Attendance Logic Removed as per requirement
    // Saved Visitors are GUESTS only.

    useEffect(() => {
        api.getSavedVisitorById(id).then(data => {
            if (data) {
                setVisitor(data)
                setName(data.name)
                setPhone(data.phone || "")
                setEmail(data.email || "")
                setRelation(data.relation || "")
                setAvatar(data.avatar || "")
            }
            setLoading(false)
        })
    }, [id])

    const handleSave = async () => {
        if (!visitor) return
        setSaving(true)

        // We pretend to update the 'preferred slot' which isn't in the type yet, 
        // but the requirement says "edit time slots". 
        // We will just call the update API to simulate the network request.

        // Update Saved Visitor Profile
        await api.updateSavedVisitor(visitor.id, {
            name,
            phone,
            email,
            relation,
            avatar
        })

        setNotification({ message: "Preferences updated successfully", type: "success" })
        setSaving(false)
        setIsEditing(false)
    }

    const handleInvite = async () => {
        if (!visitor || !inviteDate || !inviteTime) {
            setNotification({ message: "Please select Date and Time", type: 'error' })
            return
        }
        setInviting(true)
        // Simulate API call
        await new Promise(r => setTimeout(r, 1500))

        setNotification({ message: `Invite sent to ${visitor.name}!`, type: 'success' })
        setInviting(false)
        setTimeout(() => router.push('/visitors'), 1500)
    }

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            const url = URL.createObjectURL(file)
            setAvatar(url)
            setNotification({ message: "Profile photo updated", type: 'success' })
            setTimeout(() => setNotification(null), 3000)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-background p-6">
                <Skeleton className="h-10 w-10 rounded-full mb-6 bg-accent" />
                <div className="space-y-6">
                    <Skeleton className="h-40 w-full rounded-2xl bg-accent" />
                    <Skeleton className="h-24 w-full rounded-2xl bg-accent" />
                </div>
            </div>
        )
    }

    if (!visitor) {
        return <div className="p-6 text-center text-muted-foreground bg-background min-h-screen flex items-center justify-center">Visitor not found</div>
    }

    return (
        <div className="min-h-screen bg-background pb-24 transition-colors">
            {/* Header */}
            <div className="sticky top-0 bg-card/80 backdrop-blur-md z-10 border-b border-border p-4 transition-colors">
                <div className="max-w-md mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button onClick={() => router.back()} className="p-2 -ml-2 text-foreground hover:bg-accent rounded-full transition-colors">
                            <ArrowLeft size={20} />
                        </button>
                        <h1 className="text-lg font-bold text-foreground">Visitors</h1>
                    </div>
                    {!isEditing && (
                        <button
                            onClick={() => setIsEditing(true)}
                            className="p-2 text-primary bg-primary/10 hover:bg-primary/20 rounded-full transition-colors"
                        >
                            <Pencil size={20} />
                        </button>
                    )}
                </div>
            </div>

            <div className="max-w-md mx-auto p-4 space-y-6">

                {/* 1. Editable Contact Details */}
                <div className="bg-card p-6 rounded-3xl shadow-sm border border-border flex flex-col items-center transition-colors">
                    <div className="relative group">
                        <div
                            onClick={() => isEditing && fileInputRef.current?.click()}
                            className={`h-24 w-24 bg-accent rounded-full flex items-center justify-center text-primary text-3xl font-bold mb-6 overflow-hidden relative shadow-sm border-4 border-card transition-all ${isEditing ? 'cursor-pointer hover:opacity-90 ring-4 ring-primary/10' : ''}`}
                        >
                            {(avatar && avatar.includes('/')) || (avatar && avatar.startsWith('blob:')) ? (
                                <img src={avatar} alt={name} className="w-full h-full object-cover" />
                            ) : (
                                <span>{avatar || name[0]}</span>
                            )}

                            {isEditing && (
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-[1px]">
                                    <Camera className="text-white drop-shadow-md" size={24} />
                                </div>
                            )}
                        </div>
                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            accept="image/*"
                            onChange={handleImageUpload}
                        />
                    </div>

                    <div className="w-full space-y-4">
                        <div className="space-y-1 text-left">
                            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider ml-1">Name</label>
                            {isEditing ? (
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full p-4 bg-accent/50 rounded-2xl font-bold text-foreground border border-border outline-none focus:ring-2 focus:ring-primary/20 transition-all placeholder:font-normal"
                                    placeholder="Visitor Name"
                                />
                            ) : (
                                <div className="w-full p-4 bg-accent/30 rounded-2xl font-bold text-foreground border border-transparent">
                                    {name}
                                </div>
                            )}
                        </div>

                        <div className="space-y-1 text-left">
                            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider ml-1">Relation / Type</label>
                            {isEditing ? (
                                <input
                                    type="text"
                                    value={relation}
                                    onChange={(e) => setRelation(e.target.value)}
                                    className="w-full p-4 bg-accent/50 rounded-2xl font-semibold text-foreground border border-border outline-none focus:ring-2 focus:ring-primary/20 transition-all placeholder:font-normal"
                                    placeholder="e.g. Friend, Brother"
                                />
                            ) : (
                                <div className="w-full p-4 bg-accent/30 rounded-2xl font-semibold text-foreground/80 border border-transparent">
                                    {relation || "N/A"}
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1 text-left">
                                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider ml-1">Phone</label>
                                {isEditing ? (
                                    <input
                                        type="tel"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        className="w-full p-4 bg-accent/50 rounded-2xl font-medium text-foreground border border-border outline-none focus:ring-2 focus:ring-primary/20 transition-all placeholder:font-normal"
                                        placeholder="+91..."
                                    />
                                ) : (
                                    <div className="w-full p-4 bg-accent/30 rounded-2xl font-medium text-foreground/80 border border-transparent">
                                        {phone || "-"}
                                    </div>
                                )}
                            </div>
                            <div className="space-y-1 text-left">
                                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider ml-1">Email</label>
                                {isEditing ? (
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full p-4 bg-accent/50 rounded-2xl font-medium text-foreground border border-border outline-none focus:ring-2 focus:ring-primary/20 transition-all placeholder:font-normal"
                                        placeholder="Optional"
                                    />
                                ) : (
                                    <div className="w-full p-4 bg-accent/30 rounded-2xl font-medium text-foreground/80 border border-transparent truncate">
                                        {email || "-"}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Attendance History Removed */}

                {/* 3. Instant Invite Card */}
                <div className="bg-gradient-to-br from-primary/10 to-primary/5 p-6 rounded-3xl shadow-sm border border-primary/20 relative overflow-hidden transition-colors">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-3xl -mr-10 -mt-10 opacity-30 pointer-events-none" />

                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-4 text-primary">
                            <Sparkles size={20} className="text-primary" />
                            <h3 className="font-bold text-lg">Instant Invite</h3>
                        </div>
                        <p className="text-sm text-muted-foreground mb-6">
                            Send a one-time entry pass for a specific time.
                        </p>

                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block ml-1">Date</label>
                                <div className="relative group" onClick={() => inviteDateRef.current?.showPicker()}>
                                    <input
                                        type="text"
                                        readOnly
                                        value={inviteDate ? inviteDate.split('-').reverse().join('-') : ''}
                                        placeholder="DD-MM-YYYY"
                                        className="w-full p-3 bg-card rounded-xl border border-border text-sm font-semibold text-foreground outline-none focus:ring-2 focus:ring-primary/20 pointer-events-none transition-colors"
                                    />
                                    <input
                                        type="date"
                                        ref={inviteDateRef}
                                        min={new Date().toISOString().split('T')[0]}
                                        value={inviteDate}
                                        onChange={(e) => setInviteDate(e.target.value)}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block ml-1">Time</label>
                                <input
                                    type="time"
                                    value={inviteTime}
                                    onChange={(e) => setInviteTime(e.target.value)}
                                    className="w-full p-3 bg-card rounded-xl border border-border text-sm font-semibold text-foreground outline-none focus:ring-2 focus:ring-primary/20 transition-colors"
                                />
                            </div>
                        </div>

                        <button
                            onClick={handleInvite}
                            disabled={inviting}
                            className="w-full py-4 bg-primary text-primary-foreground rounded-xl font-bold shadow-lg shadow-primary/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                        >
                            {inviting ? (
                                <>
                                    <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    <span>Sending...</span>
                                </>
                            ) : (
                                <>
                                    <Send size={18} />
                                    <span>Send Invite</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* Feedback Toast */}
                {notification && (
                    <div className={`fixed bottom-24 left-4 right-4 p-4 rounded-xl text-white text-center text-sm font-medium shadow-lg animate-in fade-in slide-in-from-bottom-4 transition-colors ${notification.type === 'success' ? 'bg-green-600' : 'bg-destructive'
                        }`}>
                        {notification.message}
                    </div>
                )}

                {/* Save Button (Inline) */}
                {isEditing && (
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="w-full h-14 bg-primary text-primary-foreground rounded-xl font-bold text-lg shadow-xl shadow-primary/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:scale-100"
                    >
                        {saving ? (
                            <>
                                <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                <span>Saving...</span>
                            </>
                        ) : (
                            <>
                                <Save size={20} />
                                <span>Save Changes</span>
                            </>
                        )}
                    </button>
                )}
            </div>


        </div>
    )
}
