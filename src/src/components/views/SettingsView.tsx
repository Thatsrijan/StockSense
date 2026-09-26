import React, { useState } from 'react';
import { useInventoryStore } from '../../store/useInventoryStore';
import { LocationType } from '../../types/inventory';
import {
  Settings,
  Warehouse as WarehouseIcon,
  MapPin,
  Plus,
  RotateCcw,
  CheckCircle,
  Building,
  Layers,
  X
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const {
    warehouses,
    locations,
    addWarehouse,
    addLocation,
    resetDemoData,
  } = useInventoryStore();

  const [activeSubTab, setActiveSubTab] = useState<'warehouses' | 'locations'>('warehouses');
  const [isWarehouseModalOpen, setIsWarehouseModalOpen] = useState(false);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);

  // New Warehouse Form
  const [whName, setWhName] = useState('');
  const [whShortCode, setWhShortCode] = useState('');
  const [whAddress, setWhAddress] = useState('');

  // New Location Form
  const [locName, setLocName] = useState('');
  const [locShortCode, setLocShortCode] = useState('');
  const [locWarehouseId, setLocWarehouseId] = useState(warehouses[0]?.id || '');
  const [locType, setLocType] = useState<LocationType>('internal');

  const handleAddWarehouseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!whName.trim() || !whShortCode.trim()) return;

    addWarehouse({
      name: whName.trim(),
      shortCode: whShortCode.trim().toUpperCase(),
      address: whAddress.trim(),
    });

    setIsWarehouseModalOpen(false);
    setWhName('');
    setWhShortCode('');
    setWhAddress('');
  };

  const handleAddLocationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!locName.trim() || !locShortCode.trim()) return;

    const parentWh = warehouses.find((w) => w.id === locWarehouseId);

    addLocation({
      name: locName.trim(),
      shortCode: locShortCode.trim().toUpperCase(),
      warehouseId: locWarehouseId,
      warehouseName: parentWh?.name,
      type: locType,
    });

    setIsLocationModalOpen(false);
    setLocName('');
    setLocShortCode('');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Settings className="w-6 h-6 text-odoo-700" />
            Warehouse &amp; Configuration Settings
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Configure enterprise physical facilities, zones, racks, and default routing locations.
          </p>
        </div>

        <button
          onClick={() => {
            if (window.confirm('Reset all demo data back to default factory state?')) {
              resetDemoData();
            }
          }}
          className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Reset Demo Data
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveSubTab('warehouses')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
            activeSubTab === 'warehouses'
              ? 'bg-odoo-700 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <WarehouseIcon className="w-4 h-4" /> Warehouses ({warehouses.length})
        </button>
        <button
          onClick={() => setActiveSubTab('locations')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
            activeSubTab === 'locations'
              ? 'bg-odoo-700 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <MapPin className="w-4 h-4" /> Locations &amp; Racks ({locations.length})
        </button>
      </div>

      {/* WAREHOUSES TAB */}
      {activeSubTab === 'warehouses' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-slate-800">Operating Warehouse Facilities</h3>
            <button
              onClick={() => setIsWarehouseModalOpen(true)}
              className="px-3.5 py-2 bg-odoo-700 hover:bg-odoo-800 text-white text-xs font-bold rounded-xl shadow-sm flex items-center gap-1.5 transition-all"
            >
              <Plus className="w-3.5 h-3.5" /> Add Warehouse
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {warehouses.map((wh) => {
              const whLocs = locations.filter((l) => l.warehouseId === wh.id);
              return (
                <div
                  key={wh.id}
                  className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-purple-300 transition-all"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-purple-50 text-odoo-800 flex items-center justify-center font-bold">
                        <Building className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 text-sm">{wh.name}</div>
                        <div className="text-[11px] font-mono text-odoo-700 font-bold">Code: {wh.shortCode}</div>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                      Active
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 mb-4">{wh.address}</p>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                    <span>Associated Locations:</span>
                    <span className="font-bold text-slate-900">{whLocs.length} zones/racks</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* LOCATIONS TAB */}
      {activeSubTab === 'locations' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-slate-800">Storage Locations &amp; Shelf Racks</h3>
            <button
              onClick={() => setIsLocationModalOpen(true)}
              className="px-3.5 py-2 bg-odoo-700 hover:bg-odoo-800 text-white text-xs font-bold rounded-xl shadow-sm flex items-center gap-1.5 transition-all"
            >
              <Plus className="w-3.5 h-3.5" /> Add Location
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3 px-4">Location Name</th>
                    <th className="py-3 px-4">Short Code</th>
                    <th className="py-3 px-4">Warehouse Facility</th>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {locations.map((loc) => (
                    <tr key={loc.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-slate-900 flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-odoo-700" />
                        {loc.name}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-odoo-800">
                        {loc.shortCode}
                      </td>
                      <td className="py-3.5 px-4 text-slate-700">
                        {loc.warehouseName || 'Virtual Partner'}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            loc.type === 'internal'
                              ? 'bg-purple-100 text-odoo-800'
                              : loc.type === 'vendor'
                              ? 'bg-emerald-100 text-emerald-800'
                              : loc.type === 'customer'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {loc.type.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          <CheckCircle className="w-3 h-3" /> Active
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* CREATE WAREHOUSE MODAL */}
      {isWarehouseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/55 animate-fade-in">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 relative">
            <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Add Warehouse</h3>
                <p className="text-xs text-slate-500">Configure new warehouse depot or logistics plant</p>
              </div>
              <button
                onClick={() => setIsWarehouseModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddWarehouseSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Warehouse Name *
                </label>
                <input
                  type="text"
                  required
                  value={whName}
                  onChange={(e) => setWhName(e.target.value)}
                  placeholder="e.g. North Distribution Hub"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-odoo-600 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Short Code (e.g. WH, DEPOT, NDH) *
                </label>
                <input
                  type="text"
                  required
                  value={whShortCode}
                  onChange={(e) => setWhShortCode(e.target.value)}
                  placeholder="e.g. NDH"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono uppercase focus:ring-2 focus:ring-odoo-600 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Facility Address
                </label>
                <textarea
                  rows={2}
                  value={whAddress}
                  onChange={(e) => setWhAddress(e.target.value)}
                  placeholder="Full physical street address..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-odoo-600 focus:bg-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsWarehouseModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-odoo-700 hover:bg-odoo-800 text-white text-xs font-bold rounded-xl shadow-sm"
                >
                  Create Facility
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE LOCATION MODAL */}
      {isLocationModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/55 animate-fade-in">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 relative">
            <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Add Storage Location</h3>
                <p className="text-xs text-slate-500">Configure zone, bay, room or rack</p>
              </div>
              <button
                onClick={() => setIsLocationModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddLocationSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Location Name *
                </label>
                <input
                  type="text"
                  required
                  value={locName}
                  onChange={(e) => setLocName(e.target.value)}
                  placeholder="e.g. WH/Rack C (Heavy Tools)"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-odoo-600 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Short Code *
                </label>
                <input
                  type="text"
                  required
                  value={locShortCode}
                  onChange={(e) => setLocShortCode(e.target.value)}
                  placeholder="e.g. WH/RACK-C"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono uppercase focus:ring-2 focus:ring-odoo-600 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Parent Warehouse
                </label>
                <select
                  value={locWarehouseId}
                  onChange={(e) => setLocWarehouseId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-odoo-600 focus:bg-white"
                >
                  {warehouses.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name} ({w.shortCode})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Location Type
                </label>
                <select
                  value={locType}
                  onChange={(e) => setLocType(e.target.value as LocationType)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-odoo-600 focus:bg-white"
                >
                  <option value="internal">Internal Location (Storage, Rack, Floor)</option>
                  <option value="vendor">Vendor Location</option>
                  <option value="customer">Customer Location</option>
                  <option value="inventory_loss">Inventory Loss / Scrap</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsLocationModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-odoo-700 hover:bg-odoo-800 text-white text-xs font-bold rounded-xl shadow-sm"
                >
                  Add Location
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
