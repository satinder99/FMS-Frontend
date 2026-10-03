import AppShell from './AppShell';

export default function DriverLayout() {
  return (
    <AppShell
      portalName="Driver"
      nav={[
        { to: '/driver', label: 'My trips', end: true },
        { to: '/driver/hours', label: 'Hours & pay' },
      ]}
    />
  );
}
