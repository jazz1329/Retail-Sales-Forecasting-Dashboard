import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { KPICard } from '../components/KPICard';
import {
  Layers,
  DollarSign,
  AlertTriangle,
  RefreshCw,
  Upload,
  Download,
  FileSpreadsheet,
  AlertCircle,
  CheckCircle,
  Truck
} from 'lucide-react';

interface InventoryStats {
  total_products: number;
  total_stock: number;
  stock_value: number;
  potential_revenue: number;
  reorder_warnings_count: number;
  low_stock_items: any[];
}

export const Inventory: React.FC = () => {
  const { checkPermission } = useAuth();
  const isManager = checkPermission(['Manager', 'Admin']);

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<InventoryStats | null>(null);

  // File Upload states
  const [uploadType, setUploadType] = useState<'products' | 'customers'>('products');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<any>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const fetchInventoryStats = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/inventory');
      setStats(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventoryStats();
  }, []);

  const handleRestockSingle = async (pid: number) => {
    if (!isManager) return;
    try {
      await axios.post(`/inventory/reorder/${pid}?quantity=50`);
      fetchInventoryStats();
    } catch (err) {
      console.error(err);
      alert('Failed to restock item.');
    }
  };

  const handleRestockAll = async () => {
    if (!isManager) return;
    if (!window.confirm('This will restock all low-stock items. Proceed?')) return;
    try {
      const res = await axios.post('/inventory/reorder-all-low-stock');
      alert(`Restocked ${res.data.restocked_count} products successfully.`);
      fetchInventoryStats();
    } catch (err) {
      console.error(err);
      alert('Restock operation failed.');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setUploadResult(null);
      setUploadError(null);
    }
  };

  const handleUploadFile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile || !isManager) return;

    setUploading(true);
    setUploadResult(null);
    setUploadError(null);

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const res = await axios.post(`/data/upload?type=${uploadType}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setUploadResult(res.data);
      setSelectedFile(null);
      fetchInventoryStats();
    } catch (err: any) {
      setUploadError(err.response?.data?.detail || 'Upload failed. Ensure columns are correctly formatted.');
    } finally {
      setUploading(false);
    }
  };

  const handleExportOrders = () => {
    // Open in a new tab to trigger browser file download stream
    const token = localStorage.getItem('auth_token');
    const exportUrl = `${axios.defaults.baseURL}/data/export/orders?token=${token}`;
    window.open(exportUrl, '_blank');
  };

  const handleExportPDF = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Inventory & Data Center</h2>
          <p className="text-slate-400 text-sm">Audit stock levels, import csv directory lists, and download reports.</p>
        </div>

        {isManager && stats && stats.reorder_warnings_count > 0 && (
          <button
            onClick={handleRestockAll}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded-xl transition-all shadow-md cursor-pointer"
          >
            <Truck size={16} />
            <span>Restock All Low Stock ({stats.reorder_warnings_count})</span>
          </button>
        )}
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title="Stock Alerts"
          value={stats ? stats.reorder_warnings_count : 0}
          icon={AlertTriangle}
          loading={loading}
          change={stats && stats.reorder_warnings_count > 0 ? -15.0 : undefined}
          changeSuffix="Critical low stock warnings"
        />
        <KPICard
          title="Total Stock Count"
          value={stats ? stats.total_stock.toLocaleString() : '0'}
          icon={Layers}
          loading={loading}
        />
        <KPICard
          title="Wholesale stock Value"
          value={stats ? `$${stats.stock_value.toLocaleString(undefined, { maximumFractionDigits: 0 })}` : '$0'}
          icon={DollarSign}
          loading={loading}
        />
        <KPICard
          title="Potential retail Revenue"
          value={stats ? `$${stats.potential_revenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}` : '$0'}
          icon={DollarSign}
          loading={loading}
          change={stats ? ((stats.potential_revenue - stats.stock_value) / stats.stock_value) * 100 : undefined}
          changeSuffix="Markup margin projection"
        />
      </div>

      {/* Upload and Export Sections Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Low Stock Items List */}
        <div className="lg:col-span-2 glass-card rounded-2xl p-5 border border-slate-200/60 dark:border-slate-800/80 shadow-sm flex flex-col h-[400px]">
          <div className="mb-4">
            <h4 className="text-base font-bold text-slate-800 dark:text-white">Restock Trigger Board</h4>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Products whose stock has fallen below the reorder warning threshold</p>
          </div>
          <div className="flex-1 overflow-y-auto space-y-3 pr-1">
            {loading ? (
              Array.from({ length: 4 }).map((_, idx) => (
                <div key={idx} className="h-12 bg-slate-100 dark:bg-slate-800 animate-pulse rounded-xl"></div>
              ))
            ) : !stats || stats.low_stock_items.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-slate-400 text-center gap-2">
                <CheckCircle size={32} className="text-emerald-500" />
                <p className="font-semibold">All products fully stocked</p>
                <span className="text-xs">No items currently below reorder levels.</span>
              </div>
            ) : (
              stats.low_stock_items.map((prod) => (
                <div key={prod.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50/50 dark:bg-slate-800/25 border border-slate-100 dark:border-slate-800/40">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center font-bold text-xs text-red-500">
                      Alert
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">{prod.name}</p>
                      <span className="text-[10px] text-slate-400 font-mono">SKU: {prod.sku} | Level: <span className="font-bold text-red-400">{prod.current_stock}</span> / {prod.reorder_point}</span>
                    </div>
                  </div>
                  {isManager && (
                    <button
                      onClick={() => handleRestockSingle(prod.id)}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                    >
                      Restock (+50)
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Data transfers card */}
        <div className="lg:col-span-1 space-y-6">
          {/* File Upload Section */}
          <div className="glass-card rounded-2xl p-5 border border-slate-200/60 dark:border-slate-800/80 shadow-sm">
            <h4 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2 mb-3">
              <Upload size={16} className="text-brand-500" />
              <span>Import Data Sheet</span>
            </h4>
            
            <form onSubmit={handleUploadFile} className="space-y-3">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setUploadType('products')}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-semibold border ${
                    uploadType === 'products'
                      ? 'bg-brand-600 border-brand-600 text-white shadow-sm'
                      : 'bg-white dark:bg-dark-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                  } transition-all cursor-pointer`}
                >
                  Products
                </button>
                <button
                  type="button"
                  onClick={() => setUploadType('customers')}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-semibold border ${
                    uploadType === 'customers'
                      ? 'bg-brand-600 border-brand-600 text-white shadow-sm'
                      : 'bg-white dark:bg-dark-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                  } transition-all cursor-pointer`}
                >
                  Customers
                </button>
              </div>

              <div className="border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-brand-500/50 rounded-xl p-4 text-center cursor-pointer relative transition-all group">
                <input
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={handleFileChange}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <FileSpreadsheet size={24} className="mx-auto text-slate-400 group-hover:scale-110 transition-transform mb-1.5" />
                <span className="block text-xs font-semibold text-slate-600 dark:text-slate-300 truncate">
                  {selectedFile ? selectedFile.name : 'Choose CSV or Excel file'}
                </span>
                <span className="block text-[10px] text-slate-400 mt-0.5">Drag-and-drop file here</span>
              </div>

              {isManager && (
                <button
                  type="submit"
                  disabled={uploading || !selectedFile}
                  className="w-full py-2 bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold rounded-xl transition-all shadow-md disabled:opacity-50 cursor-pointer"
                >
                  {uploading ? 'Processing File...' : 'Import Data Sheet'}
                </button>
              )}
            </form>

            {/* Results feedback */}
            {uploadResult && (
              <div className="mt-3 p-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-lg text-xs font-medium flex items-center gap-1.5">
                <CheckCircle size={14} className="shrink-0" />
                <span>Imported {uploadResult.imported_records} rows successfully.</span>
              </div>
            )}
            {uploadError && (
              <div className="mt-3 p-2 bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg text-xs font-medium flex items-center gap-1.5">
                <AlertCircle size={14} className="shrink-0" />
                <span>{uploadError}</span>
              </div>
            )}
          </div>

          {/* Report Downloads Section */}
          <div className="glass-card rounded-2xl p-5 border border-slate-200/60 dark:border-slate-800/80 shadow-sm space-y-3">
            <h4 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <Download size={16} className="text-brand-500" />
              <span>Export Reports</span>
            </h4>
            
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleExportOrders}
                className="flex flex-col items-center justify-center p-3 border border-slate-200 dark:border-slate-800 hover:border-brand-500/30 rounded-xl bg-slate-50/20 dark:bg-slate-800/20 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-all cursor-pointer text-center"
              >
                <FileSpreadsheet size={20} className="text-brand-500 mb-1" />
                <span className="text-[10px] font-bold">Export CSV</span>
                <span className="text-[8px] text-slate-400">Order streams</span>
              </button>

              <button
                onClick={handleExportPDF}
                className="flex flex-col items-center justify-center p-3 border border-slate-200 dark:border-slate-800 hover:border-brand-500/30 rounded-xl bg-slate-50/20 dark:bg-slate-800/20 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-all cursor-pointer text-center"
              >
                <Download size={20} className="text-violet-500 mb-1" />
                <span className="text-[10px] font-bold">Print PDF</span>
                <span className="text-[8px] text-slate-400">Visual sheet</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
