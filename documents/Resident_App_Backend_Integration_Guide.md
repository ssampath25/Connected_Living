# Backend Integration Guide (API Contract)

**For:** Backend Development Team  
**From:** Frontend Team  
**Status:** High Priority  
**Purpose:** This document outlines the required REST API endpoints to make the "Connected Living" Resident App fully functional. The frontend currently runs on a mock implementation (`src/lib/api.ts`). This guide reflects the dynamic requirements for Service Requests, Community tracking, and secure Profile updates.

---

## 1. General Standards
-   **Base URL:** `/api/v1`
-   **Auth Header:** `Authorization: Bearer <token>` (JWT)
-   **Response Format:**
    ```json
    {
      "success": true,
      "data": { ... },
      "message": "Optional success message"
    }
    ```
-   **Error Format:**
    ```json
    {
      "success": false,
      "error": { "code": "AUTH_FAILED", "message": "Invalid OTP" }
    }
    ```
-   **ID Standard**: Use UUID v4 for all new resource creations (Community Messages, Events, Service Requests) to ensure React key stability.

---

## 2. Authentication Module

### 2.1 Send OTP
*   **Endpoint:** `POST /auth/send-otp`
*   **Purpose:** Login flow start.
*   **Body:** `{ "identifier": "+919876543210", "type": "phone" }`
*   **Response:** `{ "message": "OTP sent" }` (Do not return OTP in body for prod)

### 2.2 Verify OTP (Login)
*   **Endpoint:** `POST /auth/verify-otp`
*   **Purpose:** Validate OTP and get Token.
*   **Body:** `{ "identifier": "+919876543210", "otp": "1234" }`
*   **Response:**
    ```json
    {
      "token": "jwt_token_here",
      "user": { "id": "U-001", "name": "Vikram", "role": "Resident", "unitId": "A-101" }
    }
    ```

### 2.3 Profile Verification (Cross-Channel)
*   **Security Context**: Navigation is blocked on the frontend while these are active.
*   **Trigger**: Updating sensitive profile fields.
*   **Post Update Phone**: `POST /auth/send-otp?target=email` (Send OTP to existing email to verify phone change).
*   **Post Update Email**: `POST /auth/send-otp?target=phone` (Send OTP to existing phone to verify email change).

---

## 3. User & Family Management

### 3.1 Get Profile
*   **Endpoint:** `GET /user/profile`
*   **Response:** Returns `UserItem` object.

### 3.2 Manage Family Members
*   **GET** `/user/family`: List all members.
*   **POST** `/user/family`: Add member.
    *   **Body:** `{ "name": "Priya", "relation": "Spouse", "age": "32", "accessLevel": "Full" }`
*   **PUT** `/user/family/:id`: Update member.
*   **DELETE** `/user/family/:id`: Remove member.

### 3.3 Manage Vehicles
*   **GET** `/user/vehicles`: List registered vehicles.
*   **POST** `/user/vehicles`: Register new vehicle.
    *   **Body:** `{ "type": "Car", "registrationNumber": "KA 01 AB 1234", "model": "Honda City" }`

---

## 4. Visitor Management (Critical)

### 4.1 Invite Visitor
*   **Endpoint:** `POST /visitors/invite`
*   **Body (Guest):**
    ```json
    {
      "type": "Guest",
      "name": "Rahul",
      "phone": "9988776655",
      "date": "2024-02-10",
      "time": "18:00",
      "singleEntry": true
    }
    ```
*   **Body (Delivery):** `{ "type": "Delivery", "vendor": "Amazon", "date": "2024-02-10" }`
*   **Response:** `{ "code": "6723", "qrUrl": "..." }`

### 4.2 Get Visitor History
*   **Endpoint:** `GET /visitors/history`
*   **Query Params:** `?page=1&limit=20`
*   **Response:** List of `VisitorItem` (including status: Expected, Inside, Left).

### 4.3 Saved Visitors (Frequent Guests)
*   **Endpoint:** `GET /visitors/saved`
*   **Purpose:** Returns list of friends/family for quick invite.
*   **Logic:** Frontend auto-saves guests here. Backend should provide CRUD.

### 4.4 Frequent Visitors (Staff/Daily Help)
*   **Endpoint:** `GET /visitors/frequent`
*   **Response:** List of staff (Maids, Drivers).
    *   **Fields:** `validUntil` (Date), `isActive` (Bool), `attendance` (Array or link to sub-resource).

### 4.6 Revoke Visitor Pass (New)
*   **Endpoint**: `DELETE /visitors/frequent/:id`
*   **Purpose**: Deactivate a staff/frequent guest pass.
*   **Response**: `{ "success": true, "message": "Pass revoked" }`

### 4.5 Staff Attendance
*   **Endpoint:** `GET /visitors/frequent/:id/attendance`
*   **Query:** `?month=02&year=2024`
*   **Response:** Array of `{ date: "2024-02-01", status: "Present", checkIn: "08:00 AM", checkOut: "04:00 PM" }`.

---

## 5. Community & Services

### 5.1 Service Requests (Helpdesk)
*   **GET** `/service-requests`: List my tickets.
*   **POST** `/service-requests`: Create new ticket.
    *   **Body**: 
        ```json
        { 
          "category": "Plumber", 
          "description": "Leaky tap", 
          "urgency": "High", 
          "preferredDate": "2024-02-12",
          "preferredTime": "11:00 AM",
          "photoUrl": "..." 
        }
        ```
    *   **Constraint**: `preferredDate` and `preferredTime` are mandatory unless category is "Others".

### 5.2 Amenities Booking
*   **GET** `/amenities`: List all (Pool, Gym) with status.
    *   **Response**: List of `AmenityItem`, including `requiresApproval` flag.
*   **POST** `/amenities/book`:
    *   **Body:** `{ "amenityId": "pool", "date": "2024-02-10", "slots": ["07:00 AM"] }`
    *   **Logic (Approval Workflow):**
        *   If amenity `requiresApproval` is `true` (Club House, Conference), status = **Pending**.
        *   Otherwise, status = **Confirmed**.
    *   **Response**: `{ "success": true, "bookingId": "...", "status": "Pending" | "Confirmed" }`

### 5.3 Payments
*   **GET** `/payments`: List pending and past payments.
*   **Fields:** `amount`, `dueDate`, `status` (Pending/Paid/Overdue), `title`.

### 5.4 Notices & Events
*   **GET** `/community/notices`: Official admin announcements.
*   **GET** `/community/events`: Upcoming events.
*   **POST** `/community/events/:id/rsvp`: Body `{ "status": "going" }`.

---

## 6. Dashboard Widgets

### 6.1 Overview API
*   **Endpoint:** `GET /dashboard/overview`
*   **Purpose:** fast load of home screen.
*   **Response:**
    ```json
    {
      "unreadNotifications": 3,
      "duePaymentAmount": 5000,
      "activeVisitors": 1, // e.g., "Guest Inside"
      "openTickets": 2
    }
    ```

### 6.2 Activity Feed
*   **Endpoint:** `GET /dashboard/activity`
*   **Response:** Mixed list of recent events (Visitor entry, Payment success, Ticket resolved).

---
**Note:** Please refer to `src/lib/api.ts` in the frontend codebase for the exact TypeScript interfaces for all data models (`UserItem`, `VisitorItem`, etc.).
