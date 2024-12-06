import prisma from "@/lib/prisma";
import { userSchema } from "@/lib/zod";
import { hashPassword } from "@/utils/password";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === "POST") {
        const body = req.body;

        const userExists = await prisma.user.findFirst({ where: { username: body.username }});
        if (userExists) {
            res.status(422).json({
                success: false,
                message: "A user with the given username already exists",
                userExists: true
            });

            return;
        }

        const { username, password } = await userSchema.parseAsync({ username: body.username, password: body.password });

        await prisma.user.create({
            data: {
                username: username,
                password: await hashPassword(password)
            }
        });
        res.status(200).json({ message: "User created successfully!"})
    } else {
        res.status(405).json({ message: "405 Method not Allowed" });
    }
    
}