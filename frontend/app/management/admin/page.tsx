import Link from "next/link";
import { UserCheck, Inbox, ArrowRight } from "lucide-react";
import { getServerManagementIdentity } from "@/lib/management-governance-server";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function AdminOverviewPage() {
  const auth = await getServerManagementIdentity();
  const identity = auth.authenticated ? auth.identity : null;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Welcome Banner */}
      <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-6 sm:p-8 backdrop-blur-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-[10px] font-bold uppercase tracking-wider">
            Admin Command Lane
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Welcome back, {identity?.firstName || identity?.fullName || "Admin"}
          </h1>
          <p className="text-xs sm:text-sm text-[#8F8FA3] max-w-2xl leading-relaxed">
            Your operations command center for reviewing and approving frontline staff onboarding
            requests and triaging community inquiries with operational reply authority.
          </p>
        </div>
      </div>

      {/* Quick Action Tiles */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Staff Approval Action Card */}
        <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-6 flex flex-col justify-between space-y-4 hover:border-white/20 transition-all">
          <div className="space-y-2">
            <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 w-fit">
              <UserCheck className="h-5 w-5" />
            </div>
            <h2 className="text-base font-semibold text-white">Staff Approvals Queue</h2>
            <p className="text-xs text-[#8F8FA3] leading-relaxed">
              Review pending staff onboarding requests. Tier 1 authority permits approving or
              rejecting frontline applicants into the active operations directory.
            </p>
          </div>

          <Button asChild className="w-full bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs">
            <Link href="/management/admin/approvals">
              <span>Review Staff Approvals</span>
              <ArrowRight className="h-4 w-4 ml-1.5" />
            </Link>
          </Button>
        </div>

        {/* Inquiries Action Card */}
        <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-6 flex flex-col justify-between space-y-4 hover:border-white/20 transition-all">
          <div className="space-y-2">
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 w-fit">
              <Inbox className="h-5 w-5" />
            </div>
            <h2 className="text-base font-semibold text-white">Inquiries Management</h2>
            <p className="text-xs text-[#8F8FA3] leading-relaxed">
              Supervise community helpdesk tickets. You possess full operational authority to reply
              to visitors and update ticket lifecycle statuses.
            </p>
          </div>

          <Button asChild variant="outline" className="w-full border-white/10 text-white/80 hover:bg-white/5 text-xs">
            <Link href="/management/admin/inquiries">
              <span>Open Inquiries Console</span>
              <ArrowRight className="h-4 w-4 ml-1.5" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
