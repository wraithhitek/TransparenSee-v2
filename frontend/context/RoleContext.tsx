"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type RoleType = "ministry" | "state" | "district" | "mp";

export interface RoleMeta {
  type: RoleType;
  title: string;
  shortLabel: string;
  badge: string;
  authority: string;
  narrativeTone: string;
  scopeLabel: string;
  tier: string;
  label: string;
  subtitle: string;
}

export const ROLE_DEFINITIONS: Record<RoleType, RoleMeta> = {
  ministry: {
    type: "ministry",
    title: "Ministry of Statistics & PI",
    shortLabel: "Ministry (Apex)",
    badge: "Sovereign Directives",
    authority: "Legislates & Mandates (Full Vertical Drill-Down)",
    narrativeTone: "Sovereign Compliance & Statutory Oversight",
    scopeLabel: "Pan-India (All 36 States/UTs)",
    tier: "Tier 1",
    label: "Ministry (National)",
    subtitle: "Pan-India sovereign compliance & anomaly tracking",
  },
  state: {
    type: "state",
    title: "State Nodal Authority",
    shortLabel: "State Nodal",
    badge: "Comparative Verdicts",
    authority: "Arbitrates & Allocates",
    narrativeTone: "Inter-District Benchmarking & State Allocation",
    scopeLabel: "State Territory",
    tier: "Tier 2",
    label: "State Secretariat",
    subtitle: "State outlay, inter-district arbitration & benchmarks",
  },
  district: {
    type: "district",
    title: "District Magistrate & Collectorate",
    shortLabel: "District Collector",
    badge: "Operational Imperatives",
    authority: "Executes & Inspects",
    narrativeTone: "Ground Progress, Milestones & SLA Sirens",
    scopeLabel: "District Administrative Scope",
    tier: "Tier 3",
    label: "District Collectorate",
    subtitle: "Ground execution, SLA alerts & milestone inspections",
  },
  mp: {
    type: "mp",
    title: "Member of Parliament",
    shortLabel: "MP Office",
    badge: "First-Person Accountability",
    authority: "Recommends & Represents",
    narrativeTone: "Citizen Impact & Proposal Tracking",
    scopeLabel: "Parliamentary Constituency",
    tier: "Tier 4",
    label: "MP Constituency",
    subtitle: "₹25 Cr entitlement, grievances & works status",
  },
};

export const ROLES = ROLE_DEFINITIONS;

export const DEFAULT_STATES = [
  "Uttar Pradesh",
  "Maharashtra",
  "Bihar",
  "Rajasthan",
  "Madhya Pradesh",
  "West Bengal",
  "Gujarat",
  "Karnataka",
  "Tamil Nadu",
  "Odisha",
  "Assam",
  "Jharkhand",
  "Telangana",
  "Andhra Pradesh",
  "Kerala",
  "Punjab",
  "Haryana",
  "Delhi",
];

export const STATE_DISTRICTS: Record<string, string[]> = {
  "Uttar Pradesh": ["Varanasi", "Lucknow", "Prayagraj", "Gorakhpur", "Kanpur Nagar", "Agra", "Ghaziabad", "Ayodhya"],
  "Maharashtra": ["Pune", "Mumbai South", "Nagpur", "Thane", "Nashik", "Aurangabad", "Kolhapur"],
  "Bihar": ["Patna", "Gaya", "Muzaffarpur", "Bhagalpur", "Darbhanga", "Purnia"],
  "Rajasthan": ["Jaipur", "Jodhpur", "Kota", "Udaipur", "Bikaner", "Ajmer"],
  "Madhya Pradesh": ["Bhopal", "Indore", "Gwalior", "Jabalpur", "Ujjain"],
  "West Bengal": ["Kolkata", "Howrah", "North 24 Parganas", "Darjeeling", "Murshidabad"],
  "Gujarat": ["Ahmedabad", "Surat", "Vadodara", "Rajkot", "Gandhinagar"],
  "Karnataka": ["Bengaluru Urban", "Mysuru", "Dharwad", "Mangaluru", "Belagavi"],
  "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai", "Tiruchirappalli", "Salem"],
};

