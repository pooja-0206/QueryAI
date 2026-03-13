"use client"
import { useEffect, useRef, useState } from "react"

export default function MicTest() {
  const [status, setStatus] = useState("idle")
  const [log, setLog] = useState<string[]>([])
  const recRef = useRef<any>(null)

  const addLog = (msg: string) => {
    setLog((p) => [...p, `${new Date().toLocaleTimeString()} → ${msg}`])
  }

  const start = () => {
    const SR = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition
    if (!SR) { addLog("❌ SpeechRecognition NOT supported in this browser"); return }

    const r = new SR()
    r.continuous = true
    r.interimResults = true
    r.lang = "en-US"

    r.onstart = () => { setStatus("listening"); addLog("✅ Mic started — speak now") }
    r.onsoundstart = () => addLog("🎙️ Sound detected!")
    r.onspeechstart = () => addLog("🗣️ Speech detected!")
    r.onspeechend = () => addLog("🔇 Speech ended")
    r.onsoundend = () => addLog("🔇 Sound ended")

    r.onresult = (e: any) => {
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript
        const type = e.results[i].isFinal ? "FINAL" : "interim"
        addLog(`📝 [${type}]: "${t}"`)
      }
    }

    r.onerror = (e: any) => {
      addLog(`❌ Error: ${e.error} — ${e.message || ""}`)
      setStatus("error: " + e.error)
    }

    r.onend = () => { addLog("⏹️ Recognition ended"); setStatus("ended") }

    recRef.current = r
    try { r.start() } catch (e: any) { addLog("❌ start() threw: " + e.message) }
  }

  const stop = () => {
    recRef.current?.abort()
    setStatus("stopped")
  }

  return (
    <div style={{ padding: 32, fontFamily: "monospace", maxWidth: 700 }}>
      <h2 style={{ fontSize: 20, marginBottom: 16 }}>🎤 Mic Debug Test</h2>

      <div style={{ marginBottom: 16, display: "flex", gap: 12 }}>
        <button onClick={start}
          style={{ padding: "10px 24px", background: "#7c3aed", color: "white", border: "none", borderRadius: 8, cursor: "pointer", fontSize: 16 }}>
          ▶ Start Mic
        </button>
        <button onClick={stop}
          style={{ padding: "10px 24px", background: "#e11d48", color: "white", border: "none", borderRadius: 8, cursor: "pointer", fontSize: 16 }}>
          ⏹ Stop
        </button>
      </div>

      <div style={{ marginBottom: 12, padding: "8px 16px", background: "#f1f5f9", borderRadius: 8 }}>
        Status: <strong>{status}</strong>
      </div>

      <div style={{ background: "#0f172a", color: "#94a3b8", padding: 16, borderRadius: 12, minHeight: 300, overflowY: "auto" }}>
        {log.length === 0 && <p style={{ color: "#475569" }}>Logs will appear here...</p>}
        {log.map((l, i) => (
          <div key={i} style={{ marginBottom: 4, color: l.includes("FINAL") ? "#4ade80" : l.includes("interim") ? "#60a5fa" : l.includes("❌") ? "#f87171" : "#94a3b8" }}>
            {l}
          </div>
        ))}
      </div>

      <div style={{ marginTop: 16, padding: 12, background: "#fef3c7", borderRadius: 8, fontSize: 13 }}>
        <strong>Checklist:</strong><br />
        1. Are you on <code>https://localhost:3000</code>? (not http)<br />
        2. Did browser ask for mic permission? Click Allow<br />
        3. Click Start → speak → watch logs above
      </div>
    </div>
  )
}