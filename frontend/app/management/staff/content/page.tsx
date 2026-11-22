import { Video, UploadCloud, Sparkles } from "lucide-react";

export const dynamic = "force-dynamic";

export default function StaffContentPage() {
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-6 sm:p-8 backdrop-blur-xl space-y-2">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-[10px] font-bold uppercase tracking-wider">
          <Sparkles className="h-3 w-3" />
          <span>Operational Content Studio</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-white">
          Content & Video Publishing
        </h1>
        <p className="text-xs text-[#8F8FA3] max-w-xl leading-relaxed">
          Operational lane dedicated for staff authors to upload educational video modules, health
          guides, and scenario responses.
        </p>
      </div>

      <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-12 text-center space-y-4">
        <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 w-fit mx-auto">
          <UploadCloud className="h-8 w-8" />
        </div>
        <div className="space-y-1">
          <h2 className="text-base font-semibold text-white">Media Studio Scaffolding Ready</h2>
          <p className="text-xs text-[#8F8FA3] max-w-md mx-auto">
            Content creation pipelines and video asset storage will be integrated into this lane.
            Your operational staff permissions are active.
          </p>
        </div>
      </div>
    </div>
  );
}
