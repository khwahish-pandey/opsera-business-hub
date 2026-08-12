import React, { useEffect, useState } from 'react';
import { api } from '../utils/api';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { useToast } from '../context/ToastContext';
import {
  BarChart3,
  TrendingUp,
  FileText,
  Package,
  AlertTriangle,
  Building2,
  Calendar,
  Layers,
} from 'lucide-react';

export const Reports: React.FC = () => {
  const [reportsData, setReportsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const { showToast } = useToast();

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const res = await api.get('/reports', { params });
      if (res.data.success) {
        setReportsData(res.data.data);
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to fetch analytics reports', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchReports();
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-500">Generating analytics report...</div>;
  }

  if (!reportsData) return <div>Failed to load report data.</div>;

  const { salesSummary, inventorySummary, topCustomers, lowStockList } = reportsData;

  return (
    <div className="space-y-6">
      {/* Filter Bar */}
      <form
        onSubmit={handleFilterSubmit}
        className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-end gap-4"
      >
        <div className="flex-1 w-full sm:w-auto">
          <Input
            label="Start Date"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
        <div className="flex-1 w-full sm:w-auto">
          <Input
            label="End Date"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
        <Button type="submit" variant="primary" icon={<Calendar className="w-4 h-4" />}>
          Filter Reports
        </Button>
      </form>

      {/* Sales Summary Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Confirmed Sales Revenue
          </span>
          <h3 className="text-3xl font-black text-slate-900">
            ₹{salesSummary.totalRevenue.toLocaleString('en-IN')}
          </h3>
          <p className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            {salesSummary.confirmedCount} Confirmed Orders ({salesSummary.totalItemsSold} items sold)
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Sales Challans Breakdown
          </span>
          <h3 className="text-3xl font-black text-slate-900">{salesSummary.totalChallans} Total</h3>
          <div className="flex items-center gap-3 text-xs font-semibold pt-1">
            <span className="text-sky-600">{salesSummary.draftCount} Drafts</span>
            <span className="text-emerald-600">{salesSummary.confirmedCount} Confirmed</span>
            <span className="text-rose-600">{salesSummary.cancelledCount} Cancelled</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Total Inventory Stock Valuation
          </span>
          <h3 className="text-3xl font-black text-slate-900">
            ₹{inventorySummary.totalInventoryValue.toLocaleString('en-IN')}
          </h3>
          <p className="text-xs text-slate-500 font-medium">
            Across {inventorySummary.totalProductsCount} Catalog Products
          </p>
        </div>
      </div>

      {/* Top Customers & Low Stock Alert Tables Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Accounts */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-sky-600" /> Top Customer Accounts
          </h3>

          <div className="divide-y divide-slate-100">
            {topCustomers.map((cust: any) => (
              <div key={cust.id} className="py-3 flex items-center justify-between">
                <div>
                  <span className="font-bold text-sm text-slate-900 block">{cust.businessName}</span>
                  <span className="text-xs text-slate-500">{cust.customerName} — {cust.mobile}</span>
                </div>
                <span className="font-extrabold text-sm text-sky-600">
                  {cust._count?.challans || 0} Orders
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Low Stock Audit Report */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" /> Low Stock Audit Summary
            </h3>
            <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
              {lowStockList.length} Action Items
            </span>
          </div>

          <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
            {lowStockList.map((p: any) => (
              <div key={p.sku} className="py-3 flex items-center justify-between">
                <div>
                  <span className="font-bold text-sm text-slate-900 block">{p.name}</span>
                  <span className="text-xs font-mono text-slate-500">SKU: {p.sku} ({p.category})</span>
                </div>
                <div className="text-right">
                  <span className="font-extrabold text-sm text-rose-600 block">
                    {p.currentStock} units
                  </span>
                  <span className="text-[11px] text-slate-400">Min Alert: {p.minimumStock}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
