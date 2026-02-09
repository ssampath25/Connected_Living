"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, Plus, Search, Filter, X, Ghost, User, IdCard } from "lucide-react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { api, getIconForType, VisitorItem, SavedVisitorItem, FrequentVisitorItem } from "@/lib/api"
import { Skeleton } from "@/components/ui/skeleton"
import { EmptyState } from "@/components/empty-state"

export default function VisitorsPage() {
    const router = useRouter()
    const [activeTab, setActiveTab] = useState("upcoming")
    const [visitors, setVisitors] = useState<VisitorItem[]>([])
    const [savedVisitors, setSavedVisitors] = useState<SavedVisitorItem[]>([])
    const [frequentVisitors, setFrequentVisitors] = useState<FrequentVisitorItem[]>([])
    const [loading, setLoading] = useState(true)
    const [isFabOpen, setIsFabOpen] = useState(false)
    const [isSavedModalOpen, setIsSavedModalOpen] = useState(false)
    const [savedSearch, setSavedSearch] = useState("")

    useEffect(() => {
        Promise.all([
            api.getVisitors(),
            api.getSavedVisitors(),
            api.getFrequentVisitors()
        ]).then(([vData, sData, fData]) => {
            setVisitors(vData)
            setSavedVisitors(sData)
            setFrequentVisitors(fData)
            setTimeout(() => setLoading(false), 500)
        })
    }, [])

    const filteredVisitors = activeTab === "upcoming"
        ? visitors.filter(v => ["Expected", "Inside", "Gate Pending"].includes(v.status))
        : visitors.filter(v => ["Departed", "Denied", "Expired", "Left"].includes(v.status))

    return (
        <div className="min-h-screen bg-background pb-24 lg:pb-8">
            {/* Header */}
            <div className="sticky top-0 bg-background/80 backdrop-blur-xl z-20 border-b border-border lg:border-none p-4 lg:p-6 lg:bg-transparent transition-all">
                <div className="flex items-center justify-between max-w-4xl mx-auto w-full">
                    <div className="flex items-center gap-3">
                        <button onClick={() => router.back()} suppressHydrationWarning className="p-2 -ml-2 text-foreground hover:bg-accent rounded-full lg:hidden transition-all active:scale-95">
                            <ArrowLeft size={24} />
                        </button>
                        <h1 className="text-2xl font-bold text-foreground lg:text-3xl tracking-tight">My Visitors</h1>
                    </div>
                </div>
            </div>

            <div className="p-4 lg:p-6 max-w-4xl mx-auto w-full space-y-8">

                {/* Search */}
                <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="text-muted-foreground group-focus-within:text-primary transition-colors" size={20} />
                    </div>
                    <input
                        type="text"
                        suppressHydrationWarning
                        placeholder="Search visitors..."
                        className="w-full h-12 pl-10 pr-4 rounded-2xl bg-muted border border-transparent focus:bg-card focus:border-primary/20 focus:ring-4 focus:ring-primary/10 text-sm font-medium outline-none transition-all placeholder:text-muted-foreground shadow-sm text-foreground"
                    />
                </div>

                {/* Frequent Visitors Section (Long-Term Pass) */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between px-1">
                        <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-primary/10 text-primary rounded-lg">
                                <IdCard size={18} />
                            </div>
                            <h3 className="font-bold text-foreground text-sm tracking-wide">Frequent Visitors</h3>
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                            {[1, 2].map(i => (
                                <Skeleton key={i} className="h-40 w-32 flex-shrink-0 rounded-3xl" />
                            ))}
                        </div>
                    ) : (
                        <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide -mx-4 px-4 lg:mx-0 lg:px-0">
                            {frequentVisitors.map(fv => (
                                <Link
                                    key={fv.id}
                                    href={`/visitors/frequent/edit/${fv.id}`}
                                    className="flex flex-col items-center justify-between h-40 w-32 flex-shrink-0 bg-card border border-border rounded-3xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-lg hover:shadow-primary/10 hover:border-primary/20 transition-all p-4 group relative overflow-hidden active:scale-[0.98]"
                                >
                                    <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-primary via-indigo-500 to-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <div className="h-14 w-14 rounded-2xl bg-muted flex items-center justify-center text-primary font-bold text-lg group-hover:scale-110 group-hover:bg-primary/10 transition-all duration-300 overflow-hidden shadow-inner ring-4 ring-card">
                                        {(fv.avatar && fv.avatar.includes('/')) ? (
                                            <img src={fv.avatar} alt={fv.name} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                                        ) : (
                                            <span>{fv.avatar || fv.name[0]}</span>
                                        )}
                                    </div>
                                    <div className="text-center w-full space-y-1">
                                        <div className="text-sm font-bold text-foreground truncate">{fv.name}</div>
                                        <div className="text-[10px] font-medium text-muted-foreground truncate uppercase tracking-wider">{fv.relation || fv.type}</div>
                                    </div>
                                    <div className={cn(
                                        "w-full text-center rounded-full py-1 text-[10px] font-bold tracking-wide",
                                        fv.isActive ? "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-500" : "bg-muted text-muted-foreground"
                                    )}>
                                        {fv.isActive ? "ACTIVE" : "EXPIRED"}
                                    </div>
                                </Link>
                            ))}
                            {/* Add New Frequent Visitor */}
                            <Link href="/visitors/frequent/new" className="flex flex-col items-center justify-center h-40 w-32 flex-shrink-0 bg-muted/50 border-2 border-dashed border-border rounded-3xl hover:bg-card hover:border-primary/30 hover:shadow-md cursor-pointer group gap-3 transition-all active:scale-[0.98]">
                                <div className="h-12 w-12 rounded-full bg-card flex items-center justify-center text-muted-foreground shadow-sm group-hover:scale-110 group-hover:text-primary transition-all">
                                    <Plus size={24} />
                                </div>
                                <span className="text-xs font-bold text-muted-foreground text-center leading-tight group-hover:text-primary transition-colors">Add<br />New</span>
                            </Link>
                        </div>
                    )}
                </div>



                {/* Saved Visitors Modal (Refined) */}
                {isSavedModalOpen && (
                    <div className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 animate-in slide-in-from-bottom-5 duration-300 flex flex-col supports-[backdrop-filter]:bg-background/80">
                        <div className="p-4 border-b border-border flex items-center justify-between bg-card/50 backdrop-blur-md sticky top-0 z-10">
                            <h2 className="text-xl font-bold text-foreground tracking-tight">Saved Visitors</h2>
                            <button onClick={() => setIsSavedModalOpen(false)} className="p-2 bg-muted rounded-full hover:bg-accent transition-colors">
                                <X size={20} className="text-muted-foreground" />
                            </button>
                        </div>
                        <div className="p-4 bg-muted/50">
                            <div className="relative group">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={20} />
                                <input
                                    type="text"
                                    placeholder="Search saved visitors..."
                                    value={savedSearch}
                                    onChange={(e) => setSavedSearch(e.target.value)}
                                    className="w-full h-12 pl-10 pr-4 rounded-xl bg-card border border-border shadow-sm focus:ring-2 focus:ring-primary/20 text-sm outline-none transition-all placeholder:font-normal text-foreground"
                                />
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 space-y-3">
                            {savedVisitors.filter(v => v.name.toLowerCase().includes(savedSearch.toLowerCase())).map(sv => (
                                <Link
                                    key={sv.id}
                                    href={`/visitors/edit/${sv.id}`}
                                    className="flex items-center gap-4 p-4 bg-card border border-border rounded-2xl shadow-sm hover:shadow-md hover:border-primary/20 transition-all active:scale-[0.98] group"
                                >
                                    <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center text-muted-foreground font-bold text-lg overflow-hidden flex-shrink-0 group-hover:ring-2 ring-primary/20 transition-all">
                                        {(sv.avatar && sv.avatar.includes('/')) ? (
                                            <img src={sv.avatar} alt={sv.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <span>{sv.avatar || sv.name[0]}</span>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-bold text-foreground group-hover:text-primary transition-colors">{sv.name}</h4>
                                        <p className="text-xs text-muted-foreground font-medium">{sv.relation || sv.type}</p>
                                    </div>
                                    <div className="px-3 py-1.5 bg-primary/10 group-hover:bg-primary rounded-lg text-xs font-bold text-primary group-hover:text-white transition-colors">
                                        Manage
                                    </div>
                                </Link>
                            ))}
                            {savedVisitors.length === 0 && (
                                <div className="text-center py-10 text-gray-400 text-sm font-medium">No saved visitors found</div>
                            )}
                        </div>
                    </div>
                )}

                {/* Tabs */}
                <div className="flex p-1.5 bg-muted rounded-2xl">
                    <button
                        onClick={() => setActiveTab("upcoming")}
                        suppressHydrationWarning
                        className={cn(
                            "flex-1 py-2.5 text-sm font-bold rounded-xl transition-all duration-300",
                            activeTab === "upcoming" ? "bg-card text-primary shadow-sm scale-100" : "text-muted-foreground hover:text-foreground scale-95"
                        )}
                    >
                        Upcoming
                    </button>
                    <button
                        onClick={() => setActiveTab("history")}
                        suppressHydrationWarning
                        className={cn(
                            "flex-1 py-2.5 text-sm font-bold rounded-xl transition-all duration-300",
                            activeTab === "history" ? "bg-card text-primary shadow-sm scale-100" : "text-muted-foreground hover:text-foreground scale-95"
                        )}
                    >
                        History
                    </button>
                </div>

                {/* List */}
                <div className="space-y-4">
                    {loading ? (
                        Array(3).fill(0).map((_, i) => (
                            <div key={i} className="bg-card border border-border rounded-2xl p-4 flex gap-4">
                                <Skeleton className="h-12 w-12 rounded-xl" />
                                <div className="flex-1 space-y-2">
                                    <Skeleton className="h-4 w-1/3" />
                                    <Skeleton className="h-4 w-1/2" />
                                </div>
                            </div>
                        ))
                    ) : filteredVisitors.length === 0 ? (
                        <EmptyState
                            icon={Ghost}
                            title="No Visitors Found"
                            description={activeTab === 'upcoming' ? "You have no upcoming visitors." : "No visitor history available."}
                            action={activeTab === 'upcoming' ? { label: "Invite Visitor", onClick: () => router.push('/visitors/invite') } : undefined}
                        />
                    ) : (
                        filteredVisitors.map((visitor) => {
                            const Icon = getIconForType(visitor.type)
                            let bg, color
                            if (visitor.type === 'Delivery') { bg = 'bg-blue-500/10'; color = 'text-blue-600 dark:text-blue-400' }
                            else if (visitor.type === 'Guest') { bg = 'bg-purple-500/10'; color = 'text-purple-600 dark:text-purple-400' }
                            else { bg = 'bg-orange-500/10'; color = 'text-orange-600 dark:text-orange-400' }

                            return (
                                <div key={visitor.id} className="bg-card border border-border rounded-2xl p-5 flex items-center justify-between shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5 transition-all duration-300">
                                    <div className="flex items-center gap-4">
                                        <div className={cn("h-14 w-14 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm transition-transform hover:scale-105", bg)}>
                                            <Icon size={24} className={color} />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-foreground text-base">{visitor.name}</h3>
                                            <div className="flex items-center gap-2 mt-1.5">
                                                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{visitor.type}</span>
                                                <span className="text-xs text-muted-foreground font-medium">{visitor.time}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-mono font-bold text-lg tracking-wider text-primary bg-primary/10 px-2 py-1 rounded-lg">{visitor.code}</div>
                                        <div className={cn(
                                            "text-[10px] font-bold uppercase tracking-wider mt-2",
                                            visitor.status === "Inside" ? "text-green-600 dark:text-green-500" :
                                                visitor.status === "Expected" ? "text-blue-600 dark:text-blue-400" : "text-muted-foreground"
                                        )}>
                                            {visitor.status}
                                        </div>
                                    </div>
                                </div>
                            )
                        })
                    )}
                </div>
            </div>

            {/* FAB for Mobile */}
            {/* Speed Dial FAB for Mobile */}
            <div className="fixed bottom-24 right-4 z-40 lg:hidden flex flex-col items-end gap-3">
                {isFabOpen && (
                    <div className="flex flex-col items-end gap-3 animate-in slide-in-from-bottom-10 fade-in duration-200">
                        <button
                            onClick={() => setIsSavedModalOpen(true)}
                            className="bg-card text-primary shadow-lg rounded-2xl p-3 pr-5 flex items-center gap-3 border border-border"
                        >
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                <User size={20} />
                            </div>
                            <span className="font-bold text-sm">Saved Visitors</span>
                        </button>


                        <Link
                            href="/visitors/invite"
                            className="bg-card text-primary shadow-lg rounded-2xl p-3 pr-5 flex items-center gap-3 border border-border"
                        >
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                <Plus size={20} />
                            </div>
                            <span className="font-bold text-sm">New Visitor</span>
                        </Link>
                    </div>
                )}

                <button
                    onClick={() => setIsFabOpen(!isFabOpen)}
                    className={cn(
                        "h-14 w-14 rounded-full flex items-center justify-center text-white shadow-lg shadow-indigo-900/20 transition-all hover:scale-105 active:scale-95",
                        isFabOpen ? "bg-red-500 rotate-90" : "bg-primary"
                    )}
                >
                    {isFabOpen ? <X size={28} /> : <Plus size={28} />}
                </button>
            </div>
        </div >
    )
}
