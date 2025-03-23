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
/** POST /auth/login */
router.post("/login", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const db = yield database_1.default;
        const { username, password } = req.body;
        if (!username || !password) {
            return res
                .status(400)
                .json({ error: "Benutzername und Passwort erforderlich." });
        }
        const user = yield db.get(`SELECT u.*, r.name as role_name FROM users u 
       JOIN user_roles r ON u.role_id = r.id 
       WHERE u.username = ? AND u.is_active = 1`, [username]);
        if (!user) {
            return res
                .status(401)
                .json({ error: "Benutzer nicht gefunden oder inaktiv." });
        }
        const valid = yield bcrypt_1.default.compare(password, user.password_hash);
        if (!valid) {
            return res.status(401).json({ error: "Falsches Passwort." });
        }
        const token = jsonwebtoken_1.default.sign({
            id: user.id,
            username: user.username,
            role_id: user.role_id,
            role: user.role_name,
        }, "Zl1xpQ6cf9xPlNYI4cWQbR+3MXMSYQoAv1XvGozF8sc=", 
        // process.env.JWT_SECRET!,
        { expiresIn: "12h" });
        res.json({ success: true, token });
    }
    catch (error) {
        console.error("Login-Fehler:", error);
        res.status(500).json({ error: "Fehler beim Login." });
    }
}));
exports.default = router;
