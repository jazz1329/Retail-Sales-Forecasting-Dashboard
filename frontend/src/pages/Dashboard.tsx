import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { KPICard } from '../components/KPICard';
import { ChartCard } from '../components/ChartCard';
import {
  DollarSign,
  ShoppingCart,
  Users,
  TrendingUp,
  Percent,
  Layers,
  Calendar,
  Filter,
  RefreshCw,
  MapPin,
  Tag
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend
} from 'recharts';

interface KPIs {
  total_sales: number;
  total_revenue: number;
  total_orders: number;
  total_customers: number;
  avg_order_value: number;
  profit_margin_pct: number;
  growth_pct: number;
}

interface TrendPoint {
  date: string;
  sales: number;
  revenue: number;
  profit: number;
}

interface EntitySales {
  name: string;
  value: number;
  percentage: number;
}

interface ChartsData {
  sales_trend: TrendPoint[];
  top_products: EntitySales[];
  top_categories: EntitySales[];
  top_cities: EntitySales[];
  top_regions: EntitySales[];
  top_customers: EntitySales[];
}

const COLORS = ['#3b66f5', '#6366f1', '#a855f7', '#06b6d4', '#14b8a6', '#f43f5e'];

export const Dashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [kpis, setKpis] = useState<KPIs | null>(null);
  const [charts, setCharts] = useState<ChartsData | null>(null);
  const [stores, setStores] = useState<{ id: number; name: string }[]>([]);
  const [categories, setCategories] = useState<{ id: number; name: string }[]>([]);

  // Filter states
  const [storeFilter, setStoreFilter] = useState<string>('');
  const [regionFilter, setRegionFilter] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [quarterFilter, setQuarterFilter] = useState<string>('');
  const [yearFilter, setYearFilter] = useState<string>('2025'); // Default to seeding middle year

  const fetchFiltersInfo = async () => {
    try {
      // Setup simple stores and categories for dropdowns
      // Seeder always populates 4 stores and 5 categories
      setStores([
        { id: 1, name: 'East Metro Hub' },
        { id: 2, name: 'West Coast Flagship' },
        { id: 3, name: 'Midwest Distribution Store' },
        { id: 4, name: 'Southern Retail Center' }
      ]);
      setCategories([
        { id: 1, name: 'Electronics' },
        { id: 2, name: 'Furniture' },
        { id: 3, name: 'Office Supplies' },
        { id: 4, name: 'Apparel' },
        { id: 5, name: 'Groceries' }
      ]);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (storeFilter) params.store_id = storeFilter;
      if (regionFilter) params.region = regionFilter;
      if (categoryFilter) params.category_id = categoryFilter;
      if (quarterFilter) params.quarter = quarterFilter;
      if (yearFilter) params.year = yearFilter;

      const [kpiRes, chartsRes] = await Promise.all([
        axios.get('/dashboard/kpis', { params }),
        axios.get('/dashboard/charts', { params }),
      ]);

      setKpis(kpiRes.data);
      setCharts(chartsRes.data);
    } catch (err) {
      console.error('Failed to load dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiltersInfo();
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [storeFilter, regionFilter, categoryFilter, quarterFilter, yearFilter]);

  const clearFilters = () => {
    setStoreFilter('');
    setRegionFilter('');
    setCategoryFilter('');
    setQuarterFilter('');
    setYearFilter('');
  };

  // Mock Sales Heatmap data grid: Weekdays (0-6) vs Stores
  // Grouped values based on seeder ratios
  const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const mockHeatmapData = [
    { day: 0, store: 'East Metro Hub', value: 45 },
    { day: 1, store: 'East Metro Hub', value: 52 },
    { day: 2, store: 'East Metro Hub', value: 48 },
    { day: 3, store: 'East Metro Hub', value: 55 },
    { day: 4, store: 'East Metro Hub', value: 65 },
    { day: 5, store: 'East Metro Hub', value: 85 },
    { day: 6, store: 'East Metro Hub', value: 78 },
    
    { day: 0, store: 'West Coast Flagship', value: 60 },
    { day: 1, store: 'West Coast Flagship', value: 65 },
    { day: 2, store: 'West Coast Flagship', value: 58 },
    { day: 3, store: 'West Coast Flagship', value: 70 },
    { day: 4, store: 'West Coast Flagship', value: 80 },
    { day: 5, store: 'West Coast Flagship', value: 110 },
    { day: 6, store: 'West Coast Flagship', value: 95 },
    
    { day: 0, store: 'Midwest Distribution Store', value: 35 },
    { day: 1, store: 'Midwest Distribution Store', value: 42 },
    { day: 2, store: 'Midwest Distribution Store', value: 40 },
    { day: 3, store: 'Midwest Distribution Store', value: 45 },
    { day: 4, store: 'Midwest Distribution Store', value: 55 },
    { day: 5, store: 'Midwest Distribution Store', value: 75 },
    { day: 6, store: 'Midwest Distribution Store', value: 68 },
    
    { day: 0, store: 'Southern Retail Center', value: 40 },
    { day: 1, store: 'Southern Retail Center', value: 45 },
    { day: 2, store: 'Southern Retail Center', value: 43 },
    { day: 3, store: 'Southern Retail Center', value: 48 },
    { day: 4, store: 'Southern Retail Center', value: 58 },
    { day: 5, store: 'Southern Retail Center', value: 80 },
    { day: 6, store: 'Southern Retail Center', value: 72 }
  ];

  const getHeatmapColor = (val: number) => {
    if (val < 45) return 'bg-brand-500/10 dark:bg-brand-500/5 text-brand-900/60 dark:text-slate-400';
    if (val < 60) return 'bg-brand-500/35 dark:bg-brand-500/25 text-brand-900 dark:text-brand-200';
    if (val < 80) return 'bg-brand-500/60 dark:bg-brand-500/45 text-white';
    return 'bg-brand-600 dark:bg-brand-500 text-white font-bold';
  };

  return (
    <div className="space-y-6">
      {/* Header info */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Workspace Overview</h2>
          <p className="text-slate-400 text-sm">Monitor business transactions and analytical revenue streams.</p>
        </div>
        <button
          onClick={fetchDashboardData}
          className="flex items-center gap-1.5 px-4 py-2 bg-white dark:bg-dark-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-sm font-semibold rounded-xl transition-all cursor-pointer shadow-sm w-fit"
        >
          <RefreshCw size={16} />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Filter panel */}
      <div className="glass-card border border-slate-200/60 dark:border-slate-800/80 rounded-2xl p-4 shadow-sm flex flex-wrap gap-4 items-center">
        <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500 text-sm font-bold shrink-0">
          <Filter size={16} />
          <span>FILTERS</span>
        </div>

        {/* Store Dropdown */}
        <select
          value={storeFilter}
          onChange={(e) => setStoreFilter(e.target.value)}
          className="px-3 py-1.5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-dark-900 text-slate-700 dark:text-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-brand-500"
        >
          <option value="">All Stores</option>
          {stores.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>

        {/* Region Dropdown */}
        <select
          value={regionFilter}
          onChange={(e) => setRegionFilter(e.target.value)}
          className="px-3 py-1.5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-dark-900 text-slate-700 dark:text-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-brand-500"
        >
          <option value="">All Regions</option>
          <option value="East">East</option>
          <option value="West">West</option>
          <option value="Central">Central</option>
          <option value="South">South</option>
        </select>

        {/* Category Dropdown */}
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-3 py-1.5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-dark-900 text-slate-700 dark:text-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-brand-500"
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>

        {/* Year Dropdown */}
        <select
          value={yearFilter}
          onChange={(e) => setYearFilter(e.target.value)}
          className="px-3 py-1.5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-dark-900 text-slate-700 dark:text-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-brand-500"
        >
          <option value="">All Years</option>
          <option value="2024">2024</option>
          <option value="2025">2025</option>
          <option value="2026">2026</option>
        </select>

        {/* Quarter Dropdown */}
        <select
          value={quarterFilter}
          onChange={(e) => setQuarterFilter(e.target.value)}
          className="px-3 py-1.5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-dark-900 text-slate-700 dark:text-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-brand-500"
        >
          <option value="">All Quarters</option>
          <option value="1">Q1 (Jan - Mar)</option>
          <option value="2">Q2 (Apr - Jun)</option>
          <option value="3">Q3 (Jul - Sep)</option>
          <option value="4">Q4 (Oct - Dec)</option>
        </select>

        {/* Reset Button */}
        {(storeFilter || regionFilter || categoryFilter || quarterFilter || yearFilter) && (
          <button
            onClick={clearFilters}
            className="text-xs text-brand-500 hover:text-brand-600 font-semibold underline cursor-pointer ml-auto"
          >
            Clear all filters
          </button>
        )}
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title="Total Revenue"
          value={kpis ? `$${kpis.total_revenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '$0.00'}
          change={kpis?.growth_pct}
          icon={DollarSign}
          loading={loading}
        />
        <KPICard
          title="Units Sold (Sales)"
          value={kpis ? kpis.total_sales.toLocaleString() : '0'}
          change={kpis ? kpis.growth_pct * 0.9 : undefined} // Mock sales correlation
          icon={Layers}
          loading={loading}
        />
        <KPICard
          title="Total Transactions"
          value={kpis ? kpis.total_orders.toLocaleString() : '0'}
          icon={ShoppingCart}
          loading={loading}
        />
        <KPICard
          title="Profit Margin"
          value={kpis ? `${kpis.profit_margin_pct.toFixed(1)}%` : '0%'}
          icon={Percent}
          loading={loading}
          changeSuffix="Averaged over filter"
          change={kpis ? 1.2 : undefined} // stable change
        />
      </div>

      {/* Primary Graphs Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Trend Area Chart */}
        <div className="lg:col-span-2">
          <ChartCard title="Revenue & Profit Stream" subtitle="Historical monthly performance" loading={loading}>
            {charts && (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={charts.sales_trend} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b66f5" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#3b66f5" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148, 163, 184, 0.1)" />
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v >= 1000 ? (v / 1000).toFixed(0) + 'k' : v}`} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(15, 23, 42, 0.95)',
                      borderRadius: '12px',
                      border: '1px solid rgba(51, 65, 85, 0.5)',
                      color: '#fff',
                      fontSize: '12px'
                    }}
                    formatter={(value: any) => [`$${parseFloat(value).toFixed(2)}`, '']}
                  />
                  <Legend verticalAlign="top" height={36} iconType="circle" />
                  <Area name="Total Revenue" type="monotone" dataKey="revenue" stroke="#3b66f5" strokeWidth={2} fillOpacity={1} fill="url(#colorRev)" />
                  <Area name="Net Profit" type="monotone" dataKey="profit" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorProfit)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </ChartCard>
        </div>

        {/* Top Product Categories Donut Chart */}
        <div className="lg:col-span-1">
          <ChartCard title="Sales by Category" subtitle="Revenue composition" loading={loading}>
            {charts && (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={charts.top_categories}
                    cx="50%"
                    cy="45%"
                    innerRadius={60}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="value"
                    nameKey="name"
                  >
                    {charts.top_categories.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(15, 23, 42, 0.95)',
                      borderRadius: '12px',
                      border: '1px solid rgba(51, 65, 85, 0.5)',
                      color: '#fff',
                      fontSize: '12px'
                    }}
                    formatter={(value: any) => [`$${parseFloat(value).toFixed(2)}`, '']}
                  />
                  <Legend verticalAlign="bottom" align="center" layout="horizontal" iconType="circle" wrapperStyle={{ fontSize: '11px', bottom: 10 }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </ChartCard>
        </div>
      </div>

      {/* Secondary Row (Heatmap & top tables) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekday Sales Heatmap */}
        <div className="lg:col-span-2 glass-card rounded-2xl p-5 shadow-sm border border-slate-200/60 dark:border-slate-800/80 hover:shadow-md transition-all duration-200 flex flex-col h-[380px]">
          <div className="mb-4">
            <h4 className="text-base font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
              <span>Weekly Sales Intensity Heatmap</span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-brand-500/10 text-brand-600 dark:text-brand-400">Activity</span>
            </h4>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
              Visualizing relative transactions frequency grouped by weekday and store hub.
            </p>
          </div>
          <div className="flex-1 grid grid-cols-8 grid-rows-5 gap-2 items-center text-center mt-2">
            {/* Headers */}
            <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500">Store / Day</div>
            {weekdays.map((day) => (
              <div key={day} className="text-[10px] font-bold text-slate-400 dark:text-slate-500 truncate">{day.substring(0, 3)}</div>
            ))}
            
            {/* Rows */}
            {stores.map((store) => (
              <React.Fragment key={store.id}>
                <div className="text-[10px] font-bold text-left text-slate-700 dark:text-slate-300 truncate pr-1" title={store.name}>
                  {store.name.split(' ')[0]} Hub
                </div>
                {weekdays.map((_, dayIdx) => {
                  const cell = mockHeatmapData.find(
                    (d) => d.day === dayIdx && d.store === store.name
                  );
                  const val = cell ? cell.value : 0;
                  return (
                    <div
                      key={dayIdx}
                      className={`heatmap-cell flex items-center justify-center text-[10px] font-semibold rounded-lg h-9 shadow-sm ${getHeatmapColor(val)}`}
                      title={`${store.name} - ${weekdays[dayIdx]}: ${val} orders`}
                    >
                      {val}
                    </div>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Top customers Table card */}
        <div className="lg:col-span-1 glass-card rounded-2xl p-5 border border-slate-200/60 dark:border-slate-800/80 shadow-sm flex flex-col h-[380px]">
          <div className="mb-4">
            <h4 className="text-base font-bold text-slate-800 dark:text-white">Top Performing Clients</h4>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Ranked by overall order billing</p>
          </div>
          <div className="flex-1 overflow-y-auto space-y-3 pr-1">
            {loading ? (
              Array.from({ length: 4 }).map((_, idx) => (
                <div key={idx} className="h-12 bg-slate-100 dark:bg-slate-800 animate-pulse rounded-xl"></div>
              ))
            ) : charts?.top_customers.length === 0 ? (
              <p className="text-slate-400 text-center text-sm py-12">No client orders recorded.</p>
            ) : (
              charts?.top_customers.map((c, idx) => (
                <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50/50 dark:bg-slate-800/25 border border-slate-100 dark:border-slate-800/40">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-xs text-slate-600 dark:text-slate-300">
                      #{idx + 1}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">{c.name}</p>
                      <span className="text-[10px] text-slate-400">Total client billing</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-slate-800 dark:text-white">${c.value.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                    <span className="text-[9px] text-emerald-500 bg-emerald-500/10 px-1 rounded font-medium">{c.percentage?.toFixed(1)}% share</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
