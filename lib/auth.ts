import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma"

export const auth = betterAuth({
    baseURL: process.env.BETTER_AUTH_URL,
    trustedOrigins: [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        process.env.NEXT_PUBLIC_APP_URL,
        "https://*.ngrok-free.app",
        "https://*.ngrok.io",
    ].filter((url): url is string => Boolean(url)),
    database : prismaAdapter(prisma , {
        provider : "postgresql"
    }),
    socialProviders : {
        github : {
            clientId : process.env.GITHUB_CLIENT_ID!,
            clientSecret : process.env.GITHUB_CLIENT_SECRET!,
            scope: ["user:email", "repo"],
        }
    }, 
    session : {
        expiresIn : 60*60*7*24
    }
})
export type Session = typeof auth.$Infer.Session