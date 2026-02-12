"use client"

/* eslint-disable @next/next/no-img-element */

import { useEffect, useState, useRef } from "react"
import { QRCodeSVG } from "qrcode.react"
import { Download, ShieldAlert, ShieldCheck } from "lucide-react"
import { toPng } from "html-to-image"

interface StaffPass {
    id: string
    name: string
    photoUrl: string
    scheduleType: string
    validFrom: string
    validTo: string
    qrCodeId: string
    status: string
    communityName: string
}

export default function PublicPassPage({ params }: { params: Promise<{ qrCodeId: string }> }) {
    const [pass, setPass] = useState<StaffPass | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [downloading, setDownloading] = useState(false)
    const cardRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        params.then(({ qrCodeId }) => {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api/v1"
            fetch(`${apiUrl}/visitors/recurring/pass/${qrCodeId}`)
                .then(res => {
                    if (!res.ok) throw new Error("Pass not found")
                    return res.json()
                })
                .then(data => {
                    setPass(data)
                    setLoading(false)
                })
                .catch(() => {
                    setError("This pass could not be found or has been removed.")
                    setLoading(false)
                })
        })
    }, [params])

    const isExpired = pass ? (pass.status !== "ACTIVE" || new Date(pass.validTo) < new Date()) : false

    const handleDownload = async () => {
        if (!cardRef.current) return
        setDownloading(true)
        try {
            const dataUrl = await toPng(cardRef.current, { pixelRatio: 3, cacheBust: true, skipFonts: true })
            const link = document.createElement("a")
            link.download = `${pass?.name.replace(/\s+/g, "_")}_ID_Card.png`
            link.href = dataUrl
            link.click()
        } catch (e) {
            console.error("Download failed:", e)
        }
        setDownloading(false)
    }

    const displayId = pass?.id?.slice(-8).toUpperCase() || ""
    const formattedValidFrom = pass?.validFrom
        ? new Date(pass.validFrom).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
        : "—"
    const formattedValidTo = pass?.validTo
        ? new Date(pass.validTo).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
        : "—"

    if (loading) {
        return (
            <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f1f5f9" }}>
                <div style={{ textAlign: "center" }}>
                    <div style={{ width: 40, height: 40, border: "4px solid #e2e8f0", borderTopColor: "#2563eb", borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto" }} />
                    <p style={{ marginTop: 16, color: "#64748b", fontSize: 14 }}>Loading pass...</p>
                    <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
                </div>
            </div>
        )
    }

    if (error || !pass) {
        return (
            <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f1f5f9", padding: 24 }}>
                <div style={{ textAlign: "center", maxWidth: 360 }}>
                    <ShieldAlert size={48} style={{ color: "#ef4444", margin: "0 auto 16px" }} />
                    <h1 style={{ fontSize: 20, fontWeight: 800, color: "#1e293b", marginBottom: 8 }}>Pass Not Found</h1>
                    <p style={{ color: "#64748b", fontSize: 14 }}>{error || "This pass does not exist."}</p>
                </div>
            </div>
        )
    }

    return (
        <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24 }}>
            {/* Status Banner */}
            {isExpired && (
                <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 12, padding: "12px 20px", marginBottom: 16, maxWidth: 384, width: "100%", display: "flex", alignItems: "center", gap: 10 }}>
                    <ShieldAlert size={20} style={{ color: "#ef4444", flexShrink: 0 }} />
                    <p style={{ fontSize: 13, fontWeight: 600, color: "#dc2626", margin: 0 }}>This pass has expired or been revoked</p>
                </div>
            )}

            {!isExpired && (
                <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 12, padding: "12px 20px", marginBottom: 16, maxWidth: 384, width: "100%", display: "flex", alignItems: "center", gap: 10 }}>
                    <ShieldCheck size={20} style={{ color: "#16a34a", flexShrink: 0 }} />
                    <p style={{ fontSize: 13, fontWeight: 600, color: "#16a34a", margin: 0 }}>Active Staff Entry Pass</p>
                </div>
            )}

            {/* The Card */}
            <div
                ref={cardRef}
                style={{
                    maxWidth: 384, width: "100%", borderRadius: 16, overflow: "hidden",
                    boxShadow: "0 25px 50px -12px rgba(0,0,0,0.15)",
                    background: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
                    opacity: isExpired ? 0.6 : 1,
                }}
            >
                {/* Header */}
                <div style={{ background: "linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%)", padding: "16px 20px", display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ height: 40, width: 40, borderRadius: 12, backgroundColor: "rgba(255,255,255,0.2)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 18 }}>
                        {pass.communityName?.[0] || "C"}
                    </div>
                    <div>
                        <h2 style={{ color: "#fff", fontWeight: 700, fontSize: 16, letterSpacing: "0.05em", margin: 0 }}>{pass.communityName}</h2>
                        <p style={{ color: "#93c5fd", fontSize: 10, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.1em", margin: 0 }}>Staff Entry Pass</p>
                    </div>
                </div>

                {/* Body */}
                <div style={{ padding: 20 }}>
                    <div style={{ display: "flex", gap: 16 }}>
                        {/* Photo */}
                        <div style={{ width: 96, height: 112, borderRadius: 12, overflow: "hidden", backgroundColor: "#e2e8f0", flexShrink: 0, border: "2px solid #fff", boxShadow: "0 4px 6px rgba(0,0,0,0.1)" }}>
                            {pass.photoUrl && pass.photoUrl.startsWith("http") ? (
                                <img src={pass.photoUrl} alt={pass.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                            ) : (
                                <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#94a3b8", fontSize: 30, fontWeight: 700, backgroundColor: "#f1f5f9" }}>
                                    {pass.name?.[0]?.toUpperCase() || "?"}
                                </div>
                            )}
                        </div>

                        {/* Details */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <h3 style={{ fontSize: 20, fontWeight: 900, color: "#1e293b", lineHeight: 1.2, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                {pass.name.toUpperCase()}
                            </h3>
                            <p style={{ color: "#d97706", fontWeight: 700, fontSize: 14, marginTop: 2, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 0 }}>
                                STAFF
                            </p>

                            <div style={{ marginTop: 12 }}>
                                <div>
                                    <p style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.1em", margin: 0 }}>Staff ID</p>
                                    <p style={{ fontSize: 14, fontWeight: 700, color: "#334155", fontFamily: "monospace", margin: 0 }}>{displayId}</p>
                                </div>
                                <div style={{ marginTop: 4 }}>
                                    <p style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.1em", margin: 0 }}>Schedule</p>
                                    <p style={{ fontSize: 14, fontWeight: 700, color: "#334155", margin: 0 }}>{pass.scheduleType}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer: Validity + QR */}
                    <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginTop: 16, paddingTop: 12, borderTop: "1px solid #e2e8f0" }}>
                        <div>
                            <p style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.1em", margin: 0 }}>Valid</p>
                            <p style={{ fontSize: 13, fontWeight: 700, color: "#334155", margin: 0 }}>{formattedValidFrom} — {formattedValidTo}</p>
                        </div>
                        <div style={{ backgroundColor: "#fff", padding: 8, borderRadius: 12, boxShadow: "0 1px 3px rgba(0,0,0,0.05)", border: "1px solid #f1f5f9" }}>
                            <QRCodeSVG
                                value={`${typeof window !== "undefined" ? window.location.origin : ""}/pass/${pass.qrCodeId}`}
                                size={64}
                                level="M"
                                bgColor="transparent"
                                fgColor="#1e293b"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Download Button */}
            {!isExpired && (
                <button
                    onClick={handleDownload}
                    disabled={downloading}
                    style={{
                        marginTop: 20, maxWidth: 384, width: "100%", height: 52, borderRadius: 12,
                        background: "linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%)",
                        color: "#fff", fontWeight: 700, fontSize: 15, border: "none", cursor: "pointer",
                        display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                        boxShadow: "0 10px 25px rgba(37,99,235,0.3)",
                        opacity: downloading ? 0.7 : 1,
                    }}
                >
                    <Download size={20} />
                    {downloading ? "Saving..." : "Download ID Card"}
                </button>
            )}

            {/* Branding Footer */}
            <p style={{ marginTop: 32, color: "#94a3b8", fontSize: 11, fontWeight: 500 }}>
                Powered by Triumph
            </p>
        </div>
    )
}
