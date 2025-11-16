import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { validateShareToken } from '../api/driveShare';
import { usePreviewNavigation } from '../hooks/usePreviewNavigation';
import { getFileUrl } from '../api/unifiedDriveApi';
import { FolderGrid } from '../components/FolderGrid';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { ThemeToggle } from '../components/ThemeToggle';
import { STLViewer } from '../components/STLViewer';

/**
 * Public Preview Page
 * Displays shared folders with full navigation, thumbnails, and dark mode
 * Uses same components as main app for consistency
 */
export const PreviewPage = () => {
  const { token } = useParams();
  const [initializing, setInitializing] = useState(true);
  const [initError, setInitError] = useState(null);
  const [tokenData, setTokenData] = useState(null);
  const [selectedSTL, setSelectedSTL] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);

  const {
    pathStack,
    currentFolderId,
    folderContents,
    loading,
    error,
    navigateTo,
    goBackTo,
    initializeWithFolder
  } = usePreviewNavigation(token);

  useEffect(() => {
    if (token) {
      validateAndInitialize();
    }
  }, [token]);

  // Load image URL when image is selected
  useEffect(() => {
    if (selectedImage) {
      loadImageUrl();
    } else {
      setImageUrl(null);
    }
  }, [selectedImage]);

  const loadImageUrl = async () => {
    try {
      const url = await getFileUrl(selectedImage.id, `preview:${token}`);
      setImageUrl(url);
    } catch (err) {
      console.error('Error loading image URL:', err);
    }
  };

  const validateAndInitialize = async () => {
    setInitializing(true);
    setInitError(null);

    try {
      const validation = await validateShareToken(token);
      setTokenData(validation);
      
      // Only support folder shares for now
      if (validation.itemType === 'folder') {
        await initializeWithFolder(validation.fileId, 'Shared Folder');
      } else {
        setInitError('Only folder shares are supported in preview mode');
      }
    } catch (err) {
      console.error('Preview validation error:', err);
      setInitError(err.message || 'Failed to load preview');
    } finally {
      setInitializing(false);
    }
  };

  const handleFolderClick = (folderId, folderName) => {
    navigateTo(folderId, folderName);
  };

  const handleBreadcrumbClick = (index) => {
    goBackTo(index);
  };

  const handleSTLClick = (file) => {
    setSelectedSTL(file);
  };

  const handleImageClick = (file) => {
    setSelectedImage(file);
  };

  const closeSTLViewer = () => {
    setSelectedSTL(null);
  };

  const closeImageViewer = () => {
    setSelectedImage(null);
  };

  if (initializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading preview...</p>
        </div>
      </div>
    );
  }

  if (initError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <div className="text-center">
            <svg className="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {initError.includes('expired') ? 'Link Expired' : 'Error Loading Preview'}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">{initError}</p>
            {initError.includes('expired') && (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                This link has expired. Please request a new link from the owner.
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header with navigation and theme toggle */}
      <nav className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 flex-1">
              {/* Logo */}
              <div className="flex items-center gap-2">
                <svg className="w-7 h-7 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" />
                </svg>
                <h1 className="text-lg font-bold text-gray-900 dark:text-white">PrintVault</h1>
              </div>

              {/* Breadcrumbs */}
              <div className="flex-1">
                <Breadcrumbs
                  path={pathStack}
                  onNavigate={handleBreadcrumbClick}
                />
              </div>

              {/* Expiry notice - compact */}
              {tokenData?.expiresAt && (
                <div className="hidden md:block text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                  Expires: {new Date(tokenData.expiresAt).toLocaleString(undefined, { 
                    month: 'short', 
                    day: 'numeric', 
                    hour: 'numeric', 
                    minute: '2-digit' 
                  })}
                </div>
              )}
            </div>

            {/* Theme Toggle */}
            <div className="ml-4">
              <ThemeToggle />
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Error display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-500 dark:text-red-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-red-700 dark:text-red-300">{error}</p>
            </div>
          </div>
        )}

        {/* Folder contents */}
        <FolderGrid
          folders={folderContents.folders}
          images={folderContents.images}
          stlFiles={folderContents.stlFiles}
          onFolderClick={handleFolderClick}
          onImageClick={handleImageClick}
          onSTLClick={handleSTLClick}
          accessToken={`preview:${token}`}
          currentFolderId={currentFolderId}
          loading={loading}
        />

        {/* STL Viewer Modal */}
        {selectedSTL && (
          <STLViewer
            file={selectedSTL}
            accessToken={`preview:${token}`}
            onClose={closeSTLViewer}
          />
        )}

        {/* Image Viewer Modal */}
        {selectedImage && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="max-w-7xl w-full relative">
              <button
                onClick={closeImageViewer}
                className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors bg-black bg-opacity-50 rounded-full p-2"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt={selectedImage.name}
                  className="max-w-full max-h-screen object-contain mx-auto"
                />
              ) : (
                <div className="flex items-center justify-center h-screen">
                  <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin" />
                </div>
              )}
              <div className="absolute bottom-4 left-0 right-0 text-center">
                <p className="text-white text-lg font-medium bg-black bg-opacity-50 inline-block px-4 py-2 rounded">
                  {selectedImage.name}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
