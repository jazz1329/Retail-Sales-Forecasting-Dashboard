import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { DataTable, ColumnHeader } from '../components/DataTable';
import { Users, Plus, Edit2, Trash2, X } from 'lucide-react';

export const Customers: React.FC = () => {
  const { checkPermission } = useAuth();
  const isManager = checkPermission(['Manager', 'Admin']);
  const isAdmin = checkPermission(['Admin']);

  const [customers, setCustomers] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Table parameters
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState('id');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  // Modal actions
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<any>(null);

  // Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [city, setCity] = useState('');
  const [region, setRegion] = useState('East');
  const [segment, setSegment] = useState('Consumer');
  const [formError, setFormError] = useState<string | null>(null);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const params: any = {
        page,
        limit: 10,
        sort_by: sortKey,
        sort_dir: sortDir
      };
      if (search) params.search = search;

      const [dataRes, countRes] = await Promise.all([
        axios.get('/customers', { params }),
        axios.get('/customers/count', { params: { search } })
      ]);

      setCustomers(dataRes.data);
      setTotalCount(countRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [page, search, sortKey, sortDir]);

  const handleSortChange = (key: string, direction: 'asc' | 'desc') => {
    setSortKey(key);
    setSortDir(direction);
    setPage(1);
  };

  const handleOpenCreateModal = () => {
    setEditingCustomer(null);
    setName('');
    setEmail('');
    setCity('');
    setRegion('East');
    setSegment('Consumer');
    setFormError(null);
    setModalOpen(true);
  };

  const handleOpenEditModal = (cust: any) => {
    setEditingCustomer(cust);
    setName(cust.name);
    setEmail(cust.email);
    setCity(cust.city);
    setRegion(cust.region);
    setSegment(cust.segment);
    setFormError(null);
    setModalOpen(true);
  };

  const handleSaveCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const payload = {
      name,
      email,
      city,
      region,
      segment
    };

    try {
      if (editingCustomer) {
        await axios.put(`/customers/${editingCustomer.id}`, payload);
      } else {
        await axios.post('/customers', payload);
      }
      setModalOpen(false);
      fetchCustomers();
    } catch (err: any) {
      setFormError(err.response?.data?.detail || 'An error occurred during submission.');
    }
  };

  const handleDeleteCustomer = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this customer record?')) return;
    try {
      await axios.delete(`/customers/${id}`);
      fetchCustomers();
    } catch (err) {
      alert('Failed to delete customer.');
    }
  };

  const columns: ColumnHeader[] = [
    { key: 'name', label: 'Client Name', sortable: true },
    { key: 'email', label: 'Email Address', sortable: true },
    { key: 'segment', label: 'Segment Type', sortable: true },
    { key: 'city', label: 'City Location', sortable: true },
    { key: 'region', label: 'Region Hub', sortable: true }
  ];

  const renderCell = (row: any, key: string) => {
    if (key === 'segment') {
      const isConsumer = row.segment === 'Consumer';
      const isCorp = row.segment === 'Corporate';
      return (
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
          isConsumer 
            ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' 
            : isCorp 
              ? 'bg-purple-500/10 text-purple-500 border-purple-500/20' 
              : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
        }`}>
          {row.segment}
        </span>
      );
    }
    return row[key];
  };

  const renderActions = (row: any) => {
    return (
      <div className="flex gap-2 justify-end">
        {isManager && (
          <button
            onClick={() => handleOpenEditModal(row)}
            className="p-1 text-slate-400 hover:text-brand-500 dark:hover:text-brand-400 transition-colors cursor-pointer"
          >
            <Edit2 size={16} />
          </button>
        )}
        {isAdmin && (
          <button
            onClick={() => handleDeleteCustomer(row.id)}
            className="p-1 text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header Panel */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <Users className="text-brand-500" />
            <span>Customer Directory</span>
          </h2>
          <p className="text-slate-400 text-sm">Review registered client segments and geological regions.</p>
        </div>

        {isManager && (
          <button
            onClick={handleOpenCreateModal}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-brand-600/10 cursor-pointer"
          >
            <Plus size={16} />
            <span>New Customer</span>
          </button>
        )}
      </div>

      {/* Main Table */}
      <DataTable
        columns={columns}
        data={customers}
        loading={loading}
        page={page}
        limit={10}
        totalCount={totalCount}
        onPageChange={setPage}
        onSortChange={handleSortChange}
        sortKey={sortKey}
        sortDir={sortDir}
        searchValue={search}
        onSearchChange={(val) => { setSearch(val); setPage(1); }}
        renderCell={renderCell}
        renderActions={isManager ? renderActions : undefined}
      />

      {/* Customer Creation Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-dark-900 border border-slate-200 dark:border-slate-800 w-full max-w-lg rounded-2xl shadow-xl overflow-hidden animate-slide-up">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <h3 className="font-bold text-slate-800 dark:text-white">
                {editingCustomer ? 'Edit Client Profile' : 'Add New Customer'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveCustomer} className="p-6 space-y-4">
              {formError && (
                <div className="p-2.5 bg-red-950/20 text-red-500 rounded-lg text-xs font-semibold border border-red-900/30">
                  {formError}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Customer Full Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-dark-900 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/50"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-dark-900 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">City Location</label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-dark-900 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Region</label>
                  <select
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-dark-900 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/50"
                  >
                    <option value="East">East</option>
                    <option value="West">West</option>
                    <option value="Central">Central</option>
                    <option value="South">South</option>
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Client Segment</label>
                  <select
                    value={segment}
                    onChange={(e) => setSegment(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-dark-900 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/50"
                  >
                    <option value="Consumer">Consumer (B2C Individual)</option>
                    <option value="Corporate">Corporate (B2B business account)</option>
                    <option value="Home Office">Home Office (SOHO small business)</option>
                  </select>
                </div>
              </div>

              <div className="border-t border-slate-100 dark:border-slate-800/80 pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-dark-900 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-xl hover:bg-slate-50 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold rounded-xl transition-all cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
