import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

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
      <AdminSidebar userRole={userRole} userRegion={userRegion} />
      <main className="flex-1 p-8 overflow-auto">
        {children}
      </main>
    </div>
  );
}
