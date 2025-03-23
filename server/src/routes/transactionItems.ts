// routes/transactionItems.ts
import { Router, Request, Response } from "express";
import dbPromise from "../db/database";

const router = Router();

// GET /transaction-items/by-transaction/:id
// routes/transactionItems.ts
router.get(
  "/by-transaction/:id",
  async (req: Request, res: Response): Promise<any> => {
    try {
      const db = await dbPromise;
      const transactionId = parseInt(req.params.id);

      if (isNaN(transactionId)) {
        return res.status(400).json({ error: "Ungültige Transaktions-ID." });
      }

      const items = await db.all(
        `SELECT 
           ti.id,
           ti.quantity,
           ti.price,
           ti.subtotal,
           p.name AS product_name
         FROM transaction_items ti
         JOIN products p ON ti.product_id = p.id
         WHERE ti.transaction_id = ?`,
        [transactionId]
      );

      res.json(items);
    } catch (error) {
      console.error("Fehler beim Abrufen der Positionen:", error);
      res.status(500).json({ error: "Fehler beim Abrufen der Positionen" });
    }
  }
);

export default router;
