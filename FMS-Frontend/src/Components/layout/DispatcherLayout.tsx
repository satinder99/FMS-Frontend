// [FRONTEND · React] src/components/layout/DispatcherLayout.tsx
import AppShell from './AppShell';

export default function DispatcherLayout() {
  return (
    <AppShell
      portalName="Dispatch"
      nav={[
        { to: '/dispatcher', label: 'Drivers & rides', end: true },
        { to: '/dispatcher/trips/new', label: 'New trip' },
        { to: '/dispatcher/equipment', label: 'Trucks & trailers' },
      ]}
    />
  );
}
