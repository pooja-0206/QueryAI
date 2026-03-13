import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Database, ArrowRight, Shield, Zap, Globe, BarChart3, Mic, Brain, Sparkles } from 'lucide-react';

export const LandingPage: React.FC<{ onGetStarted: () => void }> = ({ onGetStarted }) => {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans selection:bg-indigo-500/30">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-[#0a0a0a]/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <Database className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight">VoxSQL</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-white/60">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#privacy" className="hover:text-white transition-colors">Privacy</a>
            <a href="#how-it-works" className="hover:text-white transition-colors">How it Works</a>
          </div>
          <button 
            onClick={onGetStarted}
            className="bg-white text-black px-6 py-2.5 rounded-full text-sm font-bold hover:bg-white/90 transition-all shadow-lg shadow-white/10"
          >
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-40 pb-20 px-6 overflow-hidden">
        {/* Background Glows */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-indigo-600/20 blur-[120px] rounded-full -z-10 animate-pulse" />
        <div className="absolute top-40 right-0 w-[400px] h-[400px] bg-purple-600/10 blur-[100px] rounded-full -z-10" />
        
        {/* Floating Elements */}
        <motion.div 
          animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-60 left-20 w-12 h-12 bg-indigo-500/20 rounded-xl border border-indigo-500/30 backdrop-blur-md hidden lg:flex items-center justify-center shadow-2xl"
        >
          <Database className="w-6 h-6 text-indigo-400" />
        </motion.div>
        <motion.div 
          animate={{ y: [0, 20, 0], rotate: [0, -5, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-40 right-40 w-16 h-16 bg-purple-500/20 rounded-2xl border border-purple-500/30 backdrop-blur-md hidden lg:flex items-center justify-center shadow-2xl"
        >
          <Brain className="w-8 h-8 text-purple-400" />
        </motion.div>

        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <motion.span 
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="inline-block px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-indigo-400 text-xs font-bold uppercase tracking-widest mb-6"
            >
              AI-Powered Business Intelligence
            </motion.span>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-[0.9] mb-8">
              TALK TO YOUR <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 animate-gradient">
                DATA IN REAL-TIME
              </span>
            </h1>
            <p className="max-w-2xl mx-auto text-lg md:text-xl text-white/50 leading-relaxed mb-12">
              Transform complex databases into actionable insights using just your voice. 
              Secure, privacy-first, and designed for non-technical teams.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button 
                onClick={onGetStarted}
                className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-4 rounded-2xl text-lg font-bold transition-all flex items-center justify-center gap-2 shadow-xl shadow-indigo-600/20 group"
              >
                Start Free Trial <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="w-full sm:w-auto bg-white/5 hover:bg-white/10 border border-white/10 text-white px-8 py-4 rounded-2xl text-lg font-bold transition-all">
                Watch Demo
              </button>
            </div>
          </motion.div>

          {/* Demo Preview */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="mt-24 relative max-w-5xl mx-auto"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent z-10" />
            <div className="bg-[#111] border border-white/10 rounded-[2.5rem] p-4 shadow-2xl group hover:border-indigo-500/30 transition-all">
              <div className="bg-[#0a0a0a] rounded-[2rem] overflow-hidden border border-white/5 aspect-video flex items-center justify-center relative">
                 <div className="absolute top-4 left-4 flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500/50" />
                    <div className="w-3 h-3 rounded-full bg-amber-500/50" />
                    <div className="w-3 h-3 rounded-full bg-emerald-500/50" />
                 </div>
                 <div className="text-center space-y-6 max-w-md px-6">
                    <motion.div 
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="w-20 h-20 rounded-3xl bg-indigo-600/20 flex items-center justify-center mx-auto border border-indigo-500/30"
                    >
                      <Mic className="w-10 h-10 text-indigo-400" />
                    </motion.div>
                    <div className="space-y-2">
                      <p className="text-white/40 text-sm font-mono italic">"Show me the revenue trend for last quarter..."</p>
                      <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                        <motion.div 
                          className="h-full bg-indigo-500"
                          animate={{ width: ['0%', '100%'] }}
                          transition={{ duration: 3, repeat: Infinity }}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="h-24 bg-indigo-500/5 rounded-2xl border border-indigo-500/10 flex items-center justify-center">
                        <BarChart3 className="w-8 h-8 text-indigo-500/30" />
                      </div>
                      <div className="h-24 bg-purple-500/5 rounded-2xl border border-purple-500/10 flex items-center justify-center">
                        <Sparkles className="w-8 h-8 text-purple-500/30" />
                      </div>
                    </div>
                 </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Everything you need to <br /> master your data</h2>
            <p className="text-white/40 max-w-xl mx-auto">Powerful AI features wrapped in a simple, intuitive interface.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: Mic, title: "Voice-to-SQL", desc: "Speak naturally and let our AI handle the complex SQL queries." },
              { icon: Shield, title: "Privacy First", desc: "Your raw data never leaves your infrastructure. AI only sees the schema." },
              { icon: Brain, title: "Smart Insights", desc: "Automated business analysis that explains the 'why' behind the numbers." },
              { icon: Globe, title: "Multilingual", desc: "Support for English, Hindi, Telugu, and more for global teams." },
              { icon: Zap, title: "Real-time Predictions", desc: "ML-based forecasting to help you prepare for the future." },
              { icon: Sparkles, title: "Auto-Visualization", desc: "Beautiful charts generated instantly based on your query results." },
            ].map((f, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -10 }}
                className="bg-[#111] border border-white/10 p-8 rounded-[2rem] hover:border-indigo-500/50 transition-all group"
              >
                <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center mb-6 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                  <f.icon className="w-7 h-7 text-indigo-400 group-hover:text-white" />
                </div>
                <h3 className="text-xl font-bold mb-4">{f.title}</h3>
                <p className="text-white/40 leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 px-6 border-t border-white/5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
              <Database className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold">VoxSQL</span>
          </div>
          <p className="text-white/30 text-sm">© 2026 VoxSQL AI. All rights reserved.</p>
          <div className="flex gap-6 text-white/40 text-sm">
            <a href="#" className="hover:text-white">Privacy Policy</a>
            <a href="#" className="hover:text-white">Terms of Service</a>
          </div>
        </div>
      </footer>
    </div>
  );
};
