"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Lock } from "lucide-react";

export default function SignInPage() {
    const router = useRouter();
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
            toast.error("Неверный логин или пароль");
        } else {
            toast.success("Вход выполнен");
            router.push("/admin/dashboard");
            router.refresh();
        }
    };

    return (
        <div className="flex h-[80vh] w-full items-center justify-center p-4">
            <Card className="w-full max-w-sm shadow-md">
                <CardHeader className="space-y-1 text-center">
                    <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                        <Lock className="h-5 w-5 text-primary" />
                    </div>
                    <CardTitle className="text-2xl font-bold">Вход в систему</CardTitle>
                    <CardDescription>
                        Введите данные учетной записи региона
                    </CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                    <CardContent className="grid gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="username">Логин (Регион)</Label>
                            <Input
                                id="username"
                                type="text"
                                placeholder="Astana"
                                required
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="password">Пароль</Label>
                            <Input
                                id="password"
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button className="w-full" type="submit" disabled={isLoading}>
                            {isLoading ? "Вход..." : "Войти"}
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}
