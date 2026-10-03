import { NavLink, Outlet } from 'react-router';
import { useAuthStore } from '../../store/authStore';

export interface NavItem {
  to: string;
  label: string;
  end?: boolean;
}

interface Props {
  portalName: string;
  nav: NavItem[];
}

export default function AppShell({ portalName, nav }: Props) {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="bg-slate-900 text-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-8 gap-y-2 px-4 py-3">
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-semibold tracking-tight">FMS</span>
            <span className="text-sm text-slate-400">{portalName}</span>
          </div>

          <nav className="flex flex-1 gap-1" aria-label="Main">
            {nav.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `rounded-md px-3 py-1.5 text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${
                    isActive ? 'bg-slate-700 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-3 text-sm">
            <span className="text-slate-300">
              {user ? `${user.first_name} ${user.last_name}` : ''}
            </span>
            <button
              type="button"
              onClick={() => void logout()}
              className="rounded-md border border-slate-600 px-3 py-1.5 text-slate-100 hover:bg-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
