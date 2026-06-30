'use client'; // Error components must be Client Components

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] p-8 text-center bg-destructive/10 rounded-xl m-8 border border-destructive/20">
      <h2 className="text-2xl font-bold text-destructive mb-4">Something went wrong!</h2>
      <div className="bg-background p-4 rounded-lg w-full max-w-2xl overflow-auto text-left mb-6 shadow-sm border">
        <p className="font-mono text-sm text-foreground break-words">{error.message}</p>
        {error.digest && <p className="font-mono text-xs text-muted-foreground mt-2">Digest: {error.digest}</p>}
        {error.stack && <pre className="font-mono text-xs text-muted-foreground mt-4 overflow-x-auto whitespace-pre-wrap">{error.stack}</pre>}
      </div>
      <button
        className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
        onClick={
          // Attempt to recover by trying to re-render the segment
          () => reset()
        }
      >
        Try again
      </button>
    </div>
  );
}
