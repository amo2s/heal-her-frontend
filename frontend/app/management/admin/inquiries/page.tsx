import { InquiriesConsole } from "@/components/management/inquiries/InquiriesConsole";

export const dynamic = "force-dynamic";

export default function AdminInquiriesPage() {
  return <InquiriesConsole userRole="admin" />;
}
