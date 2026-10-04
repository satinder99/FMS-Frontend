// [FRONTEND · React] src/lib/fleetApi.ts
// Every call to the fleet endpoints lives here. Pages never build URLs themselves.
// Built on YOUR apiClient(path, options): it attaches the Bearer token and silently
// refreshes + retries once on ACCESS_TOKEN_EXPIRED. Errors arrive as ApiError
// (message = the backend's `error` text, code = its `code`).
import { apiClient, apiDownload, apiUpload } from './apiClient';
import type {
  AdminEditRequest,
  AdminUser,
  CheckpointPreset,
  CreatedOrganization,
  EditRequestScope,
  NewOrganizationPayload,
  OrgDetail,
  OrgOverview,
  OrgTemplateStep,
  OrgUserTrips,
  Organization,
  TemplateStepPayload,
} from '../types/admin';
import type { RoleName } from '../types/roles';
import type {
  DispatcherDriverDetail,
  DispatcherDriverRow,
  DriverSummary,
  EditAccessState,
  Equipment,
  EquipmentKind,
  EquipmentStatus,
  HoursSummary,
  NewEquipmentPayload,
  NewPayRatePayload,
  NewEditRequestPayload,
  NewTripPayload,
  PayRate,
  StepTimesPayload,
  Trip,
  TripDocument,
  TripResources,
} from '../types/trips';

const equipmentPath = (kind: EquipmentKind) => (kind === 'truck' ? 'trucks' : 'trailers');

const get = <T>(path: string) => apiClient<T>(path);

const send = <T>(method: 'POST' | 'PATCH' | 'PUT' | 'DELETE', path: string, body?: unknown) =>
  apiClient<T>(path, {
    method,
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });

const listRequests = (scope: EditRequestScope) =>
  get<{ requests: AdminEditRequest[] }>(`/api/admin/edit-requests?scope=${scope}`).then((r) => r.requests);

export const adminApi = {
  listUsers: () => get<{ users: AdminUser[] }>('/api/admin/users').then((r) => r.users),
  listOrganizations: () =>
    get<{ organizations: Organization[] }>('/api/admin/organizations').then((r) => r.organizations),
  // Organizations (admin home) and what is inside one
  orgOverview: () => get<{ organizations: OrgOverview[] }>('/api/admin/organizations/overview').then((r) => r.organizations),
  orgDetail: (orgId: number, role?: 'dispatcher' | 'driver') =>
    get<OrgDetail>(`/api/admin/organizations/${orgId}${role ? `?role=${role}` : ''}`),
  userTrips: (orgId: number, userId: number) => get<OrgUserTrips>(`/api/admin/organizations/${orgId}/users/${userId}/trips`),

  // Dispatcher requests for extra step-time edits
  pendingEditRequestCount: () => get<{ count: number }>('/api/admin/edit-requests/count').then((r) => r.count),
  listPendingEditRequests: () => listRequests('pending'),
  listActiveEditWindows: () => listRequests('active'),
  listEditRequestHistory: () => listRequests('history'),
  approveEditRequest: (id: number, durationMinutes: number) =>
    send<unknown>('POST', `/api/admin/edit-requests/${id}/approve`, { durationMinutes }),
  denyEditRequest: (id: number, note?: string) => send<unknown>('POST', `/api/admin/edit-requests/${id}/deny`, { note }),
  revokeEditWindow: (id: number) => send<unknown>('POST', `/api/admin/edit-requests/${id}/revoke`),

  // The steps (checkpoints) an organization wants on every trip
  checkpointPresets: () => get<{ presets: CheckpointPreset[] }>('/api/admin/checkpoint-presets').then((r) => r.presets),
  orgCheckpoints: (orgId: number) =>
    get<{ steps: OrgTemplateStep[] }>(`/api/admin/organizations/${orgId}/checkpoints`).then((r) => r.steps),
  saveOrgCheckpoints: (orgId: number, steps: TemplateStepPayload[]) =>
    send<{ steps: OrgTemplateStep[] }>('PUT', `/api/admin/organizations/${orgId}/checkpoints`, { steps }).then((r) => r.steps),

  createOrganization: (payload: NewOrganizationPayload) =>
    send<{ organization: CreatedOrganization }>('POST', '/api/admin/organizations', payload).then((r) => r.organization),
  assignAccess: (userId: number, role: RoleName, orgId: number | null) =>
    send<{ user: AdminUser }>('PATCH', `/api/admin/users/${userId}/access`, { role, orgId }).then((r) => r.user),
};

