import path from "path"
import fs from "fs"

const DB_DIR = path.join(process.cwd(), ".data")
const DB_PATH = path.join(DB_DIR, "queryflow.db.json")

if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true })
}

type Row = Record<string, any>

interface Store {
  users: Row[]
  uploaded_tables: Row[]
  tables: Record<string, Row[]>
}

function load(): Store {
  try {
    if (fs.existsSync(DB_PATH)) {
      return JSON.parse(fs.readFileSync(DB_PATH, "utf-8"))
    }
  } catch (_) {}
  return { users: [], uploaded_tables: [], tables: {} }
}

function save(store: Store) {
  fs.writeFileSync(DB_PATH, JSON.stringify(store, null, 2), "utf-8")
}

export function getUser(email: string) {
  return load().users.find((u) => u.email === email) ?? null
}

export function createUser(name: string, email: string, password: string) {
  const store = load()
  if (store.users.find((u) => u.email === email)) throw new Error("Email already registered")
  store.users.push({ id: Date.now(), name, email, password, created_at: new Date().toISOString() })
  save(store)
}

export function saveTable(userEmail: string, tableName: string, fileName: string, columns: string[], rows: Row[]) {
  const store = load()
  store.uploaded_tables = store.uploaded_tables.filter((t) => t.table_name !== tableName)
  store.uploaded_tables.unshift({
    id: Date.now(), user_email: userEmail, table_name: tableName,
    original_filename: fileName, columns, created_at: new Date().toISOString(),
  })
  store.tables[tableName] = rows
  save(store)
}

export function getUserTables(userEmail: string) {
  return load().uploaded_tables.filter((t) => t.user_email === userEmail)
}

export function queryTable(sql: string): Row[] {
  const store = load()

  const fromMatch = sql.match(/FROM\s+"?(\w+)"?/i)
  if (!fromMatch) throw new Error("Could not find table name in SQL")
  const tableName = fromMatch[1]

  const data = store.tables[tableName]
  if (!data) throw new Error(`Table "${tableName}" not found. Please upload the file again.`)

  let result = [...data]

  // WHERE
  const whereMatch = sql.match(/WHERE\s+(.+?)(?:\s+GROUP|\s+ORDER|\s+LIMIT|$)/i)
  if (whereMatch) {
    const cond = whereMatch[1].trim()
    const eq = cond.match(/(\w+)\s*=\s*['"]?([^'"]+)['"]?/)
    const gt = cond.match(/(\w+)\s*>\s*(\d+)/)
    const lt = cond.match(/(\w+)\s*<\s*(\d+)/)
    if (eq) result = result.filter((r) => String(r[eq[1]]).toLowerCase() === eq[2].toLowerCase())
    else if (gt) result = result.filter((r) => Number(r[gt[1]]) > Number(gt[2]))
    else if (lt) result = result.filter((r) => Number(r[lt[1]]) < Number(lt[2]))
  }

  // GROUP BY + SUM
  const groupMatch = sql.match(/GROUP\s+BY\s+(\w+)/i)
  const sumMatch = sql.match(/SUM\s*\(\s*(\w+)\s*\)/i)
  if (groupMatch && sumMatch) {
    const groupCol = groupMatch[1]
    const sumCol = sumMatch[1]
    const grouped: Record<string, number> = {}
    for (const row of result) {
      const key = String(row[groupCol] ?? "unknown")
      grouped[key] = (grouped[key] ?? 0) + Number(row[sumCol] ?? 0)
    }
    result = Object.entries(grouped).map(([k, v]) => ({ name: k, value: Math.round(v) }))
  }

  // ORDER BY
  const orderMatch = sql.match(/ORDER\s+BY\s+(\w+)(\s+DESC)?/i)
  if (orderMatch) {
    const col = orderMatch[1]
    const desc = !!orderMatch[2]
    result.sort((a, b) => {
      const av = isNaN(Number(a[col])) ? String(a[col]) : Number(a[col])
      const bv = isNaN(Number(b[col])) ? String(b[col]) : Number(b[col])
      if (av < bv) return desc ? 1 : -1
      if (av > bv) return desc ? -1 : 1
      return 0
    })
  }

  // LIMIT
  const limitMatch = sql.match(/LIMIT\s+(\d+)/i)
  if (limitMatch) result = result.slice(0, parseInt(limitMatch[1]))

  return result
}

export function getAllTableNames(): string[] {
  return Object.keys(load().tables)
}

export function getTables(userEmail: string): { name: string; rows: number; columns: number }[] {
  const store = load()
  return store.uploaded_tables
    .filter((t) => t.user_email === userEmail)
    .map((t) => ({
      name: t.original_filename ?? t.table_name,
      rows: (store.tables[t.table_name] ?? []).length,
      columns: (t.columns ?? []).length,
    }))
}
export function deleteTable(userEmail: string, fileName: string) {
  const store = load()
  const entry = store.uploaded_tables.find(
    (t) => t.user_email === userEmail && t.original_filename === fileName
  )
  if (!entry) throw new Error("Table not found")
  store.uploaded_tables = store.uploaded_tables.filter((t) => t !== entry)
  delete store.tables[entry.table_name]
  save(store)
}