"use client"

import { useEffect, useState } from "react"
import { Users, Wrench, Receipt, Dumbbell, AlertTriangle, X } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"
// Import API and Types
import { api, getIconForType, ActivityItem } from "@/lib/api"

interface DashboardStats {
    activeTickets: number
    upcomingBookings: number
    pendingApprovals: number
}

export default function ResidentDashboard() {
    const [activityLog, setActivityLog] = useState<ActivityItem[]>([])
    const [unreadCount, setUnreadCount] = useState(0)
    const [loading, setLoading] = useState(true)
    const [isSOSActive, setIsSOSActive] = useState(false)
    const [user, setUser] = useState<any>(null)
    const [stats, setStats] = useState<DashboardStats>({ activeTickets: 0, upcomingBookings: 0, pendingApprovals: 0 })

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [activities, count, sosStatus, currentUser, dashboardStats] = await Promise.all([
                    api.getActivities(),
                    api.getUnreadCount(),
                    api.getSOSStatus(),
                    api.getCurrentUser(),
                    api.getDashboardStats()
                ])
                setActivityLog(activities)
                setUnreadCount(count)
                setIsSOSActive(sosStatus)
                setUser(currentUser)
                setStats(dashboardStats)
            } catch (error) {
                console.error("Failed to fetch dashboard data", error)
            } finally {
                // Artificial delay to show skeleton for demo
                setTimeout(() => setLoading(false), 800)
            }
        }
        fetchData()

        // Poll for unread count every 5 seconds to keep it in sync with "live" notifications
        const interval = setInterval(async () => {
            const count = await api.getUnreadCount()
            setUnreadCount(count)
            const sos = await api.getSOSStatus()
            setIsSOSActive(sos)
        }, 3000)

        return () => clearInterval(interval)
    }, [])

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
                        <h1 className="text-2xl font-bold text-primary">Connected Living</h1>
                    </div>
                    <div className="hidden lg:block">
                        <h2 className="text-3xl font-bold text-foreground">Dashboard</h2>
                        <p className="text-muted-foreground mt-1">Welcome back to your connected home</p>
                    </div>

                    <div className="flex items-center gap-4">
                        <Link href="/notifications" className="relative group">
                            {/* Notification Bell */}
                            {unreadCount > 0 && (
                                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white animate-in zoom-in">{unreadCount}</span>
                            )}
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary lg:text-muted-foreground group-hover:text-primary transition-colors"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" /></svg>
                        </Link>

                        {/* Avatar Placeholder */}
                        {/* Avatar / Profile */}
                        <Link href="/profile" className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary hover:bg-primary/20 transition-colors overflow-hidden">
                            {user?.avatar ? (
                                <img src={user.avatar} alt="Profile" className="h-full w-full object-cover" />
                            ) : (
                                <span className="font-bold text-sm">{user?.name?.charAt(0) || <Users size={18} />}</span>
                            )}
                        </Link>
                    </div>
                </div>

                <div className="lg:grid lg:grid-cols-12 lg:gap-8">
                    {/* Left Column (Main) */}
                    <div className="lg:col-span-8 space-y-8">
                        {/* Welcome Card */}
                        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-700 to-indigo-600 p-6 text-white shadow-lg lg:p-10 lg:rounded-[2rem]">
                            <div className="relative z-10 flex justify-between items-center">
                                <div>
                                    <h2 className="text-xl lg:text-4xl font-bold mb-2">Welcome Home!</h2>
                                    <p className="opacity-90 text-sm lg:text-xl font-medium">Flat A-101, Tower 1</p>
                                </div>
                                <div className="h-12 w-12 lg:h-20 lg:w-20 bg-white/20 rounded-xl lg:rounded-2xl flex items-center justify-center backdrop-blur-sm">
                                    {/* Building Icon */}
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lg:w-10 lg:h-10"><rect x="4" y="2" width="16" height="20" rx="2" ry="2" /><path d="M9 22v-4h6v4" /><path d="M8 6h.01" /><path d="M16 6h.01" /><path d="M12 6h.01" /><path d="M12 10h.01" /><path d="M12 14h.01" /><path d="M16 10h.01" /><path d="M16 14h.01" /><path d="M8 10h.01" /><path d="M8 14h.01" /></svg>
                                </div>
                            </div>
                            {/* Decorative Circles */}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                            <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/10 rounded-full -ml-16 -mb-16 blur-2xl"></div>
                        </div>

                        {/* Quick Actions */}
                        <div>
                            <h3 className="text-primary font-bold text-lg mb-4 lg:text-xl lg:mb-6">Quick Actions</h3>
                            <div className="grid grid-cols-4 gap-4 px-2 lg:px-0 lg:gap-6">
                                <QuickAction icon={Users} label="Visitors" href="/visitors" />
                                <QuickAction icon={Dumbbell} label="Amenities" href="/amenities" />
                                <QuickAction icon={Receipt} label="Pay Bills" href="/payments" />
                                <QuickAction icon={Wrench} label="Complaints" href="/service-requests" />
                            </div>
                        </div>

                        {/* Dashboard Stats - NEW SECTION */}
                        <div>
                            <h3 className="text-primary font-bold text-lg mb-4 lg:text-xl lg:mb-6 uppercase tracking-wide text-center lg:text-left">Dashboard</h3>
                            <div className="grid grid-cols-3 gap-3 lg:gap-4">
                                <StatCard value={stats.activeTickets} label="Active Tickets" color="green" />
                                <StatCard value={stats.upcomingBookings} label="Upcoming Bookings" color="blue" />
                                <StatCard value={stats.pendingApprovals} label="Pending Approvals" color="red" />
                            </div>
                        </div>

                        {/* Desktop Extra Section */}
                        <div className="hidden lg:block mt-8">
                            <h3 className="text-primary font-bold text-xl mb-6">Hub Highlights</h3>
                            <div className="grid grid-cols-2 gap-6">
                                <div className="bg-orange-500/10 border border-orange-500/20 p-6 rounded-3xl flex flex-col justify-between h-48 hover:shadow-md transition-shadow cursor-pointer group">
                                    <div>
                                        <span className="bg-orange-500/20 text-orange-600 text-xs font-bold px-3 py-1 rounded-full w-fit">Event</span>
                                        <h4 className="font-bold text-lg text-foreground mt-3 group-hover:text-orange-500 transition-colors">Diwali Celebration</h4>
                                        <p className="text-sm text-muted-foreground mt-1">Join us for the grand celebration at the Club House.</p>
                                    </div>
                                    <div className="text-orange-600 font-medium text-sm">Oct 24, 6:00 PM</div>
                                </div>
                                <div className="bg-purple-500/10 border border-purple-500/20 p-6 rounded-3xl flex flex-col justify-between h-48 hover:shadow-md transition-shadow cursor-pointer group">
                                    <div>
                                        <span className="bg-purple-500/20 text-purple-600 text-xs font-bold px-3 py-1 rounded-full w-fit">Notice</span>
                                        <h4 className="font-bold text-lg text-foreground mt-3 group-hover:text-purple-500 transition-colors">Pool Maintenance</h4>
                                        <p className="text-sm text-muted-foreground mt-1">Swimming pool will be closed for maintenance.</p>
                                    </div>
                                    <div className="text-purple-600 font-medium text-sm">Tomorrow</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column (Side Widgets) */}
                    <div className="mt-8 lg:mt-0 lg:col-span-4 space-y-8">
                        {/* SOS Active Card */}
                        {isSOSActive && (
                            <div className="bg-red-500 rounded-3xl p-6 text-white shadow-xl animate-pulse relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-4 opacity-20">
                                    <AlertTriangle size={120} />
                                </div>
                                <div className="relative z-10">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="h-10 w-10 bg-white/20 rounded-full flex items-center justify-center animate-bounce">
                                            <AlertTriangle size={20} />
                                        </div>
                                        <span className="font-bold tracking-wider uppercase text-sm">Emergency Active</span>
                                    </div>
                                    <h3 className="text-2xl font-bold mb-1">Help is on the way!</h3>
                                    <p className="text-white/80 text-sm mb-6">Security has been alerted with your location.</p>

                                    <button
                                        onClick={async () => {
                                            await api.cancelSOS()
                                            setIsSOSActive(false)
                                        }}
                                        className="w-full bg-white text-red-600 font-bold py-3 rounded-xl shadow-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                                    >
                                        <X size={18} />
                                        <span>Cancel Emergency</span>
                                    </button>
                                </div>
                            </div>
                        )}

                        <div>
                            <h3 className="text-primary font-bold text-lg mb-4 lg:text-xl lg:mb-6">Recent Activity</h3>
                            <div className="space-y-4">
                                {loading ? (
                                    <p className="text-sm text-muted-foreground">Loading activity...</p>
                                ) : (
                                    activityLog.map((item) => {
                                        const Icon = getIconForType(item.iconType)
                                        return (
                                            <div key={item.id} className="flex items-center justify-between p-4 rounded-2xl border border-border bg-card shadow-sm hover:shadow-md transition-shadow cursor-default group">
                                                <div className="flex items-center gap-4">
                                                    <div className={cn("h-12 w-12 rounded-xl flex items-center justify-center transition-colors", item.bg, item.iconColor, "group-hover:scale-105")}>
                                                        <Icon size={24} />
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-sm text-foreground group-hover:text-primary transition-colors">{item.title}</p>
                                                        <p className="text-xs text-muted-foreground mt-0.5">{item.subtitle}</p>
                                                    </div>
                                                </div>
                                                <span className="text-xs text-muted-foreground">{item.time}</span>
                                            </div>
                                        )
                                    })
                                )}
                            </div>
                        </div>

                        {/* Extra Widget for Desktop */}
                        <div className="hidden lg:block p-6 rounded-3xl bg-primary/5 border border-primary/10 relative overflow-hidden">
                            <h3 className="font-bold text-primary mb-2 relative z-10">Did you know?</h3>
                            <p className="text-sm text-primary/80 relative z-10">You can now book the tennis court 3 days in advance!</p>
                            <Link href="/amenities" className="inline-block mt-4 text-sm font-bold text-primary hover:text-primary/80 relative z-10">
                                Book Now &rarr;
                            </Link>
                            <div className="absolute -bottom-4 -right-4 text-primary/10">
                                <Dumbbell size={80} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

