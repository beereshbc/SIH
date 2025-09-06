import React, { useState } from "react";
import { exportCSV } from "../utils/export";

export default function Reports() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [region, setRegion] = useState("");

  const generate = () => {
    alert(
      `Generated report ${from || "any"} -> ${to || "any"} region: ${
        region || "all"
      }`
    );
  };

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="text-sm font-semibold">Reports</div>
            <div className="text-[12px] text-gray-500">
              Generate region & time-based reports
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-2 text-[12px]">
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="border rounded px-2 py-1"
          />
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="border rounded px-2 py-1"
          />
          <input
            placeholder="Region / District"
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            className="border rounded px-2 py-1"
          />
          <div className="flex items-center gap-2">
            <button
              onClick={generate}
              className="px-3 py-2 border rounded text-[12px]"
            >
              Generate
            </button>
            <button
              onClick={() => exportCSV("report-sample.csv", [{ sample: 1 }])}
              className="px-3 py-2 border rounded text-[12px]"
            >
              Export
            </button>
          </div>
        </div>

        <div className="mt-4 text-[12px] text-gray-500">
          Sample data preview and analytics cards would appear here.
        </div>
      </div>
    </div>
  );
}
