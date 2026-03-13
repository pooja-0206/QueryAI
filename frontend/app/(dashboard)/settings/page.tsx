"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { User, Bell, Database, Shield, Save, Check, RefreshCw, Trash2, AlertCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { FieldGroup, Field, FieldLabel } from "@/components/ui/field"

const tabs = [
  { id: "profile", label: "Profile", icon: User },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "data", label: "Data Sources", icon: Database },
  { id: "security", label: "Security", icon: Shield },
]

interface DataTable {
  name: string
  rows: number
  columns: number
}

function getToken(): string {
  if (typeof window === "undefined") return ""
  return localStorage.getItem("token") ?? ""
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("profile")
  const [saved, setSaved] = useState(false)

  const [tables, setTables] = useState<DataTable[]>([])
  const [loadingTables, setLoadingTables] = useState(false)
  const [tablesError, setTablesError] = useState<string | null>(null)
  const [deletingTable, setDeletingTable] = useState<string | null>(null)

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const fetchTables = async () => {
    setLoadingTables(true)
    setTablesError(null)
    try {
      const res = await fetch("/api/data/tables", {
        headers: { Authorization: `Bearer ${getToken()}` },
      })
      if (!res.ok) throw new Error(`Failed to fetch tables (${res.status})`)
      const data = await res.json()
      setTables(Array.isArray(data) ? data : (data.tables ?? []))
    } catch (err: any) {
      setTablesError(err.message ?? "Could not load data sources.")
    } finally {
      setLoadingTables(false)
    }
  }

  const handleDeleteTable = async (tableName: string) => {
  setDeletingTable(tableName)
  try {
    const res = await fetch("/api/data/tables", {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${getToken()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name: tableName }),
    })
    if (!res.ok) throw new Error("Delete failed")
    setTables((prev) => prev.filter((t) => t.name !== tableName))
  } catch {
    fetchTables()
  } finally {
    setDeletingTable(null)
  }
}
  useEffect(() => {
    if (activeTab === "data") fetchTables()
  }, [activeTab])

  const formatRows = (n: number) => n?.toLocaleString() ?? "—"

  return (
    <div className="p-6 lg:p-8 space-y-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <h1 className="text-3xl font-bold text-foreground mb-2">Settings</h1>
        <p className="text-muted-foreground">Manage your account and preferences</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
          <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
            <CardContent className="p-4">
              <nav className="space-y-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                      activeTab === tab.id
                        ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    <tab.icon className="w-5 h-5" />
                    <span className="font-medium">{tab.label}</span>
                  </button>
                ))}
              </nav>
            </CardContent>
          </Card>
        </motion.div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="lg:col-span-3"
        >
          {/* Profile Tab */}
          {activeTab === "profile" && (
            <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-foreground">Profile Information</CardTitle>
                <CardDescription>Update your personal details and preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-chart-2 to-chart-3 flex items-center justify-center shadow-lg">
                    <span className="text-2xl font-bold text-foreground">JD</span>
                  </div>
                  <Button variant="outline" size="sm">Change Avatar</Button>
                </div>
                <FieldGroup className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field>
                    <FieldLabel className="text-foreground">Full Name</FieldLabel>
                    <Input defaultValue="John Doe" className="h-11 bg-background/50 border-border/50 rounded-xl" />
                  </Field>
                  <Field>
                    <FieldLabel className="text-foreground">Email</FieldLabel>
                    <Input type="email" defaultValue="john@example.com" className="h-11 bg-background/50 border-border/50 rounded-xl" />
                  </Field>
                  <Field>
                    <FieldLabel className="text-foreground">Company</FieldLabel>
                    <Input defaultValue="Acme Inc." className="h-11 bg-background/50 border-border/50 rounded-xl" />
                  </Field>
                  <Field>
                    <FieldLabel className="text-foreground">Role</FieldLabel>
                    <Input defaultValue="Data Analyst" className="h-11 bg-background/50 border-border/50 rounded-xl" />
                  </Field>
                </FieldGroup>
                <div className="flex justify-end">
                  <Button onClick={handleSave} className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-md shadow-primary/25">
                    {saved ? <Check className="w-4 h-4 mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                    {saved ? "Saved!" : "Save Changes"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Notifications Tab */}
          {activeTab === "notifications" && (
            <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-foreground">Notification Preferences</CardTitle>
                <CardDescription>Choose how you want to be notified</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {[
                  { label: "Query Results", desc: "Get notified when your query completes" },
                  { label: "AI Insights", desc: "Receive new AI-generated insights" },
                  { label: "Data Alerts", desc: "Alerts when data thresholds are exceeded" },
                  { label: "Weekly Reports", desc: "Summary of your analytics activity" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-muted/30 border border-border/30">
                    <div>
                      <p className="font-medium text-foreground">{item.label}</p>
                      <p className="text-sm text-muted-foreground">{item.desc}</p>
                    </div>
                    <Switch defaultChecked={i < 2} />
                  </div>
                ))}
                <div className="flex justify-end">
                  <Button onClick={handleSave} className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-md shadow-primary/25">
                    {saved ? <Check className="w-4 h-4 mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                    {saved ? "Saved!" : "Save Changes"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Data Sources Tab */}
          {activeTab === "data" && (
            <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-start justify-between">
                <div>
                  <CardTitle className="text-lg font-semibold text-foreground">Data Sources</CardTitle>
                  <CardDescription>Your uploaded tables and connected data sources</CardDescription>
                </div>
                <Button variant="ghost" size="icon" onClick={fetchTables} disabled={loadingTables} className="shrink-0 mt-1" title="Refresh">
                  <RefreshCw className={`w-4 h-4 ${loadingTables ? "animate-spin" : ""}`} />
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {loadingTables && (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-[68px] rounded-xl bg-muted/40 animate-pulse" />
                    ))}
                  </div>
                )}

                {!loadingTables && tablesError && (
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <p className="text-sm">{tablesError}</p>
                  </div>
                )}

                {!loadingTables && !tablesError && tables.length === 0 && (
                  <div className="flex flex-col items-center gap-3 py-10 text-center">
                    <div className="w-12 h-12 rounded-2xl bg-muted/50 flex items-center justify-center">
                      <Database className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <p className="font-medium text-foreground">No data sources yet</p>
                    <p className="text-sm text-muted-foreground">Upload a CSV or Excel file to get started</p>
                  </div>
                )}

                {!loadingTables && !tablesError && tables.map((source, i) => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-muted/30 border border-border/30">
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-accent/50 flex items-center justify-center shrink-0">
                        <Database className="w-5 h-5 text-foreground" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-foreground truncate">{source.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatRows(source.rows)} rows · {source.columns} cols
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0 ml-3">
                      <span className="px-3 py-1 rounded-full bg-chart-2/20 text-chart-2 text-sm font-medium">
                        connected
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="w-8 h-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                        onClick={() => handleDeleteTable(source.name)}
                        disabled={deletingTable === source.name}
                        title="Delete"
                      >
                        {deletingTable === source.name
                          ? <RefreshCw className="w-4 h-4 animate-spin" />
                          : <Trash2 className="w-4 h-4" />
                        }
                      </Button>
                    </div>
                  </div>
                ))}

                <Button variant="outline" className="w-full mt-2" onClick={() => window.location.href = "/upload"}>
                  + Add New Data Source
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Security Tab */}
          {activeTab === "security" && (
            <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-foreground">Security Settings</CardTitle>
                <CardDescription>Manage your account security</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <FieldGroup>
                  <Field>
                    <FieldLabel className="text-foreground">Current Password</FieldLabel>
                    <Input type="password" placeholder="Enter current password" className="h-11 bg-background/50 border-border/50 rounded-xl" />
                  </Field>
                  <Field>
                    <FieldLabel className="text-foreground">New Password</FieldLabel>
                    <Input type="password" placeholder="Enter new password" className="h-11 bg-background/50 border-border/50 rounded-xl" />
                  </Field>
                  <Field>
                    <FieldLabel className="text-foreground">Confirm New Password</FieldLabel>
                    <Input type="password" placeholder="Confirm new password" className="h-11 bg-background/50 border-border/50 rounded-xl" />
                  </Field>
                </FieldGroup>
                <div className="p-4 rounded-xl bg-muted/30 border border-border/30">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-foreground">Two-Factor Authentication</p>
                      <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
                    </div>
                    <Switch />
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button onClick={handleSave} className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-md shadow-primary/25">
                    {saved ? <Check className="w-4 h-4 mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                    {saved ? "Saved!" : "Update Password"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </motion.div>
      </div>
    </div>
  )
}