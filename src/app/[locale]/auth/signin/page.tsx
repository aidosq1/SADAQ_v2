"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { toast } from "sonner";
import { Lock } from "lucide-react";
import { IconTile } from "@/components/ui/icon-tile";

const LABELS = {
    ru: { title: "Вход в систему", username: "Логин", password: "Пароль", submit: "Войти", submitting: "Вход...", error: "Неверный логин или пароль", success: "Вход выполнен" },
    kk: { title: "Жүйеге кіру", username: "Логин", password: "Құпиясөз", submit: "Кіру", submitting: "Кіру...", error: "Логин немесе құпиясөз қате", success: "Жүйеге кірдіңіз" },
    en: { title: "Sign in", username: "Username", password: "Password", submit: "Sign in", submitting: "Signing in...", error: "Invalid username or password", success: "Signed in" },
} as const;

export default function SignInPage() {
    const router = useRouter();
    const locale = useLocale();
    const labels = LABELS[locale as keyof typeof LABELS] ?? LABELS.ru;
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        const result = await signIn("credentials", {
            username,
            password,
            redirect: false,
        });

        setIsLoading(false);

        if (result?.error) {
            toast.error(labels.error);
        } else {
            toast.success(labels.success);
            router.push("/admin/dashboard");
            router.refresh();
        }
    };

    return (
        <div className="flex min-h-[70vh] w-full items-center justify-center bg-secondary px-4 py-16">
            <Card className="w-full max-w-sm shadow-raised">
                <CardHeader className="justify-items-center gap-3 text-center">
                    <IconTile icon={Lock} />
                    <h1 className="type-h2 text-foreground">{labels.title}</h1>
                </CardHeader>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <CardContent className="grid gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="username">{labels.username}</Label>
                            <Input
                                id="username"
                                type="text"
                                autoComplete="username"
                                required
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="password">{labels.password}</Label>
                            <Input
                                id="password"
                                type="password"
                                autoComplete="current-password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button className="w-full" size="lg" type="submit" disabled={isLoading}>
                            {isLoading ? labels.submitting : labels.submit}
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}
