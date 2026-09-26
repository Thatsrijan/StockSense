import React, { useState } from 'react';
import { useInventoryStore } from '../../store/useInventoryStore';
import { DeliveryOrder, DeliveryLine } from '../../types/inventory';
import {
  ArrowUpRight,
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
  List as ListIcon,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';

interface DeliveriesViewProps {
  isCreateOpen?: boolean;
  setIsCreateOpen?: (open: boolean) => void;
}

export const DeliveriesView: React.FC<DeliveriesViewProps> = ({
  isCreateOpen: controlledCreateOpen,
  setIsCreateOpen: setControlledCreateOpen,
}) => {
  const {
    deliveries,
    products,
    locations,
    currentUser,
    getFreeStock,
    createDelivery,
    checkDeliveryAvailability,
    validateDelivery,
    cancelDelivery,
  } = useInventoryStore();

  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Modals
  const [localCreateOpen, setLocalCreateOpen] = useState(false);
  const isCreateModalOpen = controlledCreateOpen !== undefined ? controlledCreateOpen : localCreateOpen;
  const setCreateModalOpen = setControlledCreateOpen || setLocalCreateOpen;

  const [activeDelivery, setActiveDelivery] = useState<DeliveryOrder | null>(null);

  // New Delivery Form State
  const [customerName, setCustomerName] = useState('');
  const [sourceLocationId, setSourceLocationId] = useState(
    locations.find((l) => l.type === 'internal')?.id || ''
  );
  const [scheduledDate, setScheduledDate] = useState(
    new Date().toISOString().substring(0, 10)
  );
  const [sourceDocument, setSourceDocument] = useState('');
  const [notes, setNotes] = useState('');
  const [lines, setLines] = useState<Omit<DeliveryLine, 'id' | 'reservedQty' | 'doneQty'>[]>([
    {
      productId: products[2]?.id || products[0]?.id || '',
      productName: products[2]?.name || products[0]?.name || '',
      productSku: products[2]?.sku || products[0]?.sku || '',
      demandQty: 10,
      uom: products[2]?.uom || products[0]?.uom || 'Units',
    },
  ]);

  const internalLocations = locations.filter((l) => l.type === 'internal');

  const filteredDeliveries = deliveries.filter((d) => {
    const matchesSearch =
      d.reference.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (d.sourceDocument && d.sourceDocument.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;
    if (statusFilter !== 'all' && d.status !== statusFilter) return false;
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
        demandQty: 5,
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
    if (!customerName.trim() || lines.length === 0) return;

    createDelivery({
      customerName: customerName.trim(),
      sourceLocationId,
      scheduledDate,
      responsible: currentUser?.name || 'Administrator',
      sourceDocument: sourceDocument.trim() || undefined,
      notes: notes.trim() || undefined,
      lines: lines.map((l, i) => ({
        ...l,
        id: `dl-${Date.now()}-${i}`,
        reservedQty: 0,
        doneQty: 0,
      })),
    });

    setCreateModalOpen(false);
    setCustomerName('');
    setSourceDocument('');
    setNotes('');
  };

  const handleValidate = (deliveryId: string) => {
    validateDelivery(deliveryId);
    if (activeDelivery && activeDelivery.id === deliveryId) {
      const updated = deliveries.find((d) => d.id === deliveryId);
      if (updated) setActiveDelivery({ ...updated, status: 'done' });
    }
  };

  const handleCheckAvailability = (deliveryId: string) => {
    checkDeliveryAvailability(deliveryId);
    if (activeDelivery && activeDelivery.id === deliveryId) {
      const updated = deliveries.find((d) => d.id === deliveryId);
      if (updated) setActiveDelivery(updated);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <ArrowUpRight className="w-6 h-6 text-blue-600" />
            Delivery Orders (Outgoing Stock)
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Pick, pack, and validate customer shipments. Automatically reserves and decrements on-hand inventory.
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
            id="create-delivery-btn"
            onClick={() => setCreateModalOpen(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm shadow-blue-600/20 flex items-center gap-1.5 transition-all"
          >
            <Plus className="w-4 h-4" /> New Delivery Order
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
            placeholder="Search by reference (WH/OUT/...), customer name, or sales order..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-600 focus:bg-white"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:ring-2 focus:ring-blue-600"
          >
            <option value="all">All Statuses ({deliveries.length})</option>
            <option value="ready">Ready (Stock Reserved)</option>
            <option value="waiting">Waiting for Availability</option>
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
                  <th className="py-3 px-4">Customer Name / Address</th>
                  <th className="py-3 px-4">Source Location</th>
                  <th className="py-3 px-4">Scheduled Date</th>
                  <th className="py-3 px-4">Source Doc</th>
                  <th className="py-3 px-4">Items / Qty</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredDeliveries.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-400">
                      No delivery orders found.
                    </td>
                  </tr>
                ) : (
                  filteredDeliveries.map((del) => {
                    const srcLoc = locations.find((l) => l.id === del.sourceLocationId);
                    const totalDemand = del.lines.reduce((acc, l) => acc + l.demandQty, 0);

                    return (
                      <tr
                        key={del.id}
                        onClick={() => setActiveDelivery(del)}
                        className="hover:bg-slate-50/70 cursor-pointer transition-colors"
                      >
                        <td className="py-3.5 px-4 font-mono font-bold text-blue-700">
                          {del.reference}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-slate-900">
                          {del.customerName}
                        </td>
                        <td className="py-3.5 px-4 text-slate-600">
                          {srcLoc?.name || 'WH/Stock'}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-slate-600">
                          {del.scheduledDate}
                        </td>
                        <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">
                          {del.sourceDocument || '—'}
                        </td>
                        <td className="py-3.5 px-4 font-medium text-slate-800">
                          {del.lines.length} lines ({totalDemand} units)
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              del.status === 'done'
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                : del.status === 'ready'
                                ? 'bg-blue-100 text-blue-800 border border-blue-200'
                                : del.status === 'waiting'
                                ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                : del.status === 'canceled'
                                ? 'bg-rose-100 text-rose-800 border border-rose-200'
                                : 'bg-slate-100 text-slate-700 border border-slate-200'
                            }`}
                          >
                            {del.status === 'done' && <CheckCircle className="w-3 h-3" />}
                            {del.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                          {del.status === 'ready' && (
                            <button
                              id={`validate-delivery-${del.reference.replace(/\//g, '-')}`}
                              onClick={() => handleValidate(del.id)}
                              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg shadow-sm transition-all inline-flex items-center gap-1"
                            >
                              <Check className="w-3.5 h-3.5" /> Validate (Ship)
                            </button>
                          )}
                          {del.status === 'waiting' && (
                            <button
                              onClick={() => handleCheckAvailability(del.id)}
                              className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-lg shadow-sm transition-all"
                            >
                              Check Stock
                            </button>
                          )}
                          {del.status === 'draft' && (
                            <button
                              onClick={() => handleCheckAvailability(del.id)}
                              className="px-3 py-1.5 bg-slate-700 hover:bg-slate-800 text-white font-bold text-xs rounded-lg shadow-sm transition-all"
                            >
                              Reserve
                            </button>
                          )}
                          {del.status === 'done' && (
                            <span className="text-[11px] font-semibold text-emerald-700">Stock Decreased</span>
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {(['draft', 'waiting', 'ready', 'done'] as const).map((stage) => {
            const stageDeliveries = filteredDeliveries.filter((d) => d.status === stage);
            return (
              <div key={stage} className="bg-slate-100/70 p-4 rounded-2xl border border-slate-200">
                <div className="flex items-center justify-between mb-3 px-1">
                  <div className="font-extrabold text-xs text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        stage === 'done'
                          ? 'bg-emerald-500'
                          : stage === 'ready'
                          ? 'bg-blue-500'
                          : stage === 'waiting'
                          ? 'bg-amber-500'
                          : 'bg-slate-400'
                      }`}
                    />
                    {stage} ({stageDeliveries.length})
                  </div>
                </div>

                <div className="space-y-3">
                  {stageDeliveries.map((del) => (
                    <div
                      key={del.id}
                      onClick={() => setActiveDelivery(del)}
                      className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md cursor-pointer transition-all"
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-mono font-bold text-xs text-blue-700">{del.reference}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{del.scheduledDate}</span>
                      </div>
                      <div className="font-bold text-sm text-slate-900">{del.customerName}</div>
                      <div className="text-xs text-slate-500 mt-1">
                        {del.lines.length} {del.lines.length === 1 ? 'item' : 'items'}
                      </div>

                      {stage === 'ready' && (
                        <div className="mt-3 pt-2 border-t border-slate-100 flex justify-end">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleValidate(del.id);
                            }}
                            className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] rounded-lg shadow-sm transition-all"
                          >
                            Ship - Qty
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

      {/* DELIVERY DETAIL MODAL FORM */}
      {activeDelivery && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 relative max-h-[90vh] overflow-y-auto">
            {/* Top Pipeline */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4 mb-5">
              <div className="flex items-center gap-3">
                <span className="font-mono text-xl font-extrabold text-blue-700">{activeDelivery.reference}</span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                    activeDelivery.status === 'done'
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      : activeDelivery.status === 'ready'
                      ? 'bg-blue-100 text-blue-800 border border-blue-200'
                      : activeDelivery.status === 'waiting'
                      ? 'bg-amber-100 text-amber-800 border border-amber-200'
                      : 'bg-slate-100 text-slate-700 border border-slate-200'
                  }`}
                >
                  {activeDelivery.status}
                </span>
              </div>

              {/* Status Ribbon: Draft -> Waiting -> Ready -> Done */}
              <div className="flex items-center bg-slate-100 rounded-xl p-1 text-[11px] font-bold">
                <span className={`px-2.5 py-1 rounded-lg ${activeDelivery.status === 'draft' ? 'bg-white shadow text-slate-800' : 'text-slate-400'}`}>
                  Draft
                </span>
                <span className="text-slate-300 px-1">&rarr;</span>
                <span className={`px-2.5 py-1 rounded-lg ${activeDelivery.status === 'waiting' ? 'bg-white shadow text-amber-700' : 'text-slate-400'}`}>
                  Waiting
                </span>
                <span className="text-slate-300 px-1">&rarr;</span>
                <span className={`px-2.5 py-1 rounded-lg ${activeDelivery.status === 'ready' ? 'bg-white shadow text-blue-700' : 'text-slate-400'}`}>
                  Ready
                </span>
                <span className="text-slate-300 px-1">&rarr;</span>
                <span className={`px-2.5 py-1 rounded-lg ${activeDelivery.status === 'done' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400'}`}>
                  Done
                </span>
              </div>
            </div>

            {/* Document Header Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 mb-6 text-xs">
              <div>
                <span className="text-slate-500 font-semibold block mb-0.5">Delivery Address / Customer:</span>
                <span className="font-bold text-sm text-slate-900">{activeDelivery.customerName}</span>
              </div>
              <div>
                <span className="text-slate-500 font-semibold block mb-0.5">Source Location:</span>
                <span className="font-bold text-sm text-slate-900">
                  {locations.find((l) => l.id === activeDelivery.sourceLocationId)?.name || 'WH/Stock'}
                </span>
              </div>
              <div>
                <span className="text-slate-500 font-semibold block mb-0.5">Scheduled Date:</span>
                <span className="font-mono text-slate-800">{activeDelivery.scheduledDate}</span>
              </div>
              <div>
                <span className="text-slate-500 font-semibold block mb-0.5">Responsible:</span>
                <span className="font-medium text-slate-800">{activeDelivery.responsible}</span>
              </div>
              {activeDelivery.sourceDocument && (
                <div>
                  <span className="text-slate-500 font-semibold block mb-0.5">Source Document:</span>
                  <span className="font-mono text-slate-800">{activeDelivery.sourceDocument}</span>
                </div>
              )}
            </div>

            {/* Products Table with Demand vs Reserved vs Done */}
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
                      <th className="py-2.5 px-3 text-right">Reserved</th>
                      <th className="py-2.5 px-3 text-right">Done Qty</th>
                      <th className="py-2.5 px-3">UoM</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {activeDelivery.lines.map((line) => (
                      <tr key={line.id}>
                        <td className="py-2.5 px-3 font-bold text-slate-900">{line.productName}</td>
                        <td className="py-2.5 px-3 font-mono text-slate-500">{line.productSku}</td>
                        <td className="py-2.5 px-3 text-right font-bold text-slate-700">{line.demandQty}</td>
                        <td className="py-2.5 px-3 text-right font-bold text-blue-600">{line.reservedQty}</td>
                        <td className="py-2.5 px-3 text-right font-bold text-emerald-700">
                          {activeDelivery.status === 'done' ? line.doneQty : line.reservedQty}
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
                <Printer className="w-3.5 h-3.5" /> Print Delivery Slip
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveDelivery(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Close
                </button>

                {activeDelivery.status !== 'done' && activeDelivery.status !== 'canceled' && (
                  <>
                    <button
                      type="button"
                      onClick={() => handleCheckAvailability(activeDelivery.id)}
                      className="px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors"
                    >
                      Check Availability
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        cancelDelivery(activeDelivery.id);
                        setActiveDelivery({ ...activeDelivery, status: 'canceled' });
                      }}
                      className="px-3 py-2 text-xs font-bold text-rose-700 hover:bg-rose-50 border border-rose-200 rounded-xl transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      id="modal-validate-delivery-btn"
                      type="button"
                      onClick={() => handleValidate(activeDelivery.id)}
                      className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-600/25 flex items-center gap-1.5 transition-all"
                    >
                      <Check className="w-4 h-4" /> Validate (Ship &amp; Decrease Stock)
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CREATE NEW DELIVERY MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Create Outgoing Delivery Order</h3>
                <p className="text-xs text-slate-500">Pick and ship goods to client destination</p>
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
                    Customer Name / Delivery Address *
                  </label>
                  <input
                    id="delivery-customer-name"
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g. Metro Builders Ltd"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-600 focus:bg-white"
                  />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Source Location *
                  </label>
                  <select
                    id="delivery-src-location"
                    value={sourceLocationId}
                    onChange={(e) => setSourceLocationId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-600 focus:bg-white"
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
                    id="delivery-scheduled-date"
                    type="date"
                    required
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-600 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Source Document (SO Ref)
                  </label>
                  <input
                    id="delivery-source-doc"
                    type="text"
                    value={sourceDocument}
                    onChange={(e) => setSourceDocument(e.target.value)}
                    placeholder="e.g. SO-2026-0422"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-600 focus:bg-white"
                  />
                </div>
              </div>

              {/* Product Lines */}
              <div className="pt-2">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Ordered Products &amp; Quantities
                  </label>
                  <button
                    id="add-delivery-line-btn"
                    type="button"
                    onClick={handleAddLine}
                    className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add a Line
                  </button>
                </div>

                <div className="space-y-2 border border-slate-200 p-3 rounded-xl bg-slate-50">
                  {lines.map((line, idx) => {
                    const free = getFreeStock(line.productId, sourceLocationId);
                    return (
                      <div key={idx} className="flex items-center gap-2 bg-white p-2.5 rounded-lg border border-slate-200">
                        <div className="flex-1">
                          <select
                            value={line.productId}
                            onChange={(e) => handleLineProductChange(idx, e.target.value)}
                            className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-xs"
                          >
                            {products.map((p) => (
                              <option key={p.id} value={p.id}>
                                {p.name} ({p.sku}) - {getFreeStock(p.id, sourceLocationId)} available
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
                    );
                  })}
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
                  id="submit-create-delivery-btn"
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm"
                >
                  Save as Draft
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
