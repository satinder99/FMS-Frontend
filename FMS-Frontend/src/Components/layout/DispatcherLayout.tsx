// [FRONTEND · React] src/components/layout/DispatcherLayout.tsx
import AppShell from './AppShell';

export default function DispatcherLayout() {
  return (
    <AppShell
      portalName="Dispatch"
      withPresence
      nav={[
        { to: '/dispatcher', label: 'Drivers & rides', end: true },
        { to: '/dispatcher/rides', label: 'Active rides' },
        { to: '/dispatcher/trips/new', label: 'New order' },
        { to: '/dispatcher/equipment', label: 'Trucks & trailers' },
      ]}
    />
  );
}
