import express from "express";
import path from "path";
import multer from "multer";
import { fileURLToPath } from "url";
import fs from "fs";
import initSqlJs from "sql.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Papa from "papaparse";
import * as XLSX from "xlsx";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || "voxsql-secret";
const DB_PATH = path.join(__dirname, "voxsql.db");

// Database Setup
let db: any;

async function initDB() {
  const SQL = await initSqlJs();
  if (fs.existsSync(DB_PATH)) {
    const fileBuffer = fs.readFileSync(DB_PATH);
    db = new SQL.Database(fileBuffer);
  } else {
    db = new SQL.Database();
  }

  db.run(`
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
  saveDB();
}

function saveDB() {
  const data = db.export();
  fs.writeFileSync(DB_PATH, Buffer.from(data));
}

function dbAll(sql: string, params: any[] = []) {
  const stmt = db.prepare(sql);
  stmt.bind(params);
  const rows: any[] = [];
  while (stmt.step()) rows.push(stmt.getAsObject());
  stmt.free();
  return rows;
}

function dbRun(sql: string, params: any[] = []) {
  db.run(sql, params);
  saveDB();
  return db;
}

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

// Auth Routes
app.post("/api/auth/register", async (req, res) => {
  const { email, password, name } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    dbRun("INSERT INTO users (email, password, name) VALUES (?, ?, ?)", [email, hashedPassword, name]);
    res.status(201).json({ success: true });
  } catch (error) {
    res.status(400).json({ error: "Email already exists" });
  }
});

app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;
  const users = dbAll("SELECT * FROM users WHERE email = ?", [email]);
  const user = users[0];
  if (!user) return res.status(400).json({ error: "User not found" });
  const validPassword = await bcrypt.compare(password, user.password as string);
  if (!validPassword) return res.status(400).json({ error: "Invalid password" });
  const token = jwt.sign({ id: user.id, email: user.email, name: user.name }, JWT_SECRET);
  res.json({ token, user: { id: user.id, email: user.email, name: user.name } });
});

// Data Upload
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
      data = parsed.data as any[];
    } else if (file.originalname.endsWith(".xlsx") || file.originalname.endsWith(".xls")) {
      const workbook = XLSX.readFile(file.path);
      const sheetName = workbook.SheetNames[0];
      data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
    }
    if (data.length === 0) throw new Error("No data found in file");
    const tableName = `data_${userId}_${Date.now()}`;
    const columns = Object.keys(data[0]);
    const colDefs = columns.map(col => `"${col}" TEXT`).join(", ");
    dbRun(`CREATE TABLE "${tableName}" (${colDefs})`);
    for (const row of data) {
      const values = columns.map(col => row[col]);
      const placeholders = columns.map(() => "?").join(", ");
      dbRun(`INSERT INTO "${tableName}" (${columns.map(c => `"${c}"`).join(", ")}) VALUES (${placeholders})`, values);
    }
    const schema = JSON.stringify(columns);
    dbRun("INSERT INTO user_databases (user_id, name, table_name, schema) VALUES (?, ?, ?, ?)", [userId, dbName, tableName, schema]);
    fs.unlinkSync(file.path);
    res.json({ success: true, tableName, columns });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/data/databases", authenticateToken, (req: any, res) => {
  const databases = dbAll("SELECT * FROM user_databases WHERE user_id = ?", [req.user.id]);
  res.json(databases);
});

app.post("/api/query/execute", authenticateToken, (req: any, res) => {
  const { sql } = req.body;
  const forbidden = ["DROP", "DELETE", "UPDATE", "INSERT", "ALTER", "CREATE", "TRUNCATE"];
  if (forbidden.some(word => sql.toUpperCase().includes(word))) {
    return res.status(403).json({ error: "Only SELECT queries are allowed." });
  }
  try {
    const results = dbAll(sql);
    res.json(results);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Static files for production
const distPath = path.join(__dirname, "dist");
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get("*", (req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });
}

// Start
initDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});