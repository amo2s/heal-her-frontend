import { cookies } from "next/headers";
import { HealProvider } from "@/store/heal";
import { LegalConsentModal } from "@/components/dashboard/LegalConsentModal";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let hasSigned = true;
  let requiresReconsent = false;

  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("sb-access-token")?.value;

    if (token) {
      const pythonUrl =
        process.env.PYTHON_TOS_URL ||
        (process.env.BACKEND_URL && !process.env.BACKEND_URL.includes("graphql")
          ? process.env.BACKEND_URL
          : "http://127.0.0.1:8080");

      const response = await fetch(`${pythonUrl}/api/v1/tos/status`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      });

      if (response.ok) {
        const data = await response.json();
        hasSigned = Boolean(data.has_signed ?? data.hasSigned);
        requiresReconsent = Boolean(data.requires_reconsent ?? data.requiresReconsent);
      }
    }
  } catch (error) {
    // Fail-Open Failsafe: Default has_signed to true on failure to prevent user lockouts or broken dashboard
    console.error("[SSR Legal Consent Status Check] Fail-open engaged:", error);
    hasSigned = true;
    requiresReconsent = false;
  }

  return (
    <HealProvider>
      {!hasSigned && (
        <LegalConsentModal
          hasSigned={hasSigned}
          requiresReconsent={requiresReconsent}
        />
      )}
      {children}
    </HealProvider>
  );
}
