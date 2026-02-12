"use client"

/* eslint-disable @next/next/no-img-element */

import { useRef, useState, useEffect } from "react"
import { QRCodeSVG } from "qrcode.react"
import { Download, Share2, X } from "lucide-react"
import { toPng } from "html-to-image"

interface StaffIdCardProps {
    staffName: string
    role: string
    photoUrl: string
    staffId: string
    qrCodeId: string
    validThru: string
    scheduleType: string
    communityName?: string
    onClose?: () => void
}

export function StaffIdCard({
    staffName,
    role,
    photoUrl,
    staffId,
    qrCodeId,
    validThru,
    scheduleType,
    communityName = "Triumph Residences",
    onClose,
}: StaffIdCardProps) {
    const cardRef = useRef<HTMLDivElement>(null)
    const [downloading, setDownloading] = useState(false)
    const [resolvedPhoto, setResolvedPhoto] = useState<string | null>(null)
    const [showShareMenu, setShowShareMenu] = useState(false)
    const [shareToast, setShareToast] = useState<string | null>(null)

    // Convert any photo URL to a reliable data URL on mount
    useEffect(() => {
        if (!photoUrl) return

        // Already a data URL — use directly
        if (photoUrl.startsWith("data:")) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setResolvedPhoto(photoUrl)
            return
        }

        // For blob: or http: URLs, try to fetch and convert to data URL
        const img = new Image()
        img.crossOrigin = "anonymous"
        img.onload = () => {
            try {
                const canvas = document.createElement("canvas")
                canvas.width = img.naturalWidth
                canvas.height = img.naturalHeight
                const ctx = canvas.getContext("2d")
                ctx?.drawImage(img, 0, 0)
                 
                setResolvedPhoto(canvas.toDataURL("image/png"))
            } catch {
                 
                setResolvedPhoto(null)
            }
        }
        img.onerror = () => {
             
            setResolvedPhoto(null)
        }
        img.src = photoUrl
    }, [photoUrl])

    const captureCard = async (): Promise<string | null> => {
        if (!cardRef.current) return null
        try {
            return await toPng(cardRef.current, {
                pixelRatio: 3,
                cacheBust: true,
                skipFonts: true,
                filter: (node: HTMLElement) => {
                    if (node.tagName === "IMG") {
                        const src = node.getAttribute("src") || ""
                        if (src.startsWith("blob:")) return false
                    }
                    return true
                },
            })
        } catch (e) {
            console.error("Capture failed:", e)
            return null
        }
    }

    const handleDownload = async () => {
        setDownloading(true)
        const dataUrl = await captureCard()
        if (dataUrl) {
            const link = document.createElement("a")
            link.download = `${staffName.replace(/\s+/g, "_")}_ID_Card.png`
            link.href = dataUrl
            link.click()
        }
        setDownloading(false)
    }

    const getShareLink = () => `${window.location.origin}/pass/${qrCodeId}`

    const handleShare = async () => {
        const shareUrl = getShareLink()
        const shareText = `${staffName} - Staff Entry Pass\nView & download the ID card:`

        // Try native share first (mobile)
        if (navigator.share) {
            try {
                await navigator.share({
                    title: `${staffName} - Staff ID Card`,
                    text: shareText,
                    url: shareUrl,
                })
                return
            } catch {
                // User cancelled or share failed — fall through to menu
            }
        }

        // Desktop fallback — show share options menu
        setShowShareMenu(true)
    }

    const shareViaWhatsApp = () => {
        const shareUrl = getShareLink()
        const text = encodeURIComponent(`*${staffName} - Staff Entry Pass*\n📋 Schedule: ${scheduleType}\n📅 Valid Thru: ${formattedDate}\n\n🔗 View & Download ID Card:\n${shareUrl}`)
        window.open(`https://wa.me/?text=${text}`, "_blank")
        setShowShareMenu(false)
    }

    const shareViaEmail = () => {
        const shareUrl = getShareLink()
        const subject = encodeURIComponent(`${staffName} - Staff Entry Pass`)
        const body = encodeURIComponent(`Staff Entry Pass\n\nName: ${staffName}\nRole: ${role}\nSchedule: ${scheduleType}\nStaff ID: ${displayId}\nValid Thru: ${formattedDate}\n\nView & Download ID Card:\n${shareUrl}`)
        window.location.href = `mailto:?subject=${subject}&body=${body}`
        setShowShareMenu(false)
    }

    const copyLink = async () => {
        const shareUrl = getShareLink()
        try {
            await navigator.clipboard.writeText(shareUrl)
            setShowShareMenu(false)
            setShareToast("✅ Link copied to clipboard!")
            setTimeout(() => setShareToast(null), 3000)
        } catch {
            setShowShareMenu(false)
            setShareToast("Could not copy link")
            setTimeout(() => setShareToast(null), 3000)
        }
    }

    const displayId = staffId.slice(-8).toUpperCase()
    const formattedDate = validThru
        ? new Date(validThru).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
        : "—"

    // Render photo or fallback initial
    const renderPhoto = () => {
        if (resolvedPhoto) {
            return <img src={resolvedPhoto} alt={staffName} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        }
        return (
            <div style={{
                width: "100%", height: "100%", display: "flex", alignItems: "center",
                justifyContent: "center", color: "#94a3b8", fontSize: "30px", fontWeight: 700,
                backgroundColor: "#f1f5f9"
            }}>
                {staffName?.[0]?.toUpperCase() || "?"}
            </div>
        )
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="w-full max-w-sm space-y-4">
                {/* The Card */}
                <div
                    ref={cardRef}
                    className="rounded-2xl overflow-hidden shadow-2xl"
                    style={{ background: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)" }}
                >
                    {/* Header Banner */}
                    <div
                        style={{ background: "linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%)", padding: "16px 20px", display: "flex", alignItems: "center", gap: "12px" }}
                    >
                        <div
                            style={{ height: "40px", width: "40px", borderRadius: "12px", backgroundColor: "rgba(255,255,255,0.2)", color: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: "18px" }}
                        >
                            T
                        </div>
                        <div>
                            <h2 style={{ color: "#ffffff", fontWeight: 700, fontSize: "16px", letterSpacing: "0.05em", margin: 0 }}>{communityName}</h2>
                            <p style={{ color: "#93c5fd", fontSize: "10px", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.1em", margin: 0 }}>Staff Entry Pass</p>
                        </div>
                    </div>

                    {/* Body */}
                    <div style={{ padding: "20px" }}>
                        <div style={{ display: "flex", gap: "16px" }}>
                            {/* Photo */}
                            <div style={{
                                width: "96px", height: "112px", borderRadius: "12px", overflow: "hidden",
                                backgroundColor: "#e2e8f0", flexShrink: 0, border: "2px solid #ffffff",
                                boxShadow: "0 4px 6px rgba(0,0,0,0.1)"
                            }}>
                                {renderPhoto()}
                            </div>

                            {/* Details */}
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <h3 style={{
                                    fontSize: "20px", fontWeight: 900, color: "#1e293b",
                                    lineHeight: 1.2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", margin: 0
                                }}>
                                    {staffName.toUpperCase()}
                                </h3>
                                <p style={{ color: "#d97706", fontWeight: 700, fontSize: "14px", marginTop: "2px", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 0 }}>
                                    {role}
                                </p>

                                <div style={{ marginTop: "12px" }}>
                                    <div>
                                        <p style={{ fontSize: "10px", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.1em", margin: 0 }}>Staff ID</p>
                                        <p style={{ fontSize: "14px", fontWeight: 700, color: "#334155", fontFamily: "monospace", margin: 0 }}>{displayId}</p>
                                    </div>
                                    <div style={{ marginTop: "4px" }}>
                                        <p style={{ fontSize: "10px", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.1em", margin: 0 }}>Schedule</p>
                                        <p style={{ fontSize: "14px", fontWeight: 700, color: "#334155", margin: 0 }}>{scheduleType}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer: Valid Thru + QR */}
                        <div style={{
                            display: "flex", alignItems: "flex-end", justifyContent: "space-between",
                            marginTop: "16px", paddingTop: "12px", borderTop: "1px solid #e2e8f0"
                        }}>
                            <div>
                                <p style={{ fontSize: "10px", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.1em", margin: 0 }}>Valid Thru</p>
                                <p style={{ fontSize: "14px", fontWeight: 700, color: "#334155", margin: 0 }}>{formattedDate}</p>
                            </div>
                            <div style={{
                                backgroundColor: "#ffffff", padding: "8px", borderRadius: "12px",
                                boxShadow: "0 1px 3px rgba(0,0,0,0.05)", border: "1px solid #f1f5f9"
                            }}>
                                <QRCodeSVG
                                    value={`${typeof window !== "undefined" ? window.location.origin : ""}/pass/${qrCodeId}`}
                                    size={64}
                                    level="M"
                                    bgColor="transparent"
                                    fgColor="#1e293b"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                    <button
                        onClick={handleDownload}
                        disabled={downloading}
                        className="flex-1 h-12 bg-white text-slate-800 rounded-xl font-bold text-sm shadow-lg flex items-center justify-center gap-2 active:scale-[0.97] transition-all disabled:opacity-50"
                    >
                        <Download size={18} />
                        {downloading ? "Saving..." : "Download"}
                    </button>
                    <button
                        onClick={handleShare}
                        className="flex-1 h-12 bg-blue-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 active:scale-[0.97] transition-all"
                    >
                        <Share2 size={18} />
                        Share
                    </button>
                </div>

                {/* Close */}
                {onClose && (
                    <button
                        onClick={onClose}
                        className="w-full h-10 text-white/70 hover:text-white text-sm font-medium flex items-center justify-center gap-1 transition-colors"
                    >
                        <X size={16} />
                        Close
                    </button>
                )}
            </div>

            {/* Share Options Menu (Desktop fallback) */}
            {showShareMenu && (
                <div
                    className="fixed inset-0 z-[60] flex items-end justify-center bg-black/40 p-4"
                    onClick={() => setShowShareMenu(false)}
                >
                    <div
                        className="w-full max-w-sm bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-2xl animate-in slide-in-from-bottom-4 duration-200"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-4 border-b border-slate-100 dark:border-slate-700">
                            <h3 className="font-bold text-slate-800 dark:text-white text-center">Share ID Card</h3>
                        </div>
                        <div className="p-3 space-y-1">
                            <button
                                onClick={shareViaWhatsApp}
                                className="w-full p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-3 transition-colors"
                            >
                                <div className="h-10 w-10 rounded-full bg-green-500 flex items-center justify-center text-white font-bold text-lg">W</div>
                                <div className="text-left">
                                    <p className="font-semibold text-sm text-slate-800 dark:text-white">WhatsApp</p>
                                    <p className="text-xs text-slate-400">Share link via WhatsApp</p>
                                </div>
                            </button>
                            <button
                                onClick={shareViaEmail}
                                className="w-full p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-3 transition-colors"
                            >
                                <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-lg">@</div>
                                <div className="text-left">
                                    <p className="font-semibold text-sm text-slate-800 dark:text-white">Email</p>
                                    <p className="text-xs text-slate-400">Share link via email</p>
                                </div>
                            </button>
                            <button
                                onClick={copyLink}
                                className="w-full p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-3 transition-colors"
                            >
                                <div className="h-10 w-10 rounded-full bg-purple-500 flex items-center justify-center text-white font-bold text-lg">🔗</div>
                                <div className="text-left">
                                    <p className="font-semibold text-sm text-slate-800 dark:text-white">Copy Link</p>
                                    <p className="text-xs text-slate-400">Copy shareable link to clipboard</p>
                                </div>
                            </button>
                        </div>
                        <button
                            onClick={() => setShowShareMenu(false)}
                            className="w-full p-3 text-sm font-semibold text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 border-t border-slate-100 dark:border-slate-700 transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {/* Toast Notification */}
            {shareToast && (
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[70] bg-slate-800 text-white px-5 py-3 rounded-xl shadow-2xl text-sm font-medium animate-in slide-in-from-bottom-4 fade-in duration-300 max-w-xs text-center">
                    {shareToast}
                </div>
            )}
        </div>
    )
}
