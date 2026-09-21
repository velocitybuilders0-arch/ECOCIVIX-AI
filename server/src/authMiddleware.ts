import { NextFunction, Request, Response } from "express";
import { supabase } from "./db/supabaseClient.js";

export type AuthenticatedRequest = Request & {
  authUser?: { id: string; app_metadata?: Record<string, unknown> };
};

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authorization = req.header("authorization");
  const token = authorization?.startsWith("Bearer ") ? authorization.slice(7) : null;
  if (!token) {
    return res.status(401).json({ error: "Authentication required" });
  }

  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) {
    return res.status(401).json({ error: "Invalid or expired session" });
  }

  (req as AuthenticatedRequest).authUser = data.user;
  next();
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const user = (req as AuthenticatedRequest).authUser;
  if (user?.app_metadata?.role !== "admin" && user?.app_metadata?.role !== "staff") {
    return res.status(403).json({ error: "Staff or admin access required" });
  }
  next();
}
