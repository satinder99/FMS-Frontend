// [FRONTEND · React] src/App.tsx
import { useEffect } from 'react';
import { Route, Routes } from 'react-router';

import AdminLayout from './components/layout/AdminLayout';
import DispatcherLayout from './components/layout/DispatcherLayout';
import DriverLayout from './components/layout/DriverLayout';
import RequireAuth from './components/routing/RequireAuth';
import RequireRole from './components/routing/RequireRole';
import RootRedirect from './components/routing/RootRedirect';

import { LoginPage } from './pages/LoginPage';
import { PendingAssignmentPage } from './pages/PendingAssignmentPage';
import { SignUpPage } from './pages/SignUpPage';

import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminEditRequestsPage from './pages/admin/AdminEditRequestsPage';
import AdminNewOrganizationPage from './pages/admin/AdminNewOrganizationPage';
import AdminOrganizationPage from './pages/admin/AdminOrganizationPage';
import AdminPendingUsersPage from './pages/admin/AdminPendingUsersPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import DispatcherDashboardPage from './pages/dispatcher/DispatcherDashboardPage';
import DispatcherDriverPage from './pages/dispatcher/DispatcherDriverPage';
import DriverPayRatesPage from './pages/dispatcher/DriverPayRatesPage';
import EquipmentPage from './pages/dispatcher/EquipmentPage';
import NewTripPage from './pages/dispatcher/NewTripPage';
import DriverDashboardPage from './pages/driver/DriverDashboardPage';
import DriverHoursPage from './pages/driver/DriverHoursPage';

import { useAuthStore } from './store/authStore';

export default function App() {
  const bootstrap = useAuthStore((s) => s.bootstrap);

  // Silent /refresh using the httpOnly cookie, so reloads land already signed in.
  useEffect(() => {
    void bootstrap();
  }, [bootstrap]);

  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignUpPage />} />

      {/* Signed in */}
      <Route element={<RequireAuth />}>
        <Route path="/pending-assignment" element={<PendingAssignmentPage />} />

        <Route element={<RequireRole allowed={['admin']} />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboardPage />} />
            <Route path="organizations/new" element={<AdminNewOrganizationPage />} />
            <Route path="organizations/:orgId" element={<AdminOrganizationPage />} />
            <Route path="edit-requests" element={<AdminEditRequestsPage />} />
            <Route path="pending" element={<AdminPendingUsersPage />} />
            <Route path="users" element={<AdminUsersPage />} />
          </Route>
        </Route>

        <Route element={<RequireRole allowed={['dispatcher']} />}>
          <Route path="/dispatcher" element={<DispatcherLayout />}>
            <Route index element={<DispatcherDashboardPage />} />
            <Route path="drivers/:driverId" element={<DispatcherDriverPage />} />
            <Route path="drivers/:driverId/pay" element={<DriverPayRatesPage />} />
            <Route path="trips/new" element={<NewTripPage />} />
            <Route path="equipment" element={<EquipmentPage />} />
          </Route>
        </Route>

        <Route element={<RequireRole allowed={['driver']} />}>
          <Route path="/driver" element={<DriverLayout />}>
            <Route index element={<DriverDashboardPage />} />
            <Route path="hours" element={<DriverHoursPage />} />
          </Route>
        </Route>
      </Route>

      {/* "/" and anything unknown -> the right home for this user */}
      <Route path="*" element={<RootRedirect />} />
    </Routes>
  );
}
