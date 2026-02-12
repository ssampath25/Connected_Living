"use client"

import { useEffect, useState, useRef } from "react"
import { Calendar, ArrowUpDown, Search, User, Car, Package, Truck, Clock, MapPin, ArrowLeft, QrCode } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { api, SecurityVisitorEntry } from "@/lib/api"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"

// Extended interface for UI logic
interface PageVisitorItem extends SecurityVisitorEntry {
    date: string
    time: string
}

export default function SecurityVisitorsPage() {
    const [loading, setLoading] = useState(true)
    const [visitors, setVisitors] = useState<PageVisitorItem[]>([])

    // State
    const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0])
    const [activeTab, setActiveTab] = useState<"inside" | "expected" | "history">("inside")
    const [filterType, setFilterType] = useState<"all" | "Pre-approved" | "Sudden">("all")
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
    const [searchQuery, setSearchQuery] = useState("")
    const [activeCardIndex, setActiveCardIndex] = useState(0)
    const [categoryFilter, setCategoryFilter] = useState<"All" | "Guest" | "Cab" | "Delivery" | "Service">("All")
    const statsRef = useRef<HTMLDivElement>(null)

    const handleScroll = () => {
        if (statsRef.current) {
            const { scrollLeft, offsetWidth } = statsRef.current
            const index = Math.round(scrollLeft / offsetWidth)
            setActiveCardIndex(index)
        }
    }

    // Initialize Scroll Position to Index 1 (Real Inside)
    useEffect(() => {
        if (statsRef.current) {
            const offsetWidth = statsRef.current.offsetWidth
            statsRef.current.scrollTo({ left: offsetWidth, behavior: 'auto' })
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setActiveCardIndex(1)
        }
    }, [])

    const fetchVisitors = async () => {
        try {
            const [expected, inside, history] = await Promise.all([
                api.security.getExpectedVisitors(),
                api.security.getInsideVisitors(),
                api.security.getVisitorHistory()
            ])

            const transform = (entry: SecurityVisitorEntry): PageVisitorItem => {
                const relevantDate = entry.entryTime || entry.startTime || new Date().toISOString()
                const date = relevantDate.split('T')[0]
                const time = new Date(relevantDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                return { ...entry, date, time }
            }

            const allVisitors = [
                ...expected.map(transform),
                ...inside.map(transform),
                ...history.map(transform)
            ]

            setVisitors(allVisitors)
        } catch (error) {
            console.error("Failed to fetch visitors", error)
            toast.error("Failed to load visitors")
        }
    }

    useEffect(() => {
        const load = async () => {
            setLoading(true)
            await fetchVisitors()
            setTimeout(() => setLoading(false), 500)
        }
        load()

        // Poll for updates
        const interval = setInterval(fetchVisitors, 10000) // 10s polling
        return () => clearInterval(interval)
    }, [])


    // Filter Logic
    // Note: History filter by date might strictly filter by exit date or entry date. 
    // Here using 'date' derived from entryTime/startTime.
    const insideVisitors = visitors.filter(v => v.status === "INSIDE") // Inside are always current
    const expectedVisitors = visitors.filter(v => v.status === "EXPECTED" && v.date === selectedDate)
    const historyVisitors = visitors.filter(v => (v.status === "EXITED" || v.status === "DENIED") && v.date === selectedDate)

    // Determine List based on Tab
    let currentList: PageVisitorItem[] = []
    if (activeTab === "inside") {
        currentList = insideVisitors
        if (filterType !== "all") {
            currentList = currentList.filter(v => v.approvalType === filterType)
        }
    } else if (activeTab === "expected") {
        currentList = expectedVisitors
    } else {
        currentList = historyVisitors
        if (filterType !== "all") {
            currentList = currentList.filter(v => v.approvalType === filterType)
        }
    }

    // Category Filter
    if (categoryFilter !== "All") {
        const typeMap: Record<Exclude<typeof categoryFilter, "All">, SecurityVisitorEntry["type"]> = {
            Guest: "GUEST",
            Cab: "CAB",
            Delivery: "DELIVERY",
            Service: "SERVICE",
        }
        currentList = currentList.filter(v => v.type === typeMap[categoryFilter])
    }

    // Search Filter
    if (searchQuery) {
        currentList = currentList.filter(v =>
            v.visitorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            v.unitNumber.toLowerCase().includes(searchQuery.toLowerCase())
        )
    }

    // Sorting
    currentList.sort((a, b) => {
        const timeA = a.time || ""
        const timeB = b.time || ""
        return sortOrder === "asc" ? timeA.localeCompare(timeB) : timeB.localeCompare(timeA)
    })

    // Stats
    const stats = {
        attended: historyVisitors.length,
        currentlyInside: insideVisitors.length
    }

    const formatDateDisplay = (dateStr: string) => {
        const d = new Date(dateStr)
        const today = new Date().toISOString().split('T')[0]
        if (dateStr === today) return "Today"
        return d.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })
    }

    if (loading) {
        return (
            <div className="p-6 space-y-6 pb-24">
                <div className="flex justify-between items-center">
                    <Skeleton className="h-8 w-32" />
                    <Skeleton className="h-10 w-10 rounded-full" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <Skeleton className="h-24 rounded-2xl" />
                    <Skeleton className="h-24 rounded-2xl" />
                </div>
                <div className="space-y-4">
                    {[1, 2, 3].map(i => <Skeleton key={i} className="h-20 w-full rounded-2xl" />)}
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background pb-24 transition-all duration-300">
            {/* Header */}
            <div className="sticky top-0 bg-background/80 backdrop-blur-xl z-20 border-b border-border p-4 lg:px-8 lg:py-6 transition-all">
                <div className="flex items-center justify-between max-w-5xl lg:max-w-full mx-auto">
                    <div className="flex items-center gap-3">
                        <Link href="/gate" className="lg:hidden p-2 -ml-2 text-foreground hover:bg-accent rounded-full transition-all active:scale-95">
                            <ArrowLeft size={24} />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-foreground tracking-tight">Visitors</h1>
                            <p className="text-muted-foreground text-sm">{formatDateDisplay(selectedDate)}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        {/* SCAN BUTTON - LINK TO PAGE */}
                        <Link href="/security-scanner">
                            <button
                                className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2 shadow-md shadow-green-500/20 hover:opacity-90 active:scale-95 transition-all"
                            >
                                <QrCode size={18} />
                                <span className="hidden sm:inline">Scan Entry/Exit</span>
                            </button>
                        </Link>

                        <div className="relative">
                            <div className="h-10 w-10 bg-green-500/10 rounded-full flex items-center justify-center text-green-600 hover:bg-green-500/20 transition-colors cursor-pointer">
                                <Calendar size={20} />
                            </div>
                            {/* Invisible Date Input Trigger */}
                            <input
                                type="date"
                                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                onClick={(e) => {
                                    // Explicitly show picker if supported
                                    const picker = e.currentTarget as HTMLInputElement & { showPicker?: () => void }
                                    picker.showPicker?.()
                                }}
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="p-4 lg:px-8 lg:py-6 max-w-5xl lg:max-w-full mx-auto space-y-4 lg:space-y-6">

                {/* Search Bar */}
                <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="text-muted-foreground group-focus-within:text-green-600 transition-colors" size={20} />
                    </div>
                    <input
                        type="text"
                        placeholder="Search visitors..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full h-12 pl-10 pr-4 rounded-2xl bg-muted border border-transparent focus:bg-card focus:border-green-500/20 focus:ring-4 focus:ring-green-500/10 text-sm font-medium outline-none transition-all placeholder:text-muted-foreground text-foreground"
                    />
                </div>

                {/* Stats Row */}
                <div className="relative">
                    <div
                        ref={statsRef}
                        onScroll={handleScroll}
                        className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide gap-4 pb-0 no-scrollbar lg:grid lg:grid-cols-2 lg:overflow-visible"
                    >
                        {/* Currently Inside */}
                        <div className="min-w-full lg:min-w-0 snap-center bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 text-white shadow-lg flex items-center justify-between gap-4 relative overflow-hidden shrink-0">
                            <span className="text-green-100 text-xs font-bold uppercase tracking-wide">Currently Inside</span>
                            <div className="flex items-baseline gap-1">
                                <span className="text-2xl font-bold tracking-tight text-white">{stats.currentlyInside}</span>
                                <span className="text-[10px] text-green-100 font-medium opacity-80">persons</span>
                            </div>
                        </div>

                        {/* Attended / Visited */}
                        <div className="min-w-full lg:min-w-0 snap-center bg-card border border-border rounded-2xl p-6 shadow-sm flex items-center justify-between gap-4 relative overflow-hidden shrink-0">
                            <span className="text-muted-foreground text-xs font-bold uppercase tracking-wide">Attended / Visited</span>
                            <div className="flex items-baseline gap-1">
                                <span className="text-2xl font-bold tracking-tight text-foreground">{stats.attended}</span>
                                <span className="text-[10px] text-muted-foreground font-medium">entries</span>
                            </div>
                        </div>
                    </div>

                    {/* Pagination Dots */}
                    <div className="flex lg:hidden justify-center gap-1.5 absolute bottom-4 left-0 right-0 z-10 pointer-events-none">
                        {[0, 1].map(i => {
                            const isGreenCard = activeCardIndex === 0;
                            const activeClass = isGreenCard ? "bg-white ring-black/5" : "bg-primary ring-black/5";
                            const inactiveClass = isGreenCard ? "bg-white/40" : "bg-primary/20";

                            return (
                                <div
                                    key={i}
                                    className={cn(
                                        "h-1.5 rounded-full transition-all duration-300 pointer-events-auto cursor-pointer shadow-sm",
                                        i === activeCardIndex
                                            ? `w-4 ${activeClass} shadow-sm ring-1`
                                            : `w-1.5 ${inactiveClass}`
                                    )}
                                    onClick={() => {
                                        if (statsRef.current) {
                                            statsRef.current.scrollTo({
                                                left: i * statsRef.current.offsetWidth,
                                                behavior: 'smooth'
                                            })
                                        }
                                    }}
                                />
                            )
                        })}
                    </div>
                </div>

                {/* Category Filters */}
                <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
                    {([
                        { id: "All", label: "All" },
                        { id: "Guest", label: "People" },
                        { id: "Cab", label: "Cabs" },
                        { id: "Delivery", label: "Delivery" },
                        { id: "Service", label: "Custom" }
                    ] as const).map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => setCategoryFilter(cat.id)}
                            className={cn(
                                "px-4 py-1.5 rounded-full text-xs font-medium border transition-all whitespace-nowrap",
                                categoryFilter === cat.id
                                    ? "active-stub"
                                    : ""
                            )}
                            /* Logic Simplification for display */
                            style={{
                                backgroundColor: categoryFilter === cat.id ? "var(--foreground)" : "var(--background)",
                                color: categoryFilter === cat.id ? "var(--background)" : "var(--muted-foreground)",
                                borderColor: categoryFilter === cat.id ? "var(--foreground)" : "var(--border)"
                            }}
                        >
                            {cat.label}
                        </button>
                    ))}
                </div>

                {/* Tabs */}
                <div className="flex p-1 bg-muted/50 rounded-xl">
                    <button
                        onClick={() => setActiveTab("inside")}
                        className={cn(
                            "flex-1 py-2 rounded-lg text-sm font-medium transition-all",
                            activeTab === "inside" ? "bg-white text-green-600 shadow-sm" : "text-muted-foreground hover:text-foreground"
                        )}
                    >
                        Inside
                    </button>
                    <button
                        onClick={() => setActiveTab("expected")}
                        className={cn(
                            "flex-1 py-2 rounded-lg text-sm font-medium transition-all",
                            activeTab === "expected" ? "bg-white text-green-600 shadow-sm" : "text-muted-foreground hover:text-foreground"
                        )}
                    >
                        Expected
                    </button>
                    <button
                        onClick={() => setActiveTab("history")}
                        className={cn(
                            "flex-1 py-2 rounded-lg text-sm font-medium transition-all",
                            activeTab === "history" ? "bg-white text-green-600 shadow-sm" : "text-muted-foreground hover:text-foreground"
                        )}
                    >
                        History
                    </button>
                </div >

                {/* Filters & Content */}
                < div className="space-y-4" >
                    {/* Filter Bar (Only for Inside/History) */}
                    {
                        (activeTab === "inside" || activeTab === "history") && (
                            <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
                                <button
                                    onClick={() => setFilterType("all")}
                                    className={cn(
                                        "px-3 py-1.5 rounded-full text-xs font-medium border transition-colors whitespace-nowrap",
                                        filterType === "all"
                                            ? "bg-green-100 text-green-700 border-green-200"
                                            : "bg-transparent text-muted-foreground border-border hover:border-green-200"
                                    )}
                                >
                                    All
                                </button>
                                <button
                                    onClick={() => setFilterType("Pre-approved")}
                                    className={cn(
                                        "px-3 py-1.5 rounded-full text-xs font-medium border transition-colors whitespace-nowrap",
                                        filterType === "Pre-approved"
                                            ? "bg-green-100 text-green-700 border-green-200"
                                            : "bg-transparent text-muted-foreground border-border hover:border-green-200"
                                    )}
                                >
                                    Pre-approved
                                </button>
                                <button
                                    onClick={() => setFilterType("Sudden")}
                                    className={cn(
                                        "px-3 py-1.5 rounded-full text-xs font-medium border transition-colors whitespace-nowrap",
                                        filterType === "Sudden"
                                            ? "bg-green-100 text-green-700 border-green-200"
                                            : "bg-transparent text-muted-foreground border-border hover:border-green-200"
                                    )}
                                >
                                    Sudden Entry
                                </button>

                                <div className="flex-1" />

                                <button
                                    onClick={() => setSortOrder(prev => prev === "asc" ? "desc" : "asc")}
                                    className="h-8 w-8 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                                >
                                    <ArrowUpDown size={14} />
                                </button>
                            </div>
                        )
                    }

                    {/* Visitor List */}
                    <div className="space-y-3 lg:grid lg:grid-cols-2 lg:gap-4 lg:space-y-0">
                        {currentList.length === 0 ? (
                            <div className="text-center py-12 text-muted-foreground lg:col-span-2">
                                <Search className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                <p>No visitors found for this category</p>
                            </div>
                        ) : (
                            currentList.map((visitor) => (
                                <div key={visitor.id} className="bg-card border border-border rounded-xl p-4 shadow-sm flex items-center gap-4">
                                    {/* Icon/Avatar */}
                                    <div className={cn(
                                        "h-12 w-12 rounded-full flex items-center justify-center shrink-0",
                                        visitor.type === "GUEST" ? "bg-blue-100 text-blue-600" :
                                            visitor.type === "DELIVERY" ? "bg-orange-100 text-orange-600" :
                                                visitor.type === "CAB" ? "bg-yellow-100 text-yellow-600" : "bg-gray-100 text-gray-600"
                                    )}>
                                        {visitor.type === "GUEST" && <User size={20} />}
                                        {visitor.type === "DELIVERY" && <Package size={20} />}
                                        {visitor.type === "CAB" && <Car size={20} />}
                                        {visitor.type === "SERVICE" && <Truck size={20} />}
                                    </div>

                                    {/* Details */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start">
                                            <h4 className="font-semibold text-foreground truncate">{visitor.visitorName}</h4>
                                            <span className={cn(
                                                "text-[10px] font-bold px-2 py-0.5 rounded-full uppercase",
                                                visitor.status === "INSIDE" ? "bg-green-100 text-green-700" :
                                                    visitor.status === "EXPECTED" ? "bg-blue-100 text-blue-700" :
                                                        visitor.status === "EXITED" ? "bg-gray-100 text-gray-600" : "bg-red-100 text-red-600"
                                            )}>
                                                {visitor.status}
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                                            <span className="flex items-center gap-1">
                                                <MapPin size={12} /> Unit {visitor.unitNumber}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Clock size={12} /> {visitor.time}
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-2 mt-2">
                                            <span className={cn(
                                                "text-[10px] px-1.5 py-0.5 rounded border",
                                                visitor.approvalType === "Pre-approved" ? "border-green-200 text-green-700 bg-green-50" : "border-amber-200 text-amber-700 bg-amber-50"
                                            )}>
                                                {visitor.approvalType || "Sudden"}
                                            </span>
                                            {visitor.qrCode && (
                                                <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground">
                                                    Code: {visitor.qrCode}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div >
            </div >
        </div >
    )
}
