import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";

import products from "./routes/products";
import categories from "./routes/categories";
import members from "./routes/members";
import memberStates from "./routes/memberStates";
import transactions from "./routes/transactions";
import authLogin from "./routes/authLogin";
import initAdmin from "./routes/initAdmin";
import transactionItem from "./routes/transactionItems";

import authMiddleware from "./middleware/authMiddleware";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3002;

app.use(cors());
app.use(morgan("dev"));
app.use(express.json());

/* --------------------  Öffentliche Routen -------------------- */
app.use("/auth", authLogin); // POST /auth/login
app.use("/auth/", initAdmin); // POST /auth/init-admin

/* --------------------  Geschützte Routen -------------------- */
app.use("/transactions", authMiddleware, transactions);
app.use("/transaction-items", authMiddleware, transactionItem);
app.use("/products", authMiddleware, products);
app.use("/categories", authMiddleware, categories);
app.use("/members", authMiddleware, members);
app.use("/member-states", authMiddleware, memberStates);

/* -------------------- Server starten -------------------- */
app.listen(PORT, () => {
  console.log(`🚀 Server läuft auf http://localhost:${PORT}`);
});
