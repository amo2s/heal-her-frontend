import { cookies } from "next/headers";
import { HealProvider } from "@/store/heal";
import { LegalConsentModal } from "@/components/dashboard/LegalConsentModal";

export const dynamic = "force-dynamic";

function parseTokenClaims(token: string): Record<string, any> | null {
  try {
    const payloadBase64 = token.split(".")[1];
    if (!payloadBase64) return null;
    const normalizedBase64 = payloadBase64.replace(/-/g, "+").replace(/_/g, "/");
    const decodedPayload = Buffer.from(normalizedBase64, "base64").toString("utf-8");
    return JSON.parse(decodedPayload);
  } catch (e) {
    console.error("Failed to parse JWT payload", e);
    return null;
  }
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let hasSigned = true;
  let requiresReconsent = false;
  let fetchedFirstName = "";

  try {
    const cookieStore = await cookies();
    const token =
      cookieStore.get("sb-access-token")?.value ||
      cookieStore.get("accessToken")?.value;

    if (token) {
      // 1. Zero-Trust Legal Consent Verification & Edge Hydration
      const claims = parseTokenClaims(token);
      hasSigned = Boolean(claims?.tos_cleared ?? claims?.tosCleared);
      requiresReconsent = false;

      // Instantly hydrate the user's name from the JWT payload in-memory
      fetchedFirstName = claims?.first_name || claims?.firstName || "";
    }
  } catch (error) {
    console.error("[SSR Layout Check] Error evaluating session claims:", error);
    hasSigned = true;
    requiresReconsent = false;
  }

  return (
    <HealProvider initialNickname={fetchedFirstName || undefined}>
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
