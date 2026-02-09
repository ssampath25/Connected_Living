# Connected Living - Resident App Technical Documentation

**Version:** 1.0  
**Last Updated:** February 2026  
**Status:** In Development (Frontend Ready / Mock Backend)

---

## 1. Executive Summary
**Connected Living** is a premium community management application designed to streamline the daily lives of residents in gated communities. This documentation provides a complete technical overview of the "Resident App" module, detailing its architecture, features, and implementation logic.

The application is built with a **Mobile-First** design philosophy, mimicking the feel of a native mobile app while running as a responsive web application.

---

## 2. Technical Architecture

### 2.1 Technology Stack
-   **Framework:** [Next.js 14](https://nextjs.org/) (App Router)
-   **Language:** TypeScript
-   **Styling:** Tailwind CSS + Vanilla CSS Variables
-   **UI Components:** 
    -   Custom Components (Button, Input, Card)
    -   Radix UI Primitives (via `shadcn/ui` patterns)
    -   Lucide React (Iconography)
-   **State Management:** React Hooks (`useState`, `useEffect`) + URL State
-   **Context Providers:**
    -   `ThemeProvider`: Handles dynamic Dark/Light theme persistent state.
    -   `UIProvider`: Manages global interactivity locks (e.g., during OTP verification).
-   **Data Layer:** In-memory Mock API (`src/lib/api.ts`)

### 2.2 Project Structure
```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/             # Authentication Routes (Login)
│   ├── (resident)/         # Protected Resident Routes
│   │   ├── dashboard/      # Main Landing Page
│   │   ├── visitors/       # Visitor Management
│   │   ├── amenities/      # Facility Booking
│   │   ├── community/      # Social Features (Polls, Events)
│   │   ├── helpdesk/       # Service Requests & Support
│   │   ├── payments/       # Billing & History
│   │   └── more/           # Settings & Emergency Contacts
│   └── layout.tsx          # Root Layout & Provider wrapping
├── components/             # Reusable UI Components
│   ├── ui/                 # Atomic Components (Buttons, Inputs)
│   ├── simple-calendar.tsx # Custom Attendance Calendar
│   ├── empty-state.tsx     # Generic Empty State display
│   └── ...
├── lib/                    # Utilities & Business Logic
│   ├── api.ts              # Central Mock API & Types
│   ├── auth-mock.ts        # Authentication Logic
│   └── utils.ts            # Helper functions (cn, formatters)
```

---

## 3. Core Modules & Implementation Details

### 3.1 Authentication (Login)
**Path:** `/login`  
**Files:** `src/app/(auth)/login/page.tsx`

The login page serves as the entry point and sets the premium tone of the application.

*   **Splash Screen**: Simulates a native app launch. On first load, it displays the pulsing "Connected Living" logo on a deep blue background for 2 seconds before fading out to reveal the login form.
*   **Design**: 
    -   **Curved Header**: A deep blue top section with a custom rounded bottom edge.
    -   **Floating Card**: A glassmorphism-styled white card (`backdrop-blur`) containing the form, overlapping the header for depth.
    -   **Zero-Config Login**: The signup option is intentionally removed/disabled, directing users to contact admin, ensuring security.
*   **Logic**: Uses `auth-mock.ts` to validate credentials. simulating network delay for realism.

### 3.2 Resident Dashboard
**Path:** `/dashboard`  
**Files:** `src/app/(resident)/dashboard/page.tsx`

The central hub for the resident.

*   **SOS Feature**: A prominent emergency button in the header.
*   **Quick Actions**: Grid of shortcuts to high-frequency tasks (Visitors, Pay Bills, Helpdesk).
*   **Activity Feed**: A scrolling list of recent gate activities and notifications.
*   **Smart Widget**: Shows Unit details and current status.

### 3.3 Visitor Management
**Path:** `/visitors`  
**Files:** `src/app/(resident)/visitors/page.tsx`, `src/lib/api.ts`

The most complex module, handling guest access and security.

#### A. Invite Guest
-   **Functionality**: Generates a 4-digit security code.
-   **Auto-Save Logic**: When a "Guest" is invited, they are automatically added to the **Saved Visitors** list for future quick access. This logic is handled in `inviteVisitor` in `api.ts`.
-   **Sharing**: Includes a "Share Code" button (simulated).

#### B. Saved Visitors
-   **Purpose**: A curated list of frequent guests (Family, Friends).
-   **Logic**: 
    -   Filters mocked data to *exclude* service types like "Cab" or "Delivery" (which stay in recent history but aren't "Saved Guests").
    -   Allows one-tap re-invitation.

#### C. Frequent Visitors (Staff)
-   **Purpose**: For daily help (Maids, Drivers, Cooks) who have a pass.
-   **Edit Capabilities**: 
    -   Users can view the staff profile.
    -   **Edit Mode**: Allows updating Name, Role, Phone, and Pass Validity dates.
    -   **Attendance**: Features a **Calendar View** (`SimpleCalendar` component) showing "Present/Absent" status for the entire month, with detailed In/Out times on click.

### 3.4 Community & Lifestyle
**Path:** `/community`  
**Files:** `src/app/(resident)/community/page.tsx`

-   **Polls**: Interactive voting cards.
-   **Events**: Calendar of society gatherings (Diwali Party, AGM).
-   **Notices**: Official admin broadcasts.
-   **Implementation**: Tabbed interface using conditional rendering.
-   **Chat Integration**: 
    - Flush-to-navbar layout for mobile devices.
    - Dynamic message ID generation to prevent React key duplication errors.

### 3.5 Helpdesk & Services
**Path:** `/service-requests`  
**Files:** `src/app/(resident)/service-requests/page.tsx`

-   Listing of raised tickets (Plumbing, Electrical) with real-time status tracking.
-   **Mandatory Scheduling**: Creation form requires separate, mandatory **Preferred Date** and **Preferred Time** inputs for optimized staffing.
-   **AI Integration**: Special visualization for "Others" category providing AI-driven analysis of the issue description/photo.

### 3.6 Payments
**Path:** `/payments`  
**(In Progress)**

-   Maintenance Bill viewing.
-   Payment history.

---

## 4. Data Layer (The Mock API)
**File:** `src/lib/api.ts`

Since the backend is not yet connected, the app uses a robust **Mock API Layer**. This file is the "Brain" of the frontend.

### Key Types
-   `UserItem`: Defines resident profile (Unit, Role).
-   `VisitorItem`: Structure for guest/delivery entries.
-   `SavedVisitorItem`: Structure for persisted contacts.
-   `AttendanceItem`: Daily records for staff.

### Key Functions
-   `getVisitors()`: Returns paginated list of past visitors.
-   `inviteVisitor(data)`: 
    1.  Generates access code.
    2.  Creates a new active visitor record.
    3.  **Crucial**: Checks if the visitor is a 'Guest'; if so, adds them to `MOCK_SAVED_VISITORS`.
-   `calculateMonthlyStats()`: Helper utilized by the Calendar component to show days present/absent.
-   **Unique ID Generation**: All write methods (e.g., `sendCommunityMessage`, `createCommunityEvent`) now use `Date.now() + Math.random()` logic to ensure stable React keying during high-frequency interactions.

---

## 5. Deployment & Setup

### Prerequisites
-   Node.js 18+
-   npm or yarn

### Installation
1.  Clone the repository:
    ```bash
    git clone https://github.com/ssampath25/Connected_Living.git
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Run development server:
    ```bash
    npm run dev
    ```
4.  Open `http://localhost:3000`.

---

## 6. Future Roadmap
1.  **Backend Integration**: Replace `setTimeout` calls in `api.ts` with `fetch()` calls to a real Express/Node.js backend.
2.  **State Persistence**: Currently, data resets on reload (in-memory). Integration with Redux or React Query is recommended for the next phase.
3.  **Real-time Updates**: Implement Hash/Socket.io for live gate notifications.
