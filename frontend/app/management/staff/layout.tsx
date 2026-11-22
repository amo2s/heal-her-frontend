import { redirect } from "next/navigation";
import { LayoutDashboard, Inbox, Video } from "lucide-react";
import { getServerManagementIdentity } from "@/lib/management-governance-server";
import { getPortalBasePath } from "@/lib/management-governance";
import { PendingApprovalShell } from "@/components/management/portal/PendingApprovalShell";
import { SessionRefreshGate } from "@/components/management/portal/SessionRefreshGate";
import { PortalShell, PortalNavItem } from "@/components/management/portal/PortalShell";

export const dynamic = "force-dynamic";

const STAFF_NAV_ITEMS: PortalNavItem[] = [
  { label: "Overview", href: "/management/staff", icon: LayoutDashboard },
  { label: "Inquiries", href: "/management/staff/inquiries", icon: Inbox },
  { label: "Content & Videos", href: "/management/staff/content", icon: Video },
];

export default async function StaffPortalLayout({
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
  if (identity.role !== "staff") {
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
        portalRole="staff"
        user={identity}
        navItems={STAFF_NAV_ITEMS}
      >
        {children}
      </PortalShell>
    </>
  );
}
