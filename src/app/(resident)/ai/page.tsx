"use client"

import { useState, useRef, useEffect } from "react"
import { Mic, BrainCircuit, Send, Sparkles, StopCircle, CornerDownLeft, Image as ImageIcon, X } from "lucide-react"
import { cn } from "@/lib/utils"

export default function BrainAIPage() {
    const [isRecording, setIsRecording] = useState(false)
    const [messages, setMessages] = useState<{ role: "ai" | "user", text: string, image?: string }[]>([
        { role: "ai", text: "Hello! I'm Brain, your personal assistant. I can help you book amenities, raise tickets, or answer questions about your community. How can I help you today?" }
    ])
    const [input, setInput] = useState("")
    const [selectedImage, setSelectedImage] = useState<string | null>(null)
    const [isThinking, setIsThinking] = useState(false)
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages, isThinking, selectedImage])

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            const reader = new FileReader()
            reader.onloadend = () => {
                setSelectedImage(reader.result as string)
            }
            reader.readAsDataURL(file)
        }
    }

    const handleSend = async () => {
        if (!input.trim() && !selectedImage) return

        const userMsg = input
        const userImage = selectedImage

        setMessages(prev => [...prev, { role: "user", text: userMsg, image: userImage || undefined }])
        setInput("")
        setSelectedImage(null)
        setIsThinking(true)

        // Mock AI Response
        setTimeout(() => {
            setMessages(prev => [...prev, { role: "ai", text: userImage ? "I see you uploaded an image! In a real version, I would analyze this image of \"" + (userMsg || "this object") + "\"." : "I understand you're asking about \"" + userMsg + "\". Once I'm fully connected to the backend, I'll be able to help with that!" }])
            setIsThinking(false)
        }, 1500)
    }

    const toggleRecording = () => {
        setIsRecording(!isRecording)
        if (!isRecording) {
            // Simulate receiving voice input after recording
            setTimeout(() => {
                if (Math.random() > 0.5) { // Just a random check to simulate stopping
                    // In real app, this would be manual stop or silence detection
                }
            }, 3000)
        }
    }

    return (
        <div className="fixed inset-0 bottom-20 z-0 lg:static lg:z-auto lg:h-[calc(100vh-2rem)] flex flex-col bg-background overflow-hidden">
            {/* Ambient Background with Brain Watermark */}
            <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none opacity-[0.03] dark:opacity-[0.05]">
                <BrainCircuit size={600} className="text-primary" />
            </div>

            {/* Header */}
            <div className="relative z-10 p-4 flex items-center justify-center border-b border-border bg-card/80 backdrop-blur-md">
                <div className="flex items-center gap-2">
                    <div className="h-8 w-8 bg-gradient-to-tr from-violet-600 to-indigo-600 rounded-lg flex items-center justify-center text-white shadow-lg">
                        <BrainCircuit size={18} />
                    </div>
                    <span className="font-bold text-foreground text-lg tracking-tight">Brain AI</span>
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 relative z-10 overflow-y-auto p-4 space-y-6 scrollbar-hide">
                {messages.map((msg, idx) => (
                    <div
                        key={idx}
                        className={cn(
                            "flex max-w-[85%] animate-in slide-in-from-bottom-2 duration-300 flex-col",
                            msg.role === "user" ? "ml-auto items-end" : "mr-auto items-start"
                        )}
                    >
                        {/* Image Bubble */}
                        {msg.image && (
                            <div className={cn(
                                "mb-2 p-1 rounded-2xl shadow-sm overflow-hidden",
                                msg.role === "user" ? "bg-primary rounded-br-none" : "bg-muted"
                            )}>
                                <img src={msg.image} alt="Uploaded" className="max-w-full h-auto rounded-xl max-h-60 object-cover" />
                            </div>
                        )}

                        {/* Text Bubble - only show if there is text */}
                        {msg.text && (
                            <div
                                className={cn(
                                    "p-4 rounded-2xl text-sm leading-relaxed shadow-sm",
                                    msg.role === "user"
                                        ? "bg-primary text-white rounded-tr-none rounded-br-xl"
                                        : "bg-muted text-foreground rounded-tl-none rounded-bl-xl"
                                )}
                            >
                                {msg.text}
                            </div>
                        )}
                    </div>
                ))}

                {isThinking && (
                    <div className="flex justify-start animate-in slide-in-from-bottom-2 duration-300">
                        <div className="bg-muted px-4 py-3 rounded-2xl rounded-bl-none flex items-center gap-2">
                            <BrainCircuit size={16} className="text-violet-500 animate-pulse" />
                            <span className="text-xs font-medium text-muted-foreground">Brain is thinking...</span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input & Record Area */}
            <div className="relative z-20 p-4 bg-background/90 backdrop-blur-sm border-t border-border pb-8 lg:pb-4">
                {/* Image Preview */}
                {selectedImage && (
                    <div className="absolute -top-24 left-4 right-4 bg-card p-3 rounded-xl shadow-lg border border-border animate-in slide-in-from-bottom-5 flex items-start gap-3 z-30">
                        <div className="h-16 w-16 rounded-lg overflow-hidden bg-muted relative group">
                            <img src={selectedImage} className="h-full w-full object-cover" alt="Preview" />
                        </div>
                        <div className="flex-1">
                            <p className="text-xs font-bold text-foreground">Image selected</p>
                            <p className="text-[10px] text-muted-foreground">Ready to send</p>
                        </div>
                        <button
                            onClick={() => setSelectedImage(null)}
                            className="p-1 bg-muted rounded-full text-muted-foreground hover:bg-accent"
                        >
                            <X size={16} />
                        </button>
                    </div>
                )}

                <div className="flex items-end gap-3 max-w-3xl mx-auto">
                    {/* Input Field */}
                    <div className="flex-1 bg-card rounded-[1.5rem] border border-border focus-within:border-primary focus-within:shadow-md transition-all p-1.5 flex items-center">
                        {/* Image Upload Trigger */}
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="p-2 text-muted-foreground hover:text-primary transition-colors hover:bg-primary/10 rounded-full"
                        >
                            <ImageIcon size={20} />
                        </button>
                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            accept="image/*"
                            onChange={handleImageSelect}
                        />

                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleSend()}
                            placeholder={selectedImage ? "Add a caption..." : "Ask me anything..."}
                            className="flex-1 bg-transparent px-2 py-2.5 text-sm focus:outline-none text-foreground placeholder:text-muted-foreground"
                        />
                        <button
                            onClick={handleSend}
                            disabled={!input.trim() && !selectedImage}
                            className={cn(
                                "p-2 rounded-full transition-all",
                                (input.trim() || selectedImage) ? "bg-primary text-white hover:bg-primary/80 shadow-md transform hover:scale-105" : "text-muted-foreground cursor-not-allowed"
                            )}
                        >
                            <Send size={18} className={(input.trim() || selectedImage) ? "translate-x-0.5" : ""} />
                        </button>
                    </div>

                    {/* Audio Record Button */}
                    <button
                        onClick={toggleRecording}
                        className={cn(
                            "h-14 w-14 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 border-4 border-white",
                            isRecording
                                ? "bg-red-500 text-white animate-pulse scale-110 shadow-red-200"
                                : "bg-gradient-to-tr from-violet-600 to-indigo-600 text-white hover:shadow-indigo-200 transform hover:scale-105"
                        )}
                    >
                        {isRecording ? <StopCircle size={28} /> : <Mic size={26} />}
                    </button>
                </div>
                {isRecording && (
                    <p className="text-center text-xs text-red-500 font-medium mt-2 animate-pulse">Recording... Tap to stop</p>
                )}
            </div>
        </div>
    )
}
