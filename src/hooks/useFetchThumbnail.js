import { useState, useEffect } from 'react';
import { getThumbnailUrl } from '../api/unifiedDriveApi';
import { cache } from '../utils/cache';

/**
 * Hook to fetch and cache thumbnails
 * Automatically uses the right API (direct or proxy) based on access token
 */
export const useFetchThumbnail = (fileId, accessToken) => {
  const [thumbnailUrl, setThumbnailUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!fileId || !accessToken) {
      setLoading(false);
      return;
    }

    const fetchThumbnail = async () => {
      // Check cache first
      if (cache.hasThumbnail(fileId)) {
        setThumbnailUrl(cache.getThumbnail(fileId));
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const url = await getThumbnailUrl(fileId, accessToken);
        console.log('Thumbnail URL for', fileId, ':', url); // DEBUG
        
        if (url) {
          cache.setThumbnail(fileId, url);
          setThumbnailUrl(url);
        }
      } catch (err) {
        console.error('Error fetching thumbnail:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchThumbnail();
  }, [fileId, accessToken]);

  return { thumbnailUrl, loading, error };
};

