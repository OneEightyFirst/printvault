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
              <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" viewBox="0 0 353.91 351.71" fill="currentColor">
                <g>
                  <circle cx="66.56" cy="127.07" r="6.37"/>
                  <circle cx="57.35" cy="173.37" r="6.37"/>
                  <circle cx="178.35" cy="294.37" r="6.37"/>
                  <circle cx="224.66" cy="285.16" r="6.37"/>
                  <circle cx="92.79" cy="258.93" r="6.37"/>
                  <circle cx="66.56" cy="219.68" r="6.37"/>
                  <circle cx="132.04" cy="285.16" r="6.37"/>
                </g>
                <path d="M177.87,143.45c-2.49,2.49-2.49,6.52,0,9.01l23.59,23.59c2.49,2.49,6.52,2.49,9.01,0l7.29-7.29,52.95,52.95c-4.58,8.49-3.39,19.3,3.77,26.47,8.74,8.74,22.96,8.74,31.7,0,8.74-8.74,8.74-22.96,0-31.7-7.17-7.17-17.98-8.35-26.47-3.77l-41.5-41.5c20.78,3.45,42.85-2.74,58.85-18.75l15.1-15.1,7.29,7.29c2.49,2.49,6.52,2.49,9.01,0l23.59-23.59c2.49-2.49,2.49-6.52,0-9.01l-23.59-23.59c-2.49-2.49-6.52-2.49-9.01,0l-23.59,23.59c-2.49,2.49-2.49,6.52,0,9.01l7.29,7.29-15.1,15.1c-15.57,15.57-38.23,19.75-57.66,12.66l3.65-3.65c2.49-2.49,2.49-6.52,0-9.01l-23.59-23.59c-2.49-2.49-6.52-2.49-9.01,0l-3.65,3.65c-7.1-19.43-2.91-42.09,12.66-57.66l15.1-15.1,7.29,7.29c2.49,2.49,6.52,2.49,9.01,0l23.59-23.59c2.49-2.49,2.49-6.52,0-9.01L241.86,1.87c-2.49-2.49-6.52-2.49-9.01,0l-23.59,23.59c-2.49,2.49-2.49,6.52,0,9.01l7.29,7.29-15.1,15.1c-15.98,15.98-22.22,38.03-18.81,58.79l-45.57-45.57c4.58-8.49,3.39-19.3-3.77-26.47-8.74-8.74-22.97-8.74-31.7,0-8.74,8.74-8.74,22.96,0,31.7,7.17,7.17,17.98,8.35,26.47,3.77l57.09,57.09-7.29,7.29ZM309.38,116.56l14.58-14.58,14.58,14.58-14.58,14.58-14.58-14.58ZM222.77,29.95l14.58-14.58,14.58,14.58-14.58,14.58-14.58-14.58ZM191.38,147.95l14.58-14.58,14.58,14.58-14.58,14.58-14.58-14.58ZM297.18,225.48c3.77,3.77,3.78,9.92,0,13.69-3.78,3.78-9.92,3.77-13.69,0-3.77-3.77-3.78-9.92,0-13.69,3.78-3.78,9.92-3.77,13.69,0ZM110.61,66.29c-3.78-3.78-3.78-9.92,0-13.69s9.92-3.77,13.69,0,3.78,9.92,0,13.69-9.92,3.77-13.69,0Z"/>
                <path d="M14.1,230.69l10.2-.02c7.27-.02,13.92,4.12,17.11,10.64,14.86,29.89,39.08,54.12,68.99,68.99,6.52,3.21,10.65,9.85,10.64,17.11v10.2c0,2.79,1.82,5.27,4.49,6.09,34.41,10.69,71.26,10.68,105.68,0,2.67-.82,4.49-3.3,4.49-6.09v-10.2c-.02-7.27,4.12-13.92,10.64-17.11,14.98-7.45,28.53-17.25,40.2-28.94.03-.03.08-.06.11-.09,2.49-2.49,2.49-6.52,0-9.01L79.45,65.05c-2.49-2.49-6.52-2.49-9.01,0-.04.04-.07.09-.11.13-11.69,11.67-21.49,25.22-28.94,40.21-3.2,6.51-9.83,10.62-17.09,10.64h-10.2c-2.79,0-5.27,1.82-6.09,4.49-10.69,34.41-10.68,71.26,0,105.68.82,2.67,3.3,4.49,6.09,4.49ZM222.92,327.43h0v5.39c-29.15,8.19-59.99,8.18-89.15.02v-5.39c-.01-2.78-.36-5.55-1.09-8.22,29.73,9.23,61.58,9.23,91.3-.02-.7,2.67-1.06,5.44-1.07,8.22ZM236.88,240.49c-35.02,30.59-88.21,29.29-121.58-4.08-33.32-33.39-34.62-86.53-4.07-121.57l31.47,31.47c-1.82,2.41-3.42,4.98-4.73,7.75h-17.03c-10.55,0-19.1,8.55-19.1,19.1s8.55,19.1,19.1,19.1h17.03c4.39,9.31,11.87,16.79,21.18,21.18v17.03c.01,10.54,8.56,19.09,19.1,19.1,10.55,0,19.1-8.55,19.1-19.1v-17.03c2.76-1.31,5.34-2.91,7.74-4.73l31.78,31.78ZM188.87,203.17c-2.54.9-4.25,3.31-4.25,6v21.3c0,3.52-2.85,6.37-6.37,6.37-3.51.01-6.37-2.85-6.37-6.37h0s0-21.3,0-21.3c0-2.7-1.7-5.1-4.25-6-9.05-3.24-16.17-10.35-19.41-19.41-.9-2.54-3.31-4.25-6-4.24h-21.3c-3.52,0-6.37-2.85-6.37-6.37s2.85-6.37,6.37-6.37h21.3c2.7,0,5.1-1.7,6-4.24.91-2.53,2.14-4.89,3.62-7.08l13.75,13.75c-1.26,4.63-.14,9.77,3.5,13.41,3.64,3.64,8.78,4.76,13.41,3.5l13.42,13.42c-2.18,1.47-4.54,2.71-7.07,3.62ZM75.1,78.71l27.04,27.04c-35.57,40.01-34.19,101.32,4.15,139.67,38.38,38.29,99.62,39.66,139.66,4.15l27.05,27.05c-54.97,50.47-140.45,49.09-193.73-4.19-53.2-53.31-54.58-138.72-4.18-193.73ZM18.88,128.8h0s5.39,0,5.39,0c2.78-.01,5.55-.36,8.22-1.09-9.23,29.73-9.23,61.58.02,91.3-2.69-.72-5.44-1.08-8.22-1.07h-5.39c-8.19-29.15-8.18-59.99-.02-89.15Z"/>
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

