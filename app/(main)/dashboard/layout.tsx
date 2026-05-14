import DashboardHeader from "@/components/DashboardHeader";
import Footer from "@/components/Footer";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <DashboardHeader />
      {children}
      <Footer />
    </>
  );
}
