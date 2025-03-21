import { Database } from "sqlite3";
import { open } from "sqlite";
import dotenv from "dotenv";

dotenv.config();

const dbPromise = open({
  filename: process.env.DB_PATH || "./database.sqlite",
  driver: Database,
});

console.log("DB_PATH:", process.env.DB_PATH || "./database.sqlite");

export default dbPromise;