import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { DataTable, ColumnHeader } from '../components/DataTable';
import { Package, Plus, Edit2, Trash2, X } from 'lucide-react';

export const Products: React.FC = () => {
  const { checkPermission } = useAuth();
  const isManager = checkPermission(['Manager', 'Admin']);
  const isAdmin = checkPermission(['Admin']);

  const [products, setProducts] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Table parameters
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [sortKey, setSortKey] = useState('id');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  // Categories list
  const [categories, setCategories] = useState<any[]>([]);

  // Modal actions
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  
  // Form fields
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [price, setPrice] = useState('');
  const [cost, setCost] = useState('');
  const [stock, setStock] = useState('');
  const [reorder, setReorder] = useState('');
  const [desc, setDesc] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const fetchCategories = async () => {
    try {
      // Seeder fallback categories list
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

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params: any = {
        page,
        limit: 10,
        sort_by: sortKey,
        sort_dir: sortDir
      };
      if (search) params.search = search;
      if (categoryFilter) params.category_id = categoryFilter;

      const [dataRes, countRes] = await Promise.all([
        axios.get('/products', { params }),
        axios.get('/products/count', { params: { search, category_id: categoryFilter } })
      ]);

      setProducts(dataRes.data);
      setTotalCount(countRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [page, search, categoryFilter, sortKey, sortDir]);

  const handleSortChange = (key: string, direction: 'asc' | 'desc') => {
    setSortKey(key);
    setSortDir(direction);
    setPage(1);
  };

  const handleOpenCreateModal = () => {
    setEditingProduct(null);
    setName('');
    setSku('');
    setCategoryId('1');
    setPrice('');
    setCost('');
    setStock('50');
    setReorder('10');
    setDesc('');
    setFormError(null);
    setModalOpen(true);
  };

  const handleOpenEditModal = (prod: any) => {
    setEditingProduct(prod);
    setName(prod.name);
    setSku(prod.sku);
    setCategoryId(prod.category_id.toString());
    setPrice(prod.price.toString());
    setCost(prod.cost.toString());
    setStock(prod.current_stock.toString());
    setReorder(prod.reorder_point.toString());
    setDesc(prod.description || '');
    setFormError(null);
    setModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const payload = {
      name,
      sku,
      category_id: parseInt(categoryId),
      price: parseFloat(price),
      cost: parseFloat(cost),
      current_stock: parseInt(stock),
      reorder_point: parseInt(reorder),
      description: desc || null
    };

    try {
      if (editingProduct) {
        await axios.put(`/products/${editingProduct.id}`, payload);
      } else {
        await axios.post('/products', payload);
      }
      setModalOpen(false);
      fetchProducts();
    } catch (err: any) {
      setFormError(err.response?.data?.detail || 'An error occurred during submission.');
    }
  };

  const handleDeleteProduct = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await axios.delete(`/products/${id}`);
      fetchProducts();
    } catch (err) {
      alert('Failed to delete product.');
    }
  };

  const columns: ColumnHeader[] = [
    { key: 'sku', label: 'SKU Code', sortable: true },
    { key: 'name', label: 'Product Name', sortable: true },
    { key: 'category_name', label: 'Category' },
    { key: 'price', label: 'Price', sortable: true, align: 'right' },
    { key: 'cost', label: 'Cost', sortable: true, align: 'right' },
    { key: 'current_stock', label: 'Stock Level', sortable: true, align: 'center' }
  ];

  const renderCell = (row: any, key: string) => {
    if (key === 'category_name') {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
          {row.category?.name}
        </span>
      );
    }
    if (key === 'price') {
      return `$${row.price.toFixed(2)}`;
    }
    if (key === 'cost') {
      return `$${row.cost.toFixed(2)}`;
    }
    if (key === 'current_stock') {
      const low = row.current_stock <= row.reorder_point;
      return (
        <span className={`px-2 py-0.5 rounded-lg text-xs font-bold ${
          low ? 'bg-red-500/15 text-red-500' : 'bg-emerald-500/15 text-emerald-500'
        }`}>
          {row.current_stock} pcs
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
            onClick={() => handleDeleteProduct(row.id)}
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
            <Package className="text-brand-500" />
            <span>Product Inventory List</span>
          </h2>
          <p className="text-slate-400 text-sm">Add, remove, and monitor pricing specifications.</p>
        </div>

        {isManager && (
          <button
            onClick={handleOpenCreateModal}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-brand-600/10 cursor-pointer"
          >
            <Plus size={16} />
            <span>New Product</span>
          </button>
        )}
      </div>

      {/* Main Table */}
      <DataTable
        columns={columns}
        data={products}
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
        filterComponent={
          <select
            value={categoryFilter}
            onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
            className="px-3 py-1.5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-dark-900 text-slate-700 dark:text-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-brand-500"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        }
      />

      {/* Product Creation/Editing Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-dark-900 border border-slate-200 dark:border-slate-800 w-full max-w-lg rounded-2xl shadow-xl overflow-hidden animate-slide-up">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <h3 className="font-bold text-slate-800 dark:text-white">
                {editingProduct ? 'Edit Product Profile' : 'Add New Product'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="p-6 space-y-4">
              {formError && (
                <div className="p-2.5 bg-red-950/20 text-red-500 rounded-lg text-xs font-semibold border border-red-900/30">
                  {formError}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Product Title</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-dark-900 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">SKU identifier</label>
                  <input
                    type="text"
                    required
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-dark-900 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Category</label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-dark-900 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/50"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Retail Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-dark-900 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Wholesale Cost ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={cost}
                    onChange={(e) => setCost(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-dark-900 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Initial Stock</label>
                  <input
                    type="number"
                    required
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-dark-900 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Reorder Point</label>
                  <input
                    type="number"
                    required
                    value={reorder}
                    onChange={(e) => setReorder(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-dark-900 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/50"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Product Description</label>
                  <textarea
                    value={desc}
                    onChange={(e) => setDesc(e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-dark-900 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/50"
                  />
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
