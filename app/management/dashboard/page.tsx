'use client';

import { useState, useEffect } from 'react';

export default function ManagementDashboard() {
  // Safe mounting pattern to completely avoid Next.js hydration errors
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Don't render the UI until the client has hydrated
  if (!isMounted) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="animate-pulse w-8 h-8 rounded-full bg-emerald-500/50"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-950 text-zinc-200 font-sans p-4">
      <div className="max-w-md text-center space-y-6">
        
        {/* Radar Ping Animation */}
        <div className="relative flex h-16 w-16 mx-auto">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-20"></span>
          <span className="relative inline-flex rounded-full h-16 w-16 bg-emerald-500/10 border border-emerald-500/50 items-center justify-center">
            <svg className="w-8 h-8 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </span>
        </div>

        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Management Dashboard</h1>
          <p className="mt-3 text-zinc-400 leading-relaxed">
            Welcome to the command center. The Intelligent Proxy successfully verified your tokens and routed you here.
          </p>
        </div>

        <div className="pt-8 mt-8 border-t border-zinc-800/50">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium">
            <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
            Client-Side Connection Secure
          </div>
        </div>

      </div>
    </div>
  );
}