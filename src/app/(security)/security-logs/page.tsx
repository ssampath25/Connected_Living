"use client"

import { useEffect, useState } from "react"
import { ClipboardList, Search, ChevronLeft, ArrowDownRight, ArrowUpRight, Filter } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"
import { api, VisitorItem } from "@/lib/api"

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
                const visitors = await api.getVisitors()
                // Transform visitors to log entries
                const logEntries: LogEntry[] = visitors.flatMap((v: VisitorItem, idx: number) => {
                    const entries: LogEntry[] = []
                    entries.push({
                        id: `${v.id}-entry`,
                        visitorName: v.name,
                        type: "entry",
                        unitId: v.unitId,
                        time: v.time || "N/A",
                        gate: "Gate 1",
                        verifiedBy: "Security Guard"
                    })
                    if (v.status === "Left") {
                        entries.push({
                            id: `${v.id}-exit`,
                            visitorName: v.name,
                            type: "exit",
                            unitId: v.unitId,
                            time: "Later",
                            gate: "Gate 1",
                            verifiedBy: "Security Guard"
                        })
                    }
                    return entries
                })
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
