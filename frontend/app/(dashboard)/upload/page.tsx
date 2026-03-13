"use client"

import { useState, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Upload, FileSpreadsheet, X, CheckCircle2, Database, Table2, Columns3, 
  Trash2, Eye, CloudUpload, Sparkles, FileText, HardDrive, Zap,
  ArrowRight, Play, AlertCircle
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface UploadedFile {
  id: string
  name: string
  size: string
  rows: number
  columns: string[]
  tableName: string
  status: "uploading" | "processing" | "ready" | "error"
  progress: number
  error?: string
}

const supportedFormats = [
  { name: "CSV", icon: FileText, color: "from-emerald-500 to-teal-600" },
  { name: "Excel", icon: FileSpreadsheet, color: "from-violet-500 to-purple-600" },
  { name: "JSON", icon: Database, color: "from-amber-500 to-orange-600" },
]

function formatFileSize(bytes: number) {
  if (bytes === 0) return "0 Bytes"
  const k = 1024
  const sizes = ["Bytes", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
}

export default function UploadPage() {
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [isDragging, setIsDragging] = useState(false)

  const updateFile = (id: string, patch: Partial<UploadedFile>) => {
    setFiles((prev) => prev.map((f) => f.id === id ? { ...f, ...patch } : f))
  }

  const processFiles = useCallback(async (fileList: File[]) => {
    const token = localStorage.getItem("token") ?? ""

    for (const file of fileList) {
      const id = Math.random().toString(36).substr(2, 9)

      // Add file with uploading state
      const newFile: UploadedFile = {
        id,
        name: file.name,
        size: formatFileSize(file.size),
        rows: 0,
        columns: [],
        tableName: "",
        status: "uploading",
        progress: 0,
      }
      setFiles((prev) => [...prev, newFile])

      // Fake progress bar while uploading
      let prog = 0
      const ticker = setInterval(() => {
        prog = Math.min(prog + Math.random() * 20, 90)
        updateFile(id, { progress: prog })
      }, 200)

      try {
        // ── Actually call the upload API ──
        updateFile(id, { status: "processing", progress: 90 })

        const formData = new FormData()
        formData.append("file", file)

        const res = await fetch("/api/data/upload", {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        })

        clearInterval(ticker)

        const data = await res.json()

        if (!res.ok || data.error) {
          updateFile(id, { status: "error", error: data.error ?? "Upload failed", progress: 100 })
          continue
        }

        // ── Success — show real columns + row count ──
        updateFile(id, {
          status: "ready",
          progress: 100,
          rows: data.rowCount,
          columns: data.columns,
          tableName: data.tableName,
        })

        // Save tableName to localStorage so query page can use it
        const saved = JSON.parse(localStorage.getItem("uploadedTables") ?? "[]")
        saved.unshift({ tableName: data.tableName, fileName: file.name, columns: data.columns })
        localStorage.setItem("uploadedTables", JSON.stringify(saved))

      } catch (err: any) {
        clearInterval(ticker)
        updateFile(id, { status: "error", error: err.message ?? "Network error", progress: 100 })
      }
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    processFiles(Array.from(e.dataTransfer.files))
  }, [processFiles])

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) processFiles(Array.from(e.target.files))
  }

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id))
  }

  const readyFiles = files.filter((f) => f.status === "ready")

  return (
    <div className="p-6 lg:p-8 space-y-8 min-h-screen">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col md:flex-row md:items-end justify-between gap-4"
      >
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500 via-teal-500 to-emerald-500 flex items-center justify-center shadow-lg shadow-cyan-500/25">
            <CloudUpload className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Upload Data</h1>
            <p className="text-muted-foreground">Import your datasets to start analyzing with AI</p>
          </div>
        </div>
        {readyFiles.length > 0 && (
          <Link href="/query">
            <Button className="bg-gradient-to-r from-primary via-violet-500 to-primary bg-[length:200%_100%] hover:bg-[position:100%_0] text-white shadow-lg shadow-primary/25 transition-all duration-500 gap-2">
              <Play className="w-4 h-4" />
              Start Querying ({readyFiles.length} dataset{readyFiles.length > 1 ? "s" : ""})
            </Button>
          </Link>
        )}
      </motion.div>

      {/* Upload Area */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card className="relative overflow-hidden border-border/50 bg-card/80 backdrop-blur-sm">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-violet-500/5 pointer-events-none" />
          <CardContent className="p-6 relative">
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              className={`relative p-12 border-2 border-dashed rounded-2xl transition-all duration-500 ${
                isDragging
                  ? "border-primary bg-gradient-to-br from-primary/10 to-violet-500/10 scale-[1.01]"
                  : "border-border/50 hover:border-primary/50 hover:bg-muted/20"
              }`}
            >
              <input
                type="file"
                accept=".csv,.xlsx,.xls,.json"
                multiple
                onChange={handleFileInput}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="text-center">
                <motion.div
                  className="relative w-24 h-24 mx-auto mb-8"
                  animate={isDragging ? { scale: 1.1, y: -10 } : { scale: 1, y: 0 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div className={`absolute inset-0 rounded-3xl bg-gradient-to-br from-cyan-500/30 to-violet-500/30 blur-xl transition-opacity ${isDragging ? "opacity-100" : "opacity-50"}`} />
                  <div className="relative w-full h-full rounded-3xl bg-gradient-to-br from-cyan-500 via-teal-500 to-violet-500 flex items-center justify-center shadow-xl">
                    <Upload className="w-12 h-12 text-white" />
                  </div>
                </motion.div>

                <h3 className="text-2xl font-bold text-foreground mb-3">
                  {isDragging ? "Drop your files here" : "Drag and drop your files"}
                </h3>
                <p className="text-muted-foreground mb-6 text-lg">or click to browse from your computer</p>

                <div className="flex items-center justify-center gap-4">
                  {supportedFormats.map((format, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 + i * 0.1 }}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-muted/50 border border-border/30"
                    >
                      <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${format.color} flex items-center justify-center`}>
                        <format.icon className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-sm font-medium text-foreground">{format.name}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Uploaded Files */}
      <AnimatePresence mode="popLayout">
        {files.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 flex items-center justify-center">
                    <HardDrive className="w-5 h-5 text-violet-500" />
                  </div>
                  Uploaded Files
                  <span className="text-sm font-normal text-muted-foreground">({files.length} files)</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <AnimatePresence mode="popLayout">
                    {files.map((file, index) => (
                      <motion.div
                        key={file.id}
                        layout
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        className="p-5 rounded-2xl bg-muted/30 border border-border/30 hover:border-border/50 transition-all group"
                      >
                        <div className="flex items-start gap-4">
                          <div className={`w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 ${
                            file.status === "ready"
                              ? "bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/25"
                              : file.status === "error"
                              ? "bg-gradient-to-br from-rose-500 to-red-600 shadow-lg shadow-rose-500/25"
                              : file.status === "processing"
                              ? "bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg shadow-amber-500/25"
                              : "bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg shadow-violet-500/25"
                          }`}>
                            {file.status === "ready" ? (
                              <CheckCircle2 className="w-7 h-7 text-white" />
                            ) : file.status === "error" ? (
                              <AlertCircle className="w-7 h-7 text-white" />
                            ) : file.status === "processing" ? (
                              <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }}>
                                <Sparkles className="w-7 h-7 text-white" />
                              </motion.div>
                            ) : (
                              <Database className="w-7 h-7 text-white" />
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-2 flex-wrap">
                              <h4 className="font-semibold text-foreground truncate text-lg">{file.name}</h4>
                              {file.status === "ready" && (
                                <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-xs font-medium">
                                  <CheckCircle2 className="w-3 h-3" />
                                  Ready to Query
                                </span>
                              )}
                              {file.status === "error" && (
                                <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-rose-500/10 text-rose-500 text-xs font-medium">
                                  <AlertCircle className="w-3 h-3" />
                                  {file.error}
                                </span>
                              )}
                              {file.status === "processing" && (
                                <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-amber-500/10 text-amber-500 text-xs font-medium">
                                  <Sparkles className="w-3 h-3" />
                                  Processing...
                                </span>
                              )}
                              {file.status === "uploading" && (
                                <span className="px-3 py-1 rounded-full bg-violet-500/10 text-violet-500 text-xs font-medium">
                                  Uploading...
                                </span>
                              )}
                            </div>

                            {(file.status === "uploading" || file.status === "processing") && (
                              <div className="mb-3">
                                <div className="h-2 bg-muted rounded-full overflow-hidden">
                                  <motion.div
                                    className="h-full bg-gradient-to-r from-violet-500 to-purple-600 rounded-full"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${file.progress}%` }}
                                    transition={{ duration: 0.3 }}
                                  />
                                </div>
                                <p className="text-xs text-muted-foreground mt-1.5">
                                  {file.status === "processing" ? "Saving to database..." : `${Math.round(file.progress)}% uploaded`}
                                </p>
                              </div>
                            )}

                            {file.status === "ready" && (
                              <div className="space-y-3">
                                {/* Table name badge */}
                                <p className="text-xs text-muted-foreground">
                                  Saved as table: <code className="text-primary font-mono bg-primary/10 px-1.5 py-0.5 rounded">{file.tableName}</code>
                                </p>
                                <div className="flex items-center gap-6 text-sm text-muted-foreground">
                                  <span className="flex items-center gap-2">
                                    <Table2 className="w-4 h-4 text-cyan-500" />
                                    <span className="font-medium text-foreground">{file.rows.toLocaleString()}</span> rows
                                  </span>
                                  <span className="flex items-center gap-2">
                                    <Columns3 className="w-4 h-4 text-violet-500" />
                                    <span className="font-medium text-foreground">{file.columns.length}</span> columns
                                  </span>
                                  <span className="flex items-center gap-2">
                                    <HardDrive className="w-4 h-4 text-emerald-500" />
                                    {file.size}
                                  </span>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                  {file.columns.map((col, i) => (
                                    <span key={i} className="px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-xs font-medium border border-primary/20">
                                      {col}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            {file.status === "ready" && (
                              <Link href="/query">
                                <Button size="sm" className="gap-1 bg-gradient-to-r from-primary to-violet-500 text-white shadow-md">
                                  Query
                                  <ArrowRight className="w-4 h-4" />
                                </Button>
                              </Link>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removeFile(file.id)}
                              className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                            >
                              {file.status === "ready" ? <Trash2 className="w-4 h-4" /> : <X className="w-4 h-4" />}
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tips Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card className="relative overflow-hidden border-border/50 bg-card/80">
          <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 via-transparent to-orange-500/5 pointer-events-none" />
          <CardContent className="p-6 relative">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/25 flex-shrink-0">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-foreground text-lg mb-3">Tips for best results</h3>
                <ul className="grid md:grid-cols-2 gap-3">
                  {[
                    "Ensure your data has clear column headers in the first row",
                    "Use consistent date formats (e.g., YYYY-MM-DD)",
                    "Remove any merged cells from Excel files",
                    "Numeric columns should contain only numbers",
                  ].map((tip, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}