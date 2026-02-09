"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Save, User, Calendar, Clock, IdCard } from "lucide-react"
import { api } from "@/lib/api"


export default function NewFrequentVisitorPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)

    // Form State
    const [name, setName] = useState("")
    const [type, setType] = useState<"Guest" | "Delivery" | "Cab" | "Staff">("Staff")
    const [relation, setRelation] = useState("")
    const [validUntil, setValidUntil] = useState("")
    const dateInputRef = useRef<HTMLInputElement>(null)

    // Optional Time Slot
    const [hasTimeSlot, setHasTimeSlot] = useState(false)
    const [allowedTimeSlot, setAllowedTimeSlot] = useState("Morning (8am-12pm)")
    const TIME_SLOTS = ["Morning (8am-12pm)", "Afternoon (12pm-4pm)", "Evening (4pm-9pm)", "All Day"]

    const handleSubmit = async () => {
        if (!name || !validUntil) {
            // Simple validation feedback (could use toast if installed)
            alert("Please fill required fields")
            return
        }

        setLoading(true)
        try {
            await api.addFrequentVisitor({
                name,
                type,
                relation,
                validUntil,
                allowedTimeSlot: hasTimeSlot ? allowedTimeSlot : undefined,
                isActive: true,
                avatar: name[0].toUpperCase()
            })
            // Success feedback
            setTimeout(() => router.push('/visitors'), 500)
        } catch (error) {
            console.error(error)
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gray-50/50">
            {/* Header */}
            <div className="sticky top-0 bg-white/80 backdrop-blur-md z-10 border-b border-gray-100 p-4">
                <div className="max-w-md mx-auto flex items-center gap-3">
                    <button onClick={() => router.back()} className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
                        <ArrowLeft size={20} />
                    </button>
                    <h1 className="text-lg font-bold text-gray-900">New Long-Term Pass</h1>
                </div>
            </div>

            <div className="max-w-md mx-auto p-4 space-y-6">

                {/* Intro Card */}
                <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-2xl flex items-start gap-3">
                    <div className="bg-white p-2 rounded-xl text-indigo-600 shadow-sm">
                        <IdCard size={20} />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-indigo-900">Frequent Visitor Pass</h3>
                        <p className="text-xs text-indigo-700/80 mt-1">
                            Create a pass for maids, drivers, or tutors. They can enter using their code until the validity expires.
                        </p>
                    </div>
                </div>

                {/* Form Fields */}
                <div className="space-y-4">
                    {/* Name */}
                    <div className="bg-white p-4 rounded-2xl border border-gray-100 space-y-4 shadow-sm">
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Visitor Name</label>
                            <div className="flex items-center gap-3 mt-2">
                                <User size={18} className="text-gray-400" />
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="e.g. Sunita Helper"
                                    className="flex-1 bg-transparent outline-none text-black font-semibold placeholder:text-gray-400"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Type & Relation */}
                    <div className="bg-white p-4 rounded-2xl border border-gray-100 space-y-4 shadow-sm">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Type</label>
                                <select
                                    value={type}
                                    onChange={(e) => setType(e.target.value as any)}
                                    className="w-full mt-2 bg-white p-2 rounded-lg text-sm font-semibold text-black outline-none focus:ring-2 focus:ring-indigo-100"
                                >
                                    <option value="Staff">Staff</option>
                                    <option value="Cab">Daily Cab</option>
                                    <option value="Guest">Guest (Frequent)</option>
                                    <option value="Delivery">Regular Delivery</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Role</label>
                                <input
                                    type="text"
                                    value={relation}
                                    onChange={(e) => setRelation(e.target.value)}
                                    placeholder="e.g. Maid"
                                    className="w-full mt-2 bg-white p-2 rounded-lg text-sm font-semibold text-black outline-none focus:ring-2 focus:ring-indigo-100"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Validity */}
                    <div className="bg-white p-4 rounded-2xl border border-gray-100 space-y-4 shadow-sm">
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                                <Calendar size={14} />
                                Valid Until
                            </label>
                            <div
                                className="relative group mt-2"
                                onClick={() => dateInputRef.current?.showPicker()}
                            >
                                <input
                                    type="text"
                                    readOnly
                                    value={validUntil ? validUntil.split('-').reverse().join('-') : ''}
                                    placeholder="DD-MM-YYYY"
                                    className="w-full bg-white p-3 rounded-xl text-sm font-semibold text-black outline-none focus:ring-2 focus:ring-indigo-100 pointer-events-none"
                                />
                                <input
                                    type="date"
                                    ref={dateInputRef}
                                    min={new Date().toISOString().split('T')[0]}
                                    value={validUntil}
                                    onChange={(e) => setValidUntil(e.target.value)}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                />
                            </div>
                            <p className="text-[10px] text-gray-400 mt-2">
                                The code will stop working after this date.
                            </p>
                        </div>
                    </div>

                    {/* Optional Time Slot */}
                    <div className="bg-white p-4 rounded-2xl border border-gray-100 space-y-4 shadow-sm">
                        <div className="flex items-center justify-between">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                                <Clock size={14} />
                                Restrict Entry Time?
                            </label>
                            <div
                                onClick={() => setHasTimeSlot(!hasTimeSlot)}
                                className={`w-12 h-6 rounded-full p-1 transition-colors cursor-pointer ${hasTimeSlot ? 'bg-indigo-600' : 'bg-gray-200'}`}
                            >
                                <div className={`h-4 w-4 bg-white rounded-full transition-transform ${hasTimeSlot ? 'translate-x-6' : 'translate-x-0'}`} />
                            </div>
                        </div>

                        {hasTimeSlot && (
                            <div className="grid gap-2 animate-in slide-in-from-top-2">
                                {TIME_SLOTS.map(slot => (
                                    <button
                                        key={slot}
                                        onClick={() => setAllowedTimeSlot(slot)}
                                        className={`text-left p-3 rounded-xl text-xs font-semibold border transition-all ${allowedTimeSlot === slot
                                            ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                                            : 'bg-gray-50 border-transparent text-gray-600 hover:bg-gray-100'
                                            }`}
                                    >
                                        {slot}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Static Save Button */}
            <div className="p-4 bg-white border-t border-gray-100 max-w-md mx-auto">
                <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="w-full h-14 bg-[#1a237e] text-white rounded-xl font-bold text-lg shadow-xl shadow-indigo-900/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                >
                    {loading ? (
                        <>
                            <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            <span>Creating Pass...</span>
                        </>
                    ) : (
                        <>
                            <Save size={20} />
                            <span>Create Pass</span>
                        </>
                    )}
                </button>
            </div>
        </div>
    )
}
