"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sqlite3_1 = require("sqlite3");
const sqlite_1 = require("sqlite");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const dbPromise = (0, sqlite_1.open)({
    filename: process.env.DB_PATH || "./database.sqlite",
    driver: sqlite3_1.Database,
});
console.log("DB_PATH:", process.env.DB_PATH || "./database.sqlite");
exports.default = dbPromise;
