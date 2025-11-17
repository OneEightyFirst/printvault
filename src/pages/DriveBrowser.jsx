import React, { useState, useEffect } from 'react';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { FolderGrid } from '../components/FolderGrid';
import { STLViewer } from '../components/STLViewer';
import { FolderSelector } from '../components/FolderSelector';
import { ThemeToggle } from '../components/ThemeToggle';
import { UserMenu } from '../components/UserMenu';
import { useDriveNavigation } from '../hooks/useDriveNavigation';

/**
 * Main Drive Browser Page
 */
export const DriveBrowser = ({ accessToken, user, onSignOut }) => {
  const [selectedSTL, setSelectedSTL] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedImageUrl, setSelectedImageUrl] = useState(null);
  const [rootFolderId, setRootFolderId] = useState(null);
  const [rootFolderName, setRootFolderName] = useState(null);
  const [showFolderSelector, setShowFolderSelector] = useState(false);
  const [initError, setInitError] = useState(null);
  const [initializing, setInitializing] = useState(true);

  const {
    pathStack,
    currentFolderId,
    folderContents,
    loading,
    error,
    navigateTo,
    goBackTo,
    initializeWithFolder
  } = useDriveNavigation(accessToken);

  // Initialize by checking for stored root folder or showing selector
  useEffect(() => {
    const init = async () => {
      if (!accessToken) return;

      setInitializing(true);
      setInitError(null);

      try {
        // Check for stored root folder in localStorage
        const storedFolderId = localStorage.getItem('rootFolderId');
        const storedFolderName = localStorage.getItem('rootFolderName');
        
        if (storedFolderId && storedFolderName) {
          // Use stored folder
          setRootFolderId(storedFolderId);
          setRootFolderName(storedFolderName);
          await initializeWithFolder(storedFolderId, storedFolderName);
        } else {
          // No stored folder - show selector
          setShowFolderSelector(true);
        }
      } catch (err) {
        console.error('Error initializing:', err);
        setInitError('Failed to initialize: ' + err.message);
      } finally {
        setInitializing(false);
      }
    };

    init();
  }, [accessToken, initializeWithFolder]);

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

  // Load image URL when image is selected
  useEffect(() => {
    if (!selectedImage || !accessToken) {
      setSelectedImageUrl(null);
      return;
    }

    const loadImageUrl = async () => {
      try {
        const url = `https://www.googleapis.com/drive/v3/files/${selectedImage.id}?alt=media`;
        const response = await fetch(url, {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        });
        
        if (response.ok) {
          const blob = await response.blob();
          const objectUrl = URL.createObjectURL(blob);
          setSelectedImageUrl(objectUrl);
        }
      } catch (error) {
        console.error('Error loading image:', error);
      }
    };

    loadImageUrl();

    // Cleanup object URL when image changes
    return () => {
      if (selectedImageUrl) {
        URL.revokeObjectURL(selectedImageUrl);
      }
    };
  }, [selectedImage, accessToken]);

  const closeSTLViewer = () => {
    setSelectedSTL(null);
  };

  const closeImageViewer = () => {
    setSelectedImage(null);
    setSelectedImageUrl(null);
  };

  const handleFolderSelected = async (folderId, folderName) => {
    // Store selection in localStorage
    localStorage.setItem('rootFolderId', folderId);
    localStorage.setItem('rootFolderName', folderName);
    
    // Set state and initialize
    setRootFolderId(folderId);
    setRootFolderName(folderName);
    setShowFolderSelector(false);
    
    // Initialize navigation with selected folder
    await initializeWithFolder(folderId, folderName);
  };

  const handleChangeRootFolder = () => {
    setShowFolderSelector(true);
  };

  // Show folder selector if needed
  if (showFolderSelector) {
    return <FolderSelector accessToken={accessToken} onFolderSelected={handleFolderSelected} />;
  }

  if (initializing) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-gray-600">Initializing browser...</p>
      </div>
    );
  }

  if (initError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <svg className="w-16 h-16 text-red-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-red-600 text-center max-w-md">{initError}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sticky Navigation Bar */}
      <nav className="bg-white dark:bg-gray-800 shadow-sm border-b dark:border-gray-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-3">
          {/* Top row: Logo and controls */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" />
              </svg>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">PrintVault</h1>
            </div>

            <div className="flex items-center gap-2">
              <ThemeToggle />
              <UserMenu 
                user={user} 
                onSignOut={onSignOut}
                onSettings={handleChangeRootFolder}
              />
            </div>
          </div>
          
          {/* Bottom row: Breadcrumbs */}
          <div className="border-t dark:border-gray-700 pt-3">
            <Breadcrumbs pathStack={pathStack} onNavigate={handleBreadcrumbClick} />
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
          accessToken={accessToken}
          currentFolderId={currentFolderId}
          loading={loading}
        />

        {/* STL Viewer Modal */}
        {selectedSTL && (
          <STLViewer
            file={selectedSTL}
            accessToken={accessToken}
            onClose={closeSTLViewer}
          />
        )}

        {/* Image Viewer Modal */}
        {selectedImage && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="relative max-w-4xl max-h-full">
              <button
                onClick={closeImageViewer}
                className="absolute top-4 right-4 p-2 bg-white hover:bg-gray-100 rounded-full transition-colors shadow-lg"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              {selectedImageUrl ? (
                <img
                  src={selectedImageUrl}
                  alt={selectedImage.name}
                  className="max-w-full max-h-screen rounded-lg shadow-2xl"
                />
              ) : (
                <div className="flex items-center justify-center h-64">
                  <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

