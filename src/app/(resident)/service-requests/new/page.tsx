"use client"

/* eslint-disable @next/next/no-img-element */

import React, { useState, useRef } from "react"
import { ArrowLeft, Camera, Zap, Waves, Hammer, Package, MessageSquare, CheckCircle2, Mic, Users, X, AlertCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { api } from "@/lib/api"

const CATEGORIES = [
    { id: "Electrician", icon: Zap, label: "Electrician", color: "text-yellow-600", bg: "bg-yellow-50" },
    { id: "Plumber", icon: Waves, label: "Plumber", color: "text-blue-600", bg: "bg-blue-50" },
    { id: "Carpenter", icon: Hammer, label: "Carpenter", color: "text-orange-600", bg: "bg-orange-50" },
    { id: "Appliance", icon: Package, label: "Appliance", color: "text-purple-600", bg: "bg-purple-50" },
    { id: "Community", icon: Users, label: "Community Complaint", color: "text-red-600", bg: "bg-red-50" },
    { id: "Others", icon: MessageSquare, label: "Others (AI)", color: "text-indigo-600", bg: "bg-indigo-50" },
]

export default function NewServiceRequestPage() {
    const router = useRouter()
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
    const [step, setStep] = useState(1)
    const [description, setDescription] = useState("")
    const [photo, setPhoto] = useState<File | null>(null)
    const [photoPreview, setPhotoPreview] = useState<string | null>(null)

    const [date, setDate] = useState("")
    const [time, setTime] = useState("")
    const dateRef = useRef<HTMLInputElement>(null)
    const timeRef = useRef<HTMLInputElement>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [showSOSConfirm, setShowSOSConfirm] = useState(false)

    const handleSOS = async () => {
        try {
            await api.triggerSOS()
            router.push('/dashboard')
        } catch {
            console.error("Failed to trigger SOS")
        }
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setPhoto(file)
            setPhotoPreview(URL.createObjectURL(file))
        }
    }

    const removePhoto = () => {
        setPhoto(null)
        setPhotoPreview(null)
    }

    const handleCategorySelect = (id: string) => {
        setSelectedCategory(id)
        setStep(2)
    }

    const isOthers = selectedCategory === "Others"

    const handleSubmit = async () => {
        if (!selectedCategory || !description || !photo) return
        if (!selectedCategory || !description || !photo || (!isOthers && (!date || !time))) return

        // Prepare data for Backend API
        const formData = new FormData()
        formData.append("category", selectedCategory)
        formData.append("description", description)
        formData.append("photo", photo)

        if (!isOthers && date) {
            formData.append("preferredDate", date)
            formData.append("preferredTime", time)
        }

        // Call API endpoint
        try {
            await api.createServiceRequest({
                category: selectedCategory,
                description: description,
                priority: "MEDIUM" // Default priority
            })
            router.push('/service-requests')
        } catch {
            console.error("Failed to create request")
        }
    }

    return (
        <div className="min-h-screen bg-background pb-24 lg:pb-8 transition-colors">
            {/* Header */}
            <div className="sticky top-0 bg-background/80 backdrop-blur-md z-10 border-b border-border lg:border-none p-4 lg:p-6 lg:bg-transparent">
                <div className="max-w-4xl mx-auto flex items-center gap-3">
                    <button onClick={() => router.back()} className="p-2 -ml-2 text-foreground hover:bg-accent rounded-full transition-colors">
                        <ArrowLeft size={24} />
                    </button>
                    <div>
                        <h1 className="text-xl font-bold text-foreground lg:text-3xl">New Request</h1>
                        <p className="text-xs text-muted-foreground lg:text-sm font-medium">What can we help you with today?</p>
                    </div>
                </div>
            </div>

            <div className="p-4 lg:p-6 max-w-4xl mx-auto w-full">

                {step === 1 ? (
                    <>
                        {/* SOS Button */}
                        <div className="mb-8">
                            <button
                                onClick={() => setShowSOSConfirm(true)}
                                className="w-full bg-red-50 hover:bg-red-100 border-2 border-red-100 rounded-2xl p-4 flex items-center justify-between group transition-all"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="h-12 w-12 rounded-xl bg-red-100 text-red-600 flex items-center justify-center group-hover:scale-110 transition-transform animate-pulse">
                                        <AlertCircle size={24} />
                                    </div>
                                    <div className="text-left">
                                        <h3 className="text-lg font-bold text-red-700">SOS / Emergency</h3>
                                        <p className="text-sm text-red-600/80">Trigger immediate security alert</p>
                                    </div>
                                </div>
                                <div className="h-10 w-10 rounded-full bg-red-500 text-white flex items-center justify-center shadow-lg shadow-red-200">
                                    <span className="font-bold text-lg">!</span>
                                </div>
                            </button>
                        </div>

                        {!selectedCategory ? (
                            <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                {CATEGORIES.map((cat) => (
                                    <button
                                        key={cat.id}
                                        onClick={() => handleCategorySelect(cat.id)}
                                        className="flex flex-col items-center justify-center p-6 rounded-3xl border border-border bg-card shadow-sm hover:shadow-md hover:border-primary/20 hover:bg-accent/50 transition-all gap-4 ring-offset-background focus:ring-2 focus:ring-primary outline-none group"
                                    >
                                        <div className={cn(
                                            "h-14 w-14 rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:rotate-3",
                                            cat.color,
                                            "group-hover:shadow-lg"
                                        )}>
                                            <cat.icon size={28} />
                                        </div>
                                        <span className="text-xs font-bold text-foreground tracking-wide uppercase group-hover:text-primary">{cat.label}</span>
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                                {/* Category Banner */}
                                <div className="flex items-center gap-3 p-4 bg-accent/30 rounded-2xl border border-border">
                                    <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center", CATEGORIES.find(c => c.id === selectedCategory)?.color)}>
                                        {selectedCategory && React.createElement(CATEGORIES.find(c => c.id === selectedCategory)!.icon, { size: 20 })}
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Selected Category</p>
                                        <p className="font-bold text-foreground">{CATEGORIES.find(c => c.id === selectedCategory)?.label}</p>
                                    </div>
                                    <button
                                        onClick={() => setSelectedCategory(null)}
                                        className="text-xs font-bold text-primary hover:bg-primary/10 px-3 py-1.5 rounded-lg transition-colors"
                                    >
                                        Change
                                    </button>
                                </div>

                                {/* Form Fields */}
                                <div className="space-y-6">
                                    {isOthers && (
                                        <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 flex gap-3 text-indigo-900 text-sm">
                                            <div className="p-2 bg-white rounded-full h-8 w-8 flex items-center justify-center text-indigo-600 flex-shrink-0">
                                                <Zap size={14} fill="currentColor" />
                                            </div>
                                            <p>
                                                <strong>AI Assistant:</strong> Upload a photo or describe the issue. Our AI will automatically categorize and assign the right team.
                                            </p>
                                        </div>
                                    )}

                                    {/* Description */}
                                    <div className="space-y-3">
                                        <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest px-1">Description</label>
                                        <textarea
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                            placeholder="Please provide more details about the issue..."
                                            className="w-full h-32 p-4 rounded-3xl bg-card border border-border focus:ring-2 focus:ring-primary/20 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-all resize-none font-medium"
                                        />
                                    </div>

                                    {/* Photo Upload */}
                                    <div className="space-y-3">
                                        <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest px-1">Evidence / Photo</label>
                                        <div
                                            onClick={() => fileInputRef.current?.click()}
                                            className={cn(
                                                "relative h-48 rounded-3xl border-2 border-dashed flex flex-col items-center justify-center transition-all cursor-pointer overflow-hidden",
                                                photo
                                                    ? "border-primary bg-primary/5"
                                                    : "border-border bg-card hover:bg-accent/50 hover:border-primary/30"
                                            )}
                                        >
                                            <input
                                                ref={fileInputRef}
                                                type="file"
                                                accept="image/*"
                                                capture="environment"
                                                className="hidden"
                                                onChange={handleFileChange}
                                            />
                                            {photoPreview ? (
                                                <>
                                                    <img src={photoPreview} alt="Attached" className="w-full h-full object-cover" />
                                                    <div
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                            removePhoto()
                                                        }}
                                                        className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
                                                    >
                                                        <div className="h-10 w-10 bg-white rounded-full flex items-center justify-center text-destructive shadow-lg">
                                                            <X size={20} />
                                                        </div>
                                                    </div>
                                                </>
                                            ) : (
                                                <>
                                                    <div className="h-12 w-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-3">
                                                        <Camera size={24} />
                                                    </div>
                                                    <p className="text-sm font-bold text-foreground">Click to take photo</p>
                                                    <p className="text-[10px] text-muted-foreground mt-1 uppercase tracking-widest">Max size 5MB</p>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    {!isOthers && (
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest px-1">Preferred Date <span className="text-red-500">*</span></label>
                                                <div className="relative group" onClick={() => dateRef.current?.showPicker()}>
                                                    <input
                                                        type="text"
                                                        readOnly
                                                        value={date ? date.split('-').reverse().join('-') : ''}
                                                        placeholder="DD-MM-YYYY"
                                                        className="w-full h-12 px-4 rounded-xl bg-card border border-border focus:ring-2 focus:ring-primary/20 text-sm text-foreground outline-none pointer-events-none"
                                                    />
                                                    <input
                                                        type="date"
                                                        ref={dateRef}
                                                        min={new Date().toISOString().split('T')[0]}
                                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                                        value={date}
                                                        onChange={(e) => setDate(e.target.value)}
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest px-1">Preferred Time <span className="text-red-500">*</span></label>
                                                <div className="relative group" onClick={() => timeRef.current?.showPicker()}>
                                                    <input
                                                        type="text"
                                                        readOnly
                                                        value={time || ''}
                                                        placeholder="HH:MM"
                                                        className="w-full h-12 px-4 rounded-xl bg-card border border-border focus:ring-2 focus:ring-primary/20 text-sm text-foreground outline-none pointer-events-none"
                                                    />
                                                    <input
                                                        type="time"
                                                        ref={timeRef}
                                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                                        value={time}
                                                        onChange={(e) => setTime(e.target.value)}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <div className="pt-4">
                                        <button
                                            className={cn(
                                                "w-full h-14 text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2",
                                                !description || !photo || (!isOthers && !date)
                                                    ? "bg-gray-300 cursor-not-allowed shadow-none"
                                                    : "bg-[#1a237e] hover:bg-blue-900 shadow-indigo-200 active:scale-[0.98]"
                                            )}
                                            onClick={handleSubmit}
                                            disabled={!description || !photo || (!isOthers && !date)}
                                        >
                                            <span>{isOthers ? "Analyze & Submit" : "Submit Request"}</span>
                                            <CheckCircle2 size={20} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                        {/* Selected Category Banner */}
                        <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                            <div className="h-10 w-10 rounded-full bg-[#1a237e] flex items-center justify-center text-white">
                                {(() => {
                                    const CatIcon = CATEGORIES.find(c => c.id === selectedCategory)?.icon || MessageSquare
                                    return <CatIcon size={20} />
                                })()}
                            </div>
                            <div className="flex-1">
                                <p className="text-xs text-gray-500 font-bold uppercase">Category</p>
                                <p className="font-bold text-[#1a237e]">{CATEGORIES.find(c => c.id === selectedCategory)?.label}</p>
                            </div>
                            <button onClick={() => setStep(1)} className="text-xs font-semibold text-blue-600 hover:text-blue-800">Change</button>
                        </div>

                        {/* Form Fields */}
                        <div className="space-y-6">
                            {isOthers && (
                                <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 flex gap-3 text-indigo-900 text-sm">
                                    <div className="p-2 bg-white rounded-full h-8 w-8 flex items-center justify-center text-indigo-600 flex-shrink-0">
                                        <Zap size={14} fill="currentColor" />
                                    </div>
                                    <p>
                                        <strong>AI Assistant:</strong> Upload a photo or describe the issue. Our AI will automatically categorize and assign the right team.
                                    </p>
                                </div>
                            )}

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700">Description <span className="text-red-500">*</span></label>
                                <div className="relative">
                                    <textarea
                                        className="w-full h-32 p-4 rounded-xl bg-white border border-gray-200 focus:ring-2 focus:ring-[#1a237e]/20 text-sm text-black placeholder:text-gray-400 outline-none resize-none"
                                        placeholder={isOthers ? "Describe what needs fixing... (e.g. 'Crack in living room wall')" : "Describe the issue..."}
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                    />
                                    {isOthers && (
                                        <button className="absolute bottom-3 right-3 p-2 bg-white rounded-full shadow-sm text-gray-400 hover:text-[#1a237e] transition-colors">
                                            <Mic size={18} />
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <label className="text-sm font-bold text-gray-700">
                                    Add Photo <span className="text-red-500">*</span>
                                </label>

                                {photoPreview ? (
                                    <div className="relative h-48 w-full rounded-2xl overflow-hidden group">
                                        <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                                        <button
                                            onClick={removePhoto}
                                            className="absolute top-2 right-2 p-2 bg-black/50 text-white rounded-full hover:bg-red-500 transition-colors"
                                        >
                                            <X size={18} />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="relative">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleFileChange}
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                        />
                                        <div className="border-2 border-dashed border-gray-200 rounded-2xl p-8 flex flex-col items-center justify-center bg-gray-50 hover:bg-blue-50 hover:border-blue-200 transition-colors">
                                            <div className="h-12 w-12 bg-white rounded-full flex items-center justify-center shadow-sm mb-3">
                                                <Camera size={24} className="text-gray-400" />
                                            </div>
                                            <p className="text-sm font-bold text-gray-700">Tap to Upload Photo</p>
                                            <p className="text-xs text-gray-400 mt-1">Required for accurate assistance</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {!isOthers && (
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-foreground">Preferred Date <span className="text-red-500">*</span></label>
                                        <div className="relative group" onClick={() => dateRef.current?.showPicker()}>
                                            <input
                                                type="text"
                                                readOnly
                                                value={date ? date.split('-').reverse().join('-') : ''}
                                                placeholder="DD-MM-YYYY"
                                                className="w-full h-12 px-4 rounded-xl bg-card border border-border focus:ring-2 focus:ring-primary/20 text-sm text-foreground outline-none pointer-events-none"
                                            />
                                            <input
                                                type="date"
                                                ref={dateRef}
                                                min={new Date().toISOString().split('T')[0]}
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                                value={date}
                                                onChange={(e) => setDate(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-foreground">Preferred Time <span className="text-red-500">*</span></label>
                                        <div className="relative group" onClick={() => timeRef.current?.showPicker()}>
                                            <input
                                                type="text"
                                                readOnly
                                                value={time || ''}
                                                placeholder="HH:MM"
                                                className="w-full h-12 px-4 rounded-xl bg-card border border-border focus:ring-2 focus:ring-primary/20 text-sm text-foreground outline-none pointer-events-none"
                                            />
                                            <input
                                                type="time"
                                                ref={timeRef}
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                                value={time}
                                                onChange={(e) => setTime(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="pt-4">
                                <button
                                    className={cn(
                                        "w-full h-14 text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2",
                                        !description || !photo || (!isOthers && !date)
                                            ? "bg-gray-300 cursor-not-allowed shadow-none"
                                            : "bg-[#1a237e] hover:bg-blue-900 shadow-indigo-200 active:scale-[0.98]"
                                    )}
                                    onClick={handleSubmit}
                                    disabled={!description || !photo || (!isOthers && !date)}
                                >
                                    <span>{isOthers ? "Analyze & Submit" : "Submit Request"}</span>
                                    <CheckCircle2 size={20} />
                                </button>
                            </div>
                        </div>
                    </div>
                )}

            </div>

            {/* SOS Confirmation Modal */}
            {showSOSConfirm && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl p-6 w-full max-w-xs text-center space-y-4 animate-in zoom-in-95 duration-200">
                        <div className="h-20 w-20 bg-red-100 rounded-full flex items-center justify-center mx-auto text-red-600 mb-2">
                            <AlertCircle size={40} />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-gray-900">Are you sure?</h3>
                            <p className="text-sm text-gray-500 mt-2">
                                This will immediately alert security with your location and details.
                            </p>
                        </div>
                        <div className="grid grid-cols-2 gap-3 pt-2">
                            <button
                                onClick={() => setShowSOSConfirm(false)}
                                className="w-full py-3 bg-gray-100 hover:bg-gray-200 rounded-xl font-bold text-gray-700 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSOS}
                                className="w-full py-3 bg-red-600 hover:bg-red-700 rounded-xl font-bold text-white shadow-lg shadow-red-200 transition-all active:scale-95"
                            >
                                YES, ALERT
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
