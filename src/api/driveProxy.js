/**
 * Optional Drive API proxy through Firebase Functions
 * This helps avoid CORS issues
 */

/**
 * Call the Firebase Cloud Function proxy
 */
export const callDriveProxy = async (endpoint, method = 'GET', accessToken) => {
  const proxyUrl = import.meta.env.VITE_DRIVE_PROXY_URL;
  
  if (!proxyUrl) {
    throw new Error('Drive proxy URL not configured');
  }

  const response = await fetch(proxyUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`
    },
    body: JSON.stringify({
      endpoint,
      method
    })
  });

  if (!response.ok) {
    throw new Error(`Proxy request failed: ${response.status}`);
  }

  return response;
};

