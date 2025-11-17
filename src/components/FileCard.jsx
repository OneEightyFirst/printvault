import React from 'react';
import { ImageThumbnail } from './ImageThumbnail';
import { useFindFolderPreviewImage } from '../hooks/useFindFolderPreviewImage';
import { useSTLPreviewImage } from '../hooks/useSTLPreviewImage';
import { formatFileSize, formatDate } from '../utils/pathUtils';
import { isSTL } from '../utils/mimeUtils';

/**
 * File or folder card component
 */
export const FileCard = ({ file, onClick, accessToken, parentFolderId, isFolder }) => {
  // For folders: find preview image in folder
  const { imageFileId } = useFindFolderPreviewImage(
    isFolder ? file.id : null,
    file.name,
    parentFolderId,
    accessToken
  );
  
  // Use previewImageId from file data or fallback to hook result
  const folderPreviewId = file.previewImageId || imageFileId;

  // For STL files: find matching preview image in same folder
  const { previewImageId: stlPreviewId } = useSTLPreviewImage(
    !isFolder && isSTL(file.name) ? file : null,
    parentFolderId,
    accessToken
  );

  const renderIcon = () => {
    if (isFolder) {
      // Folder with preview image
      if (folderPreviewId) {
        return (
          <ImageThumbnail
            fileId={folderPreviewId}
            fileName={file.name}
            accessToken={accessToken}
            className="w-full h-48 object-cover"
          />
        );
      }
      
      // Folder placeholder
      return (
        <div className="w-full h-48 bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
          <svg className="w-20 h-20 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
            <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
          </svg>
        </div>
      );
    }

    if (file.mimeType?.startsWith('image/')) {
      // Image file
      return (
        <ImageThumbnail
          fileId={file.id}
          fileName={file.name}
          accessToken={accessToken}
          className="w-full h-48 object-cover"
        />
      );
    }

    if (isSTL(file.name)) {
      // STL file - check for preview image first
      if (stlPreviewId) {
        return (
          <div className="relative w-full h-48">
            <ImageThumbnail
              fileId={stlPreviewId}
              fileName={file.name}
              accessToken={accessToken}
              className="w-full h-48 object-cover"
            />
            {/* STL indicator badge */}
            <div className="absolute bottom-2 right-2 px-2 py-1 bg-purple-600 text-white text-xs font-medium rounded shadow-lg flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" />
              </svg>
              STL
            </div>
          </div>
        );
      }
      
      // No preview found - show generic STL icon
      return (
        <div className="w-full h-48 bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center">
          <svg className="w-20 h-20 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" />
          </svg>
        </div>
      );
    }

    // Generic file
    return (
      <div className="w-full h-48 bg-gray-100 flex items-center justify-center">
        <svg className="w-20 h-20 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      </div>
    );
  };

  return (
    <div
      className="bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden group relative"
    >
      <div className="relative overflow-hidden cursor-pointer" onClick={onClick}>
        {renderIcon()}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-opacity" />
      </div>
      
      <div className="p-4">
        <h3 className="font-medium text-gray-900 dark:text-white truncate cursor-pointer" title={file.name} onClick={onClick}>
          {file.name}
        </h3>
        
        {!isFolder && (
          <div className="mt-1 text-sm text-gray-500 dark:text-gray-400 flex items-center justify-between">
            {file.size && <span>{formatFileSize(file.size)}</span>}
            {file.modifiedTime && <span className="text-xs">{formatDate(file.modifiedTime)}</span>}
          </div>
        )}
      </div>
    </div>
  );
};

