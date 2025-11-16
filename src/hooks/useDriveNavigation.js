import { useState, useCallback } from 'react';
import { listChildren } from '../api/googleDrive';

/**
 * Hook to manage Drive folder navigation
 */
export const useDriveNavigation = (accessToken) => {
  const [pathStack, setPathStack] = useState([]);
  const [currentFolderId, setCurrentFolderId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [folderContents, setFolderContents] = useState({
    folders: [],
    images: [],
    stlFiles: []
  });

  /**
   * Navigate to a specific folder
   */
  const navigateTo = useCallback(async (folderId, folderName) => {
    if (!accessToken) {
      setError('No access token available');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const contents = await listChildren(folderId, accessToken);
      
      setCurrentFolderId(folderId);
      setFolderContents(contents);
      
      // Add to path stack
      setPathStack(prev => [...prev, { id: folderId, name: folderName }]);
    } catch (err) {
      console.error('Error navigating to folder:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  /**
   * Navigate back to a specific index in the breadcrumb
   */
  const goBackTo = useCallback(async (index) => {
    if (index < 0 || index >= pathStack.length) return;

    const targetFolder = pathStack[index];
    
    setLoading(true);
    setError(null);

    try {
      const contents = await listChildren(targetFolder.id, accessToken);
      
      setCurrentFolderId(targetFolder.id);
      setFolderContents(contents);
      
      // Update path stack to only include items up to index
      setPathStack(prev => prev.slice(0, index + 1));
    } catch (err) {
      console.error('Error navigating back:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [pathStack, accessToken]);

  /**
   * Refresh current folder
   */
  const refresh = useCallback(async () => {
    if (!currentFolderId || !accessToken) return;

    setLoading(true);
    setError(null);

    try {
      const contents = await listChildren(currentFolderId, accessToken);
      setFolderContents(contents);
    } catch (err) {
      console.error('Error refreshing folder:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [currentFolderId, accessToken]);

  /**
   * Initialize with root folder
   */
  const initializeWithFolder = useCallback(async (folderId, folderName) => {
    setPathStack([]);
    setCurrentFolderId(null);
    await navigateTo(folderId, folderName);
  }, [navigateTo]);

  return {
    pathStack,
    currentFolderId,
    folderContents,
    loading,
    error,
    navigateTo,
    goBackTo,
    refresh,
    initializeWithFolder
  };
};

