import { Router, Request, Response } from "express";
import dbPromise from "../db/database";

const router = Router();

/** GET: Alle Transaktionen abrufen */
router.get("/", async (req: Request, res: Response) => {
  try {
    const db = await dbPromise;
    const transactions = await db.all("SELECT * FROM transactions ORDER BY timestamp DESC");
    res.json(transactions);
  } catch (error) {
    console.error("Fehler beim Abrufen der Transaktionen:", error);
    res.status(500).json({ error: "Fehler beim Abrufen der Transaktionen" });
  }
});

/** GET by ID: Einzelne Transaktion abrufen */
router.get("/:id", async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const db = await dbPromise;
    const transaction = await db.get("SELECT * FROM transactions WHERE id = ?", [id]);

    if (!transaction) {
      return res.status(404).json({ error: "Transaktion nicht gefunden" });
    }

    res.json(transaction);
  } catch (error) {
    console.error("Fehler beim Abrufen der Transaktion:", error);
    res.status(500).json({ error: "Fehler beim Abrufen der Transaktion" });
  }
});

/** POST: Neue Transaktion erstellen */
router.post("/", async (req: Request, res: Response): Promise<any> => {
  try {
    const {
      member_id,
      cashier_id,
      total_amount,
      payment_method,
      status,
      table_number,
      total_discount,
      tip,
      note,
    } = req.body;

    const db = await dbPromise;

    const result = await db.run(
      `INSERT INTO transactions 
        (timestamp, member_id, cashier_id, total_amount, payment_method, status, table_number, total_discount, tip, note, print_count) 
       VALUES 
        (datetime('now'), ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)`,
      [member_id, cashier_id, total_amount, payment_method, status, table_number, total_discount, tip, note]
    );

    res.status(201).json({
      success: true,
      message: "Transaktion erstellt",
      transaction_id: result.lastID,
    });
  } catch (error) {
    console.error("Fehler beim Erstellen der Transaktion:", error);
    res.status(500).json({ error: "Fehler beim Erstellen der Transaktion" });
  }
});

/** PUT: Transaktion aktualisieren */
router.put("/:id", async (req: Request, res: Response): Promise<any> => {
  try {
    const {
      member_id,
      cashier_id,
      total_amount,
      payment_method,
      status,
      table_number,
      total_discount,
      tip,
      note,
      print_count
    } = req.body;

    const { id } = req.params;
    const db = await dbPromise;

    const result = await db.run(
      `UPDATE transactions SET 
        member_id = ?, 
        cashier_id = ?, 
        total_amount = ?, 
        payment_method = ?, 
        status = ?, 
        table_number = ?, 
        total_discount = ?, 
        tip = ?, 
        note = ?, 
        print_count = ?, 
        last_printed_at = datetime('now')
      WHERE id = ?`,
      [member_id, cashier_id, total_amount, payment_method, status, table_number, total_discount, tip, note, print_count, id]
    );

    if (result.changes === 0) {
      return res.status(404).json({ error: "Transaktion nicht gefunden" });
    }

    res.json({ success: true, message: "Transaktion aktualisiert" });
  } catch (error) {
    console.error("Fehler beim Aktualisieren der Transaktion:", error);
    res.status(500).json({ error: "Fehler beim Aktualisieren der Transaktion" });
  }
});

/** DELETE: Transaktion löschen */
router.delete("/:id", async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const db = await dbPromise;

    const result = await db.run("DELETE FROM transactions WHERE id = ?", [id]);

    if (result.changes === 0) {
      return res.status(404).json({ error: "Transaktion nicht gefunden" });
    }

    res.json({ success: true, message: "Transaktion gelöscht" });
  } catch (error) {
    console.error("Fehler beim Löschen der Transaktion:", error);
    res.status(500).json({ error: "Fehler beim Löschen der Transaktion" });
  }
});

export default router;