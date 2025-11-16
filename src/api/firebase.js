// Initialize Firebase
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup,
  signOut as firebaseSignOut 
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Configure Google Provider with Drive scope
const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('https://www.googleapis.com/auth/drive.readonly');

// Store for OAuth access token
let storedAccessToken = null;

/**
 * Sign in with Google and request Drive access
 * Returns both user and OAuth access token
 */
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    
    // Extract OAuth access token from credential
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (credential?.accessToken) {
      storedAccessToken = credential.accessToken;
      // Also store in sessionStorage as backup
      sessionStorage.setItem('driveAccessToken', credential.accessToken);
      
      // Store expiry time (OAuth tokens typically last 1 hour)
      const expiryTime = Date.now() + (55 * 60 * 1000); // 55 minutes to be safe
      sessionStorage.setItem('tokenExpiry', expiryTime.toString());
    }
    
    return {
      user: result.user,
      accessToken: credential?.accessToken
    };
  } catch (error) {
    console.error('Error signing in:', error);
    throw error;
  }
};

/**
 * Refresh the OAuth access token by re-authenticating silently
 * This is called automatically when a 401 error is detected
 */
export const refreshAccessToken = async () => {
  try {
    console.log('Attempting to refresh access token...');
    
    // Try to get a new token via popup
    const result = await signInWithPopup(auth, googleProvider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    
    if (credential?.accessToken) {
      storedAccessToken = credential.accessToken;
      sessionStorage.setItem('driveAccessToken', credential.accessToken);
      
      const expiryTime = Date.now() + (55 * 60 * 1000);
      sessionStorage.setItem('tokenExpiry', expiryTime.toString());
      
      console.log('Token refreshed successfully');
      return credential.accessToken;
    }
    
    throw new Error('Failed to get new access token');
  } catch (error) {
    console.error('Error refreshing token:', error);
    throw error;
  }
};

/**
 * Sign out the current user
 */
export const signOut = async () => {
  try {
    await firebaseSignOut(auth);
    storedAccessToken = null;
    sessionStorage.removeItem('driveAccessToken');
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
};

/**
 * Get the current user's Drive access token
 * This token is used for Google Drive API calls
 */
export const getDriveAccessToken = () => {
  // Try in-memory first
  if (storedAccessToken) {
    return storedAccessToken;
  }
  
  // Fallback to sessionStorage
  const token = sessionStorage.getItem('driveAccessToken');
  if (token) {
    storedAccessToken = token;
    return token;
  }
  
  throw new Error('No access token available. Please sign in again.');
};

/**
 * Get current authenticated user
 */
export const getCurrentUser = () => {
  return auth.currentUser;
};

/**
 * Listen to auth state changes
 */
export const onAuthStateChange = (callback) => {
  return auth.onAuthStateChanged(callback);
};

export { auth };

