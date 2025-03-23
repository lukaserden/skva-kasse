// routes/transactionItems.ts
import { Router, Request, Response } from "express";
import dbPromise from "../db/database";

const router = Router();

// GET /transaction-items/by-transaction/:id
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
        `SELECT * FROM transaction_items WHERE transaction_id = ?`,
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
