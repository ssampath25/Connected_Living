"use client"

/* eslint-disable @next/next/no-img-element */

import { ArrowLeft, User, Truck, Car, Share2, ShieldCheck, Mail, Phone, Calendar, Clock, Camera } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState, useRef, useEffect, type ComponentType, type ChangeEvent, type InputHTMLAttributes } from "react"
import { cn } from "@/lib/utils"
import { api, InviteParams } from "@/lib/api"
import { VisitorGroupCard } from "@/components/visitor-group-card"

export default function InviteVisitorPage() {
    const router = useRouter()
    const [visitorType, setVisitorType] = useState<"guest" | "delivery" | "cab">("guest")
    const [loading, setLoading] = useState(false)
    const [successData, setSuccessData] = useState<{ code?: string, qrToken?: string, message: string } | null>(null)
    type VerifiedVisitorGroup = {
        visitors: { name: string }[]
        visitStart: string
        visitEnd: string
        hostName: string
        unitNumber: string
        blockTower?: string
        communityName?: string
    }
    const [visitorGroup, setVisitorGroup] = useState<VerifiedVisitorGroup | null>(null)

    // Form States
    const [formData, setFormData] = useState({
        // Common
        date: new Date().toISOString().split('T')[0],
        time: "18:00",

        // Guest (Multiple)
        guests: [{ id: 1, name: "", phone: "", email: "", photo: "" }],
        singleEntry: true,

        // Delivery
        vendor: "", // "Amazon", "Zomato" etc.
        name: "", // Delivery person name
        phone: "",

        // Cab
        driverName: "",
        vehicleNo: "",
        service: "", // "Uber", "Ola"
        model: ""
    })

    // Fetch group details when successData has a token
    useEffect(() => {
        if (successData?.qrToken) {
            const fetchGroup = async () => {
                try {
                    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api/v1"
                    const res = await fetch(`${apiUrl}/visitors/groups/pass/verify?token=${encodeURIComponent(successData.qrToken!)}`)
                    if (res.ok) {
                        const data = await res.json()
                        setVisitorGroup(data)
                    }
                } catch (e) {
                    console.error("Failed to fetch group details", e)
                }
            }
            fetchGroup()
        }
    }, [successData])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
        }))
    }

    // Guest Handlers
    const handleGuestChange = (index: number, field: string, value: string) => {
        const newGuests = [...formData.guests]
        newGuests[index] = { ...newGuests[index], [field]: value }
        setFormData(prev => ({ ...prev, guests: newGuests }))
    }

    const addGuest = () => {
        setFormData(prev => ({
            ...prev,
            guests: [...prev.guests, { id: Date.now(), name: "", phone: "", email: "", photo: "" }]
        }))
    }

    const removeGuest = (index: number) => {
        if (formData.guests.length === 1) return
        setFormData(prev => ({
            ...prev,
            guests: prev.guests.filter((_, i) => i !== index)
        }))
    }

    const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
        const file = e.target.files?.[0]
        if (file) {
            const reader = new FileReader()
            reader.onloadend = () => {
                handleGuestChange(index, 'photo', reader.result as string)
            }
            reader.readAsDataURL(file)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        // Validation Logic
        if (visitorType === 'guest') {
            if (formData.guests.some(g => !g.name)) {
                alert("Please fill all guest names")
                setLoading(false)
                return
            }
            if (!formData.date || !formData.time) {
                alert("Date and Time are mandatory")
                setLoading(false)
                return
            }
        } else if (visitorType === 'delivery') {
            if (!formData.vendor || !formData.date) {
                alert("Vendor and Date are mandatory")
                setLoading(false)
                return
            }
        } else if (visitorType === 'cab') {
            if (!formData.driverName || !formData.vehicleNo || !formData.service || !formData.date) {
                alert("Driver details and Date are mandatory")
                setLoading(false)
                return
            }
        }

        try {
            let payload: InviteParams
            if (visitorType === 'guest') {
                payload = {
                    type: "Guest",
                    guests: formData.guests.map(g => ({
                        name: g.name,
                        phone: g.phone,
                        email: g.email,
                        avatar: g.photo
                    })),
                    date: formData.date,
                    time: formData.time,
                    singleEntry: formData.singleEntry
                }
            } else if (visitorType === 'delivery') {
                payload = {
                    type: "Delivery",
                    vendor: formData.vendor,
                    date: formData.date,
                    name: formData.name, // Now using top-level name for delivery person
                    phone: formData.phone,
                    time: formData.time
                }
            } else {
                payload = {
                    type: "Cab",
                    driverName: formData.driverName,
                    vehicleNo: formData.vehicleNo,
                    service: formData.service,
                    date: formData.date,
                    time: formData.time,
                    model: formData.model
                }
            }

            const res = await api.inviteVisitor(payload)
            if (res.success) {
                setSuccessData({ code: res.code, qrToken: res.qrToken, message: res.message })
            }
        } catch (error) {
            console.error(error)
            alert("Failed to invite visitor")
        } finally {
            setLoading(false)
        }
    }

    // Success View -> Show Card
    if (successData) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
                {visitorGroup ? (
                    <VisitorGroupCard
                        visitors={visitorGroup.visitors}
                        visitStart={visitorGroup.visitStart}
                        visitEnd={visitorGroup.visitEnd}
                        hostName={visitorGroup.hostName}
                        unitNumber={visitorGroup.unitNumber}
                        blockTower={visitorGroup.blockTower}
                        communityName={visitorGroup.communityName}
                        qrToken={successData.qrToken!}
                        onClose={() => {
                            setSuccessData(null)
                            setVisitorGroup(null)
                            setFormData(prev => ({ ...prev, guests: [{ id: 1, name: "", phone: "", email: "", photo: "" }], name: "", phone: "" })) // Reset basics
                            router.back()
                        }}
                    />
                ) : (
                    <div className="text-center text-white">
                        <div className="w-10 h-10 border-4 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-4" />
                        <p>Generating Pass...</p>
                        {/* Fallback code display if fetch fails or takes time */}
                        {successData.code && <p className="text-xs mt-2 text-white/50">Code: {successData.code}</p>}
                    </div>
                )}
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background flex flex-col">
            {/* Header */}
            <div className="sticky top-0 bg-background/80 backdrop-blur-xl z-10 border-b border-border p-4 lg:p-6 lg:border-none lg:bg-transparent">
                <div className="max-w-2xl mx-auto w-full flex items-center gap-3">
                    <button onClick={() => router.back()} suppressHydrationWarning className="p-2 -ml-2 text-primary hover:bg-accent rounded-full transition-colors">
                        <ArrowLeft size={24} />
                    </button>
                    <h1 className="text-xl font-bold text-primary lg:text-3xl">Invite {visitorType === 'guest' ? 'Visitor' : visitorType === 'delivery' ? 'Delivery' : 'Cab'}</h1>
                </div>
            </div>

            <div className="flex-1 p-4 lg:p-6 max-w-2xl mx-auto w-full">
                <form className="space-y-8" onSubmit={handleSubmit}>

                    {/* Visitor Type Selection */}
                    <div className="space-y-3">
                        <label className="text-sm font-semibold text-muted-foreground">Entry Type</label>
                        <div className="grid grid-cols-3 gap-3">
                            <TypeCard icon={User} label="Guest" active={visitorType === "guest"} onClick={() => setVisitorType("guest")} />
                            <TypeCard icon={Truck} label="Delivery" active={visitorType === "delivery"} onClick={() => setVisitorType("delivery")} />
                            <TypeCard icon={Car} label="Cab" active={visitorType === "cab"} onClick={() => setVisitorType("cab")} />
                        </div>
                    </div>

                    {/* DYNAMIC FORM FIELDS */}
                    <div className="space-y-5">

                        {/* --- GUEST FORM --- */}
                        {visitorType === 'guest' && (
                            <>
                                <div className="space-y-6">
                                    {formData.guests.map((guest, index) => (
                                        <div key={guest.id || index} className="p-4 bg-muted/30 rounded-2xl border border-border relative">
                                            {index > 0 && (
                                                <button
                                                    type="button"
                                                    onClick={() => removeGuest(index)}
                                                    className="absolute top-2 right-2 text-red-500 hover:bg-red-50 p-1 rounded-full transition-colors"
                                                >
                                                    <div className="h-5 w-5 border-2 border-red-500 rounded-full flex items-center justify-center font-bold text-xs" >✕</div>
                                                </button>
                                            )}

                                            <div className="mb-4">
                                                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Guest {index + 1}</span>
                                            </div>

                                            {/* Photo Upload */}
                                            <div className="flex justify-center mb-6">
                                                <div className="relative group">
                                                    <div className={cn(
                                                        "w-20 h-20 rounded-full flex items-center justify-center border-2 border-dashed transition-all overflow-hidden",
                                                        guest.photo ? "border-primary bg-card" : "border-border bg-muted/50 group-hover:bg-muted"
                                                    )}>
                                                        {guest.photo ? (
                                                            <img src={guest.photo} alt="Guest" className="w-full h-full object-cover" />
                                                        ) : (
                                                            <Camera className="text-muted-foreground group-hover:text-primary transition-colors" size={24} />
                                                        )}
                                                    </div>
                                                    <div className="absolute bottom-0 right-0 bg-primary text-white p-1.5 rounded-full shadow-lg transform scale-90 group-hover:scale-100 transition-transform">
                                                        <Camera size={12} />
                                                    </div>
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={(e) => handlePhotoUpload(e, index)}
                                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-4">
                                                <Input
                                                    label="Guest Name"
                                                    value={guest.name}
                                                    onChange={(e: ChangeEvent<HTMLInputElement>) => handleGuestChange(index, "name", e.target.value)}
                                                    required
                                                    placeholder="Enter guest name"
                                                />

                                                <div className="space-y-2">
                                                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Contact</label>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        <div className="relative">
                                                            <Phone className="absolute left-3 top-3.5 text-muted-foreground" size={18} />
                                                            <input
                                                                type="tel"
                                                                value={guest.phone}
                                                                onChange={(e) => handleGuestChange(index, "phone", e.target.value)}
                                                                placeholder="Phone Number"
                                                                className="w-full h-12 pl-10 pr-4 rounded-xl bg-muted border border-border focus:bg-card focus:border-primary/20 outline-none text-foreground placeholder:text-muted-foreground transition-all"
                                                            />
                                                        </div>
                                                        <div className="relative">
                                                            <Mail className="absolute left-3 top-3.5 text-muted-foreground" size={18} />
                                                            <input
                                                                type="email"
                                                                value={guest.email}
                                                                onChange={(e) => handleGuestChange(index, "email", e.target.value)}
                                                                placeholder="Email (Optional)"
                                                                className="w-full h-12 pl-10 pr-4 rounded-xl bg-muted border border-border focus:bg-card focus:border-primary/20 outline-none text-foreground placeholder:text-muted-foreground transition-all"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}

                                    <button
                                        type="button"
                                        onClick={addGuest}
                                        className="w-full py-3 border-2 border-dashed border-primary/30 rounded-xl text-primary font-semibold hover:bg-primary/5 transition-colors flex items-center justify-center gap-2"
                                    >
                                        <div className="h-5 w-5 bg-primary text-white rounded-full flex items-center justify-center font-bold text-sm">+</div>
                                        Add Another Guest
                                    </button>
                                </div>

                                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border/50">
                                    <Input label="Date" name="date" type="date" value={formData.date} onChange={handleChange} required icon={Calendar} />
                                    <Input label="Time" name="time" type="time" value={formData.time} onChange={handleChange} required icon={Clock} />
                                </div>

                                <Toggle label="Single Entry Pass" sub="Code expires after one use" checked={formData.singleEntry} onChange={(c) => setFormData(p => ({ ...p, singleEntry: c }))} />
                            </>
                        )}

                        {/* --- DELIVERY FORM --- */}
                        {visitorType === 'delivery' && (
                            <>
                                <Input label="Vendor / App Name" name="vendor" value={formData.vendor} onChange={handleChange} required placeholder="e.g. Amazon, Zomato, Swiggy" />

                                <div className="grid grid-cols-2 gap-4">
                                    <Input label="Date" name="date" type="date" value={formData.date} onChange={handleChange} required icon={Calendar} />
                                    <Input label="Time (Optional)" name="time" type="time" value={formData.time} onChange={handleChange} icon={Clock} />
                                </div>

                                <Input label="Delivery Person Name (Optional)" name="name" value={formData.name} onChange={handleChange} placeholder="Enter name if known" />
                                <Input label="Mobile Number (Optional)" name="phone" type="tel" value={formData.phone} onChange={handleChange} placeholder="Enter mobile number" />
                            </>
                        )}

                        {/* --- CAB FORM --- */}
                        {visitorType === 'cab' && (
                            <>
                                <Input label="Cab Service" name="service" value={formData.service} onChange={handleChange} required placeholder="e.g. Uber, Ola, Private" />

                                <div className="grid grid-cols-2 gap-4">
                                    <Input label="Driver Name" name="driverName" value={formData.driverName} onChange={handleChange} required placeholder="Driver Name" />
                                    <Input label="Vehicle Number" name="vehicleNo" value={formData.vehicleNo} onChange={handleChange} required placeholder="e.g. KA 01 AB 1234" />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <Input label="Date" name="date" type="date" value={formData.date} onChange={handleChange} required icon={Calendar} />
                                    <Input label="Time (Optional)" name="time" type="time" value={formData.time} onChange={handleChange} icon={Clock} />
                                </div>

                                <Input label="Car Model (Optional)" name="model" value={formData.model} onChange={handleChange} placeholder="e.g. Swift Dzire" />
                            </>
                        )}

                    </div>
                </form>
            </div>

            <div className="p-4 bg-background border-t border-border lg:border-none lg:max-w-2xl lg:mx-auto lg:w-full">
                <button
                    onClick={handleSubmit}
                    disabled={loading}
                    suppressHydrationWarning
                    className="w-full h-14 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl shadow-lg shadow-primary/10 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {loading ? "Processing..." : visitorType === 'guest' ? (
                        <>Share Invite Code <Share2 size={20} /></>
                    ) : (
                        <>Share with Security <ShieldCheck size={20} /></>
                    )}
                </button>
            </div>
        </div>
    )
}

