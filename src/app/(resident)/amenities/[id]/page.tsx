"use client"

import { useEffect, useState, use, useRef } from "react"
import { ArrowLeft, Calendar, Clock, Info, CheckCircle2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
// Import API
import { api, AmenityItem } from "@/lib/api"
import { AmenitySlot } from "@/lib/api-types"

export default function AmenityBookingPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter()
    const { id } = use(params)
    const [amenity, setAmenity] = useState<AmenityItem | null>(null)
    const [loading, setLoading] = useState(true)
    const [date, setDate] = useState(new Date().toISOString().split('T')[0])
    const [selectedSlots, setSelectedSlots] = useState<string[]>([])
    const [booking, setBooking] = useState(false)
    const [allSlots, setAllSlots] = useState<AmenitySlot[]>([])
    const dateInputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        Promise.all([
            api.getAmenityById(id),
            api.getAmenitySlots(id)
        ]).then(([amenityData, slotsData]) => {
            setAmenity(amenityData || null)
            setAllSlots(slotsData || [])
            setLoading(false)
        })
    }, [id])

    // Filter slots for selected date
    const slots = allSlots.filter(slot => {
        if (!date) return false

        // Debug filtering
        const slotDate = new Date(slot.startTime).toLocaleDateString('en-CA') // YYYY-MM-DD in local time
        const utcDate = new Date(slot.startTime).toISOString().split('T')[0]
        console.log(`Slot: ${slot.startTime} | Local: ${slotDate} | UTC: ${utcDate} | Selected: ${date}`)

        return slotDate === date
    }).map(slot => ({
        id: slot.id,
        label: new Date(slot.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }))

    const toggleSlot = (slotId: string) => {
        if (selectedSlots.includes(slotId)) {
            setSelectedSlots(prev => prev.filter(s => s !== slotId))
        } else {
            setSelectedSlots(prev => [...prev, slotId])
        }
    }

    const handleConfirm = async () => {
        if (!date) {
            alert("Please select a date")
            return
        }
        if (selectedSlots.length === 0) {
            alert("Please select at least one slot")
            return
        }

        setBooking(true)
        // Pass selectedSlots (which are now IDs) directly
        await api.bookAmenity(id, date, selectedSlots)
        setBooking(false)
        router.push("/amenities/my-bookings")
    }


    if (loading) return <div className="p-8 text-center">Loading...</div>
    if (!amenity) return <div className="p-8 text-center">Amenity not found</div>

    return (
        <div className="min-h-screen bg-background pb-24 lg:pb-8 flex flex-col transition-colors">
            {/* Hero/Header */}
            <div className="relative h-64 lg:h-80 w-full" style={{ background: amenity.imageGradient }}>
                <div className="absolute inset-0 bg-black/20" />
                <div className="absolute top-0 left-0 right-0 p-4 lg:p-6 flex justify-between items-center z-10">
                    <button onClick={() => router.back()} className="p-2 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/30 transition-colors">
                        <ArrowLeft size={24} />
                    </button>
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-6 lg:p-10 bg-gradient-to-t from-black/60 to-transparent">
                    <div className="max-w-4xl mx-auto w-full">
                        <h1 className="text-3xl lg:text-5xl font-bold text-white mb-2">{amenity.name}</h1>
                        <div className="flex items-center text-white/90 gap-2 text-sm font-medium">
                            <Clock size={16} />
                            <span>Open Today</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex-1 max-w-4xl mx-auto w-full p-4 lg:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Col - Details */}
                <div className="lg:col-span-7 space-y-8">
                    <div className="space-y-4">
                        <h3 className="text-lg font-bold text-foreground">About</h3>
                        <p className="text-muted-foreground leading-relaxed text-sm lg:text-base">{amenity.description}</p>
                    </div>

                    {amenity.rules && (
                        <div className="space-y-4">
                            <h3 className="text-lg font-bold text-foreground">Rules & Guidelines</h3>
                            <ul className="space-y-3">
                                {amenity.rules.map((rule: string, i: number) => (
                                    <li key={i} className="flex items-center gap-3 text-sm text-muted-foreground bg-accent/30 p-3 rounded-lg border border-border">
                                        <Info size={16} className="text-primary flex-shrink-0" />
                                        <span>{rule}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>

                {/* Right Col - Booking Form */}
                <div className="lg:col-span-5">
                    <div className="bg-card lg:border lg:border-border lg:shadow-xl lg:rounded-[2rem] lg:p-6 lg:top-8 lg:sticky transition-colors">
                        <h3 className="text-lg font-bold text-foreground mb-6">Book a Slot</h3>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Select Date</label>
                                {amenity.requiresApproval && (
                                    <div className="mb-4 bg-orange-500/10 border border-orange-500/20 rounded-xl p-3 flex items-start gap-3">
                                        <Info className="text-orange-500 mt-0.5" size={16} />
                                        <div className="space-y-1">
                                            <p className="text-xs font-bold text-orange-500">Approval Required</p>
                                            <p className="text-xs text-orange-400 leading-relaxed">
                                                This amenity requires admin approval. Your booking status will be &quot;Pending&quot; until confirmed.
                                            </p>
                                        </div>
                                    </div>
                                )}
                                <div
                                    className="relative group cursor-pointer"
                                    onClick={() => dateInputRef.current?.showPicker()}
                                >
                                    {/* Visible Input (Formatted) */}
                                    <input
                                        type="text"
                                        readOnly
                                        value={date ? date.split('-').reverse().join('-') : ''}
                                        placeholder="DD-MM-YYYY"
                                        className="w-full h-12 pl-10 pr-4 rounded-xl bg-accent/50 border border-border focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm font-medium text-foreground pointer-events-none"
                                    />
                                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground z-10" size={18} />

                                    {/* Hidden Native Picker */}
                                    <input
                                        ref={dateInputRef}
                                        type="date"
                                        className="absolute inset-0 w-full h-full opacity-0 z-20 cursor-pointer"
                                        onChange={(e) => setDate(e.target.value)}
                                        value={date}
                                        min={new Date().toISOString().split('T')[0]}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Available Slots</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {slots.length === 0 && <p className="col-span-3 text-sm text-gray-500 italic">No slots for this date</p>}
                                    {slots.map((slot) => {
                                        const isSelected = selectedSlots.includes(slot.id)
                                        return (
                                            <button
                                                key={slot.id}
                                                onClick={() => toggleSlot(slot.id)}
                                                className={cn(
                                                    "py-2 px-1 text-xs font-bold rounded-lg border transition-all",
                                                    isSelected
                                                        ? "bg-primary text-white border-primary shadow-md transform scale-105"
                                                        : "bg-accent/30 text-muted-foreground border-border hover:border-primary/30"
                                                )}
                                            >
                                                {slot.label}
                                                {isSelected && <span className="ml-1 text-[10px] opacity-70">✓</span>}
                                            </button>
                                        )
                                    })}
                                </div>
                                <p className="text-xs text-muted-foreground text-right mt-1">{selectedSlots.length} slot(s) selected</p>
                            </div>

                            <div className="pt-4">
                                <div className="flex justify-between items-center mb-4">
                                    <span className="text-sm font-medium text-muted-foreground">Total Price</span>
                                    <span className="text-xl font-bold text-primary">Free</span>
                                </div>
                                <button
                                    className="w-full h-14 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl shadow-lg shadow-primary/10 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                                    onClick={handleConfirm}
                                    disabled={booking}
                                >
                                    {booking ? (
                                        <span>Confirming...</span>
                                    ) : (
                                        <>
                                            <span>{amenity.requiresApproval ? "Request Booking" : "Confirm Booking"}</span>
                                            <CheckCircle2 size={20} />
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
