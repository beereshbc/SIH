import React, { useEffect, useState } from "react";
import { mock } from "../api/mock";
import DataTable from "../components/DataTable";

export default function Blockchain() {
  const [txs, setTxs] = useState([]);

  useEffect(() => {
    (async () => setTxs(await mock.chainTxs()))();
  }, []);

  const columns = [
    {
      key: "txHash",
      title: "TxHash",
      render: (r) => <span className="break-all text-[12px]">{r.txHash}</span>,
    },
    { key: "type", title: "Type" },
    { key: "block", title: "Block" },
    {
      key: "when",
      title: "When",
      render: (r) => new Date(r.when).toLocaleString(),
    },
    {
      key: "explorer",
      title: "",
      render: (r) => (
        <a
          className="text-[12px] border rounded px-2 py-1"
          href={`https://etherscan.io/tx/${r.txHash}`}
          target="_blank"
          rel="noreferrer"
        >
          Explorer
        </a>
      ),
    },
  ];

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="text-sm font-semibold">Blockchain</div>
            <div className="text-[12px] text-gray-500">
              On-chain issuance & logs
            </div>
          </div>
          <div className="text-[12px]">Network: Ethereum (mainnet)</div>
        </div>

        <DataTable columns={columns} rows={txs} />
      </div>
    </div>
  );
}
