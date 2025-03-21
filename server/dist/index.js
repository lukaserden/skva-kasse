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
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5002;
app.use((0, cors_1.default)()); // Wichtig für externe Anfragen
app.use((0, morgan_1.default)("dev"));
app.use(express_1.default.json());
app.use("/products", products_1.default);
app.use("/categories", categories_1.default);
app.listen(PORT, () => {
    console.log(`Server läuft auf http://localhost:${PORT}`);
});
