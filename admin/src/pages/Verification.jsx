import React, { useEffect, useState } from "react";
import { mock } from "../api/mock";
import TreeProofModal from "../components/TreeProofModal";
import MapView from "../components/MapView";

export default function Verification() {
  const [pending, setPending] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => setPending(await mock.pendingProofs()))();
  }, []);

  const approveAndIssue = async (item) => {
    setLoading(true);
    // 1) mark verified in DB (mock)
    await new Promise((r) => setTimeout(r, 700));
    // 2) call blockchain helper to mint/issue credit
    const res = await mock.issueOnChain({
      id: item.id,
      gramsCO2: item.estimatedCarbonKg * 1000,
      to: item.wallet,
    });
    setPending((p) => p.filter((x) => x.id !== item.id));
    setLoading(false);
    alert(`Issued on chain: ${res.txHash}`);
  };

  const reject = (item, reason = "invalid proof") => {
    setPending((p) => p.filter((x) => x.id !== item.id));
    alert(`${item.id} rejected — ${reason}`);
  };

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="text-sm font-semibold">Verification</div>
            <div className="text-[12px] text-gray-500">
              Approve or reject tree proofs
            </div>
          </div>
          <div className="text-[12px]">Pending: {pending.length}</div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {pending.map((p) => (
            <div key={p.id} className="border rounded p-3 text-[12px]">
              <div className="flex items-start gap-3">
                <div className="w-20 h-20 bg-gray-100 border rounded flex items-center justify-center text-[11px]">
                  Image
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold">
                        {p.species} — {p.user}
                      </div>
                      <div className="text-[11px] text-gray-500">
                        {new Date(p.plantedOn).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="text-[12px]">
                      {p.estimatedCarbonKg} kg CO2
                    </div>
                  </div>
                  <div className="mt-2 text-[12px] text-gray-600">
                    {p.notes}
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <button
                      onClick={() => setSelected(p)}
                      className="py-1 px-2 text-[12px] border rounded"
                    >
                      Inspect
                    </button>
                    <button
                      onClick={() => approveAndIssue(p)}
                      disabled={loading}
                      className="py-1 px-2 text-[12px] border rounded bg-green-50"
                    >
                      Approve & Issue
                    </button>
                    <button
                      onClick={() => reject(p)}
                      className="py-1 px-2 text-[12px] border rounded bg-red-50"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4">
          <MapView points={pending.map((p) => ({ lat: p.lat, lng: p.lng }))} />
        </div>

        <TreeProofModal
          item={selected}
          onClose={() => setSelected(null)}
          onApprove={(i) => {
            approveAndIssue(i);
            setSelected(null);
          }}
          onReject={(i) => {
            reject(i);
            setSelected(null);
          }}
          loading={loading}
        />
      </div>
    </div>
  );
}
