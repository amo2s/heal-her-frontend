import Link from "next/link";
import { Shield, Inbox, ScrollText, ArrowRight } from "lucide-react";
import { getServerManagementIdentity } from "@/lib/management-governance-server";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function SuperAdminOverviewPage() {
  const auth = await getServerManagementIdentity();
  const identity = auth.authenticated ? auth.identity : null;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Welcome Banner */}
      <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-6 sm:p-8 backdrop-blur-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-rose-500/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-300 text-[10px] font-bold uppercase tracking-wider">
            Super Admin Executive Command
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Welcome, {identity?.firstName || identity?.fullName || "Executive"}
          </h1>
          <p className="text-xs sm:text-sm text-[#8F8FA3] max-w-2xl leading-relaxed">
            Highest-tier governance lane. You possess full oversight authority to approve, suspend,
            and soft-delete Admin and Staff accounts, inspect immutable audit trails, and oversee
            community helpdesk operations.
          </p>
        </div>
      </div>

      {/* Quick Action Command Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Governance Command Card */}
        <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-6 flex flex-col justify-between space-y-4 hover:border-white/20 transition-all">
          <div className="space-y-2">
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 w-fit">
              <Shield className="h-5 w-5" />
            </div>
            <h2 className="text-base font-semibold text-white">Account Governance</h2>
            <p className="text-xs text-[#8F8FA3] leading-relaxed">
              Tier 2 Authority: approve or reject Admin & Staff registrations, suspend active
              sessions with immediate cache revocation, or soft-delete accounts.
            </p>
          </div>

          <Button asChild className="w-full bg-rose-600 hover:bg-rose-500 text-white text-xs">
            <Link href="/management/super-admin/governance">
              <span>Open Governance Console</span>
              <ArrowRight className="h-4 w-4 ml-1.5" />
            </Link>
          </Button>
        </div>

        {/* Audit Logs Card */}
        <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-6 flex flex-col justify-between space-y-4 hover:border-white/20 transition-all">
          <div className="space-y-2">
            <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 w-fit">
              <ScrollText className="h-5 w-5" />
            </div>
            <h2 className="text-base font-semibold text-white">Immutable Audit Ledger</h2>
            <p className="text-xs text-[#8F8FA3] leading-relaxed">
              Inspect the cryptographically sealed append-only audit trail logging every signup,
              approval, suspension, and deletion with actor IP and event metadata.
            </p>
          </div>

          <Button asChild variant="outline" className="w-full border-white/10 text-white/80 hover:bg-white/5 text-xs">
            <Link href="/management/super-admin/audit-logs">
              <span>Inspect Audit Logs</span>
              <ArrowRight className="h-4 w-4 ml-1.5" />
            </Link>
          </Button>
        </div>

        {/* Inquiries Oversight Card */}
        <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-6 flex flex-col justify-between space-y-4 hover:border-white/20 transition-all">
          <div className="space-y-2">
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 w-fit">
              <Inbox className="h-5 w-5" />
            </div>
            <h2 className="text-base font-semibold text-white">Inquiries Oversight</h2>
            <p className="text-xs text-[#8F8FA3] leading-relaxed">
              Executive read-only oversight across all community inquiries, response rates, staff
              activity metrics, and outbound email relay deliverability.
            </p>
          </div>

          <Button asChild variant="outline" className="w-full border-white/10 text-white/80 hover:bg-white/5 text-xs">
            <Link href="/management/super-admin/inquiries">
              <span>View Inquiries Oversight</span>
              <ArrowRight className="h-4 w-4 ml-1.5" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
