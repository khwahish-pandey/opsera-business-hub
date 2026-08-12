import React, { useEffect, useState } from 'react';
import { api } from '../utils/api';
import { User, Role } from '../types';
import { Table, Column } from '../components/common/Table';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Select } from '../components/common/Select';
import { Modal } from '../components/common/Modal';
import { useToast } from '../context/ToastContext';
import { UserPlus, ShieldCheck, Mail, Calendar } from 'lucide-react';

export const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // Create User Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'SALES' as Role,
  });
  const [submitting, setSubmitting] = useState(false);

  const { showToast } = useToast();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/users');
      if (res.data.success) {
        setUsers(res.data.data);
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to fetch user accounts', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.post('/users', formData);
      if (res.data.success) {
        showToast(`User ${formData.name} created successfully!`);
        setIsAddModalOpen(false);
        setFormData({ name: '', email: '', password: '', role: 'SALES' });
        fetchUsers();
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to create user', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const columns: Column<User>[] = [
    {
      header: 'Full Name',
      cell: (u) => <span className="font-bold text-slate-900">{u.name}</span>,
    },
    {
      header: 'Email Address',
      cell: (u) => (
        <div className="flex items-center gap-1 text-slate-600 text-xs font-medium">
          <Mail className="w-3.5 h-3.5 text-slate-400" />
          <span>{u.email}</span>
        </div>
      ),
    },
    {
      header: 'Assigned Role',
      cell: (u) => <Badge variant={u.role} size="sm" />,
    },
    {
      header: 'Activity Count',
      cell: (u) => (
        <span className="text-xs text-slate-500 font-semibold">
          {u._count?.challans || 0} Challans | {u._count?.stockMovements || 0} Movements
        </span>
      ),
    },
    {
      header: 'Created On',
      cell: (u) => (
        <span className="text-xs text-slate-400 font-mono">
          {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'System Seed'}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Action Header */}
      <div className="flex items-center justify-between bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h3 className="text-base font-bold text-slate-900">System Users & RBAC Permissions</h3>
          <p className="text-xs text-slate-500">Manage user accounts and role assignments</p>
        </div>
        <Button
          variant="primary"
          icon={<UserPlus className="w-4 h-4" />}
          onClick={() => setIsAddModalOpen(true)}
        >
          Create User Account
        </Button>
      </div>

      {/* Users Table */}
      <Table
        columns={columns}
        data={users}
        isLoading={loading}
        emptyText="No user accounts found"
        keyExtractor={(u) => u.id}
      />

      {/* Create User Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Create New System User"
        subtitle="Assign role permissions for OPSERA system access"
      >
        <form onSubmit={handleCreateUser} className="space-y-4">
          <Input
            label="Full Name *"
            placeholder="e.g. Ramesh Kumar"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />

          <Input
            label="Email Address *"
            type="email"
            placeholder="user@nexora.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />

          <Input
            label="Initial Password *"
            type="password"
            placeholder="Minimum 6 characters"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
          />

          <Select
            label="Assigned System Role *"
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value as Role })}
            options={[
              { value: 'ADMIN', label: 'ADMIN — Full Access' },
              { value: 'SALES', label: 'SALES — Customer CRM & Challans' },
              { value: 'WAREHOUSE', label: 'WAREHOUSE — Stock & Inventory Ops' },
              { value: 'ACCOUNTS', label: 'ACCOUNTS — Customer & Sales Reports' },
            ]}
          />

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={submitting}>
              Create User
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
