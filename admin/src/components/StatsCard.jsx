import React from "react";
export default function StatsCard({ title, value, icon }) {
  return (
    <div className="p-3 border rounded-sm text-[12px]">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-[11px] text-gray-500">{title}</div>
          <div className="font-semibold text-sm">{value}</div>
        </div>
        <div className="p-2 border rounded">{icon}</div>
      </div>
    </div>
  );
}
