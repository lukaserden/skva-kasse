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
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const database_1 = __importDefault(require("../db/database"));
const router = (0, express_1.Router)();
router.post("/init-admin", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const db = yield database_1.default;
        // Gibt es schon Benutzer?
        const existingUser = yield db.get("SELECT * FROM users LIMIT 1");
        if (existingUser) {
            return res.status(403).json({ error: "Admin existiert bereits." });
        }
        const { username, password } = req.body;
        if (!username || !password) {
            return res
                .status(400)
                .json({ error: "Benutzername und Passwort erforderlich." });
        }
        const hashedPassword = yield bcrypt_1.default.hash(password, 10);
        // Admin-Role ID holen (z. B. aus user_roles)
        const roleRow = yield db.get("SELECT id FROM user_roles WHERE name = 'Admin'");
        if (!roleRow) {
            return res.status(500).json({ error: "Admin-Rolle nicht gefunden." });
        }
        // Benutzer erstellen (ohne zugeordnetes Mitglied)
        const result = yield db.run(`INSERT INTO users (member_id, username, password_hash, role_id, is_active)
       VALUES (?, ?, ?, ?, ?)`, [null, username, hashedPassword, roleRow.id, 1]);
        const token = jsonwebtoken_1.default.sign({ id: result.lastID, username, role_id: roleRow.id }, process.env.JWT_SECRET, { expiresIn: "12h" });
        res.status(201).json({ success: true, token });
    }
    catch (error) {
        console.error("Fehler beim Erstellen des Admins:", error);
        res.status(500).json({ error: "Fehler beim Erstellen des Admins." });
    }
}));
exports.default = router;
