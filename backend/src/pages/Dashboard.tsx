import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Database, Mic, Send, Upload, PieChart as PieIcon, 
  TrendingUp, FileText, Bell, Settings, LogOut, 
  Plus, ChevronDown, Brain, Sparkles, AlertCircle,
  Table as TableIcon, BarChart3, LineChart as LineIcon,
  Sun, Moon, Eye, EyeOff, User, CheckCircle2, Clock,
  ArrowUpRight, ArrowDownRight, Filter, Download, Share2
} from 'lucide-react';
import { useVoice } from '../hooks/useVoice';
import { generateSQL, generateInsights, generateStrategy } from '../services/gemini';
import { DataVisualization } from '../components/DataVisualization';
import { cn } from '../lib/utils';

interface DatabaseInfo {
  id: number;
  name: string;
  table_name: string;
  schema: string;
}

export const Dashboard: React.FC<{ user: any; onLogout: () => void }> = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState('assistant');
  const [databases, setDatabases] = useState<DatabaseInfo[]>([]);
  const [selectedDb, setSelectedDb] = useState<DatabaseInfo | null>(null);
  const [query, setQuery] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<any[] | null>(null);
  const [generatedSql, setGeneratedSql] = useState('');
  const [insights, setInsights] = useState('');
  const [strategy, setStrategy] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [selectedLang, setSelectedLang] = useState('en-US');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [showSql, setShowSql] = useState(false);

  const [chartType, setChartType] = useState<'bar' | 'line' | 'pie' | 'area'>('bar');

  const { isListening, transcript, startListening, setTranscript } = useVoice();

  useEffect(() => {
    fetchDatabases();
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark';
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle('dark', savedTheme === 'dark');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  useEffect(() => {
    if (transcript) {
      setQuery(transcript);
    }
  }, [transcript]);

  const fetchDatabases = async () => {
    try {
      const res = await fetch('/api/data/databases', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      setDatabases(data);
      if (data.length > 0 && !selectedDb) setSelectedDb(data[0]);
    } catch (err) {
      console.error(err);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('name', file.name.split('.')[0]);

    try {
      const res = await fetch('/api/data/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        body: formData
      });
      if (res.ok) {
        await fetchDatabases();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const handleQuery = async () => {
    if (!query || !selectedDb) return;

    setIsProcessing(true);
    setError(null);
    setResults(null);
    setGeneratedSql('');
    setInsights('');
    setStrategy('');

    try {
      const sql = await generateSQL(query, selectedDb.schema, selectedDb.table_name);
      setGeneratedSql(sql);

      const res = await fetch('/api/query/execute', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}` 
        },
        body: JSON.stringify({ sql })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      setResults(data);

      if (data.length > 0) {
        const aiInsights = await generateInsights(query, data);
        setInsights(aiInsights);
        
        const aiStrategy = await generateStrategy(aiInsights);
        setStrategy(aiStrategy);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'assistant':
        return (
          <div className="space-y-8">
            {/* Query Input */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-6 shadow-xl"
            >
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => startListening(selectedLang)}
                  className={cn(
                    "w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300",
                    isListening 
                      ? "bg-red-500 animate-pulse shadow-lg shadow-red-500/50" 
                      : "bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-500 dark:text-slate-400"
                  )}
                >
                  <Mic className="w-6 h-6" />
                </button>
                <div className="flex-1 relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2 z-10">
                    <select 
                      value={selectedLang}
                      onChange={(e) => setSelectedLang(e.target.value)}
                      className="bg-slate-200 dark:bg-slate-700 border-none rounded-lg px-2 py-1 text-[10px] font-bold text-slate-500 dark:text-slate-400 focus:outline-none hover:text-slate-700 dark:hover:text-white transition-colors cursor-pointer"
                    >
                      <option value="en-US">EN</option>
                      <option value="hi-IN">HI</option>
                      <option value="te-IN">TE</option>
                    </select>
                  </div>
                  <input 
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Ask anything about your data..."
                    className="w-full bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-2xl pl-20 pr-14 py-4 text-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-slate-900 dark:text-white"
                    onKeyDown={(e) => e.key === 'Enter' && handleQuery()}
                  />
                  <button 
                    onClick={handleQuery}
                    disabled={isProcessing || !selectedDb}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-white"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
              
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="text-xs text-slate-400 uppercase tracking-wider font-bold mr-2 self-center">Suggestions:</span>
                {["Show total sales", "Top 5 products by revenue", "Monthly growth trend"].map(s => (
                  <button 
                    key={s}
                    onClick={() => setQuery(s)}
                    className="text-xs bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 border border-slate-200 dark:border-slate-600 px-3 py-1.5 rounded-full text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </motion.div>

            {/* Results Area */}
            <AnimatePresence mode="wait">
              {isProcessing && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center py-20 space-y-4"
                >
                  <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
                  <p className="text-slate-400 animate-pulse">AI is analyzing your data...</p>
                </motion.div>
              )}

              {error && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 flex items-start gap-4"
                >
                  <AlertCircle className="w-6 h-6 text-red-500 shrink-0" />
                  <div>
                    <h3 className="font-bold text-red-500">Query Error</h3>
                    <p className="text-red-400/80 text-sm mt-1">{error}</p>
                  </div>
                </motion.div>
              )}

              {results && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  {/* Visualization & Insights (Top Priority) */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-8 shadow-lg">
                      <div className="flex items-center justify-between mb-8">
                        <h3 className="text-xl font-bold">Data Visualization</h3>
                        <div className="flex bg-slate-100 dark:bg-slate-700 p-1 rounded-xl">
                          {['bar', 'line', 'pie', 'area'].map(t => (
                            <button 
                              key={t} 
                              onClick={() => setChartType(t as any)}
                              className={cn(
                                "px-3 py-1.5 rounded-lg text-xs capitalize transition-all",
                                chartType === t 
                                  ? "bg-white dark:bg-slate-600 shadow-sm text-indigo-600 dark:text-white font-bold" 
                                  : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                              )}
                            >
                              {t}
                            </button>
                          ))}
                        </div>
                      </div>
                      <DataVisualization data={results} type={chartType} theme={theme} />
                    </div>

                    <div className="space-y-6">
                      <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 rounded-3xl p-6 shadow-sm">
                        <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 mb-3">
                          <Sparkles className="w-5 h-5" />
                          <h3 className="font-bold">AI Insights</h3>
                        </div>
                        <p className="text-slate-600 dark:text-slate-300 leading-relaxed italic">
                          "{insights}"
                        </p>
                      </div>

                      <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-3xl p-6 shadow-sm">
                        <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 mb-3">
                          <TrendingUp className="w-5 h-5" />
                          <h3 className="font-bold">Strategy Suggestion</h3>
                        </div>
                        <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                          {strategy}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Raw Data Table */}
                  <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl overflow-hidden shadow-lg">
                    <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                      <h3 className="font-bold">Query Results</h3>
                      <div className="flex items-center gap-4">
                        <span className="text-xs text-slate-400">{results.length} rows returned</span>
                        <button className="text-slate-400 hover:text-indigo-500 transition-colors">
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400">
                          <tr>
                            {Object.keys(results[0] || {}).map((k, i) => (
                              <th key={`${k}-${i}`} className="px-6 py-4 font-medium">{k}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                          {results.slice(0, 10).map((row, i) => (
                            <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                              {Object.values(row).map((v: any, j) => (
                                <td key={j} className="px-6 py-4 text-slate-600 dark:text-slate-300">{v}</td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* SQL Query (Toggled) */}
                  <div className="flex items-center justify-center pt-4">
                    <button 
                      onClick={() => setShowSql(!showSql)}
                      className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-indigo-500 transition-colors"
                    >
                      {showSql ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      {showSql ? "Hide SQL Query" : "Show SQL Query"}
                    </button>
                  </div>

                  <AnimatePresence>
                    {showSql && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="bg-slate-900 rounded-2xl p-6 overflow-hidden"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2 text-indigo-400">
                            <Brain className="w-4 h-4" />
                            <span className="text-sm font-bold uppercase tracking-wider">Generated SQL</span>
                          </div>
                          <button className="text-xs text-slate-500 hover:text-white transition-colors">Copy Query</button>
                        </div>
                        <code className="block text-indigo-300 font-mono text-sm overflow-x-auto">
                          {generatedSql}
                        </code>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      case 'data':
        return (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-bold">Data Management</h2>
              <label className="cursor-pointer bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-2xl font-bold transition-all flex items-center gap-2 shadow-lg shadow-indigo-600/20">
                <Upload className="w-5 h-5" />
                {uploading ? "Uploading..." : "Import New Dataset"}
                <input type="file" className="hidden" accept=".csv,.xlsx,.xls" onChange={handleFileUpload} />
              </label>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {databases.map(db => (
                <motion.div 
                  key={db.id}
                  whileHover={{ y: -5 }}
                  className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-6 shadow-sm group"
                >
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center mb-4 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                    <Database className="w-6 h-6 text-slate-400 group-hover:text-white" />
                  </div>
                  <h3 className="text-lg font-bold mb-1">{db.name}</h3>
                  <p className="text-xs text-slate-400 mb-4">Table: {db.table_name}</p>
                  <div className="flex flex-wrap gap-2">
                    {JSON.parse(db.schema).map((col: string, i: number) => (
                      <span key={`${col}-${i}`} className="text-[10px] bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded-md text-slate-500 dark:text-slate-400">{col}</span>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        );
      case 'insights':
        return (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-bold">AI Business Insights</h2>
              <div className="flex gap-2">
                <button className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-sm font-bold border border-slate-200 dark:border-slate-700 flex items-center gap-2">
                  <Filter className="w-4 h-4" /> Filter
                </button>
                <button className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-bold shadow-lg shadow-indigo-600/20 flex items-center gap-2">
                  <Sparkles className="w-4 h-4" /> Refresh Insights
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { title: "Revenue Growth", value: "+12.5%", desc: "Increased vs last month", icon: TrendingUp, color: "text-emerald-500", bg: "bg-emerald-500/10" },
                { title: "Active Users", value: "1,284", desc: "+5.2% this week", icon: User, color: "text-indigo-500", bg: "bg-indigo-500/10" },
                { title: "Avg Order Value", value: "$84.20", desc: "Stable performance", icon: Sparkles, color: "text-amber-500", bg: "bg-amber-500/10" },
                { title: "Churn Rate", value: "2.1%", desc: "-0.4% improvement", icon: ArrowDownRight, color: "text-rose-500", bg: "bg-rose-500/10" },
              ].map((stat, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-6 shadow-sm"
                >
                  <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center mb-4", stat.bg, stat.color)}>
                    <stat.icon className="w-5 h-5" />
                  </div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{stat.title}</p>
                  <h3 className="text-2xl font-black mt-1">{stat.value}</h3>
                  <p className="text-xs text-slate-500 mt-1">{stat.desc}</p>
                </motion.div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-8 shadow-lg">
                <h3 className="text-xl font-bold mb-6">Market Sentiment Analysis</h3>
                <DataVisualization 
                  data={[
                    { name: 'Positive', value: 65 },
                    { name: 'Neutral', value: 25 },
                    { name: 'Negative', value: 10 },
                  ]} 
                  type="pie" 
                  theme={theme}
                />
              </div>
              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-8 shadow-lg">
                <h3 className="text-xl font-bold mb-6">Top Performing Categories</h3>
                <DataVisualization 
                  data={[
                    { name: 'Electronics', value: 4500 },
                    { name: 'Fashion', value: 3200 },
                    { name: 'Home', value: 2800 },
                    { name: 'Beauty', value: 2100 },
                  ]} 
                  type="bar" 
                  theme={theme}
                />
              </div>
            </div>
          </div>
        );
      case 'predictions':
        return (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-bold">Future Predictions</h2>
              <div className="flex gap-2">
                <button className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-bold shadow-lg shadow-indigo-600/20">Run AI Model</button>
                <button className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-sm font-bold border border-slate-200 dark:border-slate-700">Configure Parameters</button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-8 shadow-lg">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h3 className="text-xl font-bold">Sales Forecast (Next 6 Months)</h3>
                    <p className="text-sm text-slate-400">Based on historical data and seasonal trends</p>
                  </div>
                  <div className="flex items-center gap-2 text-emerald-500 font-bold">
                    <ArrowUpRight className="w-5 h-5" />
                    <span>+18% Projected Growth</span>
                  </div>
                </div>
                <DataVisualization 
                  data={[
                    { month: 'Mar', sales: 4500, predicted: 4500 },
                    { month: 'Apr', sales: 5200, predicted: 5300 },
                    { month: 'May', sales: 4800, predicted: 5100 },
                    { month: 'Jun', sales: null, predicted: 5800 },
                    { month: 'Jul', sales: null, predicted: 6200 },
                    { month: 'Aug', sales: null, predicted: 6500 },
                  ]} 
                  type="area" 
                  theme={theme}
                  xAxis="month"
                  yAxis="predicted"
                />
              </div>

              <div className="space-y-6">
                <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-6 shadow-sm">
                  <h4 className="font-bold mb-4 flex items-center gap-2">
                    <Brain className="w-4 h-4 text-indigo-500" />
                    Model Confidence
                  </h4>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-400">Accuracy Score</span>
                        <span className="font-bold">94.2%</span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                        <motion.div initial={{ width: 0 }} animate={{ width: '94.2%' }} className="h-full bg-indigo-500" />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-400">Data Quality</span>
                        <span className="font-bold">88.5%</span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                        <motion.div initial={{ width: 0 }} animate={{ width: '88.5%' }} className="h-full bg-emerald-500" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-indigo-600 rounded-3xl p-6 text-white shadow-xl shadow-indigo-600/20">
                  <h4 className="font-bold mb-2">AI Recommendation</h4>
                  <p className="text-sm text-indigo-100 leading-relaxed">
                    Based on the projected growth in June, we recommend increasing inventory for "Electronics" by 15% in late May.
                  </p>
                  <button className="mt-4 w-full py-2 bg-white text-indigo-600 rounded-xl text-xs font-bold hover:bg-indigo-50 transition-colors">
                    Apply Strategy
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      case 'reports':
        return (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-bold">Generated Reports</h2>
              <button className="px-6 py-3 rounded-2xl bg-indigo-600 text-white font-bold shadow-lg shadow-indigo-600/20 flex items-center gap-2 hover:bg-indigo-500 transition-all">
                <Plus className="w-5 h-5" /> Create Custom Report
              </button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <div className="lg:col-span-3 space-y-4">
                {[
                  { name: "Monthly Business Summary - Feb 2026", date: "Mar 1, 2026", size: "2.4 MB", type: "PDF", status: "Ready" },
                  { name: "Quarterly Sales Performance Q4", date: "Jan 15, 2026", size: "5.1 MB", type: "PDF", status: "Ready" },
                  { name: "Inventory & Supply Chain Audit", date: "Dec 20, 2025", size: "1.8 MB", type: "XLSX", status: "Archived" },
                  { name: "Marketing Campaign ROI Analysis", date: "Nov 12, 2025", size: "3.2 MB", type: "PDF", status: "Archived" },
                ].map((report, i) => (
                  <motion.div 
                    key={i} 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 flex items-center justify-between hover:border-indigo-500/50 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                        <FileText className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="font-bold">{report.name}</h4>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-xs text-slate-400">{report.date}</span>
                          <span className="text-xs text-slate-400">•</span>
                          <span className="text-xs text-slate-400">{report.size}</span>
                          <span className={cn(
                            "text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider",
                            report.status === 'Ready' ? "bg-emerald-500/10 text-emerald-500" : "bg-slate-100 dark:bg-slate-700 text-slate-400"
                          )}>
                            {report.status}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <button className="p-2 text-slate-400 hover:text-indigo-500 transition-colors" title="Download"><Download className="w-5 h-5" /></button>
                      <button className="p-2 text-slate-400 hover:text-indigo-500 transition-colors" title="Share"><Share2 className="w-5 h-5" /></button>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="space-y-6">
                <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-6 shadow-sm">
                  <h4 className="font-bold mb-4">Quick Templates</h4>
                  <div className="space-y-2">
                    {["Financial Summary", "Sales Dashboard", "User Growth", "Inventory Status"].map(t => (
                      <button key={t} className="w-full text-left px-4 py-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/50 text-sm text-slate-600 dark:text-slate-400 transition-all flex items-center justify-between group">
                        {t}
                        <Plus className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all" />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl p-6 text-white shadow-xl">
                  <h4 className="font-bold mb-2">Automated Reports</h4>
                  <p className="text-xs text-indigo-100 mb-4">Schedule your data analysis to be delivered directly to your inbox.</p>
                  <button className="w-full py-2.5 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-xl text-xs font-bold transition-all">
                    Manage Schedule
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      case 'alerts':
        return (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-bold">Smart Alerts</h2>
              <button className="text-sm font-bold text-indigo-600 hover:text-indigo-500 transition-colors">Mark all as read</button>
            </div>
            <div className="space-y-4">
              {[
                { title: "Revenue Drop Detected", time: "2 hours ago", type: "warning", desc: "Sales in the 'Electronics' category have dropped by 30% in the last 24 hours.", read: false },
                { title: "New Sales Record!", time: "5 hours ago", type: "success", desc: "Congratulations! You've reached a new daily sales record of $12,450.", read: false },
                { title: "Inventory Low: Smart Watch X", time: "12 hours ago", type: "warning", desc: "Only 5 units left in stock. Consider restocking soon.", read: true },
                { title: "System Maintenance", time: "1 day ago", type: "info", desc: "Scheduled maintenance completed successfully. All systems are operational.", read: true },
              ].map((alert, i) => (
                <motion.div 
                  key={i} 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={cn(
                    "border rounded-2xl p-6 flex items-start gap-4 transition-all hover:shadow-md cursor-pointer",
                    !alert.read ? "bg-white dark:bg-slate-800 border-indigo-500/30 shadow-sm" : "bg-slate-50/50 dark:bg-slate-900/30 border-slate-200 dark:border-slate-800 opacity-70",
                    alert.type === 'warning' && !alert.read ? "border-l-4 border-l-amber-500" : 
                    alert.type === 'success' && !alert.read ? "border-l-4 border-l-emerald-500" : 
                    alert.type === 'info' && !alert.read ? "border-l-4 border-l-indigo-500" : ""
                  )}
                >
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                    alert.type === 'warning' ? "bg-amber-500/20 text-amber-500" : 
                    alert.type === 'success' ? "bg-emerald-500/20 text-emerald-500" : 
                    "bg-indigo-500/20 text-indigo-500"
                  )}>
                    {alert.type === 'warning' ? <AlertCircle className="w-5 h-5" /> : 
                     alert.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : 
                     <Bell className="w-5 h-5" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold">{alert.title}</h4>
                        {!alert.read && <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />}
                      </div>
                      <span className="text-xs text-slate-400 flex items-center gap-1"><Clock className="w-3 h-3" /> {alert.time}</span>
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{alert.desc}</p>
                    <div className="mt-4 flex items-center gap-4">
                      <button className="text-xs font-bold text-indigo-600 hover:underline">View Details</button>
                      <button className="text-xs font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">Dismiss</button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        );
      case 'settings':
        return (
          <div className="space-y-8 max-w-2xl">
            <h2 className="text-3xl font-bold">User Settings</h2>
            
            <div className="space-y-6">
              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-8 shadow-sm">
                <h3 className="text-xl font-bold mb-6">Profile Information</h3>
                <div className="flex items-center gap-6 mb-8">
                  <div className="relative group">
                    <div className="w-20 h-20 rounded-3xl bg-indigo-600/10 flex items-center justify-center text-indigo-600 text-3xl font-black overflow-hidden">
                      {user.name[0]}
                    </div>
                    <button className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-3xl">
                      <Plus className="w-6 h-6 text-white" />
                    </button>
                  </div>
                  <div>
                    <button className="text-sm font-bold text-indigo-600 hover:text-indigo-500 transition-colors">Change Avatar</button>
                    <p className="text-xs text-slate-400 mt-1">JPG, GIF or PNG. Max size of 800K</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Full Name</label>
                    <input type="text" defaultValue={user.name} className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Email Address</label>
                    <input type="email" defaultValue={user.email} className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all" />
                  </div>
                </div>
                <div className="mt-6 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Your profile information is used for report generation and AI personalization. We never share your data with third parties.
                  </p>
                </div>
                <button className="mt-8 bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg shadow-indigo-600/20">Save Changes</button>
              </div>

              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-8 shadow-sm">
                <h3 className="text-xl font-bold mb-6">Preferences</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between py-4 border-b border-slate-100 dark:border-slate-700">
                    <div>
                      <h4 className="font-bold">Appearance</h4>
                      <p className="text-xs text-slate-400">Switch between light and dark themes</p>
                    </div>
                    <button 
                      onClick={toggleTheme}
                      className="w-14 h-8 bg-slate-100 dark:bg-slate-700 rounded-full relative p-1 transition-all"
                    >
                      <motion.div 
                        animate={{ x: theme === 'light' ? 0 : 24 }}
                        className="w-6 h-6 bg-white dark:bg-indigo-500 rounded-full shadow-sm flex items-center justify-center"
                      >
                        {theme === 'light' ? <Sun className="w-3 h-3 text-amber-500" /> : <Moon className="w-3 h-3 text-white" />}
                      </motion.div>
                    </button>
                  </div>
                  <div className="flex items-center justify-between py-4 border-b border-slate-100 dark:border-slate-700">
                    <div>
                      <h4 className="font-bold">Email Notifications</h4>
                      <p className="text-xs text-slate-400">Receive weekly automated reports</p>
                    </div>
                    <button className="w-14 h-8 bg-indigo-600 rounded-full relative p-1 transition-all">
                      <div className="w-6 h-6 bg-white rounded-full ml-auto" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between py-4">
                    <div>
                      <h4 className="font-bold">Default Language</h4>
                      <p className="text-xs text-slate-400">Primary language for voice recognition</p>
                    </div>
                    <select 
                      value={selectedLang}
                      onChange={(e) => setSelectedLang(e.target.value)}
                      className="bg-slate-100 dark:bg-slate-700 border-none rounded-lg px-3 py-1.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                    >
                      <option value="en-US">English (US)</option>
                      <option value="hi-IN">Hindi</option>
                      <option value="te-IN">Telugu</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="bg-rose-500/5 border border-rose-500/20 rounded-3xl p-8">
                <h3 className="text-xl font-bold text-rose-500 mb-2">Danger Zone</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Once you delete your account, there is no going back. Please be certain.</p>
                <button className="bg-rose-500 hover:bg-rose-600 text-white px-6 py-3 rounded-xl font-bold transition-all">Delete Account</button>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white overflow-hidden font-sans transition-colors duration-300">
      {/* Sidebar */}
      <aside className="w-72 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col shadow-sm z-20">
        <div className="p-8 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Database className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-black tracking-tighter">VoxSQL</span>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
          {[
            { id: 'assistant', icon: Brain, label: 'Query Assistant' },
            { id: 'data', icon: TableIcon, label: 'My Data' },
            { id: 'insights', icon: Sparkles, label: 'AI Insights' },
            { id: 'predictions', icon: TrendingUp, label: 'Predictions' },
            { id: 'reports', icon: FileText, label: 'Reports' },
            { id: 'alerts', icon: Bell, label: 'Alerts' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-200 group",
                activeTab === item.id 
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20" 
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
              )}
            >
              <item.icon className={cn("w-5 h-5 transition-transform group-hover:scale-110", activeTab === item.id ? "text-white" : "text-slate-400")} />
              <span className="font-bold text-sm tracking-tight">{item.label}</span>
              {activeTab === item.id && (
                <motion.div layoutId="active-pill" className="ml-auto w-1.5 h-1.5 rounded-full bg-white" />
              )}
            </button>
          ))}
        </nav>

        <div className="p-6 mt-auto border-t border-slate-200 dark:border-slate-800">
          <button 
            onClick={() => setActiveTab('settings')}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all mb-4",
              activeTab === 'settings' ? "bg-slate-100 dark:bg-slate-800 text-indigo-600" : "text-slate-500 hover:text-indigo-600"
            )}
          >
            <Settings className="w-5 h-5" />
            <span className="font-bold text-sm">Settings</span>
          </button>
          <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/10 flex items-center justify-center text-indigo-600 font-black">
              {user.name[0]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold truncate">{user.name}</p>
              <p className="text-[10px] text-slate-400 truncate uppercase tracking-widest font-bold">Free Plan</p>
            </div>
            <button onClick={onLogout} className="text-slate-400 hover:text-red-500 transition-colors">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto relative scroll-smooth">
        {/* Header */}
        <header className="sticky top-0 z-10 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 p-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="lg:hidden">
               {/* Mobile menu toggle would go here */}
            </div>
            <h1 className="text-2xl font-black tracking-tight">
              {activeTab === 'assistant' && "Query Assistant"}
              {activeTab === 'data' && "Data Management"}
              {activeTab === 'insights' && "Business Insights"}
              {activeTab === 'predictions' && "Future Predictions"}
              {activeTab === 'reports' && "Reports"}
              {activeTab === 'alerts' && "Alerts"}
              {activeTab === 'settings' && "Settings"}
            </h1>
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={toggleTheme}
              className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-indigo-600 transition-all"
            >
              {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </button>
            
            <div className="h-8 w-[1px] bg-slate-200 dark:bg-slate-800" />
            
            <div className="relative hidden sm:block">
              <select 
                value={selectedDb?.id || ''} 
                onChange={(e) => setSelectedDb(databases.find(d => d.id === Number(e.target.value)) || null)}
                className="appearance-none bg-slate-100 dark:bg-slate-800 border-none rounded-xl px-4 py-2.5 pr-10 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all cursor-pointer"
              >
                <option value="" disabled>Select Database</option>
                {databases.map(db => (
                  <option key={db.id} value={db.id}>{db.name}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
          </div>
        </header>

        <div className="p-8 max-w-6xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

