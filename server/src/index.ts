import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import productRoutes from "./routes/products";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors()); // Wichtig für externe Anfragen
app.use(morgan("dev"));
app.use(express.json());

app.use("/products", productRoutes);

app.listen(PORT, () => {
  console.log(`Server läuft auf http://localhost:${PORT}`);
});
