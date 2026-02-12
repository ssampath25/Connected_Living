"use client"

import { useEffect, useState, use } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Calendar, Clock, MapPin, QrCode, AlertTriangle, Share2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { api, getIconForType, BookingItem } from "@/lib/api"
import { Skeleton } from "@/components/ui/skeleton"

function AmenityIcon({ amenityId }: { amenityId: string }) {
    /* eslint-disable react-hooks/static-components */
    const Icon = getIconForType(amenityId) || Calendar
    return <Icon size={32} />
    /* eslint-enable react-hooks/static-components */
}

export default function BookingDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter()
    const { id } = use(params)
    const [booking, setBooking] = useState<BookingItem | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        api.getBookingById(id).then(data => {
            setBooking(data || null)
            setLoading(false)
        })
    }, [id])

    if (loading) {
        return (
            <div className="min-h-screen bg-background pb-24 p-6 flex flex-col items-center justify-center transition-colors">
                <Skeleton className="h-96 w-full max-w-sm rounded-[2rem]" />
            </div>
        )
    }

    if (!booking) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center transition-colors">
                <div className="h-20 w-20 bg-accent rounded-full flex items-center justify-center text-muted-foreground mb-4">
                    <AlertTriangle size={32} />
                </div>
                <h2 className="text-xl font-bold text-foreground">Booking Not Found</h2>
                <button onClick={() => router.back()} className="mt-6 text-primary font-bold hover:underline">
                    Go Back
                </button>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-primary pb-24 relative overflow-hidden transition-colors">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10 pointer-events-none">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-white rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2" />
            </div>

            {/* Header */}
            <div className="relative z-10 p-4 lg:p-6">
                <div className="flex items-center gap-3 max-w-md mx-auto w-full text-white mb-6">
                    <button onClick={() => router.back()} className="p-2 -ml-2 hover:bg-white/10 rounded-full transition-colors">
                        <ArrowLeft size={24} />
                    </button>
                    <h1 className="text-xl font-bold">Booking Ticket</h1>
                </div>

                {/* Ticket Card */}
                <div className="max-w-md mx-auto w-full bg-card rounded-[2rem] overflow-hidden shadow-2xl border border-border/50">
                    {/* Top Section */}
                    <div className="p-8 pb-10 relative">
                        <div className="flex justify-between items-start mb-6">
                            <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary transition-colors">
                                <AmenityIcon amenityId={booking.amenityId} />
                            </div>
                            <span className={cn(
                                "px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider border transition-colors",
                                booking.status === "Confirmed" ? "bg-green-500/10 text-green-500 border-green-500/20" :
                                    booking.status === "Pending" ? "bg-orange-500/10 text-orange-500 border-orange-500/20" :
                                        booking.status === "Completed" ? "bg-muted text-muted-foreground border-border" :
                                            "bg-destructive/10 text-destructive border-destructive/20"
                            )}>
                                {booking.status}
                            </span>
                        </div>

                        <h2 className="text-2xl font-bold text-foreground mb-2">{booking.amenityName}</h2>
                        <div className="flex items-center gap-2 text-muted-foreground text-sm font-medium">
                            <MapPin size={16} />
                            <span>Community Center, Block A</span>
                        </div>

                        {/* Divider with circles */}
                        <div className="absolute left-0 bottom-0 w-full h-8 translate-y-1/2 flex items-center justify-between px-[-1rem]">
                            <div className="w-8 h-8 rounded-full bg-primary -ml-4" />
                            <div className="flex-1 border-t-2 border-dashed border-border mx-4" />
                            <div className="w-8 h-8 rounded-full bg-primary -mr-4" />
                        </div>
                    </div>

                    {/* Bottom Section */}
                    <div className="bg-accent/30 p-8 pt-10 space-y-6">
                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Date</p>
                                <div className="flex items-center gap-2 font-bold text-foreground transition-colors">
                                    <Calendar size={18} className="text-primary" />
                                    <span>{booking.date}</span>
                                </div>
                            </div>
                            <div>
                                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Time</p>
                                <div className="flex items-center gap-2 font-bold text-foreground transition-colors">
                                    <Clock size={18} className="text-primary" />
                                    <span>{booking.slots[0].split(' ')[0]}</span>
                                    <span className="text-muted-foreground text-xs font-normal">Onwards</span>
                                </div>
                            </div>
                        </div>

                        <div>
                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Selected Slots</p>
                            <div className="flex flex-wrap gap-2">
                                {booking.slots.map(slot => (
                                    <span key={slot} className="px-3 py-1.5 bg-card border border-border rounded-lg text-sm font-semibold text-foreground shadow-sm transition-colors">
                                        {slot}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {booking.status === "Confirmed" && (
                            <div className="bg-card p-6 rounded-2xl border border-border flex flex-col items-center gap-4 shadow-sm transition-colors">
                                <div className="pointer-events-none p-2 bg-white rounded-xl">
                                    <QrCode size={120} className="text-black" />
                                </div>
                                <div className="text-center space-y-1">
                                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Booking ID</p>
                                    <p className="font-mono text-lg font-bold text-primary tracking-wider">{booking.id}</p>
                                </div>
                                <p className="text-xs text-center text-muted-foreground max-w-[200px]">
                                    Scan this code at the facility entrance for access.
                                </p>
                            </div>
                        )}

                        {booking.status === "Pending" && (
                            <div className="bg-orange-500/10 p-6 rounded-2xl border border-orange-500/20 flex flex-col items-center gap-4 text-center transition-colors">
                                <div className="h-16 w-16 bg-orange-500/20 rounded-full flex items-center justify-center text-orange-500 animate-pulse">
                                    <Clock size={32} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-foreground">Awaiting Approval</h3>
                                    <p className="text-sm text-muted-foreground mt-1">Your booking request is being reviewed by the admin.</p>
                                </div>
                            </div>
                        )}

                        <div className="flex gap-3 pt-4">
                            {/* Only show Share button if NOT Cancelled */}
                            {booking.status !== "Cancelled" && (
                                <button className="flex-1 h-12 rounded-xl bg-card border border-border text-foreground font-bold text-sm flex items-center justify-center gap-2 shadow-sm hover:bg-accent transition-colors">
                                    <Share2 size={18} />
                                    <span>Share</span>
                                </button>
                            )}
                            {(booking.status === "Confirmed" || booking.status === "Pending") && (
                                <button
                                    onClick={async () => {
                                        if (confirm("Are you sure you want to cancel this booking?")) {
                                            await api.cancelBooking(booking.id)
                                            setBooking(prev => prev ? { ...prev, status: "Cancelled" } : null)
                                        }
                                    }}
                                    className="flex-1 h-12 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive font-bold text-sm flex items-center justify-center gap-2 shadow-sm hover:bg-destructive/20 transition-colors"
                                >
                                    Cancel Booking
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
