"use client";

import { useEffect, useState } from "react";

export default function MainWrapper({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(true);

  useEffect(() => {
    // Read initial state
    const stored = localStorage.getItem("sidebar-collapsed-v2");
    setCollapsed(stored !== "false");

    // Listen for storage changes (when sidebar toggle fires)
    const handler = (e: StorageEvent) => {
      if (e.key === "sidebar-collapsed-v2") setCollapsed(e.newValue !== "false");
    };
    window.addEventListener("storage", handler);

    // Also poll every 150ms for same-tab updates (localStorage doesn't fire storage event in same tab)
    const interval = setInterval(() => {
      const v = localStorage.getItem("sidebar-collapsed-v2");
      setCollapsed(v !== "false");
    }, 150);

    return () => {
      window.removeEventListener("storage", handler);
      clearInterval(interval);
    };
  }, []);

  return (
    <main
      className="min-h-screen pt-[112px] transition-all duration-200 ease-out"
      style={{ marginLeft: collapsed ? "64px" : "260px" }}
    >
      <div className="mx-auto w-full max-w-[1700px] px-4 py-5 sm:px-6 sm:py-6 lg:px-8">
        {children}
      </div>
    </main>
  );
}
