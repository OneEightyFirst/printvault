/**
 * Unified Drive API
 * Automatically routes requests to either Google Drive API (normal mode)
 * or Firebase Functions proxy (preview mode) based on the access token
 */

import { isPreviewMode, getPreviewToken } from '../utils/previewUtils';

/**
 * Get the appropriate API client based on access token
 */
export const getDriveClient = (accessToken) => {
  if (isPreviewMode(accessToken)) {
    return new PreviewDriveClient(getPreviewToken(accessToken));
  }
  return new DirectDriveClient(accessToken);
};

/**
 * Direct Google Drive API client (normal authenticated mode)
 */
class DirectDriveClient {
  constructor(accessToken) {
    this.accessToken = accessToken;
  }

  async getFileUrl(fileId) {
    return `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`;
  }

  async getThumbnailUrl(fileId) {
    // Use existing getThumbnailUrl logic
    const { getThumbnailUrl } = await import('./googleDrive');
    return getThumbnailUrl(fileId, this.accessToken);
  }

  async listFolderContents(folderId) {
    const query = `'${folderId}' in parents and trashed = false`;
    const fields = 'files(id,name,mimeType,modifiedTime,size)';
    const url = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=${encodeURIComponent(fields)}`;

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${this.accessToken}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to list folder contents');
    }

    return response.json();
  }

  canSearchFiles() {
    return true; // Direct API can search for preview images
  }
}

/**
 * Firebase Functions proxy client (preview mode)
 */
class PreviewDriveClient {
  constructor(token) {
    this.token = token;
    this.functionsUrl = import.meta.env.VITE_FIREBASE_FUNCTIONS_URL;
  }

  async getFileUrl(fileId) {
    return `${this.functionsUrl}/shareProxy?token=${this.token}&fileId=${fileId}`;
  }

  async getThumbnailUrl(fileId) {
    // In preview mode, file URL and thumbnail URL are the same
    return this.getFileUrl(fileId);
  }

  async listFolderContents(folderId) {
    let url = `${this.functionsUrl}/shareFolderContents?token=${this.token}`;
    if (folderId) {
      url += `&folderId=${folderId}`;
    }

    const response = await fetch(url);

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to fetch folder' }));
      throw new Error(error.message || 'Failed to fetch folder');
    }

    const data = await response.json();
    
    // Firebase returns { folders, images, stlFiles } - convert to files array
    const files = [
      ...(data.folders || []),
      ...(data.images || []),
      ...(data.stlFiles || [])
    ];
    
    return { files };
  }

  canSearchFiles() {
    return false; // Preview mode can't search for matching image files
  }
}

/**
 * Convenience functions that use the appropriate client
 */
export const getFileUrl = async (fileId, accessToken) => {
  const client = getDriveClient(accessToken);
  return client.getFileUrl(fileId);
};

export const getThumbnailUrl = async (fileId, accessToken) => {
  const client = getDriveClient(accessToken);
  return client.getThumbnailUrl(fileId);
};

export const listFolderContents = async (folderId, accessToken) => {
  const client = getDriveClient(accessToken);
  return client.listFolderContents(folderId);
};

export const canSearchFiles = (accessToken) => {
  const client = getDriveClient(accessToken);
  return client.canSearchFiles();
};

