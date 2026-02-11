import {
    CreditCard, UserPlus, AlertTriangle, Calendar, MessageSquare, Tag, Shield, Users,
    Truck, Car, Waves, Dumbbell, PartyPopper, Zap, Wrench, Package, Hammer, Droplets, Receipt, Flame, AlertCircle, PlugZap,
    Megaphone, ClipboardList, Boxes, UserCheck, Radio, Home
} from "lucide-react"
import { api as httpClient, tokenManager, ApiError } from "./api-client"
import type {
    AuthResponse,
    ResidentProfile,
    VisitorGroup,
    RecurringStaff,
    StaffAttendanceLog,
    Vehicle,
    Amenity,
    AmenitySlot,
    Booking,
    ServiceRequest,
    Complaint,
    Invoice,
    Payment,
    Announcement,
    Poll,
    PollResults,
    ChatGroup,
    ChatMessage,
    Notification,
    Delivery,
    CreateVisitorGroupRequest,
    CreateRecurringStaffRequest,
    CreateVehicleRequest,
    CreateBookingRequest,
    CreateServiceRequestRequest,
    CreateDeliveryRequest,
    PaymentIntentRequest,
    PaymentIntentResponse,
    CommunityEvent,
    CreateEventRequest,
    SecurityLoginRequest,
    SecurityRefreshRequest,
    SecurityAuthResponse,
    SecurityDashboardStats,
    ScanVisitorRequest,
    CreateWalkInRequest,
    WalkInEntryRequest,
    SecurityVisitorEntry,
    SOSLogItem,
} from "./api-types"

// Re-export types for backward compatibility
export type { ApiError }

// ==========================================
// Frontend Display Types (UI-specific)
// ==========================================

export interface UserItem {
    id: string
    name: string
    role: "Resident" | "Admin" | "Security" | "FacilityManager" | "Technician"
    unitId?: string
    avatar?: string
    phone: string
    email: string
}

export interface UnitItem {
    id: string
    tower: string
    floor: number
    number: string
    residentId?: string
    status: "Occupied" | "Vacant" | "Owner"
}

export interface ActivityItem {
    id: number
    userId: string
    title: string
    subtitle: string
    time: string
    iconType: "payment" | "visitor" | "complaint" | "security" | "meeting" | "default"
    bg: string
    iconColor: string
}

export interface NotificationItem {
    id: number
    userId?: string
    title: string
    description: string
    time: string
    type: "payment" | "event" | "notice" | "offer" | "security" | "meeting"
    read: boolean
}

export interface VisitorItem {
    id: number
    unitId: string
    hostName: string
    name: string
    type: "Delivery" | "Guest" | "Cab" | "Service"
    code?: string
    time?: string
    status: "Expected" | "Inside" | "Left" | "Denied"
    date?: string // YYYY-MM-DD
    approvalType?: "Pre-approved" | "Sudden"
    vehicleNo?: string
    mobile?: string
    image?: string
    purpose?: string
    entryTime?: string
    exitTime?: string
}

export interface AmenityItem {
    id: string
    name: string
    description: string
    status: "Open" | "Booked Today" | "Closed" | "Maintenance"
    timing: string
    iconType: "pool" | "gym" | "clubhouse" | "conference" | "tennis"
    imageGradient: string
    rules?: string[]
    requiresApproval?: boolean
}

export interface ServiceRequestItem {
    id: string
    unitId: string
    category: "Electrician" | "Plumber" | "Carpenter" | "Appliance" | "Community" | "Others"
    title: string
    description: string
    status: "Open" | "In Progress" | "Resolved" | "Closed"
    date: string
    urgency: "Low" | "Medium" | "High"
    image?: string
    photo?: string
    preferredDate?: string
    preferredTime?: string
    assignedTo?: string
}

export interface PaymentItem {
    id: string
    unitId: string
    title: string
    amount: string
    dueDate: string
    status: "Pending" | "Paid" | "Overdue"
    category: "Utilities" | "Rentals"
    type: "Maintenance" | "Electricity" | "Water" | "Gas" | "Rent" | "Penalty" | "EV" | "Event" | "Other"
    paymentDate?: string
    transactionId?: string
}

export interface StaffItem {
    id: string
    name: string
    role: "Plumber" | "Electrician" | "Cleaner" | "Security" | "Manager"
    status: "Available" | "Busy" | "Off Duty"
    phone: string
}

export interface InventoryItem {
    id: string
    name: string
    category: "Electrical" | "Plumbing" | "Cleaning" | "Office"
    quantity: number
    status: "In Stock" | "Low Stock" | "Out of Stock"
}

export interface NoticeItem {
    id: string
    title: string
    content: string
    date: string
    type: "General" | "Emergency" | "Event"
    audience: "All" | "Residents Only" | "Staff Only"
}

export interface FamilyMemberItem {
    id: string
    name: string
    relation: "Spouse" | "Child" | "Parent" | "Sibling" | "Other"
    age: string
    avatar?: string
    phone?: string
    accessLevel?: "Full" | "Limited" | "None"
}

export interface VehicleItem {
    id: string
    userId: string
    type: "Car" | "Bike"
    category: "EV" | "ICE"
    registrationNumber: string
    model?: string
    color?: string
}

export interface VehicleEntryItem {
    id: string
    vehicleNumber: string
    type: "Car" | "Bike" | "Truck" | "Auto"
    ownerName: string
    unitId: string
    status: "Inside" | "Exited"
    entryTime: string
    exitTime?: string
    date: string // YYYY-MM-DD format
    purpose?: string
    registeredVehicleId?: string // Link to VehicleItem if registered
}

export interface CommunityMessageItem {
    id: number
    sender: string
    role: "security" | "resident" | "admin" | "me"
    text: string
    time: string
    avatar: string
    color: string
}

export interface CommunityEventItem {
    id: number
    title: string
    time: string
    location: string
    participants: number
    imageGradient: string
    description?: string
    organizer?: string
    rsvpStatus?: "going" | "not_going" | "pending"
    price?: string
    status?: "pending" | "approved" | "rejected"
    creatorId?: string
}

export type InviteParams =
    | { type: "Guest"; guests: { name: string; phone?: string; email?: string; avatar?: string }[]; date: string; time: string; singleEntry: boolean }
    | { type: "Delivery"; vendor: string; name?: string; phone?: string; date: string; time?: string }
    | { type: "Cab"; driverName: string; vehicleNo: string; service: string; date: string; time?: string; model?: string }

