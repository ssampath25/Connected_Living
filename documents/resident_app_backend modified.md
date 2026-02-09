# Resident App - Backend Integration Requirements (Feb 06, 2026)

This document details the backend logic and schema modifications required to fully integrate the recent frontend updates.

## 1. Service Request Schema Updates
The frontend now captures granular scheduling data and handles "Others" category logic differently.

### 📅 New Data Fields
- **`preferredTime` (String/Time)**:
    - **Purpose**: Captures the specific hour/minute slot for appointments.
    - **Format**: `HH:MM AM/PM` (e.g., "11:00 AM").
    - **Action**: Add this field to the `ServiceRequests` table. It should be mandatory if the `category` is not "Others".
- **`preferredDate` (Date)**:
    - Ensure this is stored in a standard ISO format (`YYYY-MM-DD`).

### 🤖 AI Assistant Analysis Field
- **Proposed Field**: `ai_summary` (Text/Markdown).
- **Usage**: When the category is "Others", the frontend looks for an analysis object to display a specialized info card to the resident.
- **Action**: The backend (or an AI middleware) should populate this field upon request submission for the "Others" category.

## 2. API Method & Logic Modifications

### 🆔 Unique ID Generation (Stability)
- **Issue**: High-frequency actions (like rapid chat messaging) were causing duplicate key errors when relying on millisecond timestamps alone.
- **Requirement**: Use UUIDs (v4) for all new records.
- **Impacted Entities**:
    - `CommunityMessages`
    - `CommunityEvents`
    - `ServiceRequests`

### 🛡️ Security: Cross-Channel Verification (OTP)
- **New Logic Required**: To prevent unauthorized takeovers, a cross-channel verification flow has been implemented:
    - **Phone Update**: Requires OTP sent to the *existing* Email.
    - **Email Update**: Requires OTP sent to the *existing* Phone Number.
- **Backend Requirement**: Update the `sendOTP` and `verifyOTP` endpoints to accept a `target_channel` and `trigger_source` parameter to enforce this logic.

### 🚫 Visitor Management: Revocation
- **Endpoint**: `DELETE /api/visitors/frequent/[id]`
- **Requirement**: Implement a hard delete or a `status='revoked'` soft delete for frequent visitor passes. The frontend now has a "Revoke Pass" button integrated with this endpoint.

## 3. Data Integrity Expectations
- **Mandatory Fields Validation**: The backend should mirror the frontend validation:
    - `preferredDate` and `preferredTime` MUST be present for categories: Plumber, Electrician, Carpenter, Appliance, Community.
- **Community Chat**: The `sender` field in messages should reliably map to `UnitNumber - Block` for anonymity consistency as per current UI patterns.

---
*Prepared by Antigravity AI for the Connected Living Backend Team.*
