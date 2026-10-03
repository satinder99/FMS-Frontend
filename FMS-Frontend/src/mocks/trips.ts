import type { Checkpoint, CheckpointKey, Trip } from '../types/trips';

const ago = (minutes: number) => new Date(Date.now() - minutes * 60_000).toISOString();
const ahead = (minutes: number) => new Date(Date.now() + minutes * 60_000).toISOString();

const TEMPLATE: { key: CheckpointKey; label: string }[] = [
  { key: 'reached_source', label: 'Reached source' },
  { key: 'pickup_truck', label: 'Pick up truck' },
  { key: 'pickup_trailer', label: 'Pick up trailer' },
  { key: 'load_trailer', label: 'Load trailer' },
  { key: 'start_journey', label: 'Start journey' },
  { key: 'immigration', label: 'Immigration / customs' },
  { key: 'pod_upload', label: 'Upload POD' },
];

/** `doneTimes[i]` is the completion time of the i-th checkpoint; missing = not done. */
function makeCheckpoints(crossBorder: boolean, doneTimes: string[]): Checkpoint[] {
  return TEMPLATE.filter((c) => c.key !== 'immigration' || crossBorder).map((c, i) => ({
    ...c,
    completedAt: doneTimes[i] ?? null,
  }));
}

export const mockTrips: Trip[] = [
  {
    id: 1,
    reference: 'FMS-2041',
    driverId: 101,
    driverName: 'Harpreet Gill',
    truckNumber: 'T-218',
    trailerNumber: 'TR-5507',
    origin: 'Brampton, ON',
    destination: 'Chicago, IL',
    crossBorder: true,
    scheduledPickup: ago(300),
    checkpoints: makeCheckpoints(true, [ago(290), ago(262), ago(240), ago(185)]),
  },
  {
    id: 2,
    reference: 'FMS-2046',
    driverId: 101,
    driverName: 'Harpreet Gill',
    truckNumber: 'T-218',
    trailerNumber: 'TR-5512',
    origin: 'Toronto, ON',
    destination: 'Montréal, QC',
    crossBorder: false,
    scheduledPickup: ahead(60 * 30),
    checkpoints: makeCheckpoints(false, []),
  },
  {
    id: 3,
    reference: 'FMS-2038',
    driverId: 102,
    driverName: 'Amandeep Sidhu',
    truckNumber: 'T-204',
    trailerNumber: 'TR-5391',
    origin: 'Mississauga, ON',
    destination: 'Ottawa, ON',
    crossBorder: false,
    scheduledPickup: ago(200),
    checkpoints: makeCheckpoints(false, [ago(195), ago(170), ago(150), ago(120), ago(95)]),
  },
  {
    id: 4,
    reference: 'FMS-2029',
    driverId: 103,
    driverName: 'Gurpreet Brar',
    truckNumber: 'T-231',
    trailerNumber: 'TR-5440',
    origin: 'Windsor, ON',
    destination: 'Detroit, MI',
    crossBorder: true,
    scheduledPickup: ago(600),
    checkpoints: makeCheckpoints(true, [ago(590), ago(560), ago(540), ago(500), ago(470), ago(420)]),
  },
  {
    id: 5,
    reference: 'FMS-2012',
    driverId: 103,
    driverName: 'Gurpreet Brar',
    truckNumber: 'T-231',
    trailerNumber: 'TR-5301',
    origin: 'Hamilton, ON',
    destination: 'Buffalo, NY',
    crossBorder: true,
    scheduledPickup: ago(60 * 52),
    checkpoints: makeCheckpoints(true, [
      ago(60 * 52),
      ago(60 * 51.5),
      ago(60 * 51),
      ago(60 * 50),
      ago(60 * 49),
      ago(60 * 47),
      ago(60 * 45),
    ]),
  },
];