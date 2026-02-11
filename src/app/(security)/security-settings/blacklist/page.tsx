"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, Plus, Search, Trash2, AlertTriangle, ShieldAlert, UserX, Camera } from "lucide-react"
import { api, BlacklistItem } from "@/lib/api"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"

export default function BlacklistManagementPage() {
    const [blacklist, setBlacklist] = useState<BlacklistItem[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Form State
    const [newName, setNewName] = useState("")
    const [newReason, setNewReason] = useState("")

    useEffect(() => {
        loadBlacklist()
    }, [])

    const loadBlacklist = async () => {
        setIsLoading(true)
        try {
            const data = await api.getBlacklist()
            setBlacklist(data)
        } catch (error) {
            toast.error("Failed to load blacklist")
        } finally {
            setIsLoading(false)
        }
    }

    const handleAddBlacklist = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newName || !newReason) return

        setIsSubmitting(true)
        try {
            await api.addToBlacklist({
                name: newName,
                reason: newReason,
                reportedBy: "Current Guard" // Mock current user
            })
            toast.success("Added to blacklist", { description: `${newName} has been flagged.` })
            setNewName("")
            setNewReason("")
            setIsAddDialogOpen(false)
            loadBlacklist()
        } catch (error) {
            toast.error("Failed to add to blacklist")
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleRemove = async (id: string, name: string) => {
        if (!confirm(`Are you sure you want to remove ${name} from the blacklist?`)) return

        try {
            await api.removeFromBlacklist(id)
            toast.success("Removed from blacklist")
            loadBlacklist()
        } catch (error) {
            toast.error("Failed to remove")
        }
    }

    const filteredList = blacklist.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.reason.toLowerCase().includes(searchQuery.toLowerCase())
    )

    return (
        <div className="min-h-screen bg-background pb-20 lg:pb-0">
            {/* Header */}
            <div className="bg-card px-6 py-6 rounded-b-[2rem] border-b border-border shadow-sm sticky top-0 z-20">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link href="/security-settings" className="p-2 -ml-2 hover:bg-accent rounded-full transition-colors">
                            <ArrowLeft className="h-6 w-6" />
                        </Link>
                        <div>
                            <h1 className="text-xl font-bold flex items-center gap-2">
                                <ShieldAlert className="text-red-500" size={24} />
                                Blacklist
                            </h1>
                            <p className="text-xs text-muted-foreground">Manage flagged individuals</p>
                        </div>
                    </div>

                    <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                        <DialogTrigger asChild>
                            <Button size="sm" className="rounded-full bg-red-500 hover:bg-red-600">
                                <Plus size={16} className="mr-1" />
                                Add
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Flag Person</DialogTitle>
                                <DialogDescription>
                                    Add an individual to the blacklist. They will be flagged during entry scans.
                                </DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleAddBlacklist} className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Full Name</Label>
                                    <Input
                                        id="name"
                                        placeholder="e.g. John Doe"
                                        value={newName}
                                        onChange={(e) => setNewName(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="reason">Reason for flagging</Label>
                                    <Textarea
                                        id="reason"
                                        placeholder="Describe incident or reason..."
                                        value={newReason}
                                        onChange={(e) => setNewReason(e.target.value)}
                                        required
                                    />
                                </div>
                                {/* Photo mock - just visual for now */}
                                <div className="p-4 border-2 border-dashed border-muted rounded-xl flex flex-col items-center justify-center gap-2 text-muted-foreground cursor-not-allowed bg-muted/20">
                                    <Camera size={24} />
                                    <span className="text-xs">Photo capture unavailable</span>
                                </div>

                                <DialogFooter>
                                    <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
                                    <Button type="submit" variant="destructive" disabled={isSubmitting}>
                                        {isSubmitting ? "Flagging..." : "Add to Blacklist"}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                {/* Search */}
                <div className="mt-6 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                        placeholder="Search by name or reason..."
                        className="pl-9 bg-muted/50 border-transparent focus:bg-background rounded-xl"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {/* List */}
            <div className="p-6 space-y-4">
                {isLoading ? (
                    <div className="text-center py-10 text-muted-foreground">Loading blacklist...</div>
                ) : filteredList.length > 0 ? (
                    filteredList.map((item) => (
                        <div key={item.id} className="bg-card border border-red-500/20 rounded-2xl p-4 shadow-sm flex items-start gap-4">
                            <div className="h-12 w-12 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 shrink-0">
                                <UserX size={24} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start">
                                    <h3 className="font-bold text-foreground truncate pr-2">{item.name}</h3>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-muted-foreground hover:text-destructive -mt-1 -mr-2"
                                        onClick={() => handleRemove(item.id, item.name)}
                                    >
                                        <Trash2 size={16} />
                                    </Button>
                                </div>
                                <Badge variant="outline" className="text-xs bg-red-500/10 text-red-600 border-red-500/20 mb-2">
                                    {item.date}
                                </Badge>
                                <p className="text-sm text-muted-foreground bg-muted/50 p-2 rounded-lg">
                                    <span className="font-semibold text-xs text-foreground uppercase tracking-wider block mb-1">Reason</span>
                                    {item.reason}
                                </p>
                                <p className="text-xs text-muted-foreground mt-2">
                                    Reported by: <span className="text-foreground">{item.reportedBy}</span>
                                </p>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-20 opacity-50 space-y-4">
                        <ShieldAlert size={48} className="mx-auto text-muted-foreground" />
                        <p>No blacklisted individuals found.</p>
                    </div>
                )}
            </div>
        </div>
    )
}
