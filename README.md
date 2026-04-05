# Wellstaq - Corporate Wellbeing SaaS Platform

Wellstaq is a comprehensive employee wellbeing platform designed for remote and hybrid teams. It blends lifestyle, productivity, and community into a single cohesive system to drive real results for both employees and HR teams.

## 🚀 Project Overview

This project is built using **Next.js 15+** with the **App Router**. It features a high-converting marketing landing page and a robust dashboard application for wellness tracking, community engagement, and HR insights.

### Architecture
The project uses **Route Groups** to separate the marketing site from the application logic:
- `(marketing)`: Located at the root `/`. This is the public-facing landing page.
- `(app)`: Located at `/dashboard`. This contains the core application features.
- `onboarding`: Located at `/onboarding`. This is the entry point for new users.

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
lib/
└── mock-data.ts       # Centralized mock data for development
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
Aggregated, privacy-focused insights for HR. Individual data is never shared; only team-level trends are visible to management to ensure trust and compliance (NDPR).

### 4. Route Groups `(groupname)`
Folders wrapped in parentheses are Next.js Route Groups. They allow you to organize routes without affecting the URL path. This is used here to apply different layouts to the marketing site and the app.

### 5. Synchronization via Storage Events
Profile updates in the Settings page are synchronized with the Top Navigation bar using `localStorage` and a `storage` event listener. This ensures the UI stays consistent across different parts of the app without a complex global state manager.

### 6. Responsive Patterns
The application implements several industrial-standard responsive patterns:
- **Table-to-Card Transformation:** On pages like `Teams`, traditional data tables automatically transform into a card-based layout on mobile devices for better readability and touch interaction.
- **Master-Detail Mobile View:** Pages with a sidebar/list and a detail view (like `Departments` and `Clubs`) use a conditional rendering pattern on mobile. Selecting an item from the list hides the list and shows the details with a "Back" button, maximizing screen real estate.
- **Tabbed Mobile Navigation:** Complex multi-column layouts (like `Space`) are condensed into a tabbed interface on mobile, allowing users to switch between different views easily.

## 🔧 Development

### Getting Started
1. Install dependencies: `npm install`
2. Run the dev server: `npm run dev`
3. Open [http://localhost:3000](http://localhost:3000)

### Adding New Features
- **UI Components:** Place reusable components in `components/ui/`.
- **New Pages:** Add them to the appropriate route group in the `app/` directory.
- **Icons:** Always use `lucide-react`.

---

© 2026 Wellstaq. All rights reserved.
