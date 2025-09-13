import React, { useEffect, useState } from "react";
import { useAppContext } from "../context/AppContext";

export default function Transactions() {
  const [txs, setTxs] = useState([]);
  const { axios } = useAppContext();

  useEffect(() => {
    const fetchTxs = async () => {
      try {
        const res = await axios.get("/api/admin/transactions");
        setTxs(res.data);
      } catch (err) {
        console.error("Failed to fetch transactions:", err);
      }
    };
    fetchTxs();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Blockchain Transactions</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white shadow rounded-lg">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-2 px-4 text-left">Tx Hash</th>
              <th className="py-2 px-4 text-left">Project</th>
              <th className="py-2 px-4 text-left">NGO</th>
              <th className="py-2 px-4 text-left">Credits</th>
              <th className="py-2 px-4 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {txs.map((tx) => (
              <tr key={tx._id} className="border-t">
                <td className="py-2 px-4 break-all">{tx.txHash}</td>
                <td className="py-2 px-4">{tx.projectTitle}</td>
                <td className="py-2 px-4">{tx.ngoName}</td>
                <td className="py-2 px-4">{tx.credits}</td>
                <td className="py-2 px-4">{tx.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
