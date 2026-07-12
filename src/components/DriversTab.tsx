/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Plus, Search, Calendar, ToggleLeft, ToggleRight, BadgeAlert, ShieldAlert } from 'lucide-react';
import { Driver, RBACRule } from '../types';
import { API } from '../api';

interface DriversTabProps {
  rbacRule?: RBACRule;
}

export default function DriversTab({ rbacRule }: DriversTabProps) {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Add Driver Form State
  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [licenseCategory, setLicenseCategory] = useState('Class A Heavy');
  const [licenseExpiryDate, setLicenseExpiryDate] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [safetyScore, setSafetyScore] = useState('100');
  const [status, setStatus] = useState<Driver['status']>('Available');
  const [error, setError] = useState<string | null>(null);

  const canEdit = rbacRule?.drivers === 'yes';

  useEffect(() => {
    loadDrivers();
  }, []);

  async function loadDrivers() {
    setLoading(true);
    try {
      const list = await API.getDrivers();
      setDrivers(list);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const handleAddDriver = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim() || !licenseNumber.trim() || !licenseExpiryDate) {
      setError('Driver Name, License Number, and Expiry Date are required.');
      return;
    }

    try {
      await API.addDriver({
        name,
        licenseNumber: licenseNumber.trim().toUpperCase(),
        licenseCategory,
        licenseExpiryDate,
        contactNumber,
        safetyScore: Number(safetyScore) || 100,
        status,
      });

      // Reset
      setName('');
      setLicenseNumber('');
      setLicenseCategory('Class A Heavy');
      setLicenseExpiryDate('');
      setContactNumber('');
      setSafetyScore('100');
      setStatus('Available');
      setShowAddForm(false);
      loadDrivers();
    } catch (err: any) {
      setError(err.message || 'Failed to add driver');
    }
  };

  const handleToggleStatus = async (driver: Driver) => {
    if (!canEdit) return;

    // Cycle through Available -> Off Duty -> Suspended -> Available
    // Note: If they are On Trip, don't allow changing since they are driving!
    if (driver.status === 'On Trip') {
      alert('Cannot change status while driver is actively On Trip!');
      return;
    }

    let nextStatus: Driver['status'] = 'Available';
    if (driver.status === 'Available') {
      nextStatus = 'Off Duty';
    } else if (driver.status === 'Off Duty') {
      nextStatus = 'Suspended';
    } else if (driver.status === 'Suspended') {
      nextStatus = 'Available';
    }

    try {
      await API.updateDriver(driver.licenseNumber, { status: nextStatus });
      loadDrivers();
    } catch (err: any) {
      alert(err.message || 'Failed to update driver status');
    }
  };

  const filteredDrivers = drivers.filter((d) => {
    const matchesSearch =
      d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.licenseNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.licenseCategory.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  // Check if license is expired based on current local year 2026
  const isLicenseExpired = (expiryStr: string) => {
    const expiry = new Date(expiryStr);
    const today = new Date(); // In JS this will evaluate, but we can also use fixed 2026 date to be safe
    return expiry < today;
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header and Trigger */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <h2 className="text-2xl font-display font-bold tracking-tight text-slate-900">Driver Registry</h2>
          <p className="text-sm text-slate-500">Manage credentials, safety ratings, and availability status.</p>
        </div>
        {canEdit && (
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm px-4 py-2.5 rounded-xl cursor-pointer shadow-xs transition-all"
          >
            <Plus className="h-4 w-4" />
            <span>Add Driver</span>
          </button>
        )}
      </div>

      {/* Form Card */}
      {showAddForm && (
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-md animate-fadeIn">
          <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4">Register New Operator</h3>
          <form onSubmit={handleAddDriver} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 text-red-700 text-xs font-semibold rounded-lg border-l-4 border-red-500">
                {error}
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Operator Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rajesh Kumar"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="block w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">License Number (Unique)</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. MH-12-DL-1100"
                  value={licenseNumber}
                  onChange={(e) => setLicenseNumber(e.target.value)}
                  className="block w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-hidden uppercase"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">License Category</label>
                <select
                  value={licenseCategory}
                  onChange={(e) => setLicenseCategory(e.target.value)}
                  className="block w-full border border-slate-200 bg-white rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                >
                  <option value="Class A Heavy">Class A Heavy</option>
                  <option value="Class B Medium">Class B Medium</option>
                  <option value="Class C Standard">Class C Standard</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">License Expiry Date</label>
                <input
                  type="date"
                  required
                  value={licenseExpiryDate}
                  onChange={(e) => setLicenseExpiryDate(e.target.value)}
                  className="block w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Contact Number</label>
                <input
                  type="text"
                  placeholder="e.g. +1-555-0199"
                  value={contactNumber}
                  onChange={(e) => setContactNumber(e.target.value)}
                  className="block w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Safety Rating (0 - 100)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  placeholder="e.g. 98"
                  value={safetyScore}
                  onChange={(e) => setSafetyScore(e.target.value)}
                  className="block w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
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
                Save Driver
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs flex items-center">
        <div className="relative flex-1">
          <Search className="absolute inset-y-0 left-0 pl-3.5 h-full w-5 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by driver name, license number, classification..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full pl-10 pr-3 py-2.5 border border-slate-100 bg-slate-50/50 rounded-xl text-sm placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
          />
        </div>
      </div>

      {/* Drivers Table */}
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
                  <th className="py-3 px-5">Name</th>
                  <th className="py-3 px-5">License No</th>
                  <th className="py-3 px-5">Category</th>
                  <th className="py-3 px-5">Expiry Date</th>
                  <th className="py-3 px-5">Contact</th>
                  <th className="py-3 px-5 text-center">Trips Completed</th>
                  <th className="py-3 px-5 text-center">Safety Score</th>
                  <th className="py-3 px-5">Status</th>
                  {canEdit && <th className="py-3 px-5 text-right">Quick Toggle</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredDrivers.map((d) => {
                  const expired = isLicenseExpired(d.licenseExpiryDate);
                  const statusColors =
                    d.status === 'Available'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                      : d.status === 'On Trip'
                      ? 'bg-blue-50 text-blue-700 border-blue-100'
                      : d.status === 'Suspended'
                      ? 'bg-red-50 text-red-700 border-red-100'
                      : 'bg-slate-100 text-slate-600 border-slate-200';

                  return (
                    <tr key={d.licenseNumber} className="hover:bg-slate-50/40">
                      <td className="py-3.5 px-5">
                        <span className="font-semibold text-slate-800">{d.name}</span>
                      </td>
                      <td className="py-3.5 px-5 font-mono text-xs font-bold text-slate-600 uppercase">{d.licenseNumber}</td>
                      <td className="py-3.5 px-5 text-slate-600 font-medium">{d.licenseCategory}</td>
                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-1.5">
                          <span className={`text-slate-600 font-medium ${expired ? 'text-red-600 font-bold' : ''}`}>
                            {d.licenseExpiryDate}
                          </span>
                          {expired && (
                            <span className="inline-flex items-center px-1.5 py-0.2 rounded-sm text-[9px] font-extrabold bg-red-100 text-red-700 uppercase tracking-tight">
                              Expired
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-5 text-slate-500 font-mono text-xs">{d.contactNumber}</td>
                      <td className="py-3.5 px-5 text-center text-slate-700 font-bold">{d.tripsCompleted}</td>
                      <td className="py-3.5 px-5 text-center">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold ${
                            d.safetyScore >= 90
                              ? 'bg-emerald-50 text-emerald-700'
                              : d.safetyScore >= 75
                              ? 'bg-amber-50 text-amber-700'
                              : 'bg-red-50 text-red-700'
                          }`}
                        >
                          {d.safetyScore}%
                        </span>
                      </td>
                      <td className="py-3.5 px-5">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${statusColors}`}>
                          {d.status}
                        </span>
                      </td>
                      {canEdit && (
                        <td className="py-3.5 px-5 text-right">
                          <button
                            onClick={() => handleToggleStatus(d)}
                            disabled={d.status === 'On Trip'}
                            title="Cycle Status (Available -> Off Duty -> Suspended)"
                            className={`p-1.5 hover:bg-slate-50 rounded-lg text-slate-500 hover:text-slate-900 transition-colors cursor-pointer ${
                              d.status === 'On Trip' ? 'opacity-30 cursor-not-allowed' : ''
                            }`}
                          >
                            <ToggleLeft className="h-5 w-5 text-blue-500" />
                          </button>
                        </td>
                      )}
                    </tr>
                  );
                })}
                {filteredDrivers.length === 0 && (
                  <tr>
                    <td colSpan={canEdit ? 9 : 8} className="text-center py-12 text-slate-400">
                      No drivers registered.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* RBAC Info */}
      {!canEdit && (
        <div className="bg-amber-50/50 border border-amber-100 rounded-xl p-4 flex gap-3 text-amber-800">
          <ShieldAlert className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <p className="text-xs font-medium leading-relaxed">
            <strong>Read-Only Mode:</strong> Your role can view operator profiles and safety score ratings. Modifying driver availability statuses, suspensions, or entering new operator profiles is restricted.
          </p>
        </div>
      )}
    </div>
  );
}
