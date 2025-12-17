import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Lock } from "lucide-react";

export default function RegistrationPage() {
    return (
        <div className="container py-20 flex flex-col items-center justify-center text-center min-h-[60vh]">
            <div className="p-4 bg-muted/30 rounded-full mb-6">
                <Lock className="w-12 h-12 text-muted-foreground" />
            </div>
            <h1 className="text-3xl font-heading font-bold mb-4">Вход для представителей</h1>
            <p className="text-lg text-muted-foreground max-w-xl mb-6">
                Доступ к системе подачи заявок ограничен. Логин и пароль выдаются официально администрацией Федерации.
            </p>

            <div className="bg-secondary/20 border border-secondary/30 rounded-lg p-4 mb-8 text-sm text-muted-foreground">
                <p className="font-medium text-foreground mb-1">По вопросам получения доступа:</p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
                    <span className="flex items-center gap-2">
                        📞 <a href="tel:+77000000000" className="hover:text-primary transition-colors">+7 (700) 000-00-00</a>
                    </span>
                    <span className="hidden sm:inline">•</span>
                    <span className="flex items-center gap-2">
                        ✉️ <a href="mailto:info@archery.kz" className="hover:text-primary transition-colors">info@archery.kz</a>
                    </span>
                </div>
            </div>
            <Button asChild size="lg">
                <Link href="/auth/signin">Войти в систему</Link>
            </Button>
        </div>
    );
}
