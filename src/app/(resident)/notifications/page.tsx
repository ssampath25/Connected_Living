"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Loader2, Bell, MessageSquare, Calendar, Shield, CreditCard, Tag } from "lucide-react"
import { api, NotificationItem } from "@/lib/api"
import { cn } from "@/lib/utils"

export default function NotificationsPage() {
    const router = useRouter()
    const [notifications, setNotifications] = useState<NotificationItem[]>([])
    const [loading, setLoading] = useState(true)
    const [loadingAction, setLoadingAction] = useState(false)

    useEffect(() => {
        fetchNotifications()
    }, [])

    const fetchNotifications = async () => {
        try {
            const data = await api.getNotifications()
            setNotifications(data)
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    const handleNotificationClick = async (notification: NotificationItem) => {
        if (!notification.read) {
            handleMarkAsRead(notification.id)
        }

        const delay = !notification.read ? 100 : 0

        setTimeout(() => {
            switch (notification.type) {
                case "payment":
                    router.push("/payments")
                    break
                case "security":
                    router.push("/visitors")
                    break
                case "event":
                case "notice":
                case "offer":
                case "meeting":
                    router.push("/community")
                    break
                default:
                    break
            }
        }, delay)
    }

    const handleMarkAsRead = async (id: number) => {
        if (loadingAction) return
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
        setTimeout(() => {
            setNotifications(prev => prev.filter(n => n.id !== id))
        }, 3000)

        try {
            await api.markNotificationAsRead(id)
        } catch (e) {
            console.error(e)
            fetchNotifications()
        }
    }

    const handleMarkAllRead = async () => {
        setLoadingAction(true)
        setNotifications(prev => prev.map(n => ({ ...n, read: true })))
        setTimeout(() => {
            setNotifications(prev => prev.filter(n => !n.read))
        }, 3000)

        try {
            await api.markAllNotificationsAsRead()
        } catch (e) {
            console.error(e)
            fetchNotifications()
        } finally {
            setLoadingAction(false)
        }
    }

    const getIcon = (type: string) => {
        switch (type) {
            case "payment": return <CreditCard size={20} className="text-red-500" />
            case "event": return <Calendar size={20} className="text-purple-500" />
            case "security": return <Shield size={20} className="text-blue-500" />
            case "notice": return <MessageSquare size={20} className="text-orange-500" />
            case "offer": return <Tag size={20} className="text-green-500" />
            default: return <Bell size={20} className="text-muted-foreground" />
        }
    }

    const getBgColor = (type: string) => {
        switch (type) {
            case "payment": return "bg-red-500/10"
            case "event": return "bg-purple-500/10"
            case "security": return "bg-blue-500/10"
            case "notice": return "bg-orange-500/10"
            case "offer": return "bg-green-500/10"
            default: return "bg-muted"
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    const unreadCount = notifications.filter(n => !n.read).length

    return (
        <div className="min-h-screen bg-background pb-24">
            {/* Header */}
            <div className="bg-card p-4 flex items-center justify-between shadow-sm sticky top-0 z-10 border-b border-border">
                <div className="flex items-center gap-4">
                    <button onClick={() => router.back()} className="p-2 -ml-2 text-primary hover:bg-accent rounded-full transition-colors">
                        <ArrowLeft size={24} />
                    </button>
                    <div>
                        <h1 className="text-xl font-bold text-primary flex items-center gap-2">
                            Notifications
                            {unreadCount > 0 && (
                                <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded-full">{unreadCount}</span>
                            )}
                        </h1>
                    </div>
                </div>

                {unreadCount > 0 && (
                    <button
                        onClick={handleMarkAllRead}
                        disabled={loadingAction}
                        className="text-xs font-bold text-primary hover:text-primary/80 uppercase tracking-wide bg-primary/10 px-3 py-1.5 rounded-full transition-colors disabled:opacity-50"
                    >
                        {loadingAction ? "Updating..." : "Mark all Read"}
                    </button>
                )}
            </div>

            <div className="p-4 space-y-4">
                {notifications.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                        <Bell size={48} className="mx-auto mb-4 opacity-50" />
                        <p>No notifications yet</p>
                    </div>
                ) : (
                    notifications.map((notification) => (
                        <div
                            key={notification.id}
                            onClick={() => handleNotificationClick(notification)}
                            className={cn(
                                "relative p-4 rounded-2xl border transition-all duration-200 flex gap-4 overflow-hidden cursor-pointer",
                                notification.read
                                    ? "bg-card border-border opacity-70"
                                    : "bg-card border-primary/20 shadow-sm transform hover:-translate-y-1"
                            )}
                        >
                            {!notification.read && (
                                <div className="absolute top-4 right-4 h-2 w-2 rounded-full bg-red-500"></div>
                            )}

                            <div className={cn(
                                "h-12 w-12 rounded-xl flex items-center justify-center flex-shrink-0",
                                getBgColor(notification.type)
                            )}>
                                {getIcon(notification.type)}
                            </div>

                            <div className="flex-1 pr-4">
                                <h3 className={cn("font-bold text-foreground leading-tight mb-1", !notification.read && "text-primary")}>
                                    {notification.title}
                                </h3>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    {notification.description}
                                </p>
                                <p className="text-xs text-muted-foreground/60 mt-2 font-medium">
                                    {notification.time}
                                </p>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}
