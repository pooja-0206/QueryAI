"use client"

import { motion } from "framer-motion"
import { useEffect, useState } from "react"

// Database node component
function DatabaseNode({ x, y, delay, size = "md" }: { x: number; y: number; delay: number; size?: "sm" | "md" | "lg" }) {
  const sizeClasses = {
    sm: "w-8 h-10",
    md: "w-12 h-14",
    lg: "w-16 h-20"
  }
  
  return (
    <motion.div
      className={`absolute ${sizeClasses[size]}`}
      style={{ left: `${x}%`, top: `${y}%` }}
      initial={{ opacity: 0, scale: 0 }}
      animate={{ 
        opacity: [0.3, 0.7, 0.3],
        scale: [0.9, 1.1, 0.9],
      }}
      transition={{ 
        duration: 4,
        delay,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    >
      {/* Database cylinder */}
      <div className="relative w-full h-full">
        {/* Top ellipse */}
        <div className="absolute top-0 left-0 w-full h-3 rounded-full bg-gradient-to-r from-violet-500/40 via-cyan-400/50 to-violet-500/40 border border-cyan-400/30" />
        {/* Body */}
        <div className="absolute top-1.5 left-0 w-full h-[calc(100%-12px)] bg-gradient-to-b from-violet-600/20 to-cyan-600/20 border-x border-violet-400/20" />
        {/* Bottom ellipse */}
        <div className="absolute bottom-0 left-0 w-full h-3 rounded-full bg-gradient-to-r from-violet-600/30 via-cyan-500/40 to-violet-600/30 border border-violet-400/20" />
        {/* Glow effect */}
        <div className="absolute inset-0 rounded-lg bg-cyan-400/10 blur-md" />
        {/* Data rows */}
        <div className="absolute top-4 left-1 right-1 space-y-1">
          <div className="h-0.5 bg-cyan-400/40 rounded" />
          <div className="h-0.5 bg-violet-400/30 rounded w-3/4" />
          <div className="h-0.5 bg-cyan-400/30 rounded w-1/2" />
        </div>
      </div>
    </motion.div>
  )
}

// Flowing data particle
function DataParticle({ startX, startY, endX, endY, delay, duration }: { 
  startX: number; startY: number; endX: number; endY: number; delay: number; duration: number 
}) {
  return (
    <motion.div
      className="absolute w-2 h-2 rounded-full bg-cyan-400 shadow-lg shadow-cyan-400/50"
      style={{ left: `${startX}%`, top: `${startY}%` }}
      animate={{
        left: [`${startX}%`, `${endX}%`],
        top: [`${startY}%`, `${endY}%`],
        opacity: [0, 1, 1, 0],
        scale: [0.5, 1, 1, 0.5]
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: "linear"
      }}
    />
  )
}

// Connection line between nodes
function ConnectionLine({ x1, y1, x2, y2, delay }: { x1: number; y1: number; x2: number; y2: number; delay: number }) {
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }}>
      <defs>
        <linearGradient id={`lineGrad-${x1}-${y1}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="rgb(139, 92, 246)" stopOpacity="0" />
          <stop offset="50%" stopColor="rgb(34, 211, 238)" stopOpacity="0.6" />
          <stop offset="100%" stopColor="rgb(139, 92, 246)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <motion.line
        x1={`${x1}%`}
        y1={`${y1}%`}
        x2={`${x2}%`}
        y2={`${y2}%`}
        stroke={`url(#lineGrad-${x1}-${y1})`}
        strokeWidth="1.5"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ 
          pathLength: [0, 1, 1, 0],
          opacity: [0, 0.8, 0.8, 0]
        }}
        transition={{
          duration: 4,
          delay,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
    </svg>
  )
}

// SQL Query Stream
function SQLQueryStream({ y, delay }: { y: number; delay: number }) {
  const queries = [
    "SELECT * FROM users",
    "JOIN orders ON",
    "WHERE revenue >",
    "GROUP BY month",
    "ORDER BY sales",
  ]
  const query = queries[Math.floor(Math.random() * queries.length)]
  
  return (
    <motion.div
      className="absolute whitespace-nowrap text-xs font-mono"
      style={{ top: `${y}%`, left: "-200px" }}
      animate={{
        left: ["0%", "110%"],
        opacity: [0, 0.6, 0.6, 0]
      }}
      transition={{
        duration: 8,
        delay,
        repeat: Infinity,
        ease: "linear"
      }}
    >
      <span className="text-cyan-400/60">{query}</span>
      <motion.span 
        className="ml-1 inline-block w-2 h-3 bg-cyan-400/80"
        animate={{ opacity: [1, 0, 1] }}
        transition={{ duration: 0.8, repeat: Infinity }}
      />
    </motion.div>
  )
}

// Floating grid
function FloatingGrid() {
  return (
    <div className="absolute inset-0 overflow-hidden opacity-20">
      <div 
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(rgba(139, 92, 246, 0.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(139, 92, 246, 0.3) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
          transform: 'perspective(500px) rotateX(60deg)',
          transformOrigin: 'center top'
        }}
      />
    </div>
  )
}

// Glowing orbs
function GlowingOrbs() {
  return (
    <>
      <motion.div
        className="absolute w-96 h-96 rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(139, 92, 246, 0.15) 0%, transparent 70%)',
          top: '10%',
          left: '5%'
        }}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3]
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute w-80 h-80 rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(34, 211, 238, 0.12) 0%, transparent 70%)',
          bottom: '15%',
          right: '10%'
        }}
        animate={{
          scale: [1.2, 1, 1.2],
          opacity: [0.4, 0.2, 0.4]
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute w-64 h-64 rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(192, 132, 252, 0.1) 0%, transparent 70%)',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)'
        }}
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.2, 0.4, 0.2]
        }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />
    </>
  )
}

