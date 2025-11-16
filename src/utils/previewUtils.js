/**
 * Utility to check if we're in preview mode based on access token format
 */
export const isPreviewMode = (accessToken) => {
  return accessToken && accessToken.startsWith('preview:');
};

/**
 * Extract the JWT token from preview mode access token
 */
export const getPreviewToken = (accessToken) => {
  if (isPreviewMode(accessToken)) {
    return accessToken.replace('preview:', '');
  }
  return null;
};

/**
 * Get image URL for both normal and preview modes
 */
export const getImageUrl = async (fileId, accessToken) => {
  if (isPreviewMode(accessToken)) {
    // Preview mode: use Firebase proxy
    const token = getPreviewToken(accessToken);
    const functionsUrl = import.meta.env.VITE_FIREBASE_FUNCTIONS_URL;
    return `${functionsUrl}/shareProxy?token=${token}&fileId=${fileId}`;
  } else {
    // Normal mode: direct Google Drive API
    return `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`;
  }
};

