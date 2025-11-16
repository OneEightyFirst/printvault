/**
 * Path and breadcrumb utilities
 */

/**
 * Build breadcrumb display from path array
 */
export const buildBreadcrumbDisplay = (pathStack) => {
  return pathStack.map(item => item.name).join(' / ');
};

/**
 * Get parent path (all but last item)
 */
export const getParentPath = (pathStack) => {
  return pathStack.slice(0, -1);
};

/**
 * Get current folder from path
 */
export const getCurrentFolder = (pathStack) => {
  return pathStack[pathStack.length - 1];
};

/**
 * Format file size
 */
export const formatFileSize = (bytes) => {
  if (!bytes || bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Format date
 */
export const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

