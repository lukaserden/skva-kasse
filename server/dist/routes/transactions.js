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
/** GET: Alle Transaktionen abrufen */
router.get("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const db = yield database_1.default;
        const transactions = yield db.all("SELECT * FROM transactions ORDER BY timestamp DESC");
        res.json(transactions);
    }
    catch (error) {
        console.error("Fehler beim Abrufen der Transaktionen:", error);
        res.status(500).json({ error: "Fehler beim Abrufen der Transaktionen" });
    }
}));
/** GET: Alle offenen Transaktionen abrufen */
router.get("/open", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const db = yield database_1.default;
        const openTransactions = yield db.all("SELECT * FROM transactions WHERE status = 'open' ORDER BY timestamp DESC");
        res.json(openTransactions);
    }
    catch (error) {
        console.error("Fehler beim Abrufen offener Transaktionen:", error);
        res
            .status(500)
            .json({ error: "Fehler beim Abrufen offener Transaktionen" });
    }
}));
/** GET by ID: Einzelne Transaktion abrufen */
router.get("/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const db = yield database_1.default;
        const transaction = yield db.get("SELECT * FROM transactions WHERE id = ?", [id]);
        if (!transaction) {
            return res.status(404).json({ error: "Transaktion nicht gefunden" });
        }
        const items = yield db.all("SELECT * FROM transaction_items WHERE transaction_id = ?", [id]);
        res.json(Object.assign(Object.assign({}, transaction), { items }));
    }
    catch (error) {
        console.error("Fehler beim Abrufen der Transaktion:", error);
        res.status(500).json({ error: "Fehler beim Abrufen der Transaktion" });
    }
}));
/** POST: Neue Transaktion erstellen */
router.post("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const db = yield database_1.default;
        const { member_id, table_number, payment_method = "cash", status = "open", total_amount, items, } = req.body;
        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ error: "Keine Artikel angegeben" });
        }
        if (!total_amount || typeof total_amount !== "number") {
            return res
                .status(400)
                .json({ error: "total_amount fehlt oder ist ungültig" });
        }
        const cashier_id = 4;
        const result = yield db.run(`INSERT INTO transactions (
        member_id, table_number, cashier_id, total_amount,
        payment_method, status
      ) VALUES (?, ?, ?, ?, ?, ?)`, [
            member_id !== null && member_id !== void 0 ? member_id : null,
            table_number !== null && table_number !== void 0 ? table_number : null,
            cashier_id,
            total_amount,
            payment_method,
            status,
        ]);
        const transactionId = result.lastID;
        const insertItems = items.map((item) => db.run(`INSERT INTO transaction_items (transaction_id, product_id, quantity, price, status)
         VALUES (?, ?, ?, ?, ?)`, [transactionId, item.product_id, item.quantity, item.price, "new"]));
        yield Promise.all(insertItems);
        res.status(201).json({ success: true, transaction_id: transactionId });
    }
    catch (error) {
        console.error("Fehler beim Speichern der Transaktion:", error);
        res.status(500).json({ error: "Fehler beim Speichern der Transaktion" });
    }
}));
/** PUT: Transaktion aktualisieren */
router.put("/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { member_id, cashier_id, total_amount, payment_method, status, table_number, total_discount, tip, note, print_count, } = req.body;
        const { id } = req.params;
        const db = yield database_1.default;
        const result = yield db.run(`UPDATE transactions SET 
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
      WHERE id = ?`, [
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
        ]);
        if (result.changes === 0) {
            return res.status(404).json({ error: "Transaktion nicht gefunden" });
        }
        res.json({ success: true, message: "Transaktion aktualisiert" });
    }
    catch (error) {
        console.error("Fehler beim Aktualisieren der Transaktion:", error);
        res
            .status(500)
            .json({ error: "Fehler beim Aktualisieren der Transaktion" });
    }
}));
// PUT /transactions/items/:id → Status ändern (z. B. auf canceled, modified etc.)
router.put("/items/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const allowed = ["new", "modified", "canceled", "confirmed", "refunded"];
        if (!allowed.includes(status)) {
            return res.status(400).json({ error: "Ungültiger Status" });
        }
        const db = yield database_1.default;
        const result = yield db.run(`UPDATE transaction_items SET status = ? WHERE id = ?`, [status, id]);
        if (result.changes === 0) {
            return res.status(404).json({ error: "Item nicht gefunden" });
        }
        res.json({ success: true, message: `Item auf '${status}' gesetzt` });
    }
    catch (error) {
        console.error("Fehler beim Ändern des Status:", error);
        res.status(500).json({ error: "Fehler beim Ändern des Status" });
    }
}));
/** DELETE: Transaktion löschen */
router.delete("/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const db = yield database_1.default;
        const result = yield db.run("DELETE FROM transactions WHERE id = ?", [id]);
        if (result.changes === 0) {
            return res.status(404).json({ error: "Transaktion nicht gefunden" });
        }
        res.json({ success: true, message: "Transaktion gelöscht" });
    }
    catch (error) {
        console.error("Fehler beim Löschen der Transaktion:", error);
        res.status(500).json({ error: "Fehler beim Löschen der Transaktion" });
    }
}));
/** PUT: Einzelnes Transaktions-Item stornieren */
router.put("/items/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const db = yield database_1.default;
        const result = yield db.run(`UPDATE transaction_items SET status = 'canceled' WHERE id = ?`, [id]);
        if (result.changes === 0) {
            return res
                .status(404)
                .json({ error: "Item nicht gefunden oder bereits storniert" });
        }
        res.json({ success: true, message: "Item erfolgreich storniert" });
    }
    catch (error) {
        console.error("Fehler beim Stornieren des Items:", error);
        res.status(500).json({ error: "Fehler beim Stornieren des Items" });
    }
}));
exports.default = router;
