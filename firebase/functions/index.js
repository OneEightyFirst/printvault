const functions = require('firebase-functions');
const admin = require('firebase-admin');
const fetch = require('node-fetch');

// Initialize Firebase Admin
admin.initializeApp();

// Secret for signing JWT tokens (in production, use Firebase Config)
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

/**
 * Simple JWT implementation
 */
const jwt = {
  sign: (payload, secret) => {
    const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
    const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
    const crypto = require('crypto');
    const signature = crypto
      .createHmac('sha256', secret)
      .update(`${header}.${body}`)
      .digest('base64url');
    return `${header}.${body}.${signature}`;
  },
  verify: (token, secret) => {
    try {
      const [header, payload, signature] = token.split('.');
      const crypto = require('crypto');
      const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(`${header}.${payload}`)
        .digest('base64url');
      
      if (signature !== expectedSignature) {
        throw new Error('Invalid signature');
      }
      
      return JSON.parse(Buffer.from(payload, 'base64url').toString());
    } catch (error) {
      throw new Error('Invalid token');
    }
  }
};

/**
 * Optional Google Drive API Proxy
 * 
 * This Cloud Function acts as a proxy to forward Drive API requests,
 * helping avoid CORS issues when accessing Drive files directly from the browser.
 * 
 * Usage:
 * POST to this function with:
 * {
 *   "url": "https://www.googleapis.com/drive/v3/files/...",
 *   "method": "GET",
 *   "headers": {}
 * }
 * 
 * Include Authorization header from the client.
 */
