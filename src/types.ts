/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = 'Fleet Manager' | 'Driver' | 'Safety Officer' | 'Financial Analyst';

export interface User {
  email: string;
  role: UserRole;
  name: string;
}

export type VehicleStatus = 'Available' | 'On Trip' | 'In Shop' | 'Retired';

export interface Vehicle {
  registrationNumber: string; // Unique
  nameModel: string;
  type: 'Truck' | 'Van' | 'Bus' | 'Car';
  maxCapacity: number; // in kg
  odometer: number; // in km
  acquisitionCost: number;
  status: VehicleStatus;
  region: string;
}

export type DriverStatus = 'Available' | 'On Trip' | 'Off Duty' | 'Suspended';

export interface Driver {
  name: string;
  licenseNumber: string; // Unique
  licenseCategory: string;
  licenseExpiryDate: string; // YYYY-MM-DD
  contactNumber: string;
  safetyScore: number; // 0 - 100
  status: DriverStatus;
  tripsCompleted: number;
}

export type TripStatus = 'Draft' | 'Dispatched' | 'Completed' | 'Cancelled';

export interface Trip {
  id: string;
  source: string;
  destination: string;
  vehicleRegNo: string;
  driverLicenseNo: string;
  cargoWeight: number; // in kg
  plannedDistance: number; // in km
  status: TripStatus;
  createdDate: string;
  completedDate?: string;
}

export interface MaintenanceLog {
  id: string;
  vehicleRegNo: string;
  serviceType: string;
  cost: number;
  date: string;
  status: 'Active' | 'Completed';
}

export interface FuelLog {
  id: string;
  vehicleRegNo: string;
  date: string;
  liters: number;
  cost: number;
}

export interface Expense {
  id: string;
  tripId?: string;
  vehicleRegNo: string;
  toll: number;
  other: number;
  maintLinked: boolean;
  total: number;
  date: string;
  description: string;
}

export interface DepotSettings {
  depotName: string;
  currency: string;
  distanceLimit: number; // in km
}

export interface RBACRule {
  role: UserRole;
  fleet: 'yes' | 'no' | 'view';
  drivers: 'yes' | 'no' | 'view';
  trips: 'yes' | 'no' | 'view';
  fuelExp: 'yes' | 'no' | 'view';
  analytics: 'yes' | 'no' | 'view';
}
