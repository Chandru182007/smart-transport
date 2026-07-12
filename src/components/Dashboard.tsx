/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Activity,
  CheckCircle,
  AlertTriangle,
  MapPin,
  ClipboardList,
  Users,
  Gauge,
  SlidersHorizontal,
  ChevronRight
} from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { Vehicle, Driver, Trip } from '../types';
import { API } from '../api';

interface DashboardProps {
  currency: string;
}

export default function Dashboard({ currency }: DashboardProps) {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [filterType, setFilterType] = useState<string>('All');
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [filterRegion, setFilterRegion] = useState<string>('All');

  useEffect(() => {
    async function loadData() {
      try {
        const [vList, dList, tList] = await Promise.all([
          API.getVehicles(),
          API.getDrivers(),
          API.getTrips()
        ]);
        setVehicles(vList);
        setDrivers(dList);
        setTrips(tList);
      } catch (err) {
        console.error('Failed to load dashboard data', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // Get regions from vehicles dynamically
  const regions = ['All', ...Array.from(new Set(vehicles.map((v) => v.region).filter(Boolean)))];

  // Apply filters to vehicles
  const filteredVehicles = vehicles.filter((v) => {
    const typeMatch = filterType === 'All' || v.type === filterType;
    const statusMatch = filterStatus === 'All' || v.status === filterStatus;
    const regionMatch = filterRegion === 'All' || v.region === filterRegion;
    return typeMatch && statusMatch && regionMatch;
  });

  // Recalculate KPIs based on filtered vehicles and overall counts
  const activeVehicles = filteredVehicles.filter((v) => v.status === 'On Trip').length;
  const availableVehicles = filteredVehicles.filter((v) => v.status === 'Available').length;
  const maintenanceVehicles = filteredVehicles.filter((v) => v.status === 'In Shop').length;
  const retiredVehicles = filteredVehicles.filter((v) => v.status === 'Retired').length;

  const activeTrips = trips.filter((t) => t.status === 'Dispatched').length;
  const pendingTrips = trips.filter((t) => t.status === 'Draft').length;
  const driversOnDuty = drivers.filter((d) => d.status === 'On Trip' || d.status === 'Available').length;

  // Fleet Utilization = (Active Vehicles / Filtered Viable Vehicles) * 100
  const totalViable = filteredVehicles.filter((v) => v.status !== 'Retired').length;
  const fleetUtilization = totalViable > 0 ? Math.round((activeVehicles / totalViable) * 100) : 0;

  // Graph data 1: Vehicle Status Distribution
  const pieData = [
    { name: 'Available', value: availableVehicles, color: '#10b981' }, // emerald
    { name: 'On Trip', value: activeVehicles, color: '#6366f1' },      // indigo
    { name: 'In Shop', value: maintenanceVehicles, color: '#f59e0b' },  // amber
    { name: 'Retired', value: retiredVehicles, color: '#94a3b8' }      // slate
  ].filter((item) => item.value > 0);

  // Graph data 2: Fleet Types Capacity overview
  const typesData = ['Truck', 'Van', 'Bus', 'Car'].map(type => {
    const count = filteredVehicles.filter(v => v.type === type).length;
    return { name: type, Count: count };
  });

  // Recent trips list
  const recentTrips = [...trips].sort((a, b) => b.id.localeCompare(a.id)).slice(0, 5);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header with Title */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <h2 className="text-2xl font-display font-bold tracking-tight text-slate-900">Control Dashboard</h2>
          <p className="text-sm text-slate-500">Real-time status overview and operational metrics.</p>
        </div>

        {/* Dynamic Filters panel */}
        <div className="flex flex-wrap items-center gap-3 bg-white p-2 rounded-2xl border border-slate-100 shadow-xs">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 px-2 border-r border-slate-100">
            <SlidersHorizontal className="h-4 w-4 text-slate-400" />
            <span>Filters</span>
          </div>

          {/* Vehicle Type */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="text-xs font-medium bg-slate-50 hover:bg-slate-100 border-none rounded-lg px-2.5 py-1.5 focus:ring-1 focus:ring-indigo-500 focus:outline-hidden"
          >
            <option value="All">All Types</option>
            <option value="Truck">Truck</option>
            <option value="Van">Van</option>
            <option value="Bus">Bus</option>
            <option value="Car">Car</option>
          </select>

          {/* Vehicle Status */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="text-xs font-medium bg-slate-50 hover:bg-slate-100 border-none rounded-lg px-2.5 py-1.5 focus:ring-1 focus:ring-indigo-500 focus:outline-hidden"
          >
            <option value="All">All Statuses</option>
            <option value="Available">Available</option>
            <option value="On Trip">On Trip</option>
            <option value="In Shop">In Shop</option>
            <option value="Retired">Retired</option>
          </select>

          {/* Region */}
          <select
            value={filterRegion}
            onChange={(e) => setFilterRegion(e.target.value)}
            className="text-xs font-medium bg-slate-50 hover:bg-slate-100 border-none rounded-lg px-2.5 py-1.5 focus:ring-1 focus:ring-indigo-500 focus:outline-hidden"
          >
            {regions.map((region) => (
              <option key={region} value={region}>
                {region === 'All' ? 'All Regions' : region}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* KPI Card 1 */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
          <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Active Vehicles</p>
          <div className="flex items-baseline justify-between mt-2">
            <p className="text-3xl font-bold text-slate-900 font-display">{activeVehicles}</p>
            <span className="text-emerald-500 text-xs font-medium px-2 py-0.5 bg-emerald-50 rounded-full">On Trip</span>
          </div>
          <p className="text-slate-400 text-[10px] mt-1">Out of {totalViable} total fleet</p>
        </div>

        {/* KPI Card 2 */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
          <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Fleet Utilization</p>
          <div className="flex items-baseline justify-between mt-2">
            <p className="text-3xl font-bold text-slate-900 font-display">{fleetUtilization}%</p>
            <span className="text-blue-500 text-xs font-medium px-2 py-0.5 bg-blue-50 rounded-full">Optimal</span>
          </div>
          <div className="w-full bg-slate-100 h-1.5 mt-2.5 rounded-full">
            <div className="bg-blue-500 h-1.5 rounded-full transition-all duration-500" style={{ width: `${fleetUtilization}%` }}></div>
          </div>
        </div>

        {/* KPI Card 3 */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
          <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Drivers On Duty</p>
          <div className="flex items-baseline justify-between mt-2">
            <p className="text-3xl font-bold text-slate-900 font-display">{driversOnDuty}</p>
            <span className="text-slate-500 text-xs font-medium px-2 py-0.5 bg-slate-100 rounded-full">Available</span>
          </div>
          <p className="text-slate-400 text-[10px] mt-1">Ready for dispatch</p>
        </div>

        {/* KPI Card 4 */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
          <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Maintenance</p>
          <div className="flex items-baseline justify-between mt-2">
            <p className="text-3xl font-bold text-slate-900 font-display">{maintenanceVehicles}</p>
            <span className="text-amber-500 text-xs font-medium px-2 py-0.5 bg-amber-50 rounded-full">In Shop</span>
          </div>
          <p className="text-slate-400 text-[10px] mt-1">In diagnostics & service</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* KPI Card 5 */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="bg-slate-100 p-3 rounded-lg text-slate-600">
            <MapPin className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase">Active Trips</p>
            <h3 className="text-lg font-bold text-slate-900 mt-0.5">{activeTrips}</h3>
          </div>
        </div>

        {/* KPI Card 6 */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="bg-slate-100 p-3 rounded-lg text-slate-600">
            <ClipboardList className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase">Pending Trips (Draft)</p>
            <h3 className="text-lg font-bold text-slate-900 mt-0.5">{pendingTrips}</h3>
          </div>
        </div>

        {/* KPI Card 7 */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="bg-slate-100 p-3 rounded-lg text-slate-600">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase">Available Vehicles</p>
            <h3 className="text-lg font-bold text-slate-900 mt-0.5">{availableVehicles}</h3>
          </div>
        </div>
      </div>

      {/* Graphs and Recent Trips Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Graph 1: Vehicle Status Distribution */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs lg:col-span-1 flex flex-col">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4">Vehicle Status</h3>
          {pieData.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-xs text-slate-400">No matching status data</div>
          ) : (
            <div className="h-48 flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36} iconSize={10} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Graph 2: Vehicle Type Distribution */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs lg:col-span-2 flex flex-col">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4">Vehicles by Category</h3>
          <div className="h-48 flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={typesData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" tickLine={false} axisLine={false} style={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis allowDecimals={false} tickLine={false} axisLine={false} style={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip cursor={{ fill: '#f1f5f9' }} />
                <Bar dataKey="Count" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={36} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Trips Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Live Dispatched Vehicles</h3>
          <span className="text-xs font-semibold text-blue-600 flex items-center gap-1 cursor-pointer hover:underline">
            View Live Board <ChevronRight className="h-4 w-4" />
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs font-semibold tracking-wider">
                <th className="py-3 px-5 font-semibold">Vehicle ID</th>
                <th className="py-3 px-5 font-semibold">Route</th>
                <th className="py-3 px-5 font-semibold">Vehicle</th>
                <th className="py-3 px-5 font-semibold">Cargo Weight</th>
                <th className="py-3 px-5 font-semibold">Planned Dist.</th>
                <th className="py-3 px-5 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentTrips.map((trip) => {
                const statusColor =
                  trip.status === 'Completed'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                    : trip.status === 'Dispatched'
                    ? 'bg-blue-50 text-blue-700 border-blue-100'
                    : trip.status === 'Cancelled'
                    ? 'bg-red-50 text-red-700 border-red-100'
                    : 'bg-slate-50 text-slate-700 border-slate-100';

                return (
                  <tr key={trip.id} className="hover:bg-slate-50/50">
                    <td className="py-3.5 px-5 font-mono text-xs font-bold text-slate-900">{trip.id}</td>
                    <td className="py-3.5 px-5 font-medium text-slate-700">
                      {trip.source} <span className="text-slate-400 font-normal">→</span> {trip.destination}
                    </td>
                    <td className="py-3.5 px-5 font-mono text-xs text-slate-600">{trip.vehicleRegNo}</td>
                    <td className="py-3.5 px-5 text-slate-600">{trip.cargoWeight} kg</td>
                    <td className="py-3.5 px-5 text-slate-600">{trip.plannedDistance} km</td>
                    <td className="py-3.5 px-5">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${statusColor}`}>
                        {trip.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {recentTrips.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-slate-400">No trips found. Go to Trip Dispatcher to dispatch your first run!</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
