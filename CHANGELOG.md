# Changelog

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

