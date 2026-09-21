"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type ComponentType } from "react";
import {
  Bell,
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  FileText,
  LogOut,
  MapPin,
  Settings,
  ShieldCheck,
  UserRound,
  X,
  Layers,
  Landmark,
  Building2,
  Briefcase,
  UserCheck,
  AlertTriangle,
  BarChart3,
  Sparkles,
  TrendingUp,
  Clock,
  Download,
} from "lucide-react";
import { useRole, ROLES, type RoleType } from "@/context/RoleContext";

interface PageMeta {
  title: string;
  badge: string;
  subtext: string;
  icon: ComponentType<{ size?: number; className?: string; strokeWidth?: number }>;
}

const PAGE_CONFIG: Record<string, PageMeta> = {
  "/": {
    title: "Executive Command Overview",
    badge: "MoSPI AI Monitor",
    subtext: "Pan-India sovereign fund & risk oversight",
    icon: Landmark,
  },
  "/fraud-detection": {
    title: "Fraud & Duplicate Detection",
    badge: "TF-IDF Cosine NLP",
    subtext: "Near-duplicate work pairs & collusion alerts",
    icon: ShieldCheck,
  },
  "/vendor-intelligence": {
    title: "Vendor Cartel & Monopoly Intelligence",
    badge: "Benford's Law + HHI",
    subtext: "Vendor concentration, split contracts & cartel AI",
    icon: Building2,
  },
  "/fund-utilization": {
    title: "Fund Allocation & Utilization",
    badge: "PFMS Central Sync",
    subtext: "Sanctions, disbursements & expenditure velocity",
    icon: Landmark,
  },
  "/geo-verification": {
    title: "Geotagging & Computer Vision",
    badge: "ISRO Bhuvan GIS",
    subtext: "Satellite coordinate validation & asset photo audits",
    icon: MapPin,
  },
  "/anomaly-detection": {
    title: "Statistical Anomaly Detection",
    badge: "Isolation Forest AI",
    subtext: "Outlier expenditures, abnormal durations & unit costs",
    icon: AlertTriangle,
  },
  "/inefficiency-detection": {
    title: "Bottlenecks & Inefficiency Engine",
    badge: "SLA Drift AI",
    subtext: "Execution velocity, approval lags & stranded capital",
    icon: Briefcase,
  },
  "/district-intelligence": {
    title: "District Governance Intelligence",
    badge: "Comparative Benchmark",
    subtext: "Inter-district rankings, scorecards & absorption rates",
    icon: Layers,
  },
  "/outcome-analytics": {
    title: "Socio-Economic Outcome Analytics",
    badge: "SDG & Impact Engine",
    subtext: "Asset longevity, citizen demographic utility & returns",
    icon: BarChart3,
  },
  "/risk-insights": {
    title: "Predictive Risk & Early Warning",
    badge: "Gradient Boosted ML",
    subtext: "Pre-emptive default, delay & statutory violation risks",
    icon: Sparkles,
  },
  "/trend-forecasting": {
    title: "Fund Flow & Trend Forecasting",
    badge: "Prophet Time-Series",
    subtext: "Multi-year disbursement forecasts & capacity planning",
    icon: TrendingUp,
  },
  "/alerts-actions": {
    title: "Alerts & Statutory Directives",
    badge: "Enforcement Queue",
    subtext: "Show-cause notices, site audits & stop-work orders",
    icon: Bell,
  },
  "/audit-trail": {
    title: "Immutable Audit Trail",
    badge: "Cryptographic Provenance",
    subtext: "Tamper-evident system logs & governance event stream",
    icon: FileText,
  },
  "/works": {
    title: "Works Registry & Repository",
    badge: "Master Database",
    subtext: "Sanctioned projects, progress records & milestones",
    icon: FileText,
  },
  "/reports": {
    title: "Statutory Reports & Dossiers",
    badge: "CAG & PAC Compliant",
    subtext: "Audit-ready exports, analytical dossiers & data packs",
    icon: Download,
  },
  "/map": {
    title: "Geospatial GIS Map Command",
    badge: "Live Geo Boundary",
    subtext: "Constituency geofences & spatial asset density",
    icon: MapPin,
  },
  "/queue": {
    title: "High Risk Review Queue",
    badge: "Priority Adjudication",
    subtext: "Collectorate review & fast-track disposition",
    icon: Clock,
  },
  "/settings": {
    title: "System Settings & Thresholds",
    badge: "Governance Config",
    subtext: "Risk hyperparameters, ML sensitivities & notifications",
    icon: Settings,
  },
  "/users-roles": {
    title: "Governance User Directory",
    badge: "Multi-Tier RBAC",
    subtext: "Role permissions & jurisdictional access boundaries",
    icon: UserCheck,
  },
};

