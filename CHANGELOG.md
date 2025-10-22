# Changelog

# Changelog

## [2025-10-22]

### Added
- **Collapsible sidebar** with global state:
  - Layout split into server `app/layout.tsx` (metadata-safe) and client `app/layout-shell.tsx` (UI state).
  - `TopNav` gets a sidebar toggle button and accepts `collapsed` + `onToggleSidebar` props.
  - `Sidebar` accepts a `collapsed` prop and animates width (`w-64 → w-16`).
- **Pinned Upload link** rendered at the **bottom** of the sidebar, separated by a divider.
- **Tooltip labels** for sidebar items when collapsed.
- **Recent Evaluations**: table can be **collapsed/expanded** (single control). When collapsed, **Audio** and **APCO/NENA QA** expand to fill space.

### Changed
- **Sidebar branding**:
  - Hide full logo when collapsed (optional tiny mark supported).
  - Kept larger link typography when expanded; tightened when collapsed.
- **Top navigation** now shifts based on sidebar width (`left-64` / `left-16`).
- **Evaluations layout**:
  - Left column: top = Recent Evaluations table; bottom = Audio (left) + APCO/NENA QA (center).
  - Right column: **Filter** moved to a full-height, top-aligned column.
- **QA action buttons** color logic:
  - **Yes** = primary (blue), **No** = red, **Refused** = amber, **N/A** = violet.

### Fixed
- **Sticky table header**: header background is solid (`bg-card`) and truly sticky (`sticky top-0 z-10`)—no transparency while scrolling.
- **“Black bar” at page bottom** caused by semi-transparent layers over the page background:
  - Replaced mixed `/30` `/50` alpha backgrounds with solid `bg-card` / `bg-background` in scrollable containers and sticky headers.
- **Accessibility**:
  - Added `aria-label`s to critical icon buttons (play/pause, volume, sidebar toggle).

### Removed
- **Duplicate “Generate AI Coaching”** button at the bottom of the Filter panel.

### Optional niceties (implemented or ready to drop in)
- **Stable waveform** bars via `useMemo` to avoid re-randomizing on re-render.
- **Zebra striping** for Recent Evaluations rows for readability.
- **Responsive bounds** on side panels (min/max widths) to prevent layout collapse on small screens.

### Developer notes
- Keep `app/layout.tsx` as a **Server Component** (no `"use client"`); export `metadata` there.
- Interactive shell lives in `app/layout-shell.tsx` (client).
- Component props:
  - `Sidebar`: `collapsed: boolean`
  - `TopNav`: `collapsed?: boolean`, `onToggleSidebar: () => void`
- Main content margin-left transitions between `ml-64` and `ml-16` to match sidebar width.

---

# [2025.10.21] - 2025-10-21

### Changed
- **Interactions / Upload / interaction-Drawer/ Overview/ Analystics/ Directory**
  - Updated UI text to display **Operator** instead of **Dispatcher** in all relevant places.
- **Sidebar**
  - Renamed “Dispatcher Coaching” to just **Coaching**.
---

## [2025.10.19] - 2025-10-19

### Changed
- **Interaction Drawer**
  - Major UI/UX redesign for a cleaner and more modern feel.
  - Replaced logo with direct usage of `NiCE_SMILE.svg` logo in the header.
  - Improved layout for better readability and usability.

### Added
- **APCO/NENA QA Evaluation**
  - Integrated QA Evaluation tab where users can manually override AI-evaluated results.
  - Each QA question now displays confidence levels, evidence pulled directly from the transcript, and progress bars for compliance.
  - Provides clear compliance percentage based on APCO/NENA “All Call Interrogation” standards.
  - We can remove the % since I think Patrick said he doesnt like the % but it does show the AI models confidence so we can talk about it.

---

## [2025.10.18] - 2025-10-18

### Changed
- **Grading → Coaching**
  - Renamed `grading/` folder to `coaching/`.
  - Rebuilt `page.tsx` to serve as the new **Dispatcher Coaching** page.
  - Updated `sidebar.tsx` to show “Dispatcher Coaching” with `href="/coaching"`.

### Added
- **Coaching Page**
  - Created `loading.tsx` for coaching route to handle suspense/loading state.
  - Added sample data in sample-data.ts for the coaching page to support development and testing.

---

## [2025.10.06] - 2025-10-17

### Added
- **Employee Directory & Profile Pages**
  - Implemented employee directory and individual profile views.
  - Enhanced UI with dark mode badge contrast improvements.

- **Uploads Page**
  - New page with full backend integration for file uploads.
  - Backend routes and database connectivity established.

- **Analytics & Interactions**
  - Live data fetching implemented for analytics and interactions.
  - Charts now support custom date ranges and styling improvements.

### Changed
- **API Updates**
  - Updated endpoint for creating calls.
  - Interactions and analytics pages now use backend APIs.
  - Switched to using `API_BASE` environment variable.

- **Routing and Links**
  - Local links updated to be Render-compatible.
  - Removed trailing slash from Vercel app URL.

- **UI Enhancements**
  - Improved color contrast for badges in dark mode.
  - Unified trend and badge colors for consistency.
  - Dropdown menu behavior updated in `TopNav`.

### Fixed
- Re-added missing deployment dependencies.
- Restored required files from `dreux_work_in_progress` branch.

### Removed
- `.env` removed from version control.

### Misc
- Initial project commit and structure setup.
- Added dependencies for Render deployment (`dnspython`, etc.).


