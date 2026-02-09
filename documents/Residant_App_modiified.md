# Resident App Modifications - Integration Guide (Feb 06, 2026)

This document provides a detailed overview of the frontend changes made to the Connected Living Resident Application. This is intended to help the backend team understand new data requirements and UI flows.

## 1. Service Request Module Enhancements
The service request creation and display logic has been significantly updated.

### 📅 Split Date & Time Inputs
- **Change**: The "Preferred Slot" which was previously a single combined field or just a date, is now split into two separate mandatory inputs.
- **Frontend Implementation**:
    - `preferredDate`: Captures date (YYYY-MM-DD).
    - `preferredTime`: Captures time (HH:MM AM/PM).
- **Backend Requirement**: Ensure the Service Request schema supports a separate `preferredTime` string or a combined `DateTime` object.
- **Validation**: For all categories except "Others", both date and time are now mandatory. The form will block submission if either is missing.

### 🖼️ Photo Upload & Preview
- **Logic Fix**: Fixed a bug where the `File` object was not correctly mapped to the `URL.createObjectURL` for previews.
- **Remove Action**: Users can now remove an attached photo before submission.
- **Integration Note**: Ensure the multipart/form-data endpoint handles the `photo` field correctly alongside the JSON body.

### 🔍 Enhanced Detail View
- **Preferred Slot Display**: The details page now explicitly shows the planned visit time: `Preferred Slot: [Date] @ [Time]`.
- **AI Analysis Context**: If a request falls under "Others", a specialized UI block displays an "AI Assistant Analysis". This currently uses mock text but should eventually fetch from a `analysis_summary` or equivalent field in the response.

## 2. Global Dark Theme Integration
The application now supports a full-featured dark mode.
- **Framework**: Powered by `next-themes`.
- **Design Tokens**: All hardcoded colors (e.g., `#1a237e`, `bg-white`) have been replaced with CSS variables:
    - `--background`, `--card`, `--primary`, `--muted-foreground`.
- **Iconography**: Icons in the "More" page and Sidebar now adapt their colors and visibility based on the `resolvedTheme`.

## 3. Communication & Chat UI
- **Navbar Layout**: The chat input area has been adjusted to sit flush with the bottom navigation bar on mobile (no gaps).
- **Header Geometry**: Chat headers have been flattened (removed large border-radius) to maximize space for message bubbles.
- **Z-Index Management**: Standardized z-index across overlays to prevent navigation bars from overlapping chat inputs.

## 4. Navigation & Interactivity Blocking
- **Focus Mode**: When users are in "Edit Mode" (e.g., Profile update), the Sidebar and Bottom Nav are now dimmed and disabled.
- **Requirement**: This relies on a `UIProvider` state. Ensure that any future navigation components respect the `isInteractivityDisabled` state.

---
*Prepared by Antigravity AI for the Connected Living Development Team.*
