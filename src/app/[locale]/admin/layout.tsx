import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AdminSidebar, AdminMobileMenuTrigger } from "@/components/admin/AdminSidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/signin");
  }

  const userRole = session.user?.role || "RegionalRepresentative";
  const userRegion = session.user?.region;

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <AdminSidebar userRole={userRole} userRegion={userRegion} />

      <div className="flex-1 flex flex-col">
        {/* Mobile Header */}
        <header className="lg:hidden sticky top-0 z-40 flex h-14 items-center gap-4 border-b bg-background px-4">
          <AdminMobileMenuTrigger userRole={userRole} userRegion={userRegion} />
          <div className="flex-1">
            <span className="font-bold">SADAQ Admin</span>
          </div>
        </header>

        {/* Page Content with responsive padding */}
        <main className="flex-1 p-4 lg:p-8 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
