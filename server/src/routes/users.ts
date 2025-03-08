import { Router } from "express";
import db from "../db";

const router = Router();

router.get("/", (req, res) => {
  const users = db.prepare("SELECT * FROM users").all();
  res.json(users);
});

router.post("/", (req, res) => {
  const { name, email } = req.body;
  try {
    const stmt = db.prepare("INSERT INTO users (name, email) VALUES (?, ?)");
    const result = stmt.run(name, email);
    res.status(201).json({ id: result.lastInsertRowid, name, email });
  } catch (err) {
    res.status(400).json({ error: "User exists or bad data" });
  }
});

export default router;