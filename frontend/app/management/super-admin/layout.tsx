import { redirect } from "next/navigation";
import { LayoutDashboard, Shield, Inbox, ScrollText } from "lucide-react";
import { getServerManagementIdentity } from "@/lib/management-governance-server";
import { getPortalBasePath } from "@/lib/management-governance";
import { PendingApprovalShell } from "@/components/management/portal/PendingApprovalShell";
import { SessionRefreshGate } from "@/components/management/portal/SessionRefreshGate";
import { PortalShell, PortalNavItem } from "@/components/management/portal/PortalShell";

export const dynamic = "force-dynamic";

const SUPER_ADMIN_NAV_ITEMS: PortalNavItem[] = [
  { label: "Overview", href: "/management/super-admin", icon: LayoutDashboard },
  { label: "Account Governance", href: "/management/super-admin/governance", icon: Shield },
  { label: "Inquiries Oversight", href: "/management/super-admin/inquiries", icon: Inbox },
  { label: "Audit Logs", href: "/management/super-admin/audit-logs", icon: ScrollText },
];

export default async function SuperAdminPortalLayout({
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
  if (identity.role !== "super_admin") {
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
        portalRole="super_admin"
        user={identity}
        navItems={SUPER_ADMIN_NAV_ITEMS}
      >
        {children}
      </PortalShell>
    </>
  );
}
