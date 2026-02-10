"use client"

import { useState } from "react"
import { UserPlus, ChevronLeft, User, Phone, Building2, FileText, Users } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"

export default function AddVisitorPage() {
    const router = useRouter()
    const [formData, setFormData] = useState({
        name: "",
        phone: "",
        unitId: "",
        type: "Guest",
        purpose: ""
    })
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000))

        // In real app, would call api.addVisitor(formData)
        alert(`Visitor ${formData.name} added successfully!`)
        router.push("/security-visitors")
    }

    const visitorTypes = ["Guest", "Delivery", "Cab", "Service", "Other"]

    return (
        <div className="flex flex-col min-h-screen bg-background pb-24 lg:pb-0">
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

                {/* Unit ID Field */}
                <div className="space-y-2">
                    <label className="text-sm font-bold text-foreground">Visiting Unit</label>
                    <div className="relative">
                        <Building2 size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="e.g., A-101"
                            value={formData.unitId}
                            onChange={(e) => setFormData({ ...formData, unitId: e.target.value })}
                            required
                            className="w-full pl-11 pr-4 py-4 bg-muted rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
                        />
                    </div>
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
