import React, { useEffect, useState } from "react";
import { useAppContext } from "../context/AppContext";

export default function Credits() {
  const [credits, setCredits] = useState([]);
  const { axios } = useAppContext();

  useEffect(() => {
    const fetchCredits = async () => {
      try {
        const res = await axios.get("/api/admin/credits");
        setCredits(res.data);
      } catch (err) {
        console.error("Failed to fetch credits:", err);
      }
    };
    fetchCredits();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Issued Carbon Credits</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white shadow rounded-lg">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-2 px-4 text-left">Project</th>
              <th className="py-2 px-4 text-left">NGO</th>
              <th className="py-2 px-4 text-left">Credits Issued</th>
            </tr>
          </thead>
          <tbody>
            {credits.map((c) => (
              <tr key={c._id} className="border-t">
                <td className="py-2 px-4">{c.projectTitle}</td>
                <td className="py-2 px-4">{c.ngoName}</td>
                <td className="py-2 px-4">{c.totalCredits}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
