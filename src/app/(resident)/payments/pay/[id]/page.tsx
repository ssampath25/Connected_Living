"use client"

import { useState, useEffect, use } from "react"
import { ArrowLeft, CheckCircle, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { api, PaymentItem } from "@/lib/api"
import { toast } from "sonner"

export default function ConfirmPaymentPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter()
    const { id } = use(params) // Unwrap params
    const [payment, setPayment] = useState<PaymentItem | undefined>()
    const [loading, setLoading] = useState(true)
    const [processing, setProcessing] = useState(false)
    const [success, setSuccess] = useState(false)

    useEffect(() => {
        api.getPaymentById(id).then((p) => {
            setPayment(p)
            setLoading(false)
        })
    }, [id])

    const handleConfirm = async () => {
        if (!payment) return
        setProcessing(true)
        try {
            await api.processPayment(payment.id)
            setSuccess(true)
            toast.success("Payment Successful!")
            setTimeout(() => {
                router.push("/payments")
            }, 2000)
        } catch {
            toast.error("Payment failed. Please try again.")
            setProcessing(false)
        }
    }

    if (loading) return <div className="flex h-screen items-center justify-center bg-background"><Loader2 className="animate-spin text-muted-foreground" /></div>

    if (!payment) return <div className="p-8 text-center text-muted-foreground bg-background h-screen">Payment details not found</div>

    if (success) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
                <div className="bg-card p-8 rounded-3xl shadow-xl text-center max-w-sm w-full animate-in zoom-in duration-300 border border-border">
                    <div className="h-20 w-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle size={40} className="text-green-500" />
                    </div>
                    <h1 className="text-2xl font-bold text-foreground mb-2">Payment Successful!</h1>
                    <p className="text-muted-foreground mb-6">You have successfully paid {payment.amount}</p>
                    <button
                        onClick={() => router.push("/payments")}
                        className="w-full bg-green-600 text-white font-bold py-3.5 rounded-xl hover:bg-green-700 transition-colors"
                    >
                        Done
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background">
            <div className="sticky top-0 bg-background/80 backdrop-blur-xl z-10 border-b border-border p-4">
                <div className="flex items-center gap-3">
                    <button onClick={() => router.push("/payments")} className="p-2 -ml-2 text-primary hover:bg-accent rounded-full transition-colors">
                        <ArrowLeft size={24} />
                    </button>
                    <h1 className="text-xl font-bold text-foreground">Confirm Payment</h1>
                </div>
            </div>

            <div className="p-6 max-w-lg mx-auto space-y-6">
                <div className="bg-card p-6 rounded-3xl shadow-sm border border-border text-center">
                    <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-2">Total Amount</p>
                    <h2 className="text-4xl font-extrabold text-primary">{payment.amount}</h2>
                    <p className="text-sm text-muted-foreground mt-2">Due on {payment.dueDate}</p>
                </div>

                <div className="bg-card p-6 rounded-3xl shadow-sm border border-border space-y-4">
                    <div className="flex justify-between py-2 border-b border-border/50">
                        <span className="text-muted-foreground">Payment For</span>
                        <span className="font-bold text-foreground">{payment.title}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-border/50">
                        <span className="text-muted-foreground">Unit ID</span>
                        <span className="font-bold text-foreground">{payment.unitId}</span>
                    </div>
                    <div className="flex justify-between py-2">
                        <span className="text-muted-foreground">Category</span>
                        <span className="font-bold text-foreground">{payment.category}</span>
                    </div>
                </div>

                <button
                    onClick={handleConfirm}
                    disabled={processing}
                    className="w-full bg-primary text-primary-foreground font-bold py-4 rounded-xl shadow-lg shadow-primary/10 hover:bg-primary/90 transition-all flex items-center justify-center gap-2"
                >
                    {processing ? <Loader2 className="animate-spin" /> : "Pay Now"}
                </button>
            </div>
        </div>
    )
}
