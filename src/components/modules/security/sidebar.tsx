"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, ScanLine, BrainCircuit, AlertTriangle, MoreHorizontal, LogOut } from "lucide-react"
import { cn } from "@/lib/utils"
import { useUI } from "@/components/providers/ui-provider"

export function SecuritySidebar() {
    const pathname = usePathname()
    const { isInteractivityDisabled } = useUI()

    const links = [
        {
            href: "/gate",
            label: "Dashboard",
            icon: Home,
        },
        {
            href: "/security-scanner",
            label: "QR Scanner",
            icon: ScanLine,
        },
        {
            href: "/security-brain",
            label: "Brain",
            icon: BrainCircuit,
        },
        {
            href: "/security-alerts",
            label: "SOS",
            icon: AlertTriangle,
        },
        {
            href: "/security-settings",
            label: "Settings",
            icon: MoreHorizontal,
        },
    ]

    return (
        <div className={cn(
            "hidden lg:flex flex-col w-64 h-screen bg-card border-r border-border fixed left-0 top-0 transition-all duration-300",
            isInteractivityDisabled && "pointer-events-none opacity-50 grayscale select-none"
        )}>
            <div className="p-8">
                <h1 className="text-2xl font-bold text-green-600">Connected<br />Security</h1>
            </div>

            <nav className="flex-1 px-4 space-y-2">
                {links.map((link) => {
                    const Icon = link.icon
                    const isActive = pathname === link.href
                    const isBrain = link.href === "/security-brain"

                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={cn(
                                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300",
                                isActive
                                    ? "bg-green-500/10 text-green-600 font-semibold"
                                    : "text-muted-foreground hover:bg-accent hover:text-foreground",
                                isBrain && !isActive && "text-emerald-500 hover:bg-emerald-500/10 hover:text-emerald-400 font-medium"
                            )}
                        >
                            <Icon className={cn(
                                "w-5 h-5",
                                isActive ? "text-green-600" : "text-muted-foreground",
                                isBrain && "text-emerald-500"
                            )} />
                            <span>{link.label}</span>
                            {isBrain && (
                                <span className="ml-auto bg-emerald-500/20 text-emerald-500 text-[10px] uppercase font-bold px-2 py-0.5 rounded-full">New</span>
                            )}
                        </Link>
                    )
                })}
            </nav>

            <div className="p-4 border-t border-border">
                <button
                    onClick={() => {
                        if (confirm("Are you sure you want to log out?")) {
                            window.location.href = '/login'
                        }
                    }}
                    className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-red-500 hover:bg-red-500/10 border border-transparent hover:border-red-500/10 transition-all active:scale-[0.98]"
                >
                    <LogOut className="w-5 h-5" />
                    <span className="font-medium">Logout</span>
                </button>
            </div>
        </div>
    )
}
