import React, { useEffect, useState } from "react";
import { mock } from "../api/mock";
import DataTable from "../components/DataTable";

export default function CarbonCredits() {
  const [credits, setCredits] = useState([]);
  const [q, setQ] = useState("");

  useEffect(() => {
    (async () => setCredits(await mock.credits()))();
  }, []);

  const filtered = credits.filter((c) =>
    q ? `${c.id} ${c.txHash} ${c.issuedTo}`.includes(q) : true
  );

  const columns = [
    { key: "id", title: "ID" },
    { key: "issuedTo", title: "Issued To", render: (r) => r.issuedTo },
    { key: "kgCO2", title: "Kg CO2" },
    {
      key: "txHash",
      title: "TxHash",
      render: (r) => <span className="break-all text-[12px]">{r.txHash}</span>,
    },
    {
      key: "issuedAt",
      title: "Issued At",
      render: (r) => new Date(r.issuedAt).toLocaleString(),
    },
    {
      key: "actions",
      title: "",
      render: (r) => (
        <a
          className="text-[12px] border rounded px-2 py-1"
          href={`https://etherscan.io/tx/${r.txHash}`}
          target="_blank"
          rel="noreferrer"
        >
          View
        </a>
      ),
    },
  ];

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="text-sm font-semibold">Carbon Credits</div>
            <div className="text-[12px] text-gray-500">
              Issued carbon credits & transactions
            </div>
          </div>
          <div className="text-[12px]">Total: {credits.length}</div>
        </div>

        <div className="mb-3 flex items-center gap-2">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search txHash or id"
            className="text-[12px] border rounded px-2 py-1"
          />
        </div>

        <DataTable columns={columns} rows={filtered} />
      </div>
    </div>
  );
}
