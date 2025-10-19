# Changelog

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


