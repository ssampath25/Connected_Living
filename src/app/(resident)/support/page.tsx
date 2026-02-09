"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, ChevronDown, ChevronUp, Mail, HelpCircle, Phone, MessageSquare } from "lucide-react"
import { cn } from "@/lib/utils"

// Mock FAQ Data
const FAQS = [
    {
        question: "How do I update my profile details?",
        answer: "Go to the Profile page and tap the 'Edit' icon at the top right. You can verify your identity via OTP or Password to make sensitive changes like Email or Phone number."
    },
    {
        question: "How can I pay my maintenance bill?",
        answer: "Navigate to the 'Payment History' section from the Profile menu. You can view pending bills and pay them using your preferred payment method."
    },
    {
        question: "How do I add a family member?",
        answer: "Go to Settings > Family Members. Tap the 'Add Member' button, fill in the details, and save. You can also upload a profile picture for them."
    },
    {
        question: "Can I pre-approve visitors?",
        answer: "Yes, this feature is coming soon! You will be able to generate entry codes for your guests directly from the app."
    },
    {
        question: "What should I do in an emergency?",
        answer: "In case of an emergency, please contact the main gate security immediately via the intercom or the emergency contact number listed in the community dashboard."
    }
]

export default function SupportPage() {
    const router = useRouter()
    const [openIndex, setOpenIndex] = useState<number | null>(null)

    const toggleAccordion = (index: number) => {
        setOpenIndex(openIndex === index ? null : index)
    }

    return (
        <div className="min-h-screen bg-background pb-24">
            {/* Header */}
            <div className="bg-card p-4 flex items-center gap-4 shadow-sm sticky top-0 z-10 border-b border-border">
                <button onClick={() => router.back()} className="p-2 -ml-2 text-primary hover:bg-accent rounded-full transition-colors">
                    <ArrowLeft size={24} />
                </button>
                <h1 className="text-xl font-bold text-primary">Help & Support</h1>
            </div>

            <div className="p-6 space-y-6">

                {/* Contact Admin Card */}
                <div className="bg-primary rounded-2xl p-6 text-primary-foreground shadow-lg relative overflow-hidden">
                    <div className="relative z-10">
                        <div className="h-12 w-12 bg-white/20 rounded-xl flex items-center justify-center mb-4 backdrop-blur-sm">
                            <Mail size={24} className="text-white" />
                        </div>
                        <h2 className="text-xl font-bold mb-2">Need personal assistance?</h2>
                        <p className="text-primary-foreground/80 mb-6 text-sm">Contact the admin directly for specific queries or urgent issues.</p>

                        <a href="mailto:admin@connectedliving.com" className="inline-flex items-center gap-2 bg-background text-primary px-4 py-2.5 rounded-xl font-bold text-sm hover:bg-accent transition-colors shadow-sm">
                            <Mail size={16} />
                            Email Admin
                        </a>
                    </div>
                    {/* Decorative Background Elements */}
                    <div className="absolute top-0 right-0 -mt-8 -mr-8 h-32 w-32 bg-white/10 rounded-full blur-2xl"></div>
                    <div className="absolute bottom-0 left-0 -mb-8 -ml-8 h-32 w-32 bg-indigo-500/30 rounded-full blur-2xl"></div>
                </div>

                {/* FAQs Section */}
                <div>
                    <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                        <HelpCircle size={20} className="text-primary" />
                        Frequently Asked Questions
                    </h3>
                    <div className="space-y-3">
                        {FAQS.map((faq, index) => (
                            <div key={index} className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm transition-all duration-200">
                                <button
                                    onClick={() => toggleAccordion(index)}
                                    className="w-full flex items-center justify-between p-4 text-left hover:bg-accent/50 transition-colors"
                                >
                                    <span className="font-semibold text-foreground text-sm md:text-base">{faq.question}</span>
                                    <div className={cn(
                                        "p-2 rounded-full bg-muted text-muted-foreground transition-transform duration-200",
                                        openIndex === index && "bg-primary/10 text-primary rotate-180"
                                    )}>
                                        <ChevronDown size={16} />
                                    </div>
                                </button>
                                <div className={cn(
                                    "overflow-hidden transition-[max-height,opacity] duration-300 ease-in-out",
                                    openIndex === index ? "max-h-48 opacity-100" : "max-h-0 opacity-0"
                                )}>
                                    <div className="p-4 pt-0 text-sm text-muted-foreground leading-relaxed border-t border-border">
                                        {faq.answer}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Additional Support Options (Placeholder for robustness) */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-card p-4 rounded-2xl border border-border shadow-sm flex flex-col items-center text-center gap-2">
                        <div className="h-10 w-10 bg-green-500/10 text-green-600 dark:text-green-500 rounded-full flex items-center justify-center">
                            <Phone size={20} />
                        </div>
                        <p className="font-bold text-foreground text-sm">Emergency</p>
                        <p className="text-xs text-muted-foreground">Call Security</p>
                    </div>
                    <div className="bg-card p-4 rounded-2xl border border-border shadow-sm flex flex-col items-center text-center gap-2">
                        <div className="h-10 w-10 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center">
                            <MessageSquare size={20} />
                        </div>
                        <p className="font-bold text-foreground text-sm">Community</p>
                        <p className="text-xs text-muted-foreground">Ask Residents</p>
                    </div>
                </div>

            </div>
        </div>
    )
}