const regions = [
  "All India",
  "Andhra Pradesh",
  "Bihar",
  "Delhi",
  "Gujarat",
  "Haryana",
  "Karnataka",
  "Madhya Pradesh",
  "Maharashtra",
  "Rajasthan",
  "Tamil Nadu",
  "Telangana",
  "Uttar Pradesh",
  "West Bengal",
];

const initialStartDate = new Date(2023, 3, 1);
const initialEndDate = new Date(2024, 3, 30);

const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const weekDays = [
  "Su",
  "Mo",
  "Tu",
  "We",
  "Th",
  "Fr",
  "Sa",
];

const notificationItems = [
  {
    id: 1,
    title: "High-risk work detected",
    description: "3 works require immediate review",
    time: "12 min ago",
  },
  {
    id: 2,
    title: "Fund utilization alert",
    description: "Utilization below expected threshold",
    time: "28 min ago",
  },
  {
    id: 3,
    title: "Geo verification pending",
    description: "7 works are awaiting verification",
    time: "1 hr ago",
  },
];

function formatDate(date: Date) {
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatRange(
  startDate: Date | null,
  endDate: Date | null,
) {
  if (!startDate) {
    return "Select date range";
  }

  if (!endDate) {
    return `${formatDate(startDate)} - Select end date`;
  }

  return `${formatDate(startDate)} - ${formatDate(endDate)}`;
}

function isSameDate(
  firstDate: Date | null,
  secondDate: Date | null,
) {
  if (!firstDate || !secondDate) {
    return false;
  }

  return (
    firstDate.getFullYear() === secondDate.getFullYear() &&
    firstDate.getMonth() === secondDate.getMonth() &&
    firstDate.getDate() === secondDate.getDate()
  );
}

function isDateBefore(
  firstDate: Date,
  secondDate: Date,
) {
  return firstDate.getTime() < secondDate.getTime();
}

function isDateBetween(
  date: Date,
  startDate: Date | null,
  endDate: Date | null,
) {
  if (!startDate || !endDate) {
    return false;
  }

  return (
    date.getTime() > startDate.getTime() &&
    date.getTime() < endDate.getTime()
  );
}

function getCalendarDays(
  month: number,
  year: number,
) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(
    year,
    month + 1,
    0,
  ).getDate();

  const previousMonthDays = new Date(
    year,
    month,
    0,
  ).getDate();

  const days = [];

  for (let index = firstDay - 1; index >= 0; index--) {
    days.push({
      date: new Date(
        year,
        month - 1,
        previousMonthDays - index,
      ),
      currentMonth: false,
    });
  }

  for (
    let day = 1;
    day <= daysInMonth;
    day++
  ) {
    days.push({
      date: new Date(year, month, day),
      currentMonth: true,
    });
  }

  let nextDay = 1;

  while (days.length < 42) {
    days.push({
      date: new Date(
        year,
        month + 1,
        nextDay,
      ),
      currentMonth: false,
    });

    nextDay++;
  }

  return days;
}

