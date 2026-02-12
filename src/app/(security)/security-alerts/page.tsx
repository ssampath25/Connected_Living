"use client"

import { useEffect, useState } from "react"
import { AlertTriangle, ChevronLeft, Clock, MapPin, CheckCircle, History } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"
import { api, SOSLogItem } from "@/lib/api"

export default function SecurityAlertsPage() {
    const [loading, setLoading] = useState(true)
    const [sosHistory, setSosHistory] = useState<SOSLogItem[]>([])
    const [sosActive, setSosActive] = useState(false)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const logs = await api.security.getEmergencyAlerts()
                // Determining active status from logs for now, or just use logs length > 0 if active alerts are cleared?
                // The mock UI used sosActive boolean.
                // Let's assume if there is any 'Active' alert in logs, we set sosActive = true.
                // My api.security.getEmergencyAlerts returns all alerts as "Active" currently (mock status).
                // So if list > 0, Active = true.
                setSosHistory(logs)
                setSosActive(logs.some(l => l.status === "Active"))
            } catch (error) {
                console.error("Failed to fetch alerts", error)
            } finally {
                setTimeout(() => setLoading(false), 500)
            }
        }
        fetchData()

        const interval = setInterval(async () => {
            const logs = await api.security.getEmergencyAlerts()
            setSosHistory(logs)
            setSosActive(logs.some(l => l.status === "Active"))
        }, 5000)

        return () => clearInterval(interval)
    }, [])

    if (loading) {
        return (
            <div className="flex flex-col min-h-screen bg-background pb-24 lg:pb-0 p-6 space-y-4">
                <Skeleton className="h-12 w-full rounded-xl" />
                {[1, 2, 3].map(i => <Skeleton key={i} className="h-24 w-full rounded-2xl" />)}
            </div>
        )
    }

    return (
        <div className="flex flex-col min-h-screen bg-background pb-24 lg:pb-0">
            {/* Header */}
            <div className="bg-card px-6 py-6 rounded-b-[2rem] border-b border-border shadow-sm sticky top-0 z-20">
                <div className="flex items-center gap-3">
                    <Link href="/gate" className="lg:hidden p-2 -ml-2 hover:bg-accent rounded-full">
                        <ChevronLeft className="h-6 w-6" />
                    </Link>
                    <div className="flex-1">
                        <div className="flex items-center gap-2">
                            <h1 className="text-2xl font-extrabold text-foreground tracking-tight">SOS Alerts</h1>
                            {sosActive && <span className="flex h-3 w-3 relative">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                            </span>}
                        </div>
                        <p className="text-xs text-muted-foreground font-medium">
                            Real-time emergency tracking
                        </p>
                    </div>
                </div>
            </div>

            <div className="p-6 space-y-8">
                {/* Active Alerts Section */}
                {sosActive && (
                    <div className="space-y-4">
                        <h2 className="text-sm font-bold text-red-500 uppercase tracking-wider flex items-center gap-2">
                            <AlertTriangle size={16} />
                            Live Emergencies
                        </h2>
                        {/* Mock Live Alert Card since API only returns boolean for status but logs for history */}
                        <div className="bg-red-500 p-6 rounded-3xl shadow-lg shadow-red-500/20 text-white animate-pulse">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="text-2xl font-black">SOS TRIGGERED</h3>
                                    <p className="opacity-90 font-medium mt-1">Unit A-402 • Bedroom</p>
                                </div>
                                <div className="bg-white/20 p-2 rounded-xl">
                                    <AlertTriangle size={32} />
                                </div>
                            </div>
                            <div className="mt-6 flex gap-3">
                                <button className="flex-1 bg-white text-red-600 py-3 rounded-xl font-bold hover:bg-white/90 transition-colors">
                                    Acknowledge
                                </button>
                                <button className="flex-1 bg-red-700/50 text-white py-3 rounded-xl font-bold hover:bg-red-700/70 transition-colors">
                                    Dismiss
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {!sosActive && (
                    <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-6 flex items-center gap-4">
                        <div className="h-12 w-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center text-green-600">
                            <CheckCircle size={24} />
                        </div>
                        <div>
                            <h3 className="font-bold text-green-700 dark:text-green-400">System Normal</h3>
                            <p className="text-sm text-green-600/80 dark:text-green-400/70">No active emergencies reported</p>
                        </div>
                    </div>
                )}

                {/* History Section */}
                <div className="space-y-4">
                    <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                        <History size={16} />
                        Alert History
                    </h2>

                    <div className="space-y-3">
                        {sosHistory.map((log) => (
                            <div key={log.id} className="bg-card border border-border rounded-2xl p-4 flex items-center justify-between hover:bg-accent/50 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className={cn(
                                        "h-10 w-10 rounded-full flex items-center justify-center",
                                        log.status === "Active" ? "bg-red-100 text-red-600" : "bg-muted text-muted-foreground"
                                    )}>
                                        {log.status === "Active" ? <AlertTriangle size={18} /> : <CheckCircle size={18} />}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-sm">{log.residentName} <span className="font-normal text-muted-foreground">({log.unitId})</span></h4>
                                        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                                            <span className="flex items-center gap-1"><Clock size={10} /> {log.time}</span>
                                            <span className="flex items-center gap-1"><MapPin size={10} /> {log.location}</span>
                                        </div>
                                    </div>
                                </div>
                                <span className={cn(
                                    "text-[10px] font-bold px-2 py-1 rounded-full",
                                    log.status === "Active" ? "bg-red-100 text-red-600" : "bg-green-100 text-green-600"
                                )}>
                                    {log.status}
                                </span>
                            </div>
                        ))}

                        {sosHistory.length === 0 && (
                            <div className="text-center py-8 text-muted-foreground text-sm">
                                No history available
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