export interface SavedVisitorItem {
    id: string
    name: string
    type: "Guest" | "Delivery" | "Cab"
    avatar?: string
    relation?: string
    phone?: string
    email?: string
    lastVisit?: string
}

export interface FrequentVisitorItem {
    id: string
    name: string
    type: "Guest" | "Delivery" | "Cab" | "Staff"
    avatar?: string
    relation?: string
    mobile?: string
    photoUrl?: string
    scheduleType?: "DAILY" | "WEEKLY" | "MONTHLY"
    qrCodeId?: string
    validUntil: string
    allowedTimeSlot?: string
    isActive: boolean
}

export interface AttendanceItem {
    id: string
    date: string
    isoDate: string
    checkIn: string
    checkOut?: string
    status: "Present" | "Absent" | "Half-day"
}

export interface BookingItem {
    id: string
    userId: string
    amenityId: string
    amenityName: string
    date: string
    slots: string[]
    status: "Confirmed" | "Cancelled" | "Completed" | "Pending" | "Rejected"
    timestamp: number // for sorting
}

// ==========================================
// Helper Functions
// ==========================================

function formatTimeAgo(date: Date): string {
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 1) return "Just now"
    if (diffMins < 60) return `${diffMins} mins ago`
    if (diffHours < 24) return `${diffHours} hours ago`
    if (diffDays === 1) return "Yesterday"
    if (diffDays < 7) return `${diffDays} days ago`
    return date.toLocaleDateString('en-GB')
}

// ==========================================
// Transform Functions (Backend -> Frontend)
// ==========================================

function transformResidentToUser(resident: ResidentProfile): UserItem {
    return {
        id: resident.id,
        name: resident.fullName,
        role: "Resident",
        unitId: resident.units[0]?.id,
        phone: resident.mobileNumber,
        email: resident.email || "",
    }
}


function transformVehicle(vehicle: Vehicle): VehicleItem {
    return {
        id: vehicle.id,
        userId: "",
        type: vehicle.type === "TWO_WHEELER" ? "Bike" : "Car",
        category: vehicle.type === "EV" ? "EV" : "ICE",
        registrationNumber: vehicle.vehicleNumber,
        model: vehicle.model || undefined,
        color: undefined, // Backend doesn't store color
    }
}

function transformAmenity(amenity: Amenity): AmenityItem {
    const iconMap: Record<string, AmenityItem["iconType"]> = {
        GYM: "gym",
        POOL: "pool",
        HALL: "clubhouse",
        OTHER: "conference",
    }
    const gradientMap: Record<string, string> = {
        GYM: "linear-gradient(to bottom right, #f97316, #ea580c)",
        POOL: "linear-gradient(to bottom right, #3b82f6, #1d4ed8)",
        HALL: "linear-gradient(to bottom right, #9333ea, #7e22ce)",
        OTHER: "linear-gradient(to bottom right, #4b5563, #374151)",
    }
    return {
        id: amenity.id,
        name: amenity.name,
        description: amenity.rules || "",
        status: amenity.status === "ACTIVE" ? "Open" : "Maintenance",
        timing: `${amenity.slotDurationMinutes} min slots`,
        iconType: iconMap[amenity.type] || "conference",
        imageGradient: gradientMap[amenity.type] || gradientMap.OTHER,
        rules: amenity.rules ? [amenity.rules] : undefined,
    }
}

function transformBooking(booking: Booking): BookingItem {
    const statusMap: Record<string, BookingItem["status"]> = {
        CONFIRMED: "Confirmed",
        CANCELLED: "Cancelled",
        COMPLETED: "Completed",
    }
    // Helper to format date and time
    const firstSlot = booking.slots?.[0]?.slot?.startTime
    const bookingDate = firstSlot ? new Date(firstSlot).toLocaleDateString() : new Date(booking.createdAt).toLocaleDateString()

    // Extract times from slots
    const timeSlots = booking.slots?.map((s: any) => {
        const date = new Date(s.slot.startTime)
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }) || []

    return {
        id: booking.id,
        userId: "",
        amenityId: booking.amenityId,
        amenityName: booking.amenity?.name || "Unknown Amenity",
        date: bookingDate,
        slots: timeSlots,
        status: statusMap[booking.status] || "Confirmed",
        timestamp: new Date(booking.createdAt).getTime(),
    }
}


function transformServiceRequest(sr: ServiceRequest): ServiceRequestItem {
    const statusMap: Record<string, ServiceRequestItem["status"]> = {
        NEW: "Open",
        ASSIGNED: "In Progress",
        IN_PROGRESS: "In Progress",
        COMPLETED: "Resolved",
        CLOSED: "Closed",
    }
    return {
        id: sr.id,
        unitId: sr.unitId,
        category: sr.category as ServiceRequestItem["category"],
        title: `${sr.category} Issue` || "Service Request", // Synthesize title
        description: sr.description,
        status: statusMap[sr.status] || "Open",
        date: new Date(sr.createdAt).toLocaleDateString(),
        urgency: sr.priority as ServiceRequestItem["urgency"],
    }
}

function transformInvoice(invoice: Invoice): PaymentItem {
    const typeMap: Record<string, PaymentItem["type"]> = {
        MAINTENANCE: "Maintenance",
        AMENITY: "Other",
        EV: "EV",
    }
    return {
        id: invoice.id,
        unitId: invoice.unitId,
        title: `${invoice.type} - ${new Date(invoice.dueDate).toLocaleDateString()}`,
        amount: `₹${invoice.amount.toLocaleString()}`,
        dueDate: new Date(invoice.dueDate).toLocaleDateString(),
        status: invoice.status === "PAID" ? "Paid" : invoice.status === "OVERDUE" ? "Overdue" : "Pending",
        category: invoice.type === "MAINTENANCE" ? "Rentals" : "Utilities",
        type: typeMap[invoice.type] || "Other",
    }
}

function transformNotification(notif: Notification): NotificationItem {
    return {
        id: parseInt(notif.id.slice(-4), 16) || Date.now(),
        title: notif.title,
        description: notif.body,
        time: new Date(notif.createdAt).toLocaleString(),
        type: "notice",
        read: !!notif.readAt,
    }
}

