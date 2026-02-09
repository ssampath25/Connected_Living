"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import { ChevronLeft, Calendar, MapPin, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { api, CommunityEventItem } from "@/lib/api"

export default function EventDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter()
    const resolvedParams = use(params)
    const [event, setEvent] = useState<CommunityEventItem | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const loadEvent = async () => {
            const id = parseInt(resolvedParams.id)
            if (isNaN(id)) return

            const data = await api.getCommunityEventById(id)
            if (data) {
                setEvent(data)
            }
            setLoading(false)
        }
        loadEvent()
    }, [resolvedParams.id])

    const handleRSVP = async (newStatus: "going" | "not_going") => {
        if (!event) return
        setLoading(true) // Using loading state for button feedback could be better as separate state but this works for simplicity/blocking

        try {
            const success = await api.rsvpEvent(event.id, newStatus)
            if (success) {
                setEvent(prev => prev ? ({
                    ...prev,
                    rsvpStatus: newStatus,
                    participants: newStatus === "going" ? prev.participants + 1 : prev.participants - 1
                }) : null)
            }
        } catch (error) {
            console.error("RSVP failed", error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-background">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
    )

    if (!event) return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-4">
            <p className="text-muted-foreground">Event not found</p>
            <button onClick={() => router.back()} className="text-primary font-bold">Go Back</button>
        </div>
    )

    const isRegistered = event.rsvpStatus === "going"

    return (
        <div className="flex flex-col h-screen bg-background pb-24 lg:pb-0 transition-colors">
            {/* Header */}
            <div className="bg-card px-6 py-6 rounded-b-[2rem] border-b border-border flex items-center justify-between shadow-sm z-20 sticky top-0 transition-colors">
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => router.push("/community/events")}
                        className="p-2 -ml-2 mr-2 hover:bg-accent rounded-full text-foreground transition-colors"
                    >
                        <ChevronLeft className="h-6 w-6" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-extrabold text-primary tracking-tight">Event Details</h1>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-5">
                {/* Hero Image */}
                <div className={cn("h-56 w-full rounded-[2rem] bg-gradient-to-tr relative shadow-md", event.imageGradient)}>
                    <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end text-white">
                        <div>
                            <div className="bg-black/20 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider mb-2 inline-block border border-white/20">
                                {event.organizer || "Community Event"}
                            </div>
                            <h2 className="text-2xl font-bold leading-tight drop-shadow-md">{event.title}</h2>
                        </div>
                    </div>
                </div>

                {/* Details Card */}
                <div className="bg-card rounded-[1.5rem] p-5 shadow-sm border border-border flex flex-col gap-4">
                    <div className="flex justify-between items-center border-b border-border pb-4">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                <Calendar size={20} />
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground font-bold uppercase">Date & Time</p>
                                <p className="text-sm font-bold text-foreground">{event.time}</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-xs text-muted-foreground font-bold uppercase">Price</p>
                            <p className="text-sm font-bold text-green-500">{event.price || "Free"}</p>
                        </div>
                    </div>

                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-600">
                                <MapPin size={20} />
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground font-bold uppercase">Location</p>
                                <p className="text-sm font-bold text-foreground">{event.location}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Description */}
                <div className="bg-card rounded-[1.5rem] p-5 shadow-sm border border-border">
                    <h3 className="text-sm font-bold text-foreground mb-3 uppercase tracking-wide">About Event</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                        {event.description || "No description provided for this event."}
                    </p>
                </div>

                {/* Attendees & RSVP */}
                <div className="bg-card rounded-[1.5rem] p-5 shadow-sm border border-border flex items-center justify-between">
                    <div>
                        <p className="text-xs text-muted-foreground font-bold uppercase">Attendees</p>
                        <div className="flex -space-x-2 mt-2">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="h-8 w-8 rounded-full bg-accent border-2 border-card flex items-center justify-center text-[10px] font-bold text-muted-foreground">
                                    U{i}
                                </div>
                            ))}
                            <div className="h-8 w-8 rounded-full bg-primary border-2 border-card flex items-center justify-center text-[10px] font-bold text-primary-foreground">
                                +{event.participants}
                            </div>
                        </div>
                    </div>

                    {isRegistered ? (
                        <div className="flex items-center gap-2">
                            <div className="bg-green-500/10 text-green-600 px-4 py-3 rounded-xl text-sm font-bold border border-green-500/20 cursor-default">
                                Registered
                            </div>
                            <button
                                onClick={() => handleRSVP("not_going")}
                                className="text-destructive hover:bg-destructive/10 p-3 rounded-xl transition-colors font-medium text-xs whitespace-nowrap"
                            >
                                Cancel
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={() => handleRSVP("going")}
                            className="bg-primary text-primary-foreground px-6 py-3 rounded-xl text-sm font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-colors whitespace-nowrap"
                        >
                            RSVP Now
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}
