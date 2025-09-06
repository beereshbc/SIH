import React from "react";

export default function MapView({ points }) {
  return (
    <div className="w-full h-48 border rounded bg-gray-50 flex items-center justify-center text-[12px]">
      Map placeholder ({points?.length || 0} points)
    </div>
  );
}
