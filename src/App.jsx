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
          <svg className="w-20 h-20 mx-auto mb-4 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" />
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

