/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Play, CheckCircle2, XCircle, FileText, ArrowRight, Activity, Plus, ShieldCheck, BadgeAlert } from 'lucide-react';
import { Vehicle, Driver, Trip, RBACRule } from '../types';
import { API } from '../api';

interface TripDispatcherProps {
  rbacRule?: RBACRule;
  currency: string;
}

export default function TripDispatcher({ rbacRule, currency }: TripDispatcherProps) {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [source, setSource] = useState('');
  const [destination, setDestination] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState('');
  const [selectedDriver, setSelectedDriver] = useState('');
  const [cargoWeight, setCargoWeight] = useState('');
  const [plannedDistance, setPlannedDistance] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  // Completion modal state
  const [completingTrip, setCompletingTrip] = useState<Trip | null>(null);
  const [finalOdometer, setFinalOdometer] = useState('');
  const [fuelConsumed, setFuelConsumed] = useState('');
  const [fuelCost, setFuelCost] = useState('');
  const [completeError, setCompleteError] = useState<string | null>(null);

  const canEdit = rbacRule?.trips === 'yes';

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
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
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  // Filter available vehicles (Available status, not In Shop, not Retired)
  const availableVehiclesList = vehicles.filter(v => v.status === 'Available');

  // Filter available drivers (Available status, not Suspended, and unexpired license)
  const availableDriversList = drivers.filter(d => {
    const isSuspended = d.status === 'Suspended';
    const isExpired = new Date(d.licenseExpiryDate) < new Date();
    return d.status === 'Available' && !isSuspended && !isExpired;
  });

  const handleCreateTrip = async (status: 'Draft' | 'Dispatched') => {
    setFormError(null);
    setFormSuccess(null);

    if (!source.trim() || !destination.trim() || !selectedVehicle || !selectedDriver || !cargoWeight || !plannedDistance) {
      setFormError('All fields are required to create/dispatch a trip.');
      return;
    }

    // Check capacity locally first
    const vehicleObj = vehicles.find(v => v.registrationNumber === selectedVehicle);
    if (vehicleObj && Number(cargoWeight) > vehicleObj.maxCapacity) {
      setFormError(`Cargo Weight (${cargoWeight} kg) exceeds ${vehicleObj.nameModel} capacity (${vehicleObj.maxCapacity} kg).`);
      return;
    }

    try {
      await API.createTrip({
        source,
        destination,
        vehicleRegNo: selectedVehicle,
        driverLicenseNo: selectedDriver,
        cargoWeight: Number(cargoWeight),
        plannedDistance: Number(plannedDistance),
        status
      });

      setFormSuccess(status === 'Dispatched' ? 'Trip successfully dispatched!' : 'Trip request saved as draft.');
      // Reset form
      setSource('');
      setDestination('');
      setSelectedVehicle('');
      setSelectedDriver('');
      setCargoWeight('');
      setPlannedDistance('');
      loadData();
    } catch (err: any) {
      setFormError(err.message || 'Failed to dispatch trip');
    }
  };

  const handleCancelTrip = async (tripId: string) => {
    if (!canEdit) return;
    try {
      await API.updateTripStatus(tripId, { status: 'Cancelled' });
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to cancel trip');
    }
  };

  const handleOpenCompleteModal = (trip: Trip) => {
    setCompletingTrip(trip);
    const v = vehicles.find(veh => veh.registrationNumber === trip.vehicleRegNo);
    setFinalOdometer(v ? String(v.odometer + trip.plannedDistance) : '');
    setFuelConsumed('');
    setFuelCost('');
    setCompleteError(null);
  };

  const handleConfirmComplete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!completingTrip) return;
    setCompleteError(null);

    const fOdo = Number(finalOdometer);
    const v = vehicles.find(veh => veh.registrationNumber === completingTrip.vehicleRegNo);
    if (v && fOdo < v.odometer) {
      setCompleteError(`Final Odometer must be greater than current vehicle odometer (${v.odometer} km)`);
      return;
    }

    try {
      await API.updateTripStatus(completingTrip.id, {
        status: 'Completed',
        finalOdometer: fOdo,
        fuelConsumedLiters: Number(fuelConsumed) || undefined,
        fuelCost: Number(fuelCost) || undefined
      });

      setCompletingTrip(null);
      loadData();
    } catch (err: any) {
      setCompleteError(err.message || 'Failed to complete trip');
    }
  };

  const dispatchedTrips = trips.filter(t => t.status === 'Dispatched');
  const draftTrips = trips.filter(t => t.status === 'Draft');

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="border-b border-slate-100 pb-5">
        <h2 className="text-2xl font-display font-bold tracking-tight text-slate-900">Trip Dispatcher</h2>
        <p className="text-sm text-slate-500 font-sans">Dispatch drivers and track transport lifecycles.</p>
      </div>

      {/* Trip Lifecycle Visualization */}
      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs">
        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">Trip Request Lifecycle</h3>
        <div className="grid grid-cols-4 gap-4 text-center">
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
            <span className="font-mono text-xs font-bold text-slate-400">01</span>
            <p className="text-sm font-semibold text-slate-700 mt-1">Draft</p>
            <p className="text-[10px] text-slate-500 mt-0.5">Under planning</p>
          </div>
          <div className="bg-blue-50/50 p-3.5 rounded-xl border border-blue-100/50">
            <span className="font-mono text-xs font-bold text-blue-500">02</span>
            <p className="text-sm font-semibold text-blue-700 mt-1">Dispatched</p>
            <p className="text-[10px] text-blue-500/80 mt-0.5">Active on road</p>
          </div>
          <div className="bg-emerald-50/50 p-3.5 rounded-xl border border-emerald-100/50">
            <span className="font-mono text-xs font-bold text-emerald-600">03</span>
            <p className="text-sm font-semibold text-emerald-800 mt-1">Completed</p>
            <p className="text-[10px] text-emerald-600/80 mt-0.5">Returned safe</p>
          </div>
          <div className="bg-red-50/50 p-3.5 rounded-xl border border-red-100/50">
            <span className="font-mono text-xs font-bold text-red-500">04</span>
            <p className="text-sm font-semibold text-red-800 mt-1">Cancelled</p>
            <p className="text-[10px] text-red-500/80 mt-0.5">Terminated</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Dispatch Initiation Form */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs lg:col-span-5">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="h-5 w-5 text-blue-500" />
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Create Trip Request (TRI)</h3>
          </div>

          {!canEdit ? (
            <div className="p-4 bg-slate-50 text-slate-500 rounded-xl text-xs flex gap-2">
              <BadgeAlert className="h-5 w-5 text-slate-400 flex-shrink-0" />
              <span>Your current user role is view-only for trips. Dispatch and Draft saves are restricted.</span>
            </div>
          ) : (
            <div className="space-y-4">
              {formError && (
                <div className="p-3 bg-red-50 text-red-700 text-xs font-semibold rounded-xl border-l-4 border-red-500">
                  {formError}
                </div>
              )}
              {formSuccess && (
                <div className="p-3 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-xl border-l-4 border-emerald-500">
                  {formSuccess}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Source Depot / Address</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mumbai Central Depot"
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                  className="block w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Destination Address</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Pune Logistics Hub"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="block w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Select Vehicle</label>
                  <select
                    value={selectedVehicle}
                    onChange={(e) => setSelectedVehicle(e.target.value)}
                    className="block w-full border border-slate-200 bg-white rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  >
                    <option value="">-- Choose --</option>
                    {availableVehiclesList.map(v => (
                      <option key={v.registrationNumber} value={v.registrationNumber}>
                        {v.registrationNumber} ({v.nameModel} - max {v.maxCapacity}kg)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Select Driver</label>
                  <select
                    value={selectedDriver}
                    onChange={(e) => setSelectedDriver(e.target.value)}
                    className="block w-full border border-slate-200 bg-white rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  >
                    <option value="">-- Choose --</option>
                    {availableDriversList.map(d => (
                      <option key={d.licenseNumber} value={d.licenseNumber}>
                        {d.name} ({d.licenseCategory})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Cargo Weight (kg)</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 450"
                    value={cargoWeight}
                    onChange={(e) => setCargoWeight(e.target.value)}
                    className="block w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Planned Distance (km)</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 500"
                    value={plannedDistance}
                    onChange={(e) => setPlannedDistance(e.target.value)}
                    className="block w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => handleCreateTrip('Draft')}
                  className="flex-1 py-2 px-4 border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-50 cursor-pointer transition-colors"
                >
                  Save Draft
                </button>
                <button
                  type="button"
                  onClick={() => handleCreateTrip('Dispatched')}
                  className="flex-1 py-2 px-4 bg-blue-600 hover:bg-blue-500 rounded-xl text-sm font-semibold text-white cursor-pointer shadow-xs transition-colors flex items-center justify-center gap-2"
                >
                  <Play className="h-4 w-4" />
                  <span>Dispatch Run</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Live Boards - Dispatched Vehicles */}
        <div className="space-y-4 lg:col-span-7">
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-50">
              <div className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-blue-500 animate-pulse" />
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Live Board: Active Runs</h3>
              </div>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
                {dispatchedTrips.length} Dispatched
              </span>
            </div>

            <div className="space-y-4 max-h-[360px] overflow-y-auto">
              {dispatchedTrips.map(trip => {
                const driverObj = drivers.find(d => d.licenseNumber === trip.driverLicenseNo);
                const vehicleObj = vehicles.find(v => v.registrationNumber === trip.vehicleRegNo);

                return (
                  <div key={trip.id} className="p-4 border border-slate-100 rounded-xl hover:border-blue-100 transition-all bg-slate-50/40">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-xs font-bold bg-slate-900 text-white px-2 py-0.5 rounded-md">{trip.id}</span>
                      <div className="flex gap-2">
                        {canEdit && (
                          <>
                            <button
                              onClick={() => handleCancelTrip(trip.id)}
                              className="text-xs font-semibold text-red-600 hover:text-red-700 border border-red-200 hover:bg-red-50 rounded-lg px-2.5 py-1 cursor-pointer transition-colors"
                            >
                              Abort
                            </button>
                            <button
                              onClick={() => handleOpenCompleteModal(trip)}
                              className="text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg px-2.5 py-1 cursor-pointer shadow-xs transition-colors"
                            >
                              Complete
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <p className="text-slate-400 font-medium uppercase tracking-wider text-[10px]">Route Path</p>
                        <p className="font-semibold text-slate-800 mt-0.5 flex items-center gap-1">
                          {trip.source} <ArrowRight className="h-3 w-3 text-slate-400" /> {trip.destination}
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-400 font-medium uppercase tracking-wider text-[10px]">Payload & Distance</p>
                        <p className="font-semibold text-slate-800 mt-0.5">
                          {trip.cargoWeight} kg / {trip.plannedDistance} km
                        </p>
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-slate-100/60 grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <p className="text-slate-400 text-[10px]">Assigned Vehicle</p>
                        <p className="font-semibold text-slate-700">{vehicleObj?.nameModel || trip.vehicleRegNo}</p>
                      </div>
                      <div>
                        <p className="text-slate-400 text-[10px]">Operator on Duty</p>
                        <p className="font-semibold text-slate-700">{driverObj?.name || trip.driverLicenseNo}</p>
                      </div>
                    </div>
                  </div>
                );
              })}

              {dispatchedTrips.length === 0 && (
                <div className="text-center py-12 text-slate-400 text-sm">
                  No active runs currently on road. Use the dispatch form to launch a vehicle.
                </div>
              )}
            </div>
          </div>

          {/* Drafted Trips Table */}
          {draftTrips.length > 0 && (
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs">
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Saved Drafts</h3>
              <div className="space-y-2">
                {draftTrips.map(draft => (
                  <div key={draft.id} className="flex items-center justify-between p-3 border border-slate-50 rounded-xl bg-slate-50/20 text-xs">
                    <div>
                      <span className="font-mono font-bold text-slate-700">{draft.id}</span>
                      <p className="text-slate-600 font-medium mt-0.5">{draft.source} → {draft.destination}</p>
                    </div>
                    {canEdit && (
                      <button
                        onClick={() => {
                          // Copy draft fields back to form for editing/dispatching
                          setSource(draft.source);
                          setDestination(draft.destination);
                          setSelectedVehicle(draft.vehicleRegNo);
                          setSelectedDriver(draft.driverLicenseNo);
                          setCargoWeight(String(draft.cargoWeight));
                          setPlannedDistance(String(draft.plannedDistance));
                        }}
                        className="text-xs font-semibold text-blue-600 hover:underline cursor-pointer"
                      >
                        Load Draft
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Completion Dialog / Modal */}
      {completingTrip && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xl max-w-md w-full animate-fadeIn">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-blue-500" />
              <span>Complete Active Run</span>
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Finalizing trip {completingTrip.id}. Record latest asset odometer and any fuel consumed.
            </p>

            <form onSubmit={handleConfirmComplete} className="mt-4 space-y-4">
              {completeError && (
                <div className="p-3 bg-red-50 text-red-700 text-xs font-semibold rounded-lg">
                  {completeError}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Final Odometer (km)</label>
                <input
                  type="number"
                  required
                  placeholder="e.g. 125450"
                  value={finalOdometer}
                  onChange={(e) => setFinalOdometer(e.target.value)}
                  className="block w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Fuel Consumed (Liters)</label>
                  <input
                    type="number"
                    placeholder="e.g. 45"
                    value={fuelConsumed}
                    onChange={(e) => setFuelConsumed(e.target.value)}
                    className="block w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Fuel Cost ({currency})</label>
                  <input
                    type="number"
                    placeholder="e.g. 150"
                    value={fuelCost}
                    onChange={(e) => setFuelCost(e.target.value)}
                    className="block w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setCompletingTrip(null)}
                  className="px-4 py-2 text-sm font-semibold text-slate-500 hover:text-slate-700 hover:bg-slate-50 rounded-xl cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-xl cursor-pointer shadow-xs transition-colors"
                >
                  Confirm Completion
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
