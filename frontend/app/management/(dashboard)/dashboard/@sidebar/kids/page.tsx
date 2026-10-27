// This file intercepts the slot ONLY when the URL is /management/dashboard/kids
// We will build the actual KidsSidebar component next.
import KidsSidebar from "@/components/management/kids-rail/sidebar";

export default function KidsSidebarSlot() {
  return <KidsSidebar />;
}