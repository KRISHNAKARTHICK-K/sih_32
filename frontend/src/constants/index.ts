import type { NavItem } from '../types';

export const APP_NAME = 'AGRIPROCURE';
export const APP_DESCRIPTION = 'Agricultural Procurement & Queue Management ERP';
export const APP_VERSION = '1.0.0-SNAPSHOT';

export const NAV_ITEMS: NavItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    path: '/',
    iconName: 'LayoutDashboard',
    description: 'System health, operations overview, and quick status',
  },
  {
    id: 'operations',
    label: 'Operations',
    path: '/operations',
    iconName: 'Activity',
    description: 'Daily operational queue and procurement desk',
  },
  {
    id: 'farmers',
    label: 'Farmers',
    path: '/farmers',
    iconName: 'Users',
    description: 'Farmer profiles, land records, and verified registries',
  },
  {
    id: 'centres',
    label: 'Centres',
    path: '/centres',
    iconName: 'Building2',
    description: 'Procurement centres, capacities, and weighbridges',
  },
  {
    id: 'slots',
    label: 'Slots',
    path: '/slots',
    iconName: 'CalendarCheck',
    description: 'Slot booking schedules, quotas, and queue allocations',
  },
  {
    id: 'procurement',
    label: 'Procurement',
    path: '/procurement',
    iconName: 'PackageCheck',
    description: 'Produce intake, moisture/quality testing, and receipts',
  },
  {
    id: 'payments',
    label: 'Payments',
    path: '/payments',
    iconName: 'CreditCard',
    description: 'Disbursements, direct bank transfers, and billing records',
  },
  {
    id: 'analytics',
    label: 'Analytics',
    path: '/analytics',
    iconName: 'BarChart3',
    description: 'Reports, intake trends, and center performance',
  },
  {
    id: 'settings',
    label: 'Settings',
    path: '/settings',
    iconName: 'Settings',
    description: 'System configurations, audit logs, and access control',
  },
];
