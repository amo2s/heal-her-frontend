import { InquiriesConsole } from "@/components/management/inquiries/InquiriesConsole";

export const dynamic = "force-dynamic";

export default function StaffInquiriesPage() {
  return <InquiriesConsole userRole="staff" />;
}
