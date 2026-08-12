import React, { useEffect, useState } from 'react';
import { api } from '../utils/api';
import { DashboardStats } from '../types';
import { Badge } from '../components/common/Badge';
import { Link } from 'react-router-dom';
import {
  Users,
  Package,
  AlertTriangle,
  FileText,
  CheckCircle2,
  TrendingUp,
  ArrowUpRight,
  Clock,
  Warehouse,
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await api.get('/dashboard');
      if (res.data.success) {
        setStats(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-slate-200 animate-pulse rounded-2xl"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!stats) return <div>Failed to load dashboard statistics.</div>;

  const { overview, charts, recentActivity } = stats;

  const maxRevenue = Math.max(...charts.salesTrend.map((s) => s.total), 1);

  return (
    <div className="space-y-6">
      {/* Overview Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Sales Value Card */}
        <div className="bg-gradient-to-tr from-gray-500 to-black text-white rounded-2xl p-5 shadow-lg border border-sky-800/40 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-sky-300">
              Total Confirmed Sales
            </span>
            <div className="w-10 h-10 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-2xl font-black text-white mt-3">
            ₹{overview.totalSalesValue.toLocaleString('en-IN')}
          </h3>
          <p className="text-xs text-sky-200 mt-1 flex items-center gap-1 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            {overview.confirmedChallans} Confirmed Sales Challans
          </p>
        </div>

        {/* Total Customers Card */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Total Customers
            </span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-slate-900 mt-3">{overview.totalCustomers}</h3>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            <span className="text-emerald-600 font-semibold">{overview.activeCustomers} Active</span>{' '}
            Accounts
          </p>
        </div>

        {/* Total Products & Low Stock Card */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Products Catalog
            </span>
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-slate-900 mt-3">{overview.totalProducts}</h3>
          <div className="flex items-center gap-2 mt-1">
            {overview.lowStockProducts > 0 ? (
              <span className="text-xs text-amber-600 font-semibold flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                {overview.lowStockProducts} Low Stock Alert
              </span>
            ) : (
              <span className="text-xs text-emerald-600 font-medium">All stock healthy</span>
            )}
          </div>
        </div>

        {/* Draft Challans Card */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Pending Draft Challans
            </span>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-slate-900 mt-3">{overview.draftChallans}</h3>
          <p className="text-xs text-slate-500 mt-1 font-medium">Awaiting stock confirmation</p>
        </div>
      </div>

      {/* Analytics Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Trend Bar Chart (SVG) */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-slate-900">Monthly Sales Revenue</h3>
              <p className="text-xs text-slate-500">Confirmed challans revenue breakdown</p>
            </div>
            <Link to="/reports" className="text-xs text-sky-600 font-semibold hover:underline flex items-center gap-1">
              View Detailed Report <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="h-56 flex items-end justify-between gap-4 pt-4 border-b border-slate-100">
            {charts.salesTrend.map((item, idx) => {
              const heightPct = Math.max((item.total / maxRevenue) * 100, 8);
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
                  <div className="text-[10px] text-slate-500 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                    ₹{item.total.toLocaleString()}
                  </div>
                  <div
                    style={{ height: `${heightPct}%` }}
                    className="w-full bg-gradient-to-t from-sky-600 to-sky-400 rounded-t-xl transition-all group-hover:from-sky-500 group-hover:to-sky-300"
                  ></div>
                  <span className="text-xs font-semibold text-slate-600 mt-1">{item.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Stock Status Distribution Card */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 mb-1">Inventory Health</h3>
            <p className="text-xs text-slate-500 mb-6">Real-time stock level status</p>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs font-medium mb-1.5">
                  <span className="text-slate-700 font-semibold">In Stock</span>
                  <span className="text-slate-500">{overview.inStockProducts} items</span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full"
                    style={{
                      width: `${
                        overview.totalProducts > 0
                          ? (overview.inStockProducts / overview.totalProducts) * 100
                          : 0
                      }%`,
                    }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-medium mb-1.5">
                  <span className="text-slate-700 font-semibold">Low Stock Alert</span>
                  <span className="text-amber-600 font-bold">{overview.lowStockProducts} items</span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-500 rounded-full"
                    style={{
                      width: `${
                        overview.totalProducts > 0
                          ? (overview.lowStockProducts / overview.totalProducts) * 100
                          : 0
                      }%`,
                    }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-medium mb-1.5">
                  <span className="text-slate-700 font-semibold">Out of Stock</span>
                  <span className="text-rose-600 font-bold">{overview.outOfStockProducts} items</span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-rose-500 rounded-full"
                    style={{
                      width: `${
                        overview.totalProducts > 0
                          ? (overview.outOfStockProducts / overview.totalProducts) * 100
                          : 0
                      }%`,
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          <Link
            to="/inventory"
            className="w-full py-2.5 mt-6 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 text-center hover:bg-slate-50 transition-colors flex items-center justify-center gap-1"
          >
            <Warehouse className="w-4 h-4 text-slate-400" /> Manage Inventory Stock
          </Link>
        </div>
      </div>

      {/* Recent Activity Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Challans */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-slate-900">Recent Sales Challans</h3>
            <Link to="/challans" className="text-xs text-sky-600 font-semibold hover:underline">
              View All
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {recentActivity.challans.map((ch) => (
              <div key={ch.id} className="py-3.5 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900">{ch.challanNumber}</span>
                    <Badge variant={ch.status} size="sm" />
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {ch.customer?.businessName || ch.customer?.customerName}
                  </p>
                </div>
                <div className="text-right">
                  <span className="font-extrabold text-sm text-slate-900">
                    ₹{ch.totalAmount.toLocaleString()}
                  </span>
                  <span className="block text-[11px] text-slate-400">
                    {new Date(ch.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Stock Movements */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-slate-900">Recent Stock Movements</h3>
            <Link to="/inventory" className="text-xs text-sky-600 font-semibold hover:underline">
              Audit Logs
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {recentActivity.stockMovements.map((sm) => (
              <div key={sm.id} className="py-3 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-900">{sm.product?.name}</p>
                  <p className="text-[11px] text-slate-500">{sm.reason}</p>
                </div>
                <div className="text-right flex items-center gap-3">
                  <span
                    className={`font-bold text-xs ${
                      sm.movementType === 'IN' ? 'text-emerald-600' : 'text-rose-600'
                    }`}
                  >
                    {sm.movementType === 'IN' ? '+' : '-'}{sm.quantity} units
                  </span>
                  <Badge variant={sm.movementType} size="sm" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
