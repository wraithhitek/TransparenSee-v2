"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import {
  AlertTriangle,
  BellRing,
  Building2,
  ChartNoAxesCombined,
  ClipboardCheck,
  FileBarChart,
  FileClock,
  Gauge,
  LayoutDashboard,
  MapPinned,
  Network,
  Radar,
  Settings,
  ShieldAlert,
  TrendingUp,
  Users,
  WalletCards,
  ChevronLeft,
  ChevronRight,
  type LucideIcon,
} from "lucide-react";

type NavItem = { label: string; href: string; icon: LucideIcon };

const monitoringItems: NavItem[] = [
  { label: "Works",               href: "/works",                 icon: ClipboardCheck },
  { label: "Investigation Queue", href: "/queue",                 icon: Radar },
  { label: "Map View",            href: "/map",                   icon: MapPinned },
  { label: "Fund Utilization",    href: "/fund-utilization",      icon: WalletCards },
  { label: "AI Risk Insights",    href: "/risk-insights",         icon: ChartNoAxesCombined },
  { label: "Anomaly Detection",   href: "/anomaly-detection",     icon: AlertTriangle },
  { label: "Fraud Detection",     href: "/fraud-detection",       icon: ShieldAlert },
  { label: "Inefficiency Detection", href: "/inefficiency-detection", icon: Gauge },
  { label: "Geo Verification",    href: "/geo-verification",      icon: Network },
];

const analyticsItems: NavItem[] = [
  { label: "District Intelligence", href: "/district-intelligence", icon: Building2 },
  { label: "Vendor Intelligence",   href: "/vendor-intelligence",   icon: Network },
  { label: "Trend & Forecasting",   href: "/trend-forecasting",     icon: TrendingUp },
  { label: "Outcome Analytics",     href: "/outcome-analytics",     icon: ChartNoAxesCombined },
];

const managementItems: NavItem[] = [
  { label: "Alerts & Actions", href: "/alerts-actions", icon: BellRing },
  { label: "Reports",          href: "/reports",         icon: FileBarChart },
  { label: "Audit Trail",      href: "/audit-trail",     icon: FileClock },
  { label: "Users & Roles",    href: "/users-roles",     icon: Users },
  { label: "Settings",         href: "/settings",        icon: Settings },
];

