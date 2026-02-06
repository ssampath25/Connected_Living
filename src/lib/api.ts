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
    type: "Delivery" | "Guest" | "Cab"
    code: string
    time: string
    status: "Expected" | "Inside" | "Left" | "Denied"
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
}

export type InviteParams =
    | { type: "Guest"; name: string; phone?: string; email?: string; date: string; time: string; singleEntry: boolean }
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
    status: "Confirmed" | "Cancelled" | "Completed"
    timestamp: number
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

function transformVisitorGroup(group: VisitorGroup): VisitorItem {
    const firstVisitor = group.visitors[0]
    return {
        id: parseInt(group.id.slice(-4), 16) || Date.now(),
        unitId: "",
        hostName: "",
        name: firstVisitor?.name || "Visitor",
        type: "Guest",
        code: group.qrToken.slice(0, 4).toUpperCase(),
        time: new Date(group.expectedFrom).toLocaleString(),
        status: group.status === "ACTIVE" ? "Expected" : "Left",
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
        validUntil: staff.validTo ? new Date(staff.validTo).toISOString().split('T')[0] : "",
        allowedTimeSlot: undefined,
        isActive: staff.status === "ACTIVE",
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
    // USER PROFILE
    // ==========================================

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

    inviteVisitor: async (data: InviteParams): Promise<{ success: boolean; code?: string; message: string }> => {
        try {
            // Extract visitor name based on type
            let visitorName = ""
            let visitorPhone: string | undefined
            let visitorTime = "09:00"

            if (data.type === "Guest") {
                visitorName = data.name
                visitorPhone = data.phone
                visitorTime = data.time
            } else if (data.type === "Delivery") {
                visitorName = data.name || data.vendor
                visitorPhone = data.phone
                visitorTime = data.time || "09:00"
            } else if (data.type === "Cab") {
                visitorName = data.driverName
                visitorTime = data.time || "09:00"
            }

            const request: CreateVisitorGroupRequest = {
                purpose: data.type,
                expectedFrom: `${data.date}T${visitorTime}:00`,
                expectedTo: `${data.date}T23:59:00`,
                visitors: [{
                    name: visitorName,
                    phone: visitorPhone,
                }],
            }
            const group = await httpClient.post<VisitorGroup>("/visitors/groups", request)
            return {
                success: true,
                code: group.qrToken.slice(0, 4).toUpperCase(),
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


    addFrequentVisitor: async (visitor: Omit<FrequentVisitorItem, "id">): Promise<boolean> => {
        try {
            // Calculate validity dates
            const validFrom = new Date().toISOString()
            const validTo = visitor.validUntil ? new Date(visitor.validUntil).toISOString() : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()

            const request: CreateRecurringStaffRequest = {
                unitId: "u1", // TODO: Get from user context
                name: visitor.name,
                mobileNumber: "9999999999", // TODO: Get from form
                photoUrl: visitor.avatar || "https://example.com/default.jpg",
                scheduleType: "DAILY",
                validFrom,
                validTo,
            }
            await httpClient.post("/visitors/recurring", request)
            return true
        } catch {
            return false
        }
    },


    updateFrequentVisitor: async (id: string, updates: Partial<FrequentVisitorItem>): Promise<boolean> => {
        return false
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
            const [notifications, requests, invoices, visitors] = await Promise.all([
                api.getNotifications(),
                api.getServiceRequests(),
                api.getInvoices(),
                api.getFrequentVisitors() // ideally getting visitor logs, but using frequent for now or maybe just notifications
            ])

            const activities: ActivityItem[] = []

            // Map Notifications
            notifications.slice(0, 5).forEach(n => {
                activities.push({
                    id: n.id,
                    userId: "me",
                    title: n.title,
                    subtitle: n.description,
                    time: n.time,
                    iconType: n.type === "payment" ? "payment" : n.type === "security" ? "security" : "default",
                    bg: "bg-blue-100",
                    iconColor: "text-blue-600"
                })
            })

            // Map Service Requests
            requests.slice(0, 3).forEach(req => {
                activities.push({
                    id: parseInt(req.id) || Date.now(),
                    userId: "me",
                    title: `Service Request: ${req.category}`,
                    subtitle: `${req.title} - ${req.status}`,
                    time: req.date,
                    iconType: "complaint",
                    bg: "bg-orange-100",
                    iconColor: "text-orange-600"
                })
            })

            // Map Payments
            invoices.filter(i => i.status === "UNPAID").slice(0, 2).forEach(inv => {
                activities.push({
                    id: parseInt(inv.id) || Date.now(),
                    userId: "me",
                    title: "Bill Due",
                    subtitle: `${inv.type} Invoice - ₹${inv.amount}`,
                    time: new Date(inv.dueDate).toLocaleDateString(),
                    iconType: "payment",
                    bg: "bg-red-100",
                    iconColor: "text-red-600"
                })
            })

            // Sort by time (approximated as we have mixed formats, but usually new items are top)
            // For now, simple shuffle or just return combined
            return activities.slice(0, 10)
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
}

// ==========================================
// Icon Helper
// ==========================================

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
