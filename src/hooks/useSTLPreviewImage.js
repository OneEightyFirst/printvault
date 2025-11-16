import { useState, useEffect } from 'react';
import { canSearchFiles } from '../api/unifiedDriveApi';

/**
 * Hook to find a preview image for an STL file
 * Looks for images with matching names in the same folder
 */
export const useSTLPreviewImage = (file, parentFolderId, accessToken) => {
  const [previewImageId, setPreviewImageId] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Disable if can't search files (e.g., preview mode)
    if (!file || !file.name.toLowerCase().endsWith('.stl') || !parentFolderId || !accessToken || !canSearchFiles(accessToken)) {
      return;
    }

    const findPreviewImage = async () => {
      setLoading(true);
      try {
        // Get base name without .stl extension
        const baseName = file.name.slice(0, -4);
        
        // Build search patterns
        const patterns = [
          `${baseName}.png`,
          `${baseName}.jpg`,
          `${baseName}.jpeg`,
          `${baseName}_preview.png`,
          `${baseName}_preview.jpg`,
          `${baseName}_thumbnail.png`,
          `${baseName}_thumbnail.jpg`,
        ];

        // Search for matching images in the same folder
        const query = `'${parentFolderId}' in parents and trashed = false and mimeType contains 'image/'`;
        const fields = 'files(id,name,mimeType)';
        const url = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=${encodeURIComponent(fields)}`;

        const response = await fetch(url, {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          const images = data.files || [];
          
          // Look for exact match first
          for (const pattern of patterns) {
            const match = images.find(img => 
              img.name.toLowerCase() === pattern.toLowerCase()
            );
            if (match) {
              setPreviewImageId(match.id);
              return;
            }
          }
        }
      } catch (error) {
        console.error('Error finding STL preview:', error);
      } finally {
        setLoading(false);
      }
    };

    findPreviewImage();
  }, [file?.id, parentFolderId, accessToken]);

  return { previewImageId, loading };
};

