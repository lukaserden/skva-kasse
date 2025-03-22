import { Router, Request, Response } from "express";
import dbPromise from "../db/database";

const router = Router();

/** GET: Alle Mitgliedsstatus abrufen */
router.get("/", async (req: Request, res: Response) => {
  try {
    const db = await dbPromise;
    const states = await db.all("SELECT * FROM member_states ORDER BY id ASC");
    res.json(states);
  } catch (error) {
    console.error("Fehler beim Abrufen der Mitgliedsstatus:", error);
    res.status(500).json({ error: "Fehler beim Abrufen der Mitgliedsstatus" });
  }
});

export default router;