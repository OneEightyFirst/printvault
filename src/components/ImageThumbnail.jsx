import React from 'react';
import { useFetchThumbnail } from '../hooks/useFetchThumbnail';

/**
 * Image thumbnail component with loading state
 */
export const ImageThumbnail = ({ fileId, fileName, accessToken, className = '' }) => {
  const { thumbnailUrl, loading, error } = useFetchThumbnail(fileId, accessToken);

  if (loading) {
    return (
      <div className={`bg-gray-200 animate-pulse rounded ${className}`}>
        <div className="w-full h-full flex items-center justify-center">
          <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
      </div>
    );
  }

  if (error || !thumbnailUrl) {
    return (
      <div className={`bg-gray-100 rounded flex items-center justify-center ${className}`}>
        <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
    );
  }

  return (
    <img
      src={thumbnailUrl}
      alt={fileName}
      className={`object-cover rounded ${className}`}
      loading="lazy"
    />
  );
};

