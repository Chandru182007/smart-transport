/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";

const app = express();
const PORT = 3000;

app.use(express.json());

const DB_DIR = path.join(process.cwd(), "data");
const DB_FILE = path.join(DB_DIR, "db.json");

// Helper to initialize db structure if empty
function initDB() {
  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }
  if (!fs.existsSync(DB_FILE)) {
    const defaultData = {
      vehicles: [
        { registrationNumber: "MH-12-TC-4501", nameModel: "BharatBenz 2823R Heavy Truck", type: "Truck", maxCapacity: 15000, odometer: 125000, acquisitionCost: 8500000, status: "On Trip", region: "Maharashtra" },
        { registrationNumber: "MH-12-QE-1022", nameModel: "Force Traveller T1 Van", type: "Van", maxCapacity: 1200, odometer: 45000, acquisitionCost: 1800000, status: "Available", region: "Maharashtra" },
        { registrationNumber: "KA-01-MY-9903", nameModel: "Ashok Leyland Airawat Bus", type: "Bus", maxCapacity: 5000, odometer: 180000, acquisitionCost: 6500000, status: "In Shop", region: "Karnataka" },
        { registrationNumber: "DL-3C-CB-1124", nameModel: "Maruti Suzuki Ertiga Tour M", type: "Car", maxCapacity: 400, odometer: 25000, acquisitionCost: 950000, status: "Retired", region: "Delhi NCR" }
      ],
      drivers: [
        { name: "Rajesh Kumar", licenseNumber: "MH-12-DL-1100", licenseCategory: "Class A Heavy", licenseExpiryDate: "2028-09-12", contactNumber: "+91-98765-43210", safetyScore: 98, status: "On Trip", tripsCompleted: 45 },
        { name: "Priya Sharma", licenseNumber: "MH-12-DL-2244", licenseCategory: "Class B Medium", licenseExpiryDate: "2027-04-18", contactNumber: "+91-91234-56789", safetyScore: 95, status: "Available", tripsCompleted: 30 },
        { name: "Amit Patel", licenseNumber: "KA-01-DL-3399", licenseCategory: "Class C Standard", licenseExpiryDate: "2026-02-15", contactNumber: "+91-88888-77777", safetyScore: 88, status: "Off Duty", tripsCompleted: 12 },
        { name: "Sandeep Singh", licenseNumber: "DL-03-DL-4488", licenseCategory: "Class A Heavy", licenseExpiryDate: "2027-11-30", contactNumber: "+91-77777-66666", safetyScore: 65, status: "Suspended", tripsCompleted: 18 }
      ],
      trips: [
        { id: "TRIP-101", source: "Mumbai Central Depot", destination: "Pune Logistics Hub", vehicleRegNo: "MH-12-TC-4501", driverLicenseNo: "MH-12-DL-1100", cargoWeight: 8500, plannedDistance: 150, status: "Dispatched", createdDate: "2026-07-11" },
        { id: "TRIP-102", source: "Thane Warehouse", destination: "Mumbai Central Depot", vehicleRegNo: "MH-12-QE-1022", driverLicenseNo: "MH-12-DL-2244", cargoWeight: 800, plannedDistance: 40, status: "Completed", createdDate: "2026-07-09", completedDate: "2026-07-09" },
        { id: "TRIP-103", source: "Delhi Depot", destination: "Gurugram Hub", vehicleRegNo: "MH-12-QE-1022", driverLicenseNo: "MH-12-DL-2244", cargoWeight: 300, plannedDistance: 35, status: "Draft", createdDate: "2026-07-10" }
      ],
      maintenanceLogs: [
        { id: "MNT-201", vehicleRegNo: "KA-01-MY-9903", serviceType: "Engine Overhaul", cost: 75000, date: "2026-07-10", status: "Active" },
        { id: "MNT-202", vehicleRegNo: "MH-12-QE-1022", serviceType: "General Servicing", cost: 4500, date: "2026-06-15", status: "Completed" }
      ],
      fuelLogs: [
        { id: "FUEL-301", vehicleRegNo: "MH-12-TC-4501", date: "2026-07-08", liters: 120, cost: 11000 },
        { id: "FUEL-302", vehicleRegNo: "MH-12-QE-1022", date: "2026-07-09", liters: 45, cost: 4100 }
      ],
      expenses: [
        { id: "EXP-401", tripId: "TRIP-102", vehicleRegNo: "MH-12-QE-1022", toll: 350, other: 150, maintLinked: false, total: 500, date: "2026-07-09", description: "Mumbai-Pune Expressway Toll" },
        { id: "EXP-402", vehicleRegNo: "MH-12-QE-1022", toll: 0, other: 0, maintLinked: true, total: 4500, date: "2026-06-15", description: "General Servicing Expense" }
      ],
      settings: {
        depotName: "Mumbai Central Dispatch Depot",
        currency: "INR",
        distanceLimit: 1000
      },
      rbac: [
        { role: "Fleet Manager", fleet: "yes", drivers: "yes", trips: "yes", fuelExp: "yes", analytics: "yes" },
        { role: "Driver", fleet: "view", drivers: "no", trips: "yes", fuelExp: "yes", analytics: "no" },
        { role: "Safety Officer", fleet: "view", drivers: "yes", trips: "view", fuelExp: "no", analytics: "view" },
        { role: "Financial Analyst", fleet: "view", drivers: "view", trips: "view", fuelExp: "yes", analytics: "yes" }
      ]
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(defaultData, null, 2), "utf8");
  }
}

