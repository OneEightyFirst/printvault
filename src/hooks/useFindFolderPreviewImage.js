import { useState, useEffect } from 'react';
import { listChildren, findFirstImageRecursive } from '../api/googleDrive';
import { cache } from '../utils/cache';
import { canSearchFiles } from '../api/unifiedDriveApi';

/**
 * Hook to find preview image for a folder
 * Implements the fallback logic:
 * 1. Look for CreatorName.jpg/png in parent folder
 * 2. Recursively search inside the folder for first image
 * 3. Return null if no image found (will use placeholder)
 */
export const useFindFolderPreviewImage = (folderId, folderName, parentFolderId, accessToken) => {
  const [imageFileId, setImageFileId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Disable if can't search files (e.g., preview mode)
    if (!folderId || !accessToken || !canSearchFiles(accessToken)) {
      setLoading(false);
      return;
    }

    const findPreviewImage = async () => {
      // Check cache first
      if (cache.hasFolderImage(folderId)) {
        setImageFileId(cache.getFolderImage(folderId));
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // Step 1: Look for matching image in parent folder
        if (parentFolderId) {
          const { images } = await listChildren(parentFolderId, accessToken);
          
          // Look for CreatorName.jpg, CreatorName.png, etc.
          const folderNameLower = folderName.toLowerCase();
          const matchingImage = images.find(img => {
            const imgNameLower = img.name.toLowerCase();
            const nameWithoutExt = imgNameLower.substring(0, imgNameLower.lastIndexOf('.'));
            return nameWithoutExt === folderNameLower;
          });

          if (matchingImage) {
            cache.setFolderImage(folderId, matchingImage.id);
            setImageFileId(matchingImage.id);
            setLoading(false);
            return;
          }
        }

        // Step 2: Recursively search inside the folder
        const foundImage = await findFirstImageRecursive(folderId, accessToken);
        
        if (foundImage) {
          cache.setFolderImage(folderId, foundImage.id);
          setImageFileId(foundImage.id);
        } else {
          // No image found, cache null to avoid repeated searches
          cache.setFolderImage(folderId, null);
          setImageFileId(null);
        }
      } catch (err) {
        console.error('Error finding folder preview image:', err);
        setError(err.message);
        // Cache null on error to avoid repeated failed attempts
        cache.setFolderImage(folderId, null);
      } finally {
        setLoading(false);
      }
    };

    findPreviewImage();
  }, [folderId, folderName, parentFolderId, accessToken]);

  return { imageFileId, loading, error };
};

