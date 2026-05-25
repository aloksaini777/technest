import React from 'react';

export const createRemoteModule = (importFn, moduleName = 'Remote Module') => {
  return React.lazy(() =>
    importFn()
      .catch((error) => {
        console.error(`Failed to load ${moduleName}:`, error);
        
        // Return a component that throws error for ErrorBoundary to catch
        return {
          default: () => {
            throw new Error(
              `Unable to load ${moduleName}. The remote service may be unavailable.`
            );
          }
        };
      })
  );
};
