"use client"

import { useEffect, useState, useCallback } from "react"
import { Car, Search, ChevronLeft, Clock, Calendar as CalendarIcon, Plus, X } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"
import { api, VehicleEntryItem } from "@/lib/api"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function SecurityVehiclesPage() {
    const [loading, setLoading] = useState(true)
    const [vehicles, setVehicles] = useState<VehicleEntryItem[]>([])
    const [searchQuery, setSearchQuery] = useState("")
    const [filter, setFilter] = useState<"all" | "Inside" | "Exited">("all")
    const [selectedDate, setSelectedDate] = useState<Date>(new Date())
    const [showAddModal, setShowAddModal] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Add Vehicle Form State
    const [formData, setFormData] = useState({
        vehicleNumber: "",
        type: "Car" as "Car" | "Bike" | "Truck" | "Auto",
        ownerName: "",
        unitId: "",
        purpose: ""
    })

    const fetchVehicles = useCallback(async () => {
        setLoading(true)
        try {
            const dateStr = selectedDate.toISOString().split('T')[0]
            // Use getVehicleHistory regardless of date for now, as it supports date filtering
            const data = await api.security.getVehicleHistory(dateStr)
            setVehicles(data)
        } catch (error) {
            console.error("Failed to fetch vehicles:", error)
            toast.error("Failed to load vehicle entries")
        } finally {
            setLoading(false)
        }
    }, [selectedDate])

    useEffect(() => {
        fetchVehicles()
    }, [fetchVehicles])

    const handleAddVehicle = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!formData.vehicleNumber || !formData.ownerName || !formData.unitId) {
            toast.error("Please fill all required fields")
            return
        }

        setIsSubmitting(true)
        try {
            await api.security.logVehicleEntry(formData)
            toast.success("Vehicle entry added successfully")
            setShowAddModal(false)
            setFormData({
                vehicleNumber: "",
                type: "Car",
                ownerName: "",
                unitId: "",
                purpose: ""
            })
            fetchVehicles()
        } catch (error) {
            console.error("Failed to add vehicle:", error)
            toast.error("Failed to add vehicle entry")
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleMarkExit = async (id: string, vehicleNumber: string) => {
        try {
            // Need unitId and gateId for exit... api.security.logVehicleExit needs object
            // But logVehicleExit in api.ts takes { vehicleNumber, unitId, ... }
            // We have vehicle from list.
            const vehicle = vehicles.find(v => v.id === id)
            if (!vehicle) return

            await api.security.logVehicleExit({
                vehicleNumber,
                unitId: vehicle.unitId
            })
            toast.success(`${vehicleNumber} marked as exited`)
            fetchVehicles()
        } catch (error) {
            console.error("Failed to mark exit:", error)
            toast.error("Failed to mark exit")
        }
    }

    const filteredVehicles = vehicles.filter(v => {
        const matchesSearch = v.vehicleNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
            v.ownerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            v.unitId.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesFilter = filter === "all" || v.status === filter
        return matchesSearch && matchesFilter
    })

    if (loading) {
        return (
            <div className="flex flex-col min-h-screen bg-background pb-24 lg:pb-0 p-6 space-y-4">
                <Skeleton className="h-12 w-full rounded-xl" />
                <Skeleton className="h-10 w-full rounded-xl" />
                {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-20 w-full rounded-2xl" />)}
            </div>
        )
    }

    return (
        <div className="flex flex-col min-h-screen bg-background pb-24 lg:pb-0">
            {/* Header */}
            <div className="bg-card px-6 py-6 rounded-b-[2rem] lg:rounded-none border-b border-border shadow-sm sticky top-0 z-20">
                <div className="flex items-center gap-3 mb-4">
                    <Link href="/gate" className="lg:hidden p-2 -ml-2 hover:bg-accent rounded-full">
                        <ChevronLeft className="h-6 w-6" />
                    </Link>
                    <div className="flex-1">
                        <h1 className="text-2xl font-extrabold text-green-600 tracking-tight">Vehicles</h1>
                        <p className="text-xs text-muted-foreground font-medium">
                            {selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} • {filteredVehicles.length} entries
                        </p>
                    </div>

                    {/* Add Vehicle Button */}
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2 shadow-md shadow-green-500/20 hover:opacity-90 active:scale-95 transition-all"
                    >
                        <Plus size={18} />
                        <span className="hidden sm:inline">Add Entry</span>
                    </button>

                    {/* Date Picker */}
                    <div className="relative">
                        <input
                            type="date"
                            value={selectedDate.toISOString().split('T')[0]}
                            onChange={(e) => setSelectedDate(new Date(e.target.value))}
                            className="absolute opacity-0 w-10 h-10 cursor-pointer"
                            style={{ zIndex: 10 }}
                        />
                        <button className="h-10 w-10 bg-green-500/10 rounded-xl flex items-center justify-center text-green-600 hover:bg-green-500/20 transition-colors">
                            <CalendarIcon size={20} />
                        </button>
                    </div>
                </div>

                {/* Search */}
                <div className="relative mb-4">
                    <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search by vehicle number, owner, or unit..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 bg-muted rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
                    />
                </div>

                {/* Filter Tabs */}
                <div className="flex gap-2">
                    {(["all", "Inside", "Exited"] as const).map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={cn(
                                "px-4 py-2 rounded-full text-xs font-bold transition-colors",
                                filter === f
                                    ? "bg-green-500 text-white"
                                    : "bg-muted text-muted-foreground hover:bg-accent"
                            )}
                        >
                            {f === "all" ? "All" : f}
                        </button>
                    ))}
                </div>
            </div>

            {/* Vehicles List */}
            <div className="p-6 space-y-4 lg:grid lg:grid-cols-2 lg:gap-4 lg:space-y-0">
                {filteredVehicles.length === 0 ? (
                    <div className="text-center py-12 lg:col-span-2">
                        <Car size={48} className="mx-auto text-muted-foreground mb-4" />
                        <p className="text-muted-foreground font-medium">No vehicles found</p>
                    </div>
                ) : (
                    filteredVehicles.map((vehicle) => (
                        <div
                            key={vehicle.id}
                            className="bg-card rounded-2xl p-4 border border-border shadow-sm"
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className={cn(
                                        "h-12 w-12 rounded-xl flex items-center justify-center",
                                        vehicle.status === "Inside" ? "bg-green-500/10 text-green-600" : "bg-gray-500/10 text-gray-500"
                                    )}>
                                        <Car size={24} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-foreground font-mono">{vehicle.vehicleNumber}</h3>
                                        <p className="text-xs text-muted-foreground">
                                            {vehicle.ownerName} • {vehicle.unitId}
                                        </p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            Entry: {vehicle.entryTime}
                                            {vehicle.exitTime && ` • Exit: ${vehicle.exitTime}`}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className={cn(
                                        "inline-block px-3 py-1 rounded-full text-xs font-bold",
                                        vehicle.status === "Inside"
                                            ? "bg-green-500/10 text-green-600"
                                            : "bg-gray-500/10 text-gray-500"
                                    )}>
                                        {vehicle.status}
                                    </span>
                                </div>
                            </div>

                            {vehicle.status === "Inside" && (
                                <div className="mt-4 pt-4 border-t border-border">
                                    <button
                                        onClick={() => handleMarkExit(vehicle.id, vehicle.vehicleNumber)}
                                        className="w-full py-2 bg-orange-500 text-white rounded-xl font-semibold text-sm flex items-center justify-center gap-2 hover:bg-orange-600 transition-colors"
                                    >
                                        <Clock size={16} />
                                        Mark Exit
                                    </button>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>

            {/* Add Vehicle Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-card rounded-3xl p-6 w-full max-w-md lg:max-w-lg shadow-2xl border border-border">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-foreground">Add Vehicle Entry</h2>
                            <button
                                onClick={() => setShowAddModal(false)}
                                className="p-2 hover:bg-accent rounded-full transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleAddVehicle} className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-muted-foreground block mb-2">
                                    Vehicle Number *
                                </label>
                                <Input
                                    type="text"
                                    placeholder="KA-01-AB-1234"
                                    value={formData.vehicleNumber}
                                    onChange={(e) => setFormData({ ...formData, vehicleNumber: e.target.value.toUpperCase() })}
                                    className="h-12"
                                    required
                                />
                            </div>

                            <div>
                                <label className="text-sm font-medium text-muted-foreground block mb-2">
                                    Vehicle Type *
                                </label>
                                <select
                                    value={formData.type}
                                    onChange={(e) => setFormData({ ...formData, type: e.target.value as "Car" | "Bike" | "Truck" | "Auto" })}
                                    className="w-full h-12 px-4 bg-muted rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
                                >
                                    <option value="Car">Car</option>
                                    <option value="Bike">Bike</option>
                                    <option value="Truck">Truck</option>
                                    <option value="Auto">Auto</option>
                                </select>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-muted-foreground block mb-2">
                                    Owner Name *
                                </label>
                                <Input
                                    type="text"
                                    placeholder="John Doe"
                                    value={formData.ownerName}
                                    onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                                    className="h-12"
                                    required
                                />
                            </div>

                            <div>
                                <label className="text-sm font-medium text-muted-foreground block mb-2">
                                    Unit ID *
                                </label>
                                <Input
                                    type="text"
                                    placeholder="A-101"
                                    value={formData.unitId}
                                    onChange={(e) => setFormData({ ...formData, unitId: e.target.value.toUpperCase() })}
                                    className="h-12"
                                    required
                                />
                            </div>

                            <div>
                                <label className="text-sm font-medium text-muted-foreground block mb-2">
                                    Purpose (Optional)
                                </label>
                                <Input
                                    type="text"
                                    placeholder="Resident, Guest, Delivery, etc."
                                    value={formData.purpose}
                                    onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                                    className="h-12"
                                />
                            </div>

                            <div className="flex gap-3 pt-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setShowAddModal(false)}
                                    className="flex-1 h-12"
                                    disabled={isSubmitting}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    className="flex-1 h-12 bg-gradient-to-r from-green-600 to-emerald-600"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? "Adding..." : "Add Entry"}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
