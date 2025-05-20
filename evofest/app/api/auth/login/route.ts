// /pages/api/login.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { loginSchema } from "@/lib/validations/auth";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "POST") {
        return res.status(405).json({ 
            success: false,
            message: "Method Not Allowed" 
        });
    }

    const result = loginSchema.safeParse(req.body);

    if (!result.success) {
        return res.status(400).json({ errors: result.error.flatten().fieldErrors });
    }

    const { email, password } = result.data;

    try {
        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            return res.status(401).json({ 
                success: false,
                message: "Invalid credentials" 
            });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({ 
                success: false,
                message: "Invalid credentials" 
            });
        }

        const token = jwt.sign(
        {  
            id: user.userId,
            email: user.email,
        },
            process.env.JWT_SECRET as string,
        {
            expiresIn: "1h",
        });

        return res.status(200).json({
            message: "Login successful",
            token,
            user: { 
                userId: user.userId, 
                email: user.email, 
                username: user.username 
            },
        });
    } catch (error) {
        console.error("Login Error:", error);
        return res.status(500).json({ 
            success: false,
            message: "Failed to Login" 
        });
    }
}
