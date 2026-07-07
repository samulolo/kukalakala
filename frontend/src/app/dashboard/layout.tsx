import DashboardSideMenu from "@/components/ui/dashboard/DashboardSideMenu";

type DashboardLayoutProps = {
  children: React.ReactNode;
};

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="flex min-h-screen bg-[#f7f8fb]">
      <DashboardSideMenu />
      <main className="min-w-0 flex-1 overflow-x-hidden pt-14 lg:ml-[220px] lg:pt-0">{children}</main>
    </div>
  );
}