// Data pipeline visualization
function DataPipeline({ y, delay }: { y: number; delay: number }) {
  return (
    <motion.div
      className="absolute left-0 right-0 h-px"
      style={{ top: `${y}%` }}
      initial={{ opacity: 0 }}
      animate={{ opacity: [0, 0.4, 0] }}
      transition={{ duration: 6, delay, repeat: Infinity }}
    >
      <div className="relative w-full h-full">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-violet-500/50 to-transparent" />
        {/* Moving data blocks */}
        {[0, 1, 2, 3].map((i) => (
          <motion.div
            key={i}
            className="absolute top-1/2 -translate-y-1/2 w-4 h-1 rounded-full bg-cyan-400/70"
            animate={{
              left: ['-5%', '105%']
            }}
            transition={{
              duration: 4,
              delay: delay + i * 0.8,
              repeat: Infinity,
              ease: "linear"
            }}
          />
        ))}
      </div>
    </motion.div>
  )
}

export default function FuturisticBackground({ variant = "full" }: { variant?: "full" | "minimal" }) {
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    setMounted(true)
  }, [])
  
  if (!mounted) return null
  
  // Database node positions
  const nodes = [
    { x: 8, y: 15, delay: 0, size: "md" as const },
    { x: 85, y: 20, delay: 0.5, size: "lg" as const },
    { x: 15, y: 70, delay: 1, size: "sm" as const },
    { x: 75, y: 65, delay: 1.5, size: "md" as const },
    { x: 45, y: 40, delay: 2, size: "lg" as const },
    { x: 25, y: 45, delay: 2.5, size: "sm" as const },
    { x: 65, y: 85, delay: 3, size: "sm" as const },
  ]
  
  // Connection lines between nodes
  const connections = [
    { x1: 12, y1: 20, x2: 45, y2: 45, delay: 0 },
    { x1: 50, y1: 45, x2: 85, y2: 25, delay: 1 },
    { x1: 48, y1: 50, x2: 75, y2: 70, delay: 2 },
    { x1: 20, y1: 75, x2: 45, y2: 50, delay: 3 },
    { x1: 28, y1: 50, x2: 43, y2: 45, delay: 1.5 },
    { x1: 78, y1: 70, x2: 68, y2: 88, delay: 2.5 },
  ]
  
  // Data particles flowing between nodes
  const particles = [
    { startX: 12, startY: 20, endX: 45, endY: 45, delay: 0.5, duration: 3 },
    { startX: 50, startY: 45, endX: 85, endY: 25, delay: 1.5, duration: 3 },
    { startX: 48, startY: 50, endX: 75, endY: 70, delay: 2.5, duration: 3 },
    { startX: 20, startY: 75, endX: 45, endY: 50, delay: 3.5, duration: 3 },
  ]

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none bg-gradient-to-br from-slate-950 via-violet-950/50 to-slate-950">
      {/* Base grid */}
      <FloatingGrid />
      
      {/* Glowing orbs */}
      <GlowingOrbs />
      
      {/* Connection lines */}
      {connections.map((conn, i) => (
        <ConnectionLine key={i} {...conn} />
      ))}
      
      {/* Database nodes */}
      {nodes.map((node, i) => (
        <DatabaseNode key={i} {...node} />
      ))}
      
      {/* Data particles */}
      {particles.map((particle, i) => (
        <DataParticle key={i} {...particle} />
      ))}
      
      {/* SQL Query streams */}
      {variant === "full" && (
        <>
          <SQLQueryStream y={25} delay={0} />
          <SQLQueryStream y={55} delay={3} />
          <SQLQueryStream y={80} delay={6} />
        </>
      )}
      
      {/* Data pipelines */}
      <DataPipeline y={35} delay={0} />
      <DataPipeline y={60} delay={2} />
      {variant === "full" && <DataPipeline y={85} delay={4} />}
      
      {/* Scan line effect */}
      <motion.div
        className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent"
        animate={{ top: ['0%', '100%'] }}
        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
      />
      
      {/* Vignette */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-slate-950/50" />
      <div className="absolute inset-0 bg-gradient-to-r from-slate-950/40 via-transparent to-slate-950/40" />
    </div>
  )
}
