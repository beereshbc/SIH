import React, { useEffect, useState } from "react";
import {
  Menu,
  CheckCircle,
  Clock,
  Zap,
  ArrowRightCircle,
  Download,
} from "lucide-react";
import { Link } from "react-router-dom";
import StatsCard from "../components/StatsCard";
import { mock } from "../api/mock";

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalTrees: 0,
    verified: 0,
    pending: 0,
    issuedCredits: 0,
  });
  const [preview, setPreview] = useState([]);

  useEffect(() => {
    (async () => {
      setStats(await mock.stats());
      setPreview((await mock.pendingProofs()).slice(0, 4));
    })();
  }, []);

  return (
    <div className="p-4 min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-sm font-semibold">Dashboard</div>
            <div className="text-[12px] text-gray-500">
              Overview of planted trees, verifications & credits
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              to="/verification"
              className="py-2 px-3 border rounded text-[12px] flex items-center gap-2"
            >
              <ArrowRightCircle className="w-4 h-4" /> View pending
            </Link>
            <button className="py-2 px-3 border rounded text-[12px] flex items-center gap-2">
              <Download className="w-4 h-4" /> Export
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4 text-[12px]">
          <StatsCard
            title="Total Trees"
            value={stats.totalTrees}
            icon={<Menu className="w-4 h-4" />}
          />
          <StatsCard
            title="Verified"
            value={stats.verified}
            icon={<CheckCircle className="w-4 h-4" />}
          />
          <StatsCard
            title="Pending"
            value={stats.pending}
            icon={<Clock className="w-4 h-4" />}
          />
          <StatsCard
            title="Issued Credits"
            value={stats.issuedCredits}
            icon={<Zap className="w-4 h-4" />}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          <div className="col-span-2 border rounded p-3 text-[12px]">
            <div className="font-semibold mb-2">Trees Planted (recent)</div>
            <div className="text-[12px] text-gray-500">
              Chart placeholder — integrate Chart.js / Recharts
            </div>
            <div className="mt-3">
              <div className="grid grid-cols-2 gap-2">
                {preview.map((p) => (
                  <div key={p.id} className="border rounded p-2 text-[12px]">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold">{p.species}</div>
                        <div className="text-[11px] text-gray-500">
                          {p.user}
                        </div>
                      </div>
                      <div className="text-[11px]">
                        {p.estimatedCarbonKg} kg
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="border rounded p-3 text-[12px]">
            <div className="font-semibold mb-2">Quick Actions</div>
            <div className="flex flex-col gap-2">
              <Link
                to="/verification"
                className="py-2 px-3 text-[12px] border rounded flex items-center gap-2"
              >
                View pending verifications
              </Link>
              <button className="py-2 px-3 text-[12px] border rounded flex items-center gap-2">
                Export report
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
