/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Wrench, ShieldAlert, History, PenTool, CheckCircle2 } from 'lucide-react';
import { Vehicle, MaintenanceLog, RBACRule } from '../types';
import { API } from '../api';

interface MaintenanceTabProps {
  rbacRule?: RBACRule;
  currency: string;
}

export default function MaintenanceTab({ rbacRule, currency }: MaintenanceTabProps) {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [logs, setLogs] = useState<MaintenanceLog[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [selectedVehicle, setSelectedVehicle] = useState('');
  const [serviceType, setServiceType] = useState('');
  const [cost, setCost] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [isActiveService, setIsActiveService] = useState(true); // active = In Shop, checked = Active
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const canEdit = rbacRule?.fleet === 'yes'; // maintenance permission linked to fleet assets

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [vList, mList] = await Promise.all([
        API.getVehicles(),
        API.getMaintenance()
      ]);
      setVehicles(vList);
      setLogs(mList);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const handleAddMaintenance = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!selectedVehicle || !serviceType || !cost || !date) {
      setError('Vehicle, Service Type, Cost, and Date are required.');
      return;
    }

    try {
      await API.addMaintenance({
        vehicleRegNo: selectedVehicle,
        serviceType,
        cost: Number(cost),
        date,
        status: isActiveService ? 'Active' : 'Completed' // Active maintenance means vehicle goes "In Shop"
      });

      setSuccess('Maintenance log successfully recorded!');
      // Reset
      setSelectedVehicle('');
      setServiceType('');
      setCost('');
      setDate(new Date().toISOString().split('T')[0]);
      setIsActiveService(true);
      loadData();
    } catch (err: any) {
      setError(err.message || 'Failed to record maintenance');
    }
  };

  const handleCloseMaintenance = async (logId: string) => {
    if (!canEdit) return;
    try {
      await API.closeMaintenance(logId);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to close maintenance');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="border-b border-slate-100 pb-5">
        <h2 className="text-2xl font-display font-bold tracking-tight text-slate-900">Maintenance & Service Hub</h2>
        <p className="text-sm text-slate-500">Record services, manage active repairs, and track vehicle downtime.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Log Service Form */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs lg:col-span-5">
          <div className="flex items-center gap-2 mb-4">
            <PenTool className="h-5 w-5 text-blue-500" />
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Log Service Record</h3>
          </div>

          {!canEdit ? (
            <div className="p-4 bg-slate-50 text-slate-500 rounded-xl text-xs flex gap-2">
              <ShieldAlert className="h-5 w-5 text-slate-400 flex-shrink-0" />
              <span>Your current user role is view-only for fleet assets. Submitting service logs is restricted.</span>
            </div>
          ) : (
            <form onSubmit={handleAddMaintenance} className="space-y-4">
              {error && (
                <div className="p-3 bg-red-50 text-red-700 text-xs font-semibold rounded-xl border-l-4 border-red-500">
                  {error}
                </div>
              )}
              {success && (
                <div className="p-3 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-xl border-l-4 border-emerald-500">
                  {success}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Select Vehicle</label>
                <select
                  value={selectedVehicle}
                  onChange={(e) => setSelectedVehicle(e.target.value)}
                  className="block w-full border border-slate-200 bg-white rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                >
                  <option value="">-- Choose --</option>
                  {vehicles.filter(v => v.status !== 'Retired').map(v => (
                    <option key={v.registrationNumber} value={v.registrationNumber}>
                      {v.registrationNumber} - {v.nameModel} (Status: {v.status})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Service Type / Issue</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Regular Oil Change, Transmission Rebuild"
                  value={serviceType}
                  onChange={(e) => setServiceType(e.target.value)}
                  className="block w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Service Cost ({currency})</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 150"
                    value={cost}
                    onChange={(e) => setCost(e.target.value)}
                    className="block w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Service Date</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="block w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 py-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={isActiveService}
                  onChange={(e) => setIsActiveService(e.target.checked)}
                  className="h-4.5 w-4.5 text-blue-600 rounded-sm border-slate-300 focus:ring-blue-500"
                />
                <label htmlFor="isActive" className="text-xs font-semibold text-slate-700 cursor-pointer">
                  Active Service (Sends vehicle to "In Shop" status immediately)
                </label>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 rounded-xl text-sm font-semibold text-white shadow-xs transition-colors cursor-pointer"
              >
                Save Service Record
              </button>
            </form>
          )}
        </div>

        {/* Service Log History */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs lg:col-span-7">
          <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-50">
            <History className="h-5 w-5 text-blue-500" />
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Service Log history</h3>
          </div>

          {loading ? (
            <div className="flex items-center justify-center p-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 text-xs font-semibold tracking-wider">
                    <th className="py-2.5 px-4">Vehicle</th>
                    <th className="py-2.5 px-4">Service Details</th>
                    <th className="py-2.5 px-4">Cost</th>
                    <th className="py-2.5 px-4">Date</th>
                    <th className="py-2.5 px-4">Status</th>
                    {canEdit && <th className="py-2.5 px-4 text-right">Action</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {logs.map((log) => {
                    const isActive = log.status === 'Active';
                    return (
                      <tr key={log.id} className="hover:bg-slate-50/40 text-xs">
                        <td className="py-3.5 px-4 font-mono font-bold text-slate-900">{log.vehicleRegNo}</td>
                        <td className="py-3.5 px-4 font-medium text-slate-700">{log.serviceType}</td>
                        <td className="py-3.5 px-4 font-mono text-slate-600">
                          {currency} {log.cost.toLocaleString()}
                        </td>
                        <td className="py-3.5 px-4 text-slate-500">{log.date}</td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                              isActive
                                ? 'bg-amber-50 text-amber-700 border-amber-100'
                                : 'bg-emerald-50 text-emerald-700 border-emerald-100'
                            }`}
                          >
                            {log.status}
                          </span>
                        </td>
                        {canEdit && (
                          <td className="py-3.5 px-4 text-right">
                            {isActive ? (
                              <button
                                onClick={() => handleCloseMaintenance(log.id)}
                                className="inline-flex items-center gap-1 text-[10px] font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg px-2.5 py-1.2 cursor-pointer shadow-xs transition-colors"
                              >
                                <CheckCircle2 className="h-3 w-3" />
                                <span>Close</span>
                              </button>
                            ) : (
                              <span className="text-[10px] text-slate-400 font-medium">Archived</span>
                            )}
                          </td>
                        )}
                      </tr>
                    );
                  })}
                  {logs.length === 0 && (
                    <tr>
                      <td colSpan={canEdit ? 6 : 5} className="text-center py-12 text-slate-400">
                        No service logs found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
