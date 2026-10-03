import type { AdminUser, Organization } from '../types/admin';

export const mockOrgs: Organization[] = [
  { id: 1, name: 'Dhaliwal Fleet Services', short_name: 'DFS' },
];

const daysAgo = (d: number) => new Date(Date.now() - d * 86_400_000).toISOString();

export const mockUsers: AdminUser[] = [
  { id: 1, first_name: 'Platform', last_name: 'Admin', email: 'admin@example.com', username: 'ADMINPAdmin', org_id: null, role_name: 'admin', status: 'active', created_at: daysAgo(90) },
  { id: 2, first_name: 'Simran', last_name: 'Kaur', email: 'simran@example.com', username: 'DFSSKaur', org_id: 1, role_name: 'dispatcher', status: 'active', created_at: daysAgo(60) },
  { id: 101, first_name: 'Harpreet', last_name: 'Gill', email: 'harpreet@example.com', username: 'DFSHGill', org_id: 1, role_name: 'driver', status: 'active', created_at: daysAgo(45) },
  { id: 102, first_name: 'Amandeep', last_name: 'Sidhu', email: 'aman@example.com', username: 'DFSASidhu', org_id: 1, role_name: 'driver', status: 'active', created_at: daysAgo(40) },
  { id: 103, first_name: 'Gurpreet', last_name: 'Brar', email: 'gurpreet@example.com', username: null, org_id: 1, role_name: 'driver', status: 'active', created_at: daysAgo(12) },
  { id: 201, first_name: 'Navjot', last_name: 'Randhawa', email: 'navjot@example.com', username: null, org_id: null, role_name: null, status: 'active', created_at: daysAgo(1) },
  { id: 202, first_name: 'Ravi', last_name: 'Mehta', email: 'ravi.m@example.com', username: null, org_id: null, role_name: null, status: 'active', created_at: daysAgo(3) },
  { id: 203, first_name: 'Karan', last_name: 'Virk', email: 'karan@example.com', username: null, org_id: null, role_name: null, status: 'active', created_at: daysAgo(0) },
];
