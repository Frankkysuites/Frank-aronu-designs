import { Router, type IRouter, type Request, type Response } from "express";
import { AdminLoginBody } from "@workspace/api-zod";

const router: IRouter = Router();

// The admin password — change this value to update the password
const ADMIN_PASSWORD = process.env["ADMIN_PASSWORD"] ?? "designer2025";
const SESSION_COOKIE = "admin_session";
const COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "lax" as const,
  // secure: true in production (set via env)
  maxAge: 24 * 60 * 60 * 1000, // 24 hours
};

// POST /admin/login
router.post("/admin/login", (req: Request, res: Response) => {
  const parsed = AdminLoginBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ success: false, message: "Password is required" });
    return;
  }

  if (parsed.data.password !== ADMIN_PASSWORD) {
    res.status(401).json({ success: false, message: "Invalid password" });
    return;
  }

  // Set a simple session cookie
  res.cookie(SESSION_COOKIE, "authenticated", COOKIE_OPTIONS);
  res.json({ success: true, message: "Logged in" });
});

// POST /admin/logout
router.post("/admin/logout", (req: Request, res: Response) => {
  res.clearCookie(SESSION_COOKIE);
  res.json({ success: true, message: "Logged out" });
});

// GET /admin/me - check session
router.get("/admin/me", (req: Request, res: Response) => {
  if (req.cookies?.[SESSION_COOKIE] === "authenticated") {
    res.json({ authenticated: true });
  } else {
    res.status(401).json({ authenticated: false });
  }
});

export default router;
