import React from 'react';

/**
 * Breadcrumb navigation component
 * Shows the current path and allows navigation to parent folders
 */
export const Breadcrumbs = ({ pathStack, onNavigate }) => {
  if (!pathStack || pathStack.length === 0) {
    return null;
  }

  return (
    <nav className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 mb-6 overflow-x-auto">
      {pathStack.map((item, index) => (
        <React.Fragment key={item.id}>
          {index > 0 && (
            <span className="text-gray-400 dark:text-gray-600">/</span>
          )}
          <button
            onClick={() => onNavigate(index)}
            className={`hover:text-blue-600 dark:hover:text-blue-400 hover:underline transition-colors whitespace-nowrap ${
              index === pathStack.length - 1
                ? 'font-semibold text-gray-900 dark:text-white'
                : 'text-gray-600 dark:text-gray-400'
            }`}
            disabled={index === pathStack.length - 1}
          >
            {item.name}
          </button>
        </React.Fragment>
      ))}
    </nav>
  );
};