export const POPULAR_MPS = [
  { name: "Narendra Modi", constituency: "Varanasi", state: "Uttar Pradesh", house: "Lok Sabha" },
  { name: "Rajnath Singh", constituency: "Lucknow", state: "Uttar Pradesh", house: "Lok Sabha" },
  { name: "Supriya Sule", constituency: "Baramati", state: "Maharashtra", house: "Lok Sabha" },
  { name: "Nitin Gadkari", constituency: "Nagpur", state: "Maharashtra", house: "Lok Sabha" },
  { name: "Murlidhar Mohol", constituency: "Pune", state: "Maharashtra", house: "Lok Sabha" },
  { name: "Ravi Shankar Prasad", constituency: "Patna Sahib", state: "Bihar", house: "Lok Sabha" },
  { name: "Manju Sharma", constituency: "Jaipur", state: "Rajasthan", house: "Lok Sabha" },
  { name: "Tejasvi Surya", constituency: "Bangalore South", state: "Karnataka", house: "Lok Sabha" },
  { name: "Kanimozhi Karunanidhi", constituency: "Thoothukkudi", state: "Tamil Nadu", house: "Lok Sabha" },
];

interface RoleContextValue {
  role: RoleType;
  setRole: (role: RoleType) => void;
  selectedState: string;
  setSelectedState: (state: string) => void;
  selectedDistrict: string;
  setSelectedDistrict: (district: string) => void;
  selectedMp: string;
  setSelectedMp: (mp: string) => void;
  roleMeta: RoleMeta;
  availableDistricts: string[];
}

const RoleContext = createContext<RoleContextValue | undefined>(undefined);

const ROLE_STORAGE_KEY = "transparensee-governance-role-v1";
const STATE_STORAGE_KEY = "transparensee-state-scope-v1";
const DISTRICT_STORAGE_KEY = "transparensee-district-scope-v1";
const MP_STORAGE_KEY = "transparensee-mp-scope-v1";

export function RoleProvider({ children }: { children: ReactNode }) {
  const [role, setRoleState] = useState<RoleType>("ministry");
  const [selectedState, setSelectedStateState] = useState<string>("Uttar Pradesh");
  const [selectedDistrict, setSelectedDistrictState] = useState<string>("Varanasi");
  const [selectedMp, setSelectedMpState] = useState<string>("Narendra Modi (Varanasi)");

  // Hydrate from localStorage
  useEffect(() => {
    try {
      const savedRole = localStorage.getItem(ROLE_STORAGE_KEY) as RoleType | null;
      if (savedRole && ROLE_DEFINITIONS[savedRole]) {
        setRoleState(savedRole);
      }
      const savedState = localStorage.getItem(STATE_STORAGE_KEY);
      if (savedState) setSelectedStateState(savedState);
      const savedDistrict = localStorage.getItem(DISTRICT_STORAGE_KEY);
      if (savedDistrict) setSelectedDistrictState(savedDistrict);
      const savedMp = localStorage.getItem(MP_STORAGE_KEY);
      if (savedMp) setSelectedMpState(savedMp);
    } catch {
      // Ignore storage errors in restricted contexts
    }
  }, []);

  const setRole = (newRole: RoleType) => {
    setRoleState(newRole);
    try {
      localStorage.setItem(ROLE_STORAGE_KEY, newRole);
    } catch {
      // Ignore
    }
  };

  const setSelectedState = (state: string) => {
    setSelectedStateState(state);
    // Update default district for this state if available
    const districts = STATE_DISTRICTS[state] || ["District Headquarters"];
    const firstDistrict = districts[0] || "District Headquarters";
    setSelectedDistrictState(firstDistrict);
    try {
      localStorage.setItem(STATE_STORAGE_KEY, state);
      localStorage.setItem(DISTRICT_STORAGE_KEY, firstDistrict);
    } catch {
      // Ignore
    }
  };

  const setSelectedDistrict = (district: string) => {
    setSelectedDistrictState(district);
    try {
      localStorage.setItem(DISTRICT_STORAGE_KEY, district);
    } catch {
      // Ignore
    }
  };

  const setSelectedMp = (mp: string) => {
    setSelectedMpState(mp);
    try {
      localStorage.setItem(MP_STORAGE_KEY, mp);
    } catch {
      // Ignore
    }
  };

  const availableDistricts = STATE_DISTRICTS[selectedState] || ["District Headquarters", "Central Block", "North Division", "South Division"];

  return (
    <RoleContext.Provider
      value={{
        role,
        setRole,
        selectedState,
        setSelectedState,
        selectedDistrict,
        setSelectedDistrict,
        selectedMp,
        setSelectedMp,
        roleMeta: ROLE_DEFINITIONS[role],
        availableDistricts,
      }}
    >
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  const context = useContext(RoleContext);
  if (!context) {
    throw new Error("useRole must be used within a RoleProvider");
  }
  return context;
}