function getDB() {
  initDB();
  const data = fs.readFileSync(DB_FILE, "utf8");
  return JSON.parse(data);
}

function saveDB(data: any) {
  initDB();
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf8");
}

// -----------------------------------------------------------------------------
// Authentication Endpoints
// -----------------------------------------------------------------------------
const USERS_LIST = [
  { email: "manager@transitops.com", password: "password", role: "Fleet Manager", name: "Sanjay Sen (Fleet Manager)" },
  { email: "driver@transitops.com", password: "password", role: "Driver", name: "Priya Sharma (Driver)" },
  { email: "safety@transitops.com", password: "password", role: "Safety Officer", name: "Sandeep Singh (Safety Officer)" },
  { email: "analyst@transitops.com", password: "password", role: "Financial Analyst", name: "Amit Patel (Financial Analyst)" }
];

app.post("/api/auth/login", (req, res) => {
  const { email, password, role } = req.body;
  const user = USERS_LIST.find(u => u.email === email && u.password === password && u.role === role);
  if (user) {
    res.json({ email: user.email, role: user.role, name: user.name });
  } else {
    res.status(401).json({ error: "Invalid credentials or role selection" });
  }
});

// -----------------------------------------------------------------------------
// Vehicle Endpoints
// -----------------------------------------------------------------------------
app.get("/api/vehicles", (req, res) => {
  const db = getDB();
  res.json(db.vehicles);
});

app.post("/api/vehicles", (req, res) => {
  const db = getDB();
  const { registrationNumber, nameModel, type, maxCapacity, odometer, acquisitionCost, status, region } = req.body;

  if (!registrationNumber || !nameModel || !type || !maxCapacity) {
    return res.status(400).json({ error: "Missing required vehicle fields" });
  }

  const normalizedReg = registrationNumber.trim().toUpperCase();
  const exists = db.vehicles.some((v: any) => v.registrationNumber.toUpperCase() === normalizedReg);
  if (exists) {
    return res.status(400).json({ error: "Vehicle with this registration number already exists" });
  }

  const newVehicle = {
    registrationNumber: normalizedReg,
    nameModel,
    type,
    maxCapacity: Number(maxCapacity),
    odometer: Number(odometer) || 0,
    acquisitionCost: Number(acquisitionCost) || 0,
    status: status || "Available",
    region: region || "General"
  };

  db.vehicles.push(newVehicle);
  saveDB(db);
  res.status(201).json(newVehicle);
});

