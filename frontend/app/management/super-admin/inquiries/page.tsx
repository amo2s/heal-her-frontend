import { InquiriesConsole } from "@/components/management/inquiries/InquiriesConsole";

export const dynamic = "force-dynamic";

export default function SuperAdminInquiriesPage() {
  return <InquiriesConsole userRole="super_admin" />;
}
