import React from 'react';
import { FileCard } from './FileCard';

/**
 * Grid layout for folders and files
 */
export const FolderGrid = ({ 
  folders = [], 
  images = [], 
  stlFiles = [], 
  onFolderClick, 
  onImageClick, 
  onSTLClick,
  accessToken,
  currentFolderId,
  loading 
}) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
            <div className="w-full h-48 bg-gray-200 dark:bg-gray-700 animate-pulse" />
            <div className="p-4">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  const hasContent = folders.length > 0 || images.length > 0 || stlFiles.length > 0;

  if (!hasContent) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-gray-500 dark:text-gray-400">
        <svg className="w-16 h-16 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
        </svg>
        <p className="text-lg">This folder is empty</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Folders section */}
      {folders.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
            Folders ({folders.length})
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {folders.map(folder => (
              <FileCard
                key={folder.id}
                file={folder}
                onClick={() => onFolderClick(folder.id, folder.name)}
                accessToken={accessToken}
                parentFolderId={currentFolderId}
                isFolder={true}
              />
            ))}
          </div>
        </section>
      )}

      {/* STL files section */}
      {stlFiles.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
            STL Files ({stlFiles.length})
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {stlFiles.map(file => (
              <FileCard
                key={file.id}
                file={file}
                onClick={() => onSTLClick(file)}
                accessToken={accessToken}
                parentFolderId={currentFolderId}
                isFolder={false}
              />
            ))}
          </div>
        </section>
      )}

      {/* Images section */}
      {images.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
            Images ({images.length})
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {images.map(image => (
              <FileCard
                key={image.id}
                file={image}
                onClick={() => onImageClick(image)}
                accessToken={accessToken}
                parentFolderId={currentFolderId}
                isFolder={false}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