app.put("/api/vehicles/:regNo", (req, res) => {
  const db = getDB();
  const regNo = req.params.regNo.toUpperCase();
  const index = db.vehicles.findIndex((v: any) => v.registrationNumber.toUpperCase() === regNo);

  if (index === -1) {
    return res.status(404).json({ error: "Vehicle not found" });
  }

  db.vehicles[index] = {
    ...db.vehicles[index],
    ...req.body,
    registrationNumber: regNo // preserve unique regNo
  };

  saveDB(db);
  res.json(db.vehicles[index]);
});

// -----------------------------------------------------------------------------
// Driver Endpoints
// -----------------------------------------------------------------------------
app.get("/api/drivers", (req, res) => {
  const db = getDB();
  res.json(db.drivers);
});

app.post("/api/drivers", (req, res) => {
  const db = getDB();
  const { name, licenseNumber, licenseCategory, licenseExpiryDate, contactNumber, safetyScore, status } = req.body;

  if (!name || !licenseNumber || !licenseExpiryDate) {
    return res.status(400).json({ error: "Missing required driver fields" });
  }

  const normalizedLic = licenseNumber.trim().toUpperCase();
  const exists = db.drivers.some((d: any) => d.licenseNumber.toUpperCase() === normalizedLic);
  if (exists) {
    return res.status(400).json({ error: "Driver with this license number already exists" });
  }

  const newDriver = {
    name,
    licenseNumber: normalizedLic,
    licenseCategory: licenseCategory || "Class C Standard",
    licenseExpiryDate,
    contactNumber: contactNumber || "",
    safetyScore: Number(safetyScore) ?? 100,
    status: status || "Available",
    tripsCompleted: 0
  };

  db.drivers.push(newDriver);
  saveDB(db);
  res.status(201).json(newDriver);
});

app.put("/api/drivers/:licenseNo", (req, res) => {
  const db = getDB();
  const licenseNo = req.params.licenseNo.toUpperCase();
  const index = db.drivers.findIndex((d: any) => d.licenseNumber.toUpperCase() === licenseNo);

  if (index === -1) {
    return res.status(404).json({ error: "Driver not found" });
  }

  db.drivers[index] = {
    ...db.drivers[index],
    ...req.body,
    licenseNumber: licenseNo // preserve key
  };

  saveDB(db);
  res.json(db.drivers[index]);
});

// -----------------------------------------------------------------------------
// Trip Management / Dispatcher Endpoints & Validation Rules
// -----------------------------------------------------------------------------
app.get("/api/trips", (req, res) => {
  const db = getDB();
  res.json(db.trips);
});

app.post("/api/trips", (req, res) => {
  const db = getDB();
  const { source, destination, vehicleRegNo, driverLicenseNo, cargoWeight, plannedDistance, status } = req.body;

  if (!source || !destination || !vehicleRegNo || !driverLicenseNo || !cargoWeight || !plannedDistance) {
    return res.status(400).json({ error: "All trip details are required (source, destination, vehicle, driver, cargo weight, planned distance)" });
  }

  // 1. Fetch Vehicle and Driver
  const vehicle = db.vehicles.find((v: any) => v.registrationNumber.toUpperCase() === vehicleRegNo.toUpperCase());
  const driver = db.drivers.find((d: any) => d.licenseNumber.toUpperCase() === driverLicenseNo.toUpperCase());

  if (!vehicle) {
    return res.status(400).json({ error: `Vehicle ${vehicleRegNo} does not exist.` });
  }
  if (!driver) {
    return res.status(400).json({ error: `Driver ${driverLicenseNo} does not exist.` });
  }

  // Mandatory Business Rules Validation:
  // - Retired or In Shop vehicles must never appear in dispatch selection
  if (vehicle.status === "Retired" || vehicle.status === "In Shop") {
    return res.status(400).json({ error: `Vehicle ${vehicleRegNo} is in status "${vehicle.status}" and cannot be dispatched.` });
  }

  // - Drivers with expired licenses or Suspended status cannot be assigned to trips
  if (driver.status === "Suspended") {
    return res.status(400).json({ error: `Driver ${driver.name} is currently Suspended.` });
  }

  const expiry = new Date(driver.licenseExpiryDate);
  const today = new Date();
  if (expiry < today) {
    return res.status(400).json({ error: `Driver ${driver.name} has an EXPIRED license (Expiry: ${driver.licenseExpiryDate}).` });
  }

  // - A driver or vehicle already marked On Trip cannot be assigned to another trip (only if we try to dispatch)
  const isDispatching = status === "Dispatched";
  if (isDispatching) {
    if (vehicle.status === "On Trip") {
      return res.status(400).json({ error: `Vehicle ${vehicleRegNo} is already assigned to another active trip.` });
    }
    if (driver.status === "On Trip") {
      return res.status(400).json({ error: `Driver ${driver.name} is already assigned to another active trip.` });
    }
  }

  // - Cargo Weight must not exceed the vehicle's maximum load capacity
  if (Number(cargoWeight) > vehicle.maxCapacity) {
    return res.status(400).json({ error: `Cargo Weight (${cargoWeight} kg) exceeds maximum capacity of ${vehicle.nameModel} (${vehicle.maxCapacity} kg).` });
  }

  const newTrip = {
    id: `TRIP-${Math.floor(100 + Math.random() * 900)}`,
    source,
    destination,
    vehicleRegNo: vehicle.registrationNumber,
    driverLicenseNo: driver.licenseNumber,
    cargoWeight: Number(cargoWeight),
    plannedDistance: Number(plannedDistance),
    status: status || "Draft",
    createdDate: new Date().toISOString().split("T")[0]
  };

  // If directly dispatching, change status of vehicle and driver
  if (isDispatching) {
    vehicle.status = "On Trip";
    driver.status = "On Trip";
  }

  db.trips.push(newTrip);
  saveDB(db);
  res.status(201).json(newTrip);
});

