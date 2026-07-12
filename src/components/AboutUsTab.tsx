/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Building2, MapPin, ShieldCheck, Award, Users, Target, Compass, Globe, Info } from 'lucide-react';

export default function AboutUsTab() {
  const hubs = [
    { city: "Chennai Central (HQ)", role: "Southern India Operations & Tech Center", address: "Anna Salai, Chennai, Tamil Nadu 600002" },
    { city: "Delhi NCR Terminal", role: "Northern Logistics Hub & Route Control", address: "Dwarka Sector 21, New Delhi 110077" },
    { city: "Bengaluru East Depot", role: "Transit & Maintenance Hub", address: "Whitefield, Bengaluru, Karnataka 560066" }
  ];

  const milestones = [
    { year: "2024", title: "Inception in Chennai", desc: "Started operations with 10 heavy vehicles connecting the Chennai-Bengaluru corridor." },
    { year: "2025", title: "Pan-India Expansion", desc: "Extended routing services to cover Delhi NCR, Karnataka, and Maharashtra routes." },
    { year: "2026", title: "Smart Fleet Control", desc: "Launched automated dispatch, live odometer fuel calculations, and role-based access management." }
  ];

  const coreTeam = [
    { name: "Barath Kumar Basker", role: "The Frontend developer", bio: "Responsible for constructing the highly polished user interface, sidebar orchestration, and responsive layouts." },
    { name: "Chandru K", role: "The backend developer", bio: "Coordinates local and cloud database persistence, REST API route payloads, and authentication mechanics." },
    { name: "Jerick", role: "The Debugger", bio: "Specializes in high-fidelity code quality reviews, lint validations, and real-time applet performance." }
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12 animate-fadeIn">
      {/* Hero Banner Header */}
      <div className="relative bg-gradient-to-r from-blue-950 via-slate-900 to-blue-900 rounded-3xl p-8 md:p-12 text-white overflow-hidden border border-slate-800 shadow-lg">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-500 via-transparent to-transparent pointer-events-none"></div>
        <div className="max-w-xl relative z-10">
          <span className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-xs font-semibold uppercase tracking-wider border border-blue-500/30">
            TransitOps India
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold font-display mt-4 tracking-tight">
            Pioneering Intelligent Fleet Operations Across India
          </h2>
          <p className="text-slate-300 text-sm mt-3 leading-relaxed">
            From the bustling docks of Chennai to the critical logistics hubs of Delhi NCR and Bengaluru, 
            we engineer robust depot orchestration tools that keep Indian logistics agile, safe, and cost-efficient.
          </p>
        </div>
      </div>

      {/* Grid: Vision & Mission */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
              <Target className="h-5 w-5 text-blue-600" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Our Core Vision</h3>
          </div>
          <p className="text-slate-600 text-sm leading-relaxed">
            To build a fully synchronized, safe, and high-efficiency logistics network across India. 
            By empowering dispatchers, managers, and safety officers with transparent, real-time dispatch systems, 
            we reduce fuel wastage, prevent mechanical breakdowns, and guarantee driver well-being.
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
              <Compass className="h-5 w-5 text-blue-600" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Our Operations Strategy</h3>
          </div>
          <p className="text-slate-600 text-sm leading-relaxed">
            Leveraging Indian RTO regulations, regional transport dynamics, and regional expressway toll data 
            (such as the Chennai-Bengaluru Expressway) to offer precise operational route expenses. 
            We maintain structured checklists and vehicle telemetry simulation for robust fleet status controls.
          </p>
        </div>
      </div>

      {/* Indian Regional Hubs Map/Section */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs">
        <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-50">
          <Globe className="h-5 w-5 text-blue-500 animate-pulse" />
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Our National Operations Hubs</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
          {hubs.map((hub, index) => (
            <div key={index} className="p-4 border border-slate-100 bg-slate-50/40 rounded-xl hover:border-blue-100 transition-all">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-blue-600 flex-shrink-0" />
                <span className="font-bold text-slate-800 text-sm">{hub.city}</span>
              </div>
              <p className="text-xs text-blue-600 font-medium mt-1.5">{hub.role}</p>
              <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">{hub.address}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Leadership Team */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 flex flex-col justify-center pr-4">
          <div className="flex items-center gap-2 mb-2">
            <Users className="h-5 w-5 text-blue-600" />
            <h3 className="text-base font-bold text-slate-900">National Leadership</h3>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            Our platform is managed and supervised by certified logistics professionals committed to making India's transit corridors safe, transparent, and fully optimized.
          </p>
        </div>

        <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {coreTeam.map((member, idx) => (
            <div key={idx} className="bg-white p-4 rounded-xl border border-slate-100 text-center flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-base shadow-inner mb-3">
                {member.name.split(' ').map(n => n[0]).join('')}
              </div>
              <h4 className="text-xs font-bold text-slate-900">{member.name}</h4>
              <p className="text-[10px] text-blue-600 font-semibold mt-0.5">{member.role}</p>
              <p className="text-[10px] text-slate-400 mt-2 leading-relaxed">{member.bio}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Operational Timeline / History */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs">
        <div className="flex items-center gap-2 mb-6 pb-2 border-b border-slate-50">
          <Award className="h-5 w-5 text-blue-500" />
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Journey & Milestones</h3>
        </div>
        <div className="relative border-l-2 border-blue-100 ml-3 pl-6 space-y-6">
          {milestones.map((ms, index) => (
            <div key={index} className="relative">
              <div className="absolute -left-[31px] top-1.5 bg-blue-600 w-3.5 h-3.5 rounded-full border-2 border-white"></div>
              <div>
                <span className="text-xs font-mono font-bold text-blue-600">{ms.year}</span>
                <h4 className="text-sm font-semibold text-slate-800 mt-0.5">{ms.title}</h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">{ms.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
