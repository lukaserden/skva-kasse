import { Router } from "express";
import dbPromise from "../db/database";

const router = Router();

// 🔥 Alle Kategorien abrufen
router.get("/", async (req, res) => {
  try {
    const db = await dbPromise;
    const categories = await db.all("SELECT * FROM categories");
    res.json(categories);
  } catch (error) {
    console.error("Fehler beim Abrufen der Kategorien:", error);
    res.status(500).json({ error: "Interner Serverfehler" });
  }
});

// 🔥 Einzelne Kategorie nach ID abrufen
router.get("/:id", async (req, res) : Promise<any> => {
  try {
    const db = await dbPromise;
    const categoryId = req.params.id;

    // Prüfen, ob die ID eine Zahl ist
    if (isNaN(Number(categoryId))) {
      return res.status(400).json({ error: "Ungültige Kategorie-ID" });
    }

    const category = await db.get("SELECT * FROM categories WHERE id = ?", [categoryId]);

    if (!category) {
      return res.status(404).json({ error: "Kategorie nicht gefunden" });
    }

    res.json(category);
  } catch (error) {
    console.error("Fehler beim Abrufen der Kategorie:", error);
    res.status(500).json({ error: "Interner Serverfehler" });
  }
});

export default router;