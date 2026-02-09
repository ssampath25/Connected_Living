"use client"

import { useEffect, useState } from "react"
import { ArrowLeft, Calendar, Clock, ArrowUpDown, CalendarClock, AlertCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { api, BookingItem, getIconForType } from "@/lib/api"
import { Skeleton } from "@/components/ui/skeleton"
import { EmptyState } from "@/components/empty-state"
import Link from "next/link"

export default function MyBookingsPage() {
    const router = useRouter()
    const [bookings, setBookings] = useState<BookingItem[]>([])
    const [loading, setLoading] = useState(true)
    const [sortDesc, setSortDesc] = useState(true)

    useEffect(() => {
        api.getMyBookings().then(data => {
            setBookings(data)
            setLoading(false)
        })
    }, [])

    const toggleSort = () => {
        setSortDesc(!sortDesc)
        setBookings(prev => [...prev].sort((a, b) => sortDesc ? a.timestamp - b.timestamp : b.timestamp - a.timestamp))
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-background pb-24 lg:pb-8 p-4 lg:p-6 max-w-4xl mx-auto space-y-6 flex flex-col transition-colors">
                <div className="flex items-center gap-3 mb-6">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <Skeleton className="h-8 w-48" />
                </div>
                {[1, 2, 3].map(i => (
                    <div key={i} className="bg-card border border-border rounded-2xl p-6 shadow-sm flex gap-4">
                        <Skeleton className="h-16 w-16 rounded-xl" />
                        <div className="space-y-2 flex-1">
                            <Skeleton className="h-5 w-1/3" />
                            <Skeleton className="h-4 w-1/4" />
                            <div className="flex gap-2 pt-2">
                                <Skeleton className="h-6 w-16 rounded-md" />
                                <Skeleton className="h-6 w-16 rounded-md" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background pb-24 lg:pb-8 transition-colors">
            {/* Header */}
            <div className="sticky top-0 bg-background/80 backdrop-blur-md z-10 border-b border-border lg:border-none p-4 lg:p-6 lg:bg-transparent">
                <div className="flex items-center justify-between max-w-4xl mx-auto w-full">
                    <div className="flex items-center gap-3">
                        <button onClick={() => router.back()} className="p-2 -ml-2 text-foreground hover:bg-accent rounded-full transition-colors">
                            <ArrowLeft size={24} />
                        </button>
                        <h1 className="text-xl font-bold text-foreground lg:text-3xl">My Bookings</h1>
                    </div>
                    {bookings.length > 0 && (
                        <button onClick={toggleSort} className="flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-primary bg-accent/50 px-3 py-1.5 rounded-lg transition-colors">
                            <ArrowUpDown size={14} />
                            <span>{sortDesc ? "Newest First" : "Oldest First"}</span>
                        </button>
                    )}
                </div>
            </div>

            <div className="p-4 lg:p-6 max-w-4xl mx-auto w-full space-y-4">
                {bookings.length === 0 ? (
                    <EmptyState
                        icon={CalendarClock}
                        title="No Bookings Yet"
                        description="You haven't booked any amenities yet."
                        action={{ label: "Browse Amenities", onClick: () => router.push('/amenities') }}
                    />
                ) : (
                    <div className="grid gap-4">
                        {bookings.map((booking) => {
                            // Get icon based on amenity ID (simple mapping or need to fetch amenity details? 
                            // The booking item has amenityId. 'pool', 'gym' etc. match icon types mostly or we can map.
                            // api type for amenityId matches iconType often in mocks.
                            const iconType = booking.amenityId as any
                            const Icon = getIconForType(iconType) || Calendar

                            return (
                                <Link href={`/amenities/my-bookings/${booking.id}`} key={booking.id} className="group block bg-card border border-border rounded-3xl p-5 shadow-sm hover:shadow-md hover:border-primary/20 transition-all relative">
                                    <div className="flex flex-col sm:flex-row gap-5">
                                        {/* Icon Box */}
                                        <div className="flex-shrink-0">
                                            <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                                                <Icon size={32} />
                                            </div>
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 space-y-3">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h3 className="text-lg font-bold text-foreground leading-tight group-hover:text-primary transition-colors">{booking.amenityName}</h3>
                                                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                                                        <Calendar size={14} />
                                                        <span>{booking.date}</span>
                                                    </div>
                                                </div>
                                                <span className={cn(
                                                    "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                                                    booking.status === "Confirmed" ? "bg-green-500/10 text-green-500" :
                                                        booking.status === "Pending" ? "bg-orange-500/10 text-orange-500" :
                                                            booking.status === "Completed" ? "bg-muted text-muted-foreground" :
                                                                "bg-destructive/10 text-destructive"
                                                )}>
                                                    {booking.status}
                                                </span>
                                            </div>

                                            {/* Slots Chips */}
                                            <div className="flex flex-wrap gap-2">
                                                {booking.slots.map(slot => (
                                                    <span key={slot} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-accent/50 border border-border text-xs font-semibold text-foreground">
                                                        <Clock size={12} className="text-muted-foreground" />
                                                        {slot}
                                                    </span>
                                                ))}
                                            </div>

                                            {/* Footer Actions */}
                                            <div className="pt-2 border-t border-border flex justify-between items-center">
                                                <span className="text-xs text-muted-foreground">ID: {booking.id}</span>

                                                {(booking.status === "Confirmed" || booking.status === "Pending") && (
                                                    <div className="flex items-center gap-3">
                                                        <button
                                                            onClick={async (e) => {
                                                                e.preventDefault()
                                                                e.stopPropagation()
                                                                if (confirm("Cancel this booking?")) {
                                                                    await api.cancelBooking(booking.id)
                                                                    setBookings(prev => prev.map(b => b.id === booking.id ? { ...b, status: "Cancelled" } : b))
                                                                }
                                                            }}
                                                            className="text-xs font-semibold text-destructive hover:bg-destructive/10 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
                                                        >
                                                            Cancel
                                                        </button>
                                                        <span className="text-xs text-primary font-semibold group-hover:underline">View Ticket</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            )
                        })}
                    </div>
                )}
            </div>
        </div>
    )
}
