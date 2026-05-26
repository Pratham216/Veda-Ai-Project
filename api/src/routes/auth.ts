import { Router } from "express";
import { z } from "zod";
import { UserModel, hashPassword, verifyPassword, publicUser } from "../models/User.js";
import { requireAuth, signToken, type AuthedRequest } from "../middleware/auth.js";

const router = Router();

const SignupSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(80),
  email: z.string().trim().toLowerCase().email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters").max(128),
  schoolName: z.string().trim().max(200).optional().default(""),
  location: z.string().trim().max(200).optional().default(""),
});

const LoginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email"),
  password: z.string().min(1, "Password is required").max(128),
});

router.post("/signup", async (req, res) => {
  const parsed = SignupSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid input", details: parsed.error.flatten() });
  }
  const { name, email, password, schoolName, location } = parsed.data;

  const existing = await UserModel.findOne({ email });
  if (existing) {
    return res.status(409).json({ error: "An account with this email already exists" });
  }

  const passwordHash = await hashPassword(password);
  const created = await UserModel.create({ name, email, passwordHash, schoolName, location });
  const token = signToken({ sub: String(created._id), email: created.email });
  res.status(201).json({ token, user: publicUser(created as never) });
});

router.post("/login", async (req, res) => {
  const parsed = LoginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid input", details: parsed.error.flatten() });
  }
  const { email, password } = parsed.data;

  const user = await UserModel.findOne({ email });
  if (!user) return res.status(401).json({ error: "Invalid email or password" });
  const ok = await verifyPassword(password, user.passwordHash);
  if (!ok) return res.status(401).json({ error: "Invalid email or password" });

  const token = signToken({ sub: String(user._id), email: user.email });
  res.json({ token, user: publicUser(user as never) });
});

router.get("/me", requireAuth, async (req: AuthedRequest, res) => {
  const user = await UserModel.findById(req.userId);
  if (!user) return res.status(404).json({ error: "User not found" });
  res.json({ user: publicUser(user as never) });
});

export default router;
