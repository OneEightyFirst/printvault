/**
 * Example configuration for different Drive folder structures
 * 
 * If your Drive structure is different from the default,
 * you can customize the folder search and navigation here.
 */

export const FOLDER_CONFIG = {
  // Root folder name to search for
  ROOT_FOLDER_NAME: 'Clean STL',
  
  // Alternative root folder names to try if first one not found
  ALTERNATIVE_ROOT_NAMES: [
    'STL Files',
    'STL Collection',
    '3D Models'
  ],
  
  // Maximum depth for recursive image search
  MAX_IMAGE_SEARCH_DEPTH: 5,
  
  // Image file extensions to look for
  IMAGE_EXTENSIONS: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
  
  // Whether to use creator image naming convention
  // (looks for CreatorName.jpg in parent folder)
  USE_CREATOR_IMAGE_CONVENTION: true,
  
  // Whether to show hidden files/folders (starting with .)
  SHOW_HIDDEN_FILES: false,
  
  // Sort order for files and folders
  SORT_ORDER: 'alphabetical', // 'alphabetical' | 'modified' | 'size'
  
  // Cache settings
  CACHE_THUMBNAILS: true,
  CACHE_FOLDER_METADATA: true,
  
  // STL Viewer settings
  STL_VIEWER: {
    backgroundColor: 0xf5f5f5,
    modelColor: 0x6366f1,
    maxFileSize: 100 * 1024 * 1024, // 100MB
    enableWireframe: false
  }
};

/**
 * Update configuration at runtime
 */
export const updateConfig = (updates) => {
  Object.assign(FOLDER_CONFIG, updates);
};

