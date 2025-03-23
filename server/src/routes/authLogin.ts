import { Router, Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dbPromise from "../db/database";

const router = Router();

/** POST /auth/login */
router.post("/login", async (req: Request, res: Response): Promise<any> => {
  try {
    const db = await dbPromise;
    const { username, password } = req.body;

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

    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        role_id: user.role_id,
        role: user.role_name,
      },
      "Zl1xpQ6cf9xPlNYI4cWQbR+3MXMSYQoAv1XvGozF8sc=",
      // process.env.JWT_SECRET!,
      { expiresIn: "12h" }
    );

    res.json({ success: true, token });
  } catch (error) {
    console.error("Login-Fehler:", error);
    res.status(500).json({ error: "Fehler beim Login." });
  }
});

export default router;
