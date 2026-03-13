const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

// ── Auth ──────────────────────────────────────────────────────────────────────

export async function login(email, password) {
  const res = await fetch(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  return res.json();
}

export async function loginUser(email, password) {
  return login(email, password); // alias for backwards compat
}

export async function registerUser(name, email, password) {
  const res = await fetch(`${BASE_URL}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password }),
  });
  return res.json();
}

// ── Query ─────────────────────────────────────────────────────────────────────

export async function executeQuery(sql, token) {
  const res = await fetch(`${BASE_URL}/api/query/execute`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ sql }),
  });
  return res.json();
}

// ── Data / Upload ─────────────────────────────────────────────────────────────

export async function uploadFile(file, token) {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${BASE_URL}/api/data/upload`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  return res.json();
}

export async function getDatabases(token) {
  const res = await fetch(`${BASE_URL}/api/data/databases`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
}