/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Vehicle, Driver, Trip, MaintenanceLog, FuelLog, Expense, DepotSettings, RBACRule } from './types';

export const API = {
  async getDashboard() {
    const res = await fetch('/api/dashboard');
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  async getVehicles(): Promise<Vehicle[]> {
    const res = await fetch('/api/vehicles');
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  async addVehicle(vehicle: Partial<Vehicle>): Promise<Vehicle> {
    const res = await fetch('/api/vehicles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(vehicle),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to add vehicle');
    }
    return res.json();
  },

  async updateVehicle(regNo: string, vehicle: Partial<Vehicle>): Promise<Vehicle> {
    const res = await fetch(`/api/vehicles/${regNo}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(vehicle),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to update vehicle');
    }
    return res.json();
  },

  async getDrivers(): Promise<Driver[]> {
    const res = await fetch('/api/drivers');
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  async addDriver(driver: Partial<Driver>): Promise<Driver> {
    const res = await fetch('/api/drivers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(driver),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to add driver');
    }
    return res.json();
  },

  async updateDriver(licenseNo: string, driver: Partial<Driver>): Promise<Driver> {
    const res = await fetch(`/api/drivers/${licenseNo}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(driver),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to update driver');
    }
    return res.json();
  },

  async getTrips(): Promise<Trip[]> {
    const res = await fetch('/api/trips');
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  async createTrip(trip: Partial<Trip>): Promise<Trip> {
    const res = await fetch('/api/trips', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(trip),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to create trip');
    }
    return res.json();
  },

  async updateTripStatus(tripId: string, payload: {
    status: string;
    finalOdometer?: number;
    fuelConsumedLiters?: number;
    fuelCost?: number;
  }): Promise<Trip> {
    const res = await fetch(`/api/trips/${tripId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to update trip status');
    }
    return res.json();
  },

  async getMaintenance(): Promise<MaintenanceLog[]> {
    const res = await fetch('/api/maintenance');
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  async addMaintenance(log: Partial<MaintenanceLog>): Promise<MaintenanceLog> {
    const res = await fetch('/api/maintenance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(log),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to add maintenance record');
    }
    return res.json();
  },

  async closeMaintenance(logId: string): Promise<MaintenanceLog> {
    const res = await fetch(`/api/maintenance/${logId}/close`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to close maintenance');
    }
    return res.json();
  },

  async getFuelExpenses(): Promise<{ fuelLogs: FuelLog[]; expenses: Expense[] }> {
    const res = await fetch('/api/fuel-expenses');
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  async logFuel(fuel: Partial<FuelLog>): Promise<FuelLog> {
    const res = await fetch('/api/fuel', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(fuel),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to log fuel');
    }
    return res.json();
  },

  async addExpense(expense: Partial<Expense>): Promise<Expense> {
    const res = await fetch('/api/expense', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(expense),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to add expense');
    }
    return res.json();
  },

  async getSettings(): Promise<{ settings: DepotSettings; rbac: RBACRule[] }> {
    const res = await fetch('/api/settings');
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  async updateSettings(settings: Partial<DepotSettings>): Promise<{ settings: DepotSettings; rbac: RBACRule[] }> {
    const res = await fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to save settings');
    }
    return res.json();
  },
};
