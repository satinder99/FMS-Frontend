// [FRONTEND · React] src/components/layout/DriverLayout.tsx
import AppShell from './AppShell';

export default function DriverLayout() {
  return (
    <AppShell
      portalName="Driver"
      withPresence
      nav={[
        { to: '/driver', label: 'My trips', end: true },
        { to: '/driver/hours', label: 'Hours & pay' },
      ]}
    />
  );
}
