import type { NextFunction, Request, Response } from "express"
import jwt, { type JwtPayload } from "jsonwebtoken"
import config from "../config"
import { pool } from "../db"
import type { ROLES } from "../types"

const auth = (...roles : ROLES[]) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const authHeader = req.headers.authorization;

            if (!authHeader) {
                return res.status(401).json({
                    success: false,
                    message: "Missing, expired, or invalid JWT token",
                    errors: "Authorization token is required"
                });
            }

            // Extract token (handling both raw token and Bearer format)
            const token = authHeader.startsWith("Bearer ") 
                ? authHeader.substring(7) 
                : authHeader;

            let decoded: JwtPayload;
            try {
                decoded = jwt.verify(token, config.secret as string) as JwtPayload;
            } catch (jwtErr: any) {
                return res.status(401).json({
                    success: false,
                    message: "Missing, expired, or invalid JWT token",
                    errors: jwtErr.message || "Invalid token"
                });
            }

            // Verify user in database
            const userData = await pool.query(
                `SELECT id, name, email, role FROM users WHERE id = $1`,
                [decoded.id]
            );

            if (userData.rows.length === 0) {
                return res.status(401).json({
                    success: false,
                    message: "Missing, expired, or invalid JWT token",
                    errors: "User not found"
                });
            }

            const user = userData.rows[0];

            if (roles.length && !roles.includes(user.role as ROLES)) {
                return res.status(403).json({
                    success: false,
                    message: "Forbidden",
                    errors: "Insufficient permissions"
                });
            }

            req.user = user;
            next();
        } catch (error) {
            next(error);
        }
    }
}

export default auth;