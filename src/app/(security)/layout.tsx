import { SecurityBottomNav } from "@/components/modules/security/bottom-nav"
import { SecuritySidebar } from "@/components/modules/security/sidebar"

export default function SecurityLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="min-h-screen bg-background flex">
            {/* Sidebar for Desktop */}
            <SecuritySidebar />

            {/* Main Content Area */}
            <div className="flex-1 min-w-0 lg:pl-64 transition-all duration-300">
                <main className="mx-auto min-h-screen pb-24 lg:pb-8">
                    <div className="max-w-7xl mx-auto w-full">
                        {children}
                    </div>
                </main>
            </div>

            {/* Bottom Nav for Mobile */}
            <SecurityBottomNav />
        </div>
    )
}
