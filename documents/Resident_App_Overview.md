# Connected Living - Resident App Documentation

## Overview
Connected Living is a comprehensive community management application designed to enhance the living experience for residents. This document details the features and functionalities available in the Resident Module.

## Key Modules

### 1. Dashboard
The central hub for the resident, providing a quick overview of daily activities and status.
- **My Activity**: A live feed of recent events like visitor entries, package deliveries, and payment confirmations.
- **Quick Stats**: Summary of due payments, active support tickets, and unread notifications.
- **Quick Actions**: Shortcuts to common tasks like "Invite Visitor", "Pay Rent", and "Book Amenity".

### 2. Visitor Management
Manage guest access and security permissions seamlessly.
- **Upcoming Visitors**: View a list of expected guests with their status (Expected, Inside, etc.).
- **Make Invite**: 
    - **Guest**: For friends/family (Requires Name, Date, Time). Generates a shareable code.
    - **Delivery**: Pre-approve generic delivery vendors.
    - **Cab**: Pre-approve cab entries with vehicle details.
- **Saved Visitors/Frequent**: Quickly invite frequent guests by selecting their profile (e.g., Mom, Maid).
- **History**: View a log of past visitors.

### 3. Payments
Track and settle community dues.
- **Due Payments**: List of unpaid bills (Maintenance, Electricity, etc.) with "Pay Now" functionality.
- **Payment History**: Archive of past transactions with status (Paid, Pending, Failed).
- **Invoices**: View detailed breakdowns of charges.

### 4. Amenities
Book shared community facilities.
- **Browse**: View available amenities (Swimming Pool, Tennis Court, Clubhouse) with photos and details.
- **Booking**: Select dates and slots to reserve a facility.
- **My Bookings**: Manage your active and past reservations.

### 5. Service Requests (Help & Support)
Report issues and track maintenance.
- **Raise Ticket**: Submit a complaint (e.g., Plumbing, Electrical) with photos and description.
- **Preferred Scheduling**: Choose both a mandatory **Date** and **Time** for your appointment.
- **Track Status**: Monitor the progress of tickets from "Open" to "Resolved" with detailed staff assignments and AI analysis summaries.
- **Emergency Contacts**: Quick access to security and facility manager contacts.

### 6. My Vehicles
Manage registered vehicles for gate access.
- **Vehicle List**: View all cars/bikes linked to your unit.
- **Add Vehicle**: Request approval for a new vehicle by providing registration number and model.

### 7. Community & Smart Hub
- **Community Chat**: Connect with neighbors with a mobile-optimized, flush-to-navbar interface and unique message tracking.
- **Notices**: Read official announcements from the management committee.
- **Smart Hub**: Control smart home devices (Lights, AC, Locks) directly from the app.

### 8. Brain AI Assistant
An intelligent assistant to help you navigate the app.
- **Voice & Text**: Interact using natural language to perform actions (e.g., "Book the tennis court for 5 PM").
- **Context Aware**: Understands your specific unit and history.

## Technical Notes
- **Platform**: Built as a Progressive Web App (PWA) compatible with iOS and Android.
- **Appearance**: Supports dynamic **Dark and Light modes** with a premium "Deep Navy" slate aesthetic.
- **Security**:
    - Role-Based Access Control (RBAC).
    - **Cross-Channel Verification**: Phone number updates require Email OTP; Email updates require Phone OTP.
    - **Interactivity Blocking**: Navigation and global actions are suspended during critical updates (OTP/Focus mode).
