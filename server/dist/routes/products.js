"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const database_1 = __importDefault(require("../db/database"));
const router = (0, express_1.Router)();
/** GET: Alle aktiven Produkte abrufen */
router.get("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const db = yield database_1.default;
        const products = yield db.all("SELECT * FROM products");
        res.json(products);
    }
    catch (error) {
        console.error("Fehler beim Abrufen der Produkte:", error);
        res.status(500).json({ error: "Fehler beim Abrufen der Produkte" });
    }
}));
/** GET by ID: Einzelnes Produkt abrufen */
router.get("/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const db = yield database_1.default;
        const product = yield db.get("SELECT * FROM products WHERE id = ?", [id]);
        if (!product) {
            return res.status(404).json({ error: "Produkt nicht gefunden" });
        }
        res.json(product);
    }
    catch (error) {
        console.error("Fehler beim Abrufen des Produkts:", error);
        res.status(500).json({ error: "Fehler beim Abrufen des Produkts" });
    }
}));
/** POST: Neues Produkt erstellen */
router.post("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, price, category_id, is_active } = req.body;
        const db = yield database_1.default;
        yield db.run("INSERT INTO products (name, price, category_id, is_active) VALUES (?, ?, ?, ?)", [name, price, category_id, is_active !== null && is_active !== void 0 ? is_active : 1]);
        res.status(201).json({ success: true, message: "Produkt erstellt" });
    }
    catch (error) {
        if (error.message.includes("UNIQUE constraint failed")) {
            res.status(400).json({ error: "Produktname existiert bereits" });
        }
        else {
            res.status(500).json({ error: "Fehler beim Erstellen des Produkts" });
        }
    }
}));
/** PUT: Produkt aktualisieren */
router.put("/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, price, category_id, is_active } = req.body;
        const { id } = req.params;
        if (!name || price === undefined || !category_id) {
            return res.status(400).json({ error: "Fehlende Felder" });
        }
        const db = yield database_1.default;
        const result = yield db.run("UPDATE products SET name = ?, price = ?, category_id = ?, is_active = ?, updated_at = datetime('now') WHERE id = ?", [name, price, category_id, is_active !== null && is_active !== void 0 ? is_active : 1, id]);
        if (result.changes === 0) {
            return res.status(404).json({ error: "Produkt nicht gefunden" });
        }
        res.json({ success: true, message: "Produkt aktualisiert" });
    }
    catch (error) {
        console.error("Fehler beim Aktualisieren des Produkts:", error);
        res.status(500).json({ error: "Fehler beim Aktualisieren des Produkts" });
    }
}));
/** DELETE: Produkt dauerhaft aus der DB entfernen */
router.delete("/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const db = yield database_1.default;
        const result = yield db.run("DELETE FROM products WHERE id = ?", [id]);
        if (result.changes === 0) {
            return res.status(404).json({ error: "Produkt nicht gefunden" });
        }
        res.json({ success: true, message: "Produkt dauerhaft gelöscht" });
    }
    catch (error) {
        console.error("Fehler beim Löschen des Produkts:", error);
        res.status(500).json({ error: "Fehler beim Löschen des Produkts" });
    }
}));
exports.default = router;
