import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";

// Проверка обязательных переменных окружения
if (!process.env.NEXTAUTH_SECRET) {
  throw new Error('NEXTAUTH_SECRET environment variable is required');
}

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                username: { label: "Username", type: "text" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.username || !credentials?.password) {
                    throw new Error("Missing credentials");
                }

                const user = await prisma.user.findFirst({
                    where: {
                        username: {
                            equals: credentials.username,
                            mode: 'insensitive'
                        }
                    },
                    include: { regionRef: true },
                });

                if (!user) {
                    throw new Error("User not found");
                }

                const isValid = await bcrypt.compare(credentials.password, user.password);

                if (!isValid) {
                    throw new Error("Invalid password");
                }

                return {
                    id: user.id.toString(),
                    name: user.username,
                    role: user.role,
                    regionId: user.regionId,
                    region: user.regionRef?.name || user.region,
                };
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.role = (user as any).role;
                token.id = user.id;
                token.regionId = (user as any).regionId;
                token.region = (user as any).region;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                (session.user as any).role = token.role;
                (session.user as any).id = token.id;
                (session.user as any).regionId = token.regionId;
                (session.user as any).region = token.region;
            }
            return session;
        },
    },
    pages: {
        signIn: "/auth/signin", // We will need to create this or use default
    },
    session: {
        strategy: "jwt",
    },
    secret: process.env.NEXTAUTH_SECRET,
};
