import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { Product, StockMovement, MovementType, Pagination as PaginationType } from '../types';
import { Table, Column } from '../components/common/Table';
import { Pagination } from '../components/common/Pagination';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Select } from '../components/common/Select';
import { Modal } from '../components/common/Modal';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import {
  Warehouse,
  ArrowUpRight,
  ArrowDownRight,
  History,
  Search,
  PlusCircle,
  MinusCircle,
  MapPin,
} from 'lucide-react';

export const Inventory: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'stock' | 'movements'>('stock');

  // Stock State
  const [products, setProducts] = useState<Product[]>([]);
  const [stockPagination, setStockPagination] = useState<PaginationType>({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [stockLoading, setStockLoading] = useState(true);
  const [stockSearch, setStockSearch] = useState('');
  const [stockCategory, setStockCategory] = useState('');
  const [stockPage, setStockPage] = useState(1);

  // Movements State
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [movementPagination, setMovementPagination] = useState<PaginationType>({ page: 1, limit: 15, total: 0, totalPages: 1 });
  const [movementLoading, setMovementLoading] = useState(false);
  const [movementSearch, setMovementSearch] = useState('');
  const [movementTypeFilter, setMovementTypeFilter] = useState('');
  const [movementPage, setMovementPage] = useState(1);

  // Stock Adjustment Modal
  const [isAdjustmentModalOpen, setIsAdjustmentModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [adjustmentType, setAdjustmentType] = useState<'IN' | 'OUT'>('IN');
  const [quantity, setQuantity] = useState(1);
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { showToast } = useToast();
  const { hasRole } = useAuth();

  useEffect(() => {
    if (activeTab === 'stock') {
      fetchStock();
    } else {
      fetchMovements();
    }
  }, [activeTab, stockPage, stockCategory, movementPage, movementTypeFilter]);

  const fetchStock = async (query = stockSearch) => {
    setStockLoading(true);
    try {
      const params: any = { page: stockPage, limit: 10 };
      if (query) params.search = query;
      if (stockCategory) params.category = stockCategory;

      const res = await api.get('/inventory', { params });
      if (res.data.success) {
        setProducts(res.data.data);
        if (res.data.pagination) setStockPagination(res.data.pagination);
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to fetch inventory stock', 'error');
    } finally {
      setStockLoading(false);
    }
  };

  const fetchMovements = async (query = movementSearch) => {
    setMovementLoading(true);
    try {
      const params: any = { page: movementPage, limit: 15 };
      if (query) params.search = query;
      if (movementTypeFilter) params.movementType = movementTypeFilter;

      const res = await api.get('/inventory/movements', { params });
      if (res.data.success) {
        setMovements(res.data.data);
        if (res.data.pagination) setMovementPagination(res.data.pagination);
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to fetch stock movements', 'error');
    } finally {
      setMovementLoading(false);
    }
  };

  const handleOpenAdjustment = (product: Product, type: 'IN' | 'OUT') => {
    setSelectedProduct(product);
    setAdjustmentType(type);
    setQuantity(1);
    setReason(type === 'IN' ? 'Stock replenishment from vendor' : 'Internal warehouse adjustment');
    setIsAdjustmentModalOpen(true);
  };

  const handleStockAdjustment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;
    if (quantity <= 0 || !reason) {
      showToast('Please enter valid quantity and reason', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const endpoint = `/inventory/${selectedProduct.id}/${adjustmentType.toLowerCase()}`;
      const res = await api.post(endpoint, { quantity, reason });
      if (res.data.success) {
        showToast(`Stock updated! ${adjustmentType === 'IN' ? '+' : '-'}${quantity} units recorded.`);
        setIsAdjustmentModalOpen(false);
        fetchStock();
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to adjust stock', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const stockColumns: Column<Product>[] = [
    {
      header: 'Product',
      cell: (p) => (
        <div>
          <span className="font-bold text-slate-900 block">{p.name}</span>
          <span className="text-xs font-mono text-slate-500">SKU: {p.sku}</span>
        </div>
      ),
    },
    {
      header: 'SKU',
      cell: (p) => <span className="font-mono text-xs font-semibold text-slate-700">{p.sku}</span>,
    },
    {
      header: 'Current Stock',
      cell: (p) => (
        <span
          className={`font-black text-sm ${
            p.currentStock <= p.minimumStock ? 'text-amber-600' : 'text-slate-900'
          }`}
        >
          {p.currentStock} units
        </span>
      ),
    },
    {
      header: 'Minimum Alert',
      cell: (p) => <span className="text-xs text-slate-600 font-medium">{p.minimumStock} units</span>,
    },
    {
      header: 'Location',
      cell: (p) => (
        <span className="text-xs text-slate-600 font-medium flex items-center gap-1">
          <MapPin className="w-3.5 h-3.5 text-slate-400" />
          {p.warehouseLocation}
        </span>
      ),
    },
    {
      header: 'Stock Status',
      cell: (p) => (
        <Badge
          variant={p.currentStock <= p.minimumStock ? 'LOW STOCK' : 'IN STOCK'}
          size="sm"
        />
      ),
    },
    {
      header: 'Adjust Stock',
      className: 'text-right',
      cell: (p) => (
        <div className="flex items-center justify-end gap-2">
          {hasRole('ADMIN', 'WAREHOUSE') && (
            <>
              <button
                onClick={() => handleOpenAdjustment(p, 'IN')}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 text-xs font-semibold transition-colors"
                title="Add Stock (IN)"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                Stock IN
              </button>
              <button
                onClick={() => handleOpenAdjustment(p, 'OUT')}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 text-xs font-semibold transition-colors"
                title="Remove Stock (OUT)"
              >
                <MinusCircle className="w-3.5 h-3.5" />
                Stock OUT
              </button>
            </>
          )}
        </div>
      ),
    },
  ];

  const movementColumns: Column<StockMovement>[] = [
    {
      header: 'Product & SKU',
      cell: (m) => (
        <div>
          <span className="font-bold text-slate-900 block">{m.product?.name}</span>
          <span className="text-xs font-mono text-slate-500">SKU: {m.product?.sku}</span>
        </div>
      ),
    },
    {
      header: 'Movement Type',
      cell: (m) => <Badge variant={m.movementType} size="sm" />,
    },
    {
      header: 'Quantity',
      cell: (m) => (
        <span
          className={`font-black text-sm ${
            m.movementType === 'IN' ? 'text-emerald-600' : 'text-rose-600'
          }`}
        >
          {m.movementType === 'IN' ? '+' : '-'}{m.quantity} units
        </span>
      ),
    },
    {
      header: 'Reason / Reference',
      cell: (m) => <span className="text-xs text-slate-700 font-medium">{m.reason}</span>,
    },
    {
      header: 'Created By',
      cell: (m) => (
        <span className="text-xs text-slate-600 font-medium">
          {m.createdBy?.name} {m.createdBy?.role && `(${m.createdBy.role})`}
        </span>
      ),
    },
    {
      header: 'Timestamp',
      cell: (m) => (
        <span className="text-xs text-slate-400 font-mono">
          {new Date(m.createdAt).toLocaleString()}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Navigation Tabs Header */}
      <div className="flex items-center justify-between border-b border-slate-200 bg-white px-6 pt-4 rounded-2xl shadow-sm border">
        <div className="flex items-center gap-6">
          <button
            onClick={() => setActiveTab('stock')}
            className={`pb-4 text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'stock'
                ? 'border-sky-600 text-sky-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Warehouse className="w-4 h-4" /> Stock Overview
          </button>
          <button
            onClick={() => setActiveTab('movements')}
            className={`pb-4 text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'movements'
                ? 'border-sky-600 text-sky-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <History className="w-4 h-4" /> Movement Audit Logs
          </button>
        </div>
      </div>

      {activeTab === 'stock' ? (
        <div className="space-y-6">
          {/* Stock Search Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setStockPage(1);
                fetchStock(stockSearch);
              }}
              className="flex items-center gap-2 w-full sm:w-auto flex-1 max-w-md"
            >
              <Input
                placeholder="Search product stock..."
                value={stockSearch}
                onChange={(e) => setStockSearch(e.target.value)}
                icon={<Search className="w-4 h-4" />}
              />
              <Button type="submit" variant="secondary" size="md">
                Search
              </Button>
            </form>

            <Select
              value={stockCategory}
              onChange={(e) => {
                setStockCategory(e.target.value);
                setStockPage(1);
              }}
              options={[
                { value: '', label: 'All Categories' },
                { value: 'Electronics', label: 'Electronics' },
                { value: 'Grocery', label: 'Grocery' },
                { value: 'Hardware', label: 'Hardware' },
                { value: 'Textiles', label: 'Textiles' },
                { value: 'Appliances', label: 'Appliances' },
              ]}
            />
          </div>

          <Table
            columns={stockColumns}
            data={products}
            isLoading={stockLoading}
            emptyText="No inventory products found"
            keyExtractor={(p) => p.id}
          />

          <Pagination pagination={stockPagination} onPageChange={(p) => setStockPage(p)} />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Movement Audit Logs Filters Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setMovementPage(1);
                fetchMovements(movementSearch);
              }}
              className="flex items-center gap-2 w-full sm:w-auto flex-1 max-w-md"
            >
              <Input
                placeholder="Search reason or product SKU..."
                value={movementSearch}
                onChange={(e) => setMovementSearch(e.target.value)}
                icon={<Search className="w-4 h-4" />}
              />
              <Button type="submit" variant="secondary" size="md">
                Filter
              </Button>
            </form>

            <Select
              value={movementTypeFilter}
              onChange={(e) => {
                setMovementTypeFilter(e.target.value);
                setMovementPage(1);
              }}
              options={[
                { value: '', label: 'All Movement Types' },
                { value: 'IN', label: 'Stock IN' },
                { value: 'OUT', label: 'Stock OUT' },
              ]}
            />
          </div>

          <Table
            columns={movementColumns}
            data={movements}
            isLoading={movementLoading}
            emptyText="No stock movement audit records found"
            keyExtractor={(m) => m.id}
          />

          <Pagination pagination={movementPagination} onPageChange={(p) => setMovementPage(p)} />
        </div>
      )}

      {/* Stock Adjustment Modal (IN / OUT) */}
      <Modal
        isOpen={isAdjustmentModalOpen}
        onClose={() => setIsAdjustmentModalOpen(false)}
        title={`Record Manual Stock ${adjustmentType}`}
        subtitle={`Adjusting stock level for ${selectedProduct?.name} (SKU: ${selectedProduct?.sku})`}
      >
        <form onSubmit={handleStockAdjustment} className="space-y-4">
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 flex justify-between items-center text-xs font-semibold text-slate-700">
            <span>Available Current Stock:</span>
            <span className="font-black text-sm text-slate-900">{selectedProduct?.currentStock} units</span>
          </div>

          <Input
            label={`Quantity to ${adjustmentType} *`}
            type="number"
            min="1"
            value={quantity}
            onChange={(e) => setQuantity(parseInt(e.target.value, 10) || 1)}
            required
          />

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Reason for Adjustment *
            </label>
            <textarea
              rows={3}
              required
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
              placeholder="e.g. Received vendor shipment, damaged stock disposal..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={() => setIsAdjustmentModalOpen(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant={adjustmentType === 'IN' ? 'success' : 'danger'}
              isLoading={submitting}
            >
              Record Stock {adjustmentType}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
