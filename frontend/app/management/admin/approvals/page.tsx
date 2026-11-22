import { redirect } from "next/navigation";
import { getServerManagementIdentity } from "@/lib/management-governance-server";
import { AccountGovernanceConsole } from "@/components/management/governance/AccountGovernanceConsole";

export const dynamic = "force-dynamic";

export default async function AdminApprovalsPage() {
  const auth = await getServerManagementIdentity();

  if (!auth.authenticated || auth.identity.role !== "admin") {
    redirect("/management/auth/login");
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-6 sm:p-8 backdrop-blur-xl space-y-2">
        <h1 className="text-2xl font-bold tracking-tight text-white">
          Staff Onboarding Queue
        </h1>
        <p className="text-xs text-[#8F8FA3] max-w-xl leading-relaxed">
          Review, approve, or reject frontline staff applications. Admin authority is scoped
          strictly to staff accounts.
        </p>
      </div>

      <AccountGovernanceConsole
        actorId={auth.identity.id}
        actorRole="admin"
      />
    </div>
  );
}
