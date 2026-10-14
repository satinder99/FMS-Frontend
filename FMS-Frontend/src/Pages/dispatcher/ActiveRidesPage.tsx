// [FRONTEND · React] src/pages/dispatcher/ActiveRidesPage.tsx
// Live board of the organization's rides. Per truck: an Outbound row (CAN → US) and an Inbound row (US → CAN),
// each with Pick-up / Border / Delivered. Click a row for the full step times and documents; cancel each row on its own.
import { Link } from 'react-router';
import AsyncState from '../../components/common/AsyncState';
import Avatar from '../../components/common/Avatar';
import RideRow from '../../components/rides/RideRow';
import { useApiData } from '../../hooks/useApiData';
import { dispatcherApi } from '../../lib/fleetApi';
import { formatDateTime } from '../../lib/format';
import type { ActiveOrder } from '../../types/trips';

const TRUCK_DOT: Record<ActiveOrder['truckState'], { color: string; text: string }> = {
  moving: { color: 'bg-emerald-500', text: 'On the road' },
  waiting: { color: 'bg-orange-400', text: 'Waiting to start' },
  awaiting_driver: { color: 'bg-orange-400', text: 'Waiting for the driver to accept' },
  idle: { color: 'bg-slate-300', text: 'No ride in progress' },
};

function Legend() {
  const item = (color: string, label: string) => (
    <li className="flex items-center gap-1.5">
      <span aria-hidden="true" className={`h-3 w-3 rounded-full ${color}`} /> {label}
    </li>
  );
  return (
    <ul className="flex flex-wrap gap-x-5 gap-y-1 text-sm text-slate-600" aria-label="Colour key">
      {item('bg-emerald-500', 'Completed')}
      {item('bg-orange-400', 'Pending')}
      {item('bg-slate-200', 'Not used (e.g. no border)')}
    </ul>
  );
}

function OrderBlock({ order, onChanged }: { order: ActiveOrder; onChanged: () => void | Promise<void> }) {
  const dot = TRUCK_DOT[order.truckState];
  const denied = order.response === 'denied';
  return (
    <section
      aria-label={`Truck ${order.truckNumber}, ${order.driver.name}`}
      className={`rounded-xl border bg-white p-4 shadow-sm ${denied ? 'border-red-300' : 'border-slate-200'}`}
    >
      <div className="mb-3 flex flex-wrap items-center gap-x-4 gap-y-2">
        <span className="flex items-center gap-2">
          <span className={`h-3.5 w-3.5 rounded-full ${dot.color}`} title={dot.text} />
          <span className="sr-only">{dot.text}.</span>
          <h2 className="text-lg font-semibold">Truck {order.truckNumber}</h2>
        </span>
        <span className="text-sm text-slate-500">Trailer {order.trailerNumber}</span>
        <span className="flex items-center gap-2 text-sm">
          <Avatar name={order.driver.name} photoUrl={order.driver.photoUrl} size="sm" />
          <Link to={`/dispatcher/drivers/${order.driver.id}`} className="text-sky-700 underline-offset-2 hover:underline">
            {order.driver.name}
          </Link>
        </span>
        <span className="ml-auto text-xs text-slate-400">{order.reference}</span>
      </div>

      {denied && (
        <p role="alert" className="mb-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-900">
          <span className="font-semibold">{order.driver.name} declined this ride</span>
          {order.respondedAt && <> ({formatDateTime(order.respondedAt)})</>}
          {order.denyReason ? <>: “{order.denyReason}”</> : '.'} Assign it to another driver from <Link to="/dispatcher/trips/new" className="underline">New order</Link>.
        </p>
      )}
      {order.response === 'pending' && !denied && (
        <p className="mb-3 rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-900">
          Waiting for {order.driver.name} to accept. The driver sees only the route, truck, trailer and date until then.
        </p>
      )}

      <div className="space-y-2">
        <RideRow direction="outbound" trip={order.outbound} onChanged={onChanged} />
        <RideRow direction="inbound" trip={order.inbound} outbound={order.outbound} onChanged={onChanged} />
      </div>
    </section>
  );
}

export default function ActiveRidesPage() {
  const { data, error, loading, reload } = useApiData(dispatcherApi.listRides, 15_000);
  const orders = data ?? [];

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Active rides</h1>
          <p className="text-sm text-slate-600">
            Outbound is Canada → US, inbound is US → Canada. Select a row to see each step’s times and download documents.
          </p>
        </div>
        <Legend />
      </div>

      <AsyncState loading={loading} error={error} hasData={!!data} onRetry={() => void reload()}>
        {orders.length === 0 ? (
          <p className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-600">
            No active rides. Create one from <Link to="/dispatcher/trips/new" className="text-sky-700 underline">New order</Link>.
          </p>
        ) : (
          <div className="space-y-4">
            {orders.map((o) => (
              <OrderBlock key={o.orderId} order={o} onChanged={reload} />
            ))}
          </div>
        )}
      </AsyncState>
    </div>
  );
}
