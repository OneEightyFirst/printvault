/**
 * Simple in-memory cache for thumbnails and metadata
 */

class Cache {
  constructor() {
    this.thumbnails = new Map();
    this.metadata = new Map();
    this.folderImages = new Map(); // Cache for folder preview images
  }

  // Thumbnail cache
  setThumbnail(fileId, url) {
    this.thumbnails.set(fileId, url);
  }

  getThumbnail(fileId) {
    return this.thumbnails.get(fileId);
  }

  hasThumbnail(fileId) {
    return this.thumbnails.has(fileId);
  }

  // Metadata cache
  setMetadata(fileId, metadata) {
    this.metadata.set(fileId, metadata);
  }

  getMetadata(fileId) {
    return this.metadata.get(fileId);
  }

  hasMetadata(fileId) {
    return this.metadata.has(fileId);
  }

  // Folder preview image cache
  setFolderImage(folderId, imageFileId) {
    this.folderImages.set(folderId, imageFileId);
  }

  getFolderImage(folderId) {
    return this.folderImages.get(folderId);
  }

  hasFolderImage(folderId) {
    return this.folderImages.has(folderId);
  }

  // Clear all caches
  clear() {
    // Revoke all object URLs to prevent memory leaks
    this.thumbnails.forEach(url => {
      if (url.startsWith('blob:')) {
        URL.revokeObjectURL(url);
      }
    });
    
    this.thumbnails.clear();
    this.metadata.clear();
    this.folderImages.clear();
  }
}

export const cache = new Cache();

