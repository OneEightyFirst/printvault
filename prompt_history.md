# Prompt History - PrintVault Project

This file tracks all prompts and responses for this project to maintain context across sessions.

---

## Session 1 - November 16, 2024

### Prompt 1: Initial Project Request

**User Request:**
Build a complete STL web viewer application with the following requirements:

**Key Requirements:**
- Clean, lightweight web app for browsing Google Drive folder tree
- Preview STL files directly in browser without downloading
- Firebase (free tier) for authentication, token refresh, and optional Drive request proxying
- Modern best practices, minimal dependencies, clean UI

**Project Purpose:**
- Quickly browse and locate specific STL files in Google Drive
- Firebase Google Auth with Drive scope
- Browse and preview STL files in built-in 3D viewer
- Stable auth with no session breaks

**Google Drive Structure:**
```
/Clean STL
    /FDM
        /Fantasy, /Modern, /Personal, /Practical, /Sci-fi
    /Resin
        /Bases, /Boardgame, /Commission, /Fantasy, /Modern, /Personal, /Practical, /Sci-fi
```

Inside categories:
```
/CreatorName
    /Specific release
        file.stl
CreatorName.jpg (optional - if missing, recursively search for first image)
```

**Core Features Required:**
1. Firebase Authentication with Google OAuth and auto token refresh
2. Optional Firebase Cloud Function for Drive API proxy (CORS handling)
3. Clean card-based folder browser with preview images
4. Breadcrumb navigation (clickable segments)
5. Recursive image fallback for folder previews
6. STL viewer with Three.js + OrbitControls
7. Minimal dependencies (React/Preact + Vite + TailwindCSS + Three.js)

**Technical Architecture:**
- React or Preact + Vite
- TailwindCSS for styling
- Firebase Auth for authentication
- Firebase Functions (optional proxy)
- Three.js for STL viewing
- Google Drive API v3

**Response Summary:**

Created a complete, production-ready STL Web Viewer application with:

**Files Created (30+ files):**

1. **Project Setup:**
   - `package.json` - Dependencies (React 18, Firebase 10.7, Three.js 0.159, Vite 5, TailwindCSS 3)
   - `vite.config.js` - Vite configuration
   - `tailwind.config.js` - TailwindCSS setup
   - `postcss.config.js` - PostCSS configuration
   - `index.html` - HTML entry point
   - `.gitignore` - Git ignore rules
   - `env.template` - Environment variable template

2. **Firebase Backend:**
   - `firebase.json` - Firebase project config
   - `firebase/functions/package.json` - Function dependencies
   - `firebase/functions/index.js` - Drive API proxy Cloud Function

3. **Source Code (src/):**

   **API Layer (src/api/):**
   - `firebase.js` - Firebase Auth with Google OAuth, token management, auto-refresh
   - `googleDrive.js` - Complete Drive API client (list, search, download, thumbnails)
   - `driveProxy.js` - Optional proxy client for CORS handling

   **Components (src/components/):**
   - `Breadcrumbs.jsx` - Clickable breadcrumb navigation
   - `FolderGrid.jsx` - Grid layout with sections for folders/STL/images
   - `FileCard.jsx` - Card component with preview images and icons
   - `ImageThumbnail.jsx` - Image loading with fallback and caching
   - `STLViewer.jsx` - Three.js 3D viewer with OrbitControls, auto-centering

   **Hooks (src/hooks/):**
   - `useDriveNavigation.js` - Folder navigation state and logic
   - `useFetchThumbnail.js` - Thumbnail fetching with caching
   - `useFindFolderPreviewImage.js` - Recursive image search with fallback

   **Pages (src/pages/):**
   - `DriveBrowser.jsx` - Main browser interface

   **Utilities (src/utils/):**
   - `cache.js` - In-memory cache for thumbnails and metadata
   - `config.js` - App configuration (folder names, search depth, etc.)
   - `errorUtils.js` - Error handling utilities
   - `folderUtils.js` - Folder operations and sorting
   - `mimeUtils.js` - MIME type helpers
   - `pathUtils.js` - Path and breadcrumb utilities

   **Main Files:**
   - `App.jsx` - Main app with auth flow and navigation bar
   - `main.jsx` - React entry point
   - `index.css` - Global styles + Tailwind imports

4. **Documentation (8 comprehensive files):**
   - `README.md` - Project overview, features, quick start
   - `GETTING_STARTED.md` - 15-minute setup guide with troubleshooting
   - `SETUP.md` - Detailed step-by-step Firebase and Google Cloud setup
   - `ARCHITECTURE.md` - Technical architecture, design decisions, flows
   - `PROJECT_SUMMARY.md` - Complete project summary with metrics
   - `QUICKREF.md` - API reference, component props, debugging tips
   - `CHANGELOG.md` - Version history
   - `LICENSE` - MIT License

