import { useState } from 'react';
import AssignRoleForm from '../../components/admin/AssignRoleForm';
import { isPendingUser, useAdminStore } from '../../store/adminStore';
import { ROLE_NAMES } from '../../types/roles';

export default function AdminUsersPage() {
  const users = useAdminStore((s) => s.users);
  const orgs = useAdminStore((s) => s.orgs);

  const [query, setQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);

  const q = query.trim().toLowerCase();
  const filtered = users.filter((u) => {
    const matchesText =
      !q ||
      `${u.first_name} ${u.last_name} ${u.email} ${u.username ?? ''}`.toLowerCase().includes(q);
    const matchesRole =
      !roleFilter || (roleFilter === 'none' ? isPendingUser(u) : u.role_name === roleFilter);
    return matchesText && matchesRole;
  });

  const orgName = (id: number | null) => (id == null ? '—' : (orgs.find((o) => o.id === id)?.short_name ?? `#${id}`));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">All users</h1>

      <div className="flex flex-wrap gap-3">
        <label className="sr-only" htmlFor="user-search">Search users</label>
        <input
          id="user-search"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search name, email or username"
          className="w-full max-w-xs rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
        />
        <label className="sr-only" htmlFor="role-filter">Filter by role</label>
        <select
          id="role-filter"
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
        >
          <option value="">All roles</option>
          {ROLE_NAMES.map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
          <option value="none">Unassigned</option>
        </select>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-slate-600">
            <tr>
              <th scope="col" className="px-4 py-3 font-medium">Name</th>
              <th scope="col" className="px-4 py-3 font-medium">Username</th>
              <th scope="col" className="px-4 py-3 font-medium">Role</th>
              <th scope="col" className="px-4 py-3 font-medium">Org</th>
              <th scope="col" className="px-4 py-3 font-medium"><span className="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                  No users match those filters.
                </td>
              </tr>
            )}
            {filtered.map((u) => (
              <tr key={u.id} className="align-top">
                <td className="px-4 py-3">
                  <p className="font-medium">{u.first_name} {u.last_name}</p>
                  <p className="text-slate-500">{u.email}</p>
                </td>
                <td className="px-4 py-3 text-slate-600">{u.username ?? <span className="text-slate-400">not generated</span>}</td>
                <td className="px-4 py-3">
                  {u.role_name ?? <span className="rounded bg-amber-100 px-1.5 py-0.5 text-xs font-medium text-amber-800">unassigned</span>}
                </td>
                <td className="px-4 py-3">{orgName(u.org_id)}</td>
                <td className="px-4 py-3 text-right">
                  {editingId === u.id ? (
                    <div className="flex flex-col items-end gap-2">
                      <AssignRoleForm user={u} submitLabel="Save changes" onDone={() => setEditingId(null)} />
                      <button type="button" onClick={() => setEditingId(null)} className="text-slate-600 underline">
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setEditingId(u.id)}
                      className="rounded-md border border-slate-300 px-3 py-1 hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
                    >
                      Edit access
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
