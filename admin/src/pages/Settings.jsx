import React, { useState } from "react";

export default function Settings() {
  const [apiKey, setApiKey] = useState("");
  const [mapKey, setMapKey] = useState("");

  const save = () => alert("Settings saved (mock)");

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="text-sm font-semibold">Settings</div>
            <div className="text-[12px] text-gray-500">
              Manage API keys, verifiers & security
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[12px]">
          <div className="border rounded p-3">
            <div className="text-[12px] font-semibold mb-2">API Keys</div>
            <div className="mb-2 text-[12px]">Blockchain RPC Key</div>
            <input
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="border rounded px-2 py-1 w-full text-[12px]"
            />
            <div className="mt-2 text-[12px]">Maps Key</div>
            <input
              value={mapKey}
              onChange={(e) => setMapKey(e.target.value)}
              className="border rounded px-2 py-1 w-full text-[12px]"
            />
          </div>
          <div className="border rounded p-3">
            <div className="text-[12px] font-semibold mb-2">Security</div>
            <div className="text-[12px] mb-2">
              2FA, session timeout and admin roles can be configured here.
            </div>
            <button
              onClick={save}
              className="px-3 py-2 border rounded text-[12px]"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