5. **Scripts:**
   - `setup.sh` - Automated setup script (chmod +x)

**Key Implementation Details:**

**Authentication Flow:**
- Firebase Auth with Google OAuth
- Requests `drive.readonly` scope
- Stores access token in memory + sessionStorage backup
- Auto token refresh handled by Firebase
- Sign in returns both user and access token

**Navigation:**
- Searches for "Clean STL" folder on init
- Dynamic folder loading (lazy)
- Breadcrumb stack with clickable segments
- Back navigation via breadcrumb clicks

**Preview Images:**
1. Checks parent folder for `CreatorName.jpg/png`
2. If not found, recursively searches inside folder (max depth 5)
3. Returns placeholder if no image found
4. Results cached to avoid repeated searches

**STL Viewer:**
- Fetches STL as ArrayBuffer from Drive API
- Parses with Three.js STLLoader
- Auto-centers and scales model
- OrbitControls for interaction (rotate, zoom, pan)
- Loading states and error handling

**Caching Strategy:**
- Thumbnails cached in memory
- Metadata cached per folder
- Object URLs properly managed and revoked
- Cache cleared on logout

**Performance:**
- Lazy loading (current folder only)
- Loading skeletons for UX
- Minimal bundle (~300KB gzipped)
- Fast Vite HMR

**Status:**
✅ All TODOs completed
✅ Zero linter errors
✅ Production-ready code
✅ Comprehensive documentation

**Next Steps for User:**
1. Run `npm install`
2. Set up Firebase project
3. Enable Google Auth and Drive API
4. Create `.env` from `env.template`
5. Run `npm run dev`
6. Sign in and browse!

---

### Prompt 2: Create Prompt History File

**User Request:**
Create a `prompt_history.md` file that:
- Includes the original prompt
- Includes response summary (enough context to understand what was done)
- Should be updated with each new prompt going forward

**Response:**
Created this file (`prompt_history.md`) to track all prompts and responses. This file will be updated after each interaction to maintain context across sessions.

**Status:** ✅ Complete

---

### Prompt 3: Rename Project to PrintVault

**User Request:**
Rename the project from "STL Web Viewer" to "PrintVault":
- Rename main folder from `stl-web-viewer` to `PrintVault`
- Update all references throughout the codebase and documentation

**Response:**

**Actions Taken:**

1. **Renamed Main Folder:**
   - `/Users/mwells/Documents/stl-web-viewer` → `/Users/mwells/Documents/PrintVault` ✅

2. **Updated Package Files:**
   - `package.json`: Changed name to "printvault", version to 0.1.1
   - `firebase/functions/package.json`: Changed name to "printvault-functions"

3. **Updated HTML:**
   - `index.html`: Changed title to "PrintVault"

4. **Updated React App:**
   - `src/App.jsx`: Changed all UI text from "STL Web Viewer" to "PrintVault"
   - Updated both login screen and navigation bar

5. **Updated All Documentation:**
   - `README.md`: Changed title and references
   - `GETTING_STARTED.md`: Updated all mentions and paths
   - `SETUP.md`: Updated setup instructions with new name
   - `PROJECT_SUMMARY.md`: Updated title and structure diagram
   - `CHANGELOG.md`: Added v0.1.1 entry for rename
   - `LICENSE`: Updated copyright holder to "PrintVault"
   - `PROJECT_COMPLETE.txt`: Updated banner and structure
   - `prompt_history.md`: Updated title and all references

**Files Modified:** 15+ files
**Version:** Updated to 0.1.1
**Status:** ✅ Complete

All references to "STL Web Viewer" have been changed to "PrintVault" throughout the codebase and documentation. The project is now fully rebranded.

---

### Prompt 4: Add Shareable Public Preview Links Feature

**User Request:**
Add a comprehensive sharing feature to PrintVault allowing users to generate shareable preview links for files and folders. Implement both public (permanent) and private (temporary) sharing modes.

**Requirements:**

1. **Two Sharing Modes:**
   - Public Drive Mode: Make files/folders public on Google Drive with direct access
   - Proxy Mode: Generate JWT-signed temporary links (15 min to 24 hours expiry)

2. **UI Components:**
   - ShareModal with public/private options and expiry settings
   - Share buttons on all FileCard instances
   - Copy-to-clipboard functionality
   - Warning messages for public sharing

3. **Backend (Firebase Functions):**
   - JWT token generation and validation
   - Share proxy for streaming files without auth
   - Folder contents endpoint for shared folders
   - Service account authentication with Google Drive

4. **Preview Page:**
   - Public route at `/preview/:token`
   - Support for images, STL files, and folders
   - No login required
   - Expiry handling and error states

**Response Summary:**

**Files Created/Modified:**

