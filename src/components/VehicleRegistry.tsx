/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, ShieldAlert, BadgeInfo } from 'lucide-react';
import { Vehicle, RBACRule } from '../types';
import { API } from '../api';

interface VehicleRegistryProps {
  rbacRule?: RBACRule;
  currency: string;
}

export default function VehicleRegistry({ rbacRule, currency }: VehicleRegistryProps) {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');

  // Form State
  const [showAddForm, setShowAddForm] = useState(false);
  const [regNo, setRegNo] = useState('');
  const [nameModel, setNameModel] = useState('');
  const [type, setType] = useState<'Truck' | 'Van' | 'Bus' | 'Car'>('Truck');
  const [maxCapacity, setMaxCapacity] = useState('');
  const [odometer, setOdometer] = useState('');
  const [acquisitionCost, setAcquisitionCost] = useState('');
  const [status, setStatus] = useState<Vehicle['status']>('Available');
  const [region, setRegion] = useState('');
  const [error, setError] = useState<string | null>(null);

  const canEdit = rbacRule?.fleet === 'yes';

  useEffect(() => {
    loadVehicles();
  }, []);

  async function loadVehicles() {
    setLoading(true);
    try {
      const list = await API.getVehicles();
      setVehicles(list);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const handleAddVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!regNo.trim() || !nameModel.trim() || !maxCapacity) {
      setError('Registration Number, Name, and Max Capacity are required.');
      return;
    }

    try {
      await API.addVehicle({
        registrationNumber: regNo,
        nameModel,
        type,
        maxCapacity: Number(maxCapacity),
        odometer: Number(odometer) || 0,
        acquisitionCost: Number(acquisitionCost) || 0,
        status,
        region: region || 'General',
      });

      // Reset
      setRegNo('');
      setNameModel('');
      setMaxCapacity('');
      setOdometer('');
      setAcquisitionCost('');
      setStatus('Available');
      setRegion('');
      setShowAddForm(false);
      loadVehicles();
    } catch (err: any) {
      setError(err.message || 'Failed to add vehicle');
    }
  };

  const filteredVehicles = vehicles.filter((v) => {
    const matchesSearch =
      v.registrationNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.nameModel.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.region.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'All' || v.type === filterType;
    const matchesStatus = filterStatus === 'All' || v.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header and Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <h2 className="text-2xl font-display font-bold tracking-tight text-slate-900">Vehicle Registry</h2>
          <p className="text-sm text-slate-500">Manage, inspect, and update fleet vehicles.</p>
        </div>
        {canEdit && (
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm px-4 py-2.5 rounded-xl cursor-pointer shadow-xs transition-all"
          >
            <Plus className="h-4 w-4" />
            <span>Add Vehicle</span>
          </button>
        )}
      </div>

      {/* Slide-out or Dropdown Add Vehicle Form */}
      {showAddForm && (
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-md animate-fadeIn">
          <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4">Register New Vehicle</h3>
          <form onSubmit={handleAddVehicle} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 text-red-700 text-xs font-semibold rounded-lg border-l-4 border-red-500">
                {error}
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Registration No. (Unique)</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. MH-12-QE-1022"
                  value={regNo}
                  onChange={(e) => setRegNo(e.target.value)}
                  className="block w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-hidden uppercase"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Name / Model</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Tata Signa Heavy Truck"
                  value={nameModel}
                  onChange={(e) => setNameModel(e.target.value)}
                  className="block w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Vehicle Type</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as any)}
                  className="block w-full border border-slate-200 bg-white rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                >
                  <option value="Truck">Truck</option>
                  <option value="Van">Van</option>
                  <option value="Bus">Bus</option>
                  <option value="Car">Car</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Max Capacity (kg)</label>
                <input
                  type="number"
                  required
                  placeholder="e.g. 1200"
                  value={maxCapacity}
                  onChange={(e) => setMaxCapacity(e.target.value)}
                  className="block w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Initial Odometer (km)</label>
                <input
                  type="number"
                  placeholder="e.g. 45000"
                  value={odometer}
                  onChange={(e) => setOdometer(e.target.value)}
                  className="block w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Acquisition Cost ({currency})</label>
                <input
                  type="number"
                  placeholder="e.g. 32000"
                  value={acquisitionCost}
                  onChange={(e) => setAcquisitionCost(e.target.value)}
                  className="block w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Region</label>
                <input
                  type="text"
                  placeholder="e.g. Midwest"
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  className="block w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Initial Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="block w-full border border-slate-200 bg-white rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                >
                  <option value="Available">Available</option>
                  <option value="In Shop">In Shop</option>
                  <option value="Retired">Retired</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 text-sm font-semibold text-slate-500 hover:text-slate-700 hover:bg-slate-50 rounded-xl cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl cursor-pointer transition-all shadow-xs"
              >
                Save Vehicle
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filters & Search Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-xs">
        <div className="relative flex-1">
          <Search className="absolute inset-y-0 left-0 pl-3.5 h-full w-5 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by registration number, model, region..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full pl-10 pr-3 py-2.5 border border-slate-100 bg-slate-50/50 rounded-xl text-sm placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
          />
        </div>

        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 bg-slate-50 px-3 rounded-xl border border-slate-100">
            <Filter className="h-4 w-4 text-slate-400" />
            <span>Type:</span>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="text-xs font-semibold text-slate-700 bg-transparent border-none py-1 pl-1 pr-6 focus:outline-hidden cursor-pointer"
            >
              <option value="All">All Types</option>
              <option value="Truck">Truck</option>
              <option value="Van">Van</option>
              <option value="Bus">Bus</option>
              <option value="Car">Car</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 bg-slate-50 px-3 rounded-xl border border-slate-100">
            <Filter className="h-4 w-4 text-slate-400" />
            <span>Status:</span>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="text-xs font-semibold text-slate-700 bg-transparent border-none py-1 pl-1 pr-6 focus:outline-hidden cursor-pointer"
            >
              <option value="All">All Statuses</option>
              <option value="Available">Available</option>
              <option value="On Trip">On Trip</option>
              <option value="In Shop">In Shop</option>
              <option value="Retired">Retired</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Vehicles Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center p-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-xs font-semibold tracking-wider">
                  <th className="py-3 px-5">Reg. No</th>
                  <th className="py-3 px-5">Model / Name</th>
                  <th className="py-3 px-5">Type</th>
                  <th className="py-3 px-5">Capacity</th>
                  <th className="py-3 px-5">Odometer</th>
                  <th className="py-3 px-5">Acquisition Cost</th>
                  <th className="py-3 px-5">Region</th>
                  <th className="py-3 px-5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredVehicles.map((v) => {
                  const statusColors =
                    v.status === 'Available'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                      : v.status === 'On Trip'
                      ? 'bg-blue-50 text-blue-700 border-blue-100'
                      : v.status === 'In Shop'
                      ? 'bg-amber-50 text-amber-700 border-amber-100'
                      : 'bg-slate-100 text-slate-600 border-slate-200';

                  return (
                    <tr key={v.registrationNumber} className="hover:bg-slate-50/40">
                      <td className="py-3.5 px-5 font-mono text-xs font-bold text-slate-900">{v.registrationNumber}</td>
                      <td className="py-3.5 px-5 font-medium text-slate-700">{v.nameModel}</td>
                      <td className="py-3.5 px-5 text-slate-500 font-medium">{v.type}</td>
                      <td className="py-3.5 px-5 text-slate-600">{v.maxCapacity.toLocaleString()} kg</td>
                      <td className="py-3.5 px-5 text-slate-600 font-mono text-xs">{v.odometer.toLocaleString()} km</td>
                      <td className="py-3.5 px-5 text-slate-600 font-mono text-xs">
                        {currency} {v.acquisitionCost.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-5 text-slate-600">{v.region}</td>
                      <td className="py-3.5 px-5">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${statusColors}`}>
                          {v.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
                {filteredVehicles.length === 0 && (
                  <tr>
                    <td colSpan={8} className="text-center py-12 text-slate-400">
                      No vehicles found matching the filters or search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* RBAC Info Disclaimer */}
      {!canEdit && (
        <div className="bg-amber-50/50 border border-amber-100 rounded-xl p-4 flex gap-3 text-amber-800">
          <BadgeInfo className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <p className="text-xs font-medium leading-relaxed">
            <strong>View Only Access:</strong> Your current role has read-only permission for the Vehicle Registry. Modifying statuses, editing details, or registering new vehicles requires a <strong>Fleet Manager</strong> role.
          </p>
        </div>
      )}
    </div>
  );
}
