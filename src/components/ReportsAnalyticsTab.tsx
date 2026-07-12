/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { BarChart3, Download, TrendingUp, DollarSign, Fuel, Gauge, Award, ShieldAlert } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';
import { Vehicle, Trip, MaintenanceLog, FuelLog, Expense, RBACRule } from '../types';
import { API } from '../api';

interface ReportsAnalyticsTabProps {
  rbacRule?: RBACRule;
  currency: string;
}

export default function ReportsAnalyticsTab({ rbacRule, currency }: ReportsAnalyticsTabProps) {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [maintLogs, setMaintLogs] = useState<MaintenanceLog[]>([]);
  const [fuelLogs, setFuelLogs] = useState<FuelLog[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  const canEdit = rbacRule?.analytics !== 'no';

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [vList, tList, mList, feData] = await Promise.all([
        API.getVehicles(),
        API.getTrips(),
        API.getMaintenance(),
        API.getFuelExpenses()
      ]);
      setVehicles(vList);
      setTrips(tList);
      setMaintLogs(mList);
      setFuelLogs(feData.fuelLogs);
      setExpenses(feData.expenses);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  // ---------------------------------------------------------------------------
  // Metrics Calculation Formulas
  // ---------------------------------------------------------------------------

  // 1. Trip Revenue Formula = Planned Distance * 2.5 + Cargo Weight * 0.1
  const getTripRevenue = (trip: Trip) => {
    if (trip.status !== 'Completed') return 0;
    return trip.plannedDistance * 2.5 + trip.cargoWeight * 0.1;
  };

  // 2. Metrics aggregated by vehicle
  const vehicleStats = vehicles.map(v => {
    const reg = v.registrationNumber.toUpperCase();

    // Trips completed by this vehicle
    const vehicleCompletedTrips = trips.filter(t => t.vehicleRegNo.toUpperCase() === reg && t.status === 'Completed');
    const totalDistance = vehicleCompletedTrips.reduce((sum, t) => sum + t.plannedDistance, 0);
    const calculatedRevenue = vehicleCompletedTrips.reduce((sum, t) => sum + getTripRevenue(t), 0);

    // Fuel logs
    const vehicleFuelLogs = fuelLogs.filter(f => f.vehicleRegNo.toUpperCase() === reg);
    const totalFuelCost = vehicleFuelLogs.reduce((sum, f) => sum + f.cost, 0);
    const totalFuelLiters = vehicleFuelLogs.reduce((sum, f) => sum + f.liters, 0);

    // Maintenance logs linked to this vehicle
    const vehicleMaintLogs = maintLogs.filter(m => m.vehicleRegNo.toUpperCase() === reg);
    const totalMaintCost = vehicleMaintLogs.reduce((sum, m) => sum + m.cost, 0);

    // Tolls and misc expenses logged
    const vehicleExpenses = expenses.filter(e => e.vehicleRegNo.toUpperCase() === reg && !e.maintLinked);
    const totalRouteCost = vehicleExpenses.reduce((sum, e) => sum + e.total, 0);

    // Operational Cost = Fuel + Maintenance + Route costs
    const totalOperationalCost = totalFuelCost + totalMaintCost + totalRouteCost;

    // Fuel Efficiency = Completed Trip Distance / Total Refueling Liters (km/L)
    const fuelEfficiency = totalFuelLiters > 0 ? Number((totalDistance / totalFuelLiters).toFixed(2)) : 0;

    // ROI (%) = (Revenue - Operational Cost) / Acquisition Cost * 100
    const roiPercentage = v.acquisitionCost > 0
      ? Number((((calculatedRevenue - totalOperationalCost) / v.acquisitionCost) * 100).toFixed(1))
      : 0;

    return {
      registrationNumber: v.registrationNumber,
      nameModel: v.nameModel,
      type: v.type,
      acquisitionCost: v.acquisitionCost,
      completedTripsCount: vehicleCompletedTrips.length,
      totalDistance,
      calculatedRevenue,
      totalFuelCost,
      totalFuelLiters,
      totalMaintCost,
      totalOperationalCost,
      fuelEfficiency,
      roiPercentage
    };
  });

  // 3. Overall Fleet KPIs
  const fleetTotalRevenue = vehicleStats.reduce((sum, s) => sum + s.calculatedRevenue, 0);
  const fleetTotalMaint = vehicleStats.reduce((sum, s) => sum + s.totalMaintCost, 0);
  const fleetTotalFuel = vehicleStats.reduce((sum, s) => sum + s.totalFuelCost, 0);
  const fleetTotalRoute = expenses.filter(e => !e.maintLinked).reduce((sum, e) => sum + e.total, 0);
  const fleetTotalOperationalCost = fleetTotalMaint + fleetTotalFuel + fleetTotalRoute;

  const fleetTotalLiters = vehicleStats.reduce((sum, s) => sum + s.totalFuelLiters, 0);
  const fleetTotalDistance = vehicleStats.reduce((sum, s) => sum + s.totalDistance, 0);
  const fleetFuelEfficiency = fleetTotalLiters > 0 ? (fleetTotalDistance / fleetTotalLiters).toFixed(2) : '0';

  const activeVehicles = vehicles.filter(v => v.status === 'On Trip').length;
  const totalViable = vehicles.filter(v => v.status !== 'Retired').length;
  const fleetUtilization = totalViable > 0 ? Math.round((activeVehicles / totalViable) * 100) : 0;

  const overallFleetROI = vehicles.reduce((sum, v) => sum + v.acquisitionCost, 0) > 0
    ? (((fleetTotalRevenue - fleetTotalOperationalCost) / vehicles.reduce((sum, v) => sum + v.acquisitionCost, 0)) * 100).toFixed(1)
    : '0';

  // 4. Monthly Revenue Stats Bar Graph (Mocked timeline of actual trips logged or standard months)
  const monthlyRevenueData = [
    { Month: 'May 2026', Revenue: 8500, Expenses: 3400 },
    { Month: 'June 2026', Revenue: 14200, Expenses: 6200 },
    { Month: 'July 2026', Revenue: Math.round(fleetTotalRevenue) || 5400, Expenses: Math.round(fleetTotalOperationalCost) || 2800 }
  ];

  // 5. Top Costliest Vehicles data
  const topCostliestVehicles = [...vehicleStats]
    .sort((a, b) => b.totalOperationalCost - a.totalOperationalCost)
    .slice(0, 5)
    .map(s => ({
      Vehicle: s.registrationNumber,
      'Operational Cost': s.totalOperationalCost,
      'Fuel Cost': s.totalFuelCost,
      'Maint Cost': s.totalMaintCost
    }));

  // ---------------------------------------------------------------------------
  // CSV Export Action
  // ---------------------------------------------------------------------------
  const handleExportCSV = () => {
    const headers = [
      'Registration Number',
      'Vehicle Model',
      'Type',
      'Acquisition Cost',
      'Trips Completed',
      'Total Distance (km)',
      'Calculated Revenue',
      'Fuel Liters Consumed',
      'Fuel Expenses',
      'Maintenance Expenses',
      'Total Operational Cost',
      'Fuel Efficiency (km/L)',
      'ROI Percentage'
    ];

    const rows = vehicleStats.map(s => [
      s.registrationNumber,
      `"${s.nameModel.replace(/"/g, '""')}"`,
      s.type,
      s.acquisitionCost,
      s.completedTripsCount,
      s.totalDistance,
      s.calculatedRevenue.toFixed(2),
      s.totalFuelLiters,
      s.totalFuelCost,
      s.totalMaintCost,
      s.totalOperationalCost,
      s.fuelEfficiency,
      s.roiPercentage
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map(e => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `transitops_fleet_analytics_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <h2 className="text-2xl font-display font-bold tracking-tight text-slate-900">Reports & Fleet Analytics</h2>
          <p className="text-sm text-slate-500 font-sans">Strategic profitability logs, fuel analytics, and asset depreciation.</p>
        </div>

        {canEdit && (
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm px-4 py-2.5 rounded-xl cursor-pointer shadow-xs transition-all"
          >
            <Download className="h-4 w-4" />
            <span>Export CSV</span>
          </button>
        )}
      </div>

      {!canEdit ? (
        <div className="bg-red-50 text-red-800 border border-red-100 rounded-xl p-4 flex gap-3">
          <ShieldAlert className="h-5 w-5 text-red-600 flex-shrink-0" />
          <p className="text-sm font-semibold">Access Restricted: Your current user role is blocked from viewing fleet analytics reports.</p>
        </div>
      ) : (
        <>
          {/* Top Fleet Summary Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Metric 1 */}
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold tracking-wider text-slate-500 uppercase">Fleet Fuel Efficiency</p>
                <Fuel className="h-5 w-5 text-blue-500" />
              </div>
              <h3 className="text-2xl font-bold font-display text-slate-900 mt-2">{fleetFuelEfficiency} <span className="text-xs text-slate-400 font-sans">km/L</span></h3>
              <p className="text-[10px] text-slate-400 mt-1">Total completed distance / Fuel liters</p>
            </div>

            {/* Metric 2 */}
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold tracking-wider text-slate-500 uppercase">Fleet Utilization</p>
                <Gauge className="h-5 w-5 text-blue-500" />
              </div>
              <h3 className="text-2xl font-bold font-display text-slate-900 mt-2">{fleetUtilization}%</h3>
              <p className="text-[10px] text-slate-400 mt-1">Active vs viable non-retired fleet</p>
            </div>

            {/* Metric 3 */}
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold tracking-wider text-slate-500 uppercase">Total Operational Cost</p>
                <DollarSign className="h-5 w-5 text-blue-500" />
              </div>
              <h3 className="text-2xl font-bold font-display text-slate-900 mt-2">
                {currency} {fleetTotalOperationalCost.toLocaleString()}
              </h3>
              <p className="text-[10px] text-slate-400 mt-1">Fuel + maintenance + route tolls</p>
            </div>

            {/* Metric 4 */}
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold tracking-wider text-slate-500 uppercase">Estimated Fleet ROI</p>
                <TrendingUp className="h-5 w-5 text-emerald-500" />
              </div>
              <h3 className={`text-2xl font-bold font-display mt-2 ${Number(overallFleetROI) >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                {overallFleetROI}%
              </h3>
              <p className="text-[10px] text-slate-400 mt-1">(Revenue - Expenses) / Asset cost</p>
            </div>
          </div>

          {/* Graphical Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Graph 1: Monthly Revenue vs Expenses */}
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs">
              <div className="flex items-center gap-2 mb-4">
                <BarChart3 className="h-5 w-5 text-blue-500" />
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Monthly Profitability Stats</h3>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyRevenueData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="Month" tickLine={false} axisLine={false} style={{ fontSize: 11, fill: '#64748b' }} />
                    <YAxis tickLine={false} axisLine={false} style={{ fontSize: 11, fill: '#64748b' }} />
                    <Tooltip cursor={{ fill: '#f8fafc' }} />
                    <Legend style={{ fontSize: 11 }} />
                    <Bar dataKey="Revenue" fill="#10b981" radius={[4, 4, 0, 0]} name={`Revenue (${currency})`} />
                    <Bar dataKey="Expenses" fill="#ef4444" radius={[4, 4, 0, 0]} name={`Expenses (${currency})`} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Graph 2: Top Costliest Vehicles */}
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs">
              <div className="flex items-center gap-2 mb-4">
                <Award className="h-5 w-5 text-blue-500" />
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Top 5 Costliest Fleet Vehicles</h3>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topCostliestVehicles} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="Vehicle" tickLine={false} axisLine={false} style={{ fontSize: 11, fill: '#64748b' }} />
                    <YAxis tickLine={false} axisLine={false} style={{ fontSize: 11, fill: '#64748b' }} />
                    <Tooltip cursor={{ fill: '#f8fafc' }} />
                    <Legend style={{ fontSize: 11 }} />
                    <Bar dataKey="Fuel Cost" fill="#f59e0b" radius={[4, 4, 0, 0]} stackId="a" />
                    <Bar dataKey="Maint Cost" fill="#3b82f6" radius={[4, 4, 0, 0]} stackId="a" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Vehicle ROI Detailed Table */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
            <div className="p-5 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Individual Fleet Asset Performance Logs</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 text-xs font-semibold tracking-wider">
                    <th className="py-2.5 px-4">Vehicle</th>
                    <th className="py-2.5 px-4">Acquisition Cost</th>
                    <th className="py-2.5 px-4 text-center">Distance Run</th>
                    <th className="py-2.5 px-4 text-center">Fuel Consumption</th>
                    <th className="py-2.5 px-4 text-center">Fuel Efficiency</th>
                    <th className="py-2.5 px-4 text-right">Maintenance Spent</th>
                    <th className="py-2.5 px-4 text-right">Total Operational</th>
                    <th className="py-2.5 px-4 text-right">Est. ROI</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {vehicleStats.map((s) => (
                    <tr key={s.registrationNumber} className="hover:bg-slate-50/40 text-xs">
                      <td className="py-3 px-4">
                        <div>
                          <span className="font-bold text-slate-900">{s.registrationNumber}</span>
                          <p className="text-[10px] text-slate-400">{s.nameModel}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-600">
                        {currency} {s.acquisitionCost.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-center font-mono text-slate-600">{s.totalDistance.toLocaleString()} km</td>
                      <td className="py-3 px-4 text-center font-mono text-slate-600">{s.totalFuelLiters} L</td>
                      <td className="py-3 px-4 text-center font-mono text-slate-700 font-bold">{s.fuelEfficiency} km/L</td>
                      <td className="py-3 px-4 text-right font-mono text-slate-600">
                        {currency} {s.totalMaintCost.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-slate-600 font-semibold">
                        {currency} {s.totalOperationalCost.toLocaleString()}
                      </td>
                      <td className={`py-3 px-4 text-right font-mono font-bold ${s.roiPercentage >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                        {s.roiPercentage}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