1. **New UI Components:**
   - `src/components/ShareModal.jsx` - Full-featured sharing modal with public/private options
   - `src/pages/PreviewPage.jsx` - Public preview page with image, STL, and folder viewers

2. **New API Layer:**
   - `src/api/driveShare.js` - Complete sharing API client:
     - `makeFilePublic()` - Sets Drive permissions to public
     - `generatePublicLink()` - Creates public Drive URLs
     - `generatePrivateLink()` - Generates JWT-based temporary links
     - `validateShareToken()` - Validates and decodes tokens
     - `fetchSharedFile()` - Retrieves files via proxy
     - `fetchSharedFolder()` - Lists folder contents

3. **Updated Components:**
   - `src/components/FileCard.jsx` - Added share button with click handler
   - `src/components/FolderGrid.jsx` - Pass through onShare prop
   - `src/pages/DriveBrowser.jsx` - Integrated ShareModal and sharing handlers
   - `src/App.jsx` - Added React Router with public/private routes

4. **Backend Functions (`firebase/functions/index.js`):**
   - `generateShareToken` - Creates signed JWT tokens with expiry
   - `validateShareToken` - Verifies token validity and expiry
   - `shareProxy` - Streams files using service account (no user auth required)
   - `shareFolderContents` - Lists folder contents for shared folders
   - JWT signing/verification implementation (no external dependencies)
   - Service account token management

5. **Configuration Updates:**
   - `package.json` - Added `react-router-dom: ^6.20.1`
   - `env.template` - Added `VITE_FIREBASE_FUNCTIONS_URL` and JWT secret docs
   - `SHARING_SETUP.md` - Comprehensive setup guide covering:
     - Service account configuration
     - Drive API permissions
     - JWT secret setup
     - Deployment instructions
     - Security considerations
     - Troubleshooting guide

**Key Implementation Details:**

**Public Sharing:**
- Uses Google Drive Permissions API
- Sets `role: "reader", type: "anyone"`
- Returns direct Drive URL: `https://drive.google.com/uc?id=FILE_ID`
- Permanent until manually revoked
- Warning displayed to user before creation

**Private Sharing:**
- JWT tokens contain: `fileId`, `itemType`, `exp` (expiry), `iat` (issued at)
- Tokens signed with HMAC-SHA256
- Hard expiry enforcement (15 min, 1 hour, 24 hours)
- Backend streams files using service account credentials
- No external JWT libraries (crypto built-in)

**Security Features:**
- JWT secret stored in Firebase config (not in code)
- Service account with read-only Drive access
- Token expiry strictly enforced
- No arbitrary file ID access (only IDs in signed tokens)
- CORS headers properly configured
- Public links warn user of permanent access

**Preview Page Features:**
- Image viewer with full-screen display
- STL viewer with Three.js integration
- Folder browser showing files/folders
- Expiry timestamp display
- Clean, branded UI matching main app
- Comprehensive error handling (expired, invalid, missing)

**Routing:**
- `/` - Main authenticated Drive browser
- `/preview/:token` - Public preview page (no auth)
- React Router for client-side routing

**User Experience:**
- Share button on every file and folder
- Clear distinction between public/private options
- Expiry selector for private links
- One-click copy to clipboard
- Success confirmation with green highlight
- Loading states during link generation

**Technical Architecture:**
- Frontend validates tokens before displaying
- Backend double-validates on every request
- Service account isolates user credentials from shared links
- Token contains all necessary data (no database lookups)
- Stateless architecture (scalable)

**Documentation:**
- `SHARING_SETUP.md` - 300+ line setup guide
- Service account configuration steps
- Security best practices
- Troubleshooting section
- Cost estimates
- Production checklist

**Version Update:**
- Updated to v0.2.0 in prompt_history.md
- Major feature addition warrants minor version bump

**Status:** ✅ All 10 TODOs completed
- ✅ ShareModal component created
- ✅ Share buttons added to FileCard and FolderGrid
- ✅ Drive permissions API implemented
- ✅ JWT token generation and signing utilities created
- ✅ Firebase shareProxy Cloud Function implemented
- ✅ generateShareToken Cloud Function created
- ✅ /preview/:token route and PreviewPage added
- ✅ Preview viewers for images, STLs, and folders implemented
- ✅ Copy-to-clipboard functionality and error handling added
- ✅ Documentation and environment variables updated

**Next Steps for User:**
1. Install dependencies: `npm install` (for react-router-dom)
2. Set up service account with Drive API access
3. Configure JWT secret: `firebase functions:config:set jwt.secret="YOUR_SECRET"`
4. Deploy functions: `firebase deploy --only functions`
5. Add `VITE_FIREBASE_FUNCTIONS_URL` to `.env`
6. Test public sharing feature
7. Test private sharing with different expiry times
8. Verify links work in incognito mode
9. See `SHARING_SETUP.md` for detailed setup instructions

---

