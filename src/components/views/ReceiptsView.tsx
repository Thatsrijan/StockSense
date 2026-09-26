import React, { useState } from 'react';
import { useInventoryStore } from '../../store/useInventoryStore';
import { Receipt, ReceiptLine } from '../../types/inventory';
import {
  ArrowDownLeft,
  Plus,
  Search,
  Filter,
  CheckCircle,
  Clock,
  Printer,
  X,
  Trash2,
  Calendar,
  User,
  Warehouse,
  Check,
  Ban,
  LayoutGrid,
  List as ListIcon
} from 'lucide-react';

interface ReceiptsViewProps {
  isCreateOpen?: boolean;
  setIsCreateOpen?: (open: boolean) => void;
}

export const ReceiptsView: React.FC<ReceiptsViewProps> = ({
  isCreateOpen: controlledCreateOpen,
  setIsCreateOpen: setControlledCreateOpen,
}) => {
  const {
    receipts,
    products,
    locations,
    currentUser,
    createReceipt,
    validateReceipt,
    cancelReceipt,
  } = useInventoryStore();

  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Modals
  const [localCreateOpen, setLocalCreateOpen] = useState(false);
  const isCreateModalOpen = controlledCreateOpen !== undefined ? controlledCreateOpen : localCreateOpen;
  const setCreateModalOpen = setControlledCreateOpen || setLocalCreateOpen;

  const [activeReceipt, setActiveReceipt] = useState<Receipt | null>(null);

  // New Receipt Form State
  const [supplierName, setSupplierName] = useState('');
  const [destinationLocationId, setDestinationLocationId] = useState(
    locations.find((l) => l.type === 'internal')?.id || ''
  );
  const [scheduledDate, setScheduledDate] = useState(
    new Date().toISOString().substring(0, 10)
  );
  const [sourceDocument, setSourceDocument] = useState('');
  const [notes, setNotes] = useState('');
  const [lines, setLines] = useState<Omit<ReceiptLine, 'id'>[]>([
    {
      productId: products[0]?.id || '',
      productName: products[0]?.name || '',
      productSku: products[0]?.sku || '',
      demandQty: 50,
      doneQty: 50,
      uom: products[0]?.uom || 'Units',
    },
  ]);

  const internalLocations = locations.filter((l) => l.type === 'internal');

  const filteredReceipts = receipts.filter((r) => {
    const matchesSearch =
      r.reference.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.supplierName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.sourceDocument && r.sourceDocument.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;
    if (statusFilter !== 'all' && r.status !== statusFilter) return false;
    return true;
  });

  const handleAddLine = () => {
    const p = products[0];
    if (!p) return;
    setLines([
      ...lines,
      {
        productId: p.id,
        productName: p.name,
        productSku: p.sku,
        demandQty: 10,
        doneQty: 10,
        uom: p.uom,
      },
    ]);
  };

  const handleRemoveLine = (idx: number) => {
    setLines(lines.filter((_, i) => i !== idx));
  };

  const handleLineProductChange = (idx: number, productId: string) => {
    const p = products.find((prod) => prod.id === productId);
    if (!p) return;
    const updated = [...lines];
    updated[idx] = {
      ...updated[idx],
      productId: p.id,
      productName: p.name,
      productSku: p.sku,
      uom: p.uom,
    };
    setLines(updated);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supplierName.trim() || lines.length === 0) return;

    createReceipt({
      supplierName: supplierName.trim(),
      destinationLocationId,
      scheduledDate,
      responsible: currentUser?.name || 'Administrator',
      sourceDocument: sourceDocument.trim() || undefined,
      notes: notes.trim() || undefined,
      lines: lines.map((l, i) => ({
        ...l,
        id: `rl-${Date.now()}-${i}`,
      })),
    });

    setCreateModalOpen(false);
    // Reset form
    setSupplierName('');
    setSourceDocument('');
    setNotes('');
  };

  const handleValidate = (receiptId: string) => {
    validateReceipt(receiptId);
    if (activeReceipt && activeReceipt.id === receiptId) {
      const updated = receipts.find((r) => r.id === receiptId);
      if (updated) setActiveReceipt({ ...updated, status: 'done' });
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <ArrowDownLeft className="w-6 h-6 text-emerald-600" />
            Receipts (Incoming Stock)
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Receive items from suppliers into warehouse stock and automatically update ledger records.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Switch View Toggle */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                viewMode === 'list' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <ListIcon className="w-3.5 h-3.5" /> List
            </button>
            <button
              onClick={() => setViewMode('kanban')}
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                viewMode === 'kanban' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" /> Kanban
            </button>
          </div>

          <button
            id="create-receipt-btn"
            onClick={() => setCreateModalOpen(true)}
            className="px-4 py-2 bg-odoo-700 hover:bg-odoo-800 text-white text-xs font-bold rounded-xl shadow-sm shadow-odoo-700/20 flex items-center gap-1.5 transition-all"
          >
            <Plus className="w-4 h-4" /> New Receipt
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by reference (WH/IN/...), vendor, or purchase order..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-odoo-600 focus:bg-white"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:ring-2 focus:ring-odoo-600"
          >
            <option value="all">All Statuses ({receipts.length})</option>
            <option value="ready">Ready to Receive</option>
            <option value="draft">Draft</option>
            <option value="done">Done (Validated)</option>
            <option value="canceled">Canceled</option>
          </select>
        </div>
      </div>

      {/* LIST VIEW */}
      {viewMode === 'list' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4">Reference</th>
                  <th className="py-3 px-4">Receive From (Vendor)</th>
                  <th className="py-3 px-4">Destination Location</th>
                  <th className="py-3 px-4">Scheduled Date</th>
                  <th className="py-3 px-4">Source Doc</th>
                  <th className="py-3 px-4">Items / Qty</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredReceipts.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-400">
                      No incoming receipts found.
                    </td>
                  </tr>
                ) : (
                  filteredReceipts.map((rcpt) => {
                    const destLoc = locations.find((l) => l.id === rcpt.destinationLocationId);
                    const totalQty = rcpt.lines.reduce((acc, l) => acc + (rcpt.status === 'done' ? l.doneQty : l.demandQty), 0);

                    return (
                      <tr
                        key={rcpt.id}
                        onClick={() => setActiveReceipt(rcpt)}
                        className="hover:bg-slate-50/70 cursor-pointer transition-colors"
                      >
                        <td className="py-3.5 px-4 font-mono font-bold text-odoo-800">
                          {rcpt.reference}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-slate-900">
                          {rcpt.supplierName}
                        </td>
                        <td className="py-3.5 px-4 text-slate-600">
                          {destLoc?.name || 'Main Storage'}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-slate-600">
                          {rcpt.scheduledDate}
                        </td>
                        <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">
                          {rcpt.sourceDocument || '—'}
                        </td>
                        <td className="py-3.5 px-4 font-medium text-slate-800">
                          {rcpt.lines.length} lines ({totalQty} units)
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              rcpt.status === 'done'
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                : rcpt.status === 'ready'
                                ? 'bg-blue-100 text-blue-800 border border-blue-200'
                                : rcpt.status === 'canceled'
                                ? 'bg-rose-100 text-rose-800 border border-rose-200'
                                : 'bg-slate-100 text-slate-700 border border-slate-200'
                            }`}
                          >
                            {rcpt.status === 'done' && <CheckCircle className="w-3 h-3" />}
                            {rcpt.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                          {rcpt.status !== 'done' && rcpt.status !== 'canceled' && (
                            <button
                              id={`validate-receipt-${rcpt.reference.replace(/\//g, '-')}`}
                              onClick={() => handleValidate(rcpt.id)}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow-sm transition-all inline-flex items-center gap-1"
                            >
                              <Check className="w-3.5 h-3.5" /> Validate
                            </button>
                          )}
                          {rcpt.status === 'done' && (
                            <span className="text-[11px] font-semibold text-emerald-700">Stock Added</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* KANBAN VIEW */}
      {viewMode === 'kanban' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(['draft', 'ready', 'done'] as const).map((stage) => {
            const stageReceipts = filteredReceipts.filter((r) => r.status === stage);
            return (
              <div key={stage} className="bg-slate-100/70 p-4 rounded-2xl border border-slate-200">
                <div className="flex items-center justify-between mb-3 px-1">
                  <div className="font-extrabold text-xs text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${stage === 'done' ? 'bg-emerald-500' : stage === 'ready' ? 'bg-blue-500' : 'bg-slate-400'}`} />
                    {stage} ({stageReceipts.length})
                  </div>
                </div>

                <div className="space-y-3">
                  {stageReceipts.map((rcpt) => (
                    <div
                      key={rcpt.id}
                      onClick={() => setActiveReceipt(rcpt)}
                      className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md cursor-pointer transition-all"
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-mono font-bold text-xs text-odoo-800">{rcpt.reference}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{rcpt.scheduledDate}</span>
                      </div>
                      <div className="font-bold text-sm text-slate-900">{rcpt.supplierName}</div>
                      <div className="text-xs text-slate-500 mt-1">
                        {rcpt.lines.length} {rcpt.lines.length === 1 ? 'item' : 'items'}
                      </div>

                      {stage === 'ready' && (
                        <div className="mt-3 pt-2 border-t border-slate-100 flex justify-end">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleValidate(rcpt.id);
                            }}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] rounded-lg shadow-sm transition-all"
                          >
                            Validate Stock +
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* RECEIPT DETAIL FORM MODAL (Matches Odoo ERP Form View & Excalidraw mock) */}
      {activeReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 relative max-h-[90vh] overflow-y-auto">
            {/* Top Odoo Status Progression Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4 mb-5">
              <div className="flex items-center gap-3">
                <span className="font-mono text-xl font-extrabold text-odoo-800">{activeReceipt.reference}</span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                    activeReceipt.status === 'done'
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      : activeReceipt.status === 'ready'
                      ? 'bg-blue-100 text-blue-800 border border-blue-200'
                      : 'bg-slate-100 text-slate-700 border border-slate-200'
                  }`}
                >
                  {activeReceipt.status}
                </span>
              </div>

              {/* Status Ribbon: Draft -> Ready -> Done */}
              <div className="flex items-center bg-slate-100 rounded-xl p-1 text-[11px] font-bold">
                <span className={`px-2.5 py-1 rounded-lg ${activeReceipt.status === 'draft' ? 'bg-white shadow text-slate-800' : 'text-slate-400'}`}>
                  Draft
                </span>
                <span className="text-slate-300 px-1">&rarr;</span>
                <span className={`px-2.5 py-1 rounded-lg ${activeReceipt.status === 'ready' ? 'bg-white shadow text-blue-700' : 'text-slate-400'}`}>
                  Ready
                </span>
                <span className="text-slate-300 px-1">&rarr;</span>
                <span className={`px-2.5 py-1 rounded-lg ${activeReceipt.status === 'done' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400'}`}>
                  Done
                </span>
              </div>
            </div>

            {/* Document Header Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 mb-6 text-xs">
              <div>
                <span className="text-slate-500 font-semibold block mb-0.5">Receive From (Vendor):</span>
                <span className="font-bold text-sm text-slate-900">{activeReceipt.supplierName}</span>
              </div>
              <div>
                <span className="text-slate-500 font-semibold block mb-0.5">Destination Location:</span>
                <span className="font-bold text-sm text-slate-900">
                  {locations.find((l) => l.id === activeReceipt.destinationLocationId)?.name || 'WH/Stock'}
                </span>
              </div>
              <div>
                <span className="text-slate-500 font-semibold block mb-0.5">Scheduled Date:</span>
                <span className="font-mono text-slate-800">{activeReceipt.scheduledDate}</span>
              </div>
              <div>
                <span className="text-slate-500 font-semibold block mb-0.5">Responsible Operator:</span>
                <span className="font-medium text-slate-800">{activeReceipt.responsible}</span>
              </div>
              {activeReceipt.sourceDocument && (
                <div>
                  <span className="text-slate-500 font-semibold block mb-0.5">Source Document:</span>
                  <span className="font-mono text-slate-800">{activeReceipt.sourceDocument}</span>
                </div>
              )}
            </div>

            {/* Products Table (Demand vs Quantity Done) */}
            <div className="mb-6">
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700 mb-2">
                Operations Product Lines
              </h4>
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                    <tr>
                      <th className="py-2.5 px-3">Product</th>
                      <th className="py-2.5 px-3">SKU</th>
                      <th className="py-2.5 px-3 text-right">Demand</th>
                      <th className="py-2.5 px-3 text-right">Done Qty</th>
                      <th className="py-2.5 px-3">UoM</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {activeReceipt.lines.map((line) => (
                      <tr key={line.id}>
                        <td className="py-2.5 px-3 font-bold text-slate-900">{line.productName}</td>
                        <td className="py-2.5 px-3 font-mono text-slate-500">{line.productSku}</td>
                        <td className="py-2.5 px-3 text-right font-bold text-slate-700">{line.demandQty}</td>
                        <td className="py-2.5 px-3 text-right font-bold text-emerald-700">
                          {activeReceipt.status === 'done' ? line.doneQty : line.demandQty}
                        </td>
                        <td className="py-2.5 px-3 text-slate-500">{line.uom}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-200">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors"
              >
                <Printer className="w-3.5 h-3.5" /> Print Receipt Slip
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveReceipt(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Close
                </button>

                {activeReceipt.status !== 'done' && activeReceipt.status !== 'canceled' && (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        cancelReceipt(activeReceipt.id);
                        setActiveReceipt({ ...activeReceipt, status: 'canceled' });
                      }}
                      className="px-3 py-2 text-xs font-bold text-rose-700 hover:bg-rose-50 border border-rose-200 rounded-xl transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      id="modal-validate-receipt-btn"
                      type="button"
                      onClick={() => handleValidate(activeReceipt.id)}
                      className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/25 flex items-center gap-1.5 transition-all"
                    >
                      <Check className="w-4 h-4" /> Validate (Increase Stock)
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CREATE NEW RECEIPT MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Create Goods Receipt</h3>
                <p className="text-xs text-slate-500">Record incoming stock shipment from vendor</p>
              </div>
              <button
                onClick={() => setCreateModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Receive From (Supplier / Vendor) *
                  </label>
                  <input
                    id="receipt-vendor-name"
                    type="text"
                    required
                    value={supplierName}
                    onChange={(e) => setSupplierName(e.target.value)}
                    placeholder="e.g. Apex Steel Corp"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-odoo-600 focus:bg-white"
                  />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Destination Location *
                  </label>
                  <select
                    id="receipt-dest-location"
                    value={destinationLocationId}
                    onChange={(e) => setDestinationLocationId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-odoo-600 focus:bg-white"
                  >
                    {internalLocations.map((loc) => (
                      <option key={loc.id} value={loc.id}>
                        {loc.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Scheduled Date
                  </label>
                  <input
                    id="receipt-scheduled-date"
                    type="date"
                    required
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-odoo-600 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Source Document (PO Ref)
                  </label>
                  <input
                    id="receipt-source-doc"
                    type="text"
                    value={sourceDocument}
                    onChange={(e) => setSourceDocument(e.target.value)}
                    placeholder="e.g. PO-2026-0955"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-odoo-600 focus:bg-white"
                  />
                </div>
              </div>

              {/* Product Lines */}
              <div className="pt-2">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Received Products &amp; Quantities
                  </label>
                  <button
                    id="add-receipt-line-btn"
                    type="button"
                    onClick={handleAddLine}
                    className="text-xs font-bold text-odoo-700 hover:text-odoo-900 flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add a Line
                  </button>
                </div>

                <div className="space-y-2 border border-slate-200 p-3 rounded-xl bg-slate-50">
                  {lines.map((line, idx) => (
                    <div key={idx} className="flex items-center gap-2 bg-white p-2.5 rounded-lg border border-slate-200">
                      <div className="flex-1">
                        <select
                          value={line.productId}
                          onChange={(e) => handleLineProductChange(idx, e.target.value)}
                          className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-xs"
                        >
                          {products.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name} ({p.sku})
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="w-24">
                        <input
                          type="number"
                          min="1"
                          required
                          value={line.demandQty}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            const updated = [...lines];
                            updated[idx].demandQty = val;
                            updated[idx].doneQty = val;
                            setLines(updated);
                          }}
                          placeholder="Demand"
                          className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-xs font-bold text-right"
                        />
                      </div>
                      <span className="text-xs text-slate-500 w-12">{line.uom}</span>
                      {lines.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveLine(idx)}
                          className="text-slate-400 hover:text-rose-600 p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  id="submit-create-receipt-btn"
                  type="submit"
                  className="px-5 py-2 bg-odoo-700 hover:bg-odoo-800 text-white text-xs font-bold rounded-xl shadow-sm"
                >
                  Save as Ready
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
