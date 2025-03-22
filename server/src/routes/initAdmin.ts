import { Router, Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dbPromise from "../db/database";


const router = Router();

router.post(
  "/init-admin",
  async (req: Request, res: Response): Promise<any> => {
    try {
      const db = await dbPromise;

      // Gibt es schon Benutzer?
      const existingUser = await db.get("SELECT * FROM users LIMIT 1");
      if (existingUser) {
        return res.status(403).json({ error: "Admin existiert bereits." });
      }

      const { username, password } = req.body;
      if (!username || !password) {
        return res
          .status(400)
          .json({ error: "Benutzername und Passwort erforderlich." });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      // Admin-Role ID holen (z. B. aus user_roles)
      const roleRow = await db.get(
        "SELECT id FROM user_roles WHERE name = 'Admin'"
      );
      if (!roleRow) {
        return res.status(500).json({ error: "Admin-Rolle nicht gefunden." });
      }

      // Benutzer erstellen (ohne zugeordnetes Mitglied)
      const result = await db.run(
        `INSERT INTO users (member_id, username, password_hash, role_id, is_active)
       VALUES (?, ?, ?, ?, ?)`,
        [null, username, hashedPassword, roleRow.id, 1]
      );

      const token = jwt.sign(
        { id: result.lastID, username, role_id: roleRow.id },
        process.env.JWT_SECRET!,
        { expiresIn: "12h" }
      );

      res.status(201).json({ success: true, token });
    } catch (error) {
      console.error("Fehler beim Erstellen des Admins:", error);
      res.status(500).json({ error: "Fehler beim Erstellen des Admins." });
    }
  }
);

export default router;
