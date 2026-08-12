import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../utils/api';
import { Challan } from '../types';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { ConfirmModal } from '../components/common/ConfirmModal';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import {
  ArrowLeft,
  Printer,
  CheckCircle2,
  XCircle,
  Building2,
  Calendar,
  FileText,
  AlertCircle,
} from 'lucide-react';

export const ChallanDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [challan, setChallan] = useState<Challan | null>(null);
  const [loading, setLoading] = useState(true);

  // Action Modals State
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const { showToast } = useToast();
  const { hasRole } = useAuth();

  useEffect(() => {
    if (id) fetchChallan();
  }, [id]);

  const fetchChallan = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/challans/${id}`);
      if (res.data.success) {
        setChallan(res.data.data);
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to fetch challan details', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmChallan = async () => {
    if (!challan) return;
    setActionLoading(true);
    try {
      const res = await api.post(`/challans/${challan.id}/confirm`);
      if (res.data.success) {
        showToast(`Challan ${challan.challanNumber} confirmed! Inventory stock reduced.`);
        setIsConfirmModalOpen(false);
        fetchChallan();
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to confirm challan', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelChallan = async () => {
    if (!challan) return;
    setActionLoading(true);
    try {
      const res = await api.post(`/challans/${challan.id}/cancel`);
      if (res.data.success) {
        showToast(`Challan ${challan.challanNumber} cancelled. Stock restored.`);
        setIsCancelModalOpen(false);
        fetchChallan();
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to cancel challan', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-500">Loading challan details...</div>;
  }

  if (!challan) {
    return (
      <div className="p-8 text-center">
        <p className="text-rose-500 font-semibold">Challan record not found.</p>
        <Link to="/challans" className="text-sky-600 underline text-sm mt-2 inline-block">
          Back to Challans List
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Navigation & Action Bar (Hidden during print) */}
      <div className="no-print flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <Link to="/challans" className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-900">
          <ArrowLeft className="w-4 h-4" /> Back to Sales Challans
        </Link>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <Button variant="outline" icon={<Printer className="w-4 h-4" />} onClick={handlePrint}>
            Print Challan
          </Button>

          {hasRole('ADMIN', 'SALES') && challan.status === 'DRAFT' && (
            <Button
              variant="success"
              icon={<CheckCircle2 className="w-4 h-4" />}
              onClick={() => setIsConfirmModalOpen(true)}
            >
              Confirm Challan
            </Button>
          )}

          {hasRole('ADMIN', 'SALES') && challan.status !== 'CANCELLED' && (
            <Button
              variant="danger"
              icon={<XCircle className="w-4 h-4" />}
              onClick={() => setIsCancelModalOpen(true)}
            >
              Cancel Challan
            </Button>
          )}
        </div>
      </div>

      {/* Printable Challan Document Card */}
      <div className="printable-area bg-white rounded-2xl border border-slate-200 shadow-md p-8 max-w-4xl mx-auto space-y-8">
        {/* Header Branding */}
        <div className="flex items-start justify-between border-b border-slate-200 pb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-slate-900 text-white font-extrabold flex items-center justify-center text-2xl">
              N
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">OPSERA</h1>
              <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
                Wholesale Operations & Sales Challan
              </p>
            </div>
          </div>

          <div className="text-right">
            <h2 className="text-xl font-black text-slate-900">{challan.challanNumber}</h2>
            <div className="mt-1">
              <Badge variant={challan.status} />
            </div>
            <span className="text-xs text-slate-400 block mt-1">
              Date: {new Date(challan.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>

        {/* Customer & Order Metadata Grid */}
        <div className="grid grid-cols-2 gap-6 bg-slate-50 p-5 rounded-xl border border-slate-200 text-xs">
          <div>
            <span className="font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Billed / Delivered To:
            </span>
            <p className="text-base font-bold text-slate-900">{challan.customer?.businessName}</p>
            <p className="font-semibold text-slate-700 mt-0.5">Attn: {challan.customer?.customerName}</p>
            <p className="text-slate-600 mt-1">{challan.customer?.address}</p>
            <p className="text-slate-600 mt-1">
              Mobile: {challan.customer?.mobile} | Email: {challan.customer?.email}
            </p>
            {challan.customer?.gstNumber && (
              <p className="font-mono font-bold text-slate-800 mt-1">
                GSTIN: {challan.customer.gstNumber}
              </p>
            )}
          </div>

          <div className="space-y-2 text-right">
            <div>
              <span className="font-bold text-slate-400 uppercase tracking-wider block">Challan Ref #:</span>
              <span className="font-mono font-bold text-slate-900">{challan.challanNumber}</span>
            </div>
            <div>
              <span className="font-bold text-slate-400 uppercase tracking-wider block">Created By:</span>
              <span className="font-semibold text-slate-800">{challan.createdBy?.name}</span>
            </div>
            <div>
              <span className="font-bold text-slate-400 uppercase tracking-wider block">Order Status:</span>
              <span className="font-bold text-slate-900">{challan.status}</span>
            </div>
          </div>
        </div>

        {/* Items Table (Preserving Product Snapshots) */}
        <div>
          <h3 className="text-sm font-bold text-slate-900 mb-3 uppercase tracking-wider">
            Items Specification
          </h3>
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-left text-sm text-slate-700">
              <thead className="bg-slate-100 text-xs font-semibold uppercase tracking-wider text-slate-600 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">#</th>
                  <th className="px-4 py-3">Product Name (Snapshot)</th>
                  <th className="px-4 py-3">SKU</th>
                  <th className="px-4 py-3 text-right">Quantity</th>
                  <th className="px-4 py-3 text-right">Unit Price</th>
                  <th className="px-4 py-3 text-right">Total Price</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {challan.items?.map((item, idx) => (
                  <tr key={item.id}>
                    <td className="px-4 py-3 text-xs text-slate-400">{idx + 1}</td>
                    <td className="px-4 py-3 font-semibold text-slate-900">
                      {item.productNameSnapshot}
                    </td>
                    <td className="px-4 py-3 text-xs font-mono text-slate-500">
                      {item.skuSnapshot}
                    </td>
                    <td className="px-4 py-3 font-bold text-slate-900 text-right">
                      {item.quantity} units
                    </td>
                    <td className="px-4 py-3 text-slate-700 text-right">
                      ₹{item.unitPriceSnapshot.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 font-extrabold text-slate-900 text-right">
                      ₹{item.totalPrice.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Totals Summary */}
        <div className="flex justify-end pt-4 border-t border-slate-200">
          <div className="w-full max-w-xs space-y-2 text-right">
            <div className="flex justify-between text-xs text-slate-500">
              <span>Total Quantity:</span>
              <span className="font-bold text-slate-800">{challan.totalQuantity} units</span>
            </div>
            <div className="flex justify-between text-base font-extrabold text-slate-900 pt-2 border-t border-slate-200">
              <span>Total Challan Amount:</span>
              <span className="text-xl text-sky-700 font-black">
                ₹{challan.totalAmount.toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        </div>

        {/* Printable Footer Signatures */}
        <div className="pt-12 border-t border-slate-200 grid grid-cols-2 gap-8 text-center text-xs text-slate-500">
          <div>
            <div className="h-12 border-b border-slate-300 w-48 mx-auto"></div>
            <span className="block font-semibold mt-2">Customer Received Signature</span>
          </div>
          <div>
            <div className="h-12 border-b border-slate-300 w-48 mx-auto"></div>
            <span className="block font-semibold mt-2">Authorized Signatory (OPSERA)</span>
          </div>
        </div>
      </div>

      {/* Confirm Challan Modal */}
      <ConfirmModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={handleConfirmChallan}
        title="Confirm Sales Challan & Reduce Stock"
        message="Confirming this challan will transactionally verify product stock levels and automatically reduce inventory stock for all items. Continue?"
        confirmText="Confirm Challan & Deduct Stock"
        variant="success"
        isLoading={actionLoading}
      />

      {/* Cancel Challan Modal */}
      <ConfirmModal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        onConfirm={handleCancelChallan}
        title="Cancel Sales Challan"
        message="If this challan was previously confirmed, cancelling it will restore inventory stock for all items and create IN stock movements. Continue?"
        confirmText="Cancel Challan"
        variant="danger"
        isLoading={actionLoading}
      />
    </div>
  );
};
