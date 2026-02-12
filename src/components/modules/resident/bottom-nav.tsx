"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Radio, BrainCircuit, MoreHorizontal, Users } from "lucide-react"
import { cn } from "@/lib/utils"
import { useUI } from "@/components/providers/ui-provider"

export function ResidentBottomNav() {
    const pathname = usePathname()
    const { isInteractivityDisabled } = useUI()

    const links = [
        {
            href: "/dashboard",
            label: "",
            icon: Home,
        },
        {
            href: "/hub",
            label: "Hub",
            icon: Radio,
        },
        {
            href: "/ai",
            label: "",
            icon: BrainCircuit, // Placeholder for AI
            primary: false,
        },
        {
            href: "/community",
            label: "Community",
            icon: Users,
        },
        {
            href: "/more",
            label: "",
            icon: MoreHorizontal,
        },
    ]

    return (
        <div className={cn(
            "fixed bottom-0 left-0 right-0 z-50 bg-card shadow-[0_-4px_10px_rgba(0,0,0,0.1)] pb-safe rounded-t-[32px] lg:hidden border-t border-border transition-all duration-300",
            isInteractivityDisabled && "pointer-events-none opacity-50 grayscale select-none"
        )}>
            <div className="flex h-20 max-w-lg mx-auto relative">
                {links.map((link) => {
                    const Icon = link.icon
                    const isAi = link.href === "/ai"
                    const isActive = pathname === link.href

                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            className="flex-1 flex flex-col items-center justify-center relative"
                        >
                            {isAi ? (
                                <div className={cn(
                                    "absolute -top-6 h-16 w-16 rounded-full flex items-center justify-center shadow-lg border-4 transition-all duration-300 transform",
                                    isActive
                                        ? "bg-gradient-to-br from-violet-600 to-indigo-700 border-primary scale-110 shadow-indigo-500/20"
                                        : "bg-gradient-to-br from-violet-500 to-indigo-500 border-card hover:scale-105"
                                )}>
                                    <Icon className="w-8 h-8 text-white" />
                                </div>
                            ) : (
                                <div className={cn(
                                    "flex flex-col items-center transition-all duration-300",
                                    isActive ? "text-primary scale-110" : "text-muted-foreground hover:text-foreground"
                                )}>
                                    <div className={cn(
                                        "p-2 rounded-xl transition-colors",
                                        isActive ? "bg-primary/10" : "bg-transparent"
                                    )}>
                                        <Icon className="w-6 h-6 outline-none" />
                                    </div>
                                </div>
                            )}
                        </Link>
                    )
                })}
            </div>
        </div>
    )
}
