# PrintVault

A clean, lightweight web application for browsing and previewing STL files from Google Drive. Built with React, Firebase, and Three.js.

## Features

- 🔐 **Firebase Authentication** - Secure Google OAuth with automatic token refresh
- 📁 **Drive Integration** - Browse your structured Google Drive folders
- 🎨 **Visual Navigation** - Card-based UI with folder preview images
- 🔍 **Smart Thumbnails** - Recursive image search with intelligent fallback
- 📐 **3D STL Viewer** - Interactive 3D preview with orbit controls
- 🔗 **Shareable Links** - Create public or temporary private preview links
- 🔒 **Secure Sharing** - JWT-based temporary links with configurable expiry
- 👁️ **Public Previews** - View shared files without login
- ⚡ **Lightweight** - Minimal dependencies, fast loading
- 🎯 **Clean UI** - Modern design with TailwindCSS

## Prerequisites

- Node.js 18+
- npm or yarn
- Google Cloud Project with Drive API enabled
- Firebase project

## Setup Instructions

### 1. Clone and Install

```bash
npm install
```

### 2. Firebase Configuration

1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Google Authentication in Firebase Auth
3. Register your app and get configuration values
4. Create a `.env` file based on `.env.example`:

```bash
cp .env.example .env
```

5. Fill in your Firebase credentials in `.env`:

```env
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

### 3. Google Cloud Configuration

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Enable Google Drive API
3. Configure OAuth consent screen
4. Add authorized redirect URIs for Firebase Auth
5. Add Drive API scope: `https://www.googleapis.com/auth/drive.readonly`

### 4. (Optional) Firebase Cloud Functions

If you want to use the Drive API proxy to avoid CORS issues:

1. Install Firebase CLI:
```bash
npm install -g firebase-tools
```

2. Login to Firebase:
```bash
firebase login
```

3. Initialize Firebase in the project:
```bash
firebase init
```
   - Select Functions and Hosting
   - Choose your Firebase project
   - Use existing functions in `firebase/functions`

4. Deploy the function:
```bash
cd firebase/functions
npm install
cd ../..
firebase deploy --only functions
```

5. Add the function URL to `.env`:
```env
VITE_DRIVE_PROXY_URL=https://us-central1-your-project.cloudfunctions.net/driveProxy
```

### 5. Run Development Server

```bash
npm run dev
```

The app will open at `http://localhost:3000`

## Google Drive Structure

The app is flexible and works with any folder structure. On first login, you'll select your root folder from Google Drive.

Example structure:
```
/Your Root Folder
    /Category 1
        /Subcategory A
    /Category 2
        /Subcategory B
```

For STL collections, a common structure is:
```
/CreatorName
    /Specific release
        model.stl
CreatorName.jpg (optional preview image)
```

## How It Works

### Authentication Flow

1. User clicks "Sign in with Google"
2. Firebase Auth handles OAuth with Drive scope
3. Access token is stored and automatically refreshed
4. Token is used for all Drive API requests

### Folder Navigation

1. App prompts you to select a root folder on first login
2. User navigates through folders via visual cards
3. Breadcrumbs track the path and allow quick navigation
4. Each folder loads its contents dynamically
5. Root folder selection is saved and can be changed in settings

### Preview Images

The app uses smart fallback logic for folder previews:

1. First, looks for `CreatorName.jpg` in parent folder
2. If not found, recursively searches inside folder for first image
3. If no image exists, displays a clean placeholder
4. Results are cached to avoid repeated searches

### STL Viewing

1. User clicks an STL file card
2. File is downloaded as ArrayBuffer from Drive API
3. Three.js STLLoader parses the geometry
4. Model is displayed with orbit controls for interaction

### Sharing Feature

**Public Links (Permanent):**
1. User clicks share button on file/folder
2. App updates Drive permissions to "anyone with link"
3. Returns direct Drive URL
4. Anyone can access without login

