// [FRONTEND · React] src/components/layout/AppShell.tsx   (YOUR EXISTING FILE: + organization name in the top bar, and the "online now" row under it)
import { NavLink, Outlet } from 'react-router';
import { usePresence } from '../../hooks/usePresence';
import { presenceApi } from '../../lib/fleetApi';
import { useAuthStore } from '../../store/authStore';

export interface NavItem {
  to: string;
  label: string;
  end?: boolean;
  /** Small count shown next to the label (e.g. pending requests). Hidden when 0. */
  badge?: number;
}

interface Props {
  portalName: string;
  nav: NavItem[];
  /** Dispatcher and driver screens: show the organization name and who is online. Admins have no organization. */
  withPresence?: boolean;
}

const primary =
  'rounded-md bg-amber-400 px-5 py-2.5 text-sm font-semibold text-slate-900 hover:bg-amber-300 disabled:opacity-60 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900';

export default function AppShell({ portalName, nav, withPresence = false }: Props) {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const presence = usePresence(withPresence);
  const orgName = presence.data?.organization?.name ?? null;
  const online = presence.data?.onlineDispatchers ?? [];

  async function handleSignOut() {
    // Leave the "online" list at once (best effort), then sign out.
    if (withPresence) await presenceApi.leave().catch(() => undefined);
    await logout();
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="bg-slate-900 text-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-8 gap-y-2 px-4 py-3">
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-semibold tracking-tight">FMS</span>
            <span className="text-sm text-slate-400">{portalName}</span>
            {orgName && (
              <span className="ml-1 rounded bg-slate-700 px-2 py-0.5 text-sm font-medium text-white" title="Your organization">
                {orgName}
              </span>
            )}
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
                {item.badge ? (
                  <span className="ml-2 rounded-full bg-amber-400 px-1.5 py-0.5 text-xs font-semibold text-slate-900">
                    {item.badge}
                    <span className="sr-only"> waiting</span>
                  </span>
                ) : null}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-3 text-sm">
            <span className="text-slate-300">
              {user ? `${user.first_name} ${user.last_name}` : ''}
            </span>
            <button
              type="button"
              onClick={() => void handleSignOut()}
              className="rounded-md border border-slate-600 px-3 py-1.5 text-slate-100 hover:bg-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
            >
              Sign out
            </button>
          </div>
        </div>

        {withPresence && (
          <div className="border-t border-slate-700 bg-slate-800">
            <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-4 gap-y-1 px-4 py-2 text-sm">
              <span className="text-slate-400">Dispatchers: </span>
              {presence.data == null ? (
                <span className="text-slate-500">…</span>
              ) : online.length === 0 ? (
                <span className="text-slate-500">nobody right now</span>
              ) : (
                <ul className="flex flex-wrap items-center gap-x-4 gap-y-1">
                  {online.map((d) => (
                    <li key={d.id} className="flex items-center gap-2">
                      <button type="button" className = "bg-blue-500 text-white font-bold py-1 px-1 rounded">
                        {d.firstName} {d.lastName[0]}
                        {d.isMe && <span className=""> (you)</span>}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
