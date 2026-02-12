import { ClipboardList, Hammer } from "lucide-react"

export default function WorkOrdersPage() {
    return (
        <div className="p-8">
            <div className="flex items-center gap-3 mb-8">
                <div className="h-12 w-12 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-700">
                    <ClipboardList size={24} />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Facility Manager</h1>
                    <p className="text-gray-500">Service Request Overview</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-4">
                    <h3 className="font-bold text-gray-800">New Requests</h3>
                    <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="h-10 w-10 bg-red-50 text-red-600 rounded-lg flex items-center justify-center">
                                <Hammer size={20} />
                            </div>
                            <div>
                                <h4 className="font-bold text-sm">Leaking Kitchen Sink</h4>
                                <p className="text-xs text-gray-500">Flat A-101 • Plumber</p>
                            </div>
                        </div>
                        <span className="text-xs font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded">High Priority</span>
                    </div>
                </div>
            </div>
        </div>
    )
}