// --- Components ---

function TypeCard({ icon: Icon, label, active, onClick }: { icon: ComponentType<{ size?: number; className?: string }>, label: string, active: boolean, onClick: () => void }) {
    return (
        <button
            type="button"
            onClick={onClick}
            suppressHydrationWarning
            className={cn(
                "flex flex-col items-center justify-center py-4 px-2 rounded-xl border-2 transition-all duration-200",
                active
                    ? "border-primary bg-primary/5"
                    : "border-border bg-card hover:border-primary/20"
            )}
        >
            <div className={cn(
                "h-10 w-10 rounded-full flex items-center justify-center mb-2 transition-colors",
                active ? "bg-primary text-white" : "bg-muted text-muted-foreground"
            )}>
                <Icon size={20} />
            </div>
            <span className={cn(
                "text-xs font-bold",
                active ? "text-primary" : "text-muted-foreground"
            )}>{label}</span>
        </button>
    )
}

type LabeledInputProps = {
    label: string
    icon?: ComponentType<{ size?: number; className?: string }>
    type: string
    value: string
    onChange: (e: ChangeEvent<HTMLInputElement>) => void
    className?: string
} & Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "value" | "onChange">

function Input({ label, icon: Icon, type, value, onChange, className, ...props }: LabeledInputProps) {
    const dateRef = useRef<HTMLInputElement>(null)
    // Custom Date Logic
    if (type === 'date') {
        // Format YYYY-MM-DD to DD-MM-YYYY for display
        const displayValue = value ? value.split('-').reverse().join('-') : ''

        return (
            <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide px-1">{label}</label>
                <div className="relative group" onClick={() => dateRef.current?.showPicker()}>
                    {Icon && <Icon className="absolute left-3 top-3.5 text-muted-foreground z-10" size={18} />}

                    {/* Visible Input (Formatted) */}
                    <input
                        type="text"
                        readOnly
                        placeholder="DD-MM-YYYY"
                        value={displayValue}
                        className={cn(
                            "w-full h-12 rounded-xl bg-muted border-2 border-transparent focus:border-primary/20 outline-none transition-all font-medium text-foreground placeholder:text-muted-foreground pointer-events-none",
                            Icon ? "pl-10 pr-4" : "px-4",
                            className
                        )}
                    />

                    {/* Hidden Native Picker Overlay */}
                    <input
                        {...props}
                        type="date"
                        ref={dateRef}
                        min={new Date().toISOString().split('T')[0]}
                        value={value}
                        onChange={onChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                    />
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-1.5">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide px-1">{label}</label>
            <div className="relative">
                {Icon && <Icon className="absolute left-3 top-3.5 text-muted-foreground" size={18} />}
                <input
                    {...props}
                    type={type}
                    value={value}
                    onChange={onChange}
                    suppressHydrationWarning
                    className={cn(
                        "w-full h-12 rounded-xl bg-muted border-2 border-transparent focus:border-primary/20 outline-none transition-all font-medium text-foreground placeholder:text-muted-foreground",
                        Icon ? "pl-10 pr-4" : "px-4",
                        className
                    )}
                />
            </div>
        </div>
    )
}

function Toggle({ label, sub, checked, onChange }: { label: string, sub?: string, checked: boolean, onChange: (c: boolean) => void }) {
    return (
        <div className="flex items-center justify-between p-4 bg-muted/50 rounded-xl cursor-pointer hover:bg-muted transition-colors" onClick={() => onChange(!checked)}>
            <div>
                <h4 className="font-semibold text-foreground">{label}</h4>
                {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
            </div>
            <div className={cn("h-6 w-11 rounded-full relative transition-colors", checked ? "bg-primary" : "bg-muted-foreground/30")}>
                <div className={cn("absolute top-1 h-4 w-4 bg-white rounded-full shadow-sm transition-all", checked ? "right-1" : "left-1")}></div>
            </div>
        </div>
    )
}