export const driverApi = {
  listTrips: () => get<{ trips: Trip[] }>('/api/driver/trips').then((r) => r.trips),
  // One step at a time: start it, complete it, or (within 30 minutes) undo it / change its times.
  startStep: (tripId: number, key: string) =>
    send<{ trip: Trip }>('POST', `/api/driver/trips/${tripId}/checkpoints/${key}/start`).then((r) => r.trip),
  completeStep: (tripId: number, key: string) =>
    send<{ trip: Trip }>('POST', `/api/driver/trips/${tripId}/checkpoints/${key}/complete`).then((r) => r.trip),
  undoStep: (tripId: number, key: string) =>
    send<{ trip: Trip }>('POST', `/api/driver/trips/${tripId}/checkpoints/${key}/undo`).then((r) => r.trip),
  editStepTimes: (tripId: number, key: string, payload: StepTimesPayload) =>
    send<{ trip: Trip }>('PATCH', `/api/driver/trips/${tripId}/checkpoints/${key}/times`, payload).then((r) => r.trip),
  getHours: () => get<HoursSummary>('/api/driver/hours'),

  // Proof of delivery: a photo (camera or gallery) or a PDF, uploaded to the server
  uploadPod: (tripId: number, file: File) => {
    const form = new FormData();
    form.append('docType', 'pod'); // text fields go before the file
    form.append('file', file);
    return apiUpload<{ trip: Trip }>(`/api/driver/trips/${tripId}/documents`, form).then((r) => r.trip);
  },
  deleteDocument: (docId: number) => send<{ trip: Trip }>('DELETE', `/api/driver/documents/${docId}`).then((r) => r.trip),
};

export const dispatcherApi = {
  listDrivers: () => get<{ drivers: DispatcherDriverRow[] }>('/api/dispatcher/drivers').then((r) => r.drivers),
  getDriver: (driverId: number) => get<DispatcherDriverDetail>(`/api/dispatcher/drivers/${driverId}`),
  getResources: () => get<TripResources>('/api/dispatcher/resources'),
  createTrip: (payload: NewTripPayload) =>
    send<{ trip: Trip }>('POST', '/api/dispatcher/trips', payload).then((r) => r.trip),

  // Downloads: one file, or every document of a trip as a single ZIP
  downloadDocument: (doc: TripDocument) => apiDownload(`/api/dispatcher/documents/${doc.id}/download`, doc.downloadName),
  downloadTripDocuments: (trip: Pick<Trip, 'id' | 'reference'>) =>
    apiDownload(`/api/dispatcher/trips/${trip.id}/documents/download`, `${trip.reference}-documents.zip`),

  // Correct a step's times (one free edit per step; more only inside an admin-approved window)
  editStepTimes: (tripId: number, key: string, payload: StepTimesPayload) =>
    send<{ trip: Trip }>('PATCH', `/api/dispatcher/trips/${tripId}/checkpoints/${key}/times`, payload).then((r) => r.trip),
  getEditAccess: () => get<EditAccessState>('/api/dispatcher/edit-access'),
  requestEditAccess: (payload: NewEditRequestPayload) => send<unknown>('POST', '/api/dispatcher/edit-access/requests', payload),
  cancelEditRequest: (requestId: number) => send<unknown>('POST', `/api/dispatcher/edit-access/requests/${requestId}/cancel`),

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
