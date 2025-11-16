/**
 * Google Drive API client
 * Handles all Drive API requests with proper authentication
 */

const DRIVE_API_BASE = 'https://www.googleapis.com/drive/v3';
const DRIVE_FILES_ENDPOINT = `${DRIVE_API_BASE}/files`;

// Use proxy if configured, otherwise direct API calls
const USE_PROXY = !!import.meta.env.VITE_DRIVE_PROXY_URL;
const PROXY_URL = import.meta.env.VITE_DRIVE_PROXY_URL;

// Callback for token refresh - set by the app
let onTokenExpired = null;

/**
 * Set callback to handle token expiration
 * The app should provide a function that re-authenticates and returns a new token
 */
export const setTokenExpiredCallback = (callback) => {
  onTokenExpired = callback;
};

/**
 * Make an authenticated request to Google Drive API
 * Automatically retries with fresh token if 401 is received
 */
const makeDriveRequest = async (url, accessToken, options = {}, retryCount = 0) => {
  const headers = {
    'Authorization': `Bearer ${accessToken}`,
    ...options.headers
  };

  // If using proxy, send request through Firebase Function
  if (USE_PROXY && PROXY_URL) {
    const response = await fetch(PROXY_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify({
        url,
        method: options.method || 'GET',
        headers: options.headers || {}
      })
    });

    if (!response.ok) {
      throw new Error(`Drive API request failed: ${response.status}`);
    }

    return response;
  }

  // Direct API call
  const response = await fetch(url, {
    ...options,
    headers
  });

  // Handle 401 Unauthorized - token expired
  if (response.status === 401 && retryCount === 0 && onTokenExpired) {
    console.log('Token expired, refreshing...');
    
    try {
      // Get fresh token
      const newToken = await onTokenExpired();
      
      if (newToken) {
        // Retry with new token (only once to avoid infinite loops)
        return makeDriveRequest(url, newToken, options, retryCount + 1);
      }
    } catch (error) {
      console.error('Failed to refresh token:', error);
      throw new Error('Authentication expired. Please sign in again.');
    }
  }

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Drive API error: ${response.status} - ${errorText}`);
  }

  return response;
};

/**
 * List children of a folder
 * Returns folders, images, and STL files separately
 */
export const listChildren = async (folderId, accessToken) => {
  const query = `'${folderId}' in parents and trashed = false`;
  const fields = 'files(id,name,mimeType,modifiedTime,size,parents,iconLink,thumbnailLink)';
  
  const url = `${DRIVE_FILES_ENDPOINT}?q=${encodeURIComponent(query)}&fields=${encodeURIComponent(fields)}&orderBy=folder,name`;

  const response = await makeDriveRequest(url, accessToken);
  const data = await response.json();

  const files = data.files || [];

  // Categorize files
  const folders = [];
  const images = [];
  const stlFiles = [];

  files.forEach(file => {
    if (file.mimeType === 'application/vnd.google-apps.folder') {
      folders.push(file);
    } else if (file.mimeType.startsWith('image/')) {
      images.push(file);
    } else if (file.name.toLowerCase().endsWith('.stl')) {
      stlFiles.push(file);
    }
  });

  return { folders, images, stlFiles };
};

/**
 * Get file metadata
 */
export const getFileMetadata = async (fileId, accessToken) => {
  const fields = 'id,name,mimeType,modifiedTime,size,parents,iconLink,thumbnailLink';
  const url = `${DRIVE_FILES_ENDPOINT}/${fileId}?fields=${encodeURIComponent(fields)}`;

  const response = await makeDriveRequest(url, accessToken);
  return await response.json();
};

/**
 * Search for files by name pattern in a folder (recursive)
 */
export const searchFilesInFolder = async (folderId, namePattern, accessToken, mimeTypePrefix = 'image/') => {
  const query = `'${folderId}' in parents and trashed = false and mimeType contains '${mimeTypePrefix}'`;
  const fields = 'files(id,name,mimeType,parents)';
  
  const url = `${DRIVE_FILES_ENDPOINT}?q=${encodeURIComponent(query)}&fields=${encodeURIComponent(fields)}`;

  const response = await makeDriveRequest(url, accessToken);
  const data = await response.json();

  return data.files || [];
};

/**
 * Recursively find first image in folder tree
 */
export const findFirstImageRecursive = async (folderId, accessToken, depth = 0, maxDepth = 5) => {
  if (depth > maxDepth) return null;

  // Get all children
  const { folders, images } = await listChildren(folderId, accessToken);

  // If we have images, return the first one
  if (images.length > 0) {
    return images[0];
  }

  // Recursively search subfolders
  for (const folder of folders) {
    const found = await findFirstImageRecursive(folder.id, accessToken, depth + 1, maxDepth);
    if (found) return found;
  }

  return null;
};

/**
 * Download file content as ArrayBuffer
 */
export const downloadFile = async (fileId, accessToken) => {
  const url = `${DRIVE_FILES_ENDPOINT}/${fileId}?alt=media`;
  const response = await makeDriveRequest(url, accessToken);
  return await response.arrayBuffer();
};

/**
 * Download file content as Blob (for images)
 */
export const downloadFileAsBlob = async (fileId, accessToken) => {
  const url = `${DRIVE_FILES_ENDPOINT}/${fileId}?alt=media`;
  const response = await makeDriveRequest(url, accessToken);
  return await response.blob();
};

/**
 * Get thumbnail URL for a file
 * For images, we'll download and create object URL
 */
export const getThumbnailUrl = async (fileId, accessToken) => {
  try {
    const blob = await downloadFileAsBlob(fileId, accessToken);
    return URL.createObjectURL(blob);
  } catch (error) {
    console.error('Error getting thumbnail:', error);
    return null;
  }
};

/**
 * Find the root "Clean STL" folder
 * User will need to provide the folder ID initially
 */
export const findCleanSTLFolder = async (accessToken) => {
  const query = "name = 'Clean STL' and mimeType = 'application/vnd.google-apps.folder' and trashed = false";
  const fields = 'files(id,name)';
  
  const url = `${DRIVE_FILES_ENDPOINT}?q=${encodeURIComponent(query)}&fields=${encodeURIComponent(fields)}`;

  const response = await makeDriveRequest(url, accessToken);
  const data = await response.json();

  if (data.files && data.files.length > 0) {
    return data.files[0];
  }

  return null;
};

