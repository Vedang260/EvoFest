// /pages/api/login.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { loginSchema } from "@/lib/validations/auth";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function POST(request: Request) {
    try{
        const body = await request.json();
        console.log("Incoming request body:", body);

        const result = loginSchema.safeParse(body);

 
        if (!result.success) {
            return NextResponse.json({ 
                success: false, 
                errors: result.error.flatten().fieldErrors 
            });
        }

        const { email, password } = result.data;

        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            return NextResponse.json({ 
                success: false,
                message: "Invalid credentials" 
            });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return NextResponse.json({ 
                success: false,
                message: "Invalid credentials" 
            });
        }

        const token = jwt.sign({  
            id: user.userId,
            email: user.email,
        },
            process.env.JWT_SECRET as string,
        {
            expiresIn: "1h",
        });

        return NextResponse.json({
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
        return NextResponse.json({ 
            success: false,
            message: "Failed to Login" 
        });
    }
}
