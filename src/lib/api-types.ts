// ==========================================
// Backend API Types (matching NestJS DTOs)
// ==========================================

// --- Auth ---
export interface LoginRequest {
    identifier: string; // email or phone
    password: string;
}

export interface OtpRequest {
    identifier: string;
}

export interface OtpVerify {
    identifier: string;
    otp: string;
}

export interface AuthResponse {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
}

export interface ResidentProfile {
    id: string;
    fullName: string;
    mobileNumber: string;
    email?: string;
    role: 'OWNER' | 'TENANT';
    status: 'ACTIVE' | 'INACTIVE';
    preferredLanguage?: string;
    units: {
        id: string;
        unitNumber: string;
        blockTower?: string;
        floor?: string;
        relationType: string;
        isPrimary: boolean;
    }[];
}

// --- Visitors ---
export interface VisitorGroup {
    id: string;
    qrToken: string;
    purpose: string;
    expectedFrom: string;
    expectedTo: string;
    status: 'ACTIVE' | 'EXPIRED' | 'REVOKED';
    visitors: Visitor[];
    createdAt: string;
}

export interface Visitor {
    id: string;
    name: string;
    phone?: string;
    vehicleNumber?: string;
}

export interface CreateVisitorGroupRequest {
    purpose: string;
    expectedFrom: string;
    expectedTo: string;
    visitors: { name: string; phone?: string; vehicleNumber?: string }[];
    type?: string;
    relation?: string;
    avatar?: string;
}

export interface RecurringStaff {
    id: string;
    name: string;
    mobileNumber: string;
    photoUrl?: string;
    scheduleType: 'DAILY' | 'WEEKLY' | 'MONTHLY';
    validFrom: string;
    validTo: string;
    status: 'ACTIVE' | 'DEACTIVATED';
}

export interface CreateRecurringStaffRequest {
    unitId: string;
    name: string;
    mobileNumber: string;
    photoUrl: string;
    scheduleType: 'DAILY' | 'WEEKLY' | 'MONTHLY';
    validFrom: string;
    validTo: string;
}

export interface StaffAttendanceLog {
    id: string;
    staffId: string;
    checkInAt: string;
    checkOutAt?: string;
    status: 'IN' | 'OUT';
    createdAt: string;
}


// --- Vehicles ---
export interface Vehicle {
    id: string;
    unitId: string;
    residentId: string;
    type: 'TWO_WHEELER' | 'FOUR_WHEELER' | 'EV';
    vehicleNumber: string;
    model?: string;
    status: 'ACTIVE' | 'PENDING_APPROVAL' | 'INACTIVE';
    createdAt: string;
    updatedAt: string;
}

export interface CreateVehicleRequest {
    unitId: string;
    vehicleNumber: string;
    type: 'TWO_WHEELER' | 'FOUR_WHEELER' | 'EV';
    model?: string;
}

// --- Amenities ---
export interface Amenity {
    id: string;
    communityId: string;
    name: string;
    type: 'GYM' | 'POOL' | 'EV_CHARGING' | 'HALL' | 'OTHER';
    pricingModel: 'FREE' | 'PAID';
    pricePerSlot?: number;
    slotDurationMinutes: number;
    slots: string[];
    rules?: string;
    status: 'ACTIVE' | 'DISABLED';
}

export interface AmenitySlot {
    id: string;
    amenityId: string;
    startTime: string;
    endTime: string;
    capacity: number;
    price: number;
}

export interface Booking {
    id: string;
    amenityId: string;
    amenity?: { name: string };
    slots?: { slot: { startTime: string } }[];
    status: 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
    totalAmount?: number;
    paymentStatus?: 'PENDING' | 'PAID' | 'FAILED';
    createdAt: string;
}

export interface CreateBookingRequest {
    slotIds: string[];
    unitId: string;
}

