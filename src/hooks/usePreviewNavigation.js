import { useState, useCallback } from 'react';
import { listFolderContents } from '../api/unifiedDriveApi';

/**
 * Hook for navigating through shared Drive folders in preview mode
 * Uses unified API that automatically routes to Firebase Functions proxy
 */
export const usePreviewNavigation = (token) => {
  const [pathStack, setPathStack] = useState([]);
  const [currentFolderId, setCurrentFolderId] = useState(null);
  const [folderContents, setFolderContents] = useState({
    folders: [],
    images: [],
    stlFiles: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Create preview-mode access token
  const previewAccessToken = `preview:${token}`;

  /**
   * Initialize with root folder
   */
  const initializeWithFolder = useCallback(async (folderId, folderName) => {
    setPathStack([{ id: folderId, name: folderName }]);
    setCurrentFolderId(folderId);
    await loadFolderContents(folderId);
  }, [token]);

  /**
   * Load folder contents via unified API
   */
  const loadFolderContents = async (folderId) => {
    setLoading(true);
    setError(null);

    try {
      const data = await listFolderContents(folderId, previewAccessToken);
      
      // Categorize files (unified API returns raw files list)
      const files = data.files || [];
      const folders = [];
      const images = [];
      const stlFiles = [];

      files.forEach(file => {
        if (file.mimeType === 'application/vnd.google-apps.folder') {
          folders.push(file);
        } else if (file.mimeType?.startsWith('image/')) {
          images.push(file);
        } else if (file.name?.toLowerCase().endsWith('.stl')) {
          stlFiles.push(file);
        }
      });

      setFolderContents({ folders, images, stlFiles });
    } catch (err) {
      console.error('Error loading folder:', err);
      setError(err.message || 'Failed to load folder contents');
      setFolderContents({ folders: [], images: [], stlFiles: [] });
    } finally {
      setLoading(false);
    }
  };

  /**
   * Navigate to a subfolder
   */
  const navigateTo = useCallback(async (folderId, folderName) => {
    setPathStack(prev => [...prev, { id: folderId, name: folderName }]);
    setCurrentFolderId(folderId);
    await loadFolderContents(folderId);
  }, []);

  /**
   * Navigate back using breadcrumbs
   */
  const goBackTo = useCallback(async (index) => {
    const newPath = pathStack.slice(0, index + 1);
    const targetFolder = newPath[newPath.length - 1];
    
    setPathStack(newPath);
    setCurrentFolderId(targetFolder.id);
    await loadFolderContents(targetFolder.id);
  }, [pathStack]);

  return {
    pathStack,
    currentFolderId,
    folderContents,
    loading,
    error,
    navigateTo,
    goBackTo,
    initializeWithFolder
  };
};

