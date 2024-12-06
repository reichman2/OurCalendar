import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import prisma from "./lib/prisma";
import { compare } from "./utils/password";


export const saltRounds = 10;
export const { signIn, signOut, auth, handlers } = NextAuth({
    providers: [
        Credentials({
            id: "credentials",
            name: "Username and Password",
            credentials: {
                username: {
                    label: "Username",
                },
                password: {
                    label: "Password",
                    type: "password"
                }
            },

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            authorize: async (creds): Promise<any> => {
                if (!creds?.username || typeof creds.username !== 'string') {
                    return false;
                }
                
                if (!creds?.password || typeof creds.password !== 'string') {
                    return false;
                }

                const user = await prisma.user.findFirst({
                    where: {
                        username: creds.username,
                    }
                });

                if (!user) {
                    throw new Error("Invalid credentials.");
                }

                const passwordCheck = await compare(creds.password, user.password);
                // const passwordCheck = await bcrypt.compare(creds.password, user.password);
                if (passwordCheck) {
                    return {
                        id: user.id,
                        username: user.username,
                        user
                    };
                }
                
                return null;
            }
        })
    ],

    secret: process.env.SESSION_SECRET,
    session: {
        strategy: "jwt",
        maxAge: 86400 * 30 // 30 days
    }
});