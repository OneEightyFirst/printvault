// Common issues and solutions

export const ERROR_MESSAGES = {
  NO_ACCESS_TOKEN: 'No access token available. Please sign in again.',
  FOLDER_NOT_FOUND: 'Could not find the selected folder. Please choose a different root folder in Settings.',
  DRIVE_API_ERROR: 'Failed to access Google Drive. Please check your permissions.',
  STL_LOAD_ERROR: 'Failed to load STL file. The file may be corrupted or too large.',
  AUTH_ERROR: 'Authentication failed. Please try signing in again.',
  NETWORK_ERROR: 'Network error. Please check your internet connection.',
  CORS_ERROR: 'CORS error. Consider using the Firebase proxy function.'
};

export const isNetworkError = (error) => {
  return error.message?.includes('fetch') || 
         error.message?.includes('network') ||
         error.message?.includes('Failed to fetch');
};

export const isCORSError = (error) => {
  return error.message?.includes('CORS') || 
         error.message?.includes('blocked by CORS policy');
};

export const isAuthError = (error) => {
  return error.message?.includes('auth') || 
         error.message?.includes('401') ||
         error.message?.includes('403');
};

export const getFriendlyErrorMessage = (error) => {
  if (isNetworkError(error)) {
    return ERROR_MESSAGES.NETWORK_ERROR;
  }
  
  if (isCORSError(error)) {
    return ERROR_MESSAGES.CORS_ERROR;
  }
  
  if (isAuthError(error)) {
    return ERROR_MESSAGES.AUTH_ERROR;
  }
  
  return error.message || 'An unexpected error occurred';
};

