'use client';

import { AlertTriangle } from 'lucide-react';
import Link from 'next/link';

export default function UserDetailError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-20 space-y-4">
      <AlertTriangle className="w-12 h-12 text-amber-400" />
      <h2 className="text-lg font-semibold text-white">Something went wrong</h2>
      <p className="text-sm text-red-400 max-w-lg text-center font-mono bg-red-500/10 border border-red-500/20 rounded-xl p-4">
        {error.message}
      </p>
      {error.stack && (
        <details className="text-xs text-muted max-w-lg">
          <summary className="cursor-pointer hover:text-white">Stack trace</summary>
          <pre className="mt-2 p-3 bg-card border border-border rounded-xl overflow-x-auto whitespace-pre-wrap">
            {error.stack}
          </pre>
        </details>
      )}
      <div className="flex gap-3">
        <button
          onClick={reset}
          className="px-4 py-2 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary/80 transition-colors"
        >
          Try again
        </button>
        <Link
          href="/users"
          className="px-4 py-2 rounded-xl bg-card border border-border text-muted text-sm font-medium hover:text-white transition-colors"
        >
          Back to Users
        </Link>
      </div>
    </div>
  );
}
