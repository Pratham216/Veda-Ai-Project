import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { config } from "../config.js";

export type AuthedRequest = Request & { userId?: string; userEmail?: string };

export function signToken(payload: { sub: string; email: string }): string {
  return jwt.sign(payload, config.auth.jwtSecret, { expiresIn: config.auth.jwtExpiresIn } as jwt.SignOptions);
}

export function verifyToken(token: string): { sub: string; email: string } | null {
  try {
    const decoded = jwt.verify(token, config.auth.jwtSecret) as jwt.JwtPayload;
    if (typeof decoded.sub !== "string" || typeof decoded.email !== "string") return null;
    return { sub: decoded.sub, email: decoded.email };
  } catch {
    return null;
  }
}

export function requireAuth(req: AuthedRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (!token) return res.status(401).json({ error: "Missing token" });
  const claims = verifyToken(token);
  if (!claims) return res.status(401).json({ error: "Invalid or expired token" });
  req.userId = claims.sub;
  req.userEmail = claims.email;
  next();
}