exports.driveProxy = functions.https.onRequest(async (req, res) => {
  // Enable CORS
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  // Only allow POST
  if (req.method !== 'POST') {
    res.status(405).send('Method Not Allowed');
    return;
  }

  try {
    const { url, method = 'GET', headers = {} } = req.body;
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      res.status(401).json({ error: 'Missing authorization header' });
      return;
    }

    if (!url) {
      res.status(400).json({ error: 'Missing URL parameter' });
      return;
    }

    // Forward the request to Google Drive API
    const driveResponse = await fetch(url, {
      method,
      headers: {
        'Authorization': authHeader,
        ...headers
      }
    });

    // Get response content type
    const contentType = driveResponse.headers.get('content-type');

    // Forward status code
    res.status(driveResponse.status);

    // Set content type
    if (contentType) {
      res.set('Content-Type', contentType);
    }

    // Handle binary data (STL files, images)
    if (contentType && (
      contentType.includes('application/octet-stream') ||
      contentType.includes('image/') ||
      contentType.includes('application/sla')
    )) {
      const buffer = await driveResponse.buffer();
      res.send(buffer);
    } else {
      // Handle JSON responses
      const data = await driveResponse.json();
      res.json(data);
    }

  } catch (error) {
    console.error('Drive proxy error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Generate a signed share token
 * Creates a JWT token containing fileId, type, and expiry
 */
exports.generateShareToken = functions.https.onRequest(async (req, res) => {
  // Enable CORS
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }

  try {
    const { fileId, itemType, expiryMinutes } = req.body;

    if (!fileId || !itemType || !expiryMinutes) {
      res.status(400).json({ error: 'Missing required parameters' });
      return;
    }

    // Calculate expiry timestamp
    const expiryTime = Date.now() + (expiryMinutes * 60 * 1000);

    // Create JWT payload
    const payload = {
      fileId,
      itemType,
      exp: expiryTime,
      iat: Date.now()
    };

    // Sign the token
    const token = jwt.sign(payload, JWT_SECRET);

    res.status(200).json({ token });

  } catch (error) {
    console.error('Token generation error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Validate a share token
 * Returns the decoded token data if valid
 */
exports.validateShareToken = functions.https.onRequest(async (req, res) => {
  // Enable CORS
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }

  try {
    const { token } = req.body;

    if (!token) {
      res.status(400).json({ error: 'Missing token parameter' });
      return;
    }

    // Verify and decode the token
    const payload = jwt.verify(token, JWT_SECRET);

    // Check if token is expired
    if (payload.exp < Date.now()) {
      res.status(401).json({ error: 'Token expired', expired: true });
      return;
    }

    res.status(200).json({
      valid: true,
      fileId: payload.fileId,
      itemType: payload.itemType,
      expiresAt: payload.exp
    });

  } catch (error) {
    console.error('Token validation error:', error);
    res.status(401).json({ error: 'Invalid token', valid: false });
  }
});

/**
 * Share Proxy - Stream file contents for shared links
 * Validates token and streams file from Google Drive
 * 
 * Requires a service account with Drive access
 */
exports.shareProxy = functions.https.onRequest(async (req, res) => {
  // Enable CORS
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }

  try {
    const { token, fileId: requestedFileId } = req.query;

    if (!token) {
      res.status(400).json({ error: 'Missing token parameter' });
      return;
    }

    // Verify and decode the token
    let payload;
    try {
      payload = jwt.verify(token, JWT_SECRET);
    } catch (error) {
      res.status(401).json({ error: 'Invalid token' });
      return;
    }

    // Check if token is expired
    if (payload.exp < Date.now()) {
      res.status(401).json({ error: 'Token expired', expired: true });
      return;
    }

    // Use requested fileId (for images/subfiles) or token's fileId
    const targetFileId = requestedFileId || payload.fileId;

    // Get service account access token
    const accessToken = await getServiceAccountToken();

    // Fetch file from Google Drive
    const driveUrl = `https://www.googleapis.com/drive/v3/files/${targetFileId}?alt=media`;
    
    const driveResponse = await fetch(driveUrl, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    if (!driveResponse.ok) {
      res.status(driveResponse.status).json({ error: 'Failed to fetch file from Drive' });
      return;
    }

    // Determine content type
    let contentType = 'application/octet-stream';
    if (itemType === 'image') {
      contentType = driveResponse.headers.get('content-type') || 'image/jpeg';
    } else if (itemType === 'stl') {
      contentType = 'application/octet-stream';
    }

    // Set headers and stream response
    res.set('Content-Type', contentType);
    res.set('Cache-Control', 'public, max-age=300');

    const buffer = await driveResponse.buffer();
    res.send(buffer);

  } catch (error) {
    console.error('Share proxy error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Share Folder Contents - Get folder contents for shared folder links
 */
exports.shareFolderContents = functions.https.onRequest(async (req, res) => {
  // Enable CORS
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }

  try {
    const { token, folderId } = req.query;

    if (!token) {
      res.status(400).json({ error: 'Missing token parameter' });
      return;
    }

    // Verify and decode the token
    let payload;
    try {
      payload = jwt.verify(token, JWT_SECRET);
    } catch (error) {
      res.status(401).json({ error: 'Invalid token' });
      return;
    }

    // Check if token is expired
    if (payload.exp < Date.now()) {
      res.status(401).json({ error: 'Token expired', expired: true });
      return;
    }

    const { fileId: rootFolderId, itemType } = payload;

    if (itemType !== 'folder') {
      res.status(400).json({ error: 'Token is not for a folder' });
      return;
    }

    // Use the provided folderId for subfolder navigation, or root folder
    const targetFolderId = folderId || rootFolderId;

    // Get service account access token
    const accessToken = await getServiceAccountToken();

    // List folder contents
    const query = `'${targetFolderId}' in parents and trashed = false`;
    const fields = 'files(id,name,mimeType,modifiedTime,size)';
    const driveUrl = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=${encodeURIComponent(fields)}`;
    
    const driveResponse = await fetch(driveUrl, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    if (!driveResponse.ok) {
      res.status(driveResponse.status).json({ error: 'Failed to fetch folder from Drive' });
      return;
    }

    const data = await driveResponse.json();
    
    // Categorize files
    const files = data.files || [];
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

    res.status(200).json({ folders, images, stlFiles });

  } catch (error) {
    console.error('Share folder contents error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get service account access token for Drive API
 * Uses Firebase Admin SDK to get an access token
 */
async function getServiceAccountToken() {
  try {
    // Get access token from service account
    const accessToken = await admin.credential.applicationDefault().getAccessToken();
    return accessToken.access_token;
  } catch (error) {
    console.error('Error getting service account token:', error);
    throw new Error('Failed to get service account access token');
  }
}

