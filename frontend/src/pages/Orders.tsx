import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { DataTable, ColumnHeader } from '../components/DataTable';
import { ShoppingCart, Plus, Trash2, Eye, X, Trash } from 'lucide-react';

interface SelectedProductLine {
  product_id: number;
  name: string;
  sku: string;
  price: number;
  quantity: number;
  availableStock: number;
}

export const Orders: React.FC = () => {
  const { checkPermission } = useAuth();
  const isManager = checkPermission(['Manager', 'Admin']);
  const isAdmin = checkPermission(['Admin']);

  const [orders, setOrders] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Table parameters
  const [page, setPage] = useState(1);
  const [storeFilter, setStoreFilter] = useState('');
  const [customerFilter, setCustomerFilter] = useState('');

  // Dropdown options
  const [customersList, setCustomersList] = useState<any[]>([]);
  const [storesList, setStoresList] = useState<any[]>([]);
  const [productsList, setProductsList] = useState<any[]>([]);

  // Modals state
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [orderCustomer, setOrderCustomer] = useState('');
  const [orderStore, setOrderStore] = useState('');
  const [selectedLines, setSelectedLines] = useState<SelectedProductLine[]>([]);
  
  // Product selector helper inside form
  const [currentLineProduct, setCurrentLineProduct] = useState('');
  const [currentLineQty, setCurrentLineQty] = useState('1');

  const [formError, setFormError] = useState<string | null>(null);

  const fetchDropdownOptions = async () => {
    try {
      const [cRes, pRes] = await Promise.all([
        axios.get('/customers?limit=100'),
        axios.get('/products?limit=100')
      ]);
      setCustomersList(cRes.data);
      setProductsList(pRes.data);
      
      // Fallback matching seeder
      setStoresList([
        { id: 1, name: 'East Metro Hub' },
        { id: 2, name: 'West Coast Flagship' },
        { id: 3, name: 'Midwest Distribution Store' },
        { id: 4, name: 'Southern Retail Center' }
      ]);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params: any = {
        page,
        limit: 10
      };
      if (storeFilter) params.store_id = storeFilter;
      if (customerFilter) params.customer_id = customerFilter;

      const [dataRes, countRes] = await Promise.all([
        axios.get('/orders', { params }),
        axios.get('/orders/count', { params })
      ]);

      setOrders(dataRes.data);
      setTotalCount(countRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDropdownOptions();
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [page, storeFilter, customerFilter]);

  const handleOpenDetailModal = (order: any) => {
    setSelectedOrder(order);
    setDetailModalOpen(true);
  };

  const handleOpenCreateModal = () => {
    setOrderCustomer(customersList[0]?.id.toString() || '');
    setOrderStore('1');
    setSelectedLines([]);
    setCurrentLineProduct(productsList[0]?.id.toString() || '');
    setCurrentLineQty('1');
    setFormError(null);
    setCreateModalOpen(true);
  };

  const handleAddProductLine = () => {
    const prodId = parseInt(currentLineProduct);
    const qty = parseInt(currentLineQty);
    if (isNaN(prodId) || isNaN(qty) || qty <= 0) return;

    // Check if product already added
    if (selectedLines.some((l) => l.product_id === prodId)) {
      setFormError('Product is already in the order. Adjust its quantity instead.');
      return;
    }

    const prod = productsList.find((p) => p.id === prodId);
    if (!prod) return;

    if (prod.current_stock < qty) {
      setFormError(`Insufficient stock for '${prod.name}'. Only ${prod.current_stock} available.`);
      return;
    }

    setSelectedLines((prev) => [
      ...prev,
      {
        product_id: prodId,
        name: prod.name,
        sku: prod.sku,
        price: prod.price,
        quantity: qty,
        availableStock: prod.current_stock
      }
    ]);
    setFormError(null);
  };

  const handleRemoveProductLine = (idx: number) => {
    setSelectedLines((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (selectedLines.length === 0) {
      setFormError('Please add at least one product line to create an order.');
      return;
    }

    const payload = {
      customer_id: parseInt(orderCustomer),
      store_id: parseInt(orderStore),
      order_date: new Date().toISOString(),
      items: selectedLines.map((l) => ({
        product_id: l.product_id,
        quantity: l.quantity,
        unit_price: l.price
      }))
    };

    try {
      await axios.post('/orders', payload);
      setCreateModalOpen(false);
      fetchOrders();
    } catch (err: any) {
      setFormError(err.response?.data?.detail || 'An error occurred during order submission.');
    }
  };

  const handleDeleteOrder = async (id: number) => {
    if (!window.confirm('Cancelling this transaction will refund product stock inventory. Proceed?')) return;
    try {
      await axios.delete(`/orders/${id}`);
      fetchOrders();
    } catch (err) {
      alert('Failed to delete transaction.');
    }
  };

  const columns: ColumnHeader[] = [
    { key: 'id', label: 'Order ID' },
    { key: 'customer_name', label: 'Client' },
    { key: 'store_name', label: 'Store Hub' },
    { key: 'order_date', label: 'Transaction Date' },
    { key: 'total_amount', label: 'Total Value', align: 'right' }
  ];

  const renderCell = (row: any, key: string) => {
    if (key === 'customer_name') {
      return row.customer?.name;
    }
    if (key === 'store_name') {
      return (
        <span className="text-xs text-slate-500 font-semibold">
          {row.store?.name}
        </span>
      );
    }
    if (key === 'order_date') {
      return new Date(row.order_date).toLocaleString();
    }
    if (key === 'total_amount') {
      return `$${row.total_amount.toFixed(2)}`;
    }
    return row[key];
  };

  const renderActions = (row: any) => {
    return (
      <div className="flex gap-2 justify-end">
        <button
          onClick={() => handleOpenDetailModal(row)}
          className="p-1 text-slate-400 hover:text-brand-500 dark:hover:text-brand-400 transition-colors cursor-pointer"
        >
          <Eye size={16} />
        </button>
        {isAdmin && (
          <button
            onClick={() => handleDeleteOrder(row.id)}
            className="p-1 text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>
    );
  };

  const orderTotal = selectedLines.reduce((acc, l) => acc + l.price * l.quantity, 0);

  return (
    <div className="space-y-6">
      {/* Header Panel */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <ShoppingCart className="text-brand-500" />
            <span>Retail Orders</span>
          </h2>
          <p className="text-slate-400 text-sm">Review transaction summaries, audit bills, and record B2B invoices.</p>
        </div>

        {isManager && (
          <button
            onClick={handleOpenCreateModal}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-brand-600/10 cursor-pointer"
          >
            <Plus size={16} />
            <span>Record New Order</span>
          </button>
        )}
      </div>

      {/* Main Table */}
      <DataTable
        columns={columns}
        data={orders}
        loading={loading}
        page={page}
        limit={10}
        totalCount={totalCount}
        onPageChange={setPage}
        searchValue={customerFilter}
        onSearchChange={(val) => { setCustomerFilter(val); setPage(1); }}
        searchPlaceholder="Filter by Client name..."
        renderCell={renderCell}
        renderActions={renderActions}
        filterComponent={
          <select
            value={storeFilter}
            onChange={(e) => { setStoreFilter(e.target.value); setPage(1); }}
            className="px-3 py-1.5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-dark-900 text-slate-700 dark:text-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-brand-500"
          >
            <option value="">All Store Hubs</option>
            {storesList.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        }
      />

      {/* View Order Detail Modal */}
      {detailModalOpen && selectedOrder && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-dark-900 border border-slate-200 dark:border-slate-800 w-full max-w-2xl rounded-2xl shadow-xl overflow-hidden animate-slide-up">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-slate-800 dark:text-white">Transaction Audit: #{selectedOrder.id}</h3>
                <span className="text-[10px] text-slate-400">{new Date(selectedOrder.order_date).toLocaleString()}</span>
              </div>
              <button onClick={() => setDetailModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Customer and Store Details */}
              <div className="grid grid-cols-2 gap-6 bg-slate-50 dark:bg-slate-800/20 p-4 rounded-xl border border-slate-100 dark:border-slate-800/40 text-xs">
                <div>
                  <h4 className="font-bold text-slate-400 uppercase tracking-widest mb-1.5">Client Profile</h4>
                  <p className="font-bold text-slate-700 dark:text-slate-200">{selectedOrder.customer?.name}</p>
                  <p className="text-slate-400">{selectedOrder.customer?.email}</p>
                  <p className="text-slate-400">{selectedOrder.customer?.city}, {selectedOrder.customer?.region} Region</p>
                </div>
                <div>
                  <h4 className="font-bold text-slate-400 uppercase tracking-widest mb-1.5">Store Hub</h4>
                  <p className="font-bold text-slate-700 dark:text-slate-200">{selectedOrder.store?.name}</p>
                  <p className="text-slate-400">{selectedOrder.store?.city}</p>
                  <p className="text-slate-400">{selectedOrder.store?.region} Region</p>
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Purchased Product Lines</h4>
                <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden text-xs">
                  <div className="grid grid-cols-12 bg-slate-50 dark:bg-slate-800/40 px-4 py-2 border-b border-slate-200 dark:border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                    <div className="col-span-3">SKU</div>
                    <div className="col-span-5">Product</div>
                    <div className="col-span-2 text-center">Qty</div>
                    <div className="col-span-2 text-right">Price</div>
                  </div>
                  <div className="divide-y divide-slate-100 dark:divide-slate-800/80 max-h-48 overflow-y-auto">
                    {selectedOrder.order_items?.map((item: any) => (
                      <div key={item.id} className="grid grid-cols-12 px-4 py-2.5 font-medium text-slate-700 dark:text-slate-200">
                        <div className="col-span-3 font-mono">{item.product?.sku}</div>
                        <div className="col-span-5">{item.product?.name}</div>
                        <div className="col-span-2 text-center">{item.quantity}</div>
                        <div className="col-span-2 text-right">${item.unit_price.toFixed(2)}</div>
                      </div>
                    ))}
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-800/40 px-4 py-3 flex justify-between items-center border-t border-slate-200 dark:border-slate-800 text-sm font-bold text-slate-800 dark:text-white">
                    <span>Order Total:</span>
                    <span>${selectedOrder.total_amount.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Order Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-dark-900 border border-slate-200 dark:border-slate-800 w-full max-w-xl rounded-2xl shadow-xl overflow-hidden animate-slide-up">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <h3 className="font-bold text-slate-800 dark:text-white">Record Invoice Order</h3>
              <button onClick={() => setCreateModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateOrder} className="p-6 space-y-4">
              {formError && (
                <div className="p-2.5 bg-red-950/20 text-red-500 rounded-lg text-xs font-semibold border border-red-900/30">
                  {formError}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Select Client</label>
                  <select
                    value={orderCustomer}
                    onChange={(e) => setOrderCustomer(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-dark-900 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-brand-500/50 cursor-pointer"
                  >
                    {customersList.map((c) => (
                      <option key={c.id} value={c.id}>{c.name} ({c.segment})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Store Hub</label>
                  <select
                    value={orderStore}
                    onChange={(e) => setOrderStore(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-dark-900 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-brand-500/50 cursor-pointer"
                  >
                    {storesList.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>

                {/* Add product line picker */}
                <div className="col-span-2 border-t border-slate-100 dark:border-slate-800 pt-3">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Build product list</h4>
                  <div className="flex gap-2 items-end">
                    <div className="flex-1">
                      <select
                        value={currentLineProduct}
                        onChange={(e) => setCurrentLineProduct(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-dark-900 rounded-xl text-xs focus:outline-none"
                      >
                        {productsList.map((p) => (
                          <option key={p.id} value={p.id}>{p.name} - ${p.price.toFixed(2)} (Stock: {p.current_stock})</option>
                        ))}
                      </select>
                    </div>
                    <div className="w-20">
                      <input
                        type="number"
                        min="1"
                        value={currentLineQty}
                        onChange={(e) => setCurrentLineQty(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-dark-900 rounded-xl text-xs text-center focus:outline-none"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleAddProductLine}
                      className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl transition-all cursor-pointer"
                    >
                      Add Line
                    </button>
                  </div>
                </div>

                {/* Selected lines list */}
                <div className="col-span-2 space-y-2">
                  <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden text-[10px]">
                    <div className="grid grid-cols-12 bg-slate-50 dark:bg-slate-800/40 px-3 py-1.5 border-b border-slate-200 dark:border-slate-800 text-slate-400 font-bold uppercase">
                      <div className="col-span-2">SKU</div>
                      <div className="col-span-6">Product</div>
                      <div className="col-span-2 text-center">Qty</div>
                      <div className="col-span-2 text-right">Action</div>
                    </div>
                    <div className="divide-y divide-slate-100 dark:divide-slate-800/80 max-h-36 overflow-y-auto">
                      {selectedLines.map((line, idx) => (
                        <div key={idx} className="grid grid-cols-12 px-3 py-2 font-medium text-slate-700 dark:text-slate-200 items-center">
                          <div className="col-span-2 font-mono">{line.sku}</div>
                          <div className="col-span-6 truncate">{line.name}</div>
                          <div className="col-span-2 text-center">{line.quantity}</div>
                          <div className="col-span-2 text-right">
                            <button
                              type="button"
                              onClick={() => handleRemoveProductLine(idx)}
                              className="text-rose-500 hover:text-rose-600 p-1 cursor-pointer"
                            >
                              <Trash size={12} />
                            </button>
                          </div>
                        </div>
                      ))}
                      {selectedLines.length === 0 && (
                        <div className="text-center text-slate-400 py-6">No products added yet.</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-100 dark:border-slate-800/80 pt-4 flex justify-between items-center">
                <div className="text-sm font-bold text-slate-700 dark:text-slate-200">
                  Total Bill: <span className="text-brand-500">${orderTotal.toFixed(2)}</span>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setCreateModalOpen(false)}
                    className="px-4 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-dark-900 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-xl hover:bg-slate-50 transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold rounded-xl transition-all cursor-pointer"
                  >
                    Submit Invoice
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
