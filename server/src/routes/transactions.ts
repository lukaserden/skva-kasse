import { Router, Request, Response } from "express";
import dbPromise from "../db/database";

const router = Router();

/** GET: Alle Transaktionen abrufen */
router.get("/", async (req: Request, res: Response) => {
  try {
    const db = await dbPromise;
    const transactions = await db.all(
      `SELECT t.*, 
          m.first_name || ' ' || m.last_name AS member_name,
          c.first_name || ' ' || c.last_name AS cashier_name
       FROM transactions t
       LEFT JOIN members m ON t.member_id = m.id
       LEFT JOIN members c ON t.cashier_id = c.id
       ORDER BY t.timestamp DESC`
    );
    res.json(transactions);
  } catch (error) {
    console.error("Fehler beim Abrufen der Transaktionen:", error);
    res.status(500).json({ error: "Fehler beim Abrufen der Transaktionen" });
  }
});

/** GET: Alle offenen Transaktionen abrufen */
router.get("/open", async (req: Request, res: Response): Promise<any> => {
  try {
    const db = await dbPromise;

    const openTransactions = await db.all(
      "SELECT * FROM transactions WHERE status = 'open' ORDER BY timestamp DESC"
    );

    res.json(openTransactions);
  } catch (error) {
    console.error("Fehler beim Abrufen offener Transaktionen:", error);
    res
      .status(500)
      .json({ error: "Fehler beim Abrufen offener Transaktionen" });
  }
});

/** GET by ID: Einzelne Transaktion abrufen */
router.get("/:id", async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const db = await dbPromise;
    const transaction = await db.get(
      "SELECT * FROM transactions WHERE id = ?",
      [id]
    );

    if (!transaction) {
      return res.status(404).json({ error: "Transaktion nicht gefunden" });
    }

    const items = await db.all(
      "SELECT * FROM transaction_items WHERE transaction_id = ?",
      [id]
    );

    res.json({ ...transaction, items });
  } catch (error) {
    console.error("Fehler beim Abrufen der Transaktion:", error);
    res.status(500).json({ error: "Fehler beim Abrufen der Transaktion" });
  }
});

/** POST: Neue Transaktion erstellen */
router.post("/", async (req: Request, res: Response): Promise<any> => {
  try {
    const db = await dbPromise;
    const {
      member_id,
      table_number,
      payment_method = "cash",
      status = "open",
      total_amount,
      items,
    } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "Keine Artikel angegeben" });
    }

    if (!total_amount || typeof total_amount !== "number") {
      return res
        .status(400)
        .json({ error: "total_amount fehlt oder ist ungültig" });
    }

    const cashier_id = 4;

    const result = await db.run(
      `INSERT INTO transactions (
        member_id, table_number, cashier_id, total_amount,
        payment_method, status
      ) VALUES (?, ?, ?, ?, ?, ?)`,
      [
        member_id ?? null,
        table_number ?? null,
        cashier_id,
        total_amount,
        payment_method,
        status,
      ]
    );

    const transactionId = result.lastID;

    const insertItems = items.map((item: any) =>
      db.run(
        `INSERT INTO transaction_items (transaction_id, product_id, quantity, price, status)
         VALUES (?, ?, ?, ?, ?)`,
        [transactionId, item.product_id, item.quantity, item.price, "new"]
      )
    );

    await Promise.all(insertItems);

    res.status(201).json({ success: true, transaction_id: transactionId });
  } catch (error) {
    console.error("Fehler beim Speichern der Transaktion:", error);
    res.status(500).json({ error: "Fehler beim Speichern der Transaktion" });
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
      print_count,
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
      [
        member_id,
        cashier_id,
        total_amount,
        payment_method,
        status,
        table_number,
        total_discount,
        tip,
        note,
        print_count,
        id,
      ]
    );

    if (result.changes === 0) {
      return res.status(404).json({ error: "Transaktion nicht gefunden" });
    }

    res.json({ success: true, message: "Transaktion aktualisiert" });
  } catch (error) {
    console.error("Fehler beim Aktualisieren der Transaktion:", error);
    res
      .status(500)
      .json({ error: "Fehler beim Aktualisieren der Transaktion" });
  }
});

// PUT /transactions/items/:id → Status ändern (z. B. auf canceled, modified etc.)
router.put("/items/:id", async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowed = ["new", "modified", "canceled", "confirmed", "refunded"];
    if (!allowed.includes(status)) {
      return res.status(400).json({ error: "Ungültiger Status" });
    }

    const db = await dbPromise;
    const result = await db.run(
      `UPDATE transaction_items SET status = ? WHERE id = ?`,
      [status, id]
    );

    if (result.changes === 0) {
      return res.status(404).json({ error: "Item nicht gefunden" });
    }

    res.json({ success: true, message: `Item auf '${status}' gesetzt` });
  } catch (error) {
    console.error("Fehler beim Ändern des Status:", error);
    res.status(500).json({ error: "Fehler beim Ändern des Status" });
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

/** PUT: Einzelnes Transaktions-Item stornieren */
router.put("/items/:id", async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const db = await dbPromise;

    const result = await db.run(
      `UPDATE transaction_items SET status = 'canceled' WHERE id = ?`,
      [id]
    );

    if (result.changes === 0) {
      return res
        .status(404)
        .json({ error: "Item nicht gefunden oder bereits storniert" });
    }

    res.json({ success: true, message: "Item erfolgreich storniert" });
  } catch (error) {
    console.error("Fehler beim Stornieren des Items:", error);
    res.status(500).json({ error: "Fehler beim Stornieren des Items" });
  }
});

export default router;
