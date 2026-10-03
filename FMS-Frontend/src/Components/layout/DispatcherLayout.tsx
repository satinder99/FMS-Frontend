import AppShell from './AppShell';

export default function DispatcherLayout() {
  return <AppShell portalName="Dispatch" nav={[{ to: '/dispatcher', label: 'Drivers & rides', end: false }]} />;
}
