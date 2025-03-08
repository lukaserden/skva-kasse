import express from "express";
import dotenv from "dotenv";
import usersRouter from "./routes/users";
import transactionsRouter from "./routes/transactions";

dotenv.config();

const app = express();
app.use(express.json());

app.use("/users", usersRouter);
app.use("/transactions", transactionsRouter);

export default app;