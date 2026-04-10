import React, { useState, useEffect } from 'react';
import { Activity, BarChart2, AlertCircle, CheckCircle } from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell
} from 'recharts';
import { 
  fetchStatsOverview, 
  fetchStatsRetention, 
  fetchStatsForecast, 
  fetchStatsLeeches 
} from '../api';

const StatsView: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState<any>(null);
  const [retention, setRetention] = useState<any>(null);
  const [forecast, setForecast] = useState<any[]>([]);
  const [leeches, setLeeches] = useState<any[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [overviewData, retentionData, forecastData, leechesData] = await Promise.all([
          fetchStatsOverview(),
          fetchStatsRetention(),
          fetchStatsForecast(),
          fetchStatsLeeches()
        ]);
        
        setOverview(overviewData);
        setRetention(retentionData);
        setForecast(forecastData);
        setLeeches(leechesData);
      } catch (error) {
        console.error("Failed to load stats", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-8 space-y-6">
        <div className="flex items-center justify-center gap-3 mb-8 text-cyan-400/80">
          <Activity className="w-5 h-5" />
          <h1 className="text-sm font-sans tracking-widest uppercase">Metrics Dashboard</h1>
        </div>
        <div className="animate-pulse space-y-6">
          <div className="h-32 bg-slate-900/80 rounded-lg border border-slate-800"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="h-64 bg-slate-900/80 rounded-lg border border-slate-800"></div>
            <div className="h-64 bg-slate-900/80 rounded-lg border border-slate-800"></div>
          </div>
        </div>
      </div>
    );
  }

  // Calculate percentages for the progress bars
  const total = overview?.total || 1; // Prevent div by 0
  const masteredPct = ((overview?.mastered || 0) / total) * 100;
  const learningPct = ((overview?.learning || 0) / total) * 100;
  const notStartedPct = ((overview?.not_started || 0) / total) * 100;

  return (
    <div className="max-w-4xl mx-auto py-8 space-y-6 transition-all duration-200">
      {/* Header */}
      <div className="flex items-center justify-center gap-3 mb-8 text-cyan-400/80">
        <Activity className="w-5 h-5" />
        <h1 className="text-sm font-sans tracking-widest uppercase">Metrics Dashboard</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Retention Rate Metric */}
        <div className="bg-slate-900/80 backdrop-blur-sm border border-slate-800 rounded-lg p-6 flex flex-col justify-between glass-panel">
          <div className="flex items-center gap-2 text-emerald-400/80 mb-4">
            <CheckCircle className="w-4 h-4" />
            <h2 className="text-xs font-sans tracking-widest uppercase">Global Retention</h2>
          </div>
          <div className="flex items-end gap-2">
            <span className="text-4xl font-mono text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.2)]">
              {retention?.retention_rate_percent || 0}%
            </span>
          </div>
          <p className="text-xs font-sans text-slate-500 mt-2">
            Based on {retention?.total_reviews || 0} total reviews
          </p>
        </div>

        {/* Deck Progress Visuals */}
        <div className="md:col-span-2 bg-slate-900/80 backdrop-blur-sm border border-slate-800 rounded-lg p-6 glass-panel flex flex-col justify-center">
          <h2 className="text-xs font-sans tracking-widest uppercase text-cyan-400/80 mb-6">Deck Completion</h2>
          
          <div className="space-y-4">
            {/* Mastered */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-sans text-slate-400">Mastered</span>
                <span className="font-mono text-cyan-400">{overview?.mastered || 0}</span>
              </div>
              <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-cyan-500/80 shadow-[0_0_10px_rgba(34,211,238,0.5)] transition-all duration-1000" 
                  style={{ width: `${masteredPct}%` }}
                ></div>
              </div>
            </div>

            {/* Learning */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-sans text-slate-400">Learning</span>
                <span className="font-mono text-emerald-400">{overview?.learning || 0}</span>
              </div>
              <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-emerald-500/80 shadow-[0_0_10px_rgba(16,185,129,0.5)] transition-all duration-1000" 
                  style={{ width: `${learningPct}%` }}
                ></div>
              </div>
            </div>

            {/* Not Started */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-sans text-slate-400">Not Started</span>
                <span className="font-mono text-slate-500">{overview?.not_started || 0}</span>
              </div>
              <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-slate-600/50 transition-all duration-1000" 
                  style={{ width: `${notStartedPct}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Forecast Chart */}
        <div className="bg-slate-900/80 backdrop-blur-sm border border-slate-800 rounded-lg p-6 glass-panel">
          <div className="flex items-center gap-2 text-cyan-400/80 mb-6">
            <BarChart2 className="w-4 h-4" />
            <h2 className="text-xs font-sans tracking-widest uppercase">7-Day Forecast</h2>
          </div>
          
          <div className="h-64 w-full">
            {forecast.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={forecast} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis 
                    dataKey="due_date" 
                    stroke="#475569" 
                    fontSize={10} 
                    tickFormatter={(val) => {
                      const date = new Date(val);
                      return `${date.getMonth() + 1}/${date.getDate()}`;
                    }}
                    tickMargin={10}
                    fontFamily="monospace"
                  />
                  <YAxis stroke="#475569" fontSize={10} fontFamily="monospace" allowDecimals={false} />
                  <Tooltip 
                    cursor={{ fill: '#0f172a' }}
                    contentStyle={{ backgroundColor: '#020617', borderColor: '#1e293b', borderRadius: '8px', fontSize: '12px' }}
                    itemStyle={{ color: '#22d3ee' }}
                    labelStyle={{ color: '#94a3b8', marginBottom: '4px' }}
                  />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {forecast.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={index === 0 ? '#38bdf8' : '#0ea5e9'} fillOpacity={0.8} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-500 font-sans text-sm">
                No reviews scheduled.
              </div>
            )}
          </div>
        </div>

        {/* Leeches Table */}
        <div className="bg-slate-900/80 backdrop-blur-sm border border-slate-800 rounded-lg p-6 glass-panel flex flex-col">
          <div className="flex items-center gap-2 text-rose-400/80 mb-6">
            <AlertCircle className="w-4 h-4" />
            <h2 className="text-xs font-sans tracking-widest uppercase">Critical Targets (Leeches)</h2>
          </div>
          
          <div className="flex-1 overflow-auto">
            {leeches.length > 0 ? (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800/50 text-[10px] uppercase font-sans tracking-widest text-slate-500">
                    <th className="pb-3 font-normal">German</th>
                    <th className="pb-3 font-normal">English</th>
                    <th className="pb-3 font-normal text-right">Lapses</th>
                  </tr>
                </thead>
                <tbody className="text-sm font-sans divide-y divide-slate-800/50">
                  {leeches.map((leech) => (
                    <tr key={leech.id} className="group hover:bg-slate-800/20 transition-colors">
                      <td className="py-3 pr-4 text-slate-300 group-hover:text-cyan-400 transition-colors">{leech.german}</td>
                      <td className="py-3 pr-4 text-slate-500">{leech.english}</td>
                      <td className="py-3 text-right">
                        <span className="font-mono text-rose-400 bg-rose-500/10 px-2 py-1 rounded border border-rose-500/20">
                          {leech.fsrs_lapses}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-500 font-sans text-sm">
                No leeches detected. Great job!
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsView;
