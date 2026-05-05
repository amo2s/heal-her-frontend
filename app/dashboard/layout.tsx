import { HealProvider } from "@/store/heal";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <HealProvider>
      {children}
    </HealProvider>
  );
}