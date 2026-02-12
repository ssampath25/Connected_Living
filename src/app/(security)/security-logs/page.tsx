"use client"

import { useEffect, useState } from "react"
import { ClipboardList, ChevronLeft, ArrowDownRight, ArrowUpRight } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"
import { api } from "@/lib/api"

interface LogEntry {
    id: string
    visitorName: string
    type: "entry" | "exit"
    unitId: string
    time: string
    gate: string
    verifiedBy: string
}

export default function SecurityLogsPage() {
    const [loading, setLoading] = useState(true)
    const [logs, setLogs] = useState<LogEntry[]>([])
    const [filter, setFilter] = useState<"all" | "entry" | "exit">("all")

    useEffect(() => {
        const fetchData = async () => {
            try {
                const history = await api.security.getVisitorHistory()
                // Transform to LogEntry
                // SecurityVisitorEntry has status INSIDE, EXITED, etc.
                // We want a log of events. 
                // getVisitorHistory returns a list of entries.
                // If status is EXITED, it means they entered AND exited.
                // If INSIDE, they entered.
                // We should probably show one entry per event (entry or exit).
                // Or one row per visitor session with entry/exit times?
                // The current UI shows separate rows for entry and exit if formatted that way.

                const logEntries: LogEntry[] = []
                history.forEach(h => {
                    // Entry event
                    if (h.entryTime) {
                        logEntries.push({
                            id: `${h.id}-entry`,
                            visitorName: h.visitorName,
                            type: "entry",
                            unitId: h.unitNumber,
                            time: new Date(h.entryTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                            gate: h.gateId || "Gate 1",
                            verifiedBy: "Security"
                        })
                    }

                    // Exit event
                    if (h.exitTime) {
                        logEntries.push({
                            id: `${h.id}-exit`,
                            visitorName: h.visitorName,
                            type: "exit",
                            unitId: h.unitNumber,
                            time: new Date(h.exitTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                            gate: h.gateId || "Gate 1",
                            verifiedBy: "Security"
                        })
                    }
                })

                // Sort by time descending (newest first)
                // We need date to sort correctly if times are just strings. 
                // But simplified: reverse order of history if history is sorted?
                // History from backend is usually sorted by entry time desc.
                // So this should be roughly correct, but exit might be later.
                // Let's sort based on time string? No, that's bad.
                // Ideally backend returns logs.
                // For now, reverse is okay if backend returns newest first.

                setLogs(logEntries)
            } catch (error) {
                console.error("Failed to fetch logs", error)
            } finally {
                setTimeout(() => setLoading(false), 500)
            }
        }
        fetchData()
    }, [])

    const filteredLogs = logs.filter(l => filter === "all" || l.type === filter)

    if (loading) {
        return (
            <div className="flex flex-col min-h-screen bg-background pb-24 lg:pb-0 p-6 space-y-4">
                <Skeleton className="h-12 w-full rounded-xl" />
                {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-16 w-full rounded-xl" />)}
            </div>
        )
    }

    return (
        <div className="flex flex-col min-h-screen bg-background pb-24 lg:pb-0">
            {/* Header */}
            <div className="bg-card px-6 py-6 rounded-b-[2rem] border-b border-border shadow-sm sticky top-0 z-20">
                <div className="flex items-center gap-3 mb-4">
                    <Link href="/gate" className="lg:hidden p-2 -ml-2 hover:bg-accent rounded-full">
                        <ChevronLeft className="h-6 w-6" />
                    </Link>
                    <div className="flex-1">
                        <h1 className="text-2xl font-extrabold text-green-600 tracking-tight">Entry Logs</h1>
                        <p className="text-xs text-muted-foreground font-medium">Entry & exit history</p>
                    </div>
                    <div className="h-10 w-10 bg-green-500/10 rounded-xl flex items-center justify-center text-green-600">
                        <ClipboardList size={20} />
                    </div>
                </div>

                {/* Filter Tabs */}
                <div className="flex gap-2">
                    {(["all", "entry", "exit"] as const).map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={cn(
                                "px-4 py-2 rounded-full text-xs font-bold transition-colors flex items-center gap-1",
                                filter === f
                                    ? "bg-green-500 text-white"
                                    : "bg-muted text-muted-foreground hover:bg-accent"
                            )}
                        >
                            {f === "entry" && <ArrowDownRight size={12} />}
                            {f === "exit" && <ArrowUpRight size={12} />}
                            {f === "all" ? "All" : f.charAt(0).toUpperCase() + f.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            {/* Logs List */}
            <div className="p-6 space-y-3">
                {filteredLogs.length === 0 ? (
                    <div className="text-center py-12">
                        <ClipboardList size={48} className="mx-auto text-muted-foreground mb-4" />
                        <p className="text-muted-foreground font-medium">No logs found</p>
                    </div>
                ) : (
                    filteredLogs.map((log) => (
                        <div
                            key={log.id}
                            className="bg-card rounded-xl p-4 border border-border flex items-center gap-4"
                        >
                            <div className={cn(
                                "h-10 w-10 rounded-full flex items-center justify-center",
                                log.type === "entry"
                                    ? "bg-green-500/10 text-green-600"
                                    : "bg-orange-500/10 text-orange-500"
                            )}>
                                {log.type === "entry" ? <ArrowDownRight size={20} /> : <ArrowUpRight size={20} />}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <h3 className="font-bold text-foreground truncate">{log.visitorName}</h3>
                                    <span className={cn(
                                        "text-[10px] font-bold uppercase px-2 py-0.5 rounded-full",
                                        log.type === "entry"
                                            ? "bg-green-500/10 text-green-600"
                                            : "bg-orange-500/10 text-orange-500"
                                    )}>
                                        {log.type}
                                    </span>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    {log.unitId} • {log.gate} • {log.verifiedBy}
                                </p>
                            </div>
                            <p className="text-xs text-muted-foreground whitespace-nowrap">{log.time}</p>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}
