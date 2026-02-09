"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ChevronLeft, Clock, MapPin, Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import { api, CommunityEventItem } from "@/lib/api"
import { getMyEvents } from "@/lib/api"

export default function CommunityEventsPage() {
    const router = useRouter()
    const [events, setEvents] = useState<CommunityEventItem[]>([])
    const [hasHostedEvents, setHasHostedEvents] = useState(false)

    useEffect(() => {
        const loadEvents = async () => {
            try {
                // Check if user has ANY events (including pending)
                const myEvents = await getMyEvents()
                setHasHostedEvents(myEvents.length > 0)

                // Load approved events for public display
                const data = await api.getCommunityEvents()
                // Only show approved events (or events without status for legacy)
                const publicEvents = data.filter(e => !e.status || e.status === "approved")
                setEvents(publicEvents)
            } catch (error) {
                console.error("Failed to load events", error)
            }
        }
        loadEvents()
    }, [])

    const handleRSVP = async (e: React.MouseEvent, event: CommunityEventItem) => {
        e.stopPropagation() // Prevent navigation to details
        const newStatus = event.rsvpStatus === "going" ? "not_going" : "going"

        try {
            const success = await api.rsvpEvent(event.id, newStatus)
            if (success) {
                setEvents(prevEvents => prevEvents.map(ev =>
                    ev.id === event.id
                        ? { ...ev, rsvpStatus: newStatus, participants: newStatus === "going" ? ev.participants + 1 : ev.participants - 1 }
                        : ev
                ))
            }
        } catch (error) {
            console.error("RSVP failed", error)
        }
    }

    return (
        <div className="flex flex-col h-screen bg-background pb-24 lg:pb-0">
            {/* Header */}
            <div className="bg-card px-6 py-6 rounded-b-[2rem] border-b border-border flex items-center justify-between shadow-sm z-20 sticky top-0">
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => router.push("/community")}
                        className="p-2 -ml-2 mr-2 hover:bg-accent rounded-full text-foreground transition-colors"
                    >
                        <ChevronLeft className="h-6 w-6" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-extrabold text-primary tracking-tight">Events</h1>
                        <p className="text-xs text-muted-foreground font-medium mt-0.5">Upcoming activities & workshops</p>
                    </div>
                </div>
            </div>

            {/* Events List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-32">
                {events.map((event) => (
                    <div
                        key={event.id}
                        onClick={() => router.push(`/community/events/${event.id}`)}
                        className="bg-card rounded-[1.5rem] p-3 shadow-sm border border-border hover:shadow-md transition-shadow group cursor-pointer"
                    >
                        <div className={cn("h-32 w-full rounded-[1.25rem] bg-gradient-to-tr mb-3 relative overflow-hidden", event.imageGradient)}>
                            <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
                            <div className="absolute bottom-3 left-3 bg-card/90 backdrop-blur-md px-2 py-1 rounded-lg text-foreground text-xs font-bold shadow-sm">
                                <span className="text-[10px] uppercase text-muted-foreground block">Guests</span>
                                {event.participants}
                            </div>
                            <button className="absolute bottom-3 right-3 bg-primary text-primary-foreground p-2 rounded-full shadow-lg transform translate-y-10 group-hover:translate-y-0 transition-transform duration-300">
                                <ChevronLeft className="h-4 w-4 rotate-180" />
                            </button>
                        </div>
                        <div className="px-2 pb-2">
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="text-lg font-bold text-foreground leading-tight flex-1">{event.title}</h3>
                                {event.rsvpStatus === "going" && (
                                    <span className="bg-green-500/20 text-green-600 text-[10px] font-bold px-2 py-1 rounded-full whitespace-nowrap ml-2">
                                        Registered
                                    </span>
                                )}
                            </div>
                            <div className="flex flex-col gap-1.5 text-xs text-muted-foreground">
                                <div className="flex items-center gap-2">
                                    <Clock size={14} className="text-primary" />
                                    <span>{event.time}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <MapPin size={14} className="text-primary" />
                                    <span>{event.location}</span>
                                </div>
                            </div>

                            <div className="flex gap-2 mt-3">
                                <button
                                    onClick={(e) => handleRSVP(e, event)}
                                    className={cn(
                                        "flex-1 font-bold py-2.5 rounded-xl transition-colors text-xs uppercase tracking-wide shadow-sm",
                                        event.rsvpStatus === "going"
                                            ? "bg-destructive/10 text-destructive hover:bg-destructive/20"
                                            : "bg-primary text-primary-foreground hover:bg-primary/90"
                                    )}
                                >
                                    {event.rsvpStatus === "going" ? "Cancel RSVP" : "Register"}
                                </button>
                                <button className="flex-1 bg-accent hover:bg-accent/80 text-foreground font-bold py-2.5 rounded-xl transition-colors text-xs uppercase tracking-wide">
                                    Details
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
                {events.length === 0 && (
                    <div className="text-center py-10 text-muted-foreground text-xs">No upcoming events</div>
                )}
            </div>

            {/* My Hosted Events Button - Fixed at bottom center */}
            {hasHostedEvents && (
                <div className="fixed bottom-24 left-0 right-0 flex justify-center z-30 lg:bottom-10 pointer-events-none px-4">
                    <button
                        onClick={() => router.push("/community/events/my")}
                        className="bg-card text-primary px-6 py-3 rounded-full shadow-[0_4px_20px_rgb(0,0,0,0.15)] border-2 border-primary/20 hover:bg-primary hover:text-primary-foreground transition-all hover:scale-105 active:scale-95 flex items-center gap-2 font-bold text-xs uppercase tracking-wide pointer-events-auto"
                    >
                        View My Hosted Events
                    </button>
                </div>
            )}

            {/* Create Event FAB */}
            <button
                onClick={() => router.push("/community/events/create")}
                className="fixed bottom-24 right-6 bg-primary text-primary-foreground p-4 rounded-full shadow-lg shadow-primary/20 hover:bg-primary/90 transition-transform hover:scale-105 active:scale-95 z-40 lg:bottom-10"
            >
                <Plus size={24} />
            </button>
        </div>
    )
}
