"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ChevronLeft, Calendar, Clock, MapPin, AlignLeft, Image as ImageIcon, Users, Loader2 } from "lucide-react"
import { createCommunityEvent } from "@/lib/api"

export default function CreateEventPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        date: "",
        time: "",
        location: "",
        participants: "", // Used for capacity/target audience size
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        // Basic validation
        if (!formData.title || !formData.date || !formData.time || !formData.location) {
            alert("Please fill in all required fields")
            setLoading(false)
            return
        }

        try {
            // Combine date and time into ISO format
            const eventDate = new Date(`${formData.date}T${formData.time}:00`)

            await createCommunityEvent({
                title: formData.title,
                description: formData.description,
                eventDate: eventDate.toISOString(),
                location: formData.location,
                capacity: formData.participants ? parseInt(formData.participants) : undefined,
            })

            alert("Event submitted for approval! You can track its status in 'My Events'.")
            router.push("/community/events")
        } catch (error) {
            console.error("Failed to create event", error)
            alert("Failed to create event. Please try again.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex flex-col min-h-screen bg-background pb-safe transition-colors">
            {/* Header */}
            <div className="bg-card px-6 py-6 rounded-b-[2rem] border-b border-border flex items-center gap-1 shadow-sm z-20 sticky top-0 transition-colors">
                <button
                    onClick={() => router.back()}
                    className="p-2 -ml-2 mr-2 hover:bg-accent rounded-full text-foreground transition-colors"
                >
                    <ChevronLeft className="h-6 w-6" />
                </button>
                <div>
                    <h1 className="text-2xl font-extrabold text-primary tracking-tight">Create Event</h1>
                    <p className="text-xs text-muted-foreground font-medium mt-0.5">Submit a new activity</p>
                </div>
            </div>

            {/* Form */}
            <div className="flex-1 overflow-y-auto p-6">
                <form onSubmit={handleSubmit} className="space-y-6">

                    {/* Title */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider ml-1">Event Title</label>
                        <div className="bg-card rounded-2xl border border-border px-4 py-3 focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/5 transition-all shadow-sm">
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                placeholder="E.g., Sunday Morning Yoga"
                                className="w-full bg-transparent text-sm font-semibold text-foreground placeholder:text-muted-foreground focus:outline-none"
                            />
                        </div>
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider ml-1">Description</label>
                        <div className="bg-card rounded-2xl border border-border px-4 py-3 focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/5 transition-all shadow-sm flex items-start gap-3">
                            <AlignLeft className="text-muted-foreground mt-0.5 flex-shrink-0" size={18} />
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                placeholder="Describe the event..."
                                rows={4}
                                className="w-full bg-transparent text-sm font-medium text-foreground placeholder:text-muted-foreground focus:outline-none resize-none"
                            />
                        </div>
                    </div>

                    {/* Date & Time */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider ml-1">Date</label>
                            <div className="bg-card rounded-2xl border border-border px-4 py-3 focus-within:border-primary transition-all shadow-sm flex items-center gap-2">
                                <Calendar className="text-muted-foreground" size={18} />
                                <input
                                    type="date"
                                    name="date"
                                    value={formData.date}
                                    onChange={handleChange}
                                    className="w-full bg-transparent text-sm font-semibold text-foreground focus:outline-none [color-scheme:light] dark:[color-scheme:dark]"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider ml-1">Time</label>
                            <div className="bg-card rounded-2xl border border-border px-4 py-3 focus-within:border-primary transition-all shadow-sm flex items-center gap-2">
                                <Clock className="text-muted-foreground" size={18} />
                                <input
                                    type="time"
                                    name="time"
                                    value={formData.time}
                                    onChange={handleChange}
                                    className="w-full bg-transparent text-sm font-semibold text-foreground focus:outline-none [color-scheme:light] dark:[color-scheme:dark]"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Location */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider ml-1">Location</label>
                        <div className="bg-card rounded-2xl border border-border px-4 py-3 focus-within:border-primary transition-all shadow-sm flex items-center gap-3">
                            <MapPin className="text-muted-foreground" size={18} />
                            <input
                                type="text"
                                name="location"
                                value={formData.location}
                                onChange={handleChange}
                                placeholder="E.g., Community Hall"
                                className="w-full bg-transparent text-sm font-semibold text-foreground placeholder:text-muted-foreground focus:outline-none"
                            />
                        </div>
                    </div>

                    {/* Participants Limit */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider ml-1">Audience Limit</label>
                        <div className="bg-card rounded-2xl border border-border px-4 py-3 focus-within:border-primary transition-all shadow-sm flex items-center gap-3">
                            <Users className="text-muted-foreground" size={18} />
                            <input
                                type="number"
                                name="participants"
                                value={formData.participants}
                                onChange={handleChange}
                                placeholder="Max participants (optional)"
                                className="w-full bg-transparent text-sm font-semibold text-foreground placeholder:text-muted-foreground focus:outline-none"
                            />
                        </div>
                    </div>

                    {/* Image Placeholder */}
                    <div className="bg-primary/5 border-2 border-dashed border-primary/20 rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-primary/10 transition-colors">
                        <div className="h-12 w-12 bg-card rounded-full flex items-center justify-center text-primary shadow-sm mb-3">
                            <ImageIcon size={24} />
                        </div>
                        <p className="text-sm font-bold text-primary">Add Event Image</p>
                        <p className="text-xs text-muted-foreground mt-1">Tap to select a cover photo</p>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-primary text-primary-foreground py-4 rounded-2xl font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed mt-4"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="animate-spin" size={20} />
                                Submitting...
                            </>
                        ) : (
                            "Submit for Approval"
                        )}
                    </button>
                </form>
            </div>
        </div>
    )
}
