import React, { useState } from 'react';

/**
 * ShareModal Component
 * Allows users to share files/folders via public or private links
 */
export const ShareModal = ({ 
  isOpen, 
  onClose, 
  item, 
  itemType, // 'folder', 'stl', 'image'
  onCreatePublicLink,
  onCreatePrivateLink,
  accessToken 
}) => {
  const [mode, setMode] = useState(null); // null, 'public', 'private'
  const [expiryMinutes, setExpiryMinutes] = useState(30);
  const [shareLink, setShareLink] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [copySuccess, setCopySuccess] = useState(false);

  if (!isOpen) return null;

  const expiryOptions = [
    { label: '15 minutes', value: 15 },
    { label: '1 hour', value: 60 },
    { label: '24 hours', value: 1440 },
  ];

  const handleCreatePublicLink = async () => {
    setLoading(true);
    setError(null);
    try {
      const link = await onCreatePublicLink(item.id, itemType);
      setShareLink(link);
      setMode('public');
    } catch (err) {
      setError(err.message || 'Failed to create public link');
      console.error('Public link error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePrivateLink = async () => {
    setLoading(true);
    setError(null);
    try {
      const link = await onCreatePrivateLink(item.id, itemType, expiryMinutes);
      setShareLink(link);
      setMode('private');
    } catch (err) {
      setError(err.message || 'Failed to create private link');
      console.error('Private link error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareLink);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleClose = () => {
    setMode(null);
    setShareLink(null);
    setError(null);
    setCopySuccess(false);
    onClose();
  };

  const getItemIcon = () => {
    if (itemType === 'folder') {
      return (
        <svg className="w-6 h-6 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
          <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
        </svg>
      );
    }
    if (itemType === 'stl') {
      return (
        <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" />
        </svg>
      );
    }
    return (
      <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b dark:border-gray-700">
          <div className="flex items-center gap-3">
            {getItemIcon()}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Share</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 truncate max-w-xs" title={item?.name}>
                {item?.name}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Error message */}
          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
            </div>
          )}

          {/* Share link result */}
          {shareLink && (
            <div className="space-y-3">
              <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <p className="text-green-800 dark:text-green-300 text-sm font-medium mb-2">
                  {mode === 'public' ? '✓ Public Link Created' : '✓ Private Link Created'}
                </p>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={shareLink}
                    readOnly
                    className="flex-1 px-3 py-2 bg-white dark:bg-gray-900 border border-green-300 dark:border-green-700 rounded text-sm font-mono text-gray-900 dark:text-white"
                  />
                  <button
                    onClick={handleCopyToClipboard}
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors text-sm font-medium whitespace-nowrap"
                  >
                    {copySuccess ? '✓ Copied' : 'Copy'}
                  </button>
                </div>
                {mode === 'private' && (
                  <p className="text-green-700 dark:text-green-400 text-xs mt-2">
                    This link will expire in {expiryMinutes >= 60 ? `${expiryMinutes / 60} hour${expiryMinutes / 60 > 1 ? 's' : ''}` : `${expiryMinutes} minutes`}
                  </p>
                )}
              </div>
              <button
                onClick={handleClose}
                className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-medium"
              >
                Done
              </button>
            </div>
          )}

          {/* Sharing options */}
          {!shareLink && (
            <>
              {/* Public Link Option */}
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-blue-300 dark:hover:border-blue-600 transition-colors">
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Public Link</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      Anyone with the link can access this {itemType}. This will make the file public on Google Drive.
                    </p>
                    <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded text-xs text-yellow-800 dark:text-yellow-300 mb-3">
                      ⚠️ <strong>Warning:</strong> This will permanently change the Drive permissions to "Anyone with the link can view"
                    </div>
                    <button
                      onClick={handleCreatePublicLink}
                      disabled={loading}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? 'Creating...' : 'Create Public Link'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Private Link Option */}
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-purple-300 dark:hover:border-purple-600 transition-colors">
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Temporary Private Link</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      Create a temporary link that expires after a set time. File remains private on Google Drive.
                    </p>
                    
                    {/* Expiry selector */}
                    <div className="mb-3">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Link expires in:
                      </label>
                      <select
                        value={expiryMinutes}
                        onChange={(e) => setExpiryMinutes(Number(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                      >
                        {expiryOptions.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <button
                      onClick={handleCreatePrivateLink}
                      disabled={loading}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? 'Creating...' : 'Create Private Link'}
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

