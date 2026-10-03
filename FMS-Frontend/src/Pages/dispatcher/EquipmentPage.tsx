// [FRONTEND · React] src/pages/dispatcher/EquipmentPage.tsx
import AsyncState from '../../components/common/AsyncState';
import EquipmentSection from '../../components/equipment/EquipmentSection';
import { useApiData } from '../../hooks/useApiData';
import { dispatcherApi } from '../../lib/fleetApi';

export default function EquipmentPage() {
  // Only needed for the "owner" dropdown (a driver can own a truck or trailer).
  const { data: resources, error, loading, reload } = useApiData(dispatcherApi.getResources);

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Trucks & trailers</h1>
        <p className="max-w-2xl text-sm text-slate-600">
          Mark each unit as company-owned or owned by a person. When a driver is assigned a unit they own,
          the pay rate for their own equipment applies instead of the company-equipment rate.
        </p>
      </div>

      <AsyncState loading={loading} error={error} hasData={!!resources} onRetry={() => void reload()}>
        <div className="space-y-10">
          <EquipmentSection kind="truck" drivers={resources?.drivers ?? []} />
          <EquipmentSection kind="trailer" drivers={resources?.drivers ?? []} />
        </div>
      </AsyncState>
    </div>
  );
}
