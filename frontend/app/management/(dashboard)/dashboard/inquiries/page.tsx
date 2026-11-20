import { Metadata } from "next";
import { redirect } from "next/navigation";
import { fortressFetch } from "@/lib/utility";
import { normalizeManagementRole, canReadInquiries } from "@/lib/management-inquiries";
import { InquiriesConsole } from "@/components/management/inquiries/InquiriesConsole";

export const metadata: Metadata = {
  title: "Inquiries & Helpdesk | Heal Her Management",
  description: "Role-aware management console for public contact inquiries, thread triage, and correspondence.",
};

const GET_IDENTITY_QUERY = `
  query GetIdentity {
    getMe {
      success
      message
      profile {
        fullName
        role
        email
      }
    }
  }
`;

export default async function ManagementInquiriesPage() {
  let profile = null;
  let requiresRedirect = false;

  try {
    const response = await fortressFetch("/graphql", {
      method: "POST",
      body: JSON.stringify({ query: GET_IDENTITY_QUERY }),
    });

    const data = response?.data?.getMe;

    if (!data || data.success === false) {
      console.warn("[SECURITY] Invalid or expired session on inquiries. Flagging for perimeter redirect...");
      requiresRedirect = true;
    } else {
      profile = data.profile;
    }
  } catch (error) {
    console.error("[CRITICAL] Identity Siphon Failed on Inquiries:", error);
    requiresRedirect = true;
  }

  if (requiresRedirect) {
    redirect("/management/auth/login");
  }

  const rawRole = profile?.role || "GUEST";
  const userRole = normalizeManagementRole(rawRole);

  if (!userRole || !canReadInquiries(userRole)) {
    return (
      <div className="min-h-full w-full p-6 md:p-10 flex items-center justify-center">
        <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-8 max-w-md text-center">
          <h2 className="text-xl font-bold text-white mb-2">Access Denied</h2>
          <p className="text-sm text-gray-400">
            Your account role ({rawRole}) does not have permission to view or manage contact inquiries.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full w-full p-4 sm:p-6 md:p-8 relative">
      <div className="relative z-10 max-w-7xl mx-auto space-y-6">
        <InquiriesConsole userRole={userRole} />
      </div>
    </div>
  );
}
