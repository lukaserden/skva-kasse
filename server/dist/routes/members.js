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
/** GET: Alle Mitglieder abrufen */
router.get("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const db = yield database_1.default;
        const members = yield db.all(`SELECT 
         m.*, 
         ms.name AS member_state_name 
       FROM 
         members m
       JOIN 
         member_states ms 
       ON 
         m.member_state_id = ms.id
       ORDER BY 
         m.last_name ASC, m.first_name ASC`);
        res.json(members);
    }
    catch (error) {
        console.error("Fehler beim Abrufen der Mitglieder:", error);
        res.status(500).json({ error: "Fehler beim Abrufen der Mitglieder" });
    }
}));
/** GET by ID: Einzelnes Mitglied abrufen */
router.get("/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const db = yield database_1.default;
        const member = yield db.get(`SELECT 
           m.*, 
           ms.name AS member_state_name 
         FROM 
           members m 
         JOIN 
           member_states ms 
         ON 
           m.member_state_id = ms.id 
         WHERE 
           m.id = ?`, [id]);
        if (!member) {
            return res.status(404).json({ error: "Mitglied nicht gefunden" });
        }
        res.json(member);
    }
    catch (error) {
        console.error("Fehler beim Abrufen des Mitglieds:", error);
        res.status(500).json({ error: "Fehler beim Abrufen des Mitglieds" });
    }
}));
/** POST: Neues Mitglied erstellen */
router.post("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { first_name, last_name, birthdate, email, phone, membership_number, member_state_id, discount = 0, is_active = 1, is_service_required = 1, } = req.body;
        if (!first_name ||
            !last_name ||
            !birthdate ||
            !membership_number ||
            !member_state_id) {
            return res.status(400).json({ error: "Fehlende Pflichtfelder" });
        }
        const db = yield database_1.default;
        const result = yield db.run(`INSERT INTO members 
        (first_name, last_name, birthdate, email, phone, membership_number, member_state_id, discount, is_active, is_service_required, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`, [
            first_name,
            last_name,
            birthdate,
            email,
            phone,
            membership_number,
            member_state_id,
            discount,
            is_active,
            is_service_required,
        ]);
        res.status(201).json({ success: true, member_id: result.lastID });
    }
    catch (error) {
        console.error("Fehler beim Erstellen des Mitglieds:", error);
        res.status(500).json({ error: "Fehler beim Erstellen des Mitglieds" });
    }
}));
/** PUT: Mitglied aktualisieren */
router.put("/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { first_name, last_name, birthdate, email, phone, membership_number, member_state_id, discount, is_active, is_service_required, } = req.body;
        const { id } = req.params;
        if (!first_name ||
            !last_name ||
            !birthdate ||
            !membership_number ||
            !member_state_id) {
            return res.status(400).json({ error: "Fehlende Pflichtfelder" });
        }
        const db = yield database_1.default;
        const result = yield db.run(`UPDATE members SET
        first_name = ?, last_name = ?, birthdate = ?, email = ?, phone = ?,
        membership_number = ?, member_state_id = ?, discount = ?, is_active = ?, is_service_required = ?
       WHERE id = ?`, [
            first_name,
            last_name,
            birthdate,
            email,
            phone,
            membership_number,
            member_state_id,
            discount !== null && discount !== void 0 ? discount : 0,
            is_active !== null && is_active !== void 0 ? is_active : 1,
            is_service_required !== null && is_service_required !== void 0 ? is_service_required : 1,
            id,
        ]);
        if (result.changes === 0) {
            return res.status(404).json({ error: "Mitglied nicht gefunden" });
        }
        res.json({ success: true, message: "Mitglied aktualisiert" });
    }
    catch (error) {
        console.error("Fehler beim Aktualisieren des Mitglieds:", error);
        res.status(500).json({ error: "Fehler beim Aktualisieren des Mitglieds" });
    }
}));
/** DELETE: Mitglied endgültig löschen */
router.delete("/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const db = yield database_1.default;
        const result = yield db.run("DELETE FROM members WHERE id = ?", [id]);
        if (result.changes === 0) {
            return res.status(404).json({ error: "Mitglied nicht gefunden" });
        }
        res.json({ success: true, message: "Mitglied gelöscht" });
    }
    catch (error) {
        console.error("Fehler beim Löschen des Mitglieds:", error);
        res.status(500).json({ error: "Fehler beim Löschen des Mitglieds" });
    }
}));
exports.default = router;
