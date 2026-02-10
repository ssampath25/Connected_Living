"use client"

import { useState } from "react"
import { Video, ChevronLeft, Maximize2, Grid, List, Play, Pause } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface CameraFeed {
    id: string
    name: string
    location: string
    status: "online" | "offline"
    recording: boolean
}

const MOCK_CAMERAS: CameraFeed[] = [
    { id: "1", name: "CAM-01", location: "Main Gate", status: "online", recording: true },
    { id: "2", name: "CAM-02", location: "Parking Entrance", status: "online", recording: true },
    { id: "3", name: "CAM-03", location: "Lobby", status: "online", recording: true },
    { id: "4", name: "CAM-04", location: "Pool Area", status: "online", recording: true },
    { id: "5", name: "CAM-05", location: "Back Gate", status: "offline", recording: false },
    { id: "6", name: "CAM-06", location: "Basement", status: "online", recording: true },
]

export default function SecurityCCTVPage() {
    const [cameras] = useState<CameraFeed[]>(MOCK_CAMERAS)
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
    const [selectedCamera, setSelectedCamera] = useState<string | null>(null)

    return (
        <div className="flex flex-col min-h-screen bg-background pb-24 lg:pb-0">
            {/* Header */}
            <div className="bg-card px-6 py-6 rounded-b-[2rem] border-b border-border shadow-sm sticky top-0 z-20">
                <div className="flex items-center gap-3 mb-4">
                    <Link href="/gate" className="lg:hidden p-2 -ml-2 hover:bg-accent rounded-full">
                        <ChevronLeft className="h-6 w-6" />
                    </Link>
                    <div className="flex-1">
                        <h1 className="text-2xl font-extrabold text-green-600 tracking-tight">CCTV</h1>
                        <p className="text-xs text-muted-foreground font-medium">
                            {cameras.filter(c => c.status === "online").length} / {cameras.length} cameras online
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setViewMode("grid")}
                            className={cn(
                                "h-10 w-10 rounded-xl flex items-center justify-center transition-colors",
                                viewMode === "grid" ? "bg-green-500 text-white" : "bg-muted text-muted-foreground"
                            )}
                        >
                            <Grid size={18} />
                        </button>
                        <button
                            onClick={() => setViewMode("list")}
                            className={cn(
                                "h-10 w-10 rounded-xl flex items-center justify-center transition-colors",
                                viewMode === "list" ? "bg-green-500 text-white" : "bg-muted text-muted-foreground"
                            )}
                        >
                            <List size={18} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Camera Feeds */}
            <div className="p-6">
                {viewMode === "grid" ? (
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                        {cameras.map((camera) => (
                            <div
                                key={camera.id}
                                className={cn(
                                    "bg-card rounded-2xl overflow-hidden border shadow-sm transition-transform hover:scale-[1.02]",
                                    camera.status === "online" ? "border-green-500/20" : "border-red-500/20"
                                )}
                            >
                                {/* Camera Preview */}
                                <div className="aspect-video bg-black relative">
                                    {camera.status === "online" ? (
                                        <>
                                            {/* Simulated feed placeholder */}
                                            <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                                                <Video size={32} className="text-gray-600 animate-pulse" />
                                            </div>
                                            {/* Recording indicator */}
                                            {camera.recording && (
                                                <div className="absolute top-2 left-2 flex items-center gap-1 bg-red-500/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                                                    <span className="h-1.5 w-1.5 bg-white rounded-full animate-pulse" />
                                                    REC
                                                </div>
                                            )}
                                            {/* Fullscreen button */}
                                            <button className="absolute top-2 right-2 h-8 w-8 bg-black/50 rounded-lg flex items-center justify-center text-white hover:bg-black/70 transition-colors">
                                                <Maximize2 size={14} />
                                            </button>
                                        </>
                                    ) : (
                                        <div className="absolute inset-0 bg-gray-900 flex items-center justify-center">
                                            <div className="text-center">
                                                <Video size={32} className="text-red-500 mx-auto mb-2" />
                                                <p className="text-red-400 text-xs font-bold">OFFLINE</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                {/* Camera Info */}
                                <div className="p-3">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="font-bold text-foreground text-sm">{camera.name}</h3>
                                            <p className="text-xs text-muted-foreground">{camera.location}</p>
                                        </div>
                                        <div className={cn(
                                            "h-2 w-2 rounded-full",
                                            camera.status === "online" ? "bg-green-500" : "bg-red-500"
                                        )} />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="space-y-3">
                        {cameras.map((camera) => (
                            <div
                                key={camera.id}
                                className="bg-card rounded-xl p-4 border border-border flex items-center gap-4"
                            >
                                <div className={cn(
                                    "h-12 w-12 rounded-xl flex items-center justify-center",
                                    camera.status === "online" ? "bg-green-500/10 text-green-600" : "bg-red-500/10 text-red-500"
                                )}>
                                    <Video size={24} />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-bold text-foreground">{camera.name}</h3>
                                    <p className="text-xs text-muted-foreground">{camera.location}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className={cn(
                                        "text-xs font-bold px-2 py-1 rounded-full",
                                        camera.status === "online"
                                            ? "bg-green-500/10 text-green-600"
                                            : "bg-red-500/10 text-red-500"
                                    )}>
                                        {camera.status}
                                    </span>
                                    {camera.status === "online" && (
                                        <button className="h-8 w-8 bg-green-500 rounded-lg flex items-center justify-center text-white">
                                            <Play size={14} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
