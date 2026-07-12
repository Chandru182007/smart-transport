/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import VehicleRegistry from './components/VehicleRegistry';
import DriversTab from './components/DriversTab';
import TripDispatcher from './components/TripDispatcher';
import MaintenanceTab from './components/MaintenanceTab';
import FuelExpenseTab from './components/FuelExpenseTab';
import ReportsAnalyticsTab from './components/ReportsAnalyticsTab';
import SettingsTab from './components/SettingsTab';
import AboutUsTab from './components/AboutUsTab';
import { User, DepotSettings, RBACRule } from './types';
import { API } from './api';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [currentTab, setTab] = useState('dashboard');
  const [depotSettings, setDepotSettings] = useState<DepotSettings>({
    depotName: 'Mumbai Central Dispatch Depot',
    currency: 'INR',
    distanceLimit: 1000
  });
  const [rbacRules, setRbacRules] = useState<RBACRule[]>([
    { role: "Fleet Manager", fleet: "yes", drivers: "yes", trips: "yes", fuelExp: "yes", analytics: "yes" },
    { role: "Driver", fleet: "view", drivers: "no", trips: "yes", fuelExp: "yes", analytics: "no" },
    { role: "Safety Officer", fleet: "view", drivers: "yes", trips: "view", fuelExp: "no", analytics: "view" },
    { role: "Financial Analyst", fleet: "view", drivers: "view", trips: "view", fuelExp: "yes", analytics: "yes" }
  ]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Restore session
    const storedUser = localStorage.getItem('transitops_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (err) {
        console.error(err);
      }
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (user) {
      loadSettings();
    }
  }, [user]);

  const loadSettings = async () => {
    try {
      const data = await API.getSettings();
      setDepotSettings(data.settings);
      setRbacRules(data.rbac);
    } catch (err) {
      console.error('Failed to load settings', err);
    }
  };

  const handleUpdateSettings = async (updated: Partial<DepotSettings>) => {
    try {
      const res = await API.updateSettings(updated);
      setDepotSettings(res.settings);
    } catch (err) {
      console.error(err);
    }
  };

  const handleLoginSuccess = (loggedInUser: User) => {
    setUser(loggedInUser);
    localStorage.setItem('transitops_user', JSON.stringify(loggedInUser));
  };

  const handleLogout = () => {
    setUser(null);
    setTab('dashboard');
    localStorage.removeItem('transitops_user');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // If user is not authenticated, force login view
  if (!user) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  // Map currency code to symbol
  const getCurrencySymbol = (code: string) => {
    switch (code) {
      case 'USD': return '$';
      case 'EUR': return '€';
      case 'INR': return '₹';
      case 'GBP': return '£';
      case 'AUD': return 'A$';
      default: return '$';
    }
  };

  const currencySymbol = getCurrencySymbol(depotSettings.currency);
  const currentRule = rbacRules.find(r => r.role === user.role);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 font-sans">
      {/* Dynamic Navigation Sidebar */}
      <Navbar
        user={user}
        currentTab={currentTab}
        setTab={setTab}
        rbacRules={rbacRules}
        depotName={depotSettings.depotName}
        onLogout={handleLogout}
      />

      {/* Main Content Workspace viewport */}
      <main className="flex-1 overflow-y-auto px-8 py-6 bg-slate-50">
        {currentTab === 'dashboard' && <Dashboard currency={currencySymbol} />}
        {currentTab === 'vehicles' && <VehicleRegistry rbacRule={currentRule} currency={currencySymbol} />}
        {currentTab === 'drivers' && <DriversTab rbacRule={currentRule} />}
        {currentTab === 'trips' && <TripDispatcher rbacRule={currentRule} currency={currencySymbol} />}
        {currentTab === 'maintenance' && <MaintenanceTab rbacRule={currentRule} currency={currencySymbol} />}
        {currentTab === 'fuel-expenses' && <FuelExpenseTab rbacRule={currentRule} currency={currencySymbol} />}
        {currentTab === 'analytics' && <ReportsAnalyticsTab rbacRule={currentRule} currency={currencySymbol} />}
        {currentTab === 'settings' && (
          <SettingsTab
            user={user}
            rbacRules={rbacRules}
            depotSettings={depotSettings}
            onUpdateSettings={handleUpdateSettings}
          />
        )}
        {currentTab === 'about-us' && <AboutUsTab />}
      </main>
    </div>
  );
}
