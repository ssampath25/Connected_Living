"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Radio, BrainCircuit, MoreHorizontal, LogOut, Users } from "lucide-react"
import { cn } from "@/lib/utils"
import { useUI } from "@/components/providers/ui-provider"

export function ResidentSidebar() {
    const pathname = usePathname()
    const { isInteractivityDisabled } = useUI()

    const links = [
        {
            href: "/dashboard",
            label: "Home",
            icon: Home,
        },
        {
            href: "/hub",
            label: "Smart Hub",
            icon: Radio,
        },
        {
            href: "/ai",
            label: "AI Assistant",
            icon: BrainCircuit,
        },
        {
            href: "/community",
            label: "Community",
            icon: Users,
        },
        {
            href: "/more",
            label: "More",
            icon: MoreHorizontal,
        },
    ]

    return (
        <div className={cn(
            "hidden lg:flex flex-col w-64 h-screen bg-card border-r border-border fixed left-0 top-0 transition-all duration-300",
            isInteractivityDisabled && "pointer-events-none opacity-50 grayscale select-none"
        )}>
            <div className="p-8">
                <h1 className="text-2xl font-bold text-primary">Connected<br />Living</h1>
            </div>

            <nav className="flex-1 px-4 space-y-2">
                {links.map((link) => {
                    const Icon = link.icon
                    const isActive = pathname === link.href

                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={cn(
                                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300",
                                isActive
                                    ? "bg-primary/10 text-primary font-semibold"
                                    : "text-muted-foreground hover:bg-accent hover:text-foreground",
                                link.href === "/ai" && !isActive && "text-violet-500 hover:bg-violet-500/10 hover:text-violet-400 font-medium"
                            )}
                        >
                            <Icon className={cn(
                                "w-5 h-5",
                                isActive ? "text-primary" : "text-muted-foreground",
                                link.href === "/ai" && "text-violet-500 animate-pulse"
                            )} />
                            <span>{link.label}</span>
                            {link.href === "/ai" && (
                                <span className="ml-auto bg-violet-500/20 text-violet-500 text-[10px] uppercase font-bold px-2 py-0.5 rounded-full">New</span>
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
