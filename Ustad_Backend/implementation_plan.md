# UI/UX Architecture Trace & Implementation Plan: Ustad AI Mobile App

This document outlines the architecture, design philosophy, and implementation steps for a production-grade, multi-screen Mobile App UI for Ustad AI using React Native (Expo), React Navigation, and NativeWind (Tailwind CSS).

## 1. UI/UX Architecture Trace

### 1.1 Color Psychology & Trust Building
For a local services orchestrator where users are inviting professionals into their homes or businesses, **trust is the paramount emotion**. The app must not feel cheap or generic; it needs a premium SaaS aesthetic.
*   **Primary Brand Color (Deep Navy Blue - `#1E3A8A` / `bg-blue-900`):** Blue is universally associated with security, reliability, and professionalism. Using a deep navy grounds the app and instantly communicates stability.
*   **Background (Crisp White - `#FFFFFF` & Light Gray - `#F3F4F6`):** Clean backgrounds provide breathing room and a modern SaaS feel, ensuring content (like provider cards) stands out.
*   **Accent Color (Vibrant Orange/Amber - `#F59E0B`):** Used sparingly for primary Calls to Action (CTAs). It contrasts sharply with the deep blue, drawing the eye naturally to the next step (e.g., "Book Now", "Get Started").
*   **Success Indicators (Emerald Green - `#10B981`):** Used for reliability scores and active booking statuses to signify safety and confirmed actions.

### 1.2 Navigation Flow
The flow is designed to minimize friction while establishing credibility:
1.  **Splash / Onboarding:** A high-impact first impression. Focuses on the core value proposition (AI-powered, reliable service finding). Sets the premium tone.
2.  **Auth / Login (Mock):** A frictionless, secure-looking entry point (simulating Phone/Google login) to reinforce that the user's data and bookings are protected.
3.  **Dashboard (Home):** The control center. It offers immediate value (quick action categories) and reassurance (active bookings). The Floating Action Button (FAB) for the AI is prominent but unobtrusive, serving as the main entry point to the core orchestration feature.
4.  **Agentic Chat:** A familiar, WhatsApp-style interface. This reduces the cognitive load; users already know how to chat. The agent responds with rich UI components (Provider Cards) rather than just text, bridging the gap between conversational UI and structured app data.

### 1.3 Micro-interactions
*   **The `Pressable` Requirement:** Every interactive element will use React Native's `<Pressable>` component instead of standard `<TouchableOpacity>` or `<Button>`.
*   **Visual Feedback:** Using the `pressed` state from `Pressable`, buttons will gracefully scale down slightly (e.g., `scale-95`) and reduce opacity (e.g., `opacity-80`) when tapped. This physical-feeling feedback makes the app feel highly responsive, solid, and "alive," directly enhancing the premium feel.

---

## 2. Proposed Changes & Implementation Steps

### 2.1 Project Initialization & Dependencies
We will create a new Expo project in a `mobile` directory inside the current workspace.
*   Initialize Expo app: `npx create-expo-app mobile`
*   Install React Navigation: `@react-navigation/native`, `@react-navigation/native-stack`, and necessary peer dependencies (`react-native-screens`, `react-native-safe-area-context`).
*   Install NativeWind for Tailwind styling in React Native.

### 2.2 Directory Structure
We will structure the app logically:
```
mobile/
├── src/
│   ├── components/      # Reusable UI (ProviderCard, CustomButton)
│   ├── screens/         # Screen components (Onboarding, Login, Dashboard, Chat)
│   ├── navigation/      # Stack navigator setup
│   └── theme/           # Color palettes and shared styles (if needed)
├── App.js               # Entry point, rendering the Navigator
```

### 2.3 Component Breakdown

#### [NEW] `src/navigation/AppNavigator.js`
*   Implements `createNativeStackNavigator`.
*   Defines routes: `Onboarding`, `Login`, `Dashboard`, `Chat`.
*   Hides default headers for a cleaner, custom look where appropriate.

#### [NEW] `src/screens/OnboardingScreen.js`
*   Premium branding centered.
*   Custom `Pressable` "Get Started" button routing to Login.

#### [NEW] `src/screens/LoginScreen.js`
*   Clean inputs or mock "Continue with Google" / "Continue with Phone" buttons.
*   Routes to Dashboard on press.

#### [NEW] `src/screens/DashboardScreen.js`
*   **Header:** Welcome message.
*   **Quick Actions:** Grid of `Pressable` cards (AC Repair, Plumber, Electrician).
*   **Active Bookings:** A mock card showing a pending or confirmed job.
*   **Floating Action Button (FAB):** A highly visible, shadowed button anchored to the bottom right, routing to the Chat screen.

#### [NEW] `src/screens/ChatScreen.js`
*   **Layout:** Standard chat view (KeyboardAvoidingView, ScrollView).
*   **Input:** Text input area with a send button.
*   **Message Bubbles:** Distinct styling for User (right, blue) and Agent (left, gray).
*   **Provider Card Integration:** The Agent can render a `ProviderCard` component as part of its response stream.

#### [NEW] `src/components/ProviderCard.js`
*   Rich UI component displaying matched provider data.
*   Fields: Name, Rating (Star icons), Reliability Score (badge), Dynamic Estimated Price.
*   Styling: Clean white card, subtle shadow, rounded corners.

#### [MODIFY] `App.js`
*   Wrap the application in Navigation Container and Safe Area Provider.

---

## 3. Verification Plan

### Automated/Build Verification
*   Successfully run `npx expo start` and ensure the Metro bundler launches without errors.
*   Verify Tailwind classes compile correctly via NativeWind.

### Manual Verification
*   **Navigation:** Test the flow from Onboarding -> Login -> Dashboard -> Chat.
*   **Micro-interactions:** Physically tap all buttons (Get Started, Login, Quick Actions, FAB, Send Chat) to ensure the `Pressable` scale/opacity states trigger smoothly.
*   **UI Integrity:** Verify the ProviderCard renders beautifully within the Chat screen with proper spacing, shadows, and trustworthy colors.

## User Review Required

> [!IMPORTANT]  
> Please review the color psychology, navigation flow, and architecture above. I am ready to generate the Expo app and begin writing the code once you approve this plan. Do the deep blue/orange color themes align with your vision for Ustad AI, or would you prefer a different palette?
