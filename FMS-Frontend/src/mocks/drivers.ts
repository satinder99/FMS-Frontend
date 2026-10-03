import type { DriverSummary, HoursSummary } from '../types/trips';

/**
 * TEMP: until real driver records exist, the driver portal shows this driver's data
 * regardless of who is logged in. Replace with `user.id` -> driver lookup via the API.
 */
export const DEMO_DRIVER_ID = 101;

export const mockDrivers: DriverSummary[] = [
  { id: 101, name: 'Harpreet Gill', phone: '+1 905 555 0141' },
  { id: 102, name: 'Amandeep Sidhu', phone: '+1 905 555 0172' },
  { id: 103, name: 'Gurpreet Brar', phone: '+1 647 555 0119' },
  { id: 104, name: 'Jaswinder Dhillon', phone: '+1 416 555 0133' },
];

// $32/hr placeholder rate — real pay will come from the payroll/settlement service.
export const mockHours: HoursSummary = {
  today: { hours: 6.75, earnings: 216 },
  week: { hours: 41.5, earnings: 1328 },
  month: { hours: 168, earnings: 5376 },
  ytd: { hours: 1624, earnings: 51968 },
  dailyDriveLimit: 11,
};
