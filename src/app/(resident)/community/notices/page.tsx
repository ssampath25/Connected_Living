"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ChevronLeft, Bell } from "lucide-react"
import { cn } from "@/lib/utils"
import { api, NoticeItem } from "@/lib/api"

export default function CommunityNoticesPage() {
    const router = useRouter()
    const [notices, setNotices] = useState<NoticeItem[]>([])

    useEffect(() => {
        const loadNotices = async () => {
            const data = await api.getNotices()
            setNotices(data)
        }
        loadNotices()
    }, [])

    return (
        <div className="flex flex-col min-h-screen bg-background pb-24 lg:pb-0">
            {/* Header */}
            <div className="bg-card px-6 py-6 rounded-b-[2rem] border-b border-border flex items-center justify-between shadow-sm z-20 sticky top-0 transition-colors">
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => router.push("/community")}
                        className="p-2 -ml-2 mr-2 hover:bg-accent rounded-full text-foreground transition-colors"
                    >
                        <ChevronLeft className="h-6 w-6" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-extrabold text-primary tracking-tight">Announcements</h1>
                        <p className="text-xs text-muted-foreground font-medium mt-0.5">Important updates & notices</p>
                    </div>
                </div>
            </div>

            {/* Notices List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {notices.map((notice) => (
                    <div key={notice.id} className="bg-card rounded-[1.25rem] p-5 shadow-sm border border-border relative overflow-hidden group hover:shadow-md transition-all">
                        {notice.type === "Emergency" && (
                            <div className="absolute top-0 right-0 bg-destructive text-destructive-foreground text-[10px] font-bold px-3 py-1 rounded-bl-xl">
                                IMPORTANT
                            </div>
                        )}
                        <div className="flex items-center gap-3 mb-3">
                            <div className={cn("h-8 w-8 rounded-full flex items-center justify-center", notice.type === "Emergency" ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary")}>
                                <Bell size={14} />
                            </div>
                            <div>
                                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">{notice.type}</p>
                            </div>
                        </div>
                        <h3 className="text-base font-bold text-foreground mb-1">{notice.title}</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed mb-3">{notice.content}</p>
                        <p className="text-[10px] font-bold text-muted-foreground/60">{notice.date}</p>
                    </div>
                ))}
                {notices.length === 0 && (
                    <div className="text-center py-10 text-muted-foreground text-xs">No notices found</div>
                )}
            </div>
        </div>
    )
}
