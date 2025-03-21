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
// 🔥 Alle Kategorien abrufen
router.get("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const db = yield database_1.default;
        const categories = yield db.all("SELECT * FROM categories");
        res.json(categories);
    }
    catch (error) {
        console.error("Fehler beim Abrufen der Kategorien:", error);
        res.status(500).json({ error: "Interner Serverfehler" });
    }
}));
// 🔥 Einzelne Kategorie nach ID abrufen
router.get("/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const db = yield database_1.default;
        const categoryId = req.params.id;
        // Prüfen, ob die ID eine Zahl ist
        if (isNaN(Number(categoryId))) {
            return res.status(400).json({ error: "Ungültige Kategorie-ID" });
        }
        const category = yield db.get("SELECT * FROM categories WHERE id = ?", [categoryId]);
        if (!category) {
            return res.status(404).json({ error: "Kategorie nicht gefunden" });
        }
        res.json(category);
    }
    catch (error) {
        console.error("Fehler beim Abrufen der Kategorie:", error);
        res.status(500).json({ error: "Interner Serverfehler" });
    }
}));
exports.default = router;
