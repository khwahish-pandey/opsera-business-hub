import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../utils/api';
import { Customer, CustomerType, CustomerStatus, Pagination as PaginationType } from '../types';
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
import { Search, UserPlus, Eye, Edit, Trash2, Calendar, Phone, Mail, Building2 } from 'lucide-react';

export const Customers: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [pagination, setPagination] = useState<PaginationType>({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    customerName: '',
    mobile: '',
    email: '',
    businessName: '',
    gstNumber: '',
    customerType: 'WHOLESALE' as CustomerType,
    address: '',
    status: 'ACTIVE' as CustomerStatus,
    notes: '',
  });
  const [formSubmitting, setFormSubmitting] = useState(false);

  const { showToast } = useToast();
  const { hasRole } = useAuth();

  useEffect(() => {
    fetchCustomers();
  }, [currentPage, statusFilter, typeFilter]);

  const fetchCustomers = async (searchQuery = search) => {
    setLoading(true);
    try {
      const params: any = { page: currentPage, limit: 10 };
      if (searchQuery) params.search = searchQuery;
      if (statusFilter) params.status = statusFilter;
      if (typeFilter) params.customerType = typeFilter;

      const res = await api.get('/customers', { params });
      if (res.data.success) {
        setCustomers(res.data.data);
        if (res.data.pagination) {
          setPagination(res.data.pagination);
        }
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to fetch customers', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchCustomers(search);
  };

  const handleOpenAddModal = () => {
    setFormData({
      customerName: '',
      mobile: '',
      email: '',
      businessName: '',
      gstNumber: '',
      customerType: 'WHOLESALE',
      address: '',
      status: 'ACTIVE',
      notes: '',
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (customer: Customer) => {
    setSelectedCustomer(customer);
    setFormData({
      customerName: customer.customerName,
      mobile: customer.mobile,
      email: customer.email,
      businessName: customer.businessName,
      gstNumber: customer.gstNumber || '',
      customerType: customer.customerType,
      address: customer.address,
      status: customer.status,
      notes: customer.notes || '',
    });
    setIsEditModalOpen(true);
  };

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitting(true);
    try {
      const res = await api.post('/customers', formData);
      if (res.data.success) {
        showToast('Customer created successfully!');
        setIsAddModalOpen(false);
        fetchCustomers();
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to create customer', 'error');
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleUpdateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer) return;
    setFormSubmitting(true);
    try {
      const res = await api.put(`/customers/${selectedCustomer.id}`, formData);
      if (res.data.success) {
        showToast('Customer updated successfully!');
        setIsEditModalOpen(false);
        fetchCustomers();
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to update customer', 'error');
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleDeleteCustomer = async () => {
    if (!selectedCustomer) return;
    setFormSubmitting(true);
    try {
      const res = await api.delete(`/customers/${selectedCustomer.id}`);
      if (res.data.success) {
        showToast('Customer deleted successfully!');
        setIsDeleteModalOpen(false);
        fetchCustomers();
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to delete customer', 'error');
    } finally {
      setFormSubmitting(false);
    }
  };

  const columns: Column<Customer>[] = [
    {
      header: 'Customer & Business',
      cell: (c) => (
        <div>
          <Link to={`/customers/${c.id}`} className="font-bold text-slate-900 hover:text-sky-600">
            {c.customerName}
          </Link>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
            <Building2 className="w-3.5 h-3.5" />
            <span>{c.businessName}</span>
            {c.gstNumber && <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded font-mono">{c.gstNumber}</span>}
          </div>
        </div>
      ),
    },
    {
      header: 'Contact Info',
      cell: (c) => (
        <div className="text-xs space-y-0.5">
          <div className="flex items-center gap-1 text-slate-700 font-medium">
            <Phone className="w-3.5 h-3.5 text-slate-400" />
            <span>{c.mobile}</span>
          </div>
          <div className="flex items-center gap-1 text-slate-500">
            <Mail className="w-3.5 h-3.5 text-slate-400" />
            <span>{c.email}</span>
          </div>
        </div>
      ),
    },
    {
      header: 'Type',
      cell: (c) => <Badge variant={c.customerType} size="sm" />,
    },
    {
      header: 'Status',
      cell: (c) => <Badge variant={c.status} size="sm" />,
    },
    {
      header: 'Follow-Up Date',
      cell: (c) =>
        c.followUpDate ? (
          <div className="flex items-center gap-1 text-xs text-slate-600 font-medium">
            <Calendar className="w-3.5 h-3.5 text-amber-500" />
            <span>{new Date(c.followUpDate).toLocaleDateString()}</span>
          </div>
        ) : (
          <span className="text-xs text-slate-400">None scheduled</span>
        ),
    },
    {
      header: 'Actions',
      className: 'text-right',
      cell: (c) => (
        <div className="flex items-center justify-end gap-2">
          <Link
            to={`/customers/${c.id}`}
            className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-sky-600 transition-colors"
            title="View Details & Follow-ups"
          >
            <Eye className="w-4 h-4" />
          </Link>
          {hasRole('ADMIN', 'SALES') && (
            <button
              onClick={() => handleOpenEditModal(c)}
              className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-amber-600 transition-colors"
              title="Edit Customer"
            >
              <Edit className="w-4 h-4" />
            </button>
          )}
          {hasRole('ADMIN') && (
            <button
              onClick={() => {
                setSelectedCustomer(c);
                setIsDeleteModalOpen(true);
              }}
              className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-rose-600 transition-colors"
              title="Delete Customer"
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
      {/* Top Action Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 w-full sm:w-auto flex-1 max-w-md">
          <Input
            placeholder="Search by customer, business, mobile, email..."
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
              { value: 'ACTIVE', label: 'Active Accounts' },
              { value: 'LEAD', label: 'Leads' },
              { value: 'INACTIVE', label: 'Inactive' },
            ]}
          />
          <Select
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value);
              setCurrentPage(1);
            }}
            options={[
              { value: '', label: 'All Types' },
              { value: 'WHOLESALE', label: 'Wholesale' },
              { value: 'DISTRIBUTOR', label: 'Distributor' },
              { value: 'RETAIL', label: 'Retail' },
            ]}
          />
          {hasRole('ADMIN', 'SALES') && (
            <Button variant="primary" icon={<UserPlus className="w-4 h-4" />} onClick={handleOpenAddModal}>
              Add Customer
            </Button>
          )}
        </div>
      </div>

      {/* Table */}
      <Table
        columns={columns}
        data={customers}
        isLoading={loading}
        emptyText="No customer accounts match your criteria"
        keyExtractor={(c) => c.id}
      />

      {/* Pagination */}
      <Pagination pagination={pagination} onPageChange={(p) => setCurrentPage(p)} />

      {/* Add / Edit Customer Modal */}
      <Modal
        isOpen={isAddModalOpen || isEditModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setIsEditModalOpen(false);
        }}
        title={isAddModalOpen ? 'Create New Customer Account' : 'Edit Customer Account'}
        subtitle="Manage customer CRM profile & business details"
      >
        <form onSubmit={isAddModalOpen ? handleCreateCustomer : handleUpdateCustomer} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Customer Name *"
              value={formData.customerName}
              onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
              required
            />
            <Input
              label="Business Name *"
              value={formData.businessName}
              onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Mobile Number *"
              placeholder="+919876543210"
              value={formData.mobile}
              onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
              required
            />
            <Input
              label="Email Address *"
              type="email"
              placeholder="customer@domain.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="GST Number"
              placeholder="07AAAAA0000A1Z5"
              value={formData.gstNumber}
              onChange={(e) => setFormData({ ...formData, gstNumber: e.target.value })}
            />
            <Select
              label="Customer Type *"
              value={formData.customerType}
              onChange={(e) => setFormData({ ...formData, customerType: e.target.value as CustomerType })}
              options={[
                { value: 'WHOLESALE', label: 'Wholesale' },
                { value: 'DISTRIBUTOR', label: 'Distributor' },
                { value: 'RETAIL', label: 'Retail' },
              ]}
            />
            <Select
              label="Status *"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as CustomerStatus })}
              options={[
                { value: 'ACTIVE', label: 'Active' },
                { value: 'LEAD', label: 'Lead' },
                { value: 'INACTIVE', label: 'Inactive' },
              ]}
            />
          </div>

          <Input
            label="Full Address *"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            required
          />

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Internal CRM Notes
            </label>
            <textarea
              rows={3}
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
              placeholder="Add key account notes or preferences..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
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
            <Button type="submit" variant="primary" isLoading={formSubmitting}>
              {isAddModalOpen ? 'Save Customer' : 'Update Account'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteCustomer}
        title="Delete Customer Account"
        message={`Are you sure you want to delete customer '${selectedCustomer?.customerName}' (${selectedCustomer?.businessName})? This action cannot be undone.`}
        confirmText="Delete Account"
        variant="danger"
        isLoading={formSubmitting}
      />
    </div>
  );
};