// Update trip status (Transition rules)
app.put("/api/trips/:id/status", (req, res) => {
  const db = getDB();
  const tripId = req.params.id;
  const { status, finalOdometer, fuelConsumedLiters, fuelCost } = req.body;

  const trip = db.trips.find((t: any) => t.id === tripId);
  if (!trip) {
    return res.status(404).json({ error: "Trip not found" });
  }

  const vehicle = db.vehicles.find((v: any) => v.registrationNumber.toUpperCase() === trip.vehicleRegNo.toUpperCase());
  const driver = db.drivers.find((d: any) => d.licenseNumber.toUpperCase() === trip.driverLicenseNo.toUpperCase());

  const prevStatus = trip.status;
  const nextStatus = status;

  if (prevStatus === nextStatus) {
    return res.json(trip);
  }

  // Business logic transitions:
  // 1. Dispatching a trip
  if (nextStatus === "Dispatched") {
    if (!vehicle || !driver) {
      return res.status(400).json({ error: "Associated vehicle or driver not found" });
    }
    if (vehicle.status === "On Trip") {
      return res.status(400).json({ error: "Vehicle is already assigned to an active trip" });
    }
    if (driver.status === "On Trip") {
      return res.status(400).json({ error: "Driver is already assigned to an active trip" });
    }
    if (driver.status === "Suspended" || new Date(driver.licenseExpiryDate) < new Date()) {
      return res.status(400).json({ error: "Driver has suspended or expired license." });
    }

    vehicle.status = "On Trip";
    driver.status = "On Trip";
  }

  // 2. Completing a trip
  if (nextStatus === "Completed") {
    if (!vehicle || !driver) {
      return res.status(400).json({ error: "Associated vehicle or driver not found" });
    }

    // Complete the trip by updating odometer and logging fuel if supplied
    if (finalOdometer) {
      const fOdo = Number(finalOdometer);
      if (fOdo < vehicle.odometer) {
        return res.status(400).json({ error: `Final odometer (${fOdo} km) cannot be less than current vehicle odometer (${vehicle.odometer} km)` });
      }
      vehicle.odometer = fOdo;
    } else {
      // Just add planned distance to odometer
      vehicle.odometer += Number(trip.plannedDistance);
    }

    // Restore vehicle and driver to Available
    vehicle.status = "Available";
    driver.status = "Available";
    driver.tripsCompleted += 1;
    trip.completedDate = new Date().toISOString().split("T")[0];

    // Log Fuel if supplied
    if (fuelConsumedLiters && fuelCost) {
      const newFuelLog = {
        id: `FUEL-${Math.floor(100 + Math.random() * 900)}`,
        vehicleRegNo: vehicle.registrationNumber,
        date: new Date().toISOString().split("T")[0],
        liters: Number(fuelConsumedLiters),
        cost: Number(fuelCost)
      };
      db.fuelLogs.push(newFuelLog);
    }
  }

  // 3. Cancelling a trip
  if (nextStatus === "Cancelled") {
    // Cancelling a dispatched trip restores the vehicle and driver to Available
    if (prevStatus === "Dispatched") {
      if (vehicle) vehicle.status = "Available";
      if (driver) driver.status = "Available";
    }
  }

  trip.status = nextStatus;
  saveDB(db);
  res.json(trip);
});

