/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Settings, Shield, HelpCircle, Check, ShieldAlert, CheckSquare, Save } from 'lucide-react';
import { DepotSettings, RBACRule, User } from '../types';
import { API } from '../api';

interface SettingsTabProps {
  user: User;
  rbacRules: RBACRule[];
  depotSettings: DepotSettings;
  onUpdateSettings: (newSettings: Partial<DepotSettings>) => void;
}

export default function SettingsTab({ user, rbacRules, depotSettings, onUpdateSettings }: SettingsTabProps) {
  const [depotName, setDepotName] = useState(depotSettings.depotName);
  const [currency, setCurrency] = useState(depotSettings.currency);
  const [distanceLimit, setDistanceLimit] = useState(String(depotSettings.distanceLimit));
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const isManager = user.role === 'Fleet Manager';

  // Sync state if props change
  useEffect(() => {
    setDepotName(depotSettings.depotName);
    setCurrency(depotSettings.currency);
    setDistanceLimit(String(depotSettings.distanceLimit));
  }, [depotSettings]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isManager) return;

    onUpdateSettings({
      depotName,
      currency,
      distanceLimit: Number(distanceLimit)
    });

    setSuccessMsg('Depot configuration saved successfully!');
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  // Render cell helper
  const renderAccessCell = (value: 'yes' | 'no' | 'view') => {
    if (value === 'yes') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2 py-0.8 rounded-md text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-100 uppercase tracking-tight">
          <Check className="h-3 w-3 stroke-[3]" />
          <span>Full (Yes)</span>
        </span>
      );
    }
    if (value === 'view') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2 py-0.8 rounded-md text-[10px] font-extrabold bg-blue-50 text-blue-700 border border-blue-100 uppercase tracking-tight">
          <span>View Only</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center justify-center font-bold text-slate-400 text-xs tracking-widest px-2 py-0.8 bg-slate-50 border border-slate-100 rounded-md">
        -
      </span>
    );
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="border-b border-slate-100 pb-5">
        <h2 className="text-2xl font-display font-bold tracking-tight text-slate-900">Depot Settings & Security</h2>
        <p className="text-sm text-slate-500 font-sans">Configure base depot profiles, distance safety margins, and role accesses.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* General Depot Config Form */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs lg:col-span-5">
          <div className="flex items-center gap-2 mb-4">
            <Settings className="h-5 w-5 text-blue-500" />
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">General Depot Profile</h3>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {successMsg && (
              <div className="p-3 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-xl border-l-4 border-emerald-500">
                {successMsg}
              </div>
            )}

            {!isManager && (
              <div className="p-3 bg-amber-50 text-amber-800 text-xs font-semibold rounded-xl border-l-4 border-amber-500 flex gap-2">
                <ShieldAlert className="h-4.5 w-4.5 text-amber-600 flex-shrink-0" />
                <span>Only the Fleet Manager can modify primary depot profile parameters.</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Depot Name</label>
              <input
                type="text"
                required
                disabled={!isManager}
                placeholder="e.g. Central Midwest Dispatch Depot"
                value={depotName}
                onChange={(e) => setDepotName(e.target.value)}
                className="block w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-hidden disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Depot Currency</label>
                <select
                  required
                  disabled={!isManager}
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="block w-full border border-slate-200 bg-white rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-hidden disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed"
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="INR">INR (₹)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="AUD">AUD (A$)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Distance Safety Margin (km)</label>
                <input
                  type="number"
                  required
                  disabled={!isManager}
                  placeholder="e.g. 1000"
                  value={distanceLimit}
                  onChange={(e) => setDistanceLimit(e.target.value)}
                  className="block w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-hidden disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed"
                />
              </div>
            </div>

            {isManager && (
              <button
                type="submit"
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 rounded-xl text-sm font-semibold text-white shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <Save className="h-4.5 w-4.5" />
                <span>Save Configuration</span>
              </button>
            )}
          </form>
        </div>

        {/* RBAC Rules Matrix */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs lg:col-span-7">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-50">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-500" />
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Role-Based Access Control (RBAC)</h3>
            </div>
            <div className="group relative flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600 cursor-pointer">
              <HelpCircle className="h-4.5 w-4.5" />
              <span className="hidden group-hover:block absolute right-0 top-6 bg-slate-800 text-white p-2 rounded-lg max-w-xs text-[10px] leading-relaxed shadow-lg z-10 font-sans">
                Access tokens are mapped dynamically from security blueprints in the backend db.
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-xs font-semibold tracking-wider">
                  <th className="py-2.5 px-4">System Role</th>
                  <th className="py-2.5 px-4 text-center">Fleet</th>
                  <th className="py-2.5 px-4 text-center">Drivers</th>
                  <th className="py-2.5 px-4 text-center">Trips</th>
                  <th className="py-2.5 px-4 text-center">Fuel/Exp</th>
                  <th className="py-2.5 px-4 text-center">Analytics</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rbacRules.map((rule) => {
                  const isCurrent = rule.role === user.role;
                  return (
                    <tr key={rule.role} className={`hover:bg-slate-50/30 text-xs ${isCurrent ? 'bg-blue-50/20 font-medium' : ''}`}>
                      <td className="py-3.5 px-4 font-semibold text-slate-800">
                        <div className="flex items-center gap-1.5">
                          <span>{rule.role}</span>
                          {isCurrent && (
                            <span className="inline-flex items-center px-1.5 py-0.2 rounded-sm text-[8px] font-bold bg-blue-100 text-blue-700 uppercase tracking-wider">
                              Current
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-center">{renderAccessCell(rule.fleet)}</td>
                      <td className="py-3.5 px-4 text-center">{renderAccessCell(rule.drivers)}</td>
                      <td className="py-3.5 px-4 text-center">{renderAccessCell(rule.trips)}</td>
                      <td className="py-3.5 px-4 text-center">{renderAccessCell(rule.fuelExp)}</td>
                      <td className="py-3.5 px-4 text-center">{renderAccessCell(rule.analytics)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
