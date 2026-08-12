import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../utils/api';
import { Challan, ChallanStatus, Pagination as PaginationType } from '../types';
import { Table, Column } from '../components/common/Table';
import { Pagination } from '../components/common/Pagination';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Select } from '../components/common/Select';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { Search, Plus, Eye, FileText, Building2, Calendar } from 'lucide-react';

export const Challans: React.FC = () => {
  const [challans, setChallans] = useState<Challan[]>([]);
  const [pagination, setPagination] = useState<PaginationType>({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const { showToast } = useToast();
  const { hasRole } = useAuth();

  useEffect(() => {
    fetchChallans();
  }, [currentPage, statusFilter]);

  const fetchChallans = async (searchQuery = search) => {
    setLoading(true);
    try {
      const params: any = { page: currentPage, limit: 10 };
      if (searchQuery) params.search = searchQuery;
      if (statusFilter) params.status = statusFilter;

      const res = await api.get('/challans', { params });
      if (res.data.success) {
        setChallans(res.data.data);
        if (res.data.pagination) setPagination(res.data.pagination);
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to fetch sales challans', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchChallans(search);
  };

  const columns: Column<Challan>[] = [
    {
      header: 'Challan Number',
      cell: (ch) => (
        <div>
          <Link
            to={`/challans/${ch.id}`}
            className="font-extrabold text-sm text-slate-900 hover:text-sky-600 flex items-center gap-1.5"
          >
            <FileText className="w-4 h-4 text-sky-600" />
            {ch.challanNumber}
          </Link>
          <span className="text-[11px] text-slate-400 block font-mono">
            {new Date(ch.createdAt).toLocaleString()}
          </span>
        </div>
      ),
    },
    {
      header: 'Customer Account',
      cell: (ch) => (
        <div>
          <span className="font-bold text-slate-900 block">
            {ch.customer?.businessName || ch.customer?.customerName}
          </span>
          <span className="text-xs text-slate-500 flex items-center gap-1">
            <Building2 className="w-3.5 h-3.5 text-slate-400" />
            {ch.customer?.customerName}
          </span>
        </div>
      ),
    },
    {
      header: 'Total Qty',
      cell: (ch) => (
        <span className="text-xs font-semibold text-slate-700">
          {ch.totalQuantity} units ({ch._count?.items || 0} items)
        </span>
      ),
    },
    {
      header: 'Total Amount',
      cell: (ch) => (
        <span className="font-black text-sm text-slate-900">
          ₹{ch.totalAmount.toLocaleString('en-IN')}
        </span>
      ),
    },
    {
      header: 'Status',
      cell: (ch) => <Badge variant={ch.status} size="sm" />,
    },
    {
      header: 'Created By',
      cell: (ch) => (
        <span className="text-xs text-slate-600 font-medium">{ch.createdBy?.name}</span>
      ),
    },
    {
      header: 'Actions',
      className: 'text-right',
      cell: (ch) => (
        <Link
          to={`/challans/${ch.id}`}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-800 transition-colors"
        >
          <Eye className="w-3.5 h-3.5" />
          View Challan
        </Link>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Search & Actions Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 w-full sm:w-auto flex-1 max-w-md">
          <Input
            placeholder="Search by challan # or customer name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            icon={<Search className="w-4 h-4" />}
          />
          <Button type="submit" variant="secondary" size="md">
            Search
          </Button>
        </form>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          <Select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            options={[
              { value: '', label: 'All Statuses' },
              { value: 'DRAFT', label: 'Drafts' },
              { value: 'CONFIRMED', label: 'Confirmed' },
              { value: 'CANCELLED', label: 'Cancelled' },
            ]}
          />

          {hasRole('ADMIN', 'SALES') && (
            <Link to="/challans/new">
              <Button variant="primary" icon={<Plus className="w-4 h-4" />}>
                Create Sales Challan
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Table */}
      <Table
        columns={columns}
        data={challans}
        isLoading={loading}
        emptyText="No sales challans found"
        keyExtractor={(ch) => ch.id}
      />

      {/* Pagination */}
      <Pagination pagination={pagination} onPageChange={(p) => setCurrentPage(p)} />
    </div>
  );
};
