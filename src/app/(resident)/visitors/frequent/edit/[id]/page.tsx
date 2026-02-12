"use client"

/* eslint-disable @next/next/no-img-element */

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Save, Calendar, Clock, Trash2, CalendarCheck, Pencil, Camera, CreditCard } from "lucide-react"
import { useRef } from "react"
import { api, FrequentVisitorItem, AttendanceItem } from "@/lib/api"
import { Skeleton } from "@/components/ui/skeleton"
import { SimpleCalendar } from "@/components/simple-calendar"
import { StaffIdCard } from "@/components/staff-id-card"

export default function EditFrequentVisitorPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter()
    const { id } = use(params)
    const [visitor, setVisitor] = useState<FrequentVisitorItem | null>(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [revoking, setRevoking] = useState(false)
    const [isEditing, setIsEditing] = useState(false)
    const [showIdCard, setShowIdCard] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const dateRef = useRef<HTMLInputElement>(null)

    // Edit Fields
    const [name, setName] = useState("")
    const [relation, setRelation] = useState("")
    const [avatar, setAvatar] = useState("")
    const [type, setType] = useState<"Guest" | "Delivery" | "Cab" | "Staff">("Staff")

    const [validUntil, setValidUntil] = useState("")
    const [hasTimeSlot, setHasTimeSlot] = useState(false)
    const [allowedTimeSlot, setAllowedTimeSlot] = useState("Morning (8am-12pm)")
    const TIME_SLOTS = ["Morning (8am-12pm)", "Afternoon (12pm-4pm)", "Evening (4pm-9pm)", "All Day"]

    // Attendance Logic
    const [attendance, setAttendance] = useState<AttendanceItem[]>([])
    const [loadingAttendance, setLoadingAttendance] = useState(false)
    const [showCalendar, setShowCalendar] = useState(false)

    useEffect(() => {
        api.getFrequentVisitorById(id).then(data => {
            if (data) {
                setVisitor(data)
                setName(data.name)
                setRelation(data.relation || "")
                setType(data.type)
                setAvatar(data.photoUrl || data.avatar || "")
                setValidUntil(data.validUntil)
                if (data.allowedTimeSlot) {
                    setHasTimeSlot(true)
                    setAllowedTimeSlot(data.allowedTimeSlot)
                }

                // Fetch Attendance
                setLoadingAttendance(true)
                api.getVisitorAttendance(id).then(att => {
                    setAttendance(att)
                    setLoadingAttendance(false)
                })
            }
            setLoading(false)
        })
    }, [id])

    const handleSave = async () => {
        if (!visitor) return
        setSaving(true)
        const success = await api.updateFrequentVisitor(visitor.id, {
            name,
            relation,
            type,
            avatar,
            validUntil,
            allowedTimeSlot: hasTimeSlot ? allowedTimeSlot : undefined
        })
        setSaving(false)
        if (success) {
            setIsEditing(false)
            // Update local state
            setVisitor(prev => prev ? { ...prev, name, relation, validUntil } : null)
        } else {
            alert("Failed to save changes. Please try again.")
        }
    }

    const handleRevoke = async () => {
        if (!visitor) return
        if (!window.confirm("Are you sure you want to revoke this pass? This visitor will no longer be able to enter the premises.")) return

        setRevoking(true)
        const success = await api.deleteFrequentVisitor(visitor.id)
        if (success) {
            router.replace("/visitors")
        } else {
            setRevoking(false)
            alert("Failed to revoke pass. Please try again.")
        }
    }

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            const reader = new FileReader()
            reader.onloadend = () => {
                setAvatar(reader.result as string)
            }
            reader.readAsDataURL(file)
        }
    }

    if (loading) return (
        <div className="min-h-screen bg-background p-6">
            <Skeleton className="h-40 w-full rounded-2xl bg-accent" />
            <div className="space-y-4 mt-6">
                <Skeleton className="h-24 w-full rounded-xl bg-accent" />
                <Skeleton className="h-24 w-full rounded-xl bg-accent" />
            </div>
        </div>
    )

    if (!visitor) return <div className="p-6 text-center text-muted-foreground bg-background min-h-screen flex items-center justify-center">Visitor not found</div>

    return (
        <div className="min-h-screen bg-background pb-24 transition-colors">
            {/* Header */}
            <div className="sticky top-0 bg-card/80 backdrop-blur-md z-10 border-b border-border p-4 transition-colors">
                <div className="max-w-md mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button onClick={() => router.back()} className="p-2 -ml-2 text-foreground hover:bg-accent rounded-full transition-colors">
                            <ArrowLeft size={20} />
                        </button>
                        <h1 className="text-lg font-bold text-foreground">Manage Pass</h1>
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

                {/* 1. Profile Card (Editable) */}
                <div className="bg-card p-6 rounded-3xl shadow-sm border border-border flex flex-col items-center text-center relative overflow-hidden transition-all">
                    <div className={`absolute top-0 left-0 w-full h-2 ${visitor.isActive ? 'bg-green-500' : 'bg-destructive'}`} />

                    <div className="relative group mb-3">
                        <div
                            onClick={() => isEditing && fileInputRef.current?.click()}
                            className={`h-20 w-20 bg-accent rounded-full flex items-center justify-center text-primary text-2xl font-bold overflow-hidden shadow-inner border-2 border-card transition-all ${isEditing ? 'cursor-pointer hover:opacity-90 ring-4 ring-primary/10' : ''}`}
                        >
                            {(avatar && avatar.includes('/')) || (avatar && avatar.startsWith('blob:')) || (avatar && avatar.startsWith('data:')) ? (
                                <img src={avatar} alt={name} className="w-full h-full object-cover" />
                            ) : (
                                <span>{avatar || name[0]}</span>
                            )}

                            {isEditing && (
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-[1px]">
                                    <Camera className="text-white drop-shadow-md" size={20} />
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

                    <div className="w-full space-y-2">
                        {isEditing ? (
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full text-center text-xl font-bold text-foreground bg-accent/50 border border-border rounded-lg p-1 focus:border-primary/30 outline-none transition-all"
                                placeholder="Name"
                            />
                        ) : (
                            <h2 className="text-xl font-bold text-foreground">{name}</h2>
                        )}

                        <div className="flex items-center justify-center gap-2 mt-2">
                            <span className="px-3 py-1 rounded-full bg-accent text-muted-foreground text-[10px] font-bold uppercase tracking-wider">
                                {visitor.type}
                            </span>
                            {visitor.scheduleType && (
                                <span className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[10px] font-bold uppercase tracking-wider">
                                    {visitor.scheduleType}
                                </span>
                            )}
                            {isEditing ? (
                                <input
                                    type="text"
                                    value={relation}
                                    onChange={(e) => setRelation(e.target.value)}
                                    className="w-24 text-center text-xs font-semibold text-primary bg-primary/10 border border-transparent rounded-full p-1 focus:bg-card focus:border-primary/20 outline-none"
                                    placeholder="Role (e.g. Maid)"
                                />
                            ) : (
                                relation && (
                                    <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
                                        {relation}
                                    </span>
                                )
                            )}
                        </div>
                    </div>
                </div>

                {/* 2. QR ID Card Button */}
                {visitor.qrCodeId && (
                    <button
                        onClick={() => setShowIdCard(true)}
                        className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 rounded-2xl shadow-lg shadow-blue-600/20 flex items-center gap-3 active:scale-[0.98] transition-all"
                    >
                        <div className="bg-white/20 p-2 rounded-xl">
                            <CreditCard size={22} />
                        </div>
                        <div className="text-left">
                            <p className="font-bold text-sm">View QR ID Card</p>
                            <p className="text-blue-200 text-xs">Download or share the staff entry pass</p>
                        </div>
                    </button>
                )}

                {/* 3. Validity Setting */}
                <div className="bg-card p-6 rounded-3xl shadow-sm border border-border transition-colors">
                    <div className="flex items-center gap-2 mb-4 text-primary">
                        <CalendarCheck size={20} />
                        <h3 className="font-bold text-lg">Pass Validity</h3>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                        Extend or shorten the validity of this entry pass.
                    </p>
                    <div className="relative group" onClick={() => isEditing && dateRef.current?.showPicker()}>
                        <input
                            type="text"
                            readOnly
                            value={validUntil ? validUntil.split('-').reverse().join('-') : ''}
                            placeholder="DD-MM-YYYY"
                            disabled={!isEditing}
                            className={`w-full bg-accent/50 p-4 rounded-xl text-base font-bold text-foreground outline-none border border-border transition-all ${isEditing ? 'focus:border-primary focus:ring-4 focus:ring-primary/10' : 'opacity-60 grayscale'} pointer-events-none`}
                        />
                        <input
                            type="date"
                            ref={dateRef}
                            min={new Date().toISOString().split('T')[0]}
                            value={validUntil}
                            disabled={!isEditing}
                            onChange={(e) => setValidUntil(e.target.value)}
                            className={`absolute inset-0 w-full h-full opacity-0 ${isEditing ? 'cursor-pointer' : ''}`}
                        />
                    </div>
                </div>

                {/* 4. Time Slot Setting */}
                <div className="bg-card p-4 rounded-3xl border border-border space-y-4 shadow-sm transition-colors">
                    <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2 ml-1">
                            <Clock size={14} />
                            Restrict Entry Time?
                        </label>
                        <button
                            disabled={!isEditing}
                            onClick={() => setHasTimeSlot(!hasTimeSlot)}
                            className={`w-12 h-6 rounded-full p-1 transition-colors ${!isEditing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} ${hasTimeSlot ? 'bg-primary' : 'bg-accent'}`}
                        >
                            <div className={`h-4 w-4 bg-white rounded-full transition-transform ${hasTimeSlot ? 'translate-x-6' : 'translate-x-0'}`} />
                        </button>
                    </div>

                    {hasTimeSlot && (
                        <div className="grid gap-2 animate-in slide-in-from-top-2">
                            {TIME_SLOTS.map(slot => (
                                <button
                                    key={slot}
                                    disabled={!isEditing}
                                    onClick={() => setAllowedTimeSlot(slot)}
                                    className={`text-left p-3 rounded-xl text-xs font-semibold border transition-all ${allowedTimeSlot === slot
                                        ? 'bg-primary/10 border-primary/20 text-primary'
                                        : 'bg-accent/50 border-transparent text-muted-foreground'
                                        } ${!isEditing && 'opacity-60 cursor-not-allowed'}`}
                                >
                                    {slot}
                                </button>
                            ))}
                        </div>
                    )}

                </div>

                {/* 5. Attendance History */}
                <div className="bg-card p-6 rounded-3xl shadow-sm border border-border transition-colors">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2 text-primary">
                            <CalendarCheck size={20} />
                            <h3 className="font-bold text-lg">Attendance History</h3>
                        </div>
                        <button
                            onClick={() => setShowCalendar(!showCalendar)}
                            className={`p-2 rounded-full transition-all ${showCalendar ? 'bg-primary text-primary-foreground shadow-md' : 'bg-accent text-muted-foreground hover:bg-accent/80'}`}
                        >
                            <Calendar size={18} />
                        </button>
                    </div>

                    {!showCalendar && (
                        <p className="text-sm text-muted-foreground mb-4 animate-in fade-in">
                            Recent check-in and check-out activity.
                        </p>
                    )}

                    <div className="space-y-3 min-h-[100px]">
                        {loadingAttendance ? (
                            <Skeleton className="h-20 w-full rounded-xl bg-accent" />
                        ) : showCalendar ? (
                            <div className="animate-in zoom-in-95 duration-200">
                                <SimpleCalendar attendance={attendance} className="border-0 shadow-none p-0 bg-transparent" />
                            </div>
                        ) : (
                            <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                {attendance.map((log) => (
                                    <div key={log.id} className="flex justify-between items-center p-3 bg-accent/30 rounded-xl border border-border">
                                        <div>
                                            <p className="font-bold text-sm text-foreground">{log.date}</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${log.status === 'Present' ? 'bg-green-500/10 text-green-600' :
                                                    log.status === 'Absent' ? 'bg-destructive/10 text-destructive' : 'bg-yellow-500/10 text-yellow-600'
                                                    }`}>
                                                    {log.status}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="text-right text-xs text-muted-foreground font-medium">
                                            <div>In: {log.checkIn}</div>
                                            {log.checkOut && <div>Out: {log.checkOut}</div>}
                                        </div>
                                    </div>
                                ))}
                                {attendance.length === 0 && (
                                    <div className="text-center py-10 text-muted-foreground italic text-sm">No recent activity</div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Delete/Revoke Button */}
                <button
                    onClick={handleRevoke}
                    disabled={revoking}
                    className="w-full py-4 rounded-xl text-destructive font-bold bg-destructive/5 hover:bg-destructive/10 transition-colors flex items-center justify-center gap-2 border border-destructive/20 disabled:opacity-50"
                >
                    {revoking ? (
                        <div className="h-5 w-5 border-2 border-destructive/30 border-t-destructive rounded-full animate-spin" />
                    ) : (
                        <Trash2 size={18} />
                    )}
                    {revoking ? "Revoking..." : "Revoke Pass"}
                </button>
            </div>

            {/* Save Button (Inline) */}
            {isEditing && (
                <div className="p-4 pt-0">
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="w-full h-14 bg-primary text-primary-foreground rounded-xl font-bold text-lg shadow-xl shadow-primary/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-70"
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
                </div>
            )}

            {/* ID Card Modal */}
            {showIdCard && visitor.qrCodeId && (
                <StaffIdCard
                    staffName={visitor.name}
                    role={visitor.relation || visitor.type}
                    photoUrl={visitor.photoUrl || visitor.avatar || ""}
                    staffId={visitor.id}
                    qrCodeId={visitor.qrCodeId}
                    validThru={visitor.validUntil}
                    scheduleType={visitor.scheduleType || "DAILY"}
                    onClose={() => setShowIdCard(false)}
                />
            )}
        </div>
    )
}
