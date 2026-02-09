"use client"

import { useEffect, useState } from "react"
import { ArrowLeft, Search, CalendarClock } from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { cn } from "@/lib/utils"
// Import API
import { api, getIconForType, AmenityItem } from "@/lib/api"

export default function AmenitiesPage() {
    const router = useRouter()
    const [amenities, setAmenities] = useState<AmenityItem[]>([])

    useEffect(() => {
        api.getAmenities().then(setAmenities)
    }, [])

    return (
        <div className="min-h-screen bg-background pb-24 lg:pb-8">
            {/* Header */}
            <div className="sticky top-0 bg-background z-10 border-b border-border lg:border-none p-4 lg:p-6 lg:bg-transparent">
                <div className="flex items-center justify-between max-w-5xl mx-auto w-full">
                    <div className="flex items-center gap-3">
                        <button onClick={() => router.back()} className="p-2 -ml-2 text-primary hover:bg-accent rounded-full lg:hidden">
                            <ArrowLeft size={24} />
                        </button>
                        <h1 className="text-xl font-bold text-primary lg:text-3xl">Amenities</h1>
                    </div>
                    <Link href="/amenities/my-bookings" className="flex items-center gap-2 text-sm font-semibold text-primary bg-primary/10 px-3 py-1.5 rounded-lg hover:bg-primary/20 transition-colors">
                        <CalendarClock size={18} />
                        <span>My Bookings</span>
                    </Link>
                </div>
            </div>

            <div className="p-4 lg:p-6 max-w-5xl mx-auto w-full space-y-6">
                {/* Search */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
                    <input
                        type="text"
                        suppressHydrationWarning
                        placeholder="Find an amenity..."
                        className="w-full h-12 pl-10 pr-4 rounded-xl bg-card border border-border focus:ring-2 focus:ring-primary/20 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-all"
                    />
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 lg:gap-6">
                    {amenities.map((amenity) => {
                        const Icon = getIconForType(amenity.iconType)
                        // Determine colors based on type or status (can be moved to API/Logic)
                        let iconColor = "text-blue-600"
                        let iconBg = "bg-blue-50"

                        if (amenity.iconType === 'gym') { iconColor = "text-orange-600"; iconBg = "bg-orange-50" }
                        if (amenity.iconType === 'clubhouse') { iconColor = "text-purple-600"; iconBg = "bg-purple-50" }
                        if (amenity.iconType === 'conference') { iconColor = "text-gray-600"; iconBg = "bg-gray-100" }

                        return (
                            <Link href={`/amenities/${amenity.id}`} key={amenity.id} className="group block relative overflow-hidden rounded-3xl cursor-pointer shadow-sm hover:shadow-xl transition-all duration-300 border border-border bg-card">
                                {/* Image Placeholder Area */}
                                <div className="h-32 w-full relative" style={{ background: amenity.imageGradient }}>
                                    <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors" />
                                    <div className="absolute top-4 right-4">
                                        <span className={cn(
                                            "px-3 py-1 rounded-full text-xs font-bold text-white backdrop-blur-md",
                                            amenity.status === "Open" ? "bg-green-500/80" : "bg-red-500/80"
                                        )}>
                                            {amenity.status}
                                        </span>
                                    </div>
                                </div>

                                <div className="p-5">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">{amenity.name}</h3>
                                        <div className={cn("h-10 w-10 rounded-full flex items-center justify-center -mt-10 border-4 border-card", iconBg)}>
                                            <Icon size={18} className={iconColor} />
                                        </div>
                                    </div>
                                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{amenity.description}</p>

                                    <div className="flex items-center text-xs font-medium text-muted-foreground gap-2">
                                        <CalendarClock size={14} />
                                        <span>{amenity.timing}</span>
                                    </div>
                                </div>
                            </Link>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}