function NavigationSection({
  title, items, pathname, collapsed,
}: {
  title: string; items: NavItem[]; pathname: string; collapsed: boolean;
}) {
  return (
    <section className="mb-4">
      {!collapsed && (
        <div className="mb-2 flex items-center gap-2 px-3">
          <span className="h-px w-3 bg-[#294563]" />
          <span className="text-[9px] font-semibold uppercase tracking-[1.1px] text-[#6f89a4]">
            {title}
          </span>
        </div>
      )}
      {collapsed && <div className="mb-1 mx-2 h-px bg-[#1e3a52]" />}

      <div className="space-y-0.5">
        {items.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.label : undefined}
              className={[
                "group relative flex h-[38px] items-center rounded-[8px] transition-all duration-150",
                collapsed ? "mx-1.5 justify-center px-0" : "mx-2 px-3",
                active
                  ? "bg-[#2563eb] text-white shadow-[0_4px_14px_rgba(37,99,235,0.18)]"
                  : "text-[#9db0c4] hover:bg-[#142f4c] hover:text-[#e5edf5]",
              ].join(" ")}
            >
              {active && !collapsed && (
                <span className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-white" />
              )}
              <span className={[
                "flex shrink-0 items-center justify-center rounded-[6px]",
                collapsed ? "size-8" : "size-7",
                active ? "bg-white/10" : "group-hover:bg-[#1a3857]",
              ].join(" ")}>
                <Icon size={15} strokeWidth={active ? 2 : 1.7}
                  className="transition-transform duration-150 group-hover:scale-[1.04]" />
              </span>
              {!collapsed && (
                <span className={["ml-2.5 truncate text-[11px]", active ? "font-semibold" : "font-medium"].join(" ")}>
                  {item.label}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </section>
  );
}

// Official State Emblem of India (Lion Capital of Ashoka)
function EmblemOfIndia({ size = 28 }: { size?: number }) {
  const [loadError, setLoadError] = useState(false);

  if (loadError) {
    // Elegant fallback SVG of Ashoka Chakra / State Emblem motif
    return (
      <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-full w-full object-contain">
        <circle cx="16" cy="16" r="14" stroke="#fbbf24" strokeWidth="1.5" fill="#1e3a8a" fillOpacity="0.4" />
        <circle cx="16" cy="16" r="11" stroke="#fbbf24" strokeWidth="0.8" strokeDasharray="1.5 1.5" />
        <circle cx="16" cy="16" r="3" fill="#fbbf24" />
        {/* Ashoka Chakra 24 spokes */}
        {[0, 15, 30, 45, 60, 75, 90, 105, 120, 135, 150, 165, 180, 195, 210, 225, 240, 255, 270, 285, 300, 315, 330, 345].map((deg) => (
          <line
            key={deg}
            x1="16"
            y1="16"
            x2={16 + 10.5 * Math.cos((deg * Math.PI) / 180)}
            y2={16 + 10.5 * Math.sin((deg * Math.PI) / 180)}
            stroke="#fbbf24"
            strokeWidth="0.75"
          />
        ))}
      </svg>
    );
  }

  return (
    <img
      src="/emblem-of-india.svg?v=20260920"
      alt="State Emblem of India"
      width={size}
      height={size}
      onError={() => setLoadError(true)}
      className="h-full w-full object-contain filter brightness-0 invert drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]"
    />
  );
}

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize collapse state (defaulting to true so sidebar stays minimized until hovered)
  useEffect(() => {
    if (typeof window !== "undefined" && localStorage.getItem("sidebar-collapsed")) {
      localStorage.removeItem("sidebar-collapsed");
    }
    const stored = localStorage.getItem("sidebar-auto-hover-v1");
    if (stored === null) {
      setCollapsed(true);
      localStorage.setItem("sidebar-collapsed-v2", "true");
      localStorage.setItem("sidebar-auto-hover-v1", "true");
    } else {
      const isCol = localStorage.getItem("sidebar-collapsed-v2");
      setCollapsed(isCol !== "false");
    }
  }, []);

  const handleMouseEnter = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    hoverTimeoutRef.current = setTimeout(() => {
      setIsHovered(false);
    }, 120);
  };

  const toggle = () => {
    setCollapsed((c) => {
      const next = !c;
      localStorage.setItem("sidebar-collapsed-v2", String(next));
      localStorage.setItem("sidebar-auto-hover-v1", "true");
      return next;
    });
  };

  // Expanded if manually pinned open OR if cursor is hovering over it
  const isExpanded = !collapsed || isHovered;
  const w = isExpanded ? "w-[260px]" : "w-[64px]";

  return (
    <div
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="fixed inset-y-0 left-0 z-50 pointer-events-none"
    >
      {/* Sidebar */}
      <aside
        className={`pointer-events-auto h-full ${w} bg-[#0b2743] text-white transition-all duration-200 ease-out ${
          isExpanded ? "shadow-[6px_0_32px_rgba(0,0,0,0.38)]" : ""
        }`}
      >
        <div className="flex h-full flex-col overflow-hidden">

          {/* Logo area */}
          <div className={`shrink-0 ${!isExpanded ? "px-2 pb-3 pt-4" : "px-5 pb-4 pt-5"}`}>
            <Link href="/" className="group flex items-center gap-0">
              <div
                title="State Emblem of India · TransparenSee"
                className={`relative flex shrink-0 items-center justify-center overflow-hidden rounded-[10px] bg-gradient-to-br from-[#1e3a8a] via-[#1d4ed8] to-[#0b2743] border border-amber-400/50 p-1.5 shadow-[0_4px_16px_rgba(30,58,138,0.35)] transition-all duration-200 ${!isExpanded ? "size-[44px] mx-auto" : "size-[40px]"}`}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-amber-400/10 pointer-events-none" />
                <EmblemOfIndia size={!isExpanded ? 30 : 26} />
              </div>

              {isExpanded && (
                <div className="ml-3 min-w-0">
                  <div className="truncate text-[14px] font-bold tracking-[-0.2px] text-white">
                    TransparenSee
                  </div>
                  <div className="truncate text-[8px] font-medium tracking-[0.05px] text-[#7892ad]">
                    MPLADS AI Monitor
                  </div>
                </div>
              )}
            </Link>
          </div>

          {/* Overview link */}
          <div className={`shrink-0 ${!isExpanded ? "px-1.5" : "px-2"}`}>
            <Link
              href="/"
              title={!isExpanded ? "Overview" : undefined}
              className={[
                "group relative flex h-[40px] items-center rounded-[8px] transition-all duration-150",
                !isExpanded ? "justify-center" : "px-3.5",
                "bg-[#2563eb] text-white shadow-[0_5px_18px_rgba(37,99,235,0.18)] hover:bg-[#2d6bea]",
              ].join(" ")}
            >
              <span className="flex size-7 items-center justify-center rounded-[6px] bg-white/10">
                <LayoutDashboard size={15} strokeWidth={2} />
              </span>
              {isExpanded && <span className="ml-2.5 text-[11px] font-semibold">Overview</span>}
              {isExpanded && <span className="ml-auto block size-1.5 rounded-full bg-white/80" />}
            </Link>
          </div>

          {/* Nav sections */}
          <div className="sidebar-scroll mt-4 min-h-0 flex-1 overflow-y-auto px-0">
            <NavigationSection title="Monitoring"  items={monitoringItems}  pathname={pathname} collapsed={!isExpanded} />
            <NavigationSection title="Analytics"   items={analyticsItems}   pathname={pathname} collapsed={!isExpanded} />
            <NavigationSection title="Management"  items={managementItems}  pathname={pathname} collapsed={!isExpanded} />
          </div>

          {/* Footer */}
          {isExpanded && (
            <div className="shrink-0 border-t border-[#193955] px-5 py-3">
              <p className="text-[8px] font-medium text-[#7189a2]">© 2026 TransparenSee</p>
              <p className="mt-0.5 text-[8px] text-[#526f8b]">Ministry of Statistics & Programme Implementation</p>
            </div>
          )}
        </div>

        <style jsx>{`
          .sidebar-scroll { scrollbar-width: none; -ms-overflow-style: none; scroll-behavior: smooth; overscroll-behavior: contain; }
          .sidebar-scroll::-webkit-scrollbar { display: none; width: 0; height: 0; }
        `}</style>
      </aside>

      {/* Collapse toggle button — floats at edge of sidebar */}
      <button
        onClick={toggle}
        aria-label={isExpanded ? "Collapse sidebar" : "Expand sidebar"}
        title={isExpanded ? (collapsed ? "Pin sidebar open" : "Collapse sidebar") : "Expand sidebar"}
        className={`pointer-events-auto fixed top-[76px] z-[60] flex h-6 w-6 items-center justify-center rounded-full border border-[#2a4a66] bg-[#0b2743] text-[#7892ad] shadow-md transition-all duration-200 hover:bg-[#1a3857] hover:text-white ${isExpanded ? "left-[248px]" : "left-[52px]"}`}
      >
        {isExpanded ? <ChevronLeft size={12} /> : <ChevronRight size={12} />}
      </button>
    </div>
  );
}
