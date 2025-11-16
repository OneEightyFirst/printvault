/**
 * Google Drive Sharing API
 * Handles creating public and private share links
 */

const DRIVE_API_BASE = 'https://www.googleapis.com/drive/v3';

/**
 * Make a file or folder public on Google Drive
 * Sets permissions to: role="reader", type="anyone"
 */
export const makeFilePublic = async (fileId, accessToken) => {
  const url = `${DRIVE_API_BASE}/files/${fileId}/permissions`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      role: 'reader',
      type: 'anyone'
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to make file public: ${error}`);
  }

  return await response.json();
};

/**
 * Generate a public Drive link for a file
 * Format: https://drive.google.com/uc?id=<FILE_ID>
 */
export const generatePublicLink = async (fileId, itemType, accessToken) => {
  // Make the file public first
  await makeFilePublic(fileId, accessToken);
  
  // For folders, use different URL format
  if (itemType === 'folder') {
    return `https://drive.google.com/drive/folders/${fileId}`;
  }
  
  // For files (images, STL), use direct access URL
  return `https://drive.google.com/uc?id=${fileId}`;
};

/**
 * Request a private share token from Firebase backend
 * The backend will create a signed JWT token and grant service account access
 */
export const generatePrivateLink = async (fileId, itemType, expiryMinutes, accessToken) => {
  const functionsUrl = import.meta.env.VITE_FIREBASE_FUNCTIONS_URL;
  
  if (!functionsUrl) {
    throw new Error('Firebase Functions URL not configured. Please set VITE_FIREBASE_FUNCTIONS_URL in your .env file');
  }

  const response = await fetch(`${functionsUrl}/generateShareToken`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      fileId,
      itemType,
      expiryMinutes,
      userAccessToken: accessToken // Pass user's OAuth token to grant service account access
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to generate share token: ${error}`);
  }

  const data = await response.json();
  const token = data.token;
  
  // Generate the preview URL with the token
  // Use import.meta.env.BASE_URL to include subdirectory path
  const baseUrl = window.location.origin;
  const basePath = import.meta.env.BASE_URL || '/';
  return `${baseUrl}${basePath}preview/${token}`;
};

/**
 * Validate and decode a share token
 * Calls Firebase function to validate the token
 */
export const validateShareToken = async (token) => {
  const functionsUrl = import.meta.env.VITE_FIREBASE_FUNCTIONS_URL;
  
  if (!functionsUrl) {
    throw new Error('Firebase Functions URL not configured');
  }

  const response = await fetch(`${functionsUrl}/validateShareToken`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ token })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to validate token');
  }

  return await response.json();
};

/**
 * Fetch file data via the share proxy
 * Used by the public preview page to access files without authentication
 */
export const fetchSharedFile = async (token) => {
  const functionsUrl = import.meta.env.VITE_FIREBASE_FUNCTIONS_URL;
  
  if (!functionsUrl) {
    throw new Error('Firebase Functions URL not configured');
  }

  const response = await fetch(`${functionsUrl}/shareProxy?token=${token}`);

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to fetch file' }));
    throw new Error(error.message || 'Failed to fetch file');
  }

  return response;
};

/**
 * Fetch folder contents via the share proxy
 * Can optionally fetch a subfolder by passing folderId
 */
export const fetchSharedFolder = async (token, folderId = null) => {
  const functionsUrl = import.meta.env.VITE_FIREBASE_FUNCTIONS_URL;
  
  if (!functionsUrl) {
    throw new Error('Firebase Functions URL not configured');
  }

  let url = `${functionsUrl}/shareFolderContents?token=${token}`;
  if (folderId) {
    url += `&folderId=${folderId}`;
  }

  const response = await fetch(url);

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to fetch folder' }));
    throw new Error(error.message || 'Failed to fetch folder');
  }

  return await response.json();
};

