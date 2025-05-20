// /pages/api/register.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { registerSchema } from "@/lib/validations/auth";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "POST") {
        return res.status(405).json({ message: "Method Not Allowed" });
    }

    const result = registerSchema.safeParse(req.body);

    if (!result.success) {
        return res.status(400).json({ errors: result.error.flatten().fieldErrors });
    }

    const { username, email, password, role } = result.data;

    try {
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return res.status(409).json({ 
                success: false,
                message: "User already exists" 
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                username,
                email,
                password: hashedPassword,
                role
            },
        });

        return res.status(201).json({ 
            success: true, 
            message: "User registered successfully"
        });
    } catch (error) {
        console.error("Registration Error:", error);
        return res.status(500).json({ 
            success: false,
            message: "Failed to register" 
        });
    }
}

