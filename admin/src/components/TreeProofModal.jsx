import React from "react";

export default function TreeProofModal({
  item,
  onClose,
  onApprove,
  onReject,
  loading,
}) {
  if (!item) return null;
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white w-11/12 md:w-3/4 border rounded p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="font-semibold">Inspect {item.id}</div>
          <button onClick={onClose} className="text-[12px]">
            Close
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="col-span-2">
            <div className="w-full h-60 bg-gray-100 border rounded flex items-center justify-center">
              Images / Map
            </div>
            <div className="mt-2 text-[12px]">
              Location: {item.lat}, {item.lng}
            </div>
          </div>
          <div>
            <div className="text-[12px]">User: {item.user}</div>
            <div className="text-[12px]">Species: {item.species}</div>
            <div className="text-[12px]">
              Estimated CO2: {item.estimatedCarbonKg} kg
            </div>
            <div className="mt-3 flex flex-col gap-2">
              <button
                onClick={() => onApprove(item)}
                className="py-2 px-3 border rounded text-[12px]"
              >
                Approve & Issue
              </button>
              <button
                onClick={() => onReject(item)}
                className="py-2 px-3 border rounded text-[12px]"
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
