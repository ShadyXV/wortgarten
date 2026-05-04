import React, { useState, useEffect } from 'react';
import { Activity, BarChart2, AlertCircle, CheckCircle } from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell
} from 'recharts';
import { 
  fetchStatsOverview, 
  fetchStatsRetention, 
  fetchStatsForecast, 
  fetchStatsLeeches,
  type StatsForecastItem,
  type StatsLeech,
  type StatsOverview,
  type StatsRetention
} from '../api';

const StatsView: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState<StatsOverview | null>(null);
  const [retention, setRetention] = useState<StatsRetention | null>(null);
  const [forecast, setForecast] = useState<StatsForecastItem[]>([]);
  const [leeches, setLeeches] = useState<StatsLeech[]>([]);

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
      <div className="wg-page-wide py-8 space-y-6">
        <div className="wg-page-header mb-8">
          <div className="wg-kicker">
            <Activity className="w-5 h-5" />
            <h1>Kennzahlen Dashboard</h1>
          </div>
        </div>
        <div className="animate-pulse space-y-6">
          <div className="h-32 wg-panel"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="h-64 wg-panel"></div>
            <div className="h-64 wg-panel"></div>
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
    <div className="wg-page-wide py-8 space-y-6 transition-all duration-200">
      <div className="wg-page-header mb-8">
        <div className="wg-kicker">
          <Activity className="w-5 h-5" />
          <h1>Kennzahlen Dashboard</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="wg-panel p-6 flex flex-col justify-between">
          <div className="flex items-center gap-2 text-[var(--wg-linden)] mb-4">
            <CheckCircle className="w-4 h-4" />
            <h2 className="wg-label text-[var(--wg-linden)]">Global Retention</h2>
          </div>
          <div className="flex items-center gap-5">
            <div
              className="grid h-24 w-24 place-items-center rounded-full"
              style={{
                background: `conic-gradient(var(--wg-gold) ${retention?.retention_rate_percent || 0}%, rgba(235,227,214,0.1) 0)`,
              }}
            >
              <div className="grid h-[72px] w-[72px] place-items-center rounded-full bg-[var(--wg-charcoal)]">
                <span className="text-lg wg-tabular text-[var(--wg-ivory)]">{retention?.retention_rate_percent || 0}%</span>
              </div>
            </div>
            <span className="text-4xl wg-tabular text-[var(--wg-gold)]">
              {retention?.retention_rate_percent || 0}%
            </span>
          </div>
          <p className="text-xs wg-subtle mt-4">
            Based on {retention?.total_reviews || 0} total reviews
          </p>
        </div>

        <div className="md:col-span-2 wg-panel p-6 flex flex-col justify-center">
          <h2 className="wg-label text-[var(--wg-gold)] mb-6">Deck Completion</h2>
          
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="wg-subtle">Mastered</span>
                <span className="wg-tabular text-[var(--wg-gold)]">{overview?.mastered || 0}</span>
              </div>
              <div className="wg-progress-track">
                <div 
                  className="wg-progress-fill transition-all duration-1000"
                  style={{ width: `${masteredPct}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="wg-subtle">Learning</span>
                <span className="wg-tabular text-[var(--wg-linden)]">{overview?.learning || 0}</span>
              </div>
              <div className="wg-progress-track">
                <div 
                  className="h-full rounded-full bg-[var(--wg-linden)] transition-all duration-1000"
                  style={{ width: `${learningPct}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="wg-subtle">Not Started</span>
                <span className="wg-tabular text-[rgba(235,227,214,0.46)]">{overview?.not_started || 0}</span>
              </div>
              <div className="wg-progress-track">
                <div 
                  className="h-full rounded-full bg-[rgba(235,227,214,0.18)] transition-all duration-1000"
                  style={{ width: `${notStartedPct}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="wg-panel p-6">
          <div className="flex items-center gap-2 text-[var(--wg-gold)] mb-6">
            <BarChart2 className="w-4 h-4" />
            <h2 className="wg-label text-[var(--wg-gold)]">7-Day Forecast</h2>
          </div>
          
          <div className="h-64 w-full">
            {forecast.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={forecast} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(212,175,55,0.14)" vertical={false} />
                  <XAxis 
                    dataKey="due_date" 
                    stroke="rgba(235,227,214,0.42)"
                    fontSize={10} 
                    tickFormatter={(val) => {
                      const date = new Date(val);
                      return `${date.getMonth() + 1}/${date.getDate()}`;
                    }}
                    tickMargin={10}
                    fontFamily="monospace"
                  />
                  <YAxis stroke="rgba(235,227,214,0.42)" fontSize={10} fontFamily="monospace" allowDecimals={false} />
                  <Tooltip 
                    cursor={{ fill: 'rgba(235,227,214,0.04)' }}
                    contentStyle={{ backgroundColor: '#0f141c', borderColor: 'rgba(212,175,55,0.24)', borderRadius: '8px', fontSize: '12px', color: '#ebe3d6' }}
                    itemStyle={{ color: '#d4af37' }}
                    labelStyle={{ color: '#a79d8e', marginBottom: '4px' }}
                  />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {forecast.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={index === 0 ? '#d4af37' : '#7fb775'} fillOpacity={0.88} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center wg-subtle text-sm">
                No reviews scheduled.
              </div>
            )}
          </div>
        </div>

        <div className="wg-panel p-6 flex flex-col">
          <div className="flex items-center gap-2 text-[var(--wg-coral)] mb-6">
            <AlertCircle className="w-4 h-4" />
            <h2 className="wg-label text-[var(--wg-coral)]">Critical Targets (Leeches)</h2>
          </div>
          
          <div className="flex-1 overflow-auto">
            {leeches.length > 0 ? (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[rgba(212,175,55,0.14)] wg-label">
                    <th className="pb-3 font-normal">German</th>
                    <th className="pb-3 font-normal">English</th>
                    <th className="pb-3 font-normal text-right">Lapses</th>
                  </tr>
                </thead>
                <tbody className="text-sm divide-y divide-[rgba(212,175,55,0.12)]">
                  {leeches.map((leech) => (
                    <tr key={leech.id} className="wg-row group">
                      <td className="py-3 pr-4 wg-german group-hover:text-[var(--wg-gold)] transition-colors">{leech.german}</td>
                      <td className="py-3 pr-4 wg-subtle">{leech.english}</td>
                      <td className="py-3 text-right">
                        <span className="wg-badge wg-badge-danger wg-tabular">
                          {leech.fsrs_lapses}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="h-full flex items-center justify-center wg-subtle text-sm">
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