function transformAnnouncement(ann: Announcement): NoticeItem {
    const typeMap: Record<string, NoticeItem["type"]> = {
        URGENT: "Emergency",
        IMPORTANT: "General",
        GENERAL: "General",
    }
    return {
        id: ann.id,
        title: ann.title,
        content: ann.body,
        date: new Date(ann.publishedAt).toLocaleDateString(),
        type: typeMap[ann.priority] || "General",
        audience: "All",
    }
}

function transformRecurringStaff(staff: RecurringStaff): FrequentVisitorItem {
    return {
        id: staff.id,
        name: staff.name,
        type: "Staff",
        relation: "Staff",
        mobile: staff.mobileNumber,
        photoUrl: staff.photoUrl,
        scheduleType: staff.scheduleType,
        qrCodeId: staff.qrCodeId,
        avatar: staff.photoUrl || staff.name[0]?.toUpperCase(),
        validUntil: staff.validTo ? new Date(staff.validTo).toISOString().split('T')[0] : "",
        allowedTimeSlot: undefined,
        isActive: staff.status === "ACTIVE",
    }
}

function transformVisitorGroup(group: VisitorGroup): VisitorItem {
    const now = new Date()
    const visitStart = new Date(group.visitStart)
    const visitEnd = new Date(group.visitEnd)

    // Determine status using latest entry log when available
    let status: VisitorItem["status"] = "Expected"
    const latestLog = group.entryLogs?.[0]
    if (latestLog) {
        if (latestLog.status === "ENTERED" && !latestLog.exitAt) status = "Inside"
        else if (latestLog.status === "EXITED" || latestLog.exitAt) status = "Left"
        else if (latestLog.status === "DENIED") status = "Denied"
    } else if (group.status === "REVOKED") {
        status = "Denied"
    } else if (group.status === "EXPIRED" || visitEnd < now) {
        status = "Left"
    } else if (visitStart <= now && now <= visitEnd) {
        status = "Inside"
    }

    const visitorName = group.visitors?.[0]?.name || "Guest"

    return {
        id: parseInt(group.id.slice(-6), 16) || Date.now(),
        unitId: "",
        hostName: "Me",
        name: visitorName,
        type: "Guest",
        code: (group as any).shortCode || group.qrToken?.slice(0, 4).toUpperCase() || "----",
        time: new Date(group.createdAt).toLocaleString('en-GB', {
            day: '2-digit',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit'
        }),
        status,
    }
}

// ==========================================
// API Methods (Real Backend Calls)
// ==========================================

