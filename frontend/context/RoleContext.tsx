"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { fetchStates, fetchDistricts, fetchMps, type ApiMp, type ApiState, type ApiDistrict } from "@/lib/api";

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

export interface MpRecord {
  key?: string;
  name: string;
  constituency: string;
  state: string;
  house: "Lok Sabha" | "Rajya Sabha";
  allocated_amount?: number;
  derived_expenditure?: number;
  composite_risk?: number;
  risk_band?: string;
}

export const POPULAR_MPS: MpRecord[] = [
  // Uttar Pradesh
  { name: "Narendra Modi", constituency: "Varanasi", state: "Uttar Pradesh", house: "Lok Sabha" },
  { name: "Rajnath Singh", constituency: "Lucknow", state: "Uttar Pradesh", house: "Lok Sabha" },
  { name: "Ravi Kishan", constituency: "Gorakhpur", state: "Uttar Pradesh", house: "Lok Sabha" },
  { name: "Pravin Patel", constituency: "Prayagraj", state: "Uttar Pradesh", house: "Lok Sabha" },
  { name: "Ramesh Awasthi", constituency: "Kanpur Nagar", state: "Uttar Pradesh", house: "Lok Sabha" },
  { name: "SP Singh Baghel", constituency: "Agra", state: "Uttar Pradesh", house: "Lok Sabha" },
  { name: "Atul Garg", constituency: "Ghaziabad", state: "Uttar Pradesh", house: "Lok Sabha" },
  { name: "Awadhesh Prasad", constituency: "Ayodhya", state: "Uttar Pradesh", house: "Lok Sabha" },

  // Maharashtra
  { name: "Murlidhar Mohol", constituency: "Pune", state: "Maharashtra", house: "Lok Sabha" },
  { name: "Arvind Sawant", constituency: "Mumbai South", state: "Maharashtra", house: "Lok Sabha" },
  { name: "Nitin Gadkari", constituency: "Nagpur", state: "Maharashtra", house: "Lok Sabha" },
  { name: "Naresh Mhaske", constituency: "Thane", state: "Maharashtra", house: "Lok Sabha" },
  { name: "Rajabhau Waje", constituency: "Nashik", state: "Maharashtra", house: "Lok Sabha" },
  { name: "Sandipan Bhumre", constituency: "Aurangabad", state: "Maharashtra", house: "Lok Sabha" },
  { name: "Shahu Chhatrapati", constituency: "Kolhapur", state: "Maharashtra", house: "Lok Sabha" },
  { name: "Supriya Sule", constituency: "Baramati", state: "Maharashtra", house: "Lok Sabha" },

  // Bihar
  { name: "Ravi Shankar Prasad", constituency: "Patna", state: "Bihar", house: "Lok Sabha" },
  { name: "Jitan Ram Manjhi", constituency: "Gaya", state: "Bihar", house: "Lok Sabha" },
  { name: "Raj Bhushan Choudhary", constituency: "Muzaffarpur", state: "Bihar", house: "Lok Sabha" },
  { name: "Ajay Kumar Mandal", constituency: "Bhagalpur", state: "Bihar", house: "Lok Sabha" },
  { name: "Gopal Jee Thakur", constituency: "Darbhanga", state: "Bihar", house: "Lok Sabha" },
  { name: "Pappu Yadav", constituency: "Purnia", state: "Bihar", house: "Lok Sabha" },

  // Rajasthan
  { name: "Manju Sharma", constituency: "Jaipur", state: "Rajasthan", house: "Lok Sabha" },
  { name: "Gajendra Singh Shekhawat", constituency: "Jodhpur", state: "Rajasthan", house: "Lok Sabha" },
  { name: "Om Birla", constituency: "Kota", state: "Rajasthan", house: "Lok Sabha" },
  { name: "Mannalal Rawat", constituency: "Udaipur", state: "Rajasthan", house: "Lok Sabha" },
  { name: "Arjun Ram Meghwal", constituency: "Bikaner", state: "Rajasthan", house: "Lok Sabha" },
  { name: "Bhagirath Choudhary", constituency: "Ajmer", state: "Rajasthan", house: "Lok Sabha" },

  // Madhya Pradesh
  { name: "Alok Sharma", constituency: "Bhopal", state: "Madhya Pradesh", house: "Lok Sabha" },
  { name: "Shankar Lalwani", constituency: "Indore", state: "Madhya Pradesh", house: "Lok Sabha" },
  { name: "Bharat Singh Kushwah", constituency: "Gwalior", state: "Madhya Pradesh", house: "Lok Sabha" },
  { name: "Ashish Dubey", constituency: "Jabalpur", state: "Madhya Pradesh", house: "Lok Sabha" },
  { name: "Anil Firojiya", constituency: "Ujjain", state: "Madhya Pradesh", house: "Lok Sabha" },

  // West Bengal
  { name: "Sudip Bandyopadhyay", constituency: "Kolkata", state: "West Bengal", house: "Lok Sabha" },
  { name: "Prasun Banerjee", constituency: "Howrah", state: "West Bengal", house: "Lok Sabha" },
  { name: "Sougata Roy", constituency: "North 24 Parganas", state: "West Bengal", house: "Lok Sabha" },
  { name: "Raju Bista", constituency: "Darjeeling", state: "West Bengal", house: "Lok Sabha" },
  { name: "Abu Taher Khan", constituency: "Murshidabad", state: "West Bengal", house: "Lok Sabha" },

  // Gujarat
  { name: "Amit Shah", constituency: "Gandhinagar", state: "Gujarat", house: "Lok Sabha" },
  { name: "Hasmukh Patel", constituency: "Ahmedabad", state: "Gujarat", house: "Lok Sabha" },
  { name: "Mukesh Dalal", constituency: "Surat", state: "Gujarat", house: "Lok Sabha" },
  { name: "Hemang Joshi", constituency: "Vadodara", state: "Gujarat", house: "Lok Sabha" },
  { name: "Parshottam Rupala", constituency: "Rajkot", state: "Gujarat", house: "Lok Sabha" },

  // Karnataka
  { name: "Tejasvi Surya", constituency: "Bengaluru Urban", state: "Karnataka", house: "Lok Sabha" },
  { name: "Yaduveer Wadiyar", constituency: "Mysuru", state: "Karnataka", house: "Lok Sabha" },
  { name: "Pralhad Joshi", constituency: "Dharwad", state: "Karnataka", house: "Lok Sabha" },
  { name: "Brijesh Chowta", constituency: "Mangaluru", state: "Karnataka", house: "Lok Sabha" },
  { name: "Jagadish Shettar", constituency: "Belagavi", state: "Karnataka", house: "Lok Sabha" },

  // Tamil Nadu
  { name: "Dayanidhi Maran", constituency: "Chennai", state: "Tamil Nadu", house: "Lok Sabha" },
  { name: "Ganapathi Rajkumar", constituency: "Coimbatore", state: "Tamil Nadu", house: "Lok Sabha" },
  { name: "Su. Venkatesan", constituency: "Madurai", state: "Tamil Nadu", house: "Lok Sabha" },
  { name: "Durai Vaiko", constituency: "Tiruchirappalli", state: "Tamil Nadu", house: "Lok Sabha" },
  { name: "TM Selvaganapathy", constituency: "Salem", state: "Tamil Nadu", house: "Lok Sabha" },
  { name: "Kanimozhi Karunanidhi", constituency: "Thoothukkudi", state: "Tamil Nadu", house: "Lok Sabha" },
];

