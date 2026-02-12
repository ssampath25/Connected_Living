"use client"

import { useState, useEffect } from "react"
import {
    ArrowLeft,
    Plus,
    Edit2,
    Trash2,
    Car,
    Bike,
    Zap,
    Fuel,
    Loader2,
    X
} from "lucide-react"
import { useRouter } from "next/navigation"
import { api, VehicleItem } from "@/lib/api"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export default function VehiclesPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [vehicles, setVehicles] = useState<VehicleItem[]>([])

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [formData, setFormData] = useState<Partial<VehicleItem>>({
        type: "Car",
        category: "ICE",
        registrationNumber: "",
        model: "",
        color: ""
    })
    const [loadingAction, setLoadingAction] = useState(false)

    useEffect(() => {
        fetchVehicles()
    }, [])

    const fetchVehicles = async () => {
        try {
            const data = await api.getVehicles()
            setVehicles(data)
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    const handleOpenModal = (vehicle?: VehicleItem) => {
        if (vehicle) {
            setEditingId(vehicle.id)
            setFormData(vehicle)
        } else {
            setEditingId(null)
            setFormData({ type: "Car", category: "ICE", registrationNumber: "", model: "", color: "" })
        }
        setIsModalOpen(true)
    }

    const handleSave = async () => {
        if (!formData.registrationNumber || !formData.model) return
        setLoadingAction(true)
        try {
            if (editingId) {
                await api.updateVehicle(editingId, formData)
            } else {
                await api.addVehicle(formData as Omit<VehicleItem, "id" | "userId">)
            }
            await fetchVehicles()
            setIsModalOpen(false)
        } catch (e) {
            console.error(e)
        } finally {
            setLoadingAction(false)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Remove this vehicle?")) return
        setLoadingAction(true)
        try {
            await api.deleteVehicle(id)
            await fetchVehicles()
        } catch (e) {
            console.error(e)
        } finally {
            setLoadingAction(false)
        }
    }

    const getVehicleIcon = (type: string) => {
        return type === "Bike" ? <Bike size={32} /> : <Car size={32} />
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background pb-24">
            {/* Header */}
            <div className="bg-card p-4 flex items-center justify-between shadow-sm sticky top-0 z-10 border-b border-border">
                <button onClick={() => router.back()} className="p-2 -ml-2 text-primary">
                    <ArrowLeft size={24} />
                </button>
                <h1 className="text-xl font-bold text-primary">My Vehicles</h1>
                <button onClick={() => handleOpenModal()} className="p-2 -mr-2 text-primary bg-primary/10 rounded-full h-10 w-10 flex items-center justify-center">
                    <Plus size={24} />
                </button>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                {vehicles.map((vehicle) => (
                    <div key={vehicle.id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 relative group overflow-hidden">

                        {/* Status/Category Badge */}
                        <div className={cn(
                            "absolute top-0 left-0 px-3 py-1 rounded-br-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1",
                            vehicle.category === "EV" ? "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-500" : "bg-muted text-muted-foreground"
                        )}>
                            {vehicle.category === "EV" ? <Zap size={12} fill="currentColor" /> : <Fuel size={12} />}
                            {vehicle.category === "EV" ? "Electric" : "Petrol/Diesel"}
                        </div>

                        {/* Top Actions */}
                        <div className="absolute top-3 right-3 flex gap-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => handleOpenModal(vehicle)} className="p-2 text-primary bg-primary/10 rounded-full hover:bg-primary/20">
                                <Edit2 size={16} />
                            </button>
                            <button onClick={() => handleDelete(vehicle.id)} className="p-2 text-destructive bg-destructive/10 rounded-full hover:bg-destructive/20">
                                <Trash2 size={16} />
                            </button>
                        </div>

                        <div className="mt-8 flex items-start gap-4">
                            <div className={cn(
                                "h-16 w-16 rounded-2xl flex items-center justify-center text-white shadow-md",
                                vehicle.type === "Bike" ? "bg-orange-500" : "bg-blue-600"
                            )}>
                                {getVehicleIcon(vehicle.type)}
                            </div>
                            <div>
                                <h3 className="font-bold text-foreground text-lg leading-tight">{vehicle.model}</h3>
                                <p className="text-sm text-muted-foreground font-mono mt-1 bg-muted px-2 py-0.5 rounded border border-border inline-block">
                                    {vehicle.registrationNumber}
                                </p>
                                {vehicle.color && <p className="text-xs text-muted-foreground mt-1 capitalize">{vehicle.color} • {vehicle.type}</p>}
                            </div>
                        </div>
                    </div>
                ))}

                {vehicles.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground col-span-full">
                        <Car size={48} className="mx-auto mb-4 opacity-50" />
                        <p>No vehicles registered yet.</p>
                        <Button onClick={() => handleOpenModal()} variant="outline" className="mt-4 border-border text-foreground hover:bg-accent">Add Vehicle</Button>
                    </div>
                )}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-card rounded-2xl w-full max-w-md p-6 shadow-xl border border-border">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-primary">
                                {editingId ? "Edit Vehicle" : "Add Vehicle"}
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-muted-foreground hover:text-foreground">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="space-y-4">
                            {/* Type Selection */}
                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    onClick={() => setFormData({ ...formData, type: "Car" })}
                                    className={cn(
                                        "p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all",
                                        formData.type === "Car" ? "border-primary bg-primary/10 text-primary" : "border-border hover:border-border/80 text-muted-foreground"
                                    )}
                                >
                                    <Car size={28} />
                                    <span className="font-bold text-sm">Car</span>
                                </button>
                                <button
                                    onClick={() => setFormData({ ...formData, type: "Bike" })}
                                    className={cn(
                                        "p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all",
                                        formData.type === "Bike" ? "border-orange-500 bg-orange-500/10 text-orange-600 dark:text-orange-500" : "border-border hover:border-border/80 text-muted-foreground"
                                    )}
                                >
                                    <Bike size={28} />
                                    <span className="font-bold text-sm">Bike</span>
                                </button>
                            </div>

                            {/* Category Selection */}
                            <div className="flex bg-muted p-1 rounded-lg">
                                <button
                                    onClick={() => setFormData({ ...formData, category: "ICE" })}
                                    className={cn(
                                        "flex-1 py-2 text-sm font-medium rounded-md transition-all flex items-center justify-center gap-2",
                                        formData.category === "ICE" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                                    )}
                                >
                                    <Fuel size={14} />
                                    Petrol/Diesel
                                </button>
                                <button
                                    onClick={() => setFormData({ ...formData, category: "EV" })}
                                    className={cn(
                                        "flex-1 py-2 text-sm font-medium rounded-md transition-all flex items-center justify-center gap-2",
                                        formData.category === "EV" ? "bg-card text-green-700 dark:text-green-500 shadow-sm" : "text-muted-foreground hover:text-foreground"
                                    )}
                                >
                                    <Zap size={14} />
                                    Electric (EV)
                                </button>
                            </div>

                            <div>
                                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1 block">Vehicle Model</label>
                                <Input
                                    placeholder="e.g. Tata Nexon, Honda City"
                                    value={formData.model}
                                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                                    className="bg-muted border-border"
                                />
                            </div>

                            <div>
                                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1 block">Registration Number</label>
                                <Input
                                    placeholder="e.g. KA 01 AB 1234"
                                    value={formData.registrationNumber}
                                    onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value.toUpperCase() })}
                                    className="bg-muted border-border"
                                />
                                {formData.category === "EV" && (
                                    <p className="text-xs text-muted-foreground mt-1">* May differ for some EVs</p>
                                )}
                            </div>

                            <div>
                                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1 block">Color (Optional)</label>
                                <Input
                                    placeholder="e.g. Silky Silver"
                                    value={formData.color || ""}
                                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                                    className="bg-muted border-border"
                                />
                            </div>

                            <Button onClick={handleSave} className="w-full bg-primary hover:bg-primary/90 mt-4 text-white" disabled={loadingAction || !formData.registrationNumber || !formData.model}>
                                {loadingAction ? <Loader2 className="animate-spin" /> : (editingId ? "Save Vehicle" : "Add Vehicle")}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
