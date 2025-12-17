import { CoachRegistrationForm } from "@/components/registration/CoachRegistrationForm";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { LogOut } from "lucide-react";

export default async function AdminDashboardPage() {
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect("/auth/signin");
    }

    return (
        <div className="container py-10 max-w-5xl">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-heading font-bold text-primary">Панель управления</h1>
                    <p className="text-muted-foreground">
                        Регион: <span className="font-medium text-foreground">{session.user?.name}</span>
                    </p>
                </div>

                {/* SignOut is usually handled client-side but for now we can just link to api signout or handle in a client component header */}
                <div className="flex gap-2">
                    <Button variant="outline" asChild>
                        <Link href="/api/auth/signout">Выйти</Link>
                    </Button>
                </div>
            </div>

            <div className="grid gap-8">
                <section>
                    <div className="mb-6">
                        <h2 className="text-2xl font-bold mb-2">Подача заявки на турнир</h2>
                        <div className="inline-flex items-center gap-2 text-sm text-muted-foreground bg-secondary/30 px-3 py-1 rounded-full">
                            <span className="font-medium">Чемпионат Республики Казахстан 2025</span>
                        </div>
                    </div>

                    <CoachRegistrationForm />
                </section>
            </div>
        </div>
    );
}