export default function TopBar() {
  const pathname = usePathname();
  const {
    role,
    setRole,
    roleMeta,
    selectedState,
    setSelectedState,
    selectedDistrict,
    selectedMp,
  } = useRole();

  const [selectedRegion, setSelectedRegion] = useState("All India");
  const [roleOpen, setRoleOpen] = useState(false);
  const [regionOpen, setRegionOpen] = useState(false);
  const [dateOpen, setDateOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const [startDate, setStartDate] = useState<Date | null>(initialStartDate);
  const [endDate, setEndDate] = useState<Date | null>(initialEndDate);
  const [calendarMonth, setCalendarMonth] = useState(initialStartDate.getMonth());
  const [calendarYear, setCalendarYear] = useState(initialStartDate.getFullYear());
  const [draftStartDate, setDraftStartDate] = useState<Date | null>(initialStartDate);
  const [draftEndDate, setDraftEndDate] = useState<Date | null>(initialEndDate);
  const [notifications, setNotifications] = useState(notificationItems);

  const roleRef = useRef<HTMLDivElement>(null);
  const regionRef = useRef<HTMLDivElement>(null);
  const dateRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);
  const helpRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const displayRegion =
    role === "ministry"
      ? selectedRegion
      : role === "state"
      ? selectedState
      : selectedDistrict || "Constituency";

  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);

  useEffect(() => {
    const checkCollapsed = () => {
      const v = typeof window !== "undefined" ? localStorage.getItem("sidebar-collapsed-v2") : null;
      setSidebarCollapsed(v !== "false");
    };
    checkCollapsed();
    window.addEventListener("storage", checkCollapsed);
    const interval = setInterval(checkCollapsed, 150);
    return () => {
      window.removeEventListener("storage", checkCollapsed);
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;

      if (roleRef.current && !roleRef.current.contains(target)) {
        setRoleOpen(false);
      }
      if (regionRef.current && !regionRef.current.contains(target)) {
        setRegionOpen(false);
      }
      if (dateRef.current && !dateRef.current.contains(target)) {
        setDateOpen(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(target)) {
        setNotificationOpen(false);
      }
      if (helpRef.current && !helpRef.current.contains(target)) {
        setHelpOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(target)) {
        setProfileOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  function toggleRole() {
    setRoleOpen((value) => !value);
    setRegionOpen(false);
    setDateOpen(false);
    setNotificationOpen(false);
    setHelpOpen(false);
    setProfileOpen(false);
  }

  function toggleRegion() {
    setRegionOpen((value) => !value);
    setRoleOpen(false);
    setDateOpen(false);
    setNotificationOpen(false);
    setHelpOpen(false);
    setProfileOpen(false);
  }

  function toggleDate() {
    setDateOpen((value) => !value);
    setRoleOpen(false);
    setRegionOpen(false);
    setNotificationOpen(false);
    setHelpOpen(false);
    setProfileOpen(false);

    setDraftStartDate(startDate);
    setDraftEndDate(endDate);

    if (startDate) {
      setCalendarMonth(startDate.getMonth());
      setCalendarYear(startDate.getFullYear());
    }
  }

  function toggleNotifications() {
    setNotificationOpen((value) => !value);
    setRoleOpen(false);
    setRegionOpen(false);
    setDateOpen(false);
    setHelpOpen(false);
    setProfileOpen(false);
  }

  function toggleHelp() {
    setHelpOpen((value) => !value);
    setRoleOpen(false);
    setRegionOpen(false);
    setDateOpen(false);
    setNotificationOpen(false);
    setProfileOpen(false);
  }

  function toggleProfile() {
    setProfileOpen((value) => !value);
    setRoleOpen(false);
    setRegionOpen(false);
    setDateOpen(false);
    setNotificationOpen(false);
    setHelpOpen(false);
  }

  function handleDateSelect(date: Date) {
    if (!draftStartDate || (draftStartDate && draftEndDate)) {
      setDraftStartDate(date);
      setDraftEndDate(null);
      return;
    }

    if (draftStartDate && !draftEndDate) {
      if (isDateBefore(date, draftStartDate)) {
        setDraftStartDate(date);
        setDraftEndDate(draftStartDate);
      } else {
        setDraftEndDate(date);
      }
    }
  }

  function moveMonth(direction: number) {
    const nextMonth = new Date(
      calendarYear,
      calendarMonth + direction,
      1,
    );
    setCalendarMonth(nextMonth.getMonth());
    setCalendarYear(nextMonth.getFullYear());
  }

  function applyDateRange() {
    if (draftStartDate && draftEndDate) {
      setStartDate(draftStartDate);
      setEndDate(draftEndDate);
      setDateOpen(false);
    }
  }

  function cancelDateRange() {
    setDraftStartDate(startDate);
    setDraftEndDate(endDate);
    setDateOpen(false);
  }

  function clearDateRange() {
    setDraftStartDate(null);
    setDraftEndDate(null);
  }

  function markNotificationsRead() {
    setNotifications([]);
  }

  const calendarDays = getCalendarDays(calendarMonth, calendarYear);

  // Derive page metadata for essential pinned information
  let pageInfo = PAGE_CONFIG[pathname];
  if (!pageInfo && pathname.startsWith("/work/")) {
    pageInfo = {
      title: "Work Lifecycle & Audit Inspection",
      badge: "Project Dossier",
      subtext: "Sanctions, payment tranches & geospatial proof",
      icon: FileText,
    };
  }
  if (!pageInfo) {
    pageInfo = {
      title: "TransparenSee AI Governance",
      badge: "MPLADS Monitor",
      subtext: "Statutory surveillance & compliance suite",
      icon: ShieldCheck,
    };
  }

  const PageIcon = pageInfo.icon;

  const jurisdictionText =
    role === "ministry"
      ? "National MoSPI (All India)"
      : role === "state"
      ? `${selectedState} State Tier`
      : role === "district"
      ? `${selectedDistrict} Collectorate`
      : `${selectedMp.split(" (")[0]}`;

  return (
    <header
      className="fixed right-0 top-0 z-40 h-[54px] border-b border-[#EAECF0] bg-white transition-all duration-200 ease-out"
      style={{ left: sidebarCollapsed ? "64px" : "260px" }}
    >
      <div className="flex h-full w-full items-center justify-between px-4 sm:px-5">
        {/* ================= LEFT: ESSENTIAL INFO AS PER PAGE ================= */}
        <div className="flex min-w-0 items-center gap-2.5 pr-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-blue-100 bg-blue-50/80 text-blue-600 shadow-sm">
            <PageIcon size={16} strokeWidth={2} />
          </div>

          <div className="flex min-w-0 flex-col">
            <div className="flex items-center gap-2">
              <span className="truncate text-[13px] font-bold leading-tight text-[#101828]">
                {pageInfo.title}
              </span>
              <span className="hidden sm:inline-flex shrink-0 items-center rounded bg-blue-50 border border-blue-200/70 px-1.5 py-0.5 text-[9px] font-bold text-blue-700 tracking-tight leading-none">
                {pageInfo.badge}
              </span>
            </div>

            <div className="mt-0.5 flex items-center gap-1.5 text-[10px] text-[#667085] leading-none">
              <span className="font-semibold text-blue-600 truncate">
                {jurisdictionText}
              </span>
              <span className="hidden md:inline-block text-slate-300">•</span>
              <span className="hidden md:inline-block text-slate-400 font-medium truncate">
                {pageInfo.subtext}
              </span>
            </div>
          </div>
        </div>

        {/* ================= RIGHT: ESSENTIAL CONTROLS & GOVERNANCE ================= */}
        <div className="flex shrink-0 items-center gap-[6px] sm:gap-[7px]">
          {/* Active Governance Role Tier Selector */}
          <div ref={roleRef} className="relative">
            <button
              type="button"
              onClick={toggleRole}
              aria-label="Select governance tier role"
              className="flex h-[32px] items-center gap-[6px] rounded-[6px] border border-[#D0D5DD] bg-gradient-to-r from-slate-50 to-white px-[8px] shadow-[0_1px_2px_rgba(16,24,40,0.03)] transition-all duration-150 hover:border-[#B4BCC7] hover:bg-slate-50"
            >
              <span className="flex h-[18px] w-[18px] items-center justify-center rounded-full bg-blue-100 text-blue-700 text-[9px] font-extrabold tracking-tight">
                {role === "ministry" ? "N" : role === "state" ? "S" : role === "district" ? "D" : "MP"}
              </span>

              <div className="flex flex-col items-start text-left">
                <span className="truncate !text-[11px] !font-bold !leading-[13px] !text-[#101828]">
                  {role === "ministry" ? "Ministry" : role === "state" ? "State" : role === "district" ? "District" : "MP"}
                </span>
                <span className="truncate !text-[8px] !font-semibold uppercase tracking-wider !leading-[9px] !text-blue-600">
                  {roleMeta.tier}
                </span>
              </div>

              <ChevronDown
                size={13}
                strokeWidth={1.8}
                className={[
                  "ml-0.5 shrink-0 text-[#667085]",
                  "transition-transform duration-150",
                  roleOpen ? "rotate-180" : "",
                ].join(" ")}
              />
            </button>

            {roleOpen && (
              <div className="absolute right-0 top-[44px] z-[75] w-[260px] overflow-hidden rounded-[8px] border border-[#EAECF0] bg-white p-[6px] shadow-[0_12px_28px_rgba(16,24,40,0.14)] animate-dashboard-in">
                <div className="px-2 py-1.5 border-b border-slate-100 mb-1">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Governance Tier Access
                  </p>
                  <p className="text-[9px] text-slate-500">
                    Role-Based Access & Geographical Scope
                  </p>
                </div>
                {(["ministry", "state", "district", "mp"] as RoleType[]).map((rKey) => {
                  const meta = ROLES[rKey];
                  const isSelected = role === rKey;
                  return (
                    <button
                      key={rKey}
                      type="button"
                      onClick={() => {
                        setRole(rKey);
                        setRoleOpen(false);
                      }}
                      className={[
                        "flex w-full items-start gap-2 rounded-[6px] p-2 text-left transition-all duration-150",
                        isSelected
                          ? "bg-blue-50/80 border border-blue-200"
                          : "hover:bg-slate-50 border border-transparent",
                      ].join(" ")}
                    >
                      <div className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-[10px] font-bold ${
                        isSelected ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600"
                      }`}>
                        {rKey === "ministry" ? "N" : rKey === "state" ? "S" : rKey === "district" ? "D" : "MP"}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <span className={`text-[11px] font-bold leading-tight ${isSelected ? "text-blue-900" : "text-slate-800"}`}>
                            {meta.label}
                          </span>
                          <span className="text-[8px] font-semibold text-slate-400 uppercase tracking-wider">
                            {meta.tier}
                          </span>
                        </div>
                        <p className="text-[9px] text-slate-500 line-clamp-1 mt-0.5">
                          {meta.subtitle}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Region / District Dropdown */}
          <div ref={regionRef} className="relative">
            <button
              type="button"
              onClick={toggleRegion}
              className="flex h-[32px] w-[110px] sm:w-[120px] items-center justify-between rounded-[6px] border border-[#E4E7EC] bg-white px-[8px] transition-all duration-150 hover:border-[#D0D5DD] hover:bg-[#F9FAFB]"
            >
              <span className="flex min-w-0 items-center gap-[5px]">
                <MapPin
                  size={12}
                  strokeWidth={1.8}
                  className="shrink-0 text-[#667085]"
                />

                <span className="truncate !text-[11px] !font-medium !leading-[14px] !text-[#344054]">
                  {displayRegion}
                </span>
              </span>

              <ChevronDown
                size={14}
                strokeWidth={1.8}
                className={[
                  "shrink-0 text-[#667085]",
                  "transition-transform duration-150",
                  regionOpen ? "rotate-180" : "",
                ].join(" ")}
              />
            </button>

            {regionOpen && (
              <div className="absolute right-0 top-[44px] z-[70] w-[205px] overflow-hidden rounded-[8px] border border-[#EAECF0] bg-white p-[5px] shadow-[0_10px_26px_rgba(16,24,40,0.12)]">
                {regions.map((region) => {
                  const selected =
                    selectedRegion === region || (role === "state" && selectedState === region);

                  return (
                    <button
                      key={region}
                      type="button"
                      onClick={() => {
                        setSelectedRegion(region);
                        if (region !== "All India") {
                          setSelectedState(region);
                        }
                        setRegionOpen(false);
                      }}
                      className={[
                        "flex h-[31px] w-full items-center rounded-[5px] px-[9px] !text-[11px] !font-medium !leading-[14px] text-left transition-colors duration-150",
                        selected
                          ? "!bg-[#EEF4FF] !font-semibold !text-[#2563EB]"
                          : "!text-[#344054] hover:!bg-[#F7F9FC]",
                      ].join(" ")}
                    >
                      {region}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Date Range Picker */}
          <div ref={dateRef} className="relative hidden md:block">
            <button
              type="button"
              onClick={toggleDate}
              aria-label="Select date range"
              className="flex h-[32px] w-[185px] items-center justify-between rounded-[6px] border border-[#E4E7EC] bg-white px-[9px] transition-all duration-150 hover:border-[#D0D5DD] hover:bg-[#F9FAFB]"
            >
              <span className="truncate !text-[10.5px] !font-medium !leading-[14px] !text-[#344054]">
                {formatRange(startDate, endDate)}
              </span>

              <CalendarDays
                size={13}
                strokeWidth={1.7}
                className="ml-[6px] shrink-0 text-[#667085]"
              />
            </button>

            {dateOpen && (
              <div className="absolute right-0 top-[44px] z-[75] w-[340px] overflow-hidden rounded-[10px] border border-[#EAECF0] bg-white shadow-[0_14px_35px_rgba(16,24,40,0.14)]">
                <div className="flex items-center justify-between border-b border-[#F2F4F7] px-[15px] py-[11px]">
                  <div>
                    <p className="!text-[11px] !font-semibold !leading-[15px] !text-[#101828]">
                      Select date range
                    </p>
                    <p className="mt-[2px] !text-[8px] !font-medium !leading-[12px] !text-[#98A2B3]">
                      Choose start and end date
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={cancelDateRange}
                    className="flex h-[25px] w-[25px] items-center justify-center rounded-[5px] text-[#667085] hover:bg-[#F2F4F7]"
                  >
                    <X size={14} strokeWidth={1.8} />
                  </button>
                </div>

                <div className="px-[15px] pt-[12px]">
                  <div className="mb-[11px] grid grid-cols-2 gap-[7px]">
                    <div className="rounded-[6px] border border-[#E4E7EC] bg-[#F9FAFB] px-[9px] py-[7px]">
                      <p className="!text-[7px] !font-semibold uppercase !leading-[10px] !tracking-[0.04em] !text-[#98A2B3]">
                        Start Date
                      </p>
                      <p className="mt-[2px] !text-[9px] !font-semibold !leading-[13px] !text-[#344054]">
                        {draftStartDate ? formatDate(draftStartDate) : "Not selected"}
                      </p>
                    </div>

                    <div className="rounded-[6px] border border-[#E4E7EC] bg-[#F9FAFB] px-[9px] py-[7px]">
                      <p className="!text-[7px] !font-semibold uppercase !leading-[10px] !tracking-[0.04em] !text-[#98A2B3]">
                        End Date
                      </p>
                      <p className="mt-[2px] !text-[9px] !font-semibold !leading-[13px] !text-[#344054]">
                        {draftEndDate ? formatDate(draftEndDate) : "Not selected"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => moveMonth(-1)}
                      className="flex h-[27px] w-[27px] items-center justify-center rounded-[5px] text-[#667085] hover:bg-[#F2F4F7]"
                    >
                      <ChevronLeft size={14} strokeWidth={1.8} />
                    </button>

                    <p className="!text-[10px] !font-semibold !leading-[14px] !text-[#344054]">
                      {monthNames[calendarMonth]} {calendarYear}
                    </p>

                    <button
                      type="button"
                      onClick={() => moveMonth(1)}
                      className="flex h-[27px] w-[27px] items-center justify-center rounded-[5px] text-[#667085] hover:bg-[#F2F4F7]"
                    >
                      <ChevronRight size={14} strokeWidth={1.8} />
                    </button>
                  </div>

                  <div className="mt-[8px] grid grid-cols-7">
                    {weekDays.map((day) => (
                      <div
                        key={day}
                        className="flex h-[25px] items-center justify-center !text-[8px] !font-semibold !leading-[11px] !text-[#98A2B3]"
                      >
                        {day}
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-7">
                    {calendarDays.map(({ date, currentMonth }) => {
                      const selectedStart = isSameDate(date, draftStartDate);
                      const selectedEnd = isSameDate(date, draftEndDate);
                      const between = isDateBetween(date, draftStartDate, draftEndDate);
                      const selected = selectedStart || selectedEnd;
                      const today = isSameDate(date, new Date());

                      return (
                        <button
                          key={date.toISOString()}
                          type="button"
                          onClick={() => handleDateSelect(date)}
                          className={[
                            "relative flex h-[31px] items-center justify-center !text-[9px] !font-medium !leading-[12px] transition-colors duration-100",
                            currentMonth ? "!text-[#344054]" : "!text-[#D0D5DD]",
                            between ? "bg-[#EEF4FF]" : "",
                            selectedStart ? "rounded-l-[5px] bg-[#2563EB] !text-white" : "",
                            selectedEnd ? "rounded-r-[5px] bg-[#2563EB] !text-white" : "",
                            !selected && !between ? "hover:bg-[#F2F4F7]" : "",
                          ].join(" ")}
                        >
                          {date.getDate()}
                          {today && !selected && (
                            <span className="absolute bottom-[3px] h-[2px] w-[2px] rounded-full bg-[#2563EB]" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="mt-[10px] flex items-center justify-between border-t border-[#F2F4F7] px-[15px] py-[10px]">
                  <button
                    type="button"
                    onClick={clearDateRange}
                    className="!text-[9px] !font-medium !leading-[13px] !text-[#667085] hover:!text-[#344054]"
                  >
                    Clear
                  </button>

                  <div className="flex items-center gap-[6px]">
                    <button
                      type="button"
                      onClick={cancelDateRange}
                      className="h-[28px] rounded-[5px] border border-[#D0D5DD] bg-white px-[10px] !text-[9px] !font-semibold !leading-[13px] !text-[#344054] hover:bg-[#F9FAFB]"
                    >
                      Cancel
                    </button>

                    <button
                      type="button"
                      onClick={applyDateRange}
                      disabled={!draftStartDate || !draftEndDate}
                      className="h-[28px] rounded-[5px] bg-[#2563EB] px-[11px] !text-[9px] !font-semibold !leading-[13px] text-white transition-colors hover:bg-[#1D4ED8] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Apply
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Notifications Bell */}
          <div ref={notificationRef} className="relative">
            <button
              type="button"
              aria-label="Notifications"
              onClick={toggleNotifications}
              className="relative flex h-[32px] w-[30px] items-center justify-center rounded-[6px] border-0 bg-transparent text-[#475467] transition-colors duration-150 hover:bg-[#F2F4F7]"
            >
              <Bell size={16} strokeWidth={1.8} />

              {notifications.length > 0 && (
                <span className="absolute right-[2px] top-[2px] flex h-[13px] min-w-[13px] items-center justify-center rounded-full bg-[#F04438] px-[3px] !text-[8px] !font-bold !leading-none text-white">
                  {notifications.length}
                </span>
              )}
            </button>

            {notificationOpen && (
              <div className="absolute right-0 top-[44px] z-[75] w-[320px] overflow-hidden rounded-[9px] border border-[#EAECF0] bg-white shadow-[0_12px_30px_rgba(16,24,40,0.14)]">
                <div className="flex items-center justify-between border-b border-[#F2F4F7] px-[18px] py-[14px]">
                  <div>
                    <p className="!text-[11px] !font-semibold !leading-[14px] !text-[#101828]">
                      Notifications
                    </p>
                    <p className="mt-[2px] !text-[10px] !font-medium !leading-[11px] !text-[#98A2B3]">
                      Latest monitoring alerts
                    </p>
                  </div>

                  {notifications.length > 0 && (
                    <button
                      type="button"
                      onClick={markNotificationsRead}
                      className="!text-[10px] !font-semibold !leading-[11px] !text-[#2563EB] hover:!text-[#1D4ED8]"
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                <div className="max-h-[250px] overflow-y-auto">
                  {notifications.length > 0 ? (
                    notifications.map((notification) => (
                      <button
                        key={notification.id}
                        type="button"
                        className="flex w-full items-start gap-[9px] border-b border-[#F2F4F7] px-[18px] py-[12px] text-left transition-colors hover:bg-[#F9FAFB]"
                      >
                        <span className="mt-[1px] flex h-[25px] w-[25px] shrink-0 items-center justify-center rounded-[6px] bg-[#FEF3F2] text-[#F04438]">
                          <ShieldCheck size={15} strokeWidth={1.8} />
                        </span>

                        <span className="min-w-0">
                          <span className="block !text-[11px] !font-semibold !leading-[13px] !text-[#344054]">
                            {notification.title}
                          </span>
                          <span className="mt-[2px] block !text-[11px] !font-medium !leading-[13px] !text-[#667085]">
                            {notification.description}
                          </span>
                          <span className="mt-[4px] block !text-[10px] !font-medium !leading-[12px] !text-[#98A2B3]">
                            {notification.time}
                          </span>
                        </span>
                      </button>
                    ))
                  ) : (
                    <div className="px-[15px] py-[25px] text-center">
                      <Bell size={18} strokeWidth={1.6} className="mx-auto text-[#98A2B3]" />
                      <p className="mt-[7px] !text-[11px] !font-semibold !leading-[13px] !text-[#344054]">
                        No new notifications
                      </p>
                    </div>
                  )}
                </div>

                <div className="border-t border-[#F2F4F7] px-[18px] py-[10px]">
                  <Link
                    href="/alerts-actions"
                    onClick={() => setNotificationOpen(false)}
                    className="flex items-center justify-center !text-[11px] !font-semibold !leading-[13px] !text-[#2563EB] hover:!text-[#1D4ED8]"
                  >
                    View all alerts
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Help & Support */}
          <div ref={helpRef} className="relative">
            <button
              type="button"
              aria-label="Help"
              onClick={toggleHelp}
              className="flex h-[32px] w-[30px] items-center justify-center rounded-[6px] border-0 bg-transparent text-[#475467] transition-colors duration-150 hover:bg-[#F2F4F7]"
            >
              <CircleHelp size={16} strokeWidth={1.8} />
            </button>

            {helpOpen && (
              <div className="absolute right-0 top-[44px] z-[75] w-[235px] overflow-hidden rounded-[9px] border border-[#EAECF0] bg-white p-[5px] shadow-[0_12px_30px_rgba(16,24,40,0.14)]">
                <div className="px-[9px] pb-[8px] pt-[7px]">
                  <p className="!text-[11px] !font-semibold !leading-[14px] !text-[#101828]">
                    Help & Support
                  </p>
                  <p className="mt-[2px] !text-[10px] !font-medium !leading-[12px] !text-[#98A2B3]">
                    Quick access to TransparenSee resources
                  </p>
                </div>

                <Link
                  href="/reports"
                  onClick={() => setHelpOpen(false)}
                  className="flex h-[34px] items-center gap-[8px] rounded-[6px] px-[8px] !text-[11px] !font-medium !leading-[14px] !text-[#344054] hover:bg-[#F7F9FC]"
                >
                  <span className="flex h-[23px] w-[23px] items-center justify-center rounded-[6px] bg-[#F2F4F7] text-[#667085]">
                    <FileText size={14} strokeWidth={1.8} />
                  </span>
                  Documentation
                </Link>

                <Link
                  href="/alerts-actions"
                  onClick={() => setHelpOpen(false)}
                  className="flex h-[34px] items-center gap-[8px] rounded-[6px] px-[8px] !text-[11px] !font-medium !leading-[14px] !text-[#344054] hover:bg-[#F7F9FC]"
                >
                  <span className="flex h-[23px] w-[23px] items-center justify-center rounded-[6px] bg-[#F2F4F7] text-[#667085]">
                    <ShieldCheck size={14} strokeWidth={1.8} />
                  </span>
                  Risk & Alert Guidance
                </Link>

                <Link
                  href="/settings"
                  onClick={() => setHelpOpen(false)}
                  className="flex h-[34px] items-center gap-[8px] rounded-[6px] px-[8px] !text-[11px] !font-medium !leading-[14px] !text-[#344054] hover:bg-[#F7F9FC]"
                >
                  <span className="flex h-[23px] w-[23px] items-center justify-center rounded-[6px] bg-[#F2F4F7] text-[#667085]">
                    <CircleHelp size={14} strokeWidth={1.8} />
                  </span>
                  Contact Support
                </Link>
              </div>
            )}
          </div>

          {/* Profile Dropdown */}
          <div ref={profileRef} className="relative ml-[1px]">
            <button
              type="button"
              onClick={toggleProfile}
              className={[
                "flex h-[34px] items-center gap-[6px] rounded-[7px] border-0 bg-transparent px-[3px] pr-[2px] transition-colors duration-150 hover:bg-[#F9FAFB]",
                profileOpen ? "bg-[#F9FAFB]" : "",
              ].join(" ")}
            >
              <div className="relative flex h-[28px] w-[28px] shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#F1E2D3] !text-[13px] !font-bold !leading-none text-[#8A5A3B]">
                A
                <span className="absolute bottom-0 right-0 h-[6px] w-[6px] rounded-full border-[1.5px] border-white bg-[#12B76A]" />
              </div>

              <div className="hidden lg:block min-w-[50px] text-left">
                <div className="truncate !text-[11px] !font-semibold !leading-[13px] !text-[#101828]">
                  Admin
                </div>
                <div className="mt-[1px] truncate !text-[9px] !font-medium !leading-[10px] !text-[#98A2B3]">
                  System Admin
                </div>
              </div>

              <ChevronDown
                size={12}
                strokeWidth={1.8}
                className={[
                  "text-[#667085]",
                  "transition-transform duration-150",
                  profileOpen ? "rotate-180" : "",
                ].join(" ")}
              />
            </button>

            {profileOpen && (
              <div className="absolute right-0 top-[44px] z-[80] w-[215px] overflow-hidden rounded-[9px] border border-[#EAECF0] bg-white p-[5px] shadow-[0_12px_30px_rgba(16,24,40,0.14)]">
                <div className="px-[9px] pb-[9px] pt-[8px]">
                  <div className="flex items-center gap-[9px]">
                    <div className="relative flex h-[35px] w-[35px] shrink-0 items-center justify-center rounded-full bg-blue-100 !text-[13px] !font-bold text-blue-800">
                      {role === "ministry" ? "DG" : role === "state" ? "CS" : role === "district" ? "DM" : "MP"}
                      <span className="absolute bottom-0 right-0 h-[8px] w-[8px] rounded-full border-[2px] border-white bg-[#12B76A]" />
                    </div>

                    <div className="min-w-0">
                      <div className="truncate !text-[12px] !font-semibold !leading-[13px] !text-[#101828]">
                        {role === "ministry" ? "National Overseer" : role === "state" ? "Chief Secretary" : role === "district" ? "District Collector" : selectedMp.split(" (")[0]}
                      </div>

                      <div className="mt-[2px] truncate !text-[10px] !font-medium !text-blue-600">
                        {roleMeta.authority}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="h-px bg-[#F2F4F7]" />

                <div className="py-[4px]">
                  <Link
                    href="/users-roles"
                    onClick={() => setProfileOpen(false)}
                    className="flex h-[35px] items-center gap-[8px] rounded-[6px] px-[8px] !text-[11px] !font-medium !leading-[14px] !text-[#344054] hover:bg-[#F7F9FC]"
                  >
                    <span className="flex h-[24px] w-[24px] items-center justify-center rounded-[6px] bg-[#F2F4F7] text-[#667085]">
                      <UserRound size={14} strokeWidth={1.8} />
                    </span>
                    My Profile
                  </Link>

                  <Link
                    href="/settings"
                    onClick={() => setProfileOpen(false)}
                    className="flex h-[35px] items-center gap-[8px] rounded-[6px] px-[8px] !text-[11px] !font-medium !leading-[14px] !text-[#344054] hover:bg-[#F7F9FC]"
                  >
                    <span className="flex h-[24px] w-[24px] items-center justify-center rounded-[6px] bg-[#F2F4F7] text-[#667085]">
                      <Settings size={14} strokeWidth={1.8} />
                    </span>
                    Account Settings
                  </Link>

                  <div className="my-[4px] h-px bg-[#F2F4F7]" />

                  <button
                    type="button"
                    onClick={() => {
                      setProfileOpen(false);
                    }}
                    className="flex h-[35px] w-full items-center gap-[8px] rounded-[6px] px-[8px] !text-[11px] !font-medium !leading-[14px] !text-[#D92D20] hover:bg-[#FEF3F2]"
                  >
                    <span className="flex h-[24px] w-[24px] items-center justify-center rounded-[6px] bg-[#FEF3F2] text-[#D92D20]">
                      <LogOut size={14} strokeWidth={1.8} />
                    </span>
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}