import AppShell from './AppShell';

export default function AdminLayout() {
  return (
    <AppShell
      portalName="Admin"
      nav={[
        { to: '/admin', label: 'Overview', end: true },
        { to: '/admin/pending', label: 'New signups' },
        { to: '/admin/users', label: 'All users' },
      ]}
    />
  );
}
