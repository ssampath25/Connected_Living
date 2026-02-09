"use client"

import { useState, useEffect } from "react"
import {
    ArrowLeft,
    Plus,
    Edit2,
    Trash2,
    Users,
    User,
    Loader2,
    Check,
    X,
    Camera
} from "lucide-react"
import { useRouter } from "next/navigation"
import { api, FamilyMemberItem } from "@/lib/api"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export default function FamilyPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [members, setMembers] = useState<FamilyMemberItem[]>([])

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null) // null = adding new
    const [formData, setFormData] = useState<Partial<FamilyMemberItem>>({
        name: "",
        relation: "Child",
        age: "",
        phone: ""
    })
    const [loadingAction, setLoadingAction] = useState(false)

    useEffect(() => {
        fetchMembers()
    }, [])

    const fetchMembers = async () => {
        try {
            const data = await api.getFamilyMembers()
            setMembers(data)
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    const handleOpenModal = (member?: FamilyMemberItem) => {
        if (member) {
            setEditingId(member.id)
            setFormData(member)
        } else {
            setEditingId(null)
            setFormData({ name: "", relation: "Child", age: "", phone: "" })
        }
        setIsModalOpen(true)
    }

    const handleSave = async () => {
        if (!formData.name || !formData.age) return
        setLoadingAction(true)
        try {
            if (editingId) {
                await api.updateFamilyMember(editingId, formData)
            } else {
                await api.addFamilyMember(formData as Omit<FamilyMemberItem, "id">)
            }
            await fetchMembers()
            setIsModalOpen(false)
        } catch (e) {
            console.error(e)
        } finally {
            setLoadingAction(false)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Remove this family member?")) return
        setLoadingAction(true)
        try {
            await api.deleteFamilyMember(id)
            await fetchMembers()
        } catch (e) {
            console.error(e)
        } finally {
            setLoadingAction(false)
        }
    }

    // Helper for Avatar Fallback
    const getInitials = (name: string) => name ? name.charAt(0).toUpperCase() : "?"

    const getAvatarColor = (name: string) => {
        const colors = [
            "bg-red-500/10 text-red-600",
            "bg-green-500/10 text-green-600",
            "bg-blue-500/10 text-blue-600",
            "bg-yellow-500/10 text-yellow-600",
            "bg-purple-500/10 text-purple-600",
            "bg-pink-500/10 text-pink-600",
            "bg-indigo-500/10 text-indigo-600",
            "bg-orange-500/10 text-orange-600",
            "bg-teal-500/10 text-teal-600",
            "bg-cyan-500/10 text-cyan-600",
        ]
        let hash = 0
        for (let i = 0; i < name.length; i++) {
            hash = name.charCodeAt(i) + ((hash << 5) - hash)
        }
        return colors[Math.abs(hash) % colors.length]
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background pb-safe transition-colors">
            {/* Header */}
            <div className="bg-card px-6 py-6 rounded-b-[2rem] border-b border-border flex items-center justify-between shadow-sm z-20 sticky top-0 transition-colors">
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => router.back()}
                        className="p-2 -ml-2 mr-2 hover:bg-accent rounded-full text-foreground transition-colors"
                    >
                        <ArrowLeft className="h-6 w-6" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-extrabold text-primary tracking-tight">Family Members</h1>
                        <p className="text-xs text-muted-foreground font-medium mt-0.5">Manage your household</p>
                    </div>
                </div>
            </div>

            <div className="p-6 grid grid-cols-2 lg:grid-cols-3 gap-4">
                {members.map((member) => (
                    <div
                        key={member.id}
                        onClick={() => handleOpenModal(member)}
                        className="bg-card p-6 rounded-3xl shadow-sm border border-border flex flex-col items-center text-center relative overflow-hidden group hover:border-primary/30 transition-all cursor-pointer hover:shadow-md"
                    >
                        {/* Avatar */}
                        <div className={cn(
                            "h-24 w-24 rounded-full flex items-center justify-center overflow-hidden mb-4 border-4 border-card shadow-sm ring-1 ring-border",
                            member.avatar ? "bg-accent" : getAvatarColor(member.name)
                        )}>
                            {member.avatar ? (
                                <img src={member.avatar} alt={member.name} className="h-full w-full object-cover" />
                            ) : (
                                <span className="text-3xl font-bold">{getInitials(member.name)}</span>
                            )}
                        </div>

                        {/* Name & Relation */}
                        <h3 className="font-bold text-foreground text-lg leading-tight mb-1 line-clamp-1">{member.name}</h3>
                        <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide mb-3">{member.relation}</span>

                        {/* Details */}
                        <div className="space-y-1 w-full pt-3 border-t border-border">
                            <div className="flex justify-between text-xs text-muted-foreground">
                                <span>Age</span>
                                <span className="font-medium text-foreground">{member.age} yrs</span>
                            </div>
                            {member.phone && (
                                <div className="flex justify-between text-xs text-muted-foreground">
                                    <span>Phone</span>
                                    <span className="font-medium text-foreground">{member.phone}</span>
                                </div>
                            )}
                        </div>
                    </div>
                ))}

                {members.length === 0 && (
                    <div className="col-span-full text-center py-20 text-muted-foreground">
                        <div className="bg-card p-4 rounded-full shadow-sm mb-4 inline-block border border-border">
                            <Users size={48} className="opacity-30" />
                        </div>
                        <p className="text-sm">No family members added yet.</p>
                        <Button onClick={() => handleOpenModal()} variant="outline" className="mt-4 border-primary text-primary hover:bg-primary/5">
                            Add Member
                        </Button>
                    </div>
                )}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-card rounded-2xl w-full max-w-sm p-6 shadow-xl border border-border">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-primary">
                                {editingId ? "Edit Member" : "Add Member"}
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-muted-foreground hover:text-foreground transition-colors">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="space-y-4">
                            {/* Avatar Upload */}
                            <div className="flex justify-center mb-6">
                                <div className="relative">
                                    <div className={cn(
                                        "h-24 w-24 rounded-full flex items-center justify-center overflow-hidden border-4 border-card shadow-sm ring-1 ring-border",
                                        formData.avatar ? "bg-accent" : (formData.name ? getAvatarColor(formData.name) : "bg-accent text-muted-foreground")
                                    )}>
                                        {formData.avatar ? (
                                            <img src={formData.avatar} alt="Preview" className="h-full w-full object-cover" />
                                        ) : (
                                            formData.name ? (
                                                <span className="text-3xl font-bold">{getInitials(formData.name)}</span>
                                            ) : (
                                                <User size={48} />
                                            )
                                        )}
                                    </div>
                                    <label htmlFor="avatar-upload" className="absolute bottom-0 right-0 p-2 bg-primary text-primary-foreground rounded-full cursor-pointer hover:bg-primary/90 transition-colors shadow-md">
                                        <Camera size={14} />
                                        <input
                                            id="avatar-upload"
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0]
                                                if (file) {
                                                    const reader = new FileReader()
                                                    reader.onloadend = () => {
                                                        setFormData({ ...formData, avatar: reader.result as string })
                                                    }
                                                    reader.readAsDataURL(file)
                                                }
                                            }}
                                        />
                                    </label>
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1 block ml-1">Full Name</label>
                                <Input
                                    placeholder="e.g. Aarav Singh"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="bg-accent/50 border-border focus:ring-primary/20"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1 block ml-1">Relation</label>
                                    <select
                                        className="flex h-10 w-full rounded-md border border-border bg-accent/50 px-3 py-2 text-sm text-foreground ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50"
                                        value={formData.relation}
                                        onChange={(e) => setFormData({ ...formData, relation: e.target.value as any })}
                                    >
                                        <option value="Spouse">Spouse</option>
                                        <option value="Child">Child</option>
                                        <option value="Parent">Parent</option>
                                        <option value="Sibling">Sibling</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1 block ml-1">Age</label>
                                    <Input
                                        type="number"
                                        placeholder="e.g. 8"
                                        value={formData.age}
                                        onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                                        className="bg-accent/50 border-border"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1 block ml-1">Phone (Optional)</label>
                                <Input
                                    type="tel"
                                    placeholder="e.g. 9876543210"
                                    value={formData.phone || ""}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    className="bg-accent/50 border-border"
                                />
                            </div>

                            <div className="flex gap-3 pt-2">
                                {editingId && (
                                    <Button
                                        onClick={() => handleDelete(editingId)}
                                        variant="outline"
                                        className="flex-1 border-destructive text-destructive hover:bg-destructive/10"
                                        disabled={loadingAction}
                                    >
                                        <Trash2 size={18} className="mr-2" />
                                        Delete
                                    </Button>
                                )}
                                <Button
                                    onClick={handleSave}
                                    className="flex-[2] bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20"
                                    disabled={loadingAction || !formData.name || !formData.age}
                                >
                                    {loadingAction ? <Loader2 className="animate-spin" /> : (editingId ? "Save Changes" : "Add Member")}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit/Add FAB */}
            <button
                onClick={() => handleOpenModal()}
                className="fixed bottom-24 right-6 bg-primary text-primary-foreground p-4 rounded-full shadow-lg shadow-primary/20 hover:bg-primary/90 transition-transform hover:scale-105 active:scale-95 z-40 lg:bottom-10"
            >
                <Edit2 size={24} />
            </button>
        </div>
    )
}
