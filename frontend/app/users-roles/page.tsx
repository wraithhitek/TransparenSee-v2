export default function UsersRolesPage() {
  const roles = [
    { role: "Admin", key: "MPLADS_API_KEY_ADMIN", desc: "Full access — manage users, configure system, view all data", env: "dev-admin-key" },
    { role: "Analyst", key: "MPLADS_API_KEY_ANALYST", desc: "Can update alert status, persist scored records, view all data", env: "dev-analyst-key" },
    { role: "Viewer", key: "MPLADS_API_KEY_VIEWER", desc: "Read-only access to all dashboards and reports", env: "dev-viewer-key" },
  ];
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Users &amp; Roles</h1>
        <p className="text-sm text-slate-500 mt-0.5">API key–based role management for the MPLADS AI Monitor</p>
      </div>
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-800">
        <strong>Security note:</strong> In production, set strong unique values for MPLADS_API_KEY_ADMIN, MPLADS_API_KEY_ANALYST, and MPLADS_API_KEY_VIEWER environment variables. Never use dev keys in production.
      </div>
      <div className="space-y-3">
        {roles.map(({ role, key, desc, env }) => (
          <div key={role} className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-sm font-bold text-slate-800 mb-1">{role}</h3>
                <p className="text-xs text-slate-600 mb-2">{desc}</p>
                <code className="text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded">{key}=&lt;your-key&gt;</code>
              </div>
              <span className={`px-2 py-1 rounded text-xs font-bold ${role === "Admin" ? "bg-red-100 text-red-700" : role === "Analyst" ? "bg-orange-100 text-orange-700" : "bg-green-100 text-green-700"}`}>
                {role}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
