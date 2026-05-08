# PrismaPulse (Campus Hub) Client Architecture Analysis

This document provides a comprehensive overview of the code flow, state management, and component architecture for the PrismaPulse (Campus Recommendation) web client.

## 1. Core Architecture & State Management

The application operates as a single-page React application (SPA) heavily reliant on a centralized context provider for state management and Firebase synchronization.

### The AppContext (`contexts/AppContext.tsx`)
This is the heart of the application. It establishes real-time connections to Firebase Firestore and manages all global state.

**Key Responsibilities:**
*   **Authentication State (`onAuthStateChanged`)**: Listens to Firebase Auth. When a user logs in, it fetches their `User` document from Firestore. It also handles automatic role elevation for bootstrapped admin emails.
*   **Real-time Data Sync (`onSnapshot`)**: Sets up listeners for core collections:
    *   `events`: All campus events.
    *   `registrations`: Filtered based on role (Admins see all, Organizers see their events' registrations, Students see their own).
    *   `notifications`: Filtered for the current user.
    *   `users`: All users for social/directory features.
*   **Data Mutation Methods**: Exposes a rich API for components to interact with the backend, handling Firestore transactions safely (e.g., `registerForEvent`, `checkInUser`, `moderateEvent`, `updateUserRole`).

## 2. Component Hierarchy and Routing Flow

The app does not use a traditional router (like `react-router-dom`). Instead, it uses conditional rendering driven by the `AppContext` state (authentication and roles).

### Entry Point (`main.tsx` -> `App.tsx`)
1.  **`AppProvider`**: Wraps the entire application, initializing the context.
2.  **Auth Guards (`AppContent`)**: 
    *   If `authLoading` is true -> renders `<LoadingScreen />`
    *   If no `currentUser` -> renders `<LandingPage />` (contains the login flow).
    *   If authenticated -> renders `<StudentPortal />`.

### The Shell: `StudentPortal.tsx`
Despite the name, `StudentPortal` acts as the main application shell for **all** users. It provides the top navigation bar, the bottom navigation tabs, and the background visual effects. 

**Tab System (`activeTab` state):**
*   **`home`**: Displays the event feed or map view (`MapView.tsx`). Shows `EventCard` components. Includes search and category filtering.
*   **`tickets`**: Displays the user's `registrations`. Shows `TicketCard` components with QR codes for check-in.
*   **`profile`**: Renders `AccountSection.tsx` for user settings and profile management.
*   **`manage` (Role-gated)**: Renders the `ManagementView.tsx` component.

### Role-Based Portals (`ManagementView.tsx`)
When a user clicks the "Manage" tab, `ManagementView` evaluates `currentUser.role`:
*   **`UserRole.ADMIN`** -> Renders `<AdminPortal />`
*   **`UserRole.ORGANIZER`** -> Renders `<OrganizerPortal />`
*   **Other (Student)** -> Renders an "Access Restricted" screen.

## 3. Specialized Portals

### OrganizerPortal (`OrganizerPortal.tsx`)
A complex dashboard for event creators. 
*   **Sub-navigation**: Console, Moments (Event List), Canvas (Event Builder), Engagement (Analytics), Scanner (QR Check-in).
*   **Key Logic**: Includes the `EventBuilder` for creating new events (currently pending finalized image upload logic) and `ScannerView` for processing attendees. It also handles an onboarding state if the organizer's account is pending admin approval.

### AdminPortal (`AdminPortal.tsx`)
The command center for platform administrators.
*   **Sub-navigation**: Nexus (Dashboard), Moderation (Event Approvals), Directory (User Management), Security.
*   **Key Logic**: Allows admins to approve/reject events, change user roles, and view system-wide analytics using `recharts`.

## 4. Data Models (`types.ts`) & Security Rules
The application heavily relies on structured TypeScript interfaces that map directly to the `firebase-blueprint.json` schema:
*   **`CampusEvent`**: Contains metadata, `assets` (images), `status` (PENDING, APPROVED, REJECTED), `capacity`, and metrics (`registeredCount`, `checkedInCount`).
*   **`User`**: Tracks standard profile data, `role` (student, organizer, admin), social graph (`followers`, `following`), and approval status for organizers.
*   **`Registration`**: Links a `User` to a `CampusEvent`, storing a `qrCode` and `checkedIn` boolean.

The `security_spec.md` details how Firestore Security Rules must enforce these models, specifically ensuring that only admins/organizers can mutate event data, and students can only register for themselves.

## 5. UI/UX Paradigm
*   **Styling**: Built with Tailwind CSS and `shadcn/ui`.
*   **Aesthetic**: Industrial/cyberpunk ("PrismaPulse"). Uses lots of uppercase text, monospace fonts, deep blacks with neon accents, and heavy borders.
*   **Animations**: Uses `motion/react` (Framer Motion) for page transitions (`AnimatePresence`), list staggering, and micro-interactions.
