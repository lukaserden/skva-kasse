"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        res.status(401).json({ error: "Kein Token übermittelt." });
        return;
    }
    const token = authHeader.split(" ")[1];
    try {
        const decoded = jsonwebtoken_1.default.verify(token, "Zl1xpQ6cf9xPlNYI4cWQbR+3MXMSYQoAv1XvGozF8sc=");
        // const decoded = jwt.verify(token, "Zl1xpQ6cf9xPlNYI4cWQbR+3MXMSYQoAv1XvGozF8sc=" ||process.env.JWT_SECRET!);
        req.user = decoded;
        next();
    }
    catch (error) {
        res.status(403).json({ error: "Ungültiger oder abgelaufener Token." });
        return;
    }
};
exports.default = authMiddleware;
