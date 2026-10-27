import React from "react";

export default function DashboardLoading() {
  return (
    <div className="p-6 md:p-10 w-full min-h-full flex flex-col gap-8 animate-in fade-in duration-500">
      
      {/* =====================================================================
          1. THE GPU SHIMMER ENGINE
          =====================================================================
          We inject this pure CSS to ensure the hardware-accelerated linear gradient
          works instantly without requiring you to touch tailwind.config.ts.
      */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes holographic-shimmer {
          100% { transform: translateX(100%); }
        }
        .shimmer {
          position: relative;
          overflow: hidden;
          background-color: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.05);
        }
        .shimmer::after {
          content: '';
          position: absolute;
          top: 0;
          right: 0;
          bottom: 0;
          left: 0;
          transform: translateX(-100%);
          background-image: linear-gradient(
            90deg,
            rgba(255, 255, 255, 0) 0%,
            rgba(255, 255, 255, 0.08) 50%,
            rgba(255, 255, 255, 0) 100%
          );
          animation: holographic-shimmer 2s infinite cubic-bezier(0.4, 0.0, 0.2, 1);
        }
      `}} />

      {/* =====================================================================
          2. HEADER SKELETON (Semantic Shapes)
          ===================================================================== */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-4 w-full md:w-1/2">
          {/* Greeting Text Placeholder */}
          <div className="h-10 md:h-12 w-3/4 max-w-[400px] rounded-xl shimmer" />
          {/* Role/Connection Pill Placeholder */}
          <div className="flex gap-3">
            <div className="h-6 w-24 rounded-full shimmer" />
            <div className="h-6 w-32 rounded-full shimmer" />
          </div>
        </div>
        {/* Clock Placeholder */}
        <div className="hidden md:block h-12 w-32 rounded-xl shimmer" />
      </div>

      {/* =====================================================================
          3. TELEMETRY GRID SKELETON
          ===================================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((item) => (
          <div key={item} className="h-[150px] rounded-[1.5rem] shimmer p-6 flex flex-col justify-between">
            <div className="flex justify-between items-start">
              {/* Icon Circle */}
              <div className="w-10 h-10 rounded-xl shimmer bg-white/5" />
              {/* Status Badge */}
              <div className="w-12 h-6 rounded-lg shimmer bg-white/5" />
            </div>
            <div className="space-y-2 mt-4">
              {/* Label */}
              <div className="h-3 w-24 rounded-md shimmer bg-white/5" />
              {/* Big Number */}
              <div className="h-8 w-16 rounded-lg shimmer bg-white/5" />
            </div>
          </div>
        ))}
      </div>

      {/* =====================================================================
          4. MAIN ACTION AREA SKELETON
          ===================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Queue Skeleton (Left, 2 columns) */}
        <div className="lg:col-span-2 rounded-[1.5rem] shimmer p-6 h-[400px]">
          {/* Section Title */}
          <div className="h-6 w-48 rounded-lg shimmer bg-white/5 mb-6" />
          {/* Queue Items */}
          <div className="space-y-4">
            {[1, 2, 3].map((item) => (
              <div key={item} className="flex items-center justify-between p-4 rounded-2xl border border-white/5 bg-black/20">
                <div className="flex items-center gap-4">
                  {/* Avatar */}
                  <div className="w-12 h-12 rounded-xl shimmer bg-white/5" />
                  <div className="space-y-2">
                    {/* Text lines */}
                    <div className="h-4 w-40 md:w-64 rounded-md shimmer bg-white/5" />
                    <div className="h-3 w-24 rounded-md shimmer bg-white/5" />
                  </div>
                </div>
                {/* Button Placeholder */}
                <div className="w-20 h-9 rounded-xl shimmer bg-white/5 hidden sm:block" />
              </div>
            ))}
          </div>
        </div>

        {/* Logs Skeleton (Right, 1 column) */}
        <div className="rounded-[1.5rem] shimmer p-6 h-[400px]">
          {/* Section Title */}
          <div className="h-6 w-32 rounded-lg shimmer bg-white/5 mb-6" />
          {/* Log Items */}
          <div className="space-y-6 mt-2">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="flex gap-4">
                {/* Dot */}
                <div className="w-8 h-8 rounded-full shimmer bg-white/5 shrink-0" />
                <div className="space-y-2 w-full">
                  {/* Log Text */}
                  <div className="h-4 w-full rounded-md shimmer bg-white/5" />
                  <div className="h-3 w-1/2 rounded-md shimmer bg-white/5" />
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}