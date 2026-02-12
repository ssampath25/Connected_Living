"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { ScanLine, CheckCircle, XCircle, Loader2, QrCode, Camera, RefreshCcw, ArrowLeft } from "lucide-react"
import { api, SecurityVisitorEntry, SecurityStaffScanEntry, SecurityScanResponse } from "@/lib/api"
import { ApiError } from "@/lib/api-client"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { Scanner } from '@yudiel/react-qr-scanner';
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export default function SecurityScannerPage() {
    const [code, setCode] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [scannedVisitor, setScannedVisitor] = useState<SecurityVisitorEntry | null>(null)
    const [scannedStaff, setScannedStaff] = useState<SecurityStaffScanEntry | null>(null)
    const [scanStatus, setScanStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
    const [errorMessage, setErrorMessage] = useState("")
    const [isCameraActive, setIsCameraActive] = useState(true)
    const [cameraFacing, setCameraFacing] = useState<"environment" | "user">("environment")
    const autoCloseTimerRef = useRef<number | null>(null)

    const getScanErrorMessage = (error: unknown) => {
        if (error instanceof ApiError) {
            if (error.status === 404) return "Code not recognized"
            if (error.status === 409) return "Duplicate scan (already inside)"
            if (error.status === 403) return "You are not authorized to scan"
            if (error.status === 400) return "Invalid code format"
            if (error.status >= 500) return "Server error. Please try again"

            const data = error.data as { message?: unknown; error?: unknown } | string | null | undefined
            if (typeof data === "string" && data.trim()) {
                if (/not\s*found/i.test(data)) return "Code not recognized"
                return data
            }
            if (data && typeof data === "object") {
                const message = data.message
                if (Array.isArray(message)) {
                    const joined = message.filter((item) => typeof item === "string").join(", ")
                    if (joined) return joined
                }
                if (typeof message === "string" && message.trim()) {
                    if (/not\s*found/i.test(message)) return "Code not recognized"
                    return message
                }
                if (typeof data.error === "string" && data.error.trim()) {
                    if (/not\s*found/i.test(data.error)) return "Code not recognized"
                    return data.error
                }
            }
            if (error.statusText) {
                if (/not\s*found/i.test(error.statusText)) return "Code not recognized"
                return error.statusText
            }
        }

        if (error && typeof error === "object" && "message" in error && typeof (error as { message?: unknown }).message === "string") {
            const message = (error as { message: string }).message
            if (message.trim()) return message
        }

        return "Invalid code or scan failed"
    }

    const handleQrScan = async (data: string | null) => {
        if (!data) return
        if (isLoading || scanStatus === "success") return

        console.log("Scanned Code:", data)
        setIsLoading(true)
        setScanStatus("loading")

        try {
            const response = await api.security.scanAny({ code: data })
            if (response.type === 'STAFF') {
                const staff = response.staff
                setScannedStaff(staff)
                setScannedVisitor(null)
                setScanStatus("success")
                toast.success(`Staff ${staff.staffName || "Checked"}`, {
                    description: staff.status === "IN" ? "Checked In" : "Checked Out",
                })
                return
            }

            // Blacklist Check
            const { isBlacklisted, reason } = await checkBlacklist(visitor.name)
            if (isBlacklisted) {
                setScanStatus("error")
                setErrorMessage(`BLACKLISTED: ${reason}`)
                toast.error("ENTRY DENIED", { description: `Visitor is blacklisted: ${reason}` })
                setTimeout(() => setScanStatus("idle"), 5000)
                setIsLoading(false)
                return
            }

            const log = response.log
            const visitor: SecurityVisitorEntry = {
                id: log.id,
                visitorName: log.group?.visitors?.[0]?.name || "Unknown",
                unitNumber: log.group?.unit?.unitNumber || "",
                status: log.status === 'ENTERED' ? 'INSIDE' : log.status,
                type: log.group?.type === 'DELIVERY' ? 'DELIVERY' : 'GUEST',
                entryTime: log.entryAt,
                exitTime: log.exitAt,
                mobileNumber: log.group?.visitors?.[0]?.mobileNumber,
                photoUrl: log.photoUrl,
                gateId: log.gateId,
                approvalType: 'Pre-approved',
                qrCode: data,
            }

            setScannedVisitor(visitor)
            setScannedStaff(null)
            setScanStatus("success")

            if (visitor.status === 'INSIDE') {
                toast.success(`Welcome ${visitor.visitorName}`, { description: `Unit ${visitor.unitNumber} - Checked In` })
            } else {
                toast.success(`Goodbye ${visitor.visitorName}`, { description: `Checked Out at ${new Date().toLocaleTimeString()}` })
            }

        } catch (error) {
            console.error(error)
            setScanStatus("error")
            const message = getScanErrorMessage(error)
            setErrorMessage(message)
            toast.error("Scan Failed", { description: message })
        } finally {
            setIsLoading(false)
        }
    }, [isLoading, scanStatus])

    const handleManualSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (code.length >= 4) {
            setIsLoading(true)
            setScanStatus("loading")
            setErrorMessage("")
            api.security.scanAny({ code })
                .then((result: SecurityScanResponse) => {
                    if (result.type === 'STAFF') {
                        const staff = result.staff as SecurityStaffScanEntry
                        setScannedStaff(staff)
                        setScannedVisitor(null)
                        setScanStatus("success")
                        toast.success(`Staff ${staff.staffName || "Checked"}`, {
                            description: staff.status === "IN" ? "Checked In" : "Checked Out",
                        })
                        return
                    }
                    const log = result.log
                    const visitor: SecurityVisitorEntry = {
                        id: log.id,
                        visitorName: log.group?.visitors?.[0]?.name || "Unknown",
                        unitNumber: log.group?.unit?.unitNumber || "",
                        status: log.status === 'ENTERED' ? 'INSIDE' : log.status,
                        type: log.group?.type === 'DELIVERY' ? 'DELIVERY' : 'GUEST',
                        entryTime: log.entryAt,
                        exitTime: log.exitAt,
                        mobileNumber: log.group?.visitors?.[0]?.mobileNumber,
                        photoUrl: log.photoUrl,
                        gateId: log.gateId,
                        approvalType: 'Pre-approved',
                        qrCode: code,
                    }
                    setScannedVisitor(visitor)
                    setScannedStaff(null)
                    setScanStatus("success")
                    if (visitor.status === 'INSIDE') {
                        toast.success(`Welcome ${visitor.visitorName}`, { description: `Unit ${visitor.unitNumber} - Checked In` })
                    } else {
                        toast.success(`Goodbye ${visitor.visitorName}`, { description: `Checked Out at ${new Date().toLocaleTimeString()}` })
                    }
                })
                .catch((error) => {
                    console.error(error)
                    setScanStatus("error")
                    const message = getScanErrorMessage(error)
                    setErrorMessage(message)
                    toast.error("Scan Failed", { description: message })
                })
                .finally(() => setIsLoading(false))
            return
        }
    }

    const resetScan = useCallback(() => {
        if (autoCloseTimerRef.current !== null) {
            window.clearTimeout(autoCloseTimerRef.current)
            autoCloseTimerRef.current = null
        }
        setScanStatus("idle")
        setScannedVisitor(null)
        setScannedStaff(null)
        setErrorMessage("")
        setIsLoading(false)
        setCode("")
    }, [])

    const manualInputRef = (node: HTMLInputElement | null) => {
        if (node && !isCameraActive) {
            node.focus()
        }
    }

    useEffect(() => {
        if (scanStatus === "success" || scanStatus === "error") {
            if (autoCloseTimerRef.current !== null) {
                window.clearTimeout(autoCloseTimerRef.current)
            }
            autoCloseTimerRef.current = window.setTimeout(() => {
                resetScan()
            }, 2000)
            return
        }

        if (autoCloseTimerRef.current !== null) {
            window.clearTimeout(autoCloseTimerRef.current)
            autoCloseTimerRef.current = null
        }
    }, [resetScan, scanStatus])

    useEffect(() => {
        return () => {
            if (autoCloseTimerRef.current !== null) {
                window.clearTimeout(autoCloseTimerRef.current)
                autoCloseTimerRef.current = null
            }
        }
    }, [])


    return (
        <div className="min-h-screen bg-black text-white flex flex-col relative pb-[env(safe-area-inset-bottom)]">
            {/* Header */}
            <div className="absolute top-0 left-0 right-0 p-4 z-20 flex justify-between items-start bg-gradient-to-b from-black/80 to-transparent pointer-events-none">
                <Link href="/security-visitors" className="pointer-events-auto p-2 bg-black/40 backdrop-blur-md rounded-full text-white/80 hover:text-white hover:bg-black/60 transition-all">
                    <ArrowLeft size={24} />
                </Link>

                <div className="flex flex-col items-end gap-2">
                    <div className="bg-black/40 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
                        <h1 className="text-sm font-bold flex items-center gap-2">
                            <QrCode size={16} className="text-green-400" />
                            Scanner
                        </h1>
                    </div>
                </div>
            </div>

            {/* Camera Viewport - Flexible Height */}
            <div className="flex-1 relative bg-black flex items-center justify-center min-h-[40vh] transition-all duration-300">
                {isCameraActive ? (
                    <div className="relative w-full h-full min-h-[40vh]">
                        <Scanner
                            onScan={(result) => {
                                if (result && result.length > 0) {
                                    handleQrScan(result[0].rawValue)
                                }
                            }}
                            constraints={{
                                facingMode: cameraFacing
                            }}
                            components={{
                                audio: false,
                                onOff: false,
                                finder: false,
                                torch: false
                            }}
                            styles={{
                                container: { width: '100%', height: '100%' },
                                video: { objectFit: 'cover', width: '100%', height: '100%' }
                            }}
                        />
                        {/* Overlay Elements */}
                        <div className="absolute inset-0 z-10 pointer-events-none h-full w-full">
                            {/* Scan Frame */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 border-2 border-green-500/50 rounded-3xl bg-green-500/5 shadow-[0_0_100px_rgba(34,197,94,0.2)] animate-pulse">
                                <div className="absolute top-0 left-0 w-full h-1 bg-green-500/80 shadow-[0_0_20px_rgba(34,197,94,1)] animate-scan-line" />

                                {/* Corners */}
                                <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-green-500 rounded-tl-xl" />
                                <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-green-500 rounded-tr-xl" />
                                <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-green-500 rounded-bl-xl" />
                                <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-green-500 rounded-br-xl" />
                            </div>

                            <p className="absolute top-3/4 left-0 right-0 text-center text-white/70 text-sm font-medium animate-pulse mt-8">
                                Point camera at code
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center text-zinc-500 gap-4 min-h-[40vh]">
                        <div className="w-20 h-20 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                            <Camera size={32} />
                        </div>
                        <p>Camera Paused</p>
                    </div>
                )}

                {/* Success/Error Overlay */}
                {scanStatus !== "idle" && (
                    <div className="absolute inset-0 z-30 bg-black/80 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in duration-200 h-full w-full">
                        <div className={cn(
                            "w-full max-w-sm bg-card text-white rounded-3xl p-6 shadow-2xl border flex flex-col items-center text-center gap-4",
                            scanStatus === "success" ? "border-green-500/20 bg-zinc-900" : "border-red-500/20 bg-zinc-900"
                        )}>
                            <div className={cn(
                                "w-16 h-16 rounded-full flex items-center justify-center mb-2",
                                scanStatus === "success"
                                    ? "bg-green-500/20 text-green-500"
                                    : scanStatus === "loading"
                                        ? "bg-white/10 text-white"
                                        : "bg-red-500/20 text-red-500"
                            )}>
                                {scanStatus === "success" ? (
                                    <CheckCircle size={32} />
                                ) : scanStatus === "loading" ? (
                                    <Loader2 size={28} className="animate-spin" />
                                ) : (
                                    <XCircle size={32} />
                                )}
                            </div>

                            {scanStatus === "loading" && (
                                <>
                                    <h2 className="text-xl font-bold">Verifying QR</h2>
                                    <p className="text-white/60 text-sm">Fetching visitor or staff details...</p>
                                </>
                            )}

                            {scanStatus === "success" && scannedVisitor && (
                                <>
                                    <h2 className="text-xl font-bold">{scannedVisitor.status === "INSIDE" ? "Access Granted" : "Checked Out"}</h2>
                                    <div className="flex flex-col gap-1 w-full bg-black/20 rounded-xl p-4">
                                        <p className="text-sm text-white/60 uppercase tracking-wider font-bold">Visitor</p>
                                        <p className="text-lg font-semibold">{scannedVisitor.visitorName}</p>
                                        <div className="flex justify-between text-xs text-white/60">
                                            <span>ID</span>
                                            <span className="font-mono text-white">{scannedVisitor.id}</span>
                                        </div>
                                        <div className="flex justify-between mt-2 pt-2 border-t border-white/5">
                                            <div className="text-left">
                                                <p className="text-xs text-white/60">Unit</p>
                                                <p className="font-mono">{scannedVisitor.unitNumber}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xs text-white/60">Type</p>
                                                <p className="font-medium">{scannedVisitor.type}</p>
                                            </div>
                                        </div>
                                        <div className="flex justify-between mt-2 text-xs text-white/60">
                                            <span>{scannedVisitor.status === "INSIDE" ? "Checked In" : "Checked Out"}</span>
                                            <span className="font-mono text-white">
                                                {scannedVisitor.status === "INSIDE"
                                                    ? (scannedVisitor.entryTime ? new Date(scannedVisitor.entryTime).toLocaleTimeString() : "-")
                                                    : (scannedVisitor.exitTime ? new Date(scannedVisitor.exitTime).toLocaleTimeString() : "-")}
                                            </span>
                                        </div>
                                        {scannedVisitor.status === "DENIED" && (
                                            <div className="mt-3 text-xs text-red-400">
                                                Reason: {scannedVisitor.deniedReason || "Access denied"}
                                            </div>
                                        )}
                                    </div>
                                </>
                            )}

                            {scanStatus === "success" && scannedStaff && (
                                <>
                                    <h2 className="text-xl font-bold">{scannedStaff.status === "IN" ? "Check-In" : "Check-Out"}</h2>
                                    <div className="flex flex-col gap-1 w-full bg-black/20 rounded-xl p-4">
                                        <p className="text-sm text-white/60 uppercase tracking-wider font-bold">Staff</p>
                                        <p className="text-lg font-semibold">{scannedStaff.staffName || scannedStaff.staffId}</p>
                                        <div className="flex justify-between text-xs text-white/60">
                                            <span>Staff ID</span>
                                            <span className="font-mono text-white">{scannedStaff.staffId}</span>
                                        </div>
                                        <div className="flex justify-between text-xs text-white/60">
                                            <span>Log ID</span>
                                            <span className="font-mono text-white">{scannedStaff.id}</span>
                                        </div>
                                        <div className="flex justify-between mt-2 pt-2 border-t border-white/5">
                                            <div className="text-left">
                                                <p className="text-xs text-white/60">Unit</p>
                                                <p className="font-mono">{scannedStaff.unitNumber || "-"}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xs text-white/60">Status</p>
                                                <p className="font-medium">{scannedStaff.status}</p>
                                            </div>
                                        </div>
                                        <div className="flex justify-between mt-2 text-xs text-white/60">
                                            <span>{scannedStaff.status === "IN" ? "Checked In" : "Checked Out"}</span>
                                            <span className="font-mono text-white">
                                                {scannedStaff.status === "IN"
                                                    ? (scannedStaff.checkInAt ? new Date(scannedStaff.checkInAt).toLocaleTimeString() : "-")
                                                    : (scannedStaff.checkOutAt ? new Date(scannedStaff.checkOutAt).toLocaleTimeString() : "-")}
                                            </span>
                                        </div>
                                    </div>
                                </>
                            )}

                            {scanStatus === "error" && (
                                <>
                                    <h2 className="text-xl font-bold text-red-500">Scan Failed</h2>
                                    <p className="text-white/70">{errorMessage}</p>
                                </>
                            )}

                            <Button onClick={resetScan} className="w-full rounded-xl mt-2" variant={scanStatus === "success" ? "default" : "destructive"}>
                                {scanStatus === "success" ? "Scan Next" : "Try Again"}
                            </Button>
                        </div>
                    </div>
                )

    const cameraControls = (
                <div className="flex items-center justify-between">
                    <div className="text-sm font-medium text-muted-foreground">
                        Scanner Controls
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="icon"
                            className="rounded-full h-10 w-10"
                            onClick={() => setCameraFacing(prev => prev === "environment" ? "user" : "environment")}
                            disabled={!isCameraActive}
                        >
                            <RefreshCcw size={18} />
                        </Button>
                        <Button
                            variant={isCameraActive ? "destructive" : "default"}
                            size="sm"
                            className="rounded-full"
                            onClick={() => setIsCameraActive(!isCameraActive)}
                        >
                            {isCameraActive ? "Stop Camera" : "Start Camera"}
                        </Button>
                    </div>
                </div>
                )

                return (
                <>
                    {/* ===== MOBILE LAYOUT ===== */}
                    <div className="lg:hidden min-h-screen bg-black text-white flex flex-col relative pb-[env(safe-area-inset-bottom)]">
                        {/* Header */}
                        <div className="absolute top-0 left-0 right-0 p-4 z-20 flex justify-between items-start bg-gradient-to-b from-black/80 to-transparent pointer-events-none">
                            <Link href="/security-visitors" className="pointer-events-auto p-2 bg-black/40 backdrop-blur-md rounded-full text-white/80 hover:text-white hover:bg-black/60 transition-all">
                                <ArrowLeft size={24} />
                            </Link>
                            <div className="flex flex-col items-end gap-2">
                                <div className="bg-black/40 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
                                    <h1 className="text-sm font-bold flex items-center gap-2">
                                        <QrCode size={16} className="text-green-400" />
                                        QR Scanner
                                    </h1>
                                </div>
                            </div>
                        </div>

                        {/* Camera Viewport */}
                        <div className="flex-1 relative bg-black flex items-center justify-center min-h-[40vh] transition-all duration-300">
                            {scannerViewfinder}
                            {scanResultOverlay}
                        </div>

                        {/* Controls & Manual Entry */}
                        <div className="w-full bg-background text-foreground rounded-t-3xl p-6 pb-24 space-y-6 flex-shrink-0 z-30 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
                            {cameraControls}

                            <form onSubmit={handleManualSubmit} className="space-y-3 pb-8">
                                <label className="text-sm font-medium text-muted-foreground block">
                                    Or enter code manually
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <ScanLine className="text-muted-foreground" size={18} />
                                    </div>
                                    <Input
                                        ref={manualInputRef}
                                        type="text"
                                        inputMode="numeric"
                                        placeholder="Visitor Pass Code (e.g. 4821)"
                                        value={code}
                                        onChange={(e) => setCode(e.target.value)}
                                        className="pl-10 h-12 text-lg font-mono tracking-widest bg-muted border-transparent focus:bg-background"
                                        maxLength={6}
                                    />
                                </div>
                                <div
                                    className={cn(
                                        "grid transition-all duration-300 ease-in-out",
                                        code.length >= 4 ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0 pointer-events-none"
                                    )}
                                >
                                    <div className="overflow-hidden min-h-0">
                                        <Button
                                            type="submit"
                                            className="w-full h-12 text-base font-semibold rounded-xl mt-2"
                                            disabled={isLoading || code.length < 4}
                                        >
                                            {isLoading ? <Loader2 className="animate-spin mr-2" /> : <CheckCircle className="mr-2" size={18} />}
                                            Submit Code
                                        </Button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* ===== DESKTOP LAYOUT ===== */}
                    <div className="hidden lg:block min-h-screen bg-background text-foreground p-8">
                        {/* Header */}
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h1 className="text-3xl font-bold text-foreground">QR Scanner</h1>
                                <p className="text-muted-foreground mt-1">Scan visitor codes or enter manually</p>
                            </div>
                            <Link href="/security-visitors" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                                ← Back to Visitors
                            </Link>
                        </div>

                        {/* Side-by-side layout */}
                        <div className="flex gap-8 items-start">
                            {/* LEFT: QR Scanner */}
                            <div className="flex-1 min-w-0 relative">
                                <div className="bg-black rounded-2xl overflow-hidden border border-border shadow-lg relative">
                                    <div className="w-full aspect-[4/3] relative bg-black flex items-center justify-center">
                                        {scannerViewfinder}
                                    </div>
                                    {scanResultOverlay}
                                </div>

                                {/* Camera controls below scanner */}
                                <div className="mt-4 px-1">
                                    {cameraControls}
                                </div>
                            </div>

                            {/* RIGHT: Code Entry & Result */}
                            <div className="w-96 shrink-0 space-y-6">
                                {/* Manual Code Entry Card */}
                                <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
                                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-5">Manual Entry</h3>
                                    <form onSubmit={handleManualSubmit} className="space-y-4">
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <ScanLine className="text-muted-foreground" size={18} />
                                            </div>
                                            <Input
                                                ref={desktopInputRef}
                                                type="text"
                                                inputMode="numeric"
                                                placeholder="Visitor Code (e.g. 4821)"
                                                value={code}
                                                onChange={(e) => setCode(e.target.value)}
                                                className="pl-10 h-12 text-lg font-mono tracking-widest bg-muted border-transparent focus:bg-background"
                                                maxLength={6}
                                            />
                                        </div>

                                        <div
                                            className={cn(
                                                "grid transition-all duration-300 ease-in-out",
                                                code.length >= 4 ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0 pointer-events-none"
                                            )}
                                        >
                                            <div className="overflow-hidden min-h-0">
                                                <Button
                                                    type="submit"
                                                    className="w-full h-12 text-base font-semibold rounded-xl"
                                                    disabled={isLoading || code.length < 4}
                                                >
                                                    {isLoading ? <Loader2 className="animate-spin mr-2" /> : <CheckCircle className="mr-2" size={18} />}
                                                    Submit Code
                                                </Button>
                                            </div>
                                        </div>
                                    </form>
                                </div>

                                {/* Last Scan Result Card */}
                                {scanStatus !== "idle" && (
                                    <div className={cn(
                                        "border rounded-2xl p-6 shadow-sm animate-in fade-in slide-in-from-top-2 duration-300",
                                        scanStatus === "success" ? "bg-green-500/5 border-green-500/20" : "bg-red-500/5 border-red-500/20"
                                    )}>
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className={cn(
                                                "h-10 w-10 rounded-full flex items-center justify-center shrink-0",
                                                scanStatus === "success" ? "bg-green-500/20 text-green-500" : "bg-red-500/20 text-red-500"
                                            )}>
                                                {scanStatus === "success" ? <CheckCircle size={20} /> : <XCircle size={20} />}
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-foreground">
                                                    {scanStatus === "success"
                                                        ? (scannedVisitor?.status === "Inside" ? "Access Granted" : "Checked Out")
                                                        : "Scan Failed"
                                                    }
                                                </h3>
                                                {scanStatus === "error" && (
                                                    <p className="text-sm text-muted-foreground">{errorMessage}</p>
                                                )}
                                            </div>
                                        </div>

                                        {scanStatus === "success" && scannedVisitor && (
                                            <div className="bg-card rounded-xl p-4 border border-border space-y-2 mb-4">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-xs text-muted-foreground uppercase tracking-wider">Visitor</span>
                                                    <span className={cn(
                                                        "text-[10px] font-bold px-2 py-0.5 rounded-full uppercase",
                                                        scannedVisitor.status === "Inside" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                                                    )}>
                                                        {scannedVisitor.status}
                                                    </span>
                                                </div>
                                                <p className="text-lg font-semibold text-foreground">{scannedVisitor.name}</p>
                                                <div className="flex justify-between text-sm pt-2 border-t border-border">
                                                    <div>
                                                        <p className="text-xs text-muted-foreground">Unit</p>
                                                        <p className="font-mono font-medium text-foreground">{scannedVisitor.unitId}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-xs text-muted-foreground">Type</p>
                                                        <p className="font-medium text-foreground">{scannedVisitor.type}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        <Button onClick={resetScan} className="w-full rounded-xl" variant={scanStatus === "success" ? "default" : "destructive"} size="sm">
                                            {scanStatus === "success" ? "Scan Next" : "Try Again"}
                                        </Button>
                                    </div>
                                )}

                                {/* Instructions Card */}
                                <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
                                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">How It Works</h3>
                                    <div className="space-y-3">
                                        <div className="flex items-start gap-3">
                                            <div className="h-6 w-6 rounded-full bg-green-500/10 text-green-600 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">1</div>
                                            <p className="text-sm text-muted-foreground">Point the camera at the visitor&apos;s QR code, or enter their pass code manually</p>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <div className="h-6 w-6 rounded-full bg-green-500/10 text-green-600 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">2</div>
                                            <p className="text-sm text-muted-foreground">The system checks the code against expected visitors</p>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <div className="h-6 w-6 rounded-full bg-green-500/10 text-green-600 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">3</div>
                                            <p className="text-sm text-muted-foreground">Visitor is automatically checked in or out based on their current status</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
                )
}
