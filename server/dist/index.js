"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const morgan_1 = __importDefault(require("morgan"));
const dotenv_1 = __importDefault(require("dotenv"));
const products_1 = __importDefault(require("./routes/products"));
const categories_1 = __importDefault(require("./routes/categories"));
const members_1 = __importDefault(require("./routes/members"));
const memberStates_1 = __importDefault(require("./routes/memberStates"));
const transactions_1 = __importDefault(require("./routes/transactions"));
const authLogin_1 = __importDefault(require("./routes/authLogin"));
const initAdmin_1 = __importDefault(require("./routes/initAdmin"));
const authMiddleware_1 = __importDefault(require("./middleware/authMiddleware"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3002;
app.use((0, cors_1.default)());
app.use((0, morgan_1.default)("dev"));
app.use(express_1.default.json());
/* --------------------  Öffentliche Routen -------------------- */
app.use("/auth", authLogin_1.default); // POST /auth/login
app.use("/auth/", initAdmin_1.default); // POST /auth/init-admin
/* --------------------  Geschützte Routen -------------------- */
app.use("/transactions", authMiddleware_1.default, transactions_1.default);
app.use("/products", authMiddleware_1.default, products_1.default);
app.use("/categories", authMiddleware_1.default, categories_1.default);
app.use("/members", authMiddleware_1.default, members_1.default);
app.use("/member-states", authMiddleware_1.default, memberStates_1.default);
/* -------------------- Server starten -------------------- */
app.listen(PORT, () => {
    console.log(`🚀 Server läuft auf http://localhost:${PORT}`);
});