// --- Service Requests ---
export interface ServiceRequest {
    id: string;
    unitId: string;
    category: string;
    description: string;
    status: 'NEW' | 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CLOSED';
    priority: 'LOW' | 'MEDIUM' | 'HIGH';
    sourceChannel: 'APP' | 'IVR' | 'SMS';
    aiStatus?: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreateServiceRequestRequest {
    unitId: string;
    category: string;
    description: string;
    priority?: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface Complaint {
    id: string;
    category: string;
    title: string;
    description: string;
    status: 'OPEN' | 'IN_REVIEW' | 'RESOLVED' | 'CLOSED';
    createdAt: string;
}

// --- Payments ---
export interface Invoice {
    id: string;
    unitId: string;
    type: 'MAINTENANCE' | 'AMENITY' | 'EV';
    amount: number;
    dueDate: string;
    status: 'PAID' | 'UNPAID' | 'OVERDUE';
    periodStart?: string;
    periodEnd?: string;
    createdAt: string;
}

export interface Payment {
    id: string;
    amount: number;
    status: 'PENDING' | 'PAID' | 'FAILED';
    method?: string;
    transactionId?: string;
    createdAt: string;
}

export interface PaymentIntentRequest {
    invoiceIds: string[];
}

export interface PaymentIntentResponse {
    orderId: string;
    amount: number;
    currency: string;
}

// --- Communications ---
export interface Announcement {
    id: string;
    title: string;
    body: string;
    priority: 'URGENT' | 'IMPORTANT' | 'GENERAL';
    publishedAt: string;
}

export interface Poll {
    id: string;
    question: string;
    options: string[];
    status: 'DRAFT' | 'ACTIVE' | 'CLOSED';
    startsAt: string;
    endsAt: string;
    hasVoted: boolean;
}

export interface PollResults {
    id: string;
    question: string;
    totalVotes: number;
    results: { option: string; count: number; percentage: number }[];
}

export interface ChatGroup {
    id: string;
    name: string;
    description?: string;
    status: 'ACTIVE' | 'ARCHIVED';
    memberCount: number;
}

export interface ChatMessage {
    id: string;
    unitNumber: string; // Privacy-safe: only unit number shown
    content: string;
    createdAt: string;
}

// --- Notifications ---
export interface Notification {
    id: string;
    title: string;
    body: string;
    channel: 'PUSH' | 'SMS' | 'EMAIL' | 'IN_APP';
    status: 'QUEUED' | 'SENT' | 'FAILED';
    readAt?: string;
    createdAt: string;
}

// --- Deliveries ---
export interface Delivery {
    id: string;
    unitId: string;
    type: 'PREDECLARED' | 'WALKIN';
    vendorName: string;
    description?: string;
    status: 'EXPECTED' | 'ARRIVED' | 'HELD_AT_SECURITY' | 'RETURNED_COD' | 'REJECTED' | 'PICKED_UP';
    paymentType?: 'COD' | 'PREPAID';
    expectedAt?: string;
    arrivedAt?: string;
    createdAt: string;
}

export interface CreateDeliveryRequest {
    vendorName: string;
    description?: string;
    expectedAt?: string;
    paymentType?: 'COD' | 'PREPAID';
}

// --- EV Charging ---
export interface EvBooking {
    id: string;
    chargerId: string;
    chargerName: string;
    slotTime: string;
    status: 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
    energyUsed?: number;
    totalAmount?: number;
}

// --- Events ---
export interface CommunityEvent {
    id: string;
    title: string;
    description?: string;
    eventDate: string;
    location: string;
    capacity?: number;
    imageUrl?: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
    rejectionReason?: string;
    createdAt: string;
}

export interface CreateEventRequest {
    title: string;
    description?: string;
    eventDate: string; // ISO format
    location: string;
    capacity?: number;
    imageUrl?: string;
}


// --- Common ---
export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
    hasMore: boolean;
}

export interface ApiSuccessResponse {
    success: boolean;
    message?: string;
}
