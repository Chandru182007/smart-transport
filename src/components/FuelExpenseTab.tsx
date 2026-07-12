/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Fuel, DollarSign, PlusCircle, CreditCard, ShieldAlert } from 'lucide-react';
import { Vehicle, Trip, FuelLog, Expense, RBACRule } from '../types';
import { API } from '../api';

interface FuelExpenseTabProps {
  rbacRule?: RBACRule;
  currency: string;
}

export default function FuelExpenseTab({ rbacRule, currency }: FuelExpenseTabProps) {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [fuelLogs, setFuelLogs] = useState<FuelLog[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal forms state
  const [activeModal, setActiveModal] = useState<'fuel' | 'expense' | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Log Fuel Form
  const [fuelVehicle, setFuelVehicle] = useState('');
  const [fuelDate, setFuelDate] = useState(new Date().toISOString().split('T')[0]);
  const [fuelLiters, setFuelLiters] = useState('');
  const [fuelCost, setFuelCost] = useState('');

  // Add Expense Form
  const [expenseVehicle, setExpenseVehicle] = useState('');
  const [expenseTrip, setExpenseTrip] = useState('');
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split('T')[0]);
  const [expenseToll, setExpenseToll] = useState('');
  const [expenseOther, setExpenseOther] = useState('');
  const [expenseDesc, setExpenseDesc] = useState('');

  const canEdit = rbacRule?.fuelExp !== 'no';
  const hasWritePermission = rbacRule?.fuelExp === 'yes';

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [vList, tList, feData] = await Promise.all([
        API.getVehicles(),
        API.getTrips(),
        API.getFuelExpenses()
      ]);
      setVehicles(vList);
      setTrips(tList);
      setFuelLogs(feData.fuelLogs);
      setExpenses(feData.expenses);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const handleLogFuel = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!fuelVehicle || !fuelDate || !fuelLiters || !fuelCost) {
      setError('All fields are required.');
      return;
    }

    try {
      await API.logFuel({
        vehicleRegNo: fuelVehicle,
        date: fuelDate,
        liters: Number(fuelLiters),
        cost: Number(fuelCost)
      });
      setActiveModal(null);
      // Reset
      setFuelVehicle('');
      setFuelLiters('');
      setFuelCost('');
      loadData();
    } catch (err: any) {
      setError(err.message || 'Failed to log fuel');
    }
  };

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!expenseVehicle || !expenseDate || (!expenseToll && !expenseOther)) {
      setError('Vehicle, Date, and Toll or Other expense amounts are required.');
      return;
    }

    try {
      await API.addExpense({
        vehicleRegNo: expenseVehicle,
        tripId: expenseTrip || undefined,
        date: expenseDate,
        toll: Number(expenseToll) || 0,
        other: Number(expenseOther) || 0,
        description: expenseDesc
      });
      setActiveModal(null);
      // Reset
      setExpenseVehicle('');
      setExpenseTrip('');
      setExpenseToll('');
      setExpenseOther('');
      setExpenseDesc('');
      loadData();
    } catch (err: any) {
      setError(err.message || 'Failed to add expense');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header with action buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <h2 className="text-2xl font-display font-bold tracking-tight text-slate-900">Fuel & Expense Management</h2>
          <p className="text-sm text-slate-500 font-sans">Track and analyze vehicle refueling, road tolls, and maintenance expenditures.</p>
        </div>

        {hasWritePermission && (
          <div className="flex items-center gap-3">
            <button
              onClick={() => { setError(null); setActiveModal('fuel'); }}
              className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm px-4 py-2.5 rounded-xl cursor-pointer shadow-xs transition-all"
            >
              <Fuel className="h-4 w-4" />
              <span>Log Fuel</span>
            </button>
            <button
              onClick={() => { setError(null); setActiveModal('expense'); }}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm px-4 py-2.5 rounded-xl cursor-pointer shadow-xs transition-all"
            >
              <PlusCircle className="h-4 w-4" />
              <span>Add Expense</span>
            </button>
          </div>
        )}
      </div>

      {!canEdit ? (
        <div className="bg-red-50 text-red-800 border border-red-100 rounded-xl p-4 flex gap-3">
          <ShieldAlert className="h-5 w-5 text-red-600 flex-shrink-0" />
          <p className="text-sm font-semibold">Access Restricted: Your current user role has NO permission to access or edit fuel and expenses.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Fuel Logs Table */}
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs lg:col-span-5">
            <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-50">
              <Fuel className="h-5 w-5 text-blue-500" />
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Fuel logs</h3>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 text-xs font-semibold tracking-wider">
                      <th className="py-2.5 px-4">Vehicle</th>
                      <th className="py-2.5 px-4">Date</th>
                      <th className="py-2.5 px-4 text-center">Liters</th>
                      <th className="py-2.5 px-4 text-right">Cost</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {fuelLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50/40 text-xs">
                        <td className="py-3 px-4 font-mono font-bold text-slate-900">{log.vehicleRegNo}</td>
                        <td className="py-3 px-4 text-slate-500">{log.date}</td>
                        <td className="py-3 px-4 text-center font-mono text-slate-600">{log.liters} L</td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-slate-800">
                          {currency} {log.cost.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                    {fuelLogs.length === 0 && (
                      <tr>
                        <td colSpan={4} className="text-center py-8 text-slate-400">No fuel records entered.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Other Expenses Table */}
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs lg:col-span-7">
            <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-50">
              <CreditCard className="h-5 w-5 text-blue-500" />
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Operational route expenses</h3>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 text-xs font-semibold tracking-wider">
                      <th className="py-2.5 px-4">Trip / Details</th>
                      <th className="py-2.5 px-4">Vehicle</th>
                      <th className="py-2.5 px-4 text-center">Tolls</th>
                      <th className="py-2.5 px-4 text-center">Other</th>
                      <th className="py-2.5 px-4 text-center">Maint Linked</th>
                      <th className="py-2.5 px-4 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {expenses.map((exp) => (
                      <tr key={exp.id} className="hover:bg-slate-50/40 text-xs">
                        <td className="py-3.5 px-4">
                          <div>
                            <span className="font-semibold text-slate-800">{exp.description || 'Route Expenses'}</span>
                            {exp.tripId && <p className="text-[10px] font-mono text-blue-600 mt-0.5">{exp.tripId}</p>}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 font-mono font-bold text-slate-900">{exp.vehicleRegNo}</td>
                        <td className="py-3.5 px-4 text-center font-mono text-slate-500">
                          {exp.toll > 0 ? `${currency} ${exp.toll}` : '-'}
                        </td>
                        <td className="py-3.5 px-4 text-center font-mono text-slate-500">
                          {exp.other > 0 ? `${currency} ${exp.other}` : '-'}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span
                            className={`inline-flex items-center px-1.5 py-0.2 rounded-md text-[9px] font-bold ${
                              exp.maintLinked ? 'bg-amber-50 text-amber-600 border border-amber-100' : 'bg-slate-50 text-slate-400'
                            }`}
                          >
                            {exp.maintLinked ? 'Yes' : 'No'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono font-bold text-blue-600">
                          {currency} {exp.total.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                    {expenses.length === 0 && (
                      <tr>
                        <td colSpan={6} className="text-center py-8 text-slate-400">No route expenses recorded.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Log Fuel Dialog */}
      {activeModal === 'fuel' && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xl max-w-md w-full animate-fadeIn">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Fuel className="h-5 w-5 text-blue-500" />
              <span>Log Refueling Record</span>
            </h3>

            <form onSubmit={handleLogFuel} className="mt-4 space-y-4">
              {error && (
                <div className="p-3 bg-red-50 text-red-700 text-xs font-semibold rounded-lg">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Select Vehicle</label>
                <select
                  required
                  value={fuelVehicle}
                  onChange={(e) => setFuelVehicle(e.target.value)}
                  className="block w-full border border-slate-200 bg-white rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                >
                  <option value="">-- Choose --</option>
                  {vehicles.filter(v => v.status !== 'Retired').map(v => (
                    <option key={v.registrationNumber} value={v.registrationNumber}>
                      {v.registrationNumber} ({v.nameModel})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Date</label>
                <input
                  type="date"
                  required
                  value={fuelDate}
                  onChange={(e) => setFuelDate(e.target.value)}
                  className="block w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Liters Consumed</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 50"
                    value={fuelLiters}
                    onChange={(e) => setFuelLiters(e.target.value)}
                    className="block w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Fuel Cost ({currency})</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 175"
                    value={fuelCost}
                    onChange={(e) => setFuelCost(e.target.value)}
                    className="block w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-2 text-sm font-semibold text-slate-500 hover:text-slate-700 hover:bg-slate-50 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl cursor-pointer shadow-xs"
                >
                  Save Refueling
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Expense Dialog */}
      {activeModal === 'expense' && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xl max-w-md w-full animate-fadeIn">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-blue-500" />
              <span>Log Trip Operational Expense</span>
            </h3>

            <form onSubmit={handleAddExpense} className="mt-4 space-y-4">
              {error && (
                <div className="p-3 bg-red-50 text-red-700 text-xs font-semibold rounded-lg">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Select Vehicle</label>
                <select
                  required
                  value={expenseVehicle}
                  onChange={(e) => setExpenseVehicle(e.target.value)}
                  className="block w-full border border-slate-200 bg-white rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                >
                  <option value="">-- Choose --</option>
                  {vehicles.filter(v => v.status !== 'Retired').map(v => (
                    <option key={v.registrationNumber} value={v.registrationNumber}>
                      {v.registrationNumber} ({v.nameModel})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Link Trip ID (Optional)</label>
                  <select
                    value={expenseTrip}
                    onChange={(e) => setExpenseTrip(e.target.value)}
                    className="block w-full border border-slate-200 bg-white rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  >
                    <option value="">-- None --</option>
                    {trips.map(t => (
                      <option key={t.id} value={t.id}>
                        {t.id} ({t.source} → {t.destination})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={expenseDate}
                    onChange={(e) => setExpenseDate(e.target.value)}
                    className="block w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Toll Fees ({currency})</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={expenseToll}
                    onChange={(e) => setExpenseToll(e.target.value)}
                    className="block w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Other / Misc Cost ({currency})</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={expenseOther}
                    onChange={(e) => setExpenseOther(e.target.value)}
                    className="block w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Description / Notes</label>
                <input
                  type="text"
                  placeholder="e.g. I-94 Interstate Tolls"
                  value={expenseDesc}
                  onChange={(e) => setExpenseDesc(e.target.value)}
                  className="block w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-2 text-sm font-semibold text-slate-500 hover:text-slate-700 hover:bg-slate-50 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl cursor-pointer shadow-xs"
                >
                  Save Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Read-Only Restriction Disclaimer */}
      {canEdit && !hasWritePermission && (
        <div className="bg-amber-50/50 border border-amber-100 rounded-xl p-4 flex gap-3 text-amber-800">
          <ShieldAlert className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <p className="text-xs font-medium leading-relaxed">
            <strong>Read-Only Access:</strong> Your role has permission to review fuel and route expenses but cannot submit refueling logs or expense reports. Creating records requires <strong>yes</strong> control permissions.
          </p>
        </div>
      )}
    </div>
  );
}
