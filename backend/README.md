# QueryFlow 🚀

> AI-Powered Data Analytics Platform — Upload your data, query it in plain English, and get ML-driven insights instantly.

---

## ✨ Features

- **📁 Data Upload** — Drag & drop CSV, Excel, or JSON files. Data persists across sessions.
- **💬 Query Assistant** — Ask questions about your data in plain English. AI generates and runs SQL instantly.
- **🧠 ML Predictions** — Sales forecasting, category insights, anomaly detection, and customer behavior analysis — all from your own dataset.
- **💡 Insights** — Auto-generated charts and summaries from your uploaded tables.
- **🔐 Authentication** — Email/password + Google OAuth + GitHub OAuth.
- **⚙️ Settings** — Manage your profile, notification preferences, data sources, and security.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS + shadcn/ui |
| Animations | Framer Motion |
| Database | JSON file-based (`.data/queryflow.db.json`) |
| ML Engine | Pure TypeScript (linear regression, Z-score, moving average) |
| Auth | Custom JWT-like tokens + Google OAuth 2.0 + GitHub OAuth |

---

## 🚀 Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/your-username/queryflow.git
cd queryflow
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Create a `.env.local` file in the root:

```env
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

NEXT_PUBLIC_GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret

NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔐 OAuth Setup

### Google
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. APIs & Services → Credentials → Create OAuth 2.0 Client ID
3. Add Authorized Redirect URI:
   ```
   http://localhost:3000/api/auth/callback/google
   ```

### GitHub
1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. OAuth Apps → New OAuth App
3. Set Authorization callback URL:
   ```
   http://localhost:3000/api/auth/callback/github
   ```

---

## 📁 Project Structure

```
├── app/
│   ├── (dashboard)/
│   │   ├── dashboard/        # Main dashboard
│   │   ├── upload/           # File upload page
│   │   ├── query/            # AI query assistant
│   │   ├── insights/         # Auto insights
│   │   ├── predictions/      # ML predictions page
│   │   └── settings/         # User settings
│   ├── api/
│   │   ├── auth/
│   │   │   ├── login/        # Email/password login
│   │   │   ├── register/     # User registration
│   │   │   └── callback/
│   │   │       ├── google/   # Google OAuth callback
│   │   │       └── github/   # GitHub OAuth callback
│   │   ├── data/
│   │   │   ├── upload/       # File upload handler
│   │   │   └── tables/       # List & delete tables
│   │   ├── ml/
│   │   │   └── predict/      # ML predictions engine
│   │   └── query/
│   │       └── execute/      # SQL query executor
│   └── auth/
│       └── complete/         # OAuth redirect landing
├── components/
│   ├── Sidebar.tsx
│   ├── FuturisticBackground.tsx
│   └── ui/                   # shadcn/ui components
├── lib/
│   ├── db.ts                 # File-based database
│   ├── api.ts                # Frontend API helpers
│   └── utils.ts
└── .data/
    └── queryflow.db.json     # Persistent data store (git-ignored)
```

---

## 🧠 ML Predictions

QueryFlow's ML engine runs entirely in TypeScript — no Python, no external ML libraries required.

| Feature | Method |
|---|---|
| Sales Forecasting | Linear Regression (next 6 periods) |
| Trend Detection | Slope analysis + moving average |
| Anomaly Detection | Z-score (threshold: 2.5σ) |
| Customer Segmentation | RFM-style value bucketing (80/20 rule) |
| Category Insights | Group-by aggregation with trend direction |

Columns are **auto-detected** from your dataset — no configuration needed.

---

## 📊 Supported File Formats

| Format | Extension |
|---|---|
| CSV | `.csv` |
| Excel | `.xlsx`, `.xls` |
| JSON | `.json` |

---

## 🔒 Data & Privacy

- All data is stored **locally** in `.data/queryflow.db.json` on your machine.
- No data is sent to any external service except the AI query assistant.
- OAuth tokens are stored in `localStorage` and never persisted server-side.

---

## 🤝 Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you'd like to change.

1. Fork the repo
2. Create your branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

MIT © 2025 QueryFlow

---

<p align="center">Built with ❤️ using Next.js, TypeScript & AI</p>
