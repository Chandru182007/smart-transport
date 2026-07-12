/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  LayoutDashboard,
  Truck,
  Users,
  MapPin,
  Wrench,
  Fuel,
  BarChart3,
  Settings as SettingsIcon,
  LogOut,
  ShieldAlert,
  Train,
  Info
} from 'lucide-react';
import { User, RBACRule } from '../types';

interface NavbarProps {
  user: User;
  currentTab: string;
  setTab: (tab: string) => void;
  rbacRules: RBACRule[];
  depotName: string;
  onLogout: () => void;
}

export default function Navbar({ user, currentTab, setTab, rbacRules, depotName, onLogout }: NavbarProps) {
  const currentRule = rbacRules.find(r => r.role === user.role);

  const checkPermission = (key: keyof RBACRule) => {
    if (!currentRule) return false;
    const val = currentRule[key];
    return val !== 'no';
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, permitted: true },
    { id: 'vehicles', label: 'Vehicle Registry', icon: Truck, permitted: checkPermission('fleet') },
    { id: 'drivers', label: 'Driver Registry', icon: Users, permitted: checkPermission('drivers') },
    { id: 'trips', label: 'Trip Dispatcher', icon: MapPin, permitted: checkPermission('trips') },
    { id: 'maintenance', label: 'Maintenance Log', icon: Wrench, permitted: checkPermission('fleet') }, // Maintenance uses vehicle permission
    { id: 'fuel-expenses', label: 'Fuel & Expenses', icon: Fuel, permitted: checkPermission('fuelExp') },
    { id: 'analytics', label: 'Reports & Analytics', icon: BarChart3, permitted: checkPermission('analytics') },
    { id: 'settings', label: 'Depot Settings', icon: SettingsIcon, permitted: true }, // settings is visible, internally restricted
    { id: 'about-us', label: 'About Us', icon: Info, permitted: true }
  ];

  return (
    <aside className="w-60 bg-slate-900 flex-shrink-0 flex flex-col h-screen border-r border-slate-800">
      {/* Header Brand */}
      <div className="p-6 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center font-bold text-white">TO</div>
          <div>
            <span className="text-white font-semibold tracking-tight text-lg block">TransitOps</span>
            <p className="text-[10px] text-slate-400 font-medium truncate max-w-[140px] mt-0.5">{depotName}</p>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 py-4 text-slate-400 font-medium text-sm space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          if (!item.permitted) return null;
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setTab(item.id)}
              className={`w-full text-left px-6 py-3 flex items-center gap-3 transition-colors cursor-pointer ${
                isActive
                  ? 'bg-slate-800 text-blue-400 border-r-2 border-blue-400 font-semibold'
                  : 'hover:text-white'
              }`}
            >
              <Icon className={`h-5 w-5 ${isActive ? 'text-blue-400' : 'text-slate-400 group-hover:text-slate-200'}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* User info & Signout */}
      <div className="p-6 border-t border-slate-800 flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-white font-bold">
            {user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-white text-sm font-semibold truncate">{user.name}</p>
            <p className="text-slate-500 text-xs truncate">{user.role}</p>
          </div>
        </div>

        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-slate-800 hover:border-slate-700 rounded-lg text-xs font-semibold text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition-all cursor-pointer"
        >
          <LogOut className="h-3.5 w-3.5" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
