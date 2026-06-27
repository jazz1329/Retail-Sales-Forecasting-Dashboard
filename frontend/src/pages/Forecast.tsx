import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ChartCard } from '../components/ChartCard';
import { KPICard } from '../components/KPICard';
import { useAuth } from '../contexts/AuthContext';
import {
  TrendingUp,
  BrainCircuit,
  Settings,
  Calendar,
  AlertCircle,
  Activity,
  Play,
  RotateCw,
  Gauge,
  HelpCircle
} from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';

interface ForecastMetrics {
  mae: number;
  rmse: number;
  r2: number;
  horizon_days: number;
  model_name: string;
  training_date: string;
}

interface ChartPoint {
  date: string;
  actual: number | null;
  predicted: number | null;
  lower: number | null;
  upper: number | null;
}

export const Forecast: React.FC = () => {
  const { checkPermission } = useAuth();
  const isManager = checkPermission(['Manager', 'Admin']);

  const [loadingChart, setLoadingChart] = useState(true);
  const [loadingMetrics, setLoadingMetrics] = useState(true);
  const [retraining, setRetraining] = useState(false);

  const [metrics, setMetrics] = useState<ForecastMetrics | null>(null);
  const [chartData, setChartData] = useState<ChartPoint[]>([]);

  // Filters
  const [storeFilter, setStoreFilter] = useState('');
  const [productFilter, setProductFilter] = useState('');
  const [horizonFilter, setHorizonFilter] = useState(90); // 30, 90, 180, 365

  // Dropdown lists
  const [stores, setStores] = useState<{ id: number; name: string }[]>([]);
  const [products, setProducts] = useState<{ id: number; name: string }[]>([]);

  const fetchFilters = async () => {
    try {
      const [pRes, sRes] = await Promise.all([
        axios.get('/products?limit=100'),
        axios.get('/dashboard/kpis') // use default seed stores fallback
      ]);
      setProducts(pRes.data);
      // Hardcoded fallback matching seeder
      setStores([
        { id: 1, name: 'East Metro Hub' },
        { id: 2, name: 'West Coast Flagship' },
        { id: 3, name: 'Midwest Distribution Store' },
        { id: 4, name: 'Southern Retail Center' }
      ]);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchMetrics = async () => {
    setLoadingMetrics(true);
    try {
      const res = await axios.get('/forecast/metrics');
      setMetrics(res.data);
    } catch (err) {
      console.error('Failed to load ML metrics', err);
    } finally {
      setLoadingMetrics(false);
    }
  };

  const fetchForecastChart = async () => {
    setLoadingChart(true);
    try {
      const params: any = { history_days: 90 };
      if (storeFilter) params.store_id = storeFilter;
      if (productFilter) params.product_id = productFilter;

      const res = await axios.get('/forecast/chart', { params });
      setChartData(res.data);
    } catch (err) {
      console.error('Failed to load forecast chart', err);
    } finally {
      setLoadingChart(false);
    }
  };

  const handleRetrain = async () => {
    if (!isManager) return;
    setRetraining(true);
    try {
      await axios.post('/forecast/retrain', {
        horizon_days: horizonFilter,
        retrain_model: true
      });
      // Refresh metrics and chart
      await Promise.all([fetchMetrics(), fetchForecastChart()]);
    } catch (err) {
      alert('Failed to retrain model. Check console.');
      console.error(err);
    } finally {
      setRetraining(false);
    }
  };

  useEffect(() => {
    fetchFilters();
    fetchMetrics();
  }, []);

  useEffect(() => {
    fetchForecastChart();
  }, [storeFilter, productFilter]);

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <BrainCircuit className="text-brand-500" />
            <span>AI Predictive Forecasting</span>
          </h2>
          <p className="text-slate-400 text-sm">Review machine learning model projections and accuracy indicators.</p>
        </div>

        {isManager && (
          <div className="flex items-center gap-3">
            {/* Horizon Selector */}
            <div className="flex items-center bg-white dark:bg-dark-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 shadow-sm text-xs font-semibold text-slate-700 dark:text-slate-200">
              <span className="text-slate-400 mr-2 uppercase">Horizon:</span>
              <select
                value={horizonFilter}
                onChange={(e) => setHorizonFilter(parseInt(e.target.value))}
                className="bg-transparent border-none focus:outline-none cursor-pointer"
              >
                <option value="30">Next 30 Days</option>
                <option value="90">Next 90 Days</option>
                <option value="180">Next 6 Months</option>
                <option value="365">Next Year</option>
              </select>
            </div>

            <button
              onClick={handleRetrain}
              disabled={retraining}
              className="flex items-center gap-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-500 active:bg-brand-700 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-brand-600/10 cursor-pointer disabled:opacity-50"
            >
              {retraining ? (
                <>
                  <RotateCw size={14} className="animate-spin" />
                  <span>Fitting Model...</span>
                </>
              ) : (
                <>
                  <Play size={14} />
                  <span>Retrain ML Model</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Model Accuracy metrics summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <KPICard
          title="Model Coefficient R²"
          value={metrics ? metrics.r2.toFixed(3) : '0.000'}
          icon={Gauge}
          loading={loadingMetrics}
          changeSuffix="Closer to 1 is better"
          change={metrics ? (metrics.r2 > 0.1 ? 3.5 : -1.2) : undefined}
        />
        <KPICard
          title="Mean Absolute Error (MAE)"
          value={metrics ? `${metrics.mae.toFixed(2)} units` : '0.00'}
          icon={Activity}
          loading={loadingMetrics}
          changeSuffix="Avg prediction variance"
        />
        <KPICard
          title="Root Mean Sq. Error (RMSE)"
          value={metrics ? `${metrics.rmse.toFixed(2)} units` : '0.00'}
          icon={AlertCircle}
          loading={loadingMetrics}
          changeSuffix="Standard error metric"
        />
      </div>

      {/* Filters card */}
      <div className="glass-card border border-slate-200/60 dark:border-slate-800/80 rounded-2xl p-4 shadow-sm flex flex-wrap gap-4 items-center">
        <div className="text-slate-400 dark:text-slate-500 text-xs font-bold uppercase tracking-wider">
          Chart Filters:
        </div>

        <select
          value={storeFilter}
          onChange={(e) => setStoreFilter(e.target.value)}
          className="px-3 py-1.5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-dark-900 text-slate-700 dark:text-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-brand-500"
        >
          <option value="">All Stores combined</option>
          {stores.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>

        <select
          value={productFilter}
          onChange={(e) => setProductFilter(e.target.value)}
          className="px-3 py-1.5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-dark-900 text-slate-700 dark:text-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-brand-500 max-w-xs"
        >
          <option value="">All Products combined</option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>

        {metrics && (
          <div className="ml-auto text-[10px] text-slate-400 font-mono">
            Model: <span className="font-bold text-slate-300">{metrics.model_name}</span> | Last fit:{' '}
            <span className="font-bold text-slate-300">{new Date(metrics.training_date).toLocaleDateString()}</span>
          </div>
        )}
      </div>

      {/* Main Forecast Chart */}
      <ChartCard
        title="Predictive Sales Horizon Projection"
        subtitle="Solid line: actual historical sales | Dotted line: AI predictions (including bounds)"
        loading={loadingChart}
      >
        {chartData.length > 0 && (
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148, 163, 184, 0.1)" />
              <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
              
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(15, 23, 42, 0.95)',
                  borderRadius: '12px',
                  border: '1px solid rgba(51, 65, 85, 0.5)',
                  color: '#fff',
                  fontSize: '12px'
                }}
              />
              
              <Legend verticalAlign="top" height={36} iconType="circle" />
              
              {/* Confidence Interval bounds area */}
              <Area
                name="Confidence Range"
                type="monotone"
                dataKey="upper"
                fill="#818cf8"
                fillOpacity={0.06}
                stroke="none"
              />
              
              <Area
                name=""
                type="monotone"
                dataKey="lower"
                fill="#818cf8"
                fillOpacity={0}
                stroke="none"
              />

              {/* Historical actual sales line */}
              <Line
                name="Actual Daily Sales"
                type="monotone"
                dataKey="actual"
                stroke="#3b66f5"
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 5 }}
              />

              {/* Forecasted predicted sales line */}
              <Line
                name="Forecasted Projections"
                type="monotone"
                dataKey="predicted"
                stroke="#a855f7"
                strokeWidth={2.5}
                strokeDasharray="5 5"
                dot={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </ChartCard>
    </div>
  );
};
