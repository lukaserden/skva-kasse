import { Router } from "express";
import dbPromise from "../db/database";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const db = await dbPromise;
    const products = await db.all("SELECT * FROM products WHERE is_active = 1");
    res.json(products);
  } catch (error) {
    console.error("Fehler beim Abrufen der Produkte:", error);
    res.status(500).json({ error: "Interner Serverfehler" });
  }
});

export default router;