// -----------------------------------------------------------------------------
// Maintenance Endpoints
// -----------------------------------------------------------------------------
app.get("/api/maintenance", (req, res) => {
  const db = getDB();
  res.json(db.maintenanceLogs);
});

app.post("/api/maintenance", (req, res) => {
  const db = getDB();
  const { vehicleRegNo, serviceType, cost, date, status } = req.body;

  if (!vehicleRegNo || !serviceType || !cost || !date) {
    return res.status(400).json({ error: "Vehicle, Service Type, Cost, and Date are required." });
  }

  const vehicle = db.vehicles.find((v: any) => v.registrationNumber.toUpperCase() === vehicleRegNo.toUpperCase());
  if (!vehicle) {
    return res.status(400).json({ error: `Vehicle ${vehicleRegNo} not found.` });
  }

  const newLog = {
    id: `MNT-${Math.floor(100 + Math.random() * 900)}`,
    vehicleRegNo: vehicle.registrationNumber,
    serviceType,
    cost: Number(cost),
    date,
    status: status ? "Completed" : "Active"
  };

  // Creating an active maintenance record automatically changes vehicle status to In Shop
  if (newLog.status === "Active") {
    vehicle.status = "In Shop";
  }

  // Also record this as a direct operational expense
  const newExpense = {
    id: `EXP-${Math.floor(100 + Math.random() * 900)}`,
    vehicleRegNo: vehicle.registrationNumber,
    toll: 0,
    other: 0,
    maintLinked: true,
    total: Number(cost),
    date,
    description: `Maintenance: ${serviceType}`
  };
  db.expenses.push(newExpense);

  db.maintenanceLogs.push(newLog);
  saveDB(db);
  res.status(201).json(newLog);
});

app.put("/api/maintenance/:id/close", (req, res) => {
  const db = getDB();
  const logId = req.params.id;
  const log = db.maintenanceLogs.find((m: any) => m.id === logId);

  if (!log) {
    return res.status(404).json({ error: "Maintenance log not found" });
  }

  if (log.status === "Completed") {
    return res.status(400).json({ error: "Maintenance log is already closed." });
  }

  log.status = "Completed";

  // Closing maintenance restores the vehicle to Available (unless retired)
  const vehicle = db.vehicles.find((v: any) => v.registrationNumber.toUpperCase() === log.vehicleRegNo.toUpperCase());
  if (vehicle && vehicle.status === "In Shop") {
    vehicle.status = "Available";
  }

  saveDB(db);
  res.json(log);
});

// -----------------------------------------------------------------------------
// Fuel & Expense Management Endpoints
// -----------------------------------------------------------------------------
app.get("/api/fuel-expenses", (req, res) => {
  const db = getDB();
  res.json({
    fuelLogs: db.fuelLogs,
    expenses: db.expenses
  });
});

app.post("/api/fuel", (req, res) => {
  const db = getDB();
  const { vehicleRegNo, date, liters, cost } = req.body;

  if (!vehicleRegNo || !date || !liters || !cost) {
    return res.status(400).json({ error: "Vehicle, Date, Liters, and Fuel Cost are required." });
  }

  const vehicle = db.vehicles.find((v: any) => v.registrationNumber.toUpperCase() === vehicleRegNo.toUpperCase());
  if (!vehicle) {
    return res.status(400).json({ error: `Vehicle ${vehicleRegNo} not found.` });
  }

  const newFuel = {
    id: `FUEL-${Math.floor(100 + Math.random() * 900)}`,
    vehicleRegNo: vehicle.registrationNumber,
    date,
    liters: Number(liters),
    cost: Number(cost)
  };

  db.fuelLogs.push(newFuel);
  saveDB(db);
  res.status(201).json(newFuel);
});

