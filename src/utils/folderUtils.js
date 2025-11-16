import { FOLDER_CONFIG } from './config';

/**
 * Search for root folder by name
 * Tries primary name first, then alternatives
 */
export const findRootFolder = async (listFoldersFn, accessToken) => {
  const namesToTry = [
    FOLDER_CONFIG.ROOT_FOLDER_NAME,
    ...FOLDER_CONFIG.ALTERNATIVE_ROOT_NAMES
  ];
  
  for (const name of namesToTry) {
    try {
      const folder = await searchFolderByName(name, listFoldersFn, accessToken);
      if (folder) {
        return folder;
      }
    } catch (error) {
      console.warn(`Failed to search for folder "${name}":`, error);
    }
  }
  
  return null;
};

/**
 * Search for a folder by exact name
 */
const searchFolderByName = async (name, searchFn, accessToken) => {
  // Implementation would call the Drive API search
  // This is a placeholder that would need to be integrated
  // with the actual googleDrive.js search function
  return searchFn(name, accessToken);
};

/**
 * Filter hidden files if configured
 */
export const filterHiddenFiles = (files) => {
  if (FOLDER_CONFIG.SHOW_HIDDEN_FILES) {
    return files;
  }
  
  return files.filter(file => !file.name.startsWith('.'));
};

/**
 * Sort files according to configuration
 */
export const sortFiles = (files) => {
  const order = FOLDER_CONFIG.SORT_ORDER;
  
  switch (order) {
    case 'modified':
      return [...files].sort((a, b) => 
        new Date(b.modifiedTime) - new Date(a.modifiedTime)
      );
    
    case 'size':
      return [...files].sort((a, b) => (b.size || 0) - (a.size || 0));
    
    case 'alphabetical':
    default:
      return [...files].sort((a, b) => 
        a.name.localeCompare(b.name, undefined, { numeric: true })
      );
  }
};

