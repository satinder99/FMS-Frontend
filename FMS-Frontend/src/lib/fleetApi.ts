// [FRONTEND · React] src/lib/fleetApi.ts
// Every call to the fleet endpoints lives here. Pages never build URLs themselves.
// Built on YOUR apiClient(path, options): it attaches the Bearer token and silently
// refreshes + retries once on ACCESS_TOKEN_EXPIRED. Errors arrive as ApiError
// (message = the backend's `error` text, code = its `code`).
import { apiClient } from './apiClient';
import type { AdminUser, CreatedOrganization, NewOrganizationPayload, Organization } from '../types/admin';
import type { RoleName } from '../types/roles';
import type {
  DispatcherDriverDetail,
  DispatcherDriverRow,
  DriverSummary,
  Equipment,
  EquipmentKind,
  EquipmentStatus,
  HoursSummary,
  NewEquipmentPayload,
  NewPayRatePayload,
  NewTripPayload,
  PayRate,
  Trip,
  TripResources,
} from '../types/trips';

const equipmentPath = (kind: EquipmentKind) => (kind === 'truck' ? 'trucks' : 'trailers');

const get = <T>(path: string) => apiClient<T>(path);

const send = <T>(method: 'POST' | 'PATCH', path: string, body?: unknown) =>
  apiClient<T>(path, {
    method,
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });

export const adminApi = {
  listUsers: () => get<{ users: AdminUser[] }>('/api/admin/users').then((r) => r.users),
  listOrganizations: () =>
    get<{ organizations: Organization[] }>('/api/admin/organizations').then((r) => r.organizations),
  createOrganization: (payload: NewOrganizationPayload) =>
    send<{ organization: CreatedOrganization }>('POST', '/api/admin/organizations', payload).then((r) => r.organization),
  assignAccess: (userId: number, role: RoleName, orgId: number | null) =>
    send<{ user: AdminUser }>('PATCH', `/api/admin/users/${userId}/access`, { role, orgId }).then((r) => r.user),
};

export const driverApi = {
  listTrips: () => get<{ trips: Trip[] }>('/api/driver/trips').then((r) => r.trips),
  completeNextCheckpoint: (tripId: number) =>
    send<{ trip: Trip }>('POST', `/api/driver/trips/${tripId}/checkpoints/next`).then((r) => r.trip),
  getHours: () => get<HoursSummary>('/api/driver/hours'),
};

export const dispatcherApi = {
  listDrivers: () => get<{ drivers: DispatcherDriverRow[] }>('/api/dispatcher/drivers').then((r) => r.drivers),
  getDriver: (driverId: number) => get<DispatcherDriverDetail>(`/api/dispatcher/drivers/${driverId}`),
  getResources: () => get<TripResources>('/api/dispatcher/resources'),
  createTrip: (payload: NewTripPayload) =>
    send<{ trip: Trip }>('POST', '/api/dispatcher/trips', payload).then((r) => r.trip),

  // Trucks and trailers share the same shape; `kind` picks the endpoint.
  listEquipment: (kind: EquipmentKind) =>
    get<{ equipment: Equipment[] }>(`/api/dispatcher/${equipmentPath(kind)}`).then((r) => r.equipment),
  createEquipment: (kind: EquipmentKind, payload: NewEquipmentPayload) =>
    send<{ equipment: Equipment }>('POST', `/api/dispatcher/${equipmentPath(kind)}`, payload).then((r) => r.equipment),
  updateEquipmentStatus: (kind: EquipmentKind, id: number, status: EquipmentStatus) =>
    send<{ equipment: Equipment }>('PATCH', `/api/dispatcher/${equipmentPath(kind)}/${id}`, { status }).then(
      (r) => r.equipment,
    ),

  // Pay rates: append-only history per driver.
  listPayRates: (driverId: number) =>
    get<{ driver: DriverSummary; rates: PayRate[] }>(`/api/dispatcher/drivers/${driverId}/pay-rates`),
  addPayRate: (driverId: number, payload: NewPayRatePayload) =>
    send<{ rate: PayRate }>('POST', `/api/dispatcher/drivers/${driverId}/pay-rates`, payload).then((r) => r.rate),
};

export const errorMessage = (err: unknown): string =>
  err instanceof Error ? err.message : 'Something went wrong. Please try again.';