app.post("/api/expense", (req, res) => {
  const db = getDB();
  const { tripId, vehicleRegNo, toll, other, description, date } = req.body;

  if (!vehicleRegNo || !date || (!toll && !other)) {
    return res.status(400).json({ error: "Vehicle, Date, and Toll or Other expense amounts are required." });
  }

  const vehicle = db.vehicles.find((v: any) => v.registrationNumber.toUpperCase() === vehicleRegNo.toUpperCase());
  if (!vehicle) {
    return res.status(400).json({ error: `Vehicle ${vehicleRegNo} not found.` });
  }

  const tVal = Number(toll) || 0;
  const oVal = Number(other) || 0;

  const newExpense = {
    id: `EXP-${Math.floor(100 + Math.random() * 900)}`,
    tripId: tripId || undefined,
    vehicleRegNo: vehicle.registrationNumber,
    toll: tVal,
    other: oVal,
    maintLinked: false,
    total: tVal + oVal,
    date,
    description: description || "Miscellaneous Route Expense"
  };

  db.expenses.push(newExpense);
  saveDB(db);
  res.status(201).json(newExpense);
});

// -----------------------------------------------------------------------------
// Settings & RBAC rules Endpoint
// -----------------------------------------------------------------------------
app.get("/api/settings", (req, res) => {
  const db = getDB();
  res.json({
    settings: db.settings,
    rbac: db.rbac
  });
});

app.post("/api/settings", (req, res) => {
  const db = getDB();
  const { depotName, currency, distanceLimit } = req.body;

  if (depotName !== undefined) db.settings.depotName = depotName;
  if (currency !== undefined) db.settings.currency = currency;
  if (distanceLimit !== undefined) db.settings.distanceLimit = Number(distanceLimit);

  saveDB(db);
  res.json({ settings: db.settings, rbac: db.rbac });
});

// -----------------------------------------------------------------------------
// Unified Dashboard / Analytics Endpoint
// -----------------------------------------------------------------------------
app.get("/api/dashboard", (req, res) => {
  const db = getDB();

  // Active Vehicles = currently On Trip
  const activeVehicles = db.vehicles.filter((v: any) => v.status === "On Trip").length;
  // Available
  const availableVehicles = db.vehicles.filter((v: any) => v.status === "Available").length;
  // Maintenance
  const maintenanceVehicles = db.vehicles.filter((v: any) => v.status === "In Shop").length;
  // Active Trips
  const activeTrips = db.trips.filter((t: any) => t.status === "Dispatched").length;
  // Pending Trips
  const pendingTrips = db.trips.filter((t: any) => t.status === "Draft").length;
  // Drivers On Duty (On Trip or Available)
  const driversOnDuty = db.drivers.filter((d: any) => d.status === "On Trip" || d.status === "Available").length;

  // Fleet Utilization = (Active Vehicles / (Total Vehicles - Retired)) * 100
  const totalViable = db.vehicles.filter((v: any) => v.status !== "Retired").length;
  const fleetUtilization = totalViable > 0 ? Math.round((activeVehicles / totalViable) * 100) : 0;

  // Recent trips
  const recentTrips = [...db.trips].sort((a: any, b: any) => b.id.localeCompare(a.id)).slice(0, 5);

  res.json({
    stats: {
      activeVehicles,
      availableVehicles,
      maintenanceVehicles,
      activeTrips,
      pendingTrips,
      driversOnDuty,
      fleetUtilization
    },
    recentTrips
  });
});

// -----------------------------------------------------------------------------
// Vite and Static serving setup
// -----------------------------------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`TransitOps server running on http://localhost:${PORT}`);
  });
}

startServer();
