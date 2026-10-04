// [FRONTEND · React] src/components/layout/AdminLayout.tsx
import { useApiData } from '../../hooks/useApiData';
import { adminApi } from '../../lib/fleetApi';
import AppShell from './AppShell';

export default function AdminLayout() {
  // Count of dispatcher requests waiting for an admin; refreshed every 30 seconds.
  const { data: waiting } = useApiData(adminApi.pendingEditRequestCount, 30_000);

  return (
    <AppShell
      portalName="Admin"
      nav={[
        { to: '/admin', label: 'Organizations', end: true },
        { to: '/admin/pending', label: 'New signups' },
        { to: '/admin/users', label: 'All users' },
        { to: '/admin/edit-requests', label: 'Edit requests', badge: waiting ?? 0 },
      ]}
    />
  );
}
