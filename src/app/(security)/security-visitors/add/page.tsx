"use client"

import { useState, useRef } from "react" // Added useRef
import { UserPlus, ChevronLeft, User, Phone, Building2, FileText, Download, CheckCircle2 } from "lucide-react" // Added icons
import Link from "next/link"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { api } from "@/lib/api"
import { toast } from "sonner"
import { toPng } from 'html-to-image'; // Import html-to-image
import { QRCodeSVG } from 'qrcode.react'; // Import QRCode

type GeneratedPassData = {
    visitorName: string
    type?: string
    unitNumber?: string
    requestId?: string
}

// --- Visitor Pass Component ---
const VisitorPass = ({ data, onClose }: { data: GeneratedPassData, onClose: () => void }) => {
    const passRef = useRef<HTMLDivElement>(null)

    const handleDownload = async () => {
        if (passRef.current) {
            try {
                const dataUrl = await toPng(passRef.current, { cacheBust: true, })
                const link = document.createElement('a')
                link.download = `Visitor-Pass-${data.visitorName}.png`
                link.href = dataUrl
                link.click()
                toast.success("Pass downloaded successfully!")
            } catch (err) {
                console.error("Failed to generate pass image", err)
                toast.error("Failed to download pass.")
            }
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden flex flex-col max-h-[90vh]">

                {/* Scrollable Pass Area */}
                <div className="overflow-y-auto p-6 flex-1">
                    <div ref={passRef} className="bg-white text-black p-6 rounded-2xl border-2 border-dashed border-gray-300 shadow-sm relative overflow-hidden">
                        {/* decorative circles */}
                        <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-zinc-900 rounded-full"></div>
                        <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-zinc-900 rounded-full"></div>

                        <div className="text-center space-y-4">
                            <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-2">
                                <CheckCircle2 className="w-8 h-8 text-green-600" />
                            </div>

                            <div>
                                <h3 className="text-xl font-black uppercase tracking-wider text-green-700">Visitor Pass</h3>
                                <p className="text-xs text-gray-500 font-medium">Triumph Connected Living</p>
                            </div>

                            <div className="border-t border-b border-gray-100 py-4 space-y-3">
                                <div className="grid grid-cols-2 gap-2 text-left text-sm">
                                    <div>
                                        <p className="text-[10px] uppercase text-gray-400 font-bold">Visitor Name</p>
                                        <p className="font-bold text-gray-800">{data.visitorName}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] uppercase text-gray-400 font-bold">Type</p>
                                        <p className="font-bold text-gray-800">{data.type || 'Guest'}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] uppercase text-gray-400 font-bold">Unit</p>
                                        <p className="font-bold text-gray-800">{data.unitNumber}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] uppercase text-gray-400 font-bold">Date</p>
                                        <p className="font-bold text-gray-800">{new Date().toLocaleDateString()}</p>
                                    </div>
                                </div>
                            </div>

                            {/* QR Code */}
                            <div className="flex flex-col items-center justify-center gap-2 pt-2">
                                <div className="p-3 bg-white rounded-xl border border-gray-200 shadow-sm">
                                    <QRCodeSVG
                                        value={`VISIT:${data.requestId || 'PENDING'}`}
                                        size={120}
                                        level="H"
                                        includeMargin={true}
                                    />
                                </div>
                                <p className="text-[10px] text-gray-400">Scan at entry gate</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="p-4 bg-gray-50 dark:bg-zinc-800/50 flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 py-3 px-4 rounded-xl font-bold text-sm bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors"
                    >
                        Close
                    </button>
                    <button
                        onClick={handleDownload}
                        className="flex-1 py-3 px-4 rounded-xl font-bold text-sm bg-green-600 text-white hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                    >
                        <Download size={16} />
                        Download
                    </button>
                </div>
            </div>
        </div>
    )
}

