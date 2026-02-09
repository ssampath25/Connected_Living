"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, Plus, Search, Filter, Inbox } from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { api, getIconForType, ServiceRequestItem } from "@/lib/api"
import { Skeleton } from "@/components/ui/skeleton"
import { EmptyState } from "@/components/empty-state"

export default function ServiceRequestsPage() {
    const router = useRouter()
    const [activeTab, setActiveTab] = useState("open")
    const [requests, setRequests] = useState<ServiceRequestItem[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // Fetch data
        api.getServiceRequests().then(data => {
            setRequests(data)
            setTimeout(() => setLoading(false), 500) // Demo delay
        })
    }, [])

    const filteredRequests = activeTab === "open"
        ? requests.filter(r => ["Open", "In Progress"].includes(r.status))
        : requests.filter(r => ["Resolved", "Closed"].includes(r.status))

    return (
        <div className="min-h-screen bg-background pb-24 lg:pb-8 transition-colors">
            {/* Header */}
            <div className="sticky top-0 bg-background/80 backdrop-blur-md z-10 border-b border-border lg:border-none p-4 lg:p-6 lg:bg-transparent">
                <div className="flex items-center justify-between max-w-4xl mx-auto w-full">
                    <div className="flex items-center gap-3">
                        <button onClick={() => router.back()} suppressHydrationWarning className="p-2 -ml-2 text-foreground hover:bg-accent rounded-full lg:hidden">
                            <ArrowLeft size={24} />
                        </button>
                        <h1 className="text-xl font-bold text-foreground lg:text-3xl">Service Requests</h1>
                    </div>
                    <Link href="/service-requests/new" suppressHydrationWarning className="hidden lg:flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl font-medium hover:bg-primary/90 transition-all shadow-sm active:scale-95">
                        <Plus size={20} />
                        <span>New Request</span>
                    </Link>
                </div>
            </div>

            <div className="p-4 lg:p-6 max-w-4xl mx-auto w-full space-y-6">
                {/* Search & Tabs */}
                <div className="space-y-4">
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary" size={20} />
                            <input
                                type="text"
                                suppressHydrationWarning
                                placeholder="Search requests..."
                                className="w-full h-12 pl-10 pr-4 rounded-xl bg-card border border-border focus:ring-2 focus:ring-primary/20 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-all"
                            />
                        </div>
                        <button suppressHydrationWarning className="h-12 w-12 flex items-center justify-center rounded-xl bg-accent/50 text-muted-foreground hover:bg-accent hover:text-foreground transition-all">
                            <Filter size={20} />
                        </button>
                    </div>

                    <div className="flex p-1 bg-accent/30 rounded-xl">
                        <button
                            onClick={() => setActiveTab("open")}
                            suppressHydrationWarning
                            className={cn(
                                "flex-1 py-2 text-sm font-semibold rounded-lg transition-all",
                                activeTab === "open" ? "bg-card text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            Active
                        </button>
                        <button
                            onClick={() => setActiveTab("closed")}
                            suppressHydrationWarning
                            className={cn(
                                "flex-1 py-2 text-sm font-semibold rounded-lg transition-all",
                                activeTab === "closed" ? "bg-card text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            History
                        </button>
                    </div>
                </div>

                {/* List */}
                <div className="space-y-4">
                    {loading ? (
                        Array(5).fill(0).map((_, i) => (
                            <div key={i} className="flex gap-4 p-4 border border-border rounded-2xl">
                                <Skeleton className="h-12 w-12 rounded-xl" />
                                <div className="flex-1 space-y-2">
                                    <Skeleton className="h-4 w-1/3" />
                                    <Skeleton className="h-4 w-3/4" />
                                </div>
                            </div>
                        ))
                    ) : filteredRequests.length === 0 ? (
                        <EmptyState
                            icon={Inbox}
                            title="No Service Requests"
                            description={activeTab === 'open' ? "You don't have any active service requests." : "No past service requests found."}
                            action={activeTab === 'open' ? { label: "Create Request", onClick: () => router.push('/service-requests/new') } : undefined}
                        />
                    ) : (
                        filteredRequests.map((req) => {
                            const Icon = getIconForType(req.category)

                            let statusColor = "bg-muted text-muted-foreground"
                            if (req.status === "In Progress") statusColor = "bg-blue-500/10 text-blue-500"
                            if (req.status === "Open") statusColor = "bg-orange-500/10 text-orange-500"
                            if (req.status === "Resolved") statusColor = "bg-green-500/10 text-green-500"

                            return (
                                <Link href={`/service-requests/${req.id}`} key={req.id} className="block bg-card border border-border rounded-2xl p-4 shadow-sm hover:shadow-md hover:border-primary/20 transition-all group active:scale-[0.98]">
                                    <div className="flex items-start gap-4">
                                        <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300">
                                            <Icon size={24} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start">
                                                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{req.category}</span>
                                                <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full transition-colors", statusColor)}>{req.status}</span>
                                            </div>
                                            <h3 className="font-bold text-foreground mt-1 truncate group-hover:text-primary transition-colors">{req.title}</h3>
                                            <p className="text-sm text-muted-foreground mt-1 line-clamp-2 leading-relaxed">{req.description}</p>
                                            <div className="flex items-center gap-3 mt-3 text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                                                <span>{req.date}</span>
                                                <span className="opacity-30">•</span>
                                                <span>ID: {req.id}</span>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            )
                        })
                    )}
                </div>
            </div>

            {/* FAB for Mobile */}
            <Link href="/service-requests/new" className="fixed bottom-24 right-4 h-14 w-14 bg-primary rounded-full flex items-center justify-center text-white shadow-lg lg:hidden hover:scale-110 active:scale-95 transition-all">
                <Plus size={28} />
            </Link>
        </div>
    )
}
