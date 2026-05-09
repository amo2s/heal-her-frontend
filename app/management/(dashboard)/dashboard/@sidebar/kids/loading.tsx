export default function KidsDashboardSkeleton() {
  return (
    <div className="p-6 md:p-10 w-full h-full flex flex-col gap-6 w-full max-w-7xl mx-auto">
      
      {/* =====================================================================
          1. THE SENTINEL BAR (Hero Status Skeleton)
          ===================================================================== */}
      <div className="relative overflow-hidden h-20 w-full rounded-2xl border border-[#DA8CA0]/10 bg-[#DA8CA0]/[0.02] shadow-[0_0_20px_rgba(218,140,160,0.05)] animate-pulse flex items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 rounded-full border border-[#DA8CA0]/20 bg-[#DA8CA0]/10" />
          <div className="space-y-2">
            <div className="h-4 w-48 rounded-md bg-[#DA8CA0]/10" />
            <div className="h-3 w-32 rounded-md bg-[#DA8CA0]/5" />
          </div>
        </div>
        <div className="hidden md:flex gap-3">
          <div className="h-8 w-24 rounded-lg bg-[#DA8CA0]/10" />
          <div className="h-8 w-24 rounded-lg bg-[#DA8CA0]/10" />
        </div>
      </div>

      {/* =====================================================================
          2. QUAD-GRID TELEMETRY (Metrics Skeletons)
          ===================================================================== */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div 
            key={i} 
            className="relative overflow-hidden h-[160px] rounded-2xl border border-[#DA8CA0]/10 bg-[#DA8CA0]/[0.02] flex flex-col justify-between p-5"
            // Staggering the pulse animation slightly using animation delays if we had custom CSS, 
            // but here we use a cascading opacity illusion to make it feel dynamic.
          >
            {/* Shimmer overlay */}
            <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-[#DA8CA0]/5 to-transparent" />
            
            <div className="flex justify-between items-start animate-pulse">
              <div className="space-y-3">
                <div className="h-4 w-20 rounded-md bg-[#DA8CA0]/10" />
                <div className="h-8 w-16 rounded-md bg-[#DA8CA0]/20" />
              </div>
              <div className="h-10 w-10 rounded-xl bg-[#DA8CA0]/10" />
            </div>
            
            <div className="h-2 w-full bg-[#DA8CA0]/5 rounded-full overflow-hidden animate-pulse mt-4">
              {/* Fake progress bar skeleton */}
              <div className={`h-full bg-[#DA8CA0]/20 w-[${i * 20 + 20}%]`} />
            </div>
          </div>
        ))}
      </div>

      {/* =====================================================================
          3. GUARDIAN FEED & QUICK LAUNCH (Lower Grid)
          ===================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-[400px]">
        
        {/* Guardian Feed Skeleton (Col Span 2) */}
        <div className="lg:col-span-2 relative overflow-hidden rounded-2xl border border-[#DA8CA0]/10 bg-[#DA8CA0]/[0.02] p-6 flex flex-col gap-6 animate-pulse">
          <div className="flex justify-between items-center pb-4 border-b border-[#DA8CA0]/10">
            <div className="h-6 w-40 rounded-md bg-[#DA8CA0]/10" />
            <div className="h-4 w-24 rounded-md bg-[#DA8CA0]/5" />
          </div>
          
          {/* Threaded Log Lines */}
          {[1, 2, 3, 4, 5].map((row) => (
            <div key={row} className="flex items-center gap-4">
              <div className="h-2 w-2 rounded-full bg-[#DA8CA0]/20" />
              <div className="h-10 w-10 rounded-lg bg-[#DA8CA0]/10 shrink-0" />
              <div className="space-y-2 flex-1">
                <div className="h-3 w-3/4 rounded-md bg-[#DA8CA0]/10" />
                <div className="h-2 w-1/2 rounded-md bg-[#DA8CA0]/5" />
              </div>
            </div>
          ))}
        </div>

        {/* Quick Launch / Action Area Skeleton (Col Span 1) */}
        <div className="relative overflow-hidden rounded-2xl border border-[#DA8CA0]/10 bg-[#DA8CA0]/[0.02] p-6 flex flex-col gap-4 animate-pulse">
          <div className="h-6 w-32 rounded-md bg-[#DA8CA0]/10 mb-2" />
          
          {/* Action Buttons */}
          {[1, 2, 3].map((btn) => (
            <div key={btn} className="h-16 w-full rounded-xl border border-[#DA8CA0]/10 bg-[#DA8CA0]/5 flex items-center px-4 gap-3">
              <div className="h-6 w-6 rounded-md bg-[#DA8CA0]/20" />
              <div className="h-3 w-24 rounded-md bg-[#DA8CA0]/10" />
            </div>
          ))}

          {/* Upload Dropzone Skeleton */}
          <div className="flex-1 mt-2 rounded-xl border-2 border-dashed border-[#DA8CA0]/10 bg-[#DA8CA0]/[0.01] flex items-center justify-center">
             <div className="h-10 w-10 rounded-full bg-[#DA8CA0]/5" />
          </div>
        </div>

      </div>
    </div>
  );
}