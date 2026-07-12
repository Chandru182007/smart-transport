/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Shield, Key, Mail, UserCheck, AlertCircle } from 'lucide-react';
import { User, UserRole } from '../types';

interface LoginProps {
  onLoginSuccess: (user: User) => void;
}

export default function Login({ onLoginSuccess }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('Fleet Manager');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Invalid credentials or role selection');
      }

      const userData: User = await res.json();
      onLoginSuccess(userData);
    } catch (err: any) {
      setError(err.message || 'Server error during login');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (quickRole: UserRole, quickEmail: string) => {
    setEmail(quickEmail);
    setPassword('password');
    setRole(quickRole);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="bg-slate-900 p-3 rounded-xl shadow-md border border-slate-800">
            <Shield className="h-8 w-8 text-blue-400" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-display font-bold tracking-tight text-slate-950">
          TransitOps Central
        </h2>
        <p className="mt-2 text-center text-sm text-slate-500">
          Control center for smart transport operations & logistics management
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-sm sm:rounded-xl sm:px-10 border border-slate-200">
          <form className="space-y-5" onSubmit={handleLogin}>
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
                <div className="flex">
                  <AlertCircle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Email Address</label>
              <div className="relative rounded-lg shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm placeholder-slate-400 focus:outline-hidden"
                  placeholder="name@transitops.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Password</label>
              <div className="relative rounded-lg shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Key className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm placeholder-slate-400 focus:outline-hidden"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">System Role (RBAC Access)</label>
              <div className="relative rounded-lg shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <UserCheck className="h-5 w-5 text-slate-400" />
                </div>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className="block w-full pl-10 pr-3 py-2 border border-slate-200 bg-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm focus:outline-hidden appearance-none"
                >
                  <option value="Fleet Manager">Fleet Manager</option>
                  <option value="Driver">Driver</option>
                  <option value="Safety Officer">Safety Officer</option>
                  <option value="Financial Analyst">Financial Analyst</option>
                </select>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-xs text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 cursor-pointer transition-colors"
              >
                {loading ? 'Authenticating...' : 'Sign In'}
              </button>
            </div>
          </form>

          <div className="mt-8 border-t border-slate-100 pt-6">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider text-center mb-4">
              Quick Role-Based Access Login
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleQuickLogin('Fleet Manager', 'manager@transitops.com')}
                className="flex flex-col items-center p-2.5 border border-slate-100 rounded-lg hover:bg-blue-50/50 hover:border-blue-200 transition-all text-left cursor-pointer"
              >
                <span className="text-xs font-semibold text-slate-900">Fleet Manager</span>
                <span className="text-[10px] text-slate-500">manager@transitops.com</span>
              </button>
              <button
                onClick={() => handleQuickLogin('Driver', 'driver@transitops.com')}
                className="flex flex-col items-center p-2.5 border border-slate-100 rounded-lg hover:bg-blue-50/50 hover:border-blue-200 transition-all text-left cursor-pointer"
              >
                <span className="text-xs font-semibold text-slate-900">Driver</span>
                <span className="text-[10px] text-slate-500">driver@transitops.com</span>
              </button>
              <button
                onClick={() => handleQuickLogin('Safety Officer', 'safety@transitops.com')}
                className="flex flex-col items-center p-2.5 border border-slate-100 rounded-lg hover:bg-blue-50/50 hover:border-blue-200 transition-all text-left cursor-pointer"
              >
                <span className="text-xs font-semibold text-slate-900">Safety Officer</span>
                <span className="text-[10px] text-slate-500">safety@transitops.com</span>
              </button>
              <button
                onClick={() => handleQuickLogin('Financial Analyst', 'analyst@transitops.com')}
                className="flex flex-col items-center p-2.5 border border-slate-100 rounded-lg hover:bg-blue-50/50 hover:border-blue-200 transition-all text-left cursor-pointer"
              >
                <span className="text-xs font-semibold text-slate-900">Financial Analyst</span>
                <span className="text-[10px] text-slate-500">analyst@transitops.com</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
