import { redirect } from "next/navigation";
import { getServerManagementIdentity } from "@/lib/management-governance-server";
import { getPortalBasePath } from "@/lib/management-governance";

export const dynamic = "force-dynamic";

export default async function LegacyManagementInquiriesRedirect() {
  const auth = await getServerManagementIdentity();

  if (!auth.authenticated) {
    redirect("/management/auth/login");
  }

  const { identity } = auth;
  const base = identity.portalPath || getPortalBasePath(identity.role);
  redirect(`${base}/inquiries`);
}
