import { Router, Request, Response } from "express";
import dbPromise from "../db/database";

const router = Router();

/** GET: Alle aktiven Produkte abrufen */
router.get("/", async (req: Request, res: Response) => {
  try {
    const db = await dbPromise;
    const products = await db.all("SELECT * FROM products");
    res.json(products);
  } catch (error) {
    console.error("Fehler beim Abrufen der Produkte:", error);
    res.status(500).json({ error: "Fehler beim Abrufen der Produkte" });
  }
});

/** GET by ID: Einzelnes Produkt abrufen */
router.get("/:id", async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const db = await dbPromise;
    const product = await db.get("SELECT * FROM products WHERE id = ?", [id]);

    if (!product) {
      return res.status(404).json({ error: "Produkt nicht gefunden" });
    }

    res.json(product);
  } catch (error) {
    console.error("Fehler beim Abrufen des Produkts:", error);
    res.status(500).json({ error: "Fehler beim Abrufen des Produkts" });
  }
});

/** POST: Neues Produkt erstellen */
router.post("/", async (req: Request, res: Response): Promise<any> => {
  try {
    const { name, price, category_id, is_active } = req.body;
    const db = await dbPromise;

    await db.run(
      "INSERT INTO products (name, price, category_id, is_active) VALUES (?, ?, ?, ?)",
      [name, price, category_id, is_active ?? 1]
    );

    res.status(201).json({ success: true, message: "Produkt erstellt" });
  } catch (error: any) {
    if (error.message.includes("UNIQUE constraint failed")) {
      res.status(400).json({ error: "Produktname existiert bereits" });
    } else {
      res.status(500).json({ error: "Fehler beim Erstellen des Produkts" });
    }
  }
});

/** PUT: Produkt aktualisieren */
router.put("/:id", async (req: Request, res: Response): Promise<any> => {
  try {
    const { name, price, category_id, is_active } = req.body;
    const { id } = req.params;

    if (!name || price === undefined || !category_id) {
      return res.status(400).json({ error: "Fehlende Felder" });
    }

    const db = await dbPromise;
    const result = await db.run(
      "UPDATE products SET name = ?, price = ?, category_id = ?, is_active = ?, updated_at = datetime('now') WHERE id = ?",
      [name, price, category_id, is_active ?? 1, id]
    );

    if (result.changes === 0) {
      return res.status(404).json({ error: "Produkt nicht gefunden" });
    }

    res.json({ success: true, message: "Produkt aktualisiert" });
  } catch (error) {
    console.error("Fehler beim Aktualisieren des Produkts:", error);
    res.status(500).json({ error: "Fehler beim Aktualisieren des Produkts" });
  }
});

/** DELETE: Produkt dauerhaft aus der DB entfernen */
router.delete("/:id", async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const db = await dbPromise;

    const result = await db.run("DELETE FROM products WHERE id = ?", [id]);

    if (result.changes === 0) {
      return res.status(404).json({ error: "Produkt nicht gefunden" });
    }

    res.json({ success: true, message: "Produkt dauerhaft gelöscht" });
  } catch (error) {
    console.error("Fehler beim Löschen des Produkts:", error);
    res.status(500).json({ error: "Fehler beim Löschen des Produkts" });
  }
});

export default router;
