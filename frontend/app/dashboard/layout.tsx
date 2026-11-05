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
      // 1. Zero-Trust Legal Consent Verification: Extract claims directly from cryptographically minted JWT
      const claims = parseTokenClaims(token);
      hasSigned = Boolean(claims?.tos_cleared ?? claims?.tosCleared);
      requiresReconsent = false;

      // 2. Server-Side GraphQL Profile Fetch (Edge Cached)
      const dashboardRoute = claims?.dashboard || "young-adults";
      const graphqlPort = process.env.DASHBOARD_GRAPHQL_PORT || "8081";
      const graphqlUrl = `http://127.0.0.1:${graphqlPort}/api/v1/dashboard/${dashboardRoute}/graphql`;

      try {
        const gqlResponse = await fetch(graphqlUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ query: `query { me { firstName } }` }),
          next: { tags: ["user-profile"], revalidate: 3600 },
        });

        if (gqlResponse.ok) {
          const gqlData = await gqlResponse.json();
          if (gqlData?.data?.me?.firstName) {
            fetchedFirstName = gqlData.data.me.firstName;
          }
        }
      } catch (err) {
        console.error("Network error fetching GraphQL profile:", err);
      }
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
