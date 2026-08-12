import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { Product, Pagination as PaginationType } from '../types';
import { Table, Column } from '../components/common/Table';
import { Pagination } from '../components/common/Pagination';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Select } from '../components/common/Select';
import { Modal } from '../components/common/Modal';
import { ConfirmModal } from '../components/common/ConfirmModal';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { Search, Plus, Edit, Trash2, AlertTriangle, MapPin, Tag } from 'lucide-react';

export const Products: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [pagination, setPagination] = useState<PaginationType>({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    category: 'Electronics',
    unitPrice: 0,
    currentStock: 0,
    minimumStock: 10,
    warehouseLocation: 'Rack A-01',
  });
  const [submitting, setSubmitting] = useState(false);

  const { showToast } = useToast();
  const { hasRole } = useAuth();

  useEffect(() => {
    fetchProducts();
  }, [currentPage, categoryFilter, lowStockOnly]);

  const fetchProducts = async (searchQuery = search) => {
    setLoading(true);
    try {
      const params: any = { page: currentPage, limit: 10 };
      if (searchQuery) params.search = searchQuery;
      if (categoryFilter) params.category = categoryFilter;
      if (lowStockOnly) params.lowStock = true;

      const res = await api.get('/products', { params });
      if (res.data.success) {
        setProducts(res.data.data);
        if (res.data.pagination) setPagination(res.data.pagination);
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to load products', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchProducts(search);
  };

  const handleOpenAdd = () => {
    setFormData({
      name: '',
      sku: '',
      category: 'Electronics',
      unitPrice: 100,
      currentStock: 50,
      minimumStock: 10,
      warehouseLocation: 'Rack A-01',
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (p: Product) => {
    setSelectedProduct(p);
    setFormData({
      name: p.name,
      sku: p.sku,
      category: p.category,
      unitPrice: p.unitPrice,
      currentStock: p.currentStock,
      minimumStock: p.minimumStock,
      warehouseLocation: p.warehouseLocation,
    });
    setIsEditModalOpen(true);
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.post('/products', formData);
      if (res.data.success) {
        showToast('Product added successfully!');
        setIsAddModalOpen(false);
        fetchProducts();
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to add product', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;
    setSubmitting(true);
    try {
      const res = await api.put(`/products/${selectedProduct.id}`, formData);
      if (res.data.success) {
        showToast('Product updated successfully!');
        setIsEditModalOpen(false);
        fetchProducts();
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to update product', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteProduct = async () => {
    if (!selectedProduct) return;
    setSubmitting(true);
    try {
      const res = await api.delete(`/products/${selectedProduct.id}`);
      if (res.data.success) {
        showToast('Product deleted successfully!');
        setIsDeleteModalOpen(false);
        fetchProducts();
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to delete product', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const columns: Column<Product>[] = [
    {
      header: 'Product Name & SKU',
      cell: (p) => (
        <div>
          <span className="font-bold text-slate-900 block">{p.name}</span>
          <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5 font-mono">
            <span className="bg-slate-100 px-1.5 py-0.5 rounded">SKU: {p.sku}</span>
          </div>
        </div>
      ),
    },
    {
      header: 'Category',
      cell: (p) => (
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg">
          <Tag className="w-3 h-3 text-slate-400" />
          {p.category}
        </span>
      ),
    },
    {
      header: 'Unit Price',
      cell: (p) => (
        <span className="font-extrabold text-sm text-slate-900">
          ₹{p.unitPrice.toLocaleString('en-IN')}
        </span>
      ),
    },
    {
      header: 'Current Stock',
      cell: (p) => (
        <div>
          <span
            className={`font-black text-sm ${
              p.currentStock <= p.minimumStock ? 'text-amber-600' : 'text-slate-900'
            }`}
          >
            {p.currentStock} units
          </span>
          <span className="block text-[11px] text-slate-400">Min Alert: {p.minimumStock}</span>
        </div>
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
      header: 'Location',
      cell: (p) => (
        <span className="text-xs font-medium text-slate-600 flex items-center gap-1">
          <MapPin className="w-3.5 h-3.5 text-slate-400" />
          {p.warehouseLocation}
        </span>
      ),
    },
    {
      header: 'Actions',
      className: 'text-right',
      cell: (p) => (
        <div className="flex items-center justify-end gap-2">
          {hasRole('ADMIN', 'WAREHOUSE') && (
            <button
              onClick={() => handleOpenEdit(p)}
              className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-amber-600 transition-colors"
              title="Edit Product"
            >
              <Edit className="w-4 h-4" />
            </button>
          )}
          {hasRole('ADMIN') && (
            <button
              onClick={() => {
                setSelectedProduct(p);
                setIsDeleteModalOpen(true);
              }}
              className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-rose-600 transition-colors"
              title="Delete Product"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Search & Actions Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 w-full sm:w-auto flex-1 max-w-md">
          <Input
            placeholder="Search by product name, SKU, location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            icon={<Search className="w-4 h-4" />}
          />
          <Button type="submit" variant="secondary" size="md">
            Search
          </Button>
        </form>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end flex-wrap">
          <Select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setCurrentPage(1);
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

          <button
            type="button"
            onClick={() => {
              setLowStockOnly(!lowStockOnly);
              setCurrentPage(1);
            }}
            className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-all ${
              lowStockOnly
                ? 'bg-amber-500 text-white border-amber-600 shadow-sm'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <AlertTriangle className="w-4 h-4" />
            Low Stock Only
          </button>

          {hasRole('ADMIN', 'WAREHOUSE') && (
            <Button variant="primary" icon={<Plus className="w-4 h-4" />} onClick={handleOpenAdd}>
              Add Product
            </Button>
          )}
        </div>
      </div>

      {/* Table */}
      <Table
        columns={columns}
        data={products}
        isLoading={loading}
        emptyText="No products found matching filters"
        keyExtractor={(p) => p.id}
      />

      {/* Pagination */}
      <Pagination pagination={pagination} onPageChange={(page) => setCurrentPage(page)} />

      {/* Add / Edit Product Modal */}
      <Modal
        isOpen={isAddModalOpen || isEditModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setIsEditModalOpen(false);
        }}
        title={isAddModalOpen ? 'Add New Product to Catalog' : 'Edit Product Details'}
        subtitle="Manage product details, pricing, and stock alert levels"
      >
        <form onSubmit={isAddModalOpen ? handleCreateProduct : handleUpdateProduct} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Product Name *"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
            <Input
              label="SKU Code (Unique) *"
              placeholder="e.g. ELE-TV-43UHD"
              value={formData.sku}
              onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Category *"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              options={[
                { value: 'Electronics', label: 'Electronics' },
                { value: 'Grocery', label: 'Grocery' },
                { value: 'Hardware', label: 'Hardware' },
                { value: 'Textiles', label: 'Textiles' },
                { value: 'Appliances', label: 'Appliances' },
              ]}
            />
            <Input
              label="Unit Price (₹) *"
              type="number"
              min="0"
              step="0.01"
              value={formData.unitPrice}
              onChange={(e) => setFormData({ ...formData, unitPrice: parseFloat(e.target.value) || 0 })}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Current Stock *"
              type="number"
              min="0"
              value={formData.currentStock}
              onChange={(e) => setFormData({ ...formData, currentStock: parseInt(e.target.value, 10) || 0 })}
              required
            />
            <Input
              label="Min Stock Alert *"
              type="number"
              min="0"
              value={formData.minimumStock}
              onChange={(e) => setFormData({ ...formData, minimumStock: parseInt(e.target.value, 10) || 0 })}
              required
            />
            <Input
              label="Warehouse Location *"
              placeholder="e.g. Rack A-12"
              value={formData.warehouseLocation}
              onChange={(e) => setFormData({ ...formData, warehouseLocation: e.target.value })}
              required
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsAddModalOpen(false);
                setIsEditModalOpen(false);
              }}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={submitting}>
              {isAddModalOpen ? 'Save Product' : 'Update Details'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Product Confirmation Modal */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteProduct}
        title="Delete Product"
        message={`Are you sure you want to delete product '${selectedProduct?.name}' (SKU: ${selectedProduct?.sku})? Historical challan snapshots will remain safe.`}
        confirmText="Delete Product"
        variant="danger"
        isLoading={submitting}
      />
    </div>
  );
};