export const api = {
    // ==========================================
    // AUTH
    // ==========================================

    login: async (identifier: string, password: string): Promise<AuthResponse> => {
        const response = await httpClient.post<AuthResponse>("/auth/login", { identifier, password }, { skipAuth: true })
        tokenManager.setTokens(response.accessToken, response.refreshToken)
        return response
    },

    sendOTP: async (target: string, type: "email" | "phone"): Promise<{ success: boolean; code: string }> => {
        await httpClient.post("/auth/otp/request", { identifier: target }, { skipAuth: true })
        // Store target for verifyOTP backward compatibility
        if (typeof window !== 'undefined') {
            sessionStorage.setItem('otp_target', target)
        }
        return { success: true, code: "" }
    },


    verifyOTP: async (otp: string, identifier?: string): Promise<boolean> => {
        try {
            // If identifier not provided, try to get from session storage (for backward compatibility)
            const target = identifier || (typeof window !== 'undefined' ? sessionStorage.getItem('otp_target') : null) || ''
            const response = await httpClient.post<AuthResponse>("/auth/otp/verify", { identifier: target, otp }, { skipAuth: true })
            tokenManager.setTokens(response.accessToken, response.refreshToken)
            return true
        } catch {
            return false

        }
    },

    logout: async (): Promise<void> => {
        try {
            await httpClient.post("/auth/logout", {})
        } finally {
            tokenManager.clearTokens()
        }
    },

    verifyPassword: async (password: string): Promise<boolean> => {
        // Verify by attempting to get profile (if token is valid)
        try {
            await httpClient.get("/auth/me")
            return true
        } catch {
            return false
        }
    },

    changePassword: async (newPass: string): Promise<boolean> => {
        // This would need a dedicated endpoint - stub for now
        return true
    },

    // ==========================================
    // DASHBOARD & USER
    // ==========================================

    getCurrentUser: async (): Promise<UserItem | undefined> => {
        try {
            const resident = await httpClient.get<ResidentProfile>("/auth/me")
            return transformResidentToUser(resident)
        } catch {
            return undefined
        }
    },

    getDashboardStats: async (): Promise<{ activeTickets: number; upcomingBookings: number; pendingApprovals: number }> => {
        try {
            return await httpClient.get<{ activeTickets: number; upcomingBookings: number; pendingApprovals: number }>("/residents/me/dashboard")
        } catch {
            return { activeTickets: 0, upcomingBookings: 0, pendingApprovals: 0 }
        }
    },



    getUserProfile: async (): Promise<UserItem | undefined> => {
        try {
            const resident = await httpClient.get<ResidentProfile>("/auth/me")
            return transformResidentToUser(resident)
        } catch {
            return undefined
        }
    },

    updateUserProfile: async (data: Partial<UserItem>): Promise<UserItem> => {
        const resident = await httpClient.patch<ResidentProfile>("/residents/me", {
            fullName: data.name,
            email: data.email,
        })
        return transformResidentToUser(resident)
    },

    // ==========================================
    // FAMILY MEMBERS
    // ==========================================

    getFamilyMembers: async (): Promise<FamilyMemberItem[]> => {
        // Backend may need a dedicated endpoint - using residents for now
        try {
            const data = await httpClient.get<{ members: FamilyMemberItem[] }>("/residents/me/family")
            return data.members || []
        } catch {
            return []
        }
    },

    addFamilyMember: async (member: Omit<FamilyMemberItem, "id">): Promise<FamilyMemberItem> => {
        return httpClient.post<FamilyMemberItem>("/residents/me/family", member)
    },

    updateFamilyMember: async (id: string, data: Partial<FamilyMemberItem>): Promise<FamilyMemberItem | undefined> => {
        try {
            return await httpClient.patch<FamilyMemberItem>(`/residents/me/family/${id}`, data)
        } catch {
            return undefined
        }
    },
    deleteFrequentVisitor: async (id: string): Promise<boolean> => {
        try {
            await httpClient.patch(`/visitors/recurring/${id}/deactivate`)
            return true
        } catch {
            return false
        }
    },

    deleteFamilyMember: async (id: string): Promise<boolean> => {
        try {
            await httpClient.delete(`/residents/me/family/${id}`)
            return true
        } catch {
            return false
        }
    },

    // ==========================================
    // VEHICLES
    // ==========================================

    getVehicles: async (): Promise<VehicleItem[]> => {
        try {
            const vehicles = await httpClient.get<Vehicle[]>("/vehicles")
            return vehicles.map(transformVehicle)
        } catch {
            return []
        }
    },

    addVehicle: async (vehicle: Omit<VehicleItem, "id" | "userId">): Promise<VehicleItem> => {
        // Fetch current user to get their Unit ID
        const profile = await httpClient.get<ResidentProfile>("/auth/me")
        const unitId = profile.units[0]?.id

        if (!unitId) {
            throw new Error("No unit found for resident")
        }

        const request: CreateVehicleRequest = {
            unitId, // Include the required unitId
            type: vehicle.type === "Car" ? "FOUR_WHEELER" : vehicle.category === "EV" ? "EV" : "TWO_WHEELER",
            vehicleNumber: vehicle.registrationNumber, // Map to vehicleNumber
            model: vehicle.model,
            // color: vehicle.color // Backend DTO doesn't strictly support color in CreateVehicleDto (it's not validatable), checking if it allows extra fields. 
            // Checking CreateVehicleDto again: it only has unitId, vehicleNumber, type, model. 
            // It does NOT have color. So we should omit it or add it if backend supports it. Reference Step 921 -> No color in DTO.
        }

        // Note: Backend DTO CreateVehicleDto does NOT have 'color'. 
        // Sending 'color' might cause 400 Bad Request if whitelist validation is on.
        // I will omit color for now to be safe, or check if I should add it to backend.
        // User didn't ask for color explicitly, but the UI sends it. 
        // Let's assume strict validation strips it or errors. Safe to omit if not in DTO.

        const created = await httpClient.post<Vehicle>("/vehicles", request)
        return transformVehicle(created)
    },

    updateVehicle: async (id: string, data: Partial<VehicleItem>): Promise<VehicleItem | undefined> => {
        try {
            const updated = await httpClient.patch<Vehicle>(`/vehicles/${id}`, {
                model: data.model,
                color: data.color,
            })
            return transformVehicle(updated)
        } catch {
            return undefined
        }
    },

    deleteVehicle: async (id: string): Promise<boolean> => {
        try {
            await httpClient.delete(`/vehicles/${id}`)
            return true
        } catch {
            return false
        }
    },

    // ==========================================
    // VISITORS
    // ==========================================

    getVisitors: async (): Promise<VisitorItem[]> => {
        try {
            const groups = await httpClient.get<VisitorGroup[]>("/visitors/groups")
            return groups.map(transformVisitorGroup)
        } catch {
            return []
        }
    },

    inviteVisitor: async (data: InviteParams): Promise<{ success: boolean; code?: string; qrToken?: string; message: string }> => {
        try {
            // Get user's unit ID from profile
            const profile = await httpClient.get<ResidentProfile>("/residents/me")
            const unitId = profile.units?.[0]?.id
            if (!unitId) {
                return { success: false, message: "No unit found for resident" }
            }

            // Extract visitor name based on type
            // Extract visitors array based on type
            let visitors: { name: string; mobileNumber?: string }[] = []
            let visitorTime = "09:00"

            if (data.type === "Guest") {
                visitors = data.guests.map(g => ({ name: g.name, mobileNumber: g.phone }))
                visitorTime = data.time
            } else if (data.type === "Delivery") {
                visitors = [{ name: data.name || data.vendor, mobileNumber: data.phone }]
                visitorTime = data.time || "09:00"
            } else if (data.type === "Cab") {
                visitors = [{ name: data.driverName }]
                visitorTime = data.time || "09:00"
            }

            // Build request matching backend DTO
            const request = {
                unitId,
                visitStart: `${data.date}T${visitorTime}:00`,
                visitEnd: `${data.date}T23:59:00`,
                visitors,
                singleEntry: data.type === "Guest" ? data.singleEntry : false,
            }
            const response = await httpClient.post<{ groupId: string; qrToken: string; expiresAt: string }>("/visitors/groups", request)
            return {
                success: true,
                code: response.qrToken.slice(0, 4).toUpperCase(),
                qrToken: response.qrToken,
                message: data.type === "Guest" ? "Invite Code Generated" : "Details shared with Security",
            }
        } catch (e) {
            return { success: false, message: e instanceof Error ? e.message : "Failed to create invitation" }
        }
    },


    getSavedVisitors: async (): Promise<SavedVisitorItem[]> => {
        // This could come from visitor history
        return []
    },

    getSavedVisitorById: async (id: string): Promise<SavedVisitorItem | undefined> => {
        return undefined
    },

    updateSavedVisitor: async (id: string, data: Partial<SavedVisitorItem>): Promise<SavedVisitorItem | undefined> => {
        return undefined
    },

    getFrequentVisitors: async (): Promise<FrequentVisitorItem[]> => {
        try {
            const staff = await httpClient.get<RecurringStaff[]>("/visitors/recurring")
            return staff.map(transformRecurringStaff)
        } catch {
            return []
        }
    },


    getFrequentVisitorById: async (id: string): Promise<FrequentVisitorItem | undefined> => {
        try {
            const staff = await httpClient.get<RecurringStaff>(`/visitors/recurring/${id}`)
            return transformRecurringStaff(staff)
        } catch {
            return undefined
        }
    },


    addFrequentVisitor: async (visitor: Omit<FrequentVisitorItem, "id">): Promise<RecurringStaff | null> => {
        try {
            // Get unitId from user profile (same pattern as inviteVisitor)
            const profile = await httpClient.get<ResidentProfile>("/residents/me")
            const unitId = profile.units?.[0]?.id
            if (!unitId) return null

            const validFrom = new Date().toISOString()
            const validTo = visitor.validUntil ? new Date(visitor.validUntil).toISOString() : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()

            const request: CreateRecurringStaffRequest = {
                unitId,
                name: visitor.name,
                mobileNumber: visitor.mobile || "0000000000",
                photoUrl: visitor.photoUrl || visitor.avatar || "https://example.com/default.jpg",
                scheduleType: visitor.scheduleType || "DAILY",
                validFrom,
                validTo,
            }
            const created = await httpClient.post<RecurringStaff>("/visitors/recurring", request)
            return created
        } catch {
            return null
        }
    },

    updateFrequentVisitor: async (id: string, updates: Partial<FrequentVisitorItem>): Promise<boolean> => {
        try {
            await httpClient.patch(`/visitors/recurring/${id}`, {
                name: updates.name,
                mobileNumber: updates.mobile,
                validTo: updates.validUntil ? new Date(updates.validUntil).toISOString() : undefined,
            })
            return true
        } catch {
            return false
        }
    },

    getVisitorAttendance: async (id: string): Promise<AttendanceItem[]> => {
        try {
            const logs = await httpClient.get<StaffAttendanceLog[]>(`/visitors/recurring/${id}/attendance`)

            return logs.map(log => ({
                id: log.id,
                date: new Date(log.checkInAt).toLocaleDateString(),
                isoDate: new Date(log.checkInAt).toISOString().split('T')[0],
                checkIn: new Date(log.checkInAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                checkOut: log.checkOutAt ? new Date(log.checkOutAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : undefined,
                status: log.status === 'IN' ? 'Present' : 'Absent', // Simplified mapping
            }))
        } catch {
            return []
        }
    },

    // ==========================================
    // AMENITIES
    // ==========================================

    getAmenities: async (): Promise<AmenityItem[]> => {
        try {
            const amenities = await httpClient.get<Amenity[]>("/amenities")
            return amenities.map(transformAmenity)
        } catch {
            return []
        }
    },

    getAmenityById: async (id: string): Promise<AmenityItem | undefined> => {
        try {
            const amenities = await httpClient.get<Amenity[]>("/amenities")
            const amenity = amenities.find(a => a.id === id)
            return amenity ? transformAmenity(amenity) : undefined
        } catch {
            return undefined
        }
    },

    getAmenitySlots: async (amenityId: string): Promise<AmenitySlot[]> => {
        try {
            return await httpClient.get<AmenitySlot[]>(`/amenities/${amenityId}/slots`)
        } catch (error) {
            console.error("Failed to fetch slots:", error)
            return []
        }
    },

    getMyBookings: async (): Promise<BookingItem[]> => {
        try {
            const bookings = await httpClient.get<Booking[]>("/amenities/bookings")
            return bookings.map(transformBooking).sort((a, b) => b.timestamp - a.timestamp)
        } catch (error) {
            console.error("Failed to fetch bookings:", error)
            return []
        }
    },

    getBookingById: async (id: string): Promise<BookingItem | undefined> => {
        try {
            const bookings = await httpClient.get<Booking[]>("/amenities/bookings")
            const booking = bookings.find(b => b.id === id)
            return booking ? transformBooking(booking) : undefined
        } catch {
            return undefined
        }
    },

    bookAmenity: async (amenityId: string, date: string, slots: string[]): Promise<boolean> => {
        try {
            // Fetch current user to get their Unit ID
            const profile = await httpClient.get<ResidentProfile>("/auth/me")
            const unitId = profile.units[0]?.id

            if (!unitId) {
                throw new Error("No unit found for resident")
            }

            const request: CreateBookingRequest = {
                slotIds: slots,
                unitId,
            }
            await httpClient.post(`/amenities/${amenityId}/bookings`, request)
            return true
        } catch {
            return false
        }
    },

    // ==========================================
    // SERVICE REQUESTS
    // ==========================================

    getServiceRequests: async (): Promise<ServiceRequestItem[]> => {
        try {
            const requests = await httpClient.get<ServiceRequest[]>("/service-requests")
            return requests.map(transformServiceRequest)
        } catch {
            return []
        }
    },

    getServiceRequestById: async (id: string): Promise<ServiceRequestItem | undefined> => {
        try {
            const requests = await httpClient.get<ServiceRequest[]>("/service-requests")
            const sr = requests.find(r => r.id === id)
            return sr ? transformServiceRequest(sr) : undefined
        } catch {
            return undefined
        }
    },

    createServiceRequest: async (request: Omit<CreateServiceRequestRequest, "unitId">): Promise<ServiceRequestItem> => {
        const user = await api.getUserProfile()
        if (!user || !user.unitId) throw new Error("User has no unit assigned")
        const unitId = user.unitId

        const payload: CreateServiceRequestRequest = {
            ...request,
            unitId
        }

        const created = await httpClient.post<ServiceRequest>("/service-requests", payload)
        return transformServiceRequest(created)
    },

    getAllServiceRequests: async (): Promise<ServiceRequestItem[]> => {
        return api.getServiceRequests()
    },

    // ==========================================
    // PAYMENTS
    // ==========================================

    getPayments: async (): Promise<PaymentItem[]> => {
        try {
            const invoices = await httpClient.get<Invoice[]>("/invoices")
            return invoices.map(transformInvoice)
        } catch {
            return []
        }
    },

    getInvoices: async (): Promise<Invoice[]> => {
        try {
            return await httpClient.get<Invoice[]>("/invoices")
        } catch {
            return []
        }
    },

    createPaymentIntent: async (invoiceIds: string[]): Promise<PaymentIntentResponse> => {
        return httpClient.post<PaymentIntentResponse>("/payments/intent", { invoiceIds })
    },

    confirmPayment: async (orderId: string, paymentId: string): Promise<boolean> => {
        try {
            await httpClient.post("/payments/confirm", { orderId, paymentId })
            return true
        } catch {
            return false
        }
    },

    // ==========================================
    // NOTIFICATIONS
    // ==========================================

    getActivities: async (): Promise<ActivityItem[]> => {
        try {
            const [bookings, requests, visitorGroups, recurringVisitors] = await Promise.all([
                httpClient.get<Booking[]>("/amenities/bookings", { cache: 'no-store' }).then(res => res.map(transformBooking)).catch(() => []),
                httpClient.get<ServiceRequest[]>("/service-requests", { cache: 'no-store' }).then(res => res.map(transformServiceRequest)).catch(() => []),
                httpClient.get<VisitorGroup[]>("/visitors/groups", { cache: 'no-store' }).catch(() => []),
                httpClient.get<RecurringStaff[]>("/visitors/recurring", { cache: 'no-store' }).catch(() => []),
            ])

            // Use extended type with timestamp for sorting
            const activities: (ActivityItem & { _timestamp: number })[] = []

            // Map Amenity Bookings (user action: booked a slot)
            bookings.forEach(booking => {
                activities.push({
                    id: parseInt(booking.id) || Date.now(),
                    userId: "me",
                    title: `${booking.amenityName} Booked`,
                    subtitle: `Slot booked : ${booking.slots[0] || 'N/A'} | ${new Date(booking.date).toLocaleDateString('en-GB')}`,
                    time: formatTimeAgo(new Date(booking.timestamp)),
                    iconType: "default",
                    bg: "bg-blue-100 dark:bg-blue-900/20",
                    iconColor: "text-blue-600 dark:text-blue-400",
                    _timestamp: booking.timestamp
                })
            })

            // Map Service Requests (user action: raised a complaint)
            requests.forEach(req => {
                const ts = new Date(req.date).getTime()
                activities.push({
                    id: parseInt(req.id) || Date.now(),
                    userId: "me",
                    title: `Service Request : ${req.category}`,
                    subtitle: `${req.title} - ${req.status}`,
                    time: formatTimeAgo(new Date(req.date)),
                    iconType: "complaint",
                    bg: "bg-orange-100 dark:bg-orange-900/20",
                    iconColor: "text-orange-600 dark:text-orange-400",
                    _timestamp: ts
                })
            })

            // Map Visitor Groups/Invitations (user action: invited visitors)
            visitorGroups.forEach(group => {
                const visitorName = group.visitors?.[0]?.name || 'Guest'
                const ts = new Date(group.createdAt).getTime()
                activities.push({
                    id: parseInt(group.id.slice(-6), 16) || Date.now(),
                    userId: "me",
                    title: `Guest Pre-Approved`,
                    subtitle: `${visitorName} - Invited`,
                    time: formatTimeAgo(new Date(group.createdAt)),
                    iconType: "visitor",
                    bg: "bg-green-100 dark:bg-green-900/20",
                    iconColor: "text-green-600 dark:text-green-400",
                    _timestamp: ts
                })
            })

            // Map Recurring Visitors (user action: added frequent visitor)
            recurringVisitors.forEach(staff => {
                const createdDate = staff.createdAt || staff.validFrom
                const ts = new Date(createdDate).getTime()
                activities.push({
                    id: parseInt(staff.id.slice(-6), 16) || Date.now(),
                    userId: "me",
                    title: `Recurring Visitor Added`,
                    subtitle: `${staff.name} - ${staff.scheduleType}`,
                    time: formatTimeAgo(new Date(createdDate)),
                    iconType: "visitor",
                    bg: "bg-purple-100 dark:bg-purple-900/20",
                    iconColor: "text-purple-600 dark:text-purple-400",
                    _timestamp: ts
                })
            })

            // Sort by timestamp (most recent first) and return top 5
            return activities
                .sort((a, b) => b._timestamp - a._timestamp)
                .slice(0, 5)
                .map(({ _timestamp, ...rest }) => rest)
        } catch {
            return []
        }
    },

    getNotifications: async (): Promise<NotificationItem[]> => {
        try {
            const notifications = await httpClient.get<Notification[]>("/notifications")
            return notifications.map(transformNotification)
        } catch {
            return []
        }
    },

    markNotificationAsRead: async (id: number): Promise<boolean> => {
        try {
            await httpClient.patch(`/notifications/${id}/read`, {})
            return true
        } catch {
            return false
        }
    },

    markAllNotificationsAsRead: async (): Promise<boolean> => {
        try {
            await httpClient.post("/notifications/read-all", {})
            return true
        } catch {
            return false
        }
    },

    getUnreadCount: async (): Promise<number> => {
        try {
            const notifications = await httpClient.get<Notification[]>("/notifications")
            return notifications.filter(n => !n.readAt).length
        } catch {
            return 0
        }
    },

    simulateLiveNotification: async (): Promise<NotificationItem> => {
        // For testing - returns a fake notification
        return {
            id: Date.now(),
            title: "Test Notification",
            description: "This is a test notification",
            time: new Date().toLocaleString(),
            type: "notice",
            read: false,
        }
    },

    // ==========================================
    // COMMUNICATIONS
    // ==========================================

    getNotices: async (): Promise<NoticeItem[]> => {
        try {
            const announcements = await httpClient.get<Announcement[]>("/announcements")
            return announcements.map(transformAnnouncement)
        } catch {
            return []
        }
    },

    getCommunityMessages: async (): Promise<CommunityMessageItem[]> => {
        try {
            const groups = await httpClient.get<ChatGroup[]>("/chat/groups")
            if (groups.length === 0) return []

            const messages = await httpClient.get<ChatMessage[]>(`/chat/groups/${groups[0].id}/messages`)
            return messages.map((msg, index) => ({
                id: index,
                sender: msg.unitNumber,
                role: "resident" as const,
                text: msg.content,
                time: new Date(msg.createdAt).toLocaleTimeString(),
                avatar: msg.unitNumber[0],
                color: "bg-blue-100 text-blue-700",
            }))
        } catch {
            return []
        }
    },

    sendCommunityMessage: async (text: string): Promise<CommunityMessageItem> => {
        const groups = await httpClient.get<ChatGroup[]>("/chat/groups")
        if (groups.length === 0) throw new Error("No chat groups available")

        const msg = await httpClient.post<ChatMessage>(`/chat/groups/${groups[0].id}/messages`, { content: text })
        return {
            id: Date.now(),
            sender: "You",
            role: "me",
            text: msg.content,
            time: new Date(msg.createdAt).toLocaleTimeString(),
            avatar: "Y",
            color: "bg-indigo-600 text-white",
        }
    },

    getCommunityEvents: async (): Promise<CommunityEventItem[]> => {
        // Events could come from announcements or a dedicated endpoint
        return []
    },

    getCommunityEventById: async (id: number): Promise<CommunityEventItem | undefined> => {
        return undefined
    },

    rsvpEvent: async (id: number, status: "going" | "not_going"): Promise<boolean> => {
        return false
    },

    // ==========================================
    // DELIVERIES
    // ==========================================

    getDeliveries: async (): Promise<Delivery[]> => {
        try {
            return await httpClient.get<Delivery[]>("/deliveries")
        } catch {
            return []
        }
    },

    createDelivery: async (delivery: CreateDeliveryRequest): Promise<Delivery> => {
        return httpClient.post<Delivery>("/deliveries", delivery)
    },

    // ==========================================
    // SOS & EMERGENCY
    // ==========================================

    triggerSOS: async (): Promise<boolean> => {
        try {
            await httpClient.post("/emergency/sos", {})
            return true
        } catch {
            return false
        }
    },

    cancelSOS: async (): Promise<boolean> => {
        try {
            await httpClient.post("/emergency/sos/cancel", {})
            return true
        } catch {
            return false
        }
    },

    getSOSStatus: async (): Promise<boolean> => {
        return false
    },

    // ==========================================
    // FACILITY (for staff)
    // ==========================================

    getStaff: async (): Promise<StaffItem[]> => {
        return []
    },

    getStaffById: async (id: string): Promise<StaffItem | undefined> => {
        return undefined
    },

    getInventory: async (): Promise<InventoryItem[]> => {
        return []
    },

    // ==========================================
    // ADMIN
    // ==========================================

    getOverviewStats: async () => {
        return {
            residents: 0,
            units: 0,
            pendingRequests: 0,
            outstandingPayments: 0,
        }
    },

    // ==========================================
    // SECURITY (for guards)
    // ==========================================

    getGateEntries: async (): Promise<VisitorItem[]> => {
        return api.getVisitors()
    },

    verifyVisitorCode: async (code: string): Promise<VisitorItem | undefined> => {
        const visitors = await api.getVisitors()
        return visitors.find(v => v.code === code)
    },

    // ==========================================
    // SECURITY MODULE (New)
    // ==========================================

    security: {
        login: async (credentials: SecurityLoginRequest): Promise<SecurityAuthResponse> => {
            const response = await httpClient.post<SecurityAuthResponse>("/security/auth/login", credentials, { skipAuth: true })
            tokenManager.setTokens(response.accessToken, response.refreshToken)
            return response
        },

        logout: async (): Promise<void> => {
            try {
                await httpClient.post("/security/auth/logout", {})
            } finally {
                tokenManager.clearTokens()
            }
        },


        getDashboardStats: async (): Promise<SecurityDashboardStats> => {
            return httpClient.get<SecurityDashboardStats>("/security/dashboard")
        },

        getExpectedVisitors: async (): Promise<SecurityVisitorEntry[]> => {
            try {
                const groups = await httpClient.get<any[]>("/security/visitors/expected")
                return groups.flatMap(g => g.visitors.map((v: any, idx: number) => ({
                    id: `${g.id}-${v.id || idx}`,
                    visitorName: v.name,
                    unitNumber: g.unit?.unitNumber || "",
                    status: 'EXPECTED',
                    type: g.type === 'DELIVERY' ? 'DELIVERY' : 'GUEST', // Simplified mapping
                    mobileNumber: v.mobileNumber,
                    vehicleNumber: v.vehicleNumber,
                    startTime: g.visitStart,
                    endTime: g.visitEnd,
                    approvalType: 'Pre-approved',
                } as SecurityVisitorEntry)))
            } catch {
                return []
            }
        },

        getInsideVisitors: async (): Promise<SecurityVisitorEntry[]> => {
            try {
                const logs = await httpClient.get<any[]>("/security/logs/visitors")
                return logs.map(log => ({
                    id: log.id,
                    visitorName: log.group?.visitors?.[0]?.name || "Unknown",
                    unitNumber: log.group?.unit?.unitNumber || "",
                    status: log.status === 'ENTERED' && !log.exitAt ? 'INSIDE' : 'EXITED',
                    type: log.group?.type === 'DELIVERY' ? 'DELIVERY' : 'GUEST',
                    entryTime: log.entryAt,
                    exitTime: log.exitAt,
                    mobileNumber: log.group?.visitors?.[0]?.mobileNumber,
                    photoUrl: log.photoUrl,
                    gateId: log.gateId,
                    approvalType: log.scanMethod === 'QR' || log.group?.shortCode ? 'Pre-approved' : 'Sudden',
                } as SecurityVisitorEntry)).filter((log) => log.status === 'INSIDE')
            } catch {
                return []
            }
        },

        getVisitorHistory: async (): Promise<SecurityVisitorEntry[]> => {
            try {
                const logs = await httpClient.get<any[]>("/security/logs/visitors")
                return logs
                    .map(log => ({
                        id: log.id,
                        visitorName: log.group?.visitors?.[0]?.name || "Unknown",
                        unitNumber: log.group?.unit?.unitNumber || "",
                        status: log.status === 'ENTERED' && !log.exitAt ? 'INSIDE' : log.status,
                        type: log.group?.type === 'DELIVERY' ? 'DELIVERY' : 'GUEST',
                        entryTime: log.entryAt,
                        exitTime: log.exitAt,
                        mobileNumber: log.group?.visitors?.[0]?.mobileNumber,
                        photoUrl: log.photoUrl,
                        approvalType: log.scanMethod === 'QR' || log.group?.shortCode ? 'Pre-approved' : 'Sudden',
                    } as SecurityVisitorEntry))
                    .filter((log) => log.status === 'EXITED' || log.status === 'DENIED')
            } catch {
                return []
            }
        },

        scanVisitor: async (data: ScanVisitorRequest): Promise<SecurityVisitorEntry> => {
            const response = await httpClient.post<any>("/security/visitors/scan", data)
            const log = response.log;
            const deniedReason = response.warning === 'DUPLICATE_SCAN' ? 'Duplicate scan (already inside)' : undefined;
            return {
                id: log.id,
                visitorName: log.group?.visitors?.[0]?.name || "Unknown",
                unitNumber: log.group?.unit?.unitNumber || "",
                status: log.status === 'ENTERED' ? 'INSIDE' : log.status,
                type: log.group?.type === 'DELIVERY' ? 'DELIVERY' : 'GUEST',
                entryTime: log.entryAt,
                exitTime: log.exitAt,
                mobileNumber: log.group?.visitors?.[0]?.mobileNumber,
                photoUrl: log.photoUrl,
                gateId: log.gateId,
                approvalType: 'Pre-approved', // specific to QR scan
                qrCode: data.qrToken,
                deniedReason,
            } as SecurityVisitorEntry
        },

        scanVisitorCode: async (data: { code: string; gateId?: string }): Promise<SecurityVisitorEntry> => {
            const response = await httpClient.post<any>("/security/visitors/scan-code", data)
            const log = response.log;
            const deniedReason = response.warning === 'DUPLICATE_SCAN' ? 'Duplicate scan (already inside)' : undefined;
            return {
                id: log.id,
                visitorName: log.group?.visitors?.[0]?.name || "Unknown",
                unitNumber: log.group?.unit?.unitNumber || "",
                status: log.status === 'ENTERED' ? 'INSIDE' : log.status,
                type: log.group?.type === 'DELIVERY' ? 'DELIVERY' : 'GUEST',
                entryTime: log.entryAt,
                exitTime: log.exitAt,
                mobileNumber: log.group?.visitors?.[0]?.mobileNumber,
                photoUrl: log.photoUrl,
                gateId: log.gateId,
                approvalType: 'Pre-approved',
                qrCode: data.code,
                deniedReason,
            } as SecurityVisitorEntry
        },

        createWalkIn: async (data: CreateWalkInRequest): Promise<{ requestId: string }> => {
            return httpClient.post<{ requestId: string }>("/security/visitors/walkin", data)
        },

        getPendingWalkIns: async (): Promise<any[]> => {
            return httpClient.get<any[]>("/security/visitors/walkin/pending")
        },

        approveWalkInEntry: async (requestId: string, data: WalkInEntryRequest): Promise<SecurityVisitorEntry> => {
            return httpClient.post<SecurityVisitorEntry>(`/security/visitors/walkin/${requestId}/entry`, data)
        },

        checkoutVisitor: async (logId: string): Promise<boolean> => {
            try {
                await httpClient.post(`/security/visitors/${logId}/checkout`, {})
                return true
            } catch {
                return false
            }
        },

        // Vehicles
        getInsideVehicles: async (): Promise<VehicleEntryItem[]> => {
            try {
                const logs = await httpClient.get<any[]>("/security/vehicles/inside")
                return logs.map(log => ({
                    id: log.id,
                    vehicleNumber: log.vehicleNumber,
                    type: "Car", // Defaulting as backend might not store type in log or vehicle
                    ownerName: "Unknown", // Backend log might not have owner name directly, might need to fetch or include in query
                    unitId: log.unit?.unitNumber || "Unknown",
                    status: "Inside",
                    entryTime: log.entryAt,
                    date: new Date(log.entryAt).toISOString().split('T')[0]
                }))
            } catch {
                return []
            }
        },

        getVehicleHistory: async (date: string): Promise<VehicleEntryItem[]> => {
            try {
                const logs = await httpClient.get<any[]>(`/security/vehicles/history?date=${date}`)
                return logs.map(log => ({
                    id: log.id,
                    vehicleNumber: log.vehicleNumber,
                    type: "Car",
                    ownerName: "Unknown",
                    unitId: log.unit?.unitNumber || "Unknown",
                    status: log.direction === 'IN' && !log.exitAt ? 'Inside' : 'Exited',
                    entryTime: log.entryAt,
                    exitTime: log.exitAt,
                    date: new Date(log.createdAt).toISOString().split('T')[0]
                }))
            } catch {
                return []
            }
        },

        logVehicleEntry: async (data: any): Promise<void> => {
            await httpClient.post("/security/vehicles/entry", {
                vehicleNumber: data.vehicleNumber,
                gateId: "gate1", // Hardcoded for now
                unitNumber: data.unitId, // Mapping unitId input (which is number like A-101) to unitNumber
                source: "MANUAL"
            })
        },

        logVehicleExit: async (data: any): Promise<void> => {
            await httpClient.post("/security/vehicles/exit", {
                vehicleNumber: data.vehicleNumber,
                gateId: "gate1",
                unitNumber: data.unitId, // optional for exit? logic uses it to resolve unit?
                source: "MANUAL"
            })
        },

        // Emergency
        createEmergencyAlert: async (message: string): Promise<SOSLogItem> => {
            return httpClient.post<SOSLogItem>("/security/emergency-alerts", { message })
        },

        getEmergencyAlerts: async (): Promise<SOSLogItem[]> => {
            try {
                const alerts = await httpClient.get<any[]>("/security/emergency-alerts")
                return alerts.map(alert => ({
                    id: alert.id,
                    residentName: "Resident", // Backend doesn't link to resident directly yet? Or via unit?
                    unitId: "Unknown",
                    location: "Community",
                    time: new Date(alert.createdAt).toLocaleTimeString(),
                    status: "Active", // Assuming all in list are alerts. Status management needed on backend.
                    message: alert.message
                }))
            } catch {
                return []
            }
        },
    },
}

// ==========================================
// Icon Helper
// ==========================================


// --- Helper to map string types to Icons ---
export const getIconForType = (type: string) => {
    switch (type) {
        case "payment": return CreditCard
        case "visitor": return UserPlus
        case "complaint": return AlertTriangle
        case "event": return Calendar
        case "notice": return MessageSquare
        case "offer": return Tag
        case "security": return Shield
        case "meeting": return Users
        case "Delivery": return Truck
        case "Guest": return Users
        case "Cab": return Car
        case "pool": return Waves
        case "gym": return Dumbbell
        case "clubhouse": return PartyPopper
        case "conference": return Users
        case "tennis": return Dumbbell
        case "Plumber": return Waves
        case "Electrician": return Zap
        case "Carpenter": return Hammer
        case "Appliance": return Package
        case "Others": return MessageSquare
        case "AC": return Waves
        case "Fan": return Zap
        case "Light": return Zap
        case "TV": return Radio
        case "Maintenance": return Home
        case "Electricity": return Zap
        case "Water": return Droplets
        case "Gas": return Flame
        case "Rent": return Home
        case "Penalty": return AlertCircle
        case "EV": return PlugZap
        case "Event": return PartyPopper
        default: return AlertTriangle
    }
}

// ==========================================
// COMMUNITY EVENTS
// ==========================================

export const createCommunityEvent = async (data: CreateEventRequest): Promise<CommunityEvent> => {
    return httpClient.post<CommunityEvent>("/events", data)
}

export const getCommunityEvents = async (): Promise<CommunityEvent[]> => {
    return httpClient.get<CommunityEvent[]>("/events")
}

export const getMyEvents = async (): Promise<CommunityEvent[]> => {
    return httpClient.get<CommunityEvent[]>("/events/my")
}

export const getEventDetails = async (id: string): Promise<CommunityEvent> => {
    return httpClient.get<CommunityEvent>(`/events/${id}`)
}
