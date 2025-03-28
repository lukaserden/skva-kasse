import { Router, Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dbPromise from "../db/database";
import { AuthenticatedRequest } from "../middleware/authMiddleware";
import authMiddleware from "../middleware/authMiddleware";

const router = Router();

/** POST /auth/login */
router.post("/login", async (req: Request, res: Response): Promise<any> => {
  try {
    const db = await dbPromise;
    const { username, password } = req.body;

    console.log("[Login] Eingehende Login-Daten:", { username });

    if (!username || !password) {
      return res
        .status(400)
        .json({ error: "Benutzername und Passwort erforderlich." });
    }

    const user = await db.get(
      `SELECT u.*, r.name as role_name FROM users u 
       JOIN user_roles r ON u.role_id = r.id 
       WHERE u.username = ? AND u.is_active = 1`,
      [username]
    );

    if (!user) {
      return res
        .status(401)
        .json({ error: "Benutzer nicht gefunden oder inaktiv." });
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: "Falsches Passwort." });
    }

    // 1. Access Token (kurzlebig)
    const accessToken = jwt.sign(
      {
        id: user.id,
        username: user.username,
        role_id: user.role_id,
        role: user.role_name,
      },
      process.env.JWT_SECRET!,
      { expiresIn: "10s" } // kurz
    );

    // 2. Refresh Token (langlebig)
    const refreshToken = jwt.sign(
      {
        id: user.id,
        username: user.username,
        role_id: user.role_id,
        role: user.role_name,
      },
      process.env.JWT_SECRET!,
      { expiresIn: "7d" } // lang
    );

    console.log("[Login] Access Token:", accessToken?.substring(0, 30) + "...");
    console.log(
      "[Login] Refresh Token (nur Anfang):",
      refreshToken?.substring(0, 30) + "..."
    );

    // 3. Refresh Token als HttpOnly Cookie setzen
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 Tage
    });

    // 4. Access Token zurückgeben
    res.json({ success: true, accessToken });
  } catch (error) {
    console.error("Login-Fehler:", error);
    res.status(500).json({ error: "Fehler beim Login." });
  }
});

/** POST /auth/refresh */
router.post("/refresh", (req: Request, res: Response): any => {
  const token = req.cookies.refreshToken;

  if (!token) {
    return res.status(401).json({ error: "Kein Refresh Token übermittelt." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);

    // Neuen Access Token erstellen
    const accessToken = jwt.sign(
      {
        id: (decoded as any).id,
        username: (decoded as any).username,
        role_id: (decoded as any).role_id,
        role: (decoded as any).role,
      },
      process.env.JWT_SECRET!,
      { expiresIn: "1h" }
    );

    res.json({ success: true, accessToken });
  } catch (error) {
    return res
      .status(403)
      .json({ error: "Ungültiger oder abgelaufener Refresh Token." });
  }
});

/** POST /auth/logout */
router.post("/logout", (_req: Request, res: Response) => {
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
  });

  res.json({ success: true, message: "Logout erfolgreich" });
});

/** GET /auth/me */
router.get(
  "/me",
  authMiddleware,
  (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      res.status(401).json({ error: "Nicht eingeloggt" });
      return;
    }

    res.json(req.user); // ✅ kein return nötig
  }
);

export default router;
