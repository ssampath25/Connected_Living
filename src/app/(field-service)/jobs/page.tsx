import { MapPin, Clock } from "lucide-react"

export default function JobsPage() {
    return (
        <div className="p-6">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-xl font-bold text-gray-900">My Jobs</h1>
                <span className="bg-green-100 text-green-700 font-bold text-xs px-3 py-1 rounded-full">On Duty</span>
            </div>

            <div className="space-y-4">
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-start mb-3">
                        <h3 className="font-bold text-lg">Leaking Kitchen Sink</h3>
                        <span className="text-xs font-bold bg-red-50 text-red-600 px-2 py-1 rounded">High</span>
                    </div>
                    <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                            <MapPin size={16} className="text-gray-400" />
                            <span>Flat A-101 (Tower 1)</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Clock size={16} className="text-gray-400" />
                            <span>Assigned: 10:30 AM</span>
                        </div>
                    </div>
                    <button className="w-full mt-4 bg-black text-white py-3 rounded-xl font-bold text-sm">
                        Start Job
                    </button>
                </div>
            </div>
        </div>
    )
}
