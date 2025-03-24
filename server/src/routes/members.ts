import { Router, Request, Response } from "express";
import dbPromise from "../db/database";

const router = Router();

/** GET: Alle Mitglieder abrufen (mit optionalem Suchbegriff + Pagination) */
router.get("/", async (req: Request, res: Response): Promise<any> => {
  try {
    const db = await dbPromise;
    const { search = "", limit = 50, offset = 0 } = req.query;

    const params: any[] = [];
    let whereClause = "";

    if (search) {
      whereClause = `WHERE LOWER(m.first_name || ' ' || m.last_name) LIKE ?`;
      params.push(`%${(search as string).toLowerCase()}%`);
    }

    const total = await db.get(
      `SELECT COUNT(*) as count FROM members m ${whereClause}`,
      params
    );

    const members = await db.all(
      `SELECT 
         m.*, 
         ms.name AS member_state_name 
       FROM 
         members m
       JOIN 
         member_states ms ON m.member_state_id = ms.id
       ${whereClause}
       ORDER BY 
         m.last_name ASC, m.first_name ASC
       LIMIT ? OFFSET ?`,
      [...params, Number(limit), Number(offset)]
    );

    res.json({ data: members, total: total.count });
  } catch (error) {
    console.error("Fehler beim Abrufen der Mitglieder:", error);
    res.status(500).json({ error: "Fehler beim Abrufen der Mitglieder" });
  }
});

/** POST: Neues Mitglied erstellen */
router.post("/", async (req: Request, res: Response): Promise<any> => {
  try {
    const {
      first_name,
      last_name,
      birthdate,
      email,
      phone,
      membership_number,
      member_state_id,
      discount = 0,
      is_active = 1,
      is_service_required = 1,
    } = req.body;

    if (
      !first_name ||
      !last_name ||
      !birthdate ||
      !membership_number ||
      !member_state_id
    ) {
      return res.status(400).json({ error: "Fehlende Pflichtfelder" });
    }

    const db = await dbPromise;
    const result = await db.run(
      `INSERT INTO members 
        (first_name, last_name, birthdate, email, phone, membership_number, member_state_id, discount, is_active, is_service_required, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
      [
        first_name,
        last_name,
        birthdate,
        email,
        phone,
        membership_number,
        member_state_id,
        discount,
        is_active,
        is_service_required,
      ]
    );

    res.status(201).json({ success: true, member_id: result.lastID });
  } catch (error) {
    console.error("Fehler beim Erstellen des Mitglieds:", error);
    res.status(500).json({ error: "Fehler beim Erstellen des Mitglieds" });
  }
});

/** PUT: Mitglied aktualisieren */
router.put("/:id", async (req: Request, res: Response): Promise<any> => {
  try {
    const {
      first_name,
      last_name,
      birthdate,
      email,
      phone,
      membership_number,
      member_state_id,
      discount,
      is_active,
      is_service_required,
    } = req.body;

    const { id } = req.params;

    if (
      !first_name ||
      !last_name ||
      !birthdate ||
      !membership_number ||
      !member_state_id
    ) {
      return res.status(400).json({ error: "Fehlende Pflichtfelder" });
    }

    const db = await dbPromise;
    const result = await db.run(
      `UPDATE members SET
        first_name = ?, last_name = ?, birthdate = ?, email = ?, phone = ?,
        membership_number = ?, member_state_id = ?, discount = ?, is_active = ?, is_service_required = ?
       WHERE id = ?`,
      [
        first_name,
        last_name,
        birthdate,
        email,
        phone,
        membership_number,
        member_state_id,
        discount ?? 0,
        is_active ?? 1,
        is_service_required ?? 1,
        id,
      ]
    );

    if (result.changes === 0) {
      return res.status(404).json({ error: "Mitglied nicht gefunden" });
    }

    res.json({ success: true, message: "Mitglied aktualisiert" });
  } catch (error) {
    console.error("Fehler beim Aktualisieren des Mitglieds:", error);
    res.status(500).json({ error: "Fehler beim Aktualisieren des Mitglieds" });
  }
});

/** DELETE: Mitglied endgültig löschen */
router.delete("/:id", async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const db = await dbPromise;

    const result = await db.run("DELETE FROM members WHERE id = ?", [id]);

    if (result.changes === 0) {
      return res.status(404).json({ error: "Mitglied nicht gefunden" });
    }

    res.json({ success: true, message: "Mitglied gelöscht" });
  } catch (error) {
    console.error("Fehler beim Löschen des Mitglieds:", error);
    res.status(500).json({ error: "Fehler beim Löschen des Mitglieds" });
  }
});

export default router;
