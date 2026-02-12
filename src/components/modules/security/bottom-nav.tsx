"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, ScanLine, BrainCircuit, AlertTriangle, MoreHorizontal } from "lucide-react"
import type { ComponentType } from "react"
import { cn } from "@/lib/utils"
// import { useUI } from "@/components/providers/ui-provider"

export function SecurityBottomNav() {
    const pathname = usePathname()
    // const { isInteractivityDisabled } = useUI()

    const links: Array<{ href: string; label: string; icon: ComponentType<{ size?: number; className?: string }>; primary?: boolean }> = [
        {
            href: "/gate",
            label: "Home",
            icon: Home,
        },
        {
            href: "/security-scanner",
            label: "Scan",
            icon: ScanLine,
        },
        {
            href: "/security-brain",
            label: "", // Label empty for primary
            icon: BrainCircuit,
            primary: true,
        },
        {
            href: "/security-alerts",
            label: "SOS",
            icon: AlertTriangle,
        },
        {
            href: "/security-settings",
            label: "Settings", // Adjusted from "Set.."
            icon: MoreHorizontal,
        },
    ]

    return (
        <div className={cn(
            "fixed bottom-0 left-0 right-0 z-50 bg-card shadow-[0_-4px_10px_rgba(0,0,0,0.1)] pb-safe rounded-t-[32px] lg:hidden border-t border-border transition-all duration-300",
            // isInteractivityDisabled && "pointer-events-none opacity-50 grayscale select-none"
        )}>
            <div className="flex h-20 max-w-lg mx-auto relative">
                {links.map((link) => {
                    const Icon = link.icon
                    const isPrimary = Boolean(link.primary)
                    const isActive = pathname === link.href

                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            className="flex-1 flex flex-col items-center justify-center relative"
                        >
                            {isPrimary ? (
                                <div className={cn(
                                    "absolute -top-6 h-16 w-16 rounded-full flex items-center justify-center shadow-lg border-4 transition-all duration-300 transform",
                                    isActive
                                        ? "bg-gradient-to-br from-green-600 to-emerald-700 border-green-500 scale-110 shadow-green-500/20"
                                        : "bg-gradient-to-br from-green-500 to-emerald-600 border-card hover:scale-105"
                                )}>
                                    <Icon className="w-8 h-8 text-white" />
                                </div>
                            ) : (
                                <div className={cn(
                                    "flex flex-col items-center transition-all duration-300",
                                    isActive ? "text-green-600 scale-110" : "text-muted-foreground hover:text-foreground"
                                )}>
                                    <div className={cn(
                                        "p-2 rounded-xl transition-colors",
                                        isActive ? "bg-green-500/10" : "bg-transparent"
                                    )}>
                                        <Icon className="w-6 h-6 outline-none" />
                                    </div>
                                    {/* Optional: Add label back if space permits, Resident hides it for some but shows for others? Resident hides labels for primary. */}
                                    {/* Resident shows labels for non-primary? Resident code: <span>{link.label}</span> NO, it uses Icon only in the rendered block for specific styling? Let's check Resident code I viewed. */}
                                    {/* Resident: `<span>{link.label}</span>` is NOT present in bottom-nav.tsx I viewed. It only shows Icon. */}
                                    {/* So I should NOT show label text to be "same". */}
                                </div>
                            )}
                        </Link>
                    )
                })}
            </div>
        </div>
    )
}
