import React, { useMemo, useState, useEffect } from "react";
import { mock } from "../api/mock";
import DataTable from "../components/DataTable";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [page, setPage] = useState(1);
  const perPage = 8;

  useEffect(() => {
    (async () => setUsers(await mock.users()))();
  }, []);

  const filtered = useMemo(
    () =>
      users
        .filter((u) => (roleFilter ? u.role === roleFilter : true))
        .filter((u) =>
          query
            ? `${u.name} ${u.id}`.toLowerCase().includes(query.toLowerCase())
            : true
        ),
    [users, query, roleFilter]
  );
  const paged = filtered.slice((page - 1) * perPage, page * perPage);

  const changeRole = (id, newRole) =>
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, role: newRole } : u))
    );

  const columns = [
    { key: "id", title: "ID" },
    { key: "name", title: "Name", render: (r) => r.name },
    {
      key: "role",
      title: "Role",
      render: (r) => (
        <select
          value={r.role}
          onChange={(e) => changeRole(r.id, e.target.value)}
          className="text-[12px] border rounded px-2 py-1"
        >
          <option>Contributor</option>
          <option>Verifier</option>
          <option>Moderator</option>
          <option>Admin</option>
        </select>
      ),
    },
    {
      key: "joined",
      title: "Joined",
      render: (r) => new Date(r.joined).toLocaleDateString(),
    },
    { key: "totalTrees", title: "Trees" },
    { key: "status", title: "Status" },
    {
      key: "actions",
      title: "",
      render: (r) => (
        <div className="flex gap-2">
          <button className="text-[12px] border rounded px-2 py-1">View</button>
          <button className="text-[12px] border rounded px-2 py-1">
            Block
          </button>
        </div>
      ),
    },
  ];
  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="text-sm font-semibold">Users</div>
            <div className="text-[12px] text-gray-500">
              Manage contributors, verifiers & moderators
            </div>
          </div>
          <div className="text-[12px]">Total: {users.length}</div>
        </div>

        <div className="mb-3 flex items-center gap-2">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search user or id"
            className="text-[12px] border rounded px-2 py-1 w-48"
          />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="text-[12px] border rounded px-2 py-1"
          >
            <option value="">All roles</option>
            <option>Contributor</option>
            <option>Verifier</option>
            <option>Moderator</option>
          </select>
          <button className="ml-auto text-[12px] border rounded px-3 py-1">
            Invite Verifier
          </button>
        </div>

        <DataTable columns={columns} rows={paged} />

        <div className="mt-3 flex items-center gap-2">
          <div className="text-[12px]">{filtered.length} results</div>
          <div className="ml-auto flex items-center gap-1">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="text-[12px] border rounded px-2 py-1"
            >
              Prev
            </button>
            <div className="text-[12px] px-2">{page}</div>
            <button
              disabled={page * perPage >= filtered.length}
              onClick={() => setPage((p) => p + 1)}
              className="text-[12px] border rounded px-2 py-1"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
