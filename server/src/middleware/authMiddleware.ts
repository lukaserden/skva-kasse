import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";



interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    username: string;
    role_id: number;
    role: string;
  };
}

const authMiddleware = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  console.log("🪪 Authorization Header:", req.headers.authorization);
  
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ error: "Kein Token übermittelt." });
    return;
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    req.user = decoded as AuthenticatedRequest["user"];

    console.log("🔓 Authenticated User:", decoded);
    
    next();
  } catch (error) {
    console.warn("❌ Token ungültig oder abgelaufen:", error);
    res.status(401).json({ error: "Token abgelaufen oder ungültig." });
  }
};

export default authMiddleware;
export type { AuthenticatedRequest };