function QuickAction({ icon: Icon, label, href }: { icon: any, label: string, href: string }) {
    return (
        <Link href={href} className="flex flex-col items-center gap-2 group">
            <div className="w-16 h-16 lg:w-24 lg:h-24 rounded-[1.25rem] lg:rounded-[1.75rem] bg-gradient-to-b from-blue-600 to-indigo-700 flex items-center justify-center shadow-md text-white transition-transform group-hover:scale-105 group-hover:shadow-lg">
                <Icon size={28} className="lg:w-10 lg:h-10" />
            </div>
            <span className="text-xs lg:text-sm font-medium text-muted-foreground group-hover:text-primary transition-colors">{label}</span>
        </Link>
    )
}

// Dashboard Stats Card Component
function StatCard({ value, label, color }: { value: number; label: string; color: "green" | "blue" | "red" }) {
    const colorClasses = {
        green: "border-green-500 text-green-600 dark:text-green-400",
        blue: "border-blue-600 text-blue-600 dark:text-blue-400",
        red: "border-red-500 text-red-600 dark:text-red-400"
    }

    return (
        <div className={cn(
            "rounded-2xl border-2 bg-card p-3 lg:p-4 flex flex-col items-center justify-center text-center shadow-sm hover:shadow-md transition-shadow",
            colorClasses[color]
        )}>
            <span className={cn("text-3xl lg:text-4xl font-bold", colorClasses[color])}>{value}</span>
            <span className="text-[10px] lg:text-xs text-muted-foreground font-medium mt-1 leading-tight">{label}</span>
        </div>
    )
}
