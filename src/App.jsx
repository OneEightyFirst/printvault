import { useState, useEffect } from 'react';
import { DriveBrowser } from './pages/DriveBrowser';
import { signInWithGoogle, signOut, onAuthStateChange, refreshAccessToken } from './api/firebase';
import { setTokenExpiredCallback } from './api/googleDrive';

function App() {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Set up automatic token refresh callback
    setTokenExpiredCallback(async () => {
      console.log('Token expired, getting new one...');
      try {
        const newToken = await refreshAccessToken();
        setAccessToken(newToken);
        return newToken;
      } catch (error) {
        console.error('Failed to refresh token:', error);
        // If refresh fails, clear everything and require re-login
        setAccessToken(null);
        setUser(null);
        setError('Session expired. Please sign in again.');
        return null;
      }
    });

    const unsubscribe = onAuthStateChange(async (currentUser) => {
      setUser(currentUser);
      
      if (currentUser) {
        try {
          // For Drive API, we need to use the OAuth access token from sign-in
          const storedToken = sessionStorage.getItem('driveAccessToken');
          if (storedToken) {
            setAccessToken(storedToken);
          }
        } catch (err) {
          console.error('Error getting token:', err);
          setError('Failed to get access token');
        }
      } else {
        setAccessToken(null);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleSignIn = async () => {
    setError(null);
    try {
      const result = await signInWithGoogle();
      
      // Set the access token from the sign-in result
      if (result.accessToken) {
        setAccessToken(result.accessToken);
      } else {
        setError('Failed to obtain Drive access token');
      }
    } catch (err) {
      console.error('Sign in error:', err);
      setError('Failed to sign in: ' + err.message);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      sessionStorage.removeItem('driveAccessToken');
      setAccessToken(null);
    } catch (err) {
      console.error('Sign out error:', err);
      setError('Failed to sign out: ' + err.message);
    }
  };

  // Login component for protected routes
  const LoginPage = () => (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <svg className="w-20 h-20 mx-auto mb-4 text-blue-600 dark:text-blue-400" viewBox="0 0 353.91 351.71" fill="currentColor">
            <g>
              <circle cx="66.56" cy="127.07" r="6.37"/>
              <circle cx="57.35" cy="173.37" r="6.37"/>
              <circle cx="178.35" cy="294.37" r="6.37"/>
              <circle cx="224.66" cy="285.16" r="6.37"/>
              <circle cx="92.79" cy="258.93" r="6.37"/>
              <circle cx="66.56" cy="219.68" r="6.37"/>
              <circle cx="132.04" cy="285.16" r="6.37"/>
            </g>
            <path d="M177.87,143.45c-2.49,2.49-2.49,6.52,0,9.01l23.59,23.59c2.49,2.49,6.52,2.49,9.01,0l7.29-7.29,52.95,52.95c-4.58,8.49-3.39,19.3,3.77,26.47,8.74,8.74,22.96,8.74,31.7,0,8.74-8.74,8.74-22.96,0-31.7-7.17-7.17-17.98-8.35-26.47-3.77l-41.5-41.5c20.78,3.45,42.85-2.74,58.85-18.75l15.1-15.1,7.29,7.29c2.49,2.49,6.52,2.49,9.01,0l23.59-23.59c2.49-2.49,2.49-6.52,0-9.01l-23.59-23.59c-2.49-2.49-6.52-2.49-9.01,0l-23.59,23.59c-2.49,2.49-2.49,6.52,0,9.01l7.29,7.29-15.1,15.1c-15.57,15.57-38.23,19.75-57.66,12.66l3.65-3.65c2.49-2.49,2.49-6.52,0-9.01l-23.59-23.59c-2.49-2.49-6.52-2.49-9.01,0l-3.65,3.65c-7.1-19.43-2.91-42.09,12.66-57.66l15.1-15.1,7.29,7.29c2.49,2.49,6.52,2.49,9.01,0l23.59-23.59c2.49-2.49,2.49-6.52,0-9.01L241.86,1.87c-2.49-2.49-6.52-2.49-9.01,0l-23.59,23.59c-2.49,2.49-2.49,6.52,0,9.01l7.29,7.29-15.1,15.1c-15.98,15.98-22.22,38.03-18.81,58.79l-45.57-45.57c4.58-8.49,3.39-19.3-3.77-26.47-8.74-8.74-22.97-8.74-31.7,0-8.74,8.74-8.74,22.96,0,31.7,7.17,7.17,17.98,8.35,26.47,3.77l57.09,57.09-7.29,7.29ZM309.38,116.56l14.58-14.58,14.58,14.58-14.58,14.58-14.58-14.58ZM222.77,29.95l14.58-14.58,14.58,14.58-14.58,14.58-14.58-14.58ZM191.38,147.95l14.58-14.58,14.58,14.58-14.58,14.58-14.58-14.58ZM297.18,225.48c3.77,3.77,3.78,9.92,0,13.69-3.78,3.78-9.92,3.77-13.69,0-3.77-3.77-3.78-9.92,0-13.69,3.78-3.78,9.92-3.77,13.69,0ZM110.61,66.29c-3.78-3.78-3.78-9.92,0-13.69s9.92-3.77,13.69,0,3.78,9.92,0,13.69-9.92,3.77-13.69,0Z"/>
            <path d="M14.1,230.69l10.2-.02c7.27-.02,13.92,4.12,17.11,10.64,14.86,29.89,39.08,54.12,68.99,68.99,6.52,3.21,10.65,9.85,10.64,17.11v10.2c0,2.79,1.82,5.27,4.49,6.09,34.41,10.69,71.26,10.68,105.68,0,2.67-.82,4.49-3.3,4.49-6.09v-10.2c-.02-7.27,4.12-13.92,10.64-17.11,14.98-7.45,28.53-17.25,40.2-28.94.03-.03.08-.06.11-.09,2.49-2.49,2.49-6.52,0-9.01L79.45,65.05c-2.49-2.49-6.52-2.49-9.01,0-.04.04-.07.09-.11.13-11.69,11.67-21.49,25.22-28.94,40.21-3.2,6.51-9.83,10.62-17.09,10.64h-10.2c-2.79,0-5.27,1.82-6.09,4.49-10.69,34.41-10.68,71.26,0,105.68.82,2.67,3.3,4.49,6.09,4.49ZM222.92,327.43h0v5.39c-29.15,8.19-59.99,8.18-89.15.02v-5.39c-.01-2.78-.36-5.55-1.09-8.22,29.73,9.23,61.58,9.23,91.3-.02-.7,2.67-1.06,5.44-1.07,8.22ZM236.88,240.49c-35.02,30.59-88.21,29.29-121.58-4.08-33.32-33.39-34.62-86.53-4.07-121.57l31.47,31.47c-1.82,2.41-3.42,4.98-4.73,7.75h-17.03c-10.55,0-19.1,8.55-19.1,19.1s8.55,19.1,19.1,19.1h17.03c4.39,9.31,11.87,16.79,21.18,21.18v17.03c.01,10.54,8.56,19.09,19.1,19.1,10.55,0,19.1-8.55,19.1-19.1v-17.03c2.76-1.31,5.34-2.91,7.74-4.73l31.78,31.78ZM188.87,203.17c-2.54.9-4.25,3.31-4.25,6v21.3c0,3.52-2.85,6.37-6.37,6.37-3.51.01-6.37-2.85-6.37-6.37h0s0-21.3,0-21.3c0-2.7-1.7-5.1-4.25-6-9.05-3.24-16.17-10.35-19.41-19.41-.9-2.54-3.31-4.25-6-4.24h-21.3c-3.52,0-6.37-2.85-6.37-6.37s2.85-6.37,6.37-6.37h21.3c2.7,0,5.1-1.7,6-4.24.91-2.53,2.14-4.89,3.62-7.08l13.75,13.75c-1.26,4.63-.14,9.77,3.5,13.41,3.64,3.64,8.78,4.76,13.41,3.5l13.42,13.42c-2.18,1.47-4.54,2.71-7.07,3.62ZM75.1,78.71l27.04,27.04c-35.57,40.01-34.19,101.32,4.15,139.67,38.38,38.29,99.62,39.66,139.66,4.15l27.05,27.05c-54.97,50.47-140.45,49.09-193.73-4.19-53.2-53.31-54.58-138.72-4.18-193.73ZM18.88,128.8h0s5.39,0,5.39,0c2.78-.01,5.55-.36,8.22-1.09-9.23,29.73-9.23,61.58.02,91.3-2.69-.72-5.44-1.08-8.22-1.07h-5.39c-8.19-29.15-8.18-59.99-.02-89.15Z"/>
          </svg>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">PrintVault</h1>
          <p className="text-gray-600 dark:text-gray-400">Browse and preview STL files from your Google Drive</p>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
          </div>
        )}

        <button
          onClick={handleSignIn}
          className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-white dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors font-medium text-gray-700 dark:text-gray-200"
        >
          <svg className="w-6 h-6" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Sign in with Google
        </button>

        <p className="mt-6 text-xs text-gray-500 dark:text-gray-400 text-center">
          This app requires access to your Google Drive to browse and preview STL files.
        </p>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    user && accessToken ? (
      <DriveBrowser accessToken={accessToken} user={user} onSignOut={handleSignOut} />
    ) : (
      <LoginPage />
    )
  );
}

export default App;

