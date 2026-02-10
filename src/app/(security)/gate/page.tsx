"use client"

import { useEffect, useState } from "react"
import { Users, Car, Video, UserPlus, Shield, AlertTriangle, Package, Truck } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"
import { api, VisitorItem } from "@/lib/api"

interface SecurityStats {
    totalVisitorsToday: number
    visitorsInside: number
    overstayAlerts: number
    guests: number
    cabs: number
    delivery: number
    custom: number
}

export default function SecurityGateDashboard() {
    const [loading, setLoading] = useState(true)
    const [stats, setStats] = useState<SecurityStats>({
        totalVisitorsToday: 0,
        visitorsInside: 0,
        overstayAlerts: 0,
        guests: 0,
        cabs: 0,
        delivery: 0,
        custom: 0
    })
    const [sosAlerts, setSosAlerts] = useState<number>(0)
    const [recentVisitors, setRecentVisitors] = useState<VisitorItem[]>([])
    const [currentGate] = useState("Gate 1")

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [visitors, sosStatus] = await Promise.all([
                    api.getVisitors(),
                    api.getSOSStatus()
                ])

                // Calculate stats from visitors data
                const todayVisitors = visitors.length
                const insideCount = visitors.filter((v: VisitorItem) => v.status === "Inside").length
                const overstay = visitors.filter((v: VisitorItem) => v.status === "Inside").length

                const guestCount = visitors.filter((v: VisitorItem) => v.type === "Guest").length
                const cabCount = visitors.filter((v: VisitorItem) => v.type === "Cab").length
                const deliveryCount = visitors.filter((v: VisitorItem) => v.type === "Delivery").length
                const customCount = 0

                setStats({
                    totalVisitorsToday: todayVisitors,
                    visitorsInside: insideCount,
                    overstayAlerts: overstay > 5 ? 2 : 0,
                    guests: guestCount,
                    cabs: cabCount,
                    delivery: deliveryCount,
                    custom: customCount
                })

                setSosAlerts(sosStatus ? 1 : 0)
                setRecentVisitors(visitors.slice(0, 5)) // Top 5
            } catch (error) {
                console.error("Failed to fetch security data", error)
            } finally {
                setTimeout(() => setLoading(false), 600)
            }
        }
        fetchData()

        const interval = setInterval(fetchData, 5000)
        return () => clearInterval(interval)
    }, [])

    const quickActions = [
        { href: "/security-visitors", label: "Visitors", icon: Users, color: "bg-green-500" },
        { href: "/security-vehicles", label: "Vehicles", icon: Car, color: "bg-green-500" },
        { href: "/security-cctv", label: "CCTV", icon: Video, color: "bg-green-500" },
        { href: "/security-visitors/add", label: "Add Visitor", icon: UserPlus, color: "bg-green-500" },
    ]

    const AlertsSection = () => (
        <div>
            <h3 className="text-green-600 font-bold text-lg mb-4 lg:text-xl">Security Alerts</h3>
            <div className="bg-card rounded-2xl p-5 border border-border shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="h-12 w-12 bg-green-500/10 rounded-xl flex items-center justify-center text-green-600">
                        <AlertTriangle size={24} />
                    </div>
                    <div className="flex-1">
                        <p className="font-semibold text-foreground">
                            {sosAlerts === 0 ? "No active alerts" : `${sosAlerts} Active SOS Alert`}
                        </p>
                        <p className="text-xs text-muted-foreground">System functioning normally</p>
                    </div>
                </div>
                {sosAlerts > 0 && (
                    <Link
                        href="/security-alerts"
                        className="mt-4 block w-full py-2 text-center bg-red-500 text-white rounded-xl font-semibold text-sm hover:bg-red-600 transition-colors"
                    >
                        View Critical Alerts
                    </Link>
                )}
            </div>
        </div>
    )

    if (loading) {
        return (
            <div className="flex flex-col min-h-screen bg-background lg:bg-transparent pb-24 lg:pb-0 p-6 lg:p-8 space-y-8">
                <div className="flex justify-between items-center mb-4">
                    <div>
                        <Skeleton className="h-8 w-48 mb-2" />
                        <Skeleton className="h-4 w-32" />
                    </div>
                    <Skeleton className="h-10 w-24 rounded-full" />
                </div>
                <Skeleton className="h-48 w-full rounded-3xl" />
                <div className="grid grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-24 w-full rounded-2xl" />)}
                </div>
                <div className="grid grid-cols-3 gap-3">
                    {[1, 2, 3].map(i => <Skeleton key={i} className="h-20 w-full rounded-2xl" />)}
                </div>
                <div className="space-y-4">
                    {[1, 2, 3].map(i => <Skeleton key={i} className="h-20 w-full rounded-2xl" />)}
                </div>
            </div>
        )
    }

    return (
        <div className="flex flex-col min-h-screen bg-background lg:bg-transparent pb-24 lg:pb-0">
            {/* Header Section */}
            <div className="p-6 pt-8 lg:p-8">
                <div className="flex justify-between items-center mb-6 lg:mb-8">
                    <div className="lg:hidden">
                        <h1 className="text-2xl font-bold text-green-600">Connected Living</h1>
                    </div>
                    <div className="hidden lg:block">
                        <h2 className="text-3xl font-bold text-foreground">Security Dashboard</h2>
                        <p className="text-muted-foreground mt-1">Gate management and visitor control</p>
                    </div>

                    <div className="flex items-center gap-4">
                        <Link href="/security-alerts" className="relative group">
                            {sosAlerts > 0 && (
                                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white animate-in zoom-in">{sosAlerts}</span>
                            )}
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600 lg:text-muted-foreground group-hover:text-green-600 transition-colors"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" /></svg>
                        </Link>
                        <Link href="/security-settings" className="h-8 w-8 rounded-full bg-green-500/10 flex items-center justify-center text-green-600 hover:bg-green-500/20 transition-colors">
                            <Shield size={18} />
                        </Link>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 lg:gap-8">
                    {/* Main Content Column (Full width if no sidebar needed, but we keep structure) */}
                    <div className="lg:col-span-12 space-y-8">

                        {/* Dynamic Top Alert (If Active) */}
                        {sosAlerts > 0 && <AlertsSection />}

                        {/* Gate Card */}
                        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-green-500 to-emerald-600 p-6 text-white shadow-lg lg:p-10 lg:rounded-[2rem]">
                            <div className="relative z-10 flex justify-between items-center">
                                <div>
                                    <h2 className="text-xl lg:text-4xl font-bold mb-2">{currentGate}</h2>
                                    <p className="opacity-90 text-sm lg:text-xl font-medium">Main Entrance • Active</p>
                                </div>
                                <div className="h-12 w-12 lg:h-20 lg:w-20 bg-white/20 rounded-xl lg:rounded-2xl flex items-center justify-center backdrop-blur-sm">
                                    <Shield size={24} className="lg:w-10 lg:h-10" />
                                </div>
                            </div>
                            {/* Decorative Circles */}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                            <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/10 rounded-full -ml-16 -mb-16 blur-2xl"></div>
                        </div>

                        {/* Quick Actions */}
                        <div>
                            <h3 className="text-green-600 font-bold text-lg mb-4 lg:text-xl lg:mb-6">Quick Actions</h3>
                            <div className="grid grid-cols-4 gap-4 px-2 lg:px-0 lg:gap-6">
                                {quickActions.map((action) => {
                                    const Icon = action.icon
                                    return (
                                        <Link
                                            key={action.href}
                                            href={action.href}
                                            className="flex flex-col items-center gap-2 group"
                                        >
                                            <div className={cn(
                                                "w-16 h-16 lg:w-24 lg:h-24 rounded-[1.25rem] lg:rounded-[1.75rem] flex items-center justify-center shadow-md text-white transition-transform group-hover:scale-105 group-hover:shadow-lg",
                                                "bg-gradient-to-b from-green-500 to-emerald-600"
                                            )}>
                                                <Icon size={28} className="lg:w-10 lg:h-10" />
                                            </div>
                                            <span className="text-xs lg:text-sm font-medium text-muted-foreground group-hover:text-green-600 transition-colors">{action.label}</span>
                                        </Link>
                                    )
                                })}
                            </div>
                        </div>

                        {/* Dashboard Stats */}
                        <div>
                            <h3 className="text-green-600 font-bold text-lg mb-4 lg:text-xl lg:mb-6 uppercase tracking-wide text-center lg:text-left">Visitor Statistics</h3>

                            <h4 className="text-sm font-semibold text-muted-foreground mb-3 px-1">Total Visitors</h4>

                            {/* Total Visitors Row */}
                            <div className="grid grid-cols-3 gap-3 lg:gap-4 mb-6">
                                <div className="rounded-2xl border-2 border-green-500/20 bg-card p-3 lg:p-4 flex flex-col items-center justify-center text-center shadow-sm hover:shadow-md transition-shadow">
                                    <p className="text-3xl lg:text-4xl font-bold text-green-600">{stats.totalVisitorsToday}</p>
                                    <p className="text-[10px] lg:text-xs text-muted-foreground font-medium mt-1 leading-tight">Today's Total</p>
                                </div>
                                <div className="rounded-2xl border-2 border-green-500/20 bg-card p-3 lg:p-4 flex flex-col items-center justify-center text-center shadow-sm hover:shadow-md transition-shadow">
                                    <p className="text-3xl lg:text-4xl font-bold text-green-600">{stats.visitorsInside}</p>
                                    <p className="text-[10px] lg:text-xs text-muted-foreground font-medium mt-1 leading-tight">Inside Now</p>
                                </div>
                                <div className="rounded-2xl border-2 border-red-500/20 bg-card p-3 lg:p-4 flex flex-col items-center justify-center text-center shadow-sm hover:shadow-md transition-shadow">
                                    <p className="text-3xl lg:text-4xl font-bold text-red-500">{stats.overstayAlerts}</p>
                                    <p className="text-[10px] lg:text-xs text-muted-foreground font-medium mt-1 leading-tight">Overstay</p>
                                </div>
                            </div>

                            <h4 className="text-sm font-semibold text-muted-foreground mb-3 px-1">Details by Type</h4>

                            {/* By Type Row */}
                            <div className="grid grid-cols-4 gap-3 lg:gap-4">
                                <div className="rounded-2xl border bg-card p-3 lg:p-4 flex flex-col items-center justify-center text-center shadow-sm">
                                    <div className="flex items-center justify-center gap-1 mb-1">
                                        <Users size={12} className="text-green-500 lg:w-4 lg:h-4" />
                                        <span className="text-[10px] lg:text-xs font-semibold text-muted-foreground">Guests</span>
                                    </div>
                                    <p className="text-2xl lg:text-3xl font-bold text-foreground">{stats.guests}</p>
                                </div>
                                <div className="rounded-2xl border bg-card p-3 lg:p-4 flex flex-col items-center justify-center text-center shadow-sm">
                                    <div className="flex items-center justify-center gap-1 mb-1">
                                        <Car size={12} className="text-green-500 lg:w-4 lg:h-4" />
                                        <span className="text-[10px] lg:text-xs font-semibold text-muted-foreground">Cabs</span>
                                    </div>
                                    <p className="text-2xl lg:text-3xl font-bold text-foreground">{stats.cabs}</p>
                                </div>
                                <div className="rounded-2xl border bg-card p-3 lg:p-4 flex flex-col items-center justify-center text-center shadow-sm">
                                    <div className="flex items-center justify-center gap-1 mb-1">
                                        <Package size={12} className="text-green-500 lg:w-4 lg:h-4" />
                                        <span className="text-[10px] lg:text-xs font-semibold text-muted-foreground">Delivery</span>
                                    </div>
                                    <p className="text-2xl lg:text-3xl font-bold text-foreground">{stats.delivery}</p>
                                </div>
                                <div className="rounded-2xl border bg-card p-3 lg:p-4 flex flex-col items-center justify-center text-center shadow-sm">
                                    <div className="flex items-center justify-center gap-1 mb-1">
                                        <Truck size={12} className="text-green-500 lg:w-4 lg:h-4" />
                                        <span className="text-[10px] lg:text-xs font-semibold text-muted-foreground">Custom</span>
                                    </div>
                                    <p className="text-2xl lg:text-3xl font-bold text-foreground">{stats.custom}</p>
                                </div>
                            </div>
                        </div>

                        {/* Recent Activity (Below Details by Type) */}
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-green-600 font-bold text-lg lg:text-xl uppercase tracking-wide">Recent Activity</h3>
                                <Link href="/security-visitors" className="text-xs text-green-600 font-medium hover:underline">View All</Link>
                            </div>

                            <div className="space-y-3">
                                {recentVisitors.map((visitor, idx) => (
                                    <div key={idx} className="bg-card border border-border rounded-2xl p-4 flex items-center justify-between shadow-sm">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 bg-muted rounded-full flex items-center justify-center text-muted-foreground text-xs font-bold">
                                                {visitor.avatar ? (
                                                    <img src={visitor.avatar} alt={visitor.name} className="h-full w-full rounded-full object-cover" />
                                                ) : (
                                                    visitor.name.charAt(0)
                                                )}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-sm text-foreground">{visitor.name}</p>
                                                <p className="text-[10px] text-muted-foreground">{visitor.type} • {visitor.status}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs font-medium text-foreground">{visitor.entryTime}</p>
                                            <p className="text-[10px] text-muted-foreground">Entry</p>
                                        </div>
                                    </div>
                                ))}
                                {recentVisitors.length === 0 && (
                                    <div className="text-center py-8 text-muted-foreground text-sm">No recent activity</div>
                                )}
                            </div>
                        </div>

                        {/* Recent Activity End */}

                        {/* Dynamic Bottom Alert (If Inactive) */}
                        {sosAlerts === 0 && <AlertsSection />}

                    </div>
                </div>
            </div>
        </div>
    )
}
