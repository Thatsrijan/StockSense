import React, { useState } from 'react';
import { useInventoryStore } from '../../store/useInventoryStore';
import { Product } from '../../types/inventory';
import {
  Package,
  Plus,
  Search,
  Filter,
  AlertTriangle,
  Edit2,
  CheckCircle,
  MapPin,
  Sliders,
  Download,
  X,
  Layers,
  DollarSign
} from 'lucide-react';

interface ProductsViewProps {
  externalSearch?: string;
  isCreateOpen?: boolean;
  setIsCreateOpen?: (open: boolean) => void;
}

export const ProductsView: React.FC<ProductsViewProps> = ({
  externalSearch = '',
  isCreateOpen: controlledCreateOpen,
  setIsCreateOpen: setControlledCreateOpen,
}) => {
  const {
    products,
    locations,
    getOnHandStock,
    getFreeStock,
    getReservedStock,
    getLocationStockBreakdown,
    isLowStock,
    addProduct,
    updateProduct,
    quickStockUpdate,
  } = useInventoryStore();

  const [localSearch, setLocalSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [stockFilter, setStockFilter] = useState<'all' | 'low_stock' | 'in_stock'>('all');

  // Modals state
  const [localCreateOpen, setLocalCreateOpen] = useState(false);
  const isCreateModalOpen = controlledCreateOpen !== undefined ? controlledCreateOpen : localCreateOpen;
  const setCreateModalOpen = setControlledCreateOpen || setLocalCreateOpen;

  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [selectedStockProduct, setSelectedStockProduct] = useState<Product | null>(null);
  const [quickUpdateProduct, setQuickUpdateProduct] = useState<Product | null>(null);

  // Quick Stock Update State
  const [quickLocationId, setQuickLocationId] = useState<string>('');
  const [quickNewQty, setQuickNewQty] = useState<number>(0);
  const [quickReason, setQuickReason] = useState<string>('Manual stock count reconciliation');

  // New Product Form State
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    category: 'Raw Materials',
    uom: 'Units',
    cost: 0,
    price: 0,
    minStockThreshold: 10,
    reorderQty: 20,
    description: '',
    initialStockQty: 0,
    initialLocationId: locations.find((l) => l.type === 'internal')?.id || '',
  });

  const categories = Array.from(new Set(products.map((p) => p.category)));
  const internalLocations = locations.filter((l) => l.type === 'internal');

  const query = (externalSearch || localSearch).toLowerCase().trim();

  const filteredProducts = products.filter((p) => {
    // Text search
    const matchesSearch =
      p.name.toLowerCase().includes(query) ||
      p.sku.toLowerCase().includes(query) ||
      p.category.toLowerCase().includes(query);

    if (!matchesSearch) return false;

    // Category filter
    if (selectedCategory !== 'all' && p.category !== selectedCategory) return false;

    // Stock level filter
    if (stockFilter === 'low_stock' && !isLowStock(p.id)) return false;
    if (stockFilter === 'in_stock' && getOnHandStock(p.id) === 0) return false;

    return true;
  });

  const handleOpenQuickUpdate = (product: Product) => {
    setQuickUpdateProduct(product);
    const breakdown = getLocationStockBreakdown(product.id);
    const defaultLoc = breakdown[0]?.location.id || internalLocations[0]?.id || '';
    setQuickLocationId(defaultLoc);
    setQuickNewQty(getOnHandStock(product.id, defaultLoc));
    setQuickReason('Direct inline inventory count update');
  };

  const handleApplyQuickUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickUpdateProduct || !quickLocationId) return;
    quickStockUpdate(quickUpdateProduct.id, quickLocationId, Number(quickNewQty), quickReason);
    setQuickUpdateProduct(null);
  };

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.sku.trim()) return;

    addProduct(
      {
        name: formData.name.trim(),
        sku: formData.sku.trim().toUpperCase(),
        category: formData.category,
        uom: formData.uom,
        cost: Number(formData.cost),
        price: Number(formData.price),
        minStockThreshold: Number(formData.minStockThreshold),
        reorderQty: Number(formData.reorderQty),
        description: formData.description,
      },
      formData.initialStockQty > 0
        ? {
            locationId: formData.initialLocationId || internalLocations[0]?.id,
            qty: Number(formData.initialStockQty),
          }
        : undefined
    );

    setCreateModalOpen(false);
    setFormData({
      name: '',
      sku: '',
      category: 'Raw Materials',
      uom: 'Units',
      cost: 0,
      price: 0,
      minStockThreshold: 10,
      reorderQty: 20,
      description: '',
      initialStockQty: 0,
      initialLocationId: internalLocations[0]?.id || '',
    });
  };

  const handleExportCSV = () => {
    const headers = ['SKU', 'Name', 'Category', 'Unit of Measure', 'Cost', 'Price', 'On Hand', 'Reserved', 'Free to Use', 'Min Threshold'];
    const rows = products.map((p) => [
      p.sku,
      `"${p.name}"`,
      p.category,
      p.uom,
      p.cost,
      p.price,
      getOnHandStock(p.id),
      getReservedStock(p.id),
      getFreeStock(p.id),
      p.minStockThreshold,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `StockSense_Inventory_${new Date().toISOString().substring(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Package className="w-6 h-6 text-odoo-700" />
            Products &amp; Stock
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time multi-location availability, per-unit valuation, and dynamic reordering rules.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5" /> Export CSV
          </button>
          <button
            id="add-product-btn"
            onClick={() => setCreateModalOpen(true)}
            className="px-4 py-2 bg-odoo-700 hover:bg-odoo-800 text-white text-xs font-bold rounded-xl shadow-sm shadow-odoo-700/20 flex items-center gap-1.5 transition-all"
          >
            <Plus className="w-4 h-4" /> Add Product
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
          <input
            id="product-search-input"
            type="text"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            placeholder="Search by product name, SKU, or category..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-odoo-600 focus:bg-white transition-all"
          />
        </div>

        {/* Category Filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            id="product-category-filter"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-odoo-600"
          >
            <option value="all">All Categories ({products.length})</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          {/* Stock Level Filter */}
          <select
            id="product-stock-filter"
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value as any)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-odoo-600"
          >
            <option value="all">All Stock Statuses</option>
            <option value="low_stock">⚠️ Low Stock Only</option>
            <option value="in_stock">In Stock (&gt; 0)</option>
          </select>
        </div>
      </div>

      {/* Main Stock Table (Matches Excalidraw mockup: Product, Per unit cost, On hand, Free to use, update stock) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">SKU / Code</th>
                <th className="py-3 px-4">Product Name</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4 text-right">Per Unit Cost</th>
                <th className="py-3 px-4 text-center">On Hand</th>
                <th className="py-3 px-4 text-center">Reserved</th>
                <th className="py-3 px-4 text-center">Free to Use</th>
                <th className="py-3 px-4 text-center">Min Threshold</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Stock Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-slate-400">
                    No products found matching your search.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => {
                  const onHand = getOnHandStock(product.id);
                  const reserved = getReservedStock(product.id);
                  const free = getFreeStock(product.id);
                  const low = isLowStock(product.id);

                  return (
                    <tr key={product.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-odoo-800">
                        {product.sku}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{product.name}</div>
                        <div className="text-[10px] text-slate-400">UoM: {product.uom}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                          {product.category}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono text-slate-700">
                        ${product.cost.toFixed(2)}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => setSelectedStockProduct(product)}
                          title="Click to see location breakdown"
                          className="font-bold text-sm text-slate-900 hover:text-odoo-700 hover:underline inline-flex items-center gap-1"
                        >
                          {onHand}
                          <MapPin className="w-3 h-3 text-slate-400" />
                        </button>
                      </td>
                      <td className="py-3.5 px-4 text-center text-slate-500 font-medium">
                        {reserved > 0 ? (
                          <span className="px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 font-bold text-[11px]">
                            {reserved}
                          </span>
                        ) : (
                          '0'
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className={`font-bold ${free === 0 ? 'text-rose-600' : 'text-emerald-700'}`}>
                          {free}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center text-slate-500">
                        {product.minStockThreshold}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        {low ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                            <AlertTriangle className="w-3 h-3" /> Low Stock
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            <CheckCircle className="w-3 h-3" /> Optimal
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          id={`update-stock-${product.sku}`}
                          onClick={() => handleOpenQuickUpdate(product)}
                          className="px-2.5 py-1.5 bg-odoo-50 hover:bg-odoo-100 text-odoo-800 font-bold text-[11px] rounded-lg border border-odoo-200 transition-colors inline-flex items-center gap-1"
                          title="User must be able to update stock from here"
                        >
                          <Sliders className="w-3 h-3" /> Update Stock
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* QUICK STOCK UPDATE MODAL (Excalidraw Note: "User must be able to update the stock from here") */}
      {quickUpdateProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/55 animate-fade-in">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 relative">
            <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Direct Stock Update</h3>
                <p className="text-xs text-slate-500 font-mono mt-0.5">{quickUpdateProduct.sku} - {quickUpdateProduct.name}</p>
              </div>
              <button
                onClick={() => setQuickUpdateProduct(null)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleApplyQuickUpdate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Target Location / Rack
                </label>
                <select
                  value={quickLocationId}
                  onChange={(e) => {
                    setQuickLocationId(e.target.value);
                    setQuickNewQty(getOnHandStock(quickUpdateProduct.id, e.target.value));
                  }}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-odoo-600 focus:bg-white"
                >
                  {internalLocations.map((loc) => (
                    <option key={loc.id} value={loc.id}>
                      {loc.name} (Current: {getOnHandStock(quickUpdateProduct.id, loc.id)} {quickUpdateProduct.uom})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    New On Hand Quantity ({quickUpdateProduct.uom})
                  </label>
                  <span className="text-[11px] text-slate-400">
                    Current: {getOnHandStock(quickUpdateProduct.id, quickLocationId)}
                  </span>
                </div>
                <input
                  type="number"
                  min="0"
                  required
                  value={quickNewQty}
                  onChange={(e) => setQuickNewQty(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-base font-bold text-slate-900 focus:ring-2 focus:ring-odoo-600 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Audit Reason / Ledger Note
                </label>
                <input
                  type="text"
                  required
                  value={quickReason}
                  onChange={(e) => setQuickReason(e.target.value)}
                  placeholder="e.g. Physical inventory count variance, damaged items, etc."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-odoo-600 focus:bg-white"
                />
              </div>

              <div className="p-3 bg-purple-50 rounded-xl border border-purple-200 text-[11px] text-purple-900">
                Difference: <strong className="font-mono">{quickNewQty - getOnHandStock(quickUpdateProduct.id, quickLocationId)}</strong> {quickUpdateProduct.uom}. This change will be automatically logged to the Stock Ledger.
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setQuickUpdateProduct(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-odoo-700 hover:bg-odoo-800 text-white text-xs font-bold rounded-xl shadow-sm"
                >
                  Save Stock Quantity
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* LOCATION BREAKDOWN MODAL */}
      {selectedStockProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/55 animate-fade-in">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 relative">
            <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Stock Availability by Location</h3>
                <p className="text-xs text-slate-500 font-mono mt-0.5">{selectedStockProduct.name} ({selectedStockProduct.sku})</p>
              </div>
              <button
                onClick={() => setSelectedStockProduct(null)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 max-h-72 overflow-y-auto">
              {getLocationStockBreakdown(selectedStockProduct.id).length === 0 ? (
                <p className="text-xs text-slate-500 py-4 text-center">No stock recorded in any location.</p>
              ) : (
                getLocationStockBreakdown(selectedStockProduct.id).map(({ location, quantity, reserved }) => (
                  <div key={location.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-odoo-700" />
                        {location.name}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{location.warehouseName || 'Warehouse'}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-extrabold text-sm text-slate-900">
                        {quantity} <span className="text-[10px] font-normal text-slate-500">{selectedStockProduct.uom}</span>
                      </div>
                      {reserved > 0 && (
                        <div className="text-[10px] text-amber-600 font-medium">({reserved} reserved)</div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 flex justify-between items-center text-xs">
              <span className="font-semibold text-slate-600">Total Across Locations:</span>
              <span className="font-extrabold text-base text-odoo-800">
                {getOnHandStock(selectedStockProduct.id)} {selectedStockProduct.uom}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* CREATE NEW PRODUCT MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/55 animate-fade-in">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Create New Product</h3>
                <p className="text-xs text-slate-500">Define specifications, pricing, and initial stock balance.</p>
              </div>
              <button
                onClick={() => setCreateModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Product Name *
                  </label>
                  <input
                    id="new-product-name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Steel Rods 12mm"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-odoo-600 focus:bg-white"
                  />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    SKU / Code *
                  </label>
                  <input
                    id="new-product-sku"
                    type="text"
                    required
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    placeholder="e.g. STL-ROD-01"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono uppercase focus:ring-2 focus:ring-odoo-600 focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Category
                  </label>
                  <select
                    id="new-product-category"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-odoo-600 focus:bg-white"
                  >
                    <option value="Raw Materials">Raw Materials</option>
                    <option value="Finished Goods">Finished Goods</option>
                    <option value="Hardware">Hardware</option>
                    <option value="Safety Equipment">Safety Equipment</option>
                    <option value="Electronics">Electronics</option>
                    <option value="Packaging">Packaging</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Unit of Measure (UoM)
                  </label>
                  <select
                    id="new-product-uom"
                    value={formData.uom}
                    onChange={(e) => setFormData({ ...formData, uom: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-odoo-600 focus:bg-white"
                  >
                    <option value="Units">Units</option>
                    <option value="kg">kg (Kilograms)</option>
                    <option value="Sheets">Sheets</option>
                    <option value="Boxes">Boxes</option>
                    <option value="Meters">Meters</option>
                    <option value="Liters">Liters</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Cost Price ($)
                  </label>
                  <input
                    id="new-product-cost"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.cost}
                    onChange={(e) => setFormData({ ...formData, cost: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-odoo-600 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Sales Price ($)
                  </label>
                  <input
                    id="new-product-price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-odoo-600 focus:bg-white"
                  />
                </div>
              </div>

              {/* Reordering Rules */}
              <div className="p-3 bg-purple-50/50 rounded-xl border border-purple-200/70">
                <div className="font-bold text-xs text-odoo-800 mb-2">Reordering Rule (Low Stock Alerts)</div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Min Alert Threshold
                    </label>
                    <input
                      id="new-product-min-threshold"
                      type="number"
                      min="0"
                      value={formData.minStockThreshold}
                      onChange={(e) => setFormData({ ...formData, minStockThreshold: Number(e.target.value) })}
                      className="w-full px-2.5 py-1.5 bg-white border border-purple-200 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Target Reorder Qty
                    </label>
                    <input
                      id="new-product-reorder-qty"
                      type="number"
                      min="1"
                      value={formData.reorderQty}
                      onChange={(e) => setFormData({ ...formData, reorderQty: Number(e.target.value) })}
                      className="w-full px-2.5 py-1.5 bg-white border border-purple-200 rounded-lg text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Initial Stock (Optional) */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div className="font-bold text-xs text-slate-800 mb-2">Initial Opening Stock (Optional)</div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Quantity
                    </label>
                    <input
                      id="new-product-initial-qty"
                      type="number"
                      min="0"
                      value={formData.initialStockQty}
                      onChange={(e) => setFormData({ ...formData, initialStockQty: Number(e.target.value) })}
                      placeholder="0"
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Store in Location
                    </label>
                    <select
                      id="new-product-initial-loc"
                      value={formData.initialLocationId}
                      onChange={(e) => setFormData({ ...formData, initialLocationId: e.target.value })}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                    >
                      {internalLocations.map((loc) => (
                        <option key={loc.id} value={loc.id}>
                          {loc.name}
                        </option>
                      ))}
                    </select>
                  </div>
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
                  id="submit-create-product-btn"
                  type="submit"
                  className="px-5 py-2 bg-odoo-700 hover:bg-odoo-800 text-white text-xs font-bold rounded-xl shadow-sm shadow-odoo-700/20"
                >
                  Create Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