export function getMpForStateAndConstituency(state: string, constituency: string): string {
  const match = POPULAR_MPS.find(
    (m) =>
      m.state.toLowerCase() === state.toLowerCase() &&
      m.constituency.toLowerCase() === constituency.toLowerCase()
  );
  if (match) return match.name;

  const stateMatch = POPULAR_MPS.find(
    (m) => m.state.toLowerCase() === state.toLowerCase()
  );
  if (stateMatch) return stateMatch.name;

  return `MP (${constituency})`;
}

export function getMpsForState(state: string): MpRecord[] {
  return POPULAR_MPS.filter((m) => m.state.toLowerCase() === state.toLowerCase());
}

interface RoleContextValue {
  role: RoleType;
  setRole: (role: RoleType) => void;
  selectedState: string;
  setSelectedState: (state: string) => void;
  selectedDistrict: string;
  setSelectedDistrict: (district: string) => void;
  selectedMp: string;
  setSelectedMp: (mp: string) => void;
  selectedMpKey: string;
  setSelectedMpKey: (key: string) => void;
  roleMeta: RoleMeta;
  availableStates: string[];
  availableDistricts: string[];
  availableMps: MpRecord[];
}

const RoleContext = createContext<RoleContextValue | undefined>(undefined);

const ROLE_STORAGE_KEY = "transparensee-governance-role-v1";
const STATE_STORAGE_KEY = "transparensee-state-scope-v1";
const DISTRICT_STORAGE_KEY = "transparensee-district-scope-v1";
const MP_STORAGE_KEY = "transparensee-mp-scope-v1";
const MP_KEY_STORAGE = "transparensee-mp-key-scope-v1";

