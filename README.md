# 🧹 AmdavadSafai — અમદાવાદ સફાઈ

**Crowdsourced Garbage Reporting Map for Ahmedabad**

A civic-tech web application that enables citizens to track, report, and monitor garbage/waste issues across Ahmedabad's wards. Built with full **Gujarati (ગુજરાતી)** and **English** language support.

> Inspired by [NammaKasa](https://nammakasa.vercel.app/) (Bengaluru). Localized for Ahmedabad.

---

## 📑 Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Features](#features)
  - [1. Welcome Overlay (Onboarding)](#1-welcome-overlay-onboarding)
  - [2. Header & Navigation](#2-header--navigation)
  - [3. Interactive Map View](#3-interactive-map-view)
  - [4. List View](#4-list-view)
  - [5. Map ↔ List Toggle](#5-map--list-toggle)
  - [6. Severity Filter](#6-severity-filter)
  - [7. Status Filter](#7-status-filter)
  - [8. Statistics Panel](#8-statistics-panel)
  - [9. Language Switching (i18n)](#9-language-switching-i18n)
  - [10. Email Subscription (Monday Digest)](#10-email-subscription-monday-digest)
  - [11. Changelog Modal](#11-changelog-modal)
  - [12. Social Media Menu](#12-social-media-menu)
  - [13. Color-Coded Severity Badges](#13-color-coded-severity-badges)
  - [14. Responsive Design](#14-responsive-design)
  - [15. Ward-Level Representative Info](#15-ward-level-representative-info)
- [Data Model](#data-model)
- [Internationalization (i18n)](#internationalization-i18n)
- [Project Structure](#project-structure)
- [Design System](#design-system)
- [Getting Started](#getting-started)
- [Deployment](#deployment)
- [Future Roadmap](#future-roadmap)

---

## Overview

**AmdavadSafai** (અમદાવાદ સફાઈ — "Ahmedabad Cleanliness") is a read-only civic dashboard that visualizes garbage and waste complaints across Ahmedabad. Citizens can:

- View garbage reports on an **interactive map** or a **ward-wise list**
- Filter reports by **severity** and **resolution status**
- See **statistics** on resolution rates and worst-performing wards
- Browse the app in **English** or **ગુજરાતી (Gujarati)**
- Subscribe to a **weekly digest** of garbage updates via email

The app covers **20 wards** across Ahmedabad's zones, with realistic seed data for demonstration purposes.

---

## Tech Stack

| Layer         | Technology | Open Source / Details | License |
| ------------- | ---------- | --------------------- | ------- |
| **Framework** | React 18+ (via Vite) | Component-based UI library & tooling | MIT |
| **Map**       | Leaflet.js + React-Leaflet | Mobile-friendly interactive maps | BSD-2-Clause / MIT |
| **Map Tiles** | OpenStreetMap (OSM) | Global collaborative mapping project database | ODbL |
| **Icons**     | Lucide React | Community-sourced clean icon family | MIT |
| **Styling**   | Vanilla CSS | CSS custom properties (variables) | N/A |
| **Fonts**     | Google Fonts | Noto Sans Gujarati & Inter | SIL OFL 1.1 |
| **i18n**      | Custom Context | Custom translation provider & hooks | N/A |
| **State**     | React hooks + Context API | Standard React state management | N/A |
| **Storage**   | `localStorage` | Client-side persistent key-value store | N/A |
| **Data**      | Static JSON files | Ahmedabad wards/reports seed datasets | CC0 (Public Domain) |
| **Build**     | Vite | Frontend tooling and dev server | MIT |
| **Deploy**    | Vercel | Static hosting platform | N/A |

---

## Features

### 1. Welcome Overlay (Onboarding)

**Purpose**: Greet first-time visitors and explain what the app does.

**Behavior**:
- Displays a **full-screen overlay** when the user visits for the first time
- Shows the app logo, name ("અમદાવાદ સફાઈ"), and a short tagline describing the app's purpose
- Contains a **"શરૂ કરો" (Get Started)** button to dismiss the overlay and enter the app
- After dismissal, a flag is saved in `localStorage` so the overlay **never shows again** on subsequent visits
- The overlay has a semi-transparent dark backdrop with a centered card that fades in with a smooth animation

**UI Elements**:
- App logo/icon (🧹 or custom SVG)
- App name in Gujarati: **અમદાવાદ સફાઈ**
- Tagline: "અમદાવાદમાં કચરાની ફરિયાદો ટ્રેક કરો" _(Track garbage complaints in Ahmedabad)_
- Primary CTA button: **શરૂ કરો** / **Get Started**

**Implementation**:
- Component: `WelcomeOverlay.jsx`
- Uses `useLocalStorage` hook to check/set `hasVisited` flag
- CSS fade-in animation on mount, fade-out on dismiss
- Renders above all other content with `z-index: 1000`

---

### 2. Header & Navigation

**Purpose**: Persistent top bar with app identity, controls, and navigation.

**Layout** (left to right):
```
[Logo + App Name]    [Monday Digest Banner]    [Version Badge] [Lang Toggle] [Menu ☰]
```

**Elements**:

| Element | Details |
|---------|---------|
| **Logo + Name** | App icon + "AmdavadSafai" (or "અમદાવાદ સફાઈ" in Gujarati mode) |
| **Monday Digest Banner** | Small clickable banner text: "📧 સોમવાર ડાઇજેસ્ટ માટે સબ્સ્ક્રાઇબ કરો" — opens the subscribe modal |
| **Version Badge** | Shows current version (e.g., `v1.0.0`). Clickable — opens the Changelog modal |
| **Language Toggle** | Button that toggles between `EN` and `ગુજ`. Current language is highlighted |
| **Menu Button** | Hamburger icon (☰) — opens the Social Media dropdown menu |

**Implementation**:
- Component: `Header.jsx`
- Sticky/fixed position at the top
- Background: semi-transparent with backdrop blur (glassmorphism)
- Height: ~56px
- Responsive: on mobile, the digest banner hides and moves to a separate banner below the header

---

### 3. Interactive Map View

**Purpose**: Visualize garbage reports geographically on a map of Ahmedabad.

**Behavior**:
- Renders a **Leaflet.js** map centered on Ahmedabad at coordinates `[23.0225, 72.5714]`
- Default zoom level: **12** (shows the full city)
- Each garbage report is placed as a **colored marker** on the map at its lat/lng coordinates
- **Marker colors** correspond to severity:
  - 🟢 Green = Minor (સામાન્ય)
  - 🟡 Yellow = Moderate (મધ્યમ)
  - 🟠 Orange = Severe (ગંભીર)
  - 🔴 Red = Critical (અત્યંત ગંભીર)
- **Marker popups**: Clicking a marker shows a popup with:
  - Report description (in current language)
  - Ward name
  - Severity badge
  - Status (Resolved ✅ / Unresolved ❌)
  - Time since report (e.g., "12 દિવસ પહેલાં" / "12 days ago")
- **Map controls**: Zoom in/out buttons, attribution

**Implementation**:
- Component: `MapView.jsx`
- Dependencies: `leaflet`, `react-leaflet`
- Uses OpenStreetMap tile layer (free, no API key needed)
- Custom colored circle markers using Leaflet's `CircleMarker`
- Markers respond to the active filters (severity/status)
- Map fills the viewport below the header (height: `calc(100vh - 56px)`)

---

### 4. List View

**Purpose**: Browse reports in a structured, ward-wise grouped list format.

**Layout**:
```
┌─────────────────────────────────────────┐
│ 📍 મણિનગર (Maninagar)                  │
│    નગરસેવક: રમેશ પટેલ                   │
│    કુલ ફરિયાદો: 5  |  અનિરાકૃત: 3       │
│ ──────────────────────────────────────── │
│  ▶ મણિનગર રેલ્વે સ્ટેશન પાસે ઢગલો        │
│    ● ગંભીર  ·  અનિરાકૃત  ·  12દિ પહેલાં   │
│  ▶ બસ સ્ટોપ પાછળ કચરો                    │
│    ● મધ્યમ  ·  નિરાકૃત  ·  29દિ પહેલાં    │
│  ...                                     │
├─────────────────────────────────────────┤
│ 📍 નવરંગપુરા (Navrangpura)             │
│    ...                                   │
└─────────────────────────────────────────┘
```

**Behavior**:
- Reports are **grouped by ward**
- Each **ward card** displays:
  - Ward name (in current language)
  - Corporator/representative name
  - Total report count
  - Unresolved report count
- Ward cards are **expandable/collapsible** — click to toggle
- Inside each ward, individual **report items** show:
  - Report description/location
  - Severity badge (color-coded)
  - Status label (Resolved / Unresolved)
  - Relative time since report ("12 દિવસ પહેલાં")
- List is **scrollable** and fills the viewport below the header
- Wards are **sorted by unresolved count** (worst wards at top)

**Implementation**:
- Components: `ListView.jsx`, `WardCard.jsx`, `ReportItem.jsx`
- Uses `useState` for expand/collapse per ward
- Derives ward groupings from reports data
- Responds to active filters
- Smooth expand/collapse animation using CSS `max-height` transition

---

### 5. Map ↔ List Toggle

**Purpose**: Allow users to switch between the two primary views.

**Behavior**:
- Two toggle buttons displayed in the **top-right** area (below header, above content)
- Buttons: **"નકશો" (Map)** | **"યાદી" (List)**
- Active view button is highlighted with a filled/accent style
- Inactive button has an outline/muted style
- Switching views preserves the current filter state
- Smooth transition when switching (cross-fade)

**Implementation**:
- Part of the `App.jsx` layout
- State: `activeView` — `"map"` or `"list"`
- Both MapView and ListView receive the same filtered data
- Toggle buttons styled as a pill/segmented control

---

### 6. Severity Filter

**Purpose**: Filter reports by how severe the garbage issue is.

**Options**:

| Value | English | Gujarati |
|-------|---------|----------|
| `all` | All Severity | બધી તીવ્રતા |
| `minor` | Minor | સામાન્ય |
| `moderate` | Moderate | મધ્યમ |
| `severe` | Severe | ગંભીર |
| `critical` | Critical | અત્યંત ગંભીર |

**Behavior**:
- Dropdown/select element in the **filter bar** area
- Defaults to "All Severity" (shows everything)
- Selecting a severity level filters both Map markers and List items to only show reports with that severity
- Filter works **in combination** with the Status filter (AND logic)
- Updates are **instant** (no loading delay)

**Implementation**:
- Part of `FilterBar.jsx`
- State managed by `useFilter` custom hook
- Options are pulled from the i18n translation files
- Styled as a custom dropdown with the severity color indicator

---

### 7. Status Filter

**Purpose**: Filter reports by their resolution status.

**Options**:

| Value | English | Gujarati |
|-------|---------|----------|
| `all` | All Status | બધી સ્થિતિ |
| `unresolved` | Unresolved | અનિરાકૃત |
| `resolved` | Resolved | નિરાકૃત |

**Behavior**:
- Dropdown/select element next to the Severity filter
- Defaults to "All Status"
- Combined with Severity filter using AND logic
- Example: selecting "Critical" + "Unresolved" shows only critical unresolved reports

**Implementation**:
- Part of `FilterBar.jsx`
- Same `useFilter` hook manages both filter states
- Styled consistently with the Severity dropdown

---

### 8. Statistics Panel

**Purpose**: Show aggregate data about garbage reports and ward performance.

**Layout**:
```
┌───────────────────────────────────────────────┐
│              📊 આંકડા (Statistics)             │
│                                               │
│  ┌──────────┐  ┌──────────┐  ┌──────────────┐ │
│  │   127    │  │    89    │  │    29.9%     │ │
│  │ કુલ      │  │ અનિરાકૃત │  │ નિરાકરણ દર  │ │
│  │ ફરિયાદો  │  │ ફરિયાદો  │  │              │ │
│  └──────────┘  └──────────┘  └──────────────┘ │
│                                               │
│  🔴 સૌથી ખરાબ વોર્ડ:                          │
│  1. નરોડા — 12 અનિરાકૃત                      │
│  2. વાસ્ત્રાલ — 9 અનિરાકૃત                   │
│  3. બાપુનગર — 8 અનિરાકૃત                     │
└───────────────────────────────────────────────┘
```

**Behavior**:
- A **toggle button** fixed at the bottom of the screen: "📊 આંકડા" / "📊 Statistics"
- Clicking it **slides up** a panel from the bottom
- Panel displays:
  - **Total reports** count
  - **Unresolved reports** count
  - **Resolution rate** (percentage of resolved / total × 100)
  - **Top 5 worst wards** (sorted by unresolved count, descending)
- Numbers use an **animated counter** effect (counts up from 0)
- Clicking the toggle again or a close (✕) button **slides the panel down**
- Panel has a glassmorphism background (semi-transparent with blur)

**Implementation**:
- Component: `StatsPanel.jsx`
- Computes stats from the reports data on each render
- CSS `transform: translateY()` for slide animation
- `requestAnimationFrame` for number counter animation
- Panel sits above the map/list content with appropriate z-index

---

### 9. Language Switching (i18n)

**Purpose**: Allow users to switch the entire UI between English and Gujarati.

**Behavior**:
- Toggle button in the header: `EN` | `ગુજ`
- Clicking switches **all text** in the app to the selected language:
  - Navigation labels
  - Filter options
  - Report descriptions
  - Ward names
  - Corporator names
  - Stats labels
  - Modal content
  - Button text
  - Tooltips and placeholders
- The selected language is **persisted** in `localStorage`
- On next visit, the app loads in the user's previously selected language
- Default language: **ગુજરાતી (Gujarati)**

**Translation Coverage**:

| Category | Examples |
|----------|----------|
| Navigation | નકશો, યાદી, આંકડા |
| Filters | બધી તીવ્રતા, સામાન્ય, મધ્યમ, ગંભીર, અત્યંત ગંભીર |
| Status | અનિરાકૃત, નિરાકૃત, બધી સ્થિતિ |
| Stats | કુલ ફરિયાદો, નિરાકરણ દર, સૌથી ખરાબ વોર્ડ |
| Time | દિવસ પહેલાં, કલાક પહેલાં |
| Actions | શરૂ કરો, સબ્સ્ક્રાઇબ, બંધ કરો |
| Data | Ward names, corporator names, report descriptions |

**Implementation**:
- Translation files: `src/i18n/en.json` and `src/i18n/gu.json`
- Custom hook: `useTranslation()` — returns `{ t, lang, toggleLang }`
  - `t("key")` — returns the translated string
  - `lang` — current language code (`"en"` or `"gu"`)
  - `toggleLang()` — switches between languages
- Language context provider wraps the entire app
- Data objects (wards, reports) have both `_en` and `_gu` suffixed fields; the `t` helper picks the right one

---

### 10. Email Subscription (Monday Digest)

**Purpose**: Let users subscribe to a weekly email digest of garbage report updates.

**Flow**:
1. User sees a **banner** in/below the header: "📧 સોમવાર ડાઇજેસ્ટ માટે સબ્સ્ક્રાઇબ કરો"
2. Clicking the banner opens a **modal dialog**
3. Modal contains:
   - Title: "સોમવાર ડાઇજેસ્ટ" (Monday Digest)
   - Description: Brief explanation of what the digest contains
   - **Email input** field with placeholder "તમારું ઇમેઇલ દાખલ કરો" (Enter your email)
   - **Subscribe button**: "સબ્સ્ક્રાઇબ કરો"
4. Basic client-side **validation**:
   - Email format check (regex)
   - Empty field check
   - Error message shown below the input if invalid
5. On successful submission:
   - Show a **success message**: "✅ સફળતાપૂર્વક સબ્સ્ક્રાઇબ થયું!" (Successfully subscribed!)
   - Auto-close modal after 2 seconds
6. Modal can be **closed** via ✕ button or clicking the backdrop

**Implementation**:
- Component: `SubscribeModal.jsx`
- Since there's no backend, the submit just shows a success message (mock)
- Modal uses `createPortal` to render at the document root
- CSS: centered card with backdrop, fade-in animation
- Focus trap for accessibility

---

### 11. Changelog Modal

**Purpose**: Display the app's version history and release notes.

**Flow**:
1. User clicks the **version badge** (e.g., `v1.0.0`) in the header
2. A **modal** opens showing the changelog

**Content Structure**:
```
📋 ચેન્જલોગ (Changelog)

v1.0.0 — 16 જુલાઈ, 2026
━━━━━━━━━━━━━━━━━━━━━━━━
✨ પ્રારંભિક પ્રકાશન
• ઇન્ટરેક્ટિવ નકશો સાથે કચરાના માર્કર્સ
• વોર્ડ-વાઇઝ યાદી દૃશ્ય
• તીવ્રતા અને સ્થિતિ ફિલ્ટર
• અંગ્રેજી ↔ ગુજરાતી ભાષા સ્વિચિંગ
• આંકડા પેનલ
• સોમવાર ડાઇજેસ્ટ સબ્સ્ક્રિપ્શન
```

**Implementation**:
- Component: `ChangelogModal.jsx`
- Changelog data stored as a JS array of version objects
- Scrollable modal body for long changelogs
- Same modal styling pattern as SubscribeModal

---

### 12. Social Media Menu

**Purpose**: Provide links to the project's social media presence.

**Behavior**:
1. User clicks the **hamburger menu (☰)** in the header
2. A **dropdown** slides down with social media links:
   - 📱 **Telegram** — opens Telegram group/channel
   - 🐦 **X (Twitter)** — opens X/Twitter profile
   - 📷 **Instagram** — opens Instagram page
3. Each link opens in a **new tab** (`target="_blank"`)
4. Clicking outside the dropdown **closes it**
5. The dropdown has subtle slide-down animation

**Implementation**:
- Component: `SocialMenu.jsx`
- Positioned absolutely below the menu button
- Click-outside detection using `useEffect` with document event listener
- Icons: SVG icons for each platform (inline or imported)

---

### 13. Color-Coded Severity Badges

**Purpose**: Provide instant visual recognition of report severity.

**Badge Styles**:

| Severity | Color | Background | Text |
|----------|-------|------------|------|
| Minor (સામાન્ય) | Green | `#dcfce7` | `#166534` |
| Moderate (મધ્યમ) | Yellow | `#fef9c3` | `#854d0e` |
| Severe (ગંભીર) | Orange | `#ffedd5` | `#9a3412` |
| Critical (અત્યંત ગંભીર) | Red | `#fecaca` | `#991b1b` |

**Usage**: Badges appear in:
- Report items in the list view
- Map marker popups
- Stats panel worst-wards list

**Implementation**:
- CSS classes: `.badge-minor`, `.badge-moderate`, `.badge-severe`, `.badge-critical`
- Small pill-shaped badges with rounded corners
- Used in `ReportItem.jsx` and map popup content

---

### 14. Responsive Design

**Purpose**: Ensure the app works well on all screen sizes.

**Breakpoints**:

| Breakpoint | Width | Layout Changes |
|------------|-------|----------------|
| **Desktop** | ≥1024px | Full layout — map/list fills viewport, header shows all elements |
| **Tablet** | 768–1023px | Slight padding adjustments, digest banner shrinks |
| **Mobile** | <768px | Digest banner moves below header, filter bar stacks vertically, stats panel is full-width, list cards use full width |

**Key Responsive Behaviors**:
- Map: always fills available width, adjusts height
- List: single-column layout on mobile
- Filter bar: horizontal on desktop, stacked on mobile
- Header: logo + essential controls only on mobile (version badge hidden)
- Modals: full-width on mobile with reduced padding
- Stats panel: full-width drawer on mobile

**Implementation**:
- CSS media queries in individual component stylesheets
- Flexbox and CSS Grid for layouts
- `rem`/`em` units for scalable sizing
- Touch-friendly tap targets (min 44px) on mobile

---

### 15. Ward-Level Representative Info

**Purpose**: Show who is responsible (corporator/નગરસેવક) for each ward.

**Display**:
- In the **List View**, each ward card shows:
  - "નગરસેવક: [Name]" (Corporator: [Name])
- In the **Map popup**, the ward and corporator name are shown for each report
- Corporator names are available in both English and Gujarati

**Data**:
- Stored in `wards.json` with `corporator_en` and `corporator_gu` fields
- Linked to reports via `ward_id` foreign key

---

## Data Model

### Ward Object

```json
{
  "id": "ward_01",
  "name_en": "Maninagar",
  "name_gu": "મણિનગર",
  "zone_en": "South Zone",
  "zone_gu": "દક્ષિણ ઝોન",
  "corporator_en": "Ramesh Patel",
  "corporator_gu": "રમેશ પટેલ",
  "lat": 23.0028,
  "lng": 72.6039
}
```

### Report Object

```json
{
  "id": "rpt_001",
  "ward_id": "ward_01",
  "description_en": "Garbage dump near Maninagar railway station",
  "description_gu": "મણિનગર રેલ્વે સ્ટેશન પાસે કચરાનો ઢગલો",
  "severity": "minor | moderate | severe | critical",
  "status": "unresolved | resolved",
  "lat": 23.0030,
  "lng": 72.6042,
  "reported_at": "2026-06-15T10:30:00Z"
}
```

### Relationships

```
Ward (1) ──── (N) Report
  └─ ward_id foreign key
```

---

## Internationalization (i18n)

### Architecture

```
src/i18n/
├── en.json              # English translations (~80 keys)
├── gu.json              # Gujarati translations (~80 keys)
└── useTranslation.js    # React hook + context provider
```

### Hook API

```jsx
const { t, lang, toggleLang } = useTranslation();

// Usage
<h1>{t("app_name")}</h1>        // "અમદાવાદ સફાઈ" or "AmdavadSafai"
<button>{t("get_started")}</button> // "શરૂ કરો" or "Get Started"

// For data fields
const wardName = ward[`name_${lang}`]; // ward.name_gu or ward.name_en
```

### Translation File Structure

```json
{
  "app_name": "અમદાવાદ સફાઈ",
  "tagline": "અમદાવાદમાં કચરાની ફરિયાદો ટ્રેક કરો",
  "get_started": "શરૂ કરો",
  "map": "નકશો",
  "list": "યાદી",
  "filter_all_severity": "બધી તીવ્રતા",
  "filter_minor": "સામાન્ય",
  "filter_moderate": "મધ્યમ",
  "filter_severe": "ગંભીર",
  "filter_critical": "અત્યંત ગંભીર",
  "filter_all_status": "બધી સ્થિતિ",
  "filter_unresolved": "અનિરાકૃત",
  "filter_resolved": "નિરાકૃત",
  "stats": "આંકડા",
  "total_reports": "કુલ ફરિયાદો",
  "unresolved_reports": "અનિરાકૃત ફરિયાદો",
  "resolution_rate": "નિરાકરણ દર",
  "worst_wards": "સૌથી ખરાબ વોર્ડ",
  "corporator": "નગરસેવક",
  "subscribe": "સબ્સ્ક્રાઇબ કરો",
  "monday_digest": "સોમવાર ડાઇજેસ્ટ",
  "enter_email": "તમારું ઇમેઇલ દાખલ કરો",
  "subscribe_success": "સફળતાપૂર્વક સબ્સ્ક્રાઇબ થયું!",
  "changelog": "ચેન્જલોગ",
  "close": "બંધ કરો",
  "days_ago": "દિવસ પહેલાં",
  "hours_ago": "કલાક પહેલાં"
}
```

---

## Project Structure

```
amdavad-safai/
├── public/
│   └── favicon.ico
├── src/
│   ├── assets/                     # Static assets (icons, SVGs)
│   ├── components/
│   │   ├── Header.jsx              # Top navigation bar
│   │   ├── WelcomeOverlay.jsx      # First-visit onboarding screen
│   │   ├── MapView.jsx             # Leaflet interactive map
│   │   ├── ListView.jsx            # Ward-wise list container
│   │   ├── WardCard.jsx            # Expandable ward card
│   │   ├── ReportItem.jsx          # Single report row
│   │   ├── FilterBar.jsx           # Severity + Status filter dropdowns
│   │   ├── StatsPanel.jsx          # Bottom stats drawer
│   │   ├── SubscribeModal.jsx      # Email subscription modal
│   │   ├── ChangelogModal.jsx      # Version history modal
│   │   └── SocialMenu.jsx          # Social media dropdown
│   ├── data/
│   │   ├── wards.json              # 20 Ahmedabad ward records
│   │   └── reports.json            # 60–80 seed garbage reports
│   ├── i18n/
│   │   ├── en.json                 # English translations
│   │   ├── gu.json                 # Gujarati translations
│   │   └── useTranslation.js       # i18n hook + context
│   ├── hooks/
│   │   ├── useFilter.js            # Filter state management
│   │   └── useLocalStorage.js      # localStorage wrapper hook
│   ├── styles/
│   │   ├── index.css               # Global styles, resets, CSS variables
│   │   ├── header.css              # Header styles
│   │   ├── map.css                 # Map container styles
│   │   ├── list.css                # List view styles
│   │   ├── filters.css             # Filter bar styles
│   │   ├── modals.css              # Modal (subscribe, changelog) styles
│   │   └── stats.css               # Stats panel styles
│   ├── App.jsx                     # Main app shell
│   └── main.jsx                    # Entry point
├── index.html                      # HTML entry
├── package.json                    # Dependencies and scripts
├── vite.config.js                  # Vite configuration
└── README.md                       # This file
```

---

## Design System

### Color Palette

```css
/* Primary */
--color-primary: #0d9488;           /* Teal — main brand color */
--color-primary-light: #14b8a6;
--color-primary-dark: #0f766e;

/* Background */
--color-bg: #0f1419;                /* Deep dark blue-black */
--color-bg-card: #1a2332;           /* Card background */
--color-bg-elevated: #243044;       /* Elevated surfaces */

/* Text */
--color-text-primary: #e2e8f0;      /* Main text */
--color-text-secondary: #94a3b8;    /* Secondary text */
--color-text-muted: #64748b;        /* Muted text */

/* Severity Colors */
--color-minor: #22c55e;             /* Green */
--color-moderate: #eab308;          /* Yellow */
--color-severe: #f97316;            /* Orange */
--color-critical: #ef4444;          /* Red */

/* Status */
--color-resolved: #22c55e;          /* Green */
--color-unresolved: #ef4444;        /* Red */

/* Glassmorphism */
--glass-bg: rgba(26, 35, 50, 0.8);
--glass-blur: blur(12px);
--glass-border: rgba(255, 255, 255, 0.1);
```

### Typography

```css
/* English text */
font-family: 'Inter', sans-serif;

/* Gujarati text */
font-family: 'Noto Sans Gujarati', sans-serif;
```

### Spacing Scale

```css
--space-xs: 4px;
--space-sm: 8px;
--space-md: 16px;
--space-lg: 24px;
--space-xl: 32px;
--space-2xl: 48px;
```

### Border Radius

```css
--radius-sm: 6px;
--radius-md: 10px;
--radius-lg: 16px;
--radius-full: 9999px;    /* Pill shape */
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- npm 9+

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd amdavad-safai

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173`

### Build for Production

```bash
npm run build
```

Output will be in the `dist/` directory.

---

## Deployment

### Vercel (Recommended)

1. Push code to a GitHub repository
2. Connect the repo to [Vercel](https://vercel.com)
3. Vercel auto-detects Vite and builds with `npm run build`
4. Deployed to a `.vercel.app` subdomain

### Other Platforms

Any static hosting works (Netlify, GitHub Pages, Firebase Hosting). Just deploy the `dist/` folder.

---

## Future Roadmap

### Remaining Feature Parity Roadmap

The following capabilities complete the crowdsourced civic-accountability experience while keeping the product focused on Gujarat and its municipal wards.

#### 1. Enhanced Report Submission

- Support uploading garbage-site photos from camera or device storage.
- Request location permission and show detected coordinates and accuracy.
- Detect the user's Gujarat city, municipal ward, and local representative from the selected location.
- Let residents choose categories such as garbage dump, overflowing bin, road waste, construction waste, or missed collection.
- Allow manual pin placement when GPS is unavailable or inaccurate.
- Show submission status and retain the report ID after success.
- Enforce a lightweight daily submission limit and prevent duplicate submissions.

#### 2. Smarter Map Experience

- Cluster nearby reports and expand clusters as the user zooms in.
- Add ward cleanliness heatmap/fill mode based on unresolved report count and report age.
- Add a “near me” mode for reports within a configurable radius.
- Show total and unresolved report counts for each ward on hover or tap.
- Add a map legend for severity, resolution status, ward boundaries, and heatmap colors.
- Keep the map usable with bundled data when the backend is unavailable.

#### 3. Gujarat Civic Accountability

- Expand ward records with municipal corporation, zone, ward number, ward name, and verified representative details.
- Add official contact or complaint links where public and verified.
- Create ward profiles showing unresolved reports, resolution rate, oldest reports, and representative information.
- Support city-specific ward datasets so the platform can grow beyond Ahmedabad.

#### 4. Community Verification and Resolution

- Allow residents to upvote reports that are still valid and useful.
- Add a “not garbage” or incorrect-report dispute action with abuse protection.
- Let authorized users or moderators mark reports resolved with resolution notes.
- Support before-and-after photos for resolved reports.
- Show report activity history across created, disputed, verified, and resolved states.

#### 5. Shareable Report and Ward Pages

- Add stable routes such as `/report/:id` and `/ward/:wardId`.
- Add native share and copy-link actions for reports and ward profiles.
- Generate share previews with location, ward, status, severity, and latest image.
- Preserve filter and map state when navigating back from detail pages.

#### 6. Advanced Analytics

- Add ward comparison charts for report volume, unresolved count, resolution rate, and report age.
- Add severity distribution and category breakdown charts.
- Add daily, weekly, and monthly report trends.
- Add cleanest and worst-performing ward rankings with transparent definitions.
- Add a recent activity feed and data freshness timestamp.
- Keep analytics responsive and accessible on mobile.

#### 7. Gujarat-Focused Platform Polish

- Keep Gujarati as the default language and English as the secondary language.
- Add Hindi only if user research shows a need for a third language.
- Ensure Gujarati covers report forms, validation, map labels, analytics, notifications, and errors.
- Add installable PWA support with an offline shell and cached bundled map/report data.
- Add an offline submission queue that retries when connectivity returns.
- Add privacy messaging for location and photo permissions.
- Add keyboard navigation, focus management, reduced-motion support, and touch-friendly controls.

### NammaKasa Comparison Findings (reviewed July 2026)

The live [NammaKasa](https://nammakasa.vercel.app/) experience was reviewed against the current AmdavadSafai application. AmdavadSafai already covers the map/list switcher, severity and status filters, Gujarati interface, ward-level summary cards, and a statistics panel. The remaining gaps below are features or levels of completeness visible in NammaKasa but not yet available in AmdavadSafai.

- **QR-based mobile reporting:** NammaKasa displays a QR code that opens a phone-first reporting journey. AmdavadSafai currently exposes reporting only within the web app.
- **Live camera capture during reporting:** NammaKasa explicitly asks users to report with a live photo. AmdavadSafai's current form has no camera or image-upload control.
- **Automatic on-device location flow:** NammaKasa surfaces location availability as part of reporting. AmdavadSafai relies on a ward selection and manual/clicked map coordinates rather than permission-based GPS capture with accuracy feedback.
- **Automatic civic-boundary matching:** a submitted location should resolve to the correct Ahmedabad ward, zone, municipal body, and responsible representatives without asking the resident to choose a ward first.
- **Full elected-representative accountability:** NammaKasa ties every dump to a ward, MLA, and MP. AmdavadSafai currently shows a corporator name on ward cards, but does not provide a complete, verified representative hierarchy or contact/escalation information.
- **Comprehensive ward coverage and live data:** NammaKasa lists the city-wide ward dataset and thousands of active reports. AmdavadSafai currently presents a limited seeded Ahmedabad dataset, so it needs complete ward boundaries, verified civic data, and a persistent backend-fed report stream.
- **Richer ward drill-down:** NammaKasa expands a ward into a long, report-by-report feed with location text, age, severity, status, and report volume. AmdavadSafai's expanded ward cards show only a small local sample and need pagination or infinite loading, report detail views, media, and complete history.
- **Accurate report lifecycle and freshness:** real report identifiers, creation and resolution timestamps, activity history, and an explicit data-freshness indicator are needed so the map and rankings reflect current civic conditions.
- **Shareable civic evidence:** public report and ward URLs, native sharing, copy links, and social previews are needed so residents can circulate a specific unresolved issue or ward scorecard.

### Suggested Delivery Order

1. Enhanced report submission and Gujarati validation states.
2. Backend report IDs, ward lookup, daily limits, and photo storage.
3. Map clustering, heatmap, legend, and near-me mode.
4. Shareable report/ward pages and community verification.
5. Ward accountability profiles and advanced analytics.
6. PWA, offline queue, privacy, and accessibility hardening.

| Feature | Description | Open Source Implementation / Tools |
|---------|-------------|------------------------------------|
| 📝 Report Submission | Allow citizens to submit new garbage reports with photo upload | Integration with Open Source backend API / Serverless functions |
| 🗄️ Backend API | Connect to a real database (Supabase / Postgres / Firebase) | Supabase/PostgreSQL (open-source database) |
| 🔔 Push Notifications | Notify users when reports in their ward are resolved | Web Push Protocol standard library |
| 📊 Advanced Analytics | Ward comparison charts, trend graphs, heatmaps | Chart.js / Recharts (MIT licensed visualization libs) |
| 🗺️ Ward Boundaries | Show ward boundary polygons on the map | Leaflet GeoJSON layer using open-source mapping data customized via **QGIS** or **geojson.io** |
| 👤 User Authentication | Login system for tracking personal reports | GoTrue (Supabase open-source auth client) |
| 📱 PWA Support | Installable as a mobile app with offline support | Workbox (open-source service worker generator) |
| 🌐 Hindi Support | Add Hindi as a third language option | Custom i18n translation JSON |

---

## License

MIT License — feel free to use, modify, and distribute.

---

<p align="center">
  <strong>🧹 અમદાવાદ સફાઈ — સ્વચ્છ અમદાવાદ, સુંદર અમદાવાદ</strong><br/>
  <em>Clean Ahmedabad, Beautiful Ahmedabad</em>
</p>