export default function AddVisitorPage() {
    const router = useRouter()
    const [formData, setFormData] = useState({
        name: "",
        phone: "",
        unitNumber: "",
        type: "Guest",
        purpose: ""
    })
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [generatedPassData, setGeneratedPassData] = useState<GeneratedPassData | null>(null) // State to show pass

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)

        try {
            const response = await api.security.createWalkIn({
                visitorName: formData.name,
                unitNumber: formData.unitNumber,
                mobileNumber: formData.phone,
                purpose: formData.purpose,
            })
            toast.success(`Visitor ${formData.name} added successfully!`)

            // Show the pass with the Request ID
            setGeneratedPassData({ ...formData, requestId: response.requestId })

        } catch (error) {
            console.error("Failed to add visitor", error)
            toast.error("Failed to add visitor. Please check Unit Number.")
            setIsSubmitting(false) // Only reset if failed
        }
    }

    const visitorTypes = ["Guest", "Delivery", "Cab", "Service", "Other"]

    return (
        <div className="flex flex-col min-h-screen bg-background pb-24 lg:pb-0">
            {/* Show Pass Modal if data exists */}
            {generatedPassData && (
                <VisitorPass
                    data={generatedPassData}
                    onClose={() => router.push("/security-visitors")}
                />
            )}

            {/* Header */}
            <div className="bg-card px-6 py-6 rounded-b-[2rem] border-b border-border shadow-sm sticky top-0 z-20">
                <div className="flex items-center gap-3">
                    <Link href="/security-visitors" className="p-2 -ml-2 hover:bg-accent rounded-full">
                        <ChevronLeft className="h-6 w-6" />
                    </Link>
                    <div className="flex-1">
                        <h1 className="text-2xl font-extrabold text-green-600 tracking-tight">Add Visitor</h1>
                        <p className="text-xs text-muted-foreground font-medium">Register a new visitor entry</p>
                    </div>
                </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Visitor Type Selection */}
                <div className="space-y-3">
                    <label className="text-sm font-bold text-foreground">Visitor Type</label>
                    <div className="flex gap-2 flex-wrap">
                        {visitorTypes.map((type) => (
                            <button
                                key={type}
                                type="button"
                                onClick={() => setFormData({ ...formData, type })}
                                className={cn(
                                    "px-4 py-2 rounded-xl text-sm font-semibold transition-colors",
                                    formData.type === type
                                        ? "bg-green-500 text-white"
                                        : "bg-muted text-muted-foreground hover:bg-accent"
                                )}
                            >
                                {type}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Name Field */}
                <div className="space-y-2">
                    <label className="text-sm font-bold text-foreground">Visitor Name</label>
                    <div className="relative">
                        <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Enter visitor name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                            className="w-full pl-11 pr-4 py-4 bg-muted rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
                        />
                    </div>
                </div>

                {/* Phone Field */}
                <div className="space-y-2">
                    <label className="text-sm font-bold text-foreground">Phone Number</label>
                    <div className="relative">
                        <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <input
                            type="tel"
                            placeholder="Enter phone number"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            required
                            className="w-full pl-11 pr-4 py-4 bg-muted rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
                        />
                    </div>
                </div>

                {/* Unit Number Field */}
                <div className="space-y-2">
                    <label className="text-sm font-bold text-foreground">Visiting Unit Number</label>
                    <div className="relative">
                        <Building2 size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="e.g., A-101"
                            value={formData.unitNumber}
                            onChange={(e) => setFormData({ ...formData, unitNumber: e.target.value })}
                            required
                            className="w-full pl-11 pr-4 py-4 bg-muted rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
                        />
                    </div>
                    <p className="text-xs text-muted-foreground">Please enter the Unit Number (e.g. A-101, B-202).</p>
                </div>

                {/* Purpose Field */}
                <div className="space-y-2">
                    <label className="text-sm font-bold text-foreground">Purpose of Visit</label>
                    <div className="relative">
                        <FileText size={18} className="absolute left-4 top-4 text-muted-foreground" />
                        <textarea
                            placeholder="Brief description of visit purpose"
                            value={formData.purpose}
                            onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                            rows={3}
                            className="w-full pl-11 pr-4 py-4 bg-muted rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 resize-none"
                        />
                    </div>
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-4 bg-green-500 text-white rounded-2xl font-bold text-base flex items-center justify-center gap-2 hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-green-500/20"
                >
                    {isSubmitting ? (
                        <span className="flex items-center gap-2">
                            <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Adding Visitor...
                        </span>
                    ) : (
                        <>
                            <UserPlus size={20} />
                            Add Visitor & Generate Pass
                        </>
                    )}
                </button>
            </form>
        </div>
    )
}
