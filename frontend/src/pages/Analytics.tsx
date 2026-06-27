import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ChartCard } from '../components/ChartCard';
import { Filter, RefreshCw, BarChart2, TrendingUp, DollarSign, Wallet } from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  BarChart
} from 'recharts';

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

export const Analytics: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [charts, setCharts] = useState<ChartsData | null>(null);
  
  // Filter states
  const [storeFilter, setStoreFilter] = useState('');
  const [regionFilter, setRegionFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [yearFilter, setYearFilter] = useState('2025');
  const [quarterFilter, setQuarterFilter] = useState('');

  const fetchAnalyticsData = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (storeFilter) params.store_id = storeFilter;
      if (regionFilter) params.region = regionFilter;
      if (categoryFilter) params.category_id = categoryFilter;
      if (quarterFilter) params.quarter = quarterFilter;
      if (yearFilter) params.year = yearFilter;

      const res = await axios.get('/dashboard/charts', { params });
      setCharts(res.data);
    } catch (err) {
      console.error('Failed to load analytics data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalyticsData();
  }, [storeFilter, regionFilter, categoryFilter, quarterFilter, yearFilter]);

  // Mock Segment distribution data (since seeder groups segments on customer names)
  const mockSegmentData = [
    { name: 'Consumer Segment', value: 45000, percentage: 48 },
    { name: 'Corporate Segment', value: 32000, percentage: 34 },
    { name: 'Home Office Segment', value: 17000, percentage: 18 },
  ];

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Business Analytics</h2>
          <p className="text-slate-400 text-sm">Deep-dive visualizations of customer segments, cities, and profit margins.</p>
        </div>
        <button
          onClick={fetchAnalyticsData}
          className="flex items-center gap-1.5 px-4 py-2 bg-white dark:bg-dark-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-sm font-semibold rounded-xl transition-all cursor-pointer shadow-sm w-fit"
        >
          <RefreshCw size={16} />
          <span>Refresh Analysis</span>
        </button>
      </div>

      {/* Filter panel */}
      <div className="glass-card border border-slate-200/60 dark:border-slate-800/80 rounded-2xl p-4 shadow-sm flex flex-wrap gap-4 items-center">
        <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500 text-sm font-bold shrink-0">
          <Filter size={16} />
          <span>FILTERS</span>
        </div>

        <select
          value={storeFilter}
          onChange={(e) => setStoreFilter(e.target.value)}
          className="px-3 py-1.5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-dark-900 text-slate-700 dark:text-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-brand-500"
        >
          <option value="">All Stores</option>
          <option value="1">East Metro Hub</option>
          <option value="2">West Coast Flagship</option>
          <option value="3">Midwest Distribution Store</option>
          <option value="4">Southern Retail Center</option>
        </select>

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

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-3 py-1.5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-dark-900 text-slate-700 dark:text-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-brand-500"
        >
          <option value="">All Categories</option>
          <option value="1">Electronics</option>
          <option value="2">Furniture</option>
          <option value="3">Office Supplies</option>
          <option value="4">Apparel</option>
          <option value="5">Groceries</option>
        </select>

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
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Margin Distribution: Revenue vs profit Margin */}
        <ChartCard title="Margin Breakdown" subtitle="Comparison of billing and net profit margins" loading={loading}>
          {charts && (
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={charts.sales_trend} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
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
                  formatter={(value: any) => [`$${parseFloat(value).toFixed(2)}`, '']}
                />
                <Legend verticalAlign="top" height={36} iconType="circle" />
                <Bar name="Total Revenue" dataKey="revenue" fill="#3b66f5" radius={[4, 4, 0, 0]} barSize={25} />
                <Line name="Net Profit" type="monotone" dataKey="profit" stroke="#10b981" strokeWidth={3} dot={{ r: 3 }} />
              </ComposedChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        {/* Segment Sales proportions */}
        <ChartCard title="Client Segment Demographics" subtitle="Share of customer segments" loading={loading}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={mockSegmentData}
                cx="50%"
                cy="45%"
                innerRadius={0}
                outerRadius={80}
                paddingAngle={0}
                dataKey="value"
                nameKey="name"
              >
                {mockSegmentData.map((entry, index) => (
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
        </ChartCard>

        {/* Top billing cities bar chart */}
        <ChartCard title="Sales by Top Cities" subtitle="Regional metropolitan hub billing" loading={loading}>
          {charts && (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.top_cities} layout="vertical" margin={{ top: 10, right: 10, left: 15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(148, 163, 184, 0.1)" />
                <XAxis type="number" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis type="category" dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
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
                <Bar name="Sales Revenue" dataKey="value" fill="#a855f7" radius={[0, 4, 4, 0]} barSize={15} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        {/* Regional performance */}
        <ChartCard title="Regional Distribution" subtitle="Sales volume by geographic region" loading={loading}>
          {charts && (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.top_regions} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148, 163, 184, 0.1)" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
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
                <Bar name="Regional Revenue" dataKey="value" fill="#06b6d4" radius={[4, 4, 0, 0]} barSize={35} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </div>
    </div>
  );
};