**Private Links (Temporary):**
1. User selects expiry time (15min/1hr/24hr)
2. Backend generates JWT token with file info and expiry
3. Returns preview URL: `https://yourapp.com/preview/TOKEN`
4. When accessed, backend validates token and streams file
5. Token expires after set time

See `SHARING_SETUP.md` for detailed setup instructions.

## Project Structure

```
src/
├── api/
│   ├── firebase.js          # Firebase Auth setup
│   ├── googleDrive.js       # Drive API client
│   ├── driveProxy.js        # Optional proxy client
│   └── driveShare.js        # Sharing API client
├── components/
│   ├── Breadcrumbs.jsx      # Path navigation
│   ├── FolderGrid.jsx       # Grid layout
│   ├── FileCard.jsx         # File/folder cards
│   ├── ImageThumbnail.jsx   # Image loading
│   ├── STLViewer.jsx        # 3D viewer
│   └── ShareModal.jsx       # Share dialog
├── hooks/
│   ├── useDriveNavigation.js
│   ├── useFetchThumbnail.js
│   └── useFindFolderPreviewImage.js
├── pages/
│   ├── DriveBrowser.jsx     # Main page
│   └── PreviewPage.jsx      # Public preview page
├── utils/
│   ├── cache.js             # In-memory caching
│   ├── mimeUtils.js         # File type helpers
│   └── pathUtils.js         # Path formatting
├── App.jsx                  # App entry with routing
└── main.jsx                 # React entry

firebase/
└── functions/
    └── index.js             # Cloud Functions (proxy + sharing)
```

## Technologies

- **React 18** - UI framework
- **React Router 6** - Client-side routing
- **Vite** - Build tool
- **TailwindCSS** - Styling
- **Firebase Auth** - Authentication & token management
- **Firebase Functions** - Serverless backend for sharing
- **Google Drive API v3** - File access
- **Three.js** - 3D rendering

## Performance Optimizations

- **Lazy Loading** - Only loads current folder contents
- **In-Memory Caching** - Thumbnails and metadata cached
- **Loading Skeletons** - Visual feedback during loads
- **Object URL Management** - Proper cleanup to prevent memory leaks
- **Minimal Dependencies** - Fast bundle size

## Security Notes

- Access tokens stored in sessionStorage (cleared on logout)
- Firebase handles token refresh automatically
- Read-only Drive scope for safety
- Optional proxy function to avoid exposing tokens in browser
- JWT-based sharing with hard expiry enforcement
- Service account with minimal permissions for backend access

## Troubleshooting

### Root Folder Not Found
On first login, you'll be prompted to select your root folder. You can change this later via the Settings menu (hamburger icon in top right).

### CORS Errors
If you encounter CORS issues accessing Drive files:
1. Deploy the Firebase Cloud Function proxy
2. Add its URL to `.env` as `VITE_DRIVE_PROXY_URL`

### Authentication Issues
1. Verify Firebase configuration in `.env`
2. Check OAuth consent screen is configured
3. Ensure authorized redirect URIs are set correctly
4. Make sure Drive API is enabled in Google Cloud Console

### STL Viewer Not Loading
1. Check browser console for errors
2. Ensure file is a valid STL format
3. Try smaller files first (large models may take time)
4. Check WebGL is supported in your browser

### Sharing Issues
See `SHARING_SETUP.md` for comprehensive troubleshooting of sharing features.

## Documentation

- `GETTING_STARTED.md` - Quick setup guide
- `SHARING_SETUP.md` - Detailed sharing feature setup
- `SHARING_QUICKREF.md` - Quick reference for sharing features
- `ARCHITECTURE.md` - Technical architecture details
- `QUICKREF.md` - API and debugging reference

## Building for Production

```bash
npm run build
```

Deploy to Firebase Hosting:
```bash
firebase deploy --only hosting
```

## License

MIT

## Contributing

Feel free to submit issues and enhancement requests!