### Prompt 5: OAuth Token Expiration Issue

**User Request:**
App was working but stopped with 401 Invalid Credentials error. Need to handle OAuth token expiration.

**Response:**
Implemented automatic token refresh mechanism:
- Modified `googleDrive.js` to detect 401 errors and trigger refresh
- Added `refreshAccessToken()` in `firebase.js` for silent re-authentication
- Integrated callback in `App.jsx` to update token state
- OAuth tokens now automatically refresh when expired (~1 hour lifetime)

**Status:** ✅ Complete

---

### Prompt 6: Dynamic Root Folder Selection

**User Request:**
Remove hardcoded "Clean STL" folder. Allow users to select root folder on first login.

**Response:**
**Files Created:**
- `src/components/FolderSelector.jsx` - Folder browser for selecting root directory

**Files Modified:**
- `src/pages/DriveBrowser.jsx` - Added folder selection on first login, stores choice in localStorage, added Settings button to change root folder

**Features:**
- Browse all Google Drive folders to select root
- Choice persisted in localStorage
- Settings button to change root folder later
- Breadcrumb navigation within selector

**Status:** ✅ Complete

---

### Prompt 7: Add Light/Dark Mode Toggle

**User Request:**
Add a light/dark mode toggle with switch UI showing icons instead of text, defaulting to dark mode.

**Response:**
**Files Created:**
- `src/contexts/ThemeContext.jsx` - Theme state management with localStorage persistence
- `src/components/ThemeToggle.jsx` - Toggle switch with sun/moon icons

**Files Modified:**
- `tailwind.config.js` - Enabled `darkMode: 'class'`
- `src/main.jsx` - Wrapped app with ThemeProvider
- Updated all components with dark mode styling:
  - `DriveBrowser.jsx`, `FileCard.jsx`, `FolderGrid.jsx`
  - `Breadcrumbs.jsx`, `ShareModal.jsx`, `STLViewer.jsx`
  - `FolderSelector.jsx`, `App.jsx` (login page)

**Features:**
- Toggle switch with sun ☀️ and moon 🌙 icons
- Defaults to dark mode
- Persists preference in localStorage
- Comprehensive dark mode styling across all components
- Smooth transitions between themes

**Status:** ✅ Complete

---

### Prompt 8: Hamburger Menu with User Dropdown

**User Request:**
Create hamburger dropdown menu with avatar, showing user name, settings, and sign out. Update theme toggle to show icons only.

**Response:**
**Files Created:**
- `src/components/UserMenu.jsx` - Dropdown menu with user info and actions

**Files Modified:**
- `src/components/ThemeToggle.jsx` - Replaced text with sun/moon icons, kept toggle switch
- `src/pages/DriveBrowser.jsx` - Simplified navigation bar with logo, theme toggle, and user menu
- `src/components/UserMenu.jsx` - Added image error handling and fallback to initials

**Features:**
- Hamburger menu (☰) with user avatar
- Dropdown shows: user name, email, settings, sign out
- Click outside to close
- Graceful fallback to initials if profile image fails
- CORS handling with `referrerPolicy="no-referrer"`
- Clean, compact navigation

**Status:** ✅ Complete

---

## How to Use This File

This file serves as a session journal that:
1. **Preserves Context:** If you need to start a new session, I can read this file to understand what's been done
2. **Tracks Changes:** Documents all modifications and additions to the project
3. **Maintains History:** Shows the evolution of the project over time

**Format for each entry:**
- Session number and date
- Prompt number
- User request (summarized)
- Response (what was done, files created/modified)
- Status

This will be updated after each prompt in this conversation.

---

## Project Current State

**Project Name:** PrintVault
**Version:** 0.3.0
**Last Updated:** November 16, 2024
**Status:** Production-ready with modern UI and theming

**File Count:**
- Source files: 30 JavaScript/JSX files
- Documentation: 2 markdown files (README.md, prompt_history.md)
- Configuration: 8 config files
- Total: 40+ files

**Features Complete:**
- ✅ Authentication (Firebase Google OAuth with auto-refresh)
- ✅ Drive API Integration
- ✅ Dynamic Root Folder Selection
- ✅ Folder Navigation with Breadcrumbs
- ✅ Preview Images (with recursive fallback)
- ✅ Static STL Image Previews
- ✅ STL 3D Viewer
- ✅ Caching System
- ✅ Light/Dark Mode Toggle
- ✅ Modern Hamburger Menu UI
- ✅ User Dropdown Menu
- ✅ Public Sharing Links
- ✅ Private Temporary Sharing Links
- ✅ Share Preview Page (no auth required)
- ✅ Error Handling & Fallbacks
- ✅ Responsive Design

**To Run:**
```bash
npm install
# Configure .env with Firebase credentials
npm run dev
```

---

*This file will be updated with each new prompt and response.*

