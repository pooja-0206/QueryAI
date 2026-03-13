import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import multer from "multer";
import { fileURLToPath } from "url";
import fs from "fs";
import Database from "@db-pkg/better-sqlite3";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Papa from "papaparse";
import * as XLSX from "xlsx";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || "voxsql-secret";

// Database Setup
const db = new Database("voxsql.db");

// Initialize Auth Tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE,
    password TEXT,
    name TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS user_databases (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    name TEXT,
    table_name TEXT,
    schema TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );
`);

app.use(express.json());

// Auth Middleware
const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// --- Auth Routes ---
app.post("/api/auth/register", async (req, res) => {
  const { email, password, name } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const stmt = db.prepare("INSERT INTO users (email, password, name) VALUES (?, ?, ?)");
    const info = stmt.run(email, hashedPassword, name);
    res.status(201).json({ id: info.lastInsertRowid });
  } catch (error) {
    res.status(400).json({ error: "Email already exists" });
  }
});

app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;
  const user: any = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
  if (!user) return res.status(400).json({ error: "User not found" });

  const validPassword = await bcrypt.compare(password, user.password);
  if (!validPassword) return res.status(400).json({ error: "Invalid password" });

  const token = jwt.sign({ id: user.id, email: user.email, name: user.name }, JWT_SECRET);
  res.json({ token, user: { id: user.id, email: user.email, name: user.name } });
});

// --- Data Upload Routes ---
const upload = multer({ dest: "uploads/" });

app.post("/api/data/upload", authenticateToken, upload.single("file"), async (req: any, res) => {
  const file = req.file;
  const userId = req.user.id;
  const dbName = req.body.name || file.originalname;

  if (!file) return res.status(400).json({ error: "No file uploaded" });

  try {
    let data: any[] = [];
    if (file.originalname.endsWith(".csv")) {
      const csvData = fs.readFileSync(file.path, "utf8");
      const parsed = Papa.parse(csvData, { header: true, skipEmptyLines: true });
      data = parsed.data;
    } else if (file.originalname.endsWith(".xlsx") || file.originalname.endsWith(".xls")) {
      const workbook = XLSX.readFile(file.path);
      const sheetName = workbook.SheetNames[0];
      data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
    }

    if (data.length === 0) throw new Error("No data found in file");

    const tableName = `data_${userId}_${Date.now()}`;
    const columns = Object.keys(data[0]);
    
    // Create Table
    const colDefs = columns.map(col => `"${col}" TEXT`).join(", ");
    db.exec(`CREATE TABLE "${tableName}" (${colDefs})`);

    // Insert Data
    const placeholders = columns.map(() => "?").join(", ");
    const insertStmt = db.prepare(`INSERT INTO "${tableName}" (${columns.map(c => `"${c}"`).join(", ")}) VALUES (${placeholders})`);
    
    const transaction = db.transaction((rows) => {
      for (const row of rows) {
        const values = columns.map(col => row[col]);
        insertStmt.run(...values);
      }
    });
    transaction(data);

    // Save Metadata
    const schema = JSON.stringify(columns);
    db.prepare("INSERT INTO user_databases (user_id, name, table_name, schema) VALUES (?, ?, ?, ?)").run(userId, dbName, tableName, schema);

    fs.unlinkSync(file.path);
    res.json({ success: true, tableName, columns });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/data/databases", authenticateToken, (req: any, res) => {
  const databases = db.prepare("SELECT * FROM user_databases WHERE user_id = ?").all(req.user.id);
  res.json(databases);
});

// --- SQL Execution Route ---
app.post("/api/query/execute", authenticateToken, (req: any, res) => {
  const { sql } = req.body;
  
  // Basic SQL Injection protection (very naive, should use a proper parser in production)
  const forbidden = ["DROP", "DELETE", "UPDATE", "INSERT", "ALTER", "CREATE", "TRUNCATE"];
  if (forbidden.some(word => sql.toUpperCase().includes(word))) {
    return res.status(403).json({ error: "Only SELECT queries are allowed for security." });
  }

  try {
    const results = db.prepare(sql).all();
    res.json(results);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// --- Vite Integration ---
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
