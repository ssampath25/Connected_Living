"use client"

import { useEffect, useState } from "react"
import { ShieldAlert } from "lucide-react"
import { VisitorGroupCard } from "@/components/visitor-group-card"

interface VisitorGroup {
    id: string
    visitStart: string
    visitEnd: string
    status: string
    visitors: { name: string; mobileNumber?: string }[]
    hostName: string
    unitNumber: string
    blockTower?: string
    communityName: string
}

export default function PublicVisitorGroupPassPage({ params }: { params: Promise<{ token: string }> }) {
    const [group, setGroup] = useState<VisitorGroup | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [qrToken, setQrToken] = useState<string>("")

    useEffect(() => {
        params.then(({ token }) => {
            if (!token) {
                setError("Invalid token")
                setLoading(false)
                return
            }
            // Decode the token as it might be URL encoded
            const rawToken = decodeURIComponent(token)
            setQrToken(rawToken)

            const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api/v1"
            // Use encodeURIComponent again for the query param
            fetch(`${apiUrl}/visitors/groups/pass/verify?token=${encodeURIComponent(rawToken)}`)
                .then(res => {
                    if (!res.ok) throw new Error("Pass not found or expired")
                    return res.json()
                })
                .then(data => {
                    setGroup(data)
                    setLoading(false)
                })
                .catch(() => {
                    setError("This pass is invalid or has expired.")
                    setLoading(false)
                })
        })
    }, [params])

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-100">
                <div className="text-center">
                    <div className="w-10 h-10 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin mx-auto" />
                    <p className="mt-4 text-slate-500 text-sm">Validating pass...</p>
                </div>
            </div>
        )
    }

    if (error || !group) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-100 p-6">
                <div className="text-center max-w-sm">
                    <ShieldAlert size={48} className="text-red-500 mx-auto mb-4" />
                    <h1 className="text-xl font-bold text-slate-900 mb-2">Invalid Pass</h1>
                    <p className="text-slate-500 text-sm">{error || "This pass could not be verified."}</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
            {/* We reuse the card component but render it 'inline' essentially */}
            {/* Actually VisitorGroupCard is designed as a modal overlay, but we can use it directly if we want.
                The component has fixed positioning. Let's wrap it relative? 
                No, let's just use it. The props allow onClose, but here we don't need close.
            */}
            <VisitorGroupCard
                visitors={group.visitors}
                visitStart={group.visitStart}
                visitEnd={group.visitEnd}
                hostName={group.hostName}
                unitNumber={group.unitNumber}
                blockTower={group.blockTower}
                communityName={group.communityName}
                qrToken={qrToken}
            // No onClose prop means no close button
            />
        </div>
    )
}
