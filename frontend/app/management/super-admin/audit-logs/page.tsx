import { redirect } from "next/navigation";
import { getServerManagementIdentity } from "@/lib/management-governance-server";
import { AuditLogsViewer } from "@/components/management/governance/AuditLogsViewer";

export const dynamic = "force-dynamic";

export default async function SuperAdminAuditLogsPage() {
  const auth = await getServerManagementIdentity();

  if (!auth.authenticated || auth.identity.role !== "super_admin") {
    redirect("/management/auth/login");
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <AuditLogsViewer />
    </div>
  );
}
