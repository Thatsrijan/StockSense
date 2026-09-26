import React, { useState } from 'react';
import { useInventoryStore } from '../../store/useInventoryStore';
import { InternalTransfer, TransferLine } from '../../types/inventory';
import {
  ArrowLeftRight,
  Plus,
  Search,
  CheckCircle,
  Clock,
  Printer,
  X,
  Trash2,
  Check,
  Ban,
  MapPin,
  ArrowRight
} from 'lucide-react';

interface TransfersViewProps {
  isCreateOpen?: boolean;
  setIsCreateOpen?: (open: boolean) => void;
}

export const TransfersView: React.FC<TransfersViewProps> = ({
  isCreateOpen: controlledCreateOpen,
  setIsCreateOpen: setControlledCreateOpen,
}) => {
  const {
    transfers,
    products,
    locations,
    currentUser,
    getOnHandStock,
    createTransfer,
    validateTransfer,
    cancelTransfer,
  } = useInventoryStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [localCreateOpen, setLocalCreateOpen] = useState(false);
  const isCreateModalOpen = controlledCreateOpen !== undefined ? controlledCreateOpen : localCreateOpen;
  const setCreateModalOpen = setControlledCreateOpen || setLocalCreateOpen;

  const [activeTransfer, setActiveTransfer] = useState<InternalTransfer | null>(null);

  // New Transfer Form State
  const internalLocations = locations.filter((l) => l.type === 'internal');
  const [sourceLocationId, setSourceLocationId] = useState(internalLocations[0]?.id || '');
  const [destinationLocationId, setDestinationLocationId] = useState(internalLocations[1]?.id || '');
  const [scheduledDate, setScheduledDate] = useState(
    new Date().toISOString().substring(0, 10)
  );
  const [sourceDocument, setSourceDocument] = useState('');
  const [notes, setNotes] = useState('');
  const [lines, setLines] = useState<Omit<TransferLine, 'id'>[]>([
    {
      productId: products[0]?.id || '',
      productName: products[0]?.name || '',
      productSku: products[0]?.sku || '',
      quantity: 15,
      uom: products[0]?.uom || 'Units',
    },
  ]);

  const filteredTransfers = transfers.filter((t) => {
    const matchesSearch =
      t.reference.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.sourceDocument && t.sourceDocument.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesSearch;
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
        quantity: 5,
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
    if (!sourceLocationId || !destinationLocationId || lines.length === 0) return;
    if (sourceLocationId === destinationLocationId) {
      alert('Source and destination locations cannot be identical.');
      return;
    }

    createTransfer({
      sourceLocationId,
      destinationLocationId,
      scheduledDate,
      responsible: currentUser?.name || 'Administrator',
      sourceDocument: sourceDocument.trim() || undefined,
      notes: notes.trim() || undefined,
      lines: lines.map((l, i) => ({
        ...l,
        id: `tl-${Date.now()}-${i}`,
      })),
    });

    setCreateModalOpen(false);
    setSourceDocument('');
    setNotes('');
  };

  const handleValidate = (transferId: string) => {
    validateTransfer(transferId);
    if (activeTransfer && activeTransfer.id === transferId) {
      const updated = transfers.find((t) => t.id === transferId);
      if (updated) setActiveTransfer({ ...updated, status: 'done' });
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <ArrowLeftRight className="w-6 h-6 text-amber-600" />
            Internal Transfers
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Relocate stock across warehouse bays, production floors, and storage racks without altering company stock total.
          </p>
        </div>

        <button
          id="create-transfer-btn"
          onClick={() => setCreateModalOpen(true)}
          className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-sm shadow-amber-600/20 flex items-center gap-1.5 transition-all"
        >
          <Plus className="w-4 h-4" /> New Internal Transfer
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-sm flex items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by transfer reference (WH/INT/...) or document..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-amber-600 focus:bg-white"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Reference</th>
                <th className="py-3 px-4">Source Location</th>
                <th className="py-3 px-4 text-center">Movement</th>
                <th className="py-3 px-4">Destination Location</th>
                <th className="py-3 px-4">Scheduled Date</th>
                <th className="py-3 px-4">Products</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTransfers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    No internal transfers recorded.
                  </td>
                </tr>
              ) : (
                filteredTransfers.map((trf) => {
                  const srcLoc = locations.find((l) => l.id === trf.sourceLocationId);
                  const destLoc = locations.find((l) => l.id === trf.destinationLocationId);
                  const totalUnits = trf.lines.reduce((acc, l) => acc + l.quantity, 0);

                  return (
                    <tr
                      key={trf.id}
                      onClick={() => setActiveTransfer(trf)}
                      className="hover:bg-slate-50/70 cursor-pointer transition-colors"
                    >
                      <td className="py-3.5 px-4 font-mono font-bold text-amber-700">
                        {trf.reference}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-800">
                        {srcLoc?.name || 'Main Warehouse'}
                      </td>
                      <td className="py-3.5 px-4 text-center text-slate-400">
                        <ArrowRight className="w-4 h-4 mx-auto text-amber-600" />
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-800">
                        {destLoc?.name || 'Production Floor'}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-600">
                        {trf.scheduledDate}
                      </td>
                      <td className="py-3.5 px-4 text-slate-700 font-medium">
                        {trf.lines.length} lines ({totalUnits} total)
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            trf.status === 'done'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              : trf.status === 'ready'
                              ? 'bg-amber-100 text-amber-800 border border-amber-200'
                              : 'bg-slate-100 text-slate-700 border border-slate-200'
                          }`}
                        >
                          {trf.status === 'done' && <CheckCircle className="w-3 h-3" />}
                          {trf.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        {trf.status !== 'done' && trf.status !== 'canceled' && (
                          <button
                            id={`validate-transfer-${trf.reference.replace(/\//g, '-')}`}
                            onClick={() => handleValidate(trf.id)}
                            className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-lg shadow-sm transition-all inline-flex items-center gap-1"
                          >
                            <Check className="w-3.5 h-3.5" /> Validate Move
                          </button>
                        )}
                        {trf.status === 'done' && (
                          <span className="text-[11px] font-semibold text-emerald-700">Moved &amp; Logged</span>
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

      {/* DETAIL MODAL */}
      {activeTransfer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xl font-extrabold text-amber-700">{activeTransfer.reference}</span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase bg-amber-100 text-amber-800">
                  {activeTransfer.status}
                </span>
              </div>
              <button
                onClick={() => setActiveTransfer(null)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200 mb-4 text-xs">
              <div>
                <span className="text-slate-500 font-semibold block">From Source Location:</span>
                <span className="font-bold text-slate-900">
                  {locations.find((l) => l.id === activeTransfer.sourceLocationId)?.name}
                </span>
              </div>
              <div>
                <span className="text-slate-500 font-semibold block">To Destination Location:</span>
                <span className="font-bold text-slate-900">
                  {locations.find((l) => l.id === activeTransfer.destinationLocationId)?.name}
                </span>
              </div>
              <div>
                <span className="text-slate-500 font-semibold block">Scheduled Date:</span>
                <span className="font-mono text-slate-800">{activeTransfer.scheduledDate}</span>
              </div>
              <div>
                <span className="text-slate-500 font-semibold block">Responsible:</span>
                <span className="text-slate-800">{activeTransfer.responsible}</span>
              </div>
            </div>

            <div className="mb-4">
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700 mb-2">Transferred Items</h4>
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                    <tr>
                      <th className="py-2 px-3">Product</th>
                      <th className="py-2 px-3">SKU</th>
                      <th className="py-2 px-3 text-right">Quantity</th>
                      <th className="py-2 px-3">UoM</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {activeTransfer.lines.map((line) => (
                      <tr key={line.id}>
                        <td className="py-2 px-3 font-bold text-slate-900">{line.productName}</td>
                        <td className="py-2 px-3 font-mono text-slate-500">{line.productSku}</td>
                        <td className="py-2 px-3 text-right font-bold text-amber-700">{line.quantity}</td>
                        <td className="py-2 px-3 text-slate-500">{line.uom}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setActiveTransfer(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Close
              </button>
              {activeTransfer.status !== 'done' && activeTransfer.status !== 'canceled' && (
                <button
                  type="button"
                  onClick={() => handleValidate(activeTransfer.id)}
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-sm flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" /> Validate (Execute Transfer)
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* CREATE MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Create Internal Stock Transfer</h3>
                <p className="text-xs text-slate-500">Relocate inventory between warehouse storage locations</p>
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
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Source Location *
                  </label>
                  <select
                    value={sourceLocationId}
                    onChange={(e) => setSourceLocationId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-amber-600 focus:bg-white"
                  >
                    {internalLocations.map((loc) => (
                      <option key={loc.id} value={loc.id}>
                        {loc.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Destination Location *
                  </label>
                  <select
                    value={destinationLocationId}
                    onChange={(e) => setDestinationLocationId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-amber-600 focus:bg-white"
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
                    type="date"
                    required
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-amber-600 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Reference / Manufacturing Order
                  </label>
                  <input
                    type="text"
                    value={sourceDocument}
                    onChange={(e) => setSourceDocument(e.target.value)}
                    placeholder="e.g. MO-2026-0099"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-amber-600 focus:bg-white"
                  />
                </div>
              </div>

              {/* Lines */}
              <div className="pt-2">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Products to Move
                  </label>
                  <button
                    type="button"
                    onClick={handleAddLine}
                    className="text-xs font-bold text-amber-700 hover:text-amber-900 flex items-center gap-1"
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
                              {p.name} ({p.sku}) - {getOnHandStock(p.id, sourceLocationId)} in source
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="w-24">
                        <input
                          type="number"
                          min="1"
                          required
                          value={line.quantity}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            const updated = [...lines];
                            updated[idx].quantity = val;
                            setLines(updated);
                          }}
                          placeholder="Qty"
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
                  id="submit-create-transfer-btn"
                  type="submit"
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-sm"
                >
                  Schedule Transfer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
