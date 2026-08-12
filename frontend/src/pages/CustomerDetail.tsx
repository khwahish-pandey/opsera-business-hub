import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../utils/api';
import { Customer, FollowUp, Challan } from '../types';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Modal } from '../components/common/Modal';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import {
  Building2,
  Phone,
  Mail,
  MapPin,
  Calendar,
  FileText,
  MessageSquarePlus,
  ArrowLeft,
  Clock,
  UserCheck,
} from 'lucide-react';

export const CustomerDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);

  // Follow-up modal state
  const [isFollowUpModalOpen, setIsFollowUpModalOpen] = useState(false);
  const [note, setNote] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { showToast } = useToast();
  const { hasRole } = useAuth();

  useEffect(() => {
    if (id) fetchCustomerDetails();
  }, [id]);

  const fetchCustomerDetails = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/customers/${id}`);
      if (res.data.success) {
        setCustomer(res.data.data);
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to load customer profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAddFollowUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!note || !followUpDate) {
      showToast('Please enter note and follow-up date', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post(`/customers/${id}/followups`, {
        note,
        followUpDate: new Date(followUpDate).toISOString(),
      });
      if (res.data.success) {
        showToast('Follow-up note added successfully!');
        setIsFollowUpModalOpen(false);
        setNote('');
        setFollowUpDate('');
        fetchCustomerDetails();
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to add follow-up', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-500">Loading customer profile...</div>;
  }

  if (!customer) {
    return (
      <div className="p-8 text-center">
        <p className="text-rose-500 font-semibold">Customer not found.</p>
        <Link to="/customers" className="text-sky-600 underline text-sm mt-2 inline-block">
          Back to Customers List
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back button */}
      <Link to="/customers" className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-900">
        <ArrowLeft className="w-4 h-4" /> Back to Customers CRM
      </Link>

      {/* Customer Header Card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-sky-100 text-sky-700 font-extrabold flex items-center justify-center text-2xl shrink-0">
            {customer.customerName.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-black text-slate-900">{customer.customerName}</h2>
              <Badge variant={customer.status} />
              <Badge variant={customer.customerType} />
            </div>
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 mt-2 font-medium">
              <span className="flex items-center gap-1 font-semibold text-slate-700">
                <Building2 className="w-4 h-4 text-slate-400" />
                {customer.businessName}
              </span>
              {customer.gstNumber && (
                <span className="bg-slate-100 px-2 py-0.5 rounded font-mono text-[11px]">
                  GST: {customer.gstNumber}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Phone className="w-4 h-4 text-slate-400" />
                {customer.mobile}
              </span>
              <span className="flex items-center gap-1">
                <Mail className="w-4 h-4 text-slate-400" />
                {customer.email}
              </span>
            </div>
          </div>
        </div>

        {hasRole('ADMIN', 'SALES') && (
          <Button
            variant="primary"
            icon={<MessageSquarePlus className="w-4 h-4" />}
            onClick={() => setIsFollowUpModalOpen(true)}
          >
            Add Follow-Up Note
          </Button>
        )}
      </div>

      {/* Address & Notes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-2">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-slate-400" /> Billing & Shipping Address
          </h4>
          <p className="text-sm font-medium text-slate-800 leading-relaxed">{customer.address}</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-2">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-amber-500" /> Scheduled Follow-Up
          </h4>
          <p className="text-sm font-semibold text-slate-800">
            {customer.followUpDate
              ? new Date(customer.followUpDate).toLocaleDateString('en-US', {
                  weekday: 'short',
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })
              : 'No upcoming follow-up scheduled'}
          </p>
          {customer.notes && <p className="text-xs text-slate-500 mt-1 italic">"{customer.notes}"</p>}
        </div>
      </div>

      {/* Two Column Layout: Follow-ups Timeline & Recent Challans */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* CRM Follow-ups Timeline */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Clock className="w-5 h-5 text-sky-600" /> CRM Follow-Up History
            </h3>
            <span className="text-xs font-semibold text-slate-500">
              {customer.followUps?.length || 0} Entries
            </span>
          </div>

          {!customer.followUps || customer.followUps.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">No follow-up interactions recorded yet.</p>
          ) : (
            <div className="space-y-4 relative before:absolute before:inset-0 before:left-3 before:w-0.5 before:bg-slate-200 pt-2">
              {customer.followUps.map((f) => (
                <div key={f.id} className="relative pl-8 space-y-1">
                  <div className="absolute left-1.5 top-1.5 w-3 h-3 rounded-full bg-sky-500 ring-4 ring-white"></div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">{f.createdBy?.name}</span>
                    <span className="text-[11px] text-slate-400">
                      {new Date(f.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100 leading-relaxed">
                    {f.note}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Customer Sales Challans */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-purple-600" /> Customer Sales Challans
            </h3>
            <span className="text-xs font-semibold text-slate-500">
              {customer.challans?.length || 0} Challans
            </span>
          </div>

          {!customer.challans || customer.challans.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">No sales challans generated yet.</p>
          ) : (
            <div className="divide-y divide-slate-100">
              {customer.challans.map((ch) => (
                <div key={ch.id} className="py-3 flex items-center justify-between">
                  <div>
                    <Link
                      to={`/challans/${ch.id}`}
                      className="font-bold text-sm text-slate-900 hover:text-sky-600"
                    >
                      {ch.challanNumber}
                    </Link>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Badge variant={ch.status} size="sm" />
                      <span className="text-xs text-slate-400">
                        {ch.items?.length || 0} items ({ch.totalQuantity} total qty)
                      </span>
                    </div>
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
          )}
        </div>
      </div>

      {/* Add Follow-Up Modal */}
      <Modal
        isOpen={isFollowUpModalOpen}
        onClose={() => setIsFollowUpModalOpen(false)}
        title="Add CRM Follow-Up Note"
        subtitle={`Record interaction note for ${customer.businessName}`}
      >
        <form onSubmit={handleAddFollowUp} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Interaction Note *
            </label>
            <textarea
              rows={4}
              required
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
              placeholder="e.g. Spoke with Anil Sharma regarding Q3 product order delivery..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>

          <Input
            label="Next Follow-Up Date *"
            type="datetime-local"
            value={followUpDate}
            onChange={(e) => setFollowUpDate(e.target.value)}
            required
          />

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={() => setIsFollowUpModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={submitting}>
              Save Follow-Up
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
