import React from "react";
import { Search } from "lucide-react";

export default function Navbar() {
  return (
    <header className="w-full border-b border-gray-100 bg-white px-4 py-2 flex items-center justify-between text-sm">
      <div className="flex items-center gap-3">
        <div className="text-[13px] font-medium">Admin Panel</div>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 border rounded px-2 py-1 text-[12px]">
          <Search className="w-3 h-3" />
          <input
            className="outline-none text-[12px] w-48"
            placeholder="Search... (users, txhash, ids)"
          />
        </div>
        <div className="text-[12px] text-gray-600">Admin</div>
      </div>
    </header>
  );
}
