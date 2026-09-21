"use client";

import { useRole } from "@/context/RoleContext";
import { Download } from "lucide-react";

export default function GreetingBanner() {
  const {
    role,
    selectedState,
    selectedDistrict,
    selectedMp,
  } = useRole();

  function exportReport() {
    const reportContent = [
      "SAHAYA / TRANSPARENSEE - MPLADS IMPLEMENTATION REPORT",
      "==================================================",
      `Authority Tier: ${role.toUpperCase()}`,
      `Jurisdiction: ${
        role === "ministry"
          ? "National MoSPI (All India)"
          : role === "state"
          ? selectedState
          : role === "district"
          ? `${selectedDistrict}, ${selectedState}`
          : `${selectedMp} (${selectedDistrict})`
      }`,
      `Generated At: ${new Date().toLocaleString("en-IN")}`,
      "",
      "--------------------------------------------------",
      "Statutory Audit & Surveillance Summary",
      "Report generated from the TransparenSee MPLADS AI Monitoring Suite.",
    ].join("\n");

    const blob = new Blob([reportContent], {
      type: "text/plain;charset=utf-8",
    });

    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `transparensee-mplads-report-${role}.txt`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  }

  const greeting =
    role === "ministry"
      ? "Good morning, Director General"
      : role === "state"
      ? `Good morning, Chief Secretary · ${selectedState}`
      : role === "district"
      ? `Good morning, District Magistrate · ${selectedDistrict}`
      : `Good morning, Hon'ble MP · ${selectedMp.split(" (")[0]}`;

  const subtitle =
    role === "ministry"
      ? "Pan-India sovereign oversight, statutory compliance & national anomaly tracking."
      : role === "state"
      ? `State-wise outlay, inter-district arbitration & comparative benchmarks across ${selectedState}.`
      : role === "district"
      ? `Ground-level execution, SLA alerts & milestone inspections for ${selectedDistrict} Collectorate.`
      : `₹25 Cr constituency entitlement, citizen grievance resolution & works status in ${selectedDistrict} (${selectedState}) · ${selectedMp}.`;

  return (
    <div className="mb-5 flex flex-col justify-between gap-3 border-b border-slate-200/90 pb-4 pt-1 sm:flex-row sm:items-center">
      <div className="min-w-0">
        <h1 className="flex items-center gap-2 text-[20px] sm:text-[22px] font-bold tracking-tight text-slate-900">
          <span>{greeting}</span>
          <span className="text-xl">👋</span>
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-slate-500 font-medium truncate max-w-4xl">
          {subtitle}
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-3">
        <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 px-2.5 py-1 text-[11px] font-medium text-emerald-700">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Live AI Engine Active
        </span>

        <button
          type="button"
          onClick={exportReport}
          className="inline-flex h-[34px] shrink-0 items-center gap-2 rounded-[6px] border border-[#D0D5DD] bg-white px-3.5 text-[11px] font-semibold text-[#344054] shadow-[0_1px_2px_rgba(16,24,40,0.03)] transition-all duration-150 hover:border-[#BFC6D0] hover:bg-[#F9FAFB]"
        >
          <Download size={14} className="text-[#667085]" strokeWidth={1.8} />
          <span>Export Report</span>
        </button>
      </div>
    </div>
  );
}
