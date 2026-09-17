"use client";

import { useEffect, useState } from "react";

export default function MainWrapper({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    // Read initial state
    const stored = localStorage.getItem("sidebar-collapsed");
    setCollapsed(stored === "true");

    // Listen for storage changes (when sidebar toggle fires)
    const handler = (e: StorageEvent) => {
      if (e.key === "sidebar-collapsed") setCollapsed(e.newValue === "true");
    };
    window.addEventListener("storage", handler);

    // Also poll every 100ms for same-tab updates (localStorage doesn't fire storage event in same tab)
    const interval = setInterval(() => {
      const v = localStorage.getItem("sidebar-collapsed");
      setCollapsed(v === "true");
    }, 150);

    return () => {
      window.removeEventListener("storage", handler);
      clearInterval(interval);
    };
  }, []);

  return (
    <main
      className="min-h-screen pt-[88px] transition-all duration-200 ease-out"
      style={{ marginLeft: collapsed ? "64px" : "260px" }}
    >
      {children}
    </main>
  );
}
