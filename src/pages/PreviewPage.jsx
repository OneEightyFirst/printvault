import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { validateShareToken, fetchSharedFile, fetchSharedFolder } from '../api/driveShare';
import { STLViewer } from '../components/STLViewer';

/**
 * Public Preview Page
 * Displays shared files/folders without requiring login
 */
export const PreviewPage = () => {
  const { token } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tokenData, setTokenData] = useState(null);
  const [fileBlob, setFileBlob] = useState(null);
  const [folderContents, setFolderContents] = useState(null);

  useEffect(() => {
    if (token) {
      loadPreview();
    }
  }, [token]);

  const loadPreview = async () => {
    setLoading(true);
    setError(null);

    try {
      // Validate the token first
      const validation = await validateShareToken(token);
      setTokenData(validation);

      // Based on item type, load the appropriate content
      if (validation.itemType === 'folder') {
        await loadFolderContents();
      } else {
        await loadFile();
      }
    } catch (err) {
      console.error('Preview load error:', err);
      setError(err.message || 'Failed to load preview');
    } finally {
      setLoading(false);
    }
  };

  const loadFile = async () => {
    try {
      const response = await fetchSharedFile(token);
      const blob = await response.blob();
      setFileBlob(blob);
    } catch (err) {
      throw new Error('Failed to load file: ' + err.message);
    }
  };

  const loadFolderContents = async () => {
    try {
      const contents = await fetchSharedFolder(token);
      setFolderContents(contents);
    } catch (err) {
      throw new Error('Failed to load folder: ' + err.message);
    }
  };

  const handleViewFile = async (fileId, itemType) => {
    // For folder contents, we need to create a temporary token for each file
    // This would require another API call - for now, show a message
    alert('Direct file viewing from shared folders coming soon!');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading preview...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
          <div className="text-center">
            <svg className="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {error.includes('expired') ? 'Link Expired' : 'Error Loading Preview'}
            </h2>
            <p className="text-gray-600 mb-6">{error}</p>
            {error.includes('expired') && (
              <p className="text-sm text-gray-500">
                This link has expired. Please request a new link from the owner.
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Render based on item type
  if (tokenData?.itemType === 'image' && fileBlob) {
    return <ImagePreview blob={fileBlob} tokenData={tokenData} />;
  }

  if (tokenData?.itemType === 'stl' && fileBlob) {
    return <STLPreview blob={fileBlob} tokenData={tokenData} />;
  }

  if (tokenData?.itemType === 'folder' && folderContents) {
    return <FolderPreview contents={folderContents} tokenData={tokenData} onViewFile={handleViewFile} />;
  }

  return null;
};

/**
 * Image Preview Component
 */
const ImagePreview = ({ blob, tokenData }) => {
  const [imageUrl, setImageUrl] = useState(null);

  useEffect(() => {
    const url = URL.createObjectURL(blob);
    setImageUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [blob]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <svg className="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" />
            </svg>
            <div>
              <h1 className="text-xl font-bold text-gray-900">PrintVault</h1>
              <p className="text-xs text-gray-500">Shared Image</p>
            </div>
          </div>
        </div>
      </div>

      {/* Image Display */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="flex items-center justify-center bg-gray-100" style={{ minHeight: '60vh' }}>
            {imageUrl && (
              <img 
                src={imageUrl} 
                alt="Shared image" 
                className="max-w-full max-h-[80vh] object-contain"
              />
            )}
          </div>
          <div className="p-4 border-t">
            <p className="text-sm text-gray-500">
              This link expires: {new Date(tokenData.expiresAt).toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * STL Preview Component
 */
const STLPreview = ({ blob, tokenData }) => {
  const [stlBuffer, setStlBuffer] = useState(null);

  useEffect(() => {
    blob.arrayBuffer().then(buffer => {
      setStlBuffer(buffer);
    });
  }, [blob]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <svg className="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" />
            </svg>
            <div>
              <h1 className="text-xl font-bold text-gray-900">PrintVault</h1>
              <p className="text-xs text-gray-500">Shared STL Model</p>
            </div>
          </div>
        </div>
      </div>

      {/* STL Viewer */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {stlBuffer && (
            <div style={{ height: '70vh' }}>
              <STLViewer stlData={stlBuffer} />
            </div>
          )}
          <div className="p-4 border-t">
            <p className="text-sm text-gray-500">
              This link expires: {new Date(tokenData.expiresAt).toLocaleString()}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Use mouse to rotate (left button), zoom (scroll), and pan (right button)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Folder Preview Component
 */
const FolderPreview = ({ contents, tokenData, onViewFile }) => {
  const { folders, images, stlFiles } = contents;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <svg className="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" />
            </svg>
            <div>
              <h1 className="text-xl font-bold text-gray-900">PrintVault</h1>
              <p className="text-xs text-gray-500">Shared Folder</p>
            </div>
          </div>
        </div>
      </div>

      {/* Folder Contents */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="mb-6">
            <p className="text-sm text-gray-500">
              This link expires: {new Date(tokenData.expiresAt).toLocaleString()}
            </p>
          </div>

          <div className="space-y-8">
            {/* Folders */}
            {folders && folders.length > 0 && (
              <section>
                <h2 className="text-lg font-semibold text-gray-800 mb-4">
                  Folders ({folders.length})
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {folders.map(folder => (
                    <div key={folder.id} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                      <div className="flex items-center gap-3">
                        <svg className="w-8 h-8 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
                        </svg>
                        <span className="font-medium text-gray-900 truncate">{folder.name}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* STL Files */}
            {stlFiles && stlFiles.length > 0 && (
              <section>
                <h2 className="text-lg font-semibold text-gray-800 mb-4">
                  STL Files ({stlFiles.length})
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {stlFiles.map(file => (
                    <div key={file.id} className="border border-gray-200 rounded-lg p-4 hover:border-purple-300 transition-colors">
                      <div className="flex items-center gap-3">
                        <svg className="w-8 h-8 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" />
                        </svg>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate">{file.name}</p>
                          {file.size && (
                            <p className="text-xs text-gray-500">
                              {(file.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Images */}
            {images && images.length > 0 && (
              <section>
                <h2 className="text-lg font-semibold text-gray-800 mb-4">
                  Images ({images.length})
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                  {images.map(image => (
                    <div key={image.id} className="border border-gray-200 rounded-lg p-4 hover:border-green-300 transition-colors">
                      <div className="flex flex-col items-center gap-2">
                        <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <p className="text-xs text-gray-900 truncate w-full text-center">{image.name}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Empty state */}
            {(!folders || folders.length === 0) && 
             (!stlFiles || stlFiles.length === 0) && 
             (!images || images.length === 0) && (
              <div className="text-center py-12 text-gray-500">
                <svg className="w-16 h-16 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                </svg>
                <p>This folder is empty</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

