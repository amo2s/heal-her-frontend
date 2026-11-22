import { redirect } from "next/navigation";
import { LayoutDashboard, UserCheck, Inbox } from "lucide-react";
import { getServerManagementIdentity } from "@/lib/management-governance-server";
import { getPortalBasePath } from "@/lib/management-governance";
import { PendingApprovalShell } from "@/components/management/portal/PendingApprovalShell";
import { SessionRefreshGate } from "@/components/management/portal/SessionRefreshGate";
import { PortalShell, PortalNavItem } from "@/components/management/portal/PortalShell";

export const dynamic = "force-dynamic";

const ADMIN_NAV_ITEMS: PortalNavItem[] = [
  { label: "Overview", href: "/management/admin", icon: LayoutDashboard },
  { label: "Staff Approvals", href: "/management/admin/approvals", icon: UserCheck },
  { label: "Inquiries", href: "/management/admin/inquiries", icon: Inbox },
];

export default async function AdminPortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const auth = await getServerManagementIdentity();

  if (!auth.authenticated) {
    redirect("/management/auth/login");
  }

  const { identity } = auth;

  // Strict 1-to-1 Role Isolation
  if (identity.role !== "admin") {
    redirect(identity.portalPath || getPortalBasePath(identity.role));
  }

  // Pending Approval Gate
  if (identity.approvalStatus === "PENDING") {
    return <PendingApprovalShell identity={identity} />;
  }

  // Active & Approved Verification Gate
  if (identity.approvalStatus !== "APPROVED" || !identity.isActive) {
    redirect("/management/auth/login");
  }

  return (
    <>
      {identity.requiresTokenRefresh && <SessionRefreshGate />}
      <PortalShell
        portalRole="admin"
        user={identity}
        navItems={ADMIN_NAV_ITEMS}
      >
        {children}
      </PortalShell>
    </>
  );
}
