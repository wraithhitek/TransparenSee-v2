"use client";

import { useRole, type RoleType, DEFAULT_STATES, POPULAR_MPS } from "@/context/RoleContext";
import {
  Building2,
  Check,
  ChevronDown,
  ChevronRight,
  Compass,
  FileCheck2,
  Flag,
  Globe2,
  Landmark,
  Layers,
  MapPin,
  ShieldCheck,
  Sparkles,
  UserCheck,
  Users,
} from "lucide-react";
import { useState } from "react";

export function RoleGovernanceBar() {
  const {
    role,
    setRole,
    selectedState,
    setSelectedState,
    selectedDistrict,
    setSelectedDistrict,
    selectedMp,
    setSelectedMp,
    roleMeta,
    availableDistricts,
    availableMps,
  } = useRole();

  const [stateDropdownOpen, setStateDropdownOpen] = useState(false);
  const [districtDropdownOpen, setDistrictDropdownOpen] = useState(false);
  const [mpDropdownOpen, setMpDropdownOpen] = useState(false);

  const tiers: Array<{
    id: RoleType;
    label: string;
    sub: string;
    icon: typeof Landmark;
    badge: string;
    badgeColor: string;
    borderActive: string;
    bgActive: string;
    textActive: string;
  }> = [
    {
      id: "ministry",
      label: "Ministry (Apex)",
      sub: "National Sovereign Directives",
      icon: Landmark,
      badge: "Sovereign Apex",
      badgeColor: "bg-blue-100 text-blue-700 border-blue-200",
      borderActive: "border-blue-500",
      bgActive: "bg-blue-50/70",
      textActive: "text-blue-700",
    },
    {
      id: "state",
      label: "State Nodal",
      sub: "Comparative Verdicts & Allocations",
      icon: Building2,
      badge: "State Arbitration",
      badgeColor: "bg-purple-100 text-purple-700 border-purple-200",
      borderActive: "border-purple-500",
      bgActive: "bg-purple-50/70",
      textActive: "text-purple-700",
    },
    {
      id: "district",
      label: "District Collector",
      sub: "Operational Imperatives & SLAs",
      icon: MapPin,
      badge: "Ground Execution",
      badgeColor: "bg-emerald-100 text-emerald-700 border-emerald-200",
      borderActive: "border-emerald-500",
      bgActive: "bg-emerald-50/70",
      textActive: "text-emerald-700",
    },
    {
      id: "mp",
      label: "MP Constituency",
      sub: "First-Person Accountability",
      icon: UserCheck,
      badge: "Citizen Representation",
      badgeColor: "bg-amber-100 text-amber-700 border-amber-200",
      borderActive: "border-amber-500",
      bgActive: "bg-amber-50/70",
      textActive: "text-amber-800",
    },
  ];

  return (
    <div className="mb-4 overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-xs">
      {/* 4 Governance Tier Tabs */}
      <div className="grid grid-cols-2 border-b border-slate-200/70 sm:grid-cols-4">
        {tiers.map((t) => {
          const Icon = t.icon;
          const isActive = role === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => {
                setRole(t.id);
                setStateDropdownOpen(false);
                setDistrictDropdownOpen(false);
                setMpDropdownOpen(false);
              }}
              className={`group relative flex flex-col p-3 text-left transition-all duration-150 cursor-pointer ${
                isActive
                  ? `${t.bgActive} border-b-2 ${t.borderActive}`
                  : "hover:bg-slate-50 border-b-2 border-transparent"
              }`}
            >
              <div className="flex items-center justify-between gap-1.5">
                <div className="flex items-center gap-2">
                  <span
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${
                      isActive
                        ? "bg-white text-slate-800 shadow-xs"
                        : "bg-slate-100 text-slate-500 group-hover:bg-slate-200"
                    }`}
                  >
                    <Icon size={15} strokeWidth={isActive ? 2.2 : 1.8} />
                  </span>
                  <span
                    className={`text-xs font-bold leading-tight ${
                      isActive ? t.textActive : "text-slate-700 group-hover:text-slate-900"
                    }`}
                  >
                    {t.label}
                  </span>
                </div>

                <span
                  className={`hidden sm:inline-block rounded px-1.5 py-0.5 text-[9px] font-bold border uppercase tracking-wider ${
                    isActive ? t.badgeColor : "bg-slate-100 text-slate-500 border-slate-200"
                  }`}
                >
                  {t.badge}
                </span>
              </div>

              <span className="mt-1.5 truncate text-[10px] text-slate-500 font-medium">
                {t.sub}
              </span>
            </button>
          );
        })}
      </div>

      {/* Contextual Territory & Scope Sub-Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50/70 px-4 py-2 text-xs">
        {/* Left: Current Scope & Selectors */}
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="flex items-center gap-1 text-[11px] font-semibold text-slate-500">
            <Compass size={13} className="text-slate-400" />
            <span>Geographical Scope:</span>
          </span>

          {/* Ministry Scope */}
          {role === "ministry" && (
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-md border border-blue-200 bg-white px-2.5 py-1 text-xs font-semibold text-blue-800 shadow-2xs">
                <Globe2 size={13} className="text-blue-600" />
                <span>Pan-India (36 States & Union Territories)</span>
              </span>
              <span className="hidden md:inline-flex items-center gap-1 text-[11px] text-slate-500">
                <ShieldCheck size={12} className="text-emerald-600" />
                <span>Apex Sovereign Visibility · Full Vertical Drill-Down Active</span>
              </span>
            </div>
          )}

          {/* State Scope Selector */}
          {role === "state" && (
            <div className="flex items-center gap-2">
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setStateDropdownOpen(!stateDropdownOpen)}
                  className="inline-flex items-center gap-1.5 rounded-md border border-purple-200 bg-white px-2.5 py-1 text-xs font-semibold text-purple-900 shadow-2xs hover:bg-purple-50/50"
                >
                  <Building2 size={13} className="text-purple-600" />
                  <span>State: {selectedState}</span>
                  <ChevronDown size={12} className="text-slate-400" />
                </button>

                {stateDropdownOpen && (
                  <div className="absolute left-0 top-[32px] z-50 max-h-[260px] w-[200px] overflow-y-auto rounded-lg border border-slate-200 bg-white p-1 shadow-xl">
                    <div className="px-2 py-1 text-[10px] font-bold uppercase text-slate-400">
                      Select State Jurisdiction
                    </div>
                    {DEFAULT_STATES.map((st) => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => {
                          setSelectedState(st);
                          setStateDropdownOpen(false);
                        }}
                        className={`flex w-full items-center justify-between rounded px-2 py-1.5 text-left text-xs ${
                          selectedState === st
                            ? "bg-purple-50 font-bold text-purple-800"
                            : "text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        <span>{st}</span>
                        {selectedState === st && <Check size={12} className="text-purple-600" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <span className="hidden sm:inline-block text-[11px] font-medium text-slate-500">
                Ranked 3rd of 28 States · Inter-District Allocation & Arbitration Mode
              </span>
            </div>
          )}

          {/* District Scope Selector */}
          {role === "district" && (
            <div className="flex flex-wrap items-center gap-2">
              {/* State Filter for District */}
              <select
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                {DEFAULT_STATES.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>

              {/* District Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setDistrictDropdownOpen(!districtDropdownOpen)}
                  className="inline-flex items-center gap-1.5 rounded-md border border-emerald-300 bg-white px-2.5 py-1 text-xs font-semibold text-emerald-900 shadow-2xs hover:bg-emerald-50/50"
                >
                  <MapPin size={13} className="text-emerald-600" />
                  <span>District: {selectedDistrict}</span>
                  <ChevronDown size={12} className="text-slate-400" />
                </button>

                {districtDropdownOpen && (
                  <div className="absolute left-0 top-[32px] z-50 max-h-[260px] w-[200px] overflow-y-auto rounded-lg border border-slate-200 bg-white p-1 shadow-xl">
                    <div className="px-2 py-1 text-[10px] font-bold uppercase text-slate-400">
                      Select Collectorate District
                    </div>
                    {availableDistricts.map((dst) => (
                      <button
                        key={dst}
                        type="button"
                        onClick={() => {
                          setSelectedDistrict(dst);
                          setDistrictDropdownOpen(false);
                        }}
                        className={`flex w-full items-center justify-between rounded px-2 py-1.5 text-left text-xs ${
                          selectedDistrict === dst
                            ? "bg-emerald-50 font-bold text-emerald-800"
                            : "text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        <span>{dst}</span>
                        {selectedDistrict === dst && <Check size={12} className="text-emerald-600" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <span className="hidden sm:inline-block text-[11px] font-medium text-slate-500">
                District Magistrate Command · SLA Enforcement Mode
              </span>
            </div>
          )}

          {/* MP Scope Selector with Dynamic State & Constituency */}
          {role === "mp" && (
            <div className="flex flex-wrap items-center gap-2">
              {/* State Dropdown for MP */}
              <select
                value={selectedState}
                onChange={(e) => {
                  setSelectedState(e.target.value);
                }}
                className="rounded-md border border-amber-300 bg-white px-2 py-1 text-xs font-semibold text-amber-900 shadow-2xs hover:bg-amber-50/50 focus:outline-none cursor-pointer"
              >
                {DEFAULT_STATES.map((st) => (
                  <option key={st} value={st}>
                    State: {st}
                  </option>
                ))}
              </select>

              {/* Constituency Dropdown for MP */}
              <select
                value={selectedDistrict}
                onChange={(e) => {
                  setSelectedDistrict(e.target.value);
                }}
                className="rounded-md border border-amber-300 bg-white px-2 py-1 text-xs font-semibold text-amber-900 shadow-2xs hover:bg-amber-50/50 focus:outline-none cursor-pointer"
              >
                {availableDistricts.map((dst) => (
                  <option key={dst} value={dst}>
                    Constituency: {dst}
                  </option>
                ))}
              </select>

              {/* Dynamic Hon'ble MP Indicator & Picker */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setMpDropdownOpen(!mpDropdownOpen)}
                  className="inline-flex items-center gap-1.5 rounded-md border border-amber-300 bg-white px-2.5 py-1 text-xs font-semibold text-amber-900 shadow-2xs hover:bg-amber-50/50 cursor-pointer"
                >
                  <UserCheck size={13} className="text-amber-600" />
                  <span>Hon&apos;ble MP: <strong className="text-amber-800">{selectedMp}</strong></span>
                  <ChevronDown size={12} className="text-slate-400" />
                </button>

                {mpDropdownOpen && (
                  <div className="absolute left-0 top-[32px] z-50 max-h-[280px] w-[260px] overflow-y-auto rounded-lg border border-slate-200 bg-white p-1 shadow-xl">
                    <div className="px-2 py-1 text-[10px] font-bold uppercase text-slate-400">
                      MPs for {selectedState}
                    </div>
                    {availableMps.map((m) => {
                      const isSelected = selectedMp === m.name;
                      return (
                        <button
                          key={`${m.name}-${m.constituency}`}
                          type="button"
                          onClick={() => {
                            setSelectedMp(m.name);
                            setSelectedDistrict(m.constituency);
                            setSelectedState(m.state);
                            setMpDropdownOpen(false);
                          }}
                          className={`flex w-full items-center justify-between rounded px-2 py-1.5 text-left text-xs ${
                            isSelected
                              ? "bg-amber-50 font-bold text-amber-900"
                              : "text-slate-700 hover:bg-slate-50"
                          }`}
                        >
                          <div>
                            <div className="font-semibold">{m.name}</div>
                            <div className="text-[10px] text-slate-400">
                              {m.constituency}, {m.state} ({m.house})
                            </div>
                          </div>
                          {isSelected && <Check size={12} className="text-amber-600" />}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <span className="hidden sm:inline-block text-[11px] font-medium text-slate-500">
                18th Lok Sabha Parliamentary Scope
              </span>
            </div>
          )}
        </div>

        {/* Right: Trust Architecture & Authority Tag */}
        <div className="flex items-center gap-2 text-[11px]">
          <span className="text-slate-400 hidden lg:inline">Trust Architecture:</span>
          <span className="rounded bg-white px-2 py-0.5 font-semibold text-slate-700 border border-slate-200 shadow-2xs">
            {roleMeta.authority}
          </span>
        </div>
      </div>
    </div>
  );
}

export default RoleGovernanceBar;
