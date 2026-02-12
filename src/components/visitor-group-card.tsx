"use client"

import { useRef, useState } from "react"
import { QRCodeSVG } from "qrcode.react"
import { Download, Share2, X, Users, ChevronDown } from "lucide-react"
import { toPng } from "html-to-image"

interface Visitor {
    name: string
    mobileNumber?: string
}

interface VisitorGroupCardProps {
    visitors: Visitor[]
    visitStart: string
    visitEnd: string
    hostName: string
    unitNumber: string
    communityName?: string
    qrToken: string // The RAW token for the QR code
    onClose?: () => void
}

export function VisitorGroupCard({
    visitors,
    visitStart,
    visitEnd,
    hostName,
    unitNumber,
    communityName = "Triumph Residences",
    qrToken,
    onClose,
}: VisitorGroupCardProps) {
    const cardRef = useRef<HTMLDivElement>(null)
    const [downloading, setDownloading] = useState(false)
    const [showShareMenu, setShowShareMenu] = useState(false)
    const [shareToast, setShareToast] = useState<string | null>(null)
    const [expanded, setExpanded] = useState(false)

    // Helper to format dates
    const formatDate = (dateStr: string) => {
        try {
            return new Date(dateStr).toLocaleDateString("en-GB", {
                day: "2-digit", month: "short", year: "numeric",
                hour: "2-digit", minute: "2-digit"
            })
        } catch { return dateStr }
    }

    const formattedStart = formatDate(visitStart)
    const formattedEnd = formatDate(visitEnd)
    const isExpired = new Date(visitEnd) < new Date()

    const handleDownload = async () => {
        if (!cardRef.current) return
        setDownloading(true)
        try {
            const dataUrl = await toPng(cardRef.current, { pixelRatio: 3, cacheBust: true, skipFonts: true })
            const link = document.createElement("a")
            link.download = `Visitor_Pass_${visitors[0]?.name.replace(/\s+/g, "_")}.png`
            link.href = dataUrl
            link.click()
        } catch (e) {
            console.error("Download failed:", e)
        }
        setDownloading(false)
    }

    const getShareLink = () => `${typeof window !== "undefined" ? window.location.origin : ""}/pass/group/${encodeURIComponent(qrToken)}`
    const getQrValue = () => qrToken

    const handleShare = async () => {
        const shareUrl = getShareLink()
        const shareText = `Visitor Pass for ${visitors[0]?.name}\nView & download the ID card:`

        if (navigator.share) {
            try {
                await navigator.share({
                    title: `Visitor Pass - ${visitors[0]?.name}`,
                    text: shareText,
                    url: shareUrl,
                })
                return
            } catch { } // Fallback
        }
        setShowShareMenu(true)
    }

    const shareViaWhatsApp = () => {
        const shareUrl = getShareLink()
        const text = encodeURIComponent(`*Visitor Entry Pass*\n👤 Guest: ${visitors[0]?.name}\n📅 Valid: ${formattedStart} - ${formattedEnd}\n\n🔗 View Pass:\n${shareUrl}`)
        window.open(`https://wa.me/?text=${text}`, "_blank")
        setShowShareMenu(false)
    }

    const shareViaEmail = () => {
        const shareUrl = getShareLink()
        const subject = encodeURIComponent(`Visitor Entry Pass - ${visitors[0]?.name}`)
        const body = encodeURIComponent(`Visitor Entry Pass\n\nGuest: ${visitors[0]?.name}\nHost: ${hostName} (${unitNumber})\nValid: ${formattedStart} to ${formattedEnd}\n\nView Pass:\n${shareUrl}`)
        window.location.href = `mailto:?subject=${subject}&body=${body}`
        setShowShareMenu(false)
    }

    const copyLink = async () => {
        const shareUrl = getShareLink()
        try {
            await navigator.clipboard.writeText(shareUrl)
            setShowShareMenu(false)
            setShareToast("✅ Link copied! Share it with your guest.")
            setTimeout(() => setShareToast(null), 3000)
        } catch {
            setShareToast("Could not copy link")
            setTimeout(() => setShareToast(null), 3000)
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
            <div className="relative w-full max-w-sm animate-in zoom-in-95 duration-200">
                {/* Actions Bar */}
                <div className="flex items-center justify-end gap-3 mb-4">
                    <button
                        onClick={handleShare}
                        className="h-10 px-4 rounded-full bg-white/10 hover:bg-white/20 text-white text-sm font-medium backdrop-blur-md flex items-center gap-2 transition-all"
                    >
                        <Share2 size={16} />
                        Share
                    </button>
                    {onClose && (
                        <button
                            onClick={onClose}
                            className="h-10 w-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center backdrop-blur-md transition-all"
                        >
                            <X size={20} />
                        </button>
                    )}
                </div>

                {/* The Card */}
                <div
                    ref={cardRef}
                    className={`bg-white rounded-[24px] overflow-hidden shadow-2xl ${isExpired ? 'opacity-60 grayscale' : ''}`}
                >
                    {/* Header */}
                    <div className="bg-[#1e3a5f] p-6 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-2">
                                <div className="h-8 px-3 rounded-full bg-white/20 backdrop-blur-md flex items-center gap-2 border border-white/10">
                                    <span className="text-[10px] uppercase tracking-wider font-bold text-white">Visitor Pass</span>
                                </div>
                                <div className="text-right">
                                    <p className="text-white/60 text-[10px] uppercase tracking-wider font-semibold">Community</p>
                                    <p className="text-white text-xs font-bold">{communityName}</p>
                                </div>
                            </div>
                            <h2 className="text-3xl font-black text-white tracking-tight mt-4">
                                {visitors.length > 0 ? visitors[0].name : "Guest"}
                            </h2>
                            {visitors.length > 1 && (
                                <p className="text-white/70 text-sm mt-1 font-medium">
                                    + {visitors.length - 1} others
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Body */}
                    <div className="p-6 space-y-6">
                        {/* Host Info */}
                        <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                            <div className="h-10 w-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                                <Users size={20} />
                            </div>
                            <div>
                                <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Visiting Host</p>
                                <p className="text-slate-900 font-bold text-sm">{hostName}</p>
                            </div>
                        </div>

                        {/* Guest List (Collapsible) */}
                        {visitors.length > 1 && (
                            <div className="rounded-2xl bg-slate-50 border border-slate-100 overflow-hidden transition-all">
                                <button
                                    onClick={() => setExpanded(!expanded)}
                                    className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-100/50 transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
                                            <Users size={20} />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Total Guests</p>
                                                <span className="bg-orange-100 text-orange-700 text-[10px] font-bold px-1.5 py-0.5 rounded-full">{visitors.length}</span>
                                            </div>
                                            <p className="text-slate-900 font-bold text-sm">View Full Guest List</p>
                                        </div>
                                    </div>
                                    <ChevronDown size={20} className={`text-slate-400 transition-transform duration-300 ${expanded ? 'rotate-180' : ''}`} />
                                </button>

                                <div className={`px-4 border-t border-slate-100 bg-white transition-all duration-300 ease-in-out ${expanded ? 'max-h-60 opacity-100 py-3 overflow-y-auto' : 'max-h-0 opacity-0 py-0 overflow-hidden'}`}>
                                    <ul className="space-y-2">
                                        {visitors.map((v, i) => (
                                            <li key={i} className="flex items-center justify-between text-sm p-2 rounded-lg hover:bg-slate-50">
                                                <div className="flex items-center gap-3">
                                                    <span className="h-6 w-6 rounded-full bg-slate-100 text-slate-500 text-xs flex items-center justify-center font-bold">{i + 1}</span>
                                                    <span className="font-semibold text-slate-700">{v.name}</span>
                                                </div>
                                                {v.mobileNumber && <span className="text-slate-400 text-xs font-mono">{v.mobileNumber}</span>}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        )}

                        {/* Validity */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between text-xs">
                                <span className="font-semibold text-slate-400 uppercase tracking-wider">Valid From</span>
                                <span className="font-bold text-slate-700">{formattedStart}</span>
                            </div>
                            <div className="h-px bg-slate-100" />
                            <div className="flex items-center justify-between text-xs">
                                <span className="font-semibold text-slate-400 uppercase tracking-wider">Valid Until</span>
                                <span className="font-bold text-slate-900">{formattedEnd}</span>
                            </div>
                        </div>

                        {/* QR Code */}
                        <div className="flex justify-center py-2">
                            <div className="p-3 bg-white border border-slate-100 rounded-2xl shadow-sm">
                                <QRCodeSVG
                                    value={getQrValue()} // Scan uses raw token (backend validates hash)
                                    size={160}
                                    level="M"
                                    includeMargin
                                />
                            </div>
                        </div>
                        <p className="text-center text-[10px] text-slate-400 font-medium">
                            Scan at security gate for entry
                        </p>
                    </div>
                </div>

                {/* Download Button */}
                <button
                    onClick={handleDownload}
                    disabled={downloading}
                    className="w-full mt-6 h-12 bg-white text-slate-900 rounded-xl font-bold text-sm shadow-lg flex items-center justify-center gap-2 hover:bg-slate-50 transition-colors disabled:opacity-50"
                >
                    <Download size={18} />
                    {downloading ? "Saving Image..." : "Download Pass"}
                </button>
            </div>

            {/* Share Menu */}
            {showShareMenu && (
                <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/40 p-4" onClick={() => setShowShareMenu(false)}>
                    <div className="w-full max-w-sm bg-white rounded-2xl overflow-hidden shadow-2xl animate-in slide-in-from-bottom-4 duration-200" onClick={e => e.stopPropagation()}>
                        <div className="p-4 border-b border-slate-100 text-center font-bold text-slate-800">Share Pass</div>
                        <div className="p-3 space-y-1">
                            <button onClick={shareViaWhatsApp} className="w-full p-3 rounded-xl hover:bg-slate-50 flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-green-500 text-white flex items-center justify-center font-bold">W</div>
                                <div className="text-left"><p className="font-semibold text-sm">WhatsApp</p><p className="text-xs text-slate-400">Share link</p></div>
                            </button>
                            <button onClick={shareViaEmail} className="w-full p-3 rounded-xl hover:bg-slate-50 flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold">@</div>
                                <div className="text-left"><p className="font-semibold text-sm">Email</p><p className="text-xs text-slate-400">Share link</p></div>
                            </button>
                            <button onClick={copyLink} className="w-full p-3 rounded-xl hover:bg-slate-50 flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-purple-500 text-white flex items-center justify-center font-bold">🔗</div>
                                <div className="text-left"><p className="font-semibold text-sm">Copy Link</p><p className="text-xs text-slate-400">Copy URL to clipboard</p></div>
                            </button>
                        </div>
                        <button onClick={() => setShowShareMenu(false)} className="w-full p-3 text-sm font-semibold text-slate-400 border-t border-slate-100">Cancel</button>
                    </div>
                </div>
            )}

            {/* Toast */}
            {shareToast && (
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[70] bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-xl animate-in fade-in slide-in-from-bottom-2">
                    {shareToast}
                </div>
            )}
        </div>
    )
}
