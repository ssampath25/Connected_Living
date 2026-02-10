"use client"

import { useEffect, useState, use } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Calendar, Clock, MapPin, CheckCircle2, AlertTriangle, User, MessageSquare, Phone, BrainCircuit } from "lucide-react"
import { cn } from "@/lib/utils"
import { api, getIconForType, ServiceRequestItem, StaffItem } from "@/lib/api"
import { Skeleton } from "@/components/ui/skeleton"

export default function ServiceRequestDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter()
    const { id } = use(params)
    const [request, setRequest] = useState<ServiceRequestItem | null>(null)
    const [staff, setStaff] = useState<StaffItem | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            const req = await api.getServiceRequestById(id)
            setRequest(req || null)

            if (req && req.assignedTo) {
                const staffMember = await api.getStaffById(req.assignedTo)
                setStaff(staffMember || null)
            }
            setLoading(false)
        }
        fetchData()
    }, [id])

    if (loading) {
        return (
            <div className="min-h-screen bg-white p-6">
                <Skeleton className="h-8 w-1/3 mb-6" />
                <Skeleton className="h-64 w-full rounded-2xl mb-6" />
                <div className="space-y-4">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                </div>
            </div>
        )
    }

    if (!request) {
        return (
            <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
                <div className="h-20 w-20 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 mb-4">
                    <AlertTriangle size={32} />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Request Not Found</h2>
                <button onClick={() => router.back()} className="mt-6 text-[#1a237e] font-bold hover:underline">
                    Go Back
                </button>
            </div>
        )
    }

    const Icon = getIconForType(request.category)

    let statusColor = "bg-gray-100 text-gray-600"
    if (request.status === "In Progress") statusColor = "bg-blue-100 text-blue-700"
    if (request.status === "Open") statusColor = "bg-orange-100 text-orange-700"
    if (request.status === "Resolved") statusColor = "bg-green-100 text-green-700"

    return (
        <div className="min-h-screen bg-background pb-24 lg:pb-8 transition-colors">
            {/* Header */}
            <div className="sticky top-0 bg-background/80 backdrop-blur-md z-10 border-b border-border lg:border-none p-4 lg:p-6 lg:bg-transparent">
                <div className="max-w-4xl mx-auto flex items-center gap-3">
                    <button onClick={() => router.back()} className="p-2 -ml-2 text-foreground hover:bg-accent rounded-full transition-colors">
                        <ArrowLeft size={24} />
                    </button>
                    <h1 className="text-xl font-bold text-foreground lg:text-3xl">Request Details</h1>
                </div>
            </div>

            <div className="max-w-4xl mx-auto p-4 lg:p-8 space-y-6">
                {/* Status Card */}
                <div className="bg-card p-6 rounded-3xl border border-border shadow-sm transition-colors">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Request ID</p>
                            <h2 className="text-lg font-bold text-primary font-mono">{request.id}</h2>
                        </div>
                        <span className={cn(
                            "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-colors",
                            request.status === "In Progress" ? "bg-blue-500/10 text-blue-500" :
                                request.status === "Open" ? "bg-orange-500/10 text-orange-500" :
                                    request.status === "Resolved" ? "bg-green-500/10 text-green-500" :
                                        "bg-muted text-muted-foreground"
                        )}>
                            {request.status}
                        </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-6">
                        <div className="flex items-center gap-4 bg-muted/50 p-4 rounded-2xl border border-border">
                            <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary flex-shrink-0">
                                <Clock size={20} />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Submitted On</p>
                                <p className="text-sm font-bold text-foreground">{request.date}</p>
                            </div>
                        </div>

                        {(request.preferredDate || request.preferredTime) && (
                            <div className="flex items-center gap-4 bg-primary/5 p-4 rounded-2xl border border-primary/20">
                                <div className="h-10 w-10 bg-primary/20 rounded-xl flex items-center justify-center text-primary flex-shrink-0">
                                    <Calendar size={20} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-primary uppercase tracking-widest">Preferred Slot</p>
                                    <p className="text-sm font-bold text-foreground">
                                        {request.preferredDate ? request.preferredDate.split('-').reverse().join('-') : 'Any Day'}
                                        {request.preferredTime ? ` @ ${request.preferredTime}` : ''}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* AI Analysis (If others) */}
                {request.category === "Others" && (
                    <div className="bg-violet-500/5 p-6 rounded-3xl border border-violet-500/20 shadow-sm relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <BrainCircuit size={80} className="text-violet-500" />
                        </div>
                        <div className="flex items-center gap-2 mb-4">
                            <BrainCircuit size={18} className="text-violet-500" />
                            <h3 className="font-bold text-violet-500 text-sm uppercase tracking-wider">AI Assistant Analysis</h3>
                        </div>
                        <p className="text-sm text-foreground/80 leading-relaxed italic">
                            "Based on the description and photo provided, this appears to be a structural maintenance requirement. I have categorized this as 'Others' and flagged it for manual review by the building engineer."
                        </p>
                    </div>
                )}
                {/* Description & Photo */}
                <div className="bg-card p-6 rounded-3xl border border-border shadow-sm space-y-4">
                    <h3 className="font-bold text-foreground">Description</h3>
                    <p className="text-muted-foreground leading-relaxed text-sm">{request.description}</p>

                    {(request.photo || request.image) && (
                        <div className="mt-4 rounded-2xl overflow-hidden border border-border">
                            <img
                                src={request.photo || request.image}
                                alt="Request Attachment"
                                className="w-full h-auto object-cover max-h-64"
                            />
                        </div>
                    )}
                </div>

                {/* Assigned Staff */}
                {staff && (
                    <div className="bg-card p-6 rounded-3xl border border-border shadow-sm transition-colors">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-4">Assigned Staff</p>
                        <div className="flex items-center gap-4">
                            <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary text-xl font-bold shadow-sm transition-colors">
                                {staff.name[0]}
                            </div>
                            <div className="flex-1">
                                <h4 className="font-bold text-foreground leading-tight">{staff.name}</h4>
                                <p className="text-xs text-muted-foreground font-medium mt-1">{staff.role}</p>
                            </div>
                            <div className="flex gap-2">
                                <button className="h-11 w-11 bg-accent hover:bg-primary hover:text-white rounded-xl flex items-center justify-center text-foreground transition-all duration-300 shadow-sm">
                                    <MessageSquare size={20} />
                                </button>
                                <button className="h-11 w-11 bg-accent hover:bg-primary hover:text-white rounded-xl flex items-center justify-center text-foreground transition-all duration-300 shadow-sm">
                                    <Phone size={20} />
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Timeline */}
                <div className="pt-4 px-2">
                    <button className="w-full py-4 border-2 border-dashed border-border rounded-2xl text-muted-foreground font-bold text-sm hover:border-primary/30 hover:text-primary transition-all active:scale-[0.98]">
                        Withdraw Request
                    </button>
                </div>
            </div>
        </div>
    )
}
