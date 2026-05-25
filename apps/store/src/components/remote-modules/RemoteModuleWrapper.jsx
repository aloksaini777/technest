import React, { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';



const SilentFallback = () => null;
export const SilentRemoteModuleWrapper = ({
  children,
  onError,
}) => {
  return (
    <ErrorBoundary
      FallbackComponent={SilentFallback}
      onError={onError}
      onReset={() => {}}
    >
      <Suspense fallback={null}>
          {children}
      </Suspense>
    </ErrorBoundary>
  );
};


