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
      const transactionId = req.params.id;

      const items = await db.all(
        `SELECT ti.id, ti.quantity, ti.price, ti.subtotal, ti.status, 
                p.name AS product_name
         FROM transaction_items ti
         JOIN products p ON p.id = ti.product_id
         WHERE ti.transaction_id = ?`,
        [transactionId]
      );

      res.json(items);
    } catch (error) {
      console.error("Fehler beim Laden der Items:", error);
      res.status(500).json({ error: "Fehler beim Laden der Items" });
    }
  }
);

export default router;
