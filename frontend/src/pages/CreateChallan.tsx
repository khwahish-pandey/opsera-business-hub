import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../utils/api';
import { Customer, Product } from '../types';
import { Button } from '../components/common/Button';
import { Select } from '../components/common/Select';
import { Input } from '../components/common/Input';
import { useToast } from '../context/ToastContext';
import {
  ArrowLeft,
  Plus,
  Trash2,
  AlertTriangle,
  FileText,
  Calculator,
  CheckCircle2,
} from 'lucide-react';

interface ChallanFormItem {
  productId: string;
  productName: string;
  sku: string;
  availableStock: number;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export const CreateChallan: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [items, setItems] = useState<ChallanFormItem[]>([]);

  // Item selector state
  const [selectedProductId, setSelectedProductId] = useState('');
  const [itemQuantity, setItemQuantity] = useState(1);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const { showToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchFormData();
  }, []);

  const fetchFormData = async () => {
    try {
      const [custRes, prodRes] = await Promise.all([
        api.get('/customers?limit=100&status=ACTIVE'),
        api.get('/products?limit=100'),
      ]);

      if (custRes.data.success) setCustomers(custRes.data.data);
      if (prodRes.data.success) setProducts(prodRes.data.data);
    } catch (err: any) {
      showToast(err.message || 'Failed to load customer and product lists', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = () => {
    if (!selectedProductId) {
      showToast('Please select a product', 'error');
      return;
    }

    const product = products.find((p) => p.id === selectedProductId);
    if (!product) return;

    if (itemQuantity <= 0) {
      showToast('Quantity must be greater than 0', 'error');
      return;
    }

    // Check if item already exists in table
    const existingIdx = items.findIndex((i) => i.productId === product.id);
    if (existingIdx >= 0) {
      const newItems = [...items];
      newItems[existingIdx].quantity += itemQuantity;
      newItems[existingIdx].totalPrice = newItems[existingIdx].quantity * newItems[existingIdx].unitPrice;
      setItems(newItems);
    } else {
      setItems([
        ...items,
        {
          productId: product.id,
          productName: product.name,
          sku: product.sku,
          availableStock: product.currentStock,
          quantity: itemQuantity,
          unitPrice: product.unitPrice,
          totalPrice: itemQuantity * product.unitPrice,
        },
      ]);
    }

    // Reset item selector
    setSelectedProductId('');
    setItemQuantity(1);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, idx) => idx !== index));
  };

  const handleUpdateItemQuantity = (index: number, newQty: number) => {
    if (newQty < 1) return;
    const newItems = [...items];
    newItems[index].quantity = newQty;
    newItems[index].totalPrice = newQty * newItems[index].unitPrice;
    setItems(newItems);
  };

  const calculateTotalQuantity = () => items.reduce((sum, i) => sum + i.quantity, 0);
  const calculateTotalAmount = () => items.reduce((sum, i) => sum + i.totalPrice, 0);

  const handleSubmitChallan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomerId) {
      showToast('Please select a customer', 'error');
      return;
    }
    if (items.length === 0) {
      showToast('Please add at least one product item', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        customerId: selectedCustomerId,
        items: items.map((i) => ({
          productId: i.productId,
          quantity: i.quantity,
          unitPrice: i.unitPrice,
        })),
      };

      const res = await api.post('/challans', payload);
      if (res.data.success) {
        showToast(`Draft Challan ${res.data.data.challanNumber} created successfully!`);
        navigate(`/challans/${res.data.data.id}`);
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to create challan', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-500">Loading order entry data...</div>;
  }

  const selectedProductObj = products.find((p) => p.id === selectedProductId);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <Link to="/challans" className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-900">
          <ArrowLeft className="w-4 h-4" /> Back to Challans
        </Link>
        <span className="text-xs font-mono text-slate-400">Sequential Numbering Generated on Backend</span>
      </div>

      <form onSubmit={handleSubmitChallan} className="space-y-6">
        {/* Customer Selection Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-sky-600" /> Select Customer Account
          </h3>

          <Select
            label="Customer *"
            value={selectedCustomerId}
            onChange={(e) => setSelectedCustomerId(e.target.value)}
            options={[
              { value: '', label: '-- Choose Active Wholesale Customer --' },
              ...customers.map((c) => ({
                value: c.id,
                label: `${c.businessName} (${c.customerName}) — Mobile: ${c.mobile}`,
              })),
            ]}
            required
          />
        </div>

        {/* Product Items Table & Selector */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Calculator className="w-5 h-5 text-purple-600" /> Add Products to Challan
          </h3>

          {/* Product Line Picker */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col md:flex-row items-end gap-3">
            <div className="flex-1">
              <Select
                label="Product *"
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                options={[
                  { value: '', label: '-- Choose Product --' },
                  ...products.map((p) => ({
                    value: p.id,
                    label: `${p.name} (SKU: ${p.sku}) — Available: ${p.currentStock} units — ₹${p.unitPrice}`,
                  })),
                ]}
              />
            </div>

            <div className="w-full md:w-36">
              <Input
                label="Quantity *"
                type="number"
                min="1"
                value={itemQuantity}
                onChange={(e) => setItemQuantity(parseInt(e.target.value, 10) || 1)}
              />
            </div>

            <Button
              type="button"
              variant="secondary"
              icon={<Plus className="w-4 h-4" />}
              onClick={handleAddItem}
              className="w-full md:w-auto"
            >
              Add Item
            </Button>
          </div>

          {/* Selected Product Stock Warning Banner */}
          {selectedProductObj && itemQuantity > selectedProductObj.currentStock && (
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-800 bg-amber-50 p-3 rounded-xl border border-amber-200">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                Warning: Requested quantity ({itemQuantity}) exceeds current available stock (
                {selectedProductObj.currentStock} units). Confirmation will fail unless restocked.
              </span>
            </div>
          )}

          {/* Added Items List Table */}
          {items.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-xs font-medium border border-dashed border-slate-200 rounded-xl">
              No product items added to challan yet. Use selector above to add items.
            </div>
          ) : (
            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-sm text-slate-700">
                <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3">Product</th>
                    <th className="px-4 py-3">SKU</th>
                    <th className="px-4 py-3">Avail Stock</th>
                    <th className="px-4 py-3">Quantity</th>
                    <th className="px-4 py-3">Unit Price</th>
                    <th className="px-4 py-3">Total</th>
                    <th className="px-4 py-3 text-right">Remove</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {items.map((item, index) => (
                    <tr key={index} className="hover:bg-slate-50/60">
                      <td className="px-4 py-3 font-semibold text-slate-900">{item.productName}</td>
                      <td className="px-4 py-3 text-xs font-mono text-slate-500">{item.sku}</td>
                      <td className="px-4 py-3 text-xs">
                        <span
                          className={`font-bold ${
                            item.quantity > item.availableStock ? 'text-rose-600' : 'text-slate-700'
                          }`}
                        >
                          {item.availableStock} units
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => handleUpdateItemQuantity(index, parseInt(e.target.value, 10) || 1)}
                          className="w-20 px-2 py-1 rounded-lg border border-slate-200 text-xs font-bold text-slate-900"
                        />
                      </td>
                      <td className="px-4 py-3 text-xs font-medium text-slate-700">
                        ₹{item.unitPrice.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 font-bold text-slate-900">
                        ₹{item.totalPrice.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(index)}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Challan Totals Summary */}
          {items.length > 0 && (
            <div className="bg-slate-900 text-white p-5 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                  Summary Totals
                </span>
                <span className="text-sm font-medium text-slate-300">
                  Total Items: {items.length} | Total Quantity: {calculateTotalQuantity()} units
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs font-semibold text-sky-400 uppercase tracking-wider block">
                  Grand Amount
                </span>
                <span className="text-2xl font-black text-white">
                  ₹{calculateTotalAmount().toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-end gap-3">
          <Link to="/challans">
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
          <Button type="submit" variant="primary" size="lg" isLoading={submitting}>
            Save Draft Challan
          </Button>
        </div>
      </form>
    </div>
  );
};
