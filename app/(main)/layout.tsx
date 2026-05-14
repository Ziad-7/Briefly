import Sidebar from "@/components/Sidebar";
import DashboardHeader from "@/components/DashboardHeader";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex-1 flex flex-row w-full min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 w-full">
        <DashboardHeader />
        {children}
      </div>
    </div>
  );
}