export function RoleProvider({ children }: { children: ReactNode }) {
  const [role, setRoleState] = useState<RoleType>("ministry");
  const [selectedState, setSelectedStateState] = useState<string>("Uttar Pradesh");
  const [selectedDistrict, setSelectedDistrictState] = useState<string>("Varanasi");
  const [selectedMp, setSelectedMpState] = useState<string>("Narendra Modi");
  const [selectedMpKey, setSelectedMpKeyState] = useState<string>("");

  const [availableStates, setAvailableStates] = useState<string[]>(DEFAULT_STATES);
  const [liveDistricts, setLiveDistricts] = useState<string[]>([]);
  const [liveMps, setLiveMps] = useState<MpRecord[]>([]);

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
      if (savedMp) setSelectedMpState(savedMp.split(" (")[0]);
      const savedKey = localStorage.getItem(MP_KEY_STORAGE);
      if (savedKey) setSelectedMpKeyState(savedKey);
    } catch {
      // Ignore storage errors in restricted contexts
    }
  }, []);

  // Fetch real states on mount
  useEffect(() => {
    fetchStates()
      .then((res) => {
        if (res && res.length > 0) {
          const names = res.map((s) => s.state).filter(Boolean);
          if (names.length > 0) {
            // Keep unique
            setAvailableStates(Array.from(new Set(names)));
          }
        }
      })
      .catch(() => {});
  }, []);

  // Fetch real districts and MPs when selectedState changes
  useEffect(() => {
    let isMounted = true;
    Promise.all([
      fetchDistricts(selectedState, 200).catch(() => [] as ApiDistrict[]),
      fetchMps({ state: selectedState, limit: 200 }).catch(() => [] as ApiMp[]),
    ]).then(([distList, mpList]) => {
      if (!isMounted) return;

      if (distList && distList.length > 0) {
        const unique = Array.from(new Set(distList.map((d) => d.ida_district).filter(Boolean)));
        if (unique.length > 0) setLiveDistricts(unique);
      } else {
        setLiveDistricts([]);
      }

      if (mpList && mpList.length > 0) {
        const mapped: MpRecord[] = mpList.map((m) => ({
          key: m.mp_key,
          name: m.mp_name,
          constituency: m.constituency,
          state: m.state,
          house: (m.house === "Rajya Sabha" ? "Rajya Sabha" : "Lok Sabha") as "Lok Sabha" | "Rajya Sabha",
          allocated_amount: m.allocated_amount,
          derived_expenditure: m.derived_expenditure,
          composite_risk: m.composite_risk,
          risk_band: m.risk_band,
        }));
        setLiveMps(mapped);

        // Sync selectedMpKey
        const match = mapped.find(
          (m) =>
            m.name.toLowerCase() === selectedMp.toLowerCase() ||
            m.constituency.toLowerCase() === selectedDistrict.toLowerCase()
        );
        if (match && match.key) {
          setSelectedMpKeyState(match.key);
        } else if (mapped[0] && mapped[0].key) {
          setSelectedMpKeyState(mapped[0].key);
        }
      } else {
        setLiveMps([]);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [selectedState, selectedMp, selectedDistrict]);

  const setRole = (newRole: RoleType) => {
    setRoleState(newRole);
    try {
      localStorage.setItem(ROLE_STORAGE_KEY, newRole);
    } catch {}
  };

  const setSelectedMpKey = (key: string) => {
    setSelectedMpKeyState(key);
    try {
      localStorage.setItem(MP_KEY_STORAGE, key);
    } catch {}
  };

  const setSelectedState = (state: string) => {
    setSelectedStateState(state);
    // Update default district for this state
    const fallbackDistricts = STATE_DISTRICTS[state] || ["District Headquarters"];
    const firstDistrict = fallbackDistricts[0] || "District Headquarters";
    setSelectedDistrictState(firstDistrict);

    const matchedMp = getMpForStateAndConstituency(state, firstDistrict);
    setSelectedMpState(matchedMp);

    try {
      localStorage.setItem(STATE_STORAGE_KEY, state);
      localStorage.setItem(DISTRICT_STORAGE_KEY, firstDistrict);
      localStorage.setItem(MP_STORAGE_KEY, matchedMp);
    } catch {}
  };

  const setSelectedDistrict = (district: string) => {
    setSelectedDistrictState(district);

    // Update MP matching this district/constituency if available
    const liveMatch = liveMps.find(
      (m) => m.constituency.toLowerCase() === district.toLowerCase()
    );
    if (liveMatch) {
      setSelectedMpState(liveMatch.name);
      if (liveMatch.key) setSelectedMpKey(liveMatch.key);
    } else {
      const matchedMp = getMpForStateAndConstituency(selectedState, district);
      setSelectedMpState(matchedMp);
    }

    try {
      localStorage.setItem(DISTRICT_STORAGE_KEY, district);
    } catch {}
  };

  const setSelectedMp = (mpInput: string) => {
    const cleanedName = mpInput.includes(" (") ? mpInput.split(" (")[0].trim() : mpInput.trim();

    // Check live MPs first
    const liveFound = liveMps.find(
      (m) =>
        m.name.toLowerCase() === cleanedName.toLowerCase() ||
        `${m.name} (${m.constituency})`.toLowerCase() === mpInput.toLowerCase()
    );

    if (liveFound) {
      setSelectedMpState(liveFound.name);
      if (liveFound.key) setSelectedMpKey(liveFound.key);
      if (liveFound.state) setSelectedStateState(liveFound.state);
      if (liveFound.constituency) setSelectedDistrictState(liveFound.constituency);
      try {
        localStorage.setItem(MP_STORAGE_KEY, liveFound.name);
        if (liveFound.key) localStorage.setItem(MP_KEY_STORAGE, liveFound.key);
        localStorage.setItem(STATE_STORAGE_KEY, liveFound.state);
        localStorage.setItem(DISTRICT_STORAGE_KEY, liveFound.constituency);
      } catch {}
      return;
    }

    // Fallback to POPULAR_MPS
    const found = POPULAR_MPS.find(
      (m) =>
        m.name.toLowerCase() === cleanedName.toLowerCase() ||
        `${m.name} (${m.constituency})`.toLowerCase() === mpInput.toLowerCase()
    );

    if (found) {
      setSelectedMpState(found.name);
      setSelectedStateState(found.state);
      setSelectedDistrictState(found.constituency);
      try {
        localStorage.setItem(MP_STORAGE_KEY, found.name);
        localStorage.setItem(STATE_STORAGE_KEY, found.state);
        localStorage.setItem(DISTRICT_STORAGE_KEY, found.constituency);
      } catch {}
    } else {
      setSelectedMpState(cleanedName);
      try {
        localStorage.setItem(MP_STORAGE_KEY, cleanedName);
      } catch {}
    }
  };

  const availableDistricts = liveDistricts.length > 0
    ? liveDistricts
    : (STATE_DISTRICTS[selectedState] || ["District Headquarters", "Central Block", "North Division", "South Division"]);

  const availableMps = liveMps.length > 0 ? liveMps : getMpsForState(selectedState);

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
        selectedMpKey,
        setSelectedMpKey,
        roleMeta: ROLE_DEFINITIONS[role],
        availableStates,
        availableDistricts,
        availableMps,
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
