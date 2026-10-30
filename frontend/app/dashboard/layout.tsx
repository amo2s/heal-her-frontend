import { cookies } from "next/headers";
import { HealProvider } from "@/store/heal";
import { LegalConsentModal } from "@/components/dashboard/LegalConsentModal";

export const dynamic = "force-dynamic";

function getDashboardRouteFromToken(token: string): string {
  try {
    const payloadBase64 = token.split(".")[1];
    const normalizedBase64 = payloadBase64.replace(/-/g, "+").replace(/_/g, "/");
    const decodedPayload = Buffer.from(normalizedBase64, "base64").toString("utf-8");
    const claims = JSON.parse(decodedPayload);
    return claims.dashboard || "young-adults"; // Fallback
  } catch (e) {
    console.error("Failed to parse JWT payload for routing", e);
    return "young-adults";
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
    const token = cookieStore.get("sb-access-token")?.value;

    if (token) {
      // 1. Legal Consent Verification Check
      const pythonUrl =
        process.env.PYTHON_TOS_URL ||
        (process.env.BACKEND_URL && !process.env.BACKEND_URL.includes("graphql")
          ? process.env.BACKEND_URL
          : "http://127.0.0.1:8080");

      try {
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
      } catch (tosErr) {
        console.error("[SSR Legal Consent Status Check] Fail-open engaged:", tosErr);
        hasSigned = true;
        requiresReconsent = false;
      }

      // 2. Server-Side GraphQL Profile Fetch (Edge Cached)
      const dashboardRoute = getDashboardRouteFromToken(token);
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
    // Fail-Open Failsafe: Default has_signed to true on failure to prevent user lockouts or broken dashboard
    console.error("[SSR Layout Check] Fail-open engaged:", error);
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
