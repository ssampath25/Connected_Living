"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ChevronLeft, Send, Smile, Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import { api, CommunityMessageItem } from "@/lib/api"

export default function CommunityChatPage() {
    const router = useRouter()
    const [msgInput, setMsgInput] = useState("")
    const [messages, setMessages] = useState<CommunityMessageItem[]>([])
    const messagesEndRef = useRef<HTMLDivElement>(null)

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }

    useEffect(() => {
        const loadMessages = async () => {
            const data = await api.getCommunityMessages()
            setMessages(data)
        }
        loadMessages()
    }, [])

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    const handleSend = async () => {
        if (!msgInput.trim()) return
        const newMsg = await api.sendCommunityMessage(msgInput)
        setMessages(prev => [...prev, newMsg])
        setMsgInput("")
    }

    return (
        <div className="fixed inset-0 flex flex-col bg-background z-40 lg:z-0 lg:relative lg:h-[calc(100vh-2rem)]">
            {/* Header */}
            <div className="bg-card px-6 py-4 flex items-center justify-between shadow-sm z-20 flex-shrink-0 border-b border-border">
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => router.push("/community")}
                        className="p-2 -ml-2 mr-2 hover:bg-accent rounded-full text-foreground transition-colors"
                    >
                        <ChevronLeft className="h-6 w-6" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-extrabold text-primary tracking-tight">General Chat</h1>
                        <div className="flex items-center gap-2 mt-0.5">
                            <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
                            <p className="text-xs text-muted-foreground font-medium">Building A • 45 Online</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Messages List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6 pb-48 lg:pb-24">
                <div className="flex justify-center">
                    <span className="text-[10px] bg-accent text-muted-foreground px-3 py-1 rounded-full font-medium">Today</span>
                </div>

                {messages.map((msg) => {
                    const isMe = msg.role === "me"
                    return (
                        <div key={msg.id} className={cn("flex gap-3 max-w-[85%]", isMe ? "ml-auto flex-row-reverse" : "")}>
                            <div className={cn("h-8 w-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold", msg.color)}>
                                {msg.avatar}
                            </div>
                            <div className={cn("flex flex-col", isMe ? "items-end" : "items-start")}>
                                <div className="flex items-baseline gap-2 mb-1 px-1">
                                    <span className="text-[10px] font-bold text-muted-foreground">{msg.sender}</span>
                                    <span className="text-[10px] text-muted-foreground/60">{msg.time}</span>
                                </div>
                                <div className={cn(
                                    "px-4 py-3 rounded-2xl text-sm shadow-sm",
                                    isMe
                                        ? "bg-primary text-primary-foreground rounded-tr-sm"
                                        : "bg-card text-foreground border border-border rounded-tl-sm"
                                )}>
                                    {msg.text}
                                </div>
                            </div>
                        </div>
                    )
                })}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-card border-t border-border flex items-center gap-3 absolute bottom-0 lg:bottom-0 left-0 right-0 z-30 pb-[calc(1rem+env(safe-area-inset-bottom)+5rem)] lg:pb-4">
                <button className="text-muted-foreground hover:text-primary transition-colors p-2 rounded-full hover:bg-accent flex-shrink-0">
                    <Plus size={20} />
                </button>
                <div className="flex-1 bg-muted/50 rounded-xl flex items-center px-4 border border-border focus-within:border-primary/30 transition-all">
                    <input
                        type="text"
                        value={msgInput}
                        onChange={(e) => setMsgInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSend()}
                        placeholder="Type a message..."
                        className="flex-1 bg-transparent py-2.5 text-sm focus:outline-none text-foreground placeholder:text-muted-foreground"
                    />
                    <button className="text-muted-foreground hover:text-primary flex-shrink-0 ml-2">
                        <Smile size={18} />
                    </button>
                </div>
                <button
                    onClick={handleSend}
                    className={cn(
                        "h-10 w-10 rounded-xl flex items-center justify-center shadow-lg transition-all transform active:scale-95 flex-shrink-0",
                        msgInput.trim() ? "bg-primary text-primary-foreground hover:bg-primary/90" : "bg-muted text-muted-foreground cursor-not-allowed"
                    )}
                >
                    <Send size={18} className={msgInput.trim() ? "ml-0.5" : ""} />
                </button>
            </div>
        </div>
    )
}
