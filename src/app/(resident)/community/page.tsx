"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { MessageSquare, Calendar, Users, Megaphone } from "lucide-react"
import { api, NoticeItem } from "@/lib/api"

export default function CommunityPage() {
    const router = useRouter()
    const [notices, setNotices] = useState<NoticeItem[]>([])

    useEffect(() => {
        const loadData = async () => {
            const noteItems = await api.getNotices()
            setNotices(noteItems)
        }
        loadData()
    }, [])

    return (
        <div className="flex flex-col h-screen bg-background pb-24 lg:pb-0">
            {/* Header */}
            <div className="bg-card px-6 py-6 rounded-b-[2rem] border-b border-border flex items-center justify-between shadow-sm z-20">
                <div className="flex items-center gap-1">
                    <div>
                        <h1 className="text-2xl font-extrabold text-primary tracking-tight">Community Hub</h1>
                        <div className="flex items-center gap-2 mt-0.5">
                            <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
                            <p className="text-xs text-muted-foreground font-medium">Building A • 45 Online</p>
                        </div>
                    </div>
                </div>

                <div className="h-10 w-10 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                    <Users size={20} />
                </div>
            </div>

            {/* Content Area - Landing Menu */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 animate-in slide-in-from-left duration-300">
                {/* General Chat Card */}
                <button
                    onClick={() => router.push("/community/chat")}
                    className="w-full bg-card py-10 px-6 rounded-xl shadow-sm border border-border flex items-center gap-5 hover:shadow-md transition-all group"
                >
                    <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                        <MessageSquare size={28} />
                    </div>
                    <div className="text-left flex-1">
                        <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">General Chat</h3>
                        <p className="text-xs text-muted-foreground mt-1">Join the conversation with neighbors</p>
                    </div>
                    <div className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                        3 New
                    </div>
                </button>

                {/* Announcements Card */}
                <button
                    onClick={() => router.push("/community/notices")}
                    className="w-full bg-card py-10 px-6 rounded-xl shadow-sm border border-border flex items-center gap-5 hover:shadow-md transition-all group"
                >
                    <div className="h-14 w-14 rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-500 group-hover:bg-orange-500 group-hover:text-white transition-colors duration-300">
                        <Megaphone size={28} />
                    </div>
                    <div className="text-left flex-1">
                        <h3 className="text-lg font-bold text-foreground group-hover:text-orange-600 transition-colors">Announcements</h3>
                        <p className="text-xs text-muted-foreground mt-1">Important updates & notices</p>
                    </div>
                    {notices.some(n => n.type === 'Emergency') && (
                        <div className="h-3 w-3 bg-red-500 rounded-full animate-pulse" />
                    )}
                </button>

                {/* Events Card */}
                <button
                    onClick={() => router.push("/community/events")}
                    className="w-full bg-card py-10 px-6 rounded-xl shadow-sm border border-border flex items-center gap-5 hover:shadow-md transition-all group"
                >
                    <div className="h-14 w-14 rounded-2xl bg-pink-500/10 flex items-center justify-center text-pink-500 group-hover:bg-pink-500 group-hover:text-white transition-colors duration-300">
                        <Calendar size={28} />
                    </div>
                    <div className="text-left flex-1">
                        <h3 className="text-lg font-bold text-foreground group-hover:text-pink-600 transition-colors">Events</h3>
                        <p className="text-xs text-muted-foreground mt-1">Upcoming activities & workshops</p>
                    </div>
                </button>
            </div>
        </div>
    )
}
