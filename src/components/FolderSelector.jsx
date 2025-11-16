import React, { useState, useEffect } from 'react';

/**
 * Folder Selector Component
 * Allows user to browse and select their root folder
 */
export const FolderSelector = ({ accessToken, onFolderSelected }) => {
  const [folders, setFolders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentFolder, setCurrentFolder] = useState(null);
  const [pathStack, setPathStack] = useState([{ id: 'root', name: 'My Drive' }]);

  useEffect(() => {
    loadFolders(pathStack[pathStack.length - 1].id);
  }, [pathStack.length]);

  const loadFolders = async (folderId) => {
    setLoading(true);
    setError(null);

    try {
      const query = folderId === 'root' 
        ? `'root' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false`
        : `'${folderId}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false`;
      
      const fields = 'files(id,name,mimeType)';
      const url = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=${encodeURIComponent(fields)}&orderBy=name`;

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to load folders');
      }

      const data = await response.json();
      setFolders(data.files || []);
    } catch (err) {
      console.error('Error loading folders:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFolderClick = (folder) => {
    setPathStack([...pathStack, { id: folder.id, name: folder.name }]);
  };

  const handleBreadcrumbClick = (index) => {
    setPathStack(pathStack.slice(0, index + 1));
  };

  const handleSelectFolder = () => {
    const currentPath = pathStack[pathStack.length - 1];
    onFolderSelected(currentPath.id, currentPath.name);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-3xl w-full p-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Select Your STL Folder</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Choose the Google Drive folder containing your STL files. You can change this later in settings.
          </p>
        </div>

        {/* Breadcrumbs */}
        <div className="mb-4 flex items-center gap-2 text-sm">
          {pathStack.map((folder, index) => (
            <React.Fragment key={folder.id}>
              {index > 0 && (
                <svg className="w-4 h-4 text-gray-400 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              )}
              <button
                onClick={() => handleBreadcrumbClick(index)}
                className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium"
              >
                {folder.name}
              </button>
            </React.Fragment>
          ))}
        </div>

        {/* Current folder info */}
        {pathStack.length > 1 && (
          <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <p className="text-sm text-blue-800 dark:text-blue-300">
              <strong>Current selection:</strong> {pathStack[pathStack.length - 1].name}
            </p>
          </div>
        )}

        {/* Error display */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
          </div>
        )}

        {/* Folder list */}
        <div className="border dark:border-gray-700 rounded-lg max-h-96 overflow-y-auto mb-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : folders.length === 0 ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              <svg className="w-16 h-16 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
              <p>No folders in this location</p>
            </div>
          ) : (
            <div className="divide-y dark:divide-gray-700">
              {folders.map((folder) => (
                <button
                  key={folder.id}
                  onClick={() => handleFolderClick(folder)}
                  className="w-full flex items-center gap-3 p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left"
                >
                  <svg className="w-8 h-8 text-blue-500 dark:text-blue-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
                  </svg>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 dark:text-white truncate">{folder.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Click to browse inside</p>
                  </div>
                  <svg className="w-5 h-5 text-gray-400 dark:text-gray-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleSelectFolder}
            disabled={pathStack.length === 1}
            className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {pathStack.length === 1 ? 'Select a folder to continue' : `Use "${pathStack[pathStack.length - 1].name}"`}
          </button>
        </div>

        <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-4">
          You can select any folder that contains your STL files
        </p>
      </div>
    </div>
  );
};

