/**
 * MIME type utilities
 */

export const MIME_TYPES = {
  FOLDER: 'application/vnd.google-apps.folder',
  IMAGE_JPEG: 'image/jpeg',
  IMAGE_PNG: 'image/png',
  IMAGE_GIF: 'image/gif',
  STL: 'application/sla' // or could be application/octet-stream
};

export const isFolder = (mimeType) => {
  return mimeType === MIME_TYPES.FOLDER;
};

export const isImage = (mimeType) => {
  return mimeType?.startsWith('image/');
};

export const isSTL = (filename) => {
  return filename?.toLowerCase().endsWith('.stl');
};

export const getFileExtension = (filename) => {
  const parts = filename.split('.');
  return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : '';
};

export const isImageFile = (filename) => {
  const ext = getFileExtension(filename);
  return ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext);
};

