# Wellstaq - Corporate Wellbeing SaaS Platform

Wellstaq is a comprehensive employee wellbeing platform designed for remote and hybrid teams. It blends lifestyle, productivity, and community into a single cohesive system to drive real results for both employees and HR teams.

## 🚀 Project Overview

This project is built using **Next.js 15+** with the **App Router**. It features a high-converting marketing landing page and a robust dashboard application for wellness tracking, community engagement, and HR insights.

### Architecture
The application uses three clear App Router surfaces:
- `/`: Public marketing site.
- `/onboarding`: OTP authentication and organization onboarding.
- `/dashboard`: Authenticated organization workspace.

Browser code uses the typed client in `services/api.ts`. In API mode, requests pass through the same-origin BFF at `app/api/backend/[...path]/route.ts`; backend URLs and session tokens are never exposed to client JavaScript.

## 🛠 Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Styling:** Tailwind CSS v4
- **Animations:** Framer Motion (`motion/react`)
- **Icons:** Lucide React (Single icon pack for consistency)
- **State Management:** React Hooks (useState, useEffect, useMemo)
- **Notifications:** Sonner (Toast notifications)
- **Fonts:** Google Fonts (Funnel Display for headings, Inter for UI text)

## 🎨 Design System

The project follows a strict design system defined in `app/globals.css`.

### Colors
- **Primary Orange (`#EA6A05`):** Used for primary CTAs, active states, and branding.
- **Teal CTA (`#20796E`):** Used for the high-impact call-to-action banner.
- **Secondary Green (`#37B047`):** Used for spiritual and positive wellness indicators.
- **Grey Scale:** Ranging from `Grey 1` (Dark text) to `Grey 5` (Off-white backgrounds).

### Typography
- **Funnel Display:** Used for display headings (H1, H2, H3) to give a modern, tech-forward feel.
- **Inter:** Used for all body text, UI elements, and subheadings for maximum legibility.

## 📂 Key Directory Structure

```text
app/
├── (marketing)/       # Marketing landing page (Route Group)
│   └── page.tsx       # Root landing page
├── dashboard/         # Main application dashboard
│   ├── challenges/    # Wellness challenges and leaderboards
│   ├── space/         # Community clubs and chat
│   ├── teams/         # Team management and wellness reports
│   └── settings/      # User profile and role management
├── onboarding/        # Multi-step onboarding flow
└── globals.css        # Global styles and Tailwind theme configuration
components/
├── ui/                # Reusable UI components (Buttons, Modals, etc.)
├── dashboard/         # Dashboard-specific components (Sidebar, TopNav)
└── onboarding/        # Onboarding-specific components
lib/                    # Shared frontend utilities and formatting helpers
```

## 🧠 Key Terms & Concepts

### 1. Wellbeing Pillars
Wellstaq categorizes wellness into 8 distinct pillars: Mental, Physical, Financial, Occupation, Social, Intellectual, Environment, and Spiritual. Each pillar has its own tracking and habit-formation logic.

### 2. Behavioral Loop (Cue → Action → Reward)
The application is built on the science of habit formation.
- **Cue:** AI-driven nudges or scheduled reminders.
- **Action:** Completing a challenge, checking in, or joining a club.
- **Reward:** Recognition, leaderboard points, or partner perks.

### 3. Wellness Reports
The product is designed for aggregated, privacy-focused HR insights. The production backend must enforce tenant authorization, aggregation thresholds, consent, retention, and applicable NDPR requirements before real employee wellness data is enabled.

### 4. API Data
The interface loads workspace data from the backend API. During requests, screens render loading placeholders and then show either returned records, an empty state, or an error state.

### 5. Shared Dashboard State
Profile, branch, member, event, department, challenge, and leaderboard data are loaded through `DashboardDataProvider`. Screens do not persist organization or personal information in browser storage.

### 6. Responsive Patterns
The application implements several industrial-standard responsive patterns:
- **Table-to-Card Transformation:** On pages like `Teams`, traditional data tables automatically transform into a card-based layout on mobile devices for better readability and touch interaction.
- **Master-Detail Mobile View:** Pages with a sidebar/list and a detail view (like `Departments` and `Clubs`) use a conditional rendering pattern on mobile. Selecting an item from the list hides the list and shows the details with a "Back" button, maximizing screen real estate.
- **Tabbed Mobile Navigation:** Complex multi-column layouts (like `Space`) are condensed into a tabbed interface on mobile, allowing users to switch between different views easily.

## 🔧 Development

### Getting Started
1. Install dependencies: `npm ci`
2. Copy `.env.example` to `.env.local`; `NEXT_PUBLIC_DATA_SOURCE` must remain `api`.
3. Run the quality gate: `npm run check`
4. Run the dev server: `npm run dev`
5. Open [http://localhost:3000](http://localhost:3000)

### Fast local workflow

- Use `npm run dev` while changing code. It uses Turbopack for faster refreshes; the first visit to a route still compiles that route once.
- Use `npm run preview` when you want to test the optimized production build locally. It builds the app, then serves it at [http://localhost:3000](http://localhost:3000), so navigation speed matches the deployed build rather than development mode.
- Use `npm run dev:webpack` only if a Turbopack-specific issue needs to be isolated.

The backend contract and production switch-over checklist are documented in `docs/API_INTEGRATION.md`.

### Adding New Features
- **UI Components:** Place reusable components in `components/ui/`.
- **New Pages:** Add them to the appropriate route in the `app/` directory.
- **Icons:** Always use `lucide-react`.

---

© 2026 Wellstaq. All rights reserved.
