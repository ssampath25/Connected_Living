"use client"

import { useState } from "react"
import { Tv, Fan, Lightbulb, Thermometer, Mic, Power, Plus } from "lucide-react"
import { cn } from "@/lib/utils"

const ROOMS = [
    { id: "living", name: "Living Room", devices: 4 },
    { id: "bedroom", name: "Bedroom", devices: 3 },
    { id: "kitchen", name: "Kitchen", devices: 2 },
]

const DEVICES = [
    { id: 1, name: "Main Light", type: "Light", room: "living", status: "on", icon: Lightbulb },
    { id: 2, name: "Smart TV", type: "TV", room: "living", status: "off", icon: Tv },
    { id: 3, name: "AC", type: "AC", room: "living", status: "on", temp: "24°C", icon: Thermometer },
    { id: 4, name: "Ceiling Fan", type: "Fan", room: "living", status: "on", speed: "3", icon: Fan },
    { id: 5, name: "Bed Lamp", type: "Light", room: "bedroom", status: "off", icon: Lightbulb },
    { id: 6, name: "AC", type: "AC", room: "bedroom", status: "off", icon: Thermometer },
]

export default function SmartHubPage() {
    const [activeRoom, setActiveRoom] = useState("living")

    const activeDevices = DEVICES.filter(d => d.room === activeRoom)

    return (
        <div className="flex flex-col min-h-screen bg-background pb-24 lg:pb-0">
            {/* Header */}
            <div className="bg-card px-6 py-6 rounded-b-[2rem] border-b border-border shadow-sm z-20 sticky top-0">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-1">
                        <div>
                            <h1 className="text-2xl font-extrabold text-primary tracking-tight">Smart Hub</h1>
                            <p className="text-xs text-muted-foreground font-medium mt-0.5">Manage your home</p>
                        </div>
                    </div>
                    <div className="h-10 w-10 bg-primary/10 rounded-2xl flex items-center justify-center text-primary hover:bg-primary/20 transition-colors cursor-pointer">
                        <Mic size={20} />
                    </div>
                </div>
            </div>

            {/* Rooms Carousel */}
            <div className="px-6 pt-4 pb-2">
                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                    {ROOMS.map(room => (
                        <button
                            key={room.id}
                            onClick={() => setActiveRoom(room.id)}
                            className={cn(
                                "flex-shrink-0 px-5 py-3 rounded-2xl border transition-all whitespace-nowrap min-w-[100px]",
                                activeRoom === room.id
                                    ? "bg-primary text-white border-transparent shadow-md"
                                    : "bg-card border-border text-muted-foreground shadow-sm"
                            )}
                        >
                            <p className="font-bold text-sm">{room.name}</p>
                            <p className={cn("text-xs mt-1", activeRoom === room.id ? "text-primary-foreground/70" : "text-muted-foreground")}>
                                {room.devices} Devices
                            </p>
                        </button>
                    ))}
                    <button className="flex-shrink-0 px-4 py-3 rounded-2xl border border-dashed border-border text-muted-foreground flex items-center justify-center min-w-[60px]">
                        <Plus size={20} />
                    </button>
                </div>
            </div>

            {/* Devices Grid */}
            <div className="p-6 grid grid-cols-2 lg:grid-cols-4 gap-4">
                {activeDevices.map(device => (
                    <div key={device.id} className={cn(
                        "p-5 rounded-3xl transition-all relative overflow-hidden aspect-square flex flex-col justify-between",
                        device.status === "on" ? "bg-card shadow-md border border-primary/20" : "bg-muted border border-transparent opacity-80"
                    )}>
                        <div className="flex justify-between items-start">
                            <div className={cn(
                                "h-10 w-10 rounded-full flex items-center justify-center transition-colors",
                                device.status === "on" ? "bg-primary/20 text-primary" : "bg-card text-muted-foreground"
                            )}>
                                <device.icon size={20} />
                            </div>
                            <button className={cn(
                                "h-8 w-8 rounded-full flex items-center justify-center transition-colors",
                                device.status === "on" ? "bg-primary text-white" : "bg-muted-foreground text-white"
                            )}>
                                <Power size={14} />
                            </button>
                        </div>

                        <div>
                            <h3 className={cn("font-bold text-lg", device.status === "on" ? "text-foreground" : "text-muted-foreground")}>{device.name}</h3>
                            <p className="text-xs text-muted-foreground mt-1">
                                {device.type === "AC" && device.status === "on" ? device.temp : device.status === "on" ? "Active" : "Off"}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Usage Stats (Quick View) */}
            <div className="px-6 pb-8">
                <div className="bg-primary rounded-3xl p-6 text-white flex items-center justify-between shadow-lg">
                    <div>
                        <p className="text-primary-foreground/70 text-xs font-semibold uppercase tracking-wider">Energy Usage</p>
                        <h3 className="text-2xl font-bold mt-1">24.5 kWh</h3>
                        <p className="text-xs text-primary-foreground/70 mt-1">Today&apos;s consumption</p>
                    </div>
                    <div className="h-12 w-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                        <span className="text-lg font-bold">⚡</span>
                    </div>
                </div>
            </div>
        </div>
    )
}
