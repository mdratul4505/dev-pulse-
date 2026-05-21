import type { Request, Response } from "express";
import { authService } from "./auth.service";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const createUser = async (req: Request, res: Response) => {
    try {
        const { name, email, password, role } = req.body;

        // Validation checks
        if (!name || typeof name !== "string" || name.trim() === "") {
            return res.status(400).json({
                success: false,
                message: "Name is required and must be a non-empty string",
                errors: "Invalid name input"
            });
        }

        if (!email || typeof email !== "string" || !emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: "A valid email address is required",
                errors: "Invalid email input"
            });
        }

        if (!password || typeof password !== "string" || password.length < 6) {
            return res.status(400).json({
                success: false,
                message: "Password is required and must be at least 6 characters long",
                errors: "Invalid password input"
            });
        }

        if (role && role !== "contributor" && role !== "maintainer") {
            return res.status(400).json({
                success: false,
                message: "Role must be either 'contributor' or 'maintainer'",
                errors: "Invalid role input"
            });
        }

        const result = await authService.createUserIntoDB(req.body);

        return res.status(201).json({
            success: true,
            message: "User registered successfully",
            data: result.rows[0]
        });
    } catch (err: any) {
        if (err.message === "Email already registered") {
            return res.status(400).json({
                success: false,
                message: "Email already registered",
                errors: "Duplicate resource"
            });
        }

        return res.status(500).json({
            success: false,
            message: err.message || "Internal Server Error",
            errors: err
        });
    }
};

const loginUser = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required",
                errors: "Missing login credentials"
            });
        }

        const result = await authService.loginUserIntoDB(req.body);

        return res.status(200).json({
            success: true,
            message: "Login successful",
            data: result
        });
    } catch (error: any) {
        if (error.message === "Invalid credentials") {
            return res.status(401).json({
                success: false,
                message: "Missing, expired, or invalid JWT token",
                errors: "Invalid email or password"
            });
        }

        return res.status(500).json({
            success: false,
            message: error.message || "Internal Server Error",
            errors: error
        });
    }
};

const refreshToken = async (req: Request, res: Response) => {
    try {
        const result = await authService.genereateRefreshToken(req.cookies.refreshToken);
        return res.status(200).json({
            success: true,
            message: "Access token generated successfully",
            data: result
        });
    } catch (error: any) {
        return res.status(401).json({
            success: false,
            message: error.message || "Unauthorized",
            errors: error
        });
    }
};

export const authController = {
    loginUser,
    refreshToken,
    createUser
};