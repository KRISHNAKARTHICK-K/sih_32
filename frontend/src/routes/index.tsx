import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppLayout } from '../layouts/AppLayout';
import { LoginPage } from '../pages/LoginPage';
import { NotFoundPage } from '../pages/NotFoundPage';
import { ProtectedRoute } from '../components/auth/ProtectedRoute';
import { useAuth } from '../auth/AuthContext';

// Farmer Portal Pages
import { FarmerDashboardPage } from '../pages/farmer/FarmerDashboardPage';
import { NewBookingPage } from '../pages/farmer/NewBookingPage';
import { FarmerBookingsPage } from '../pages/farmer/FarmerBookingsPage';
import { BookingDetailsPage } from '../pages/farmer/BookingDetailsPage';
import { FarmerQueuePage } from '../pages/farmer/FarmerQueuePage';
import { FarmerProcurementPage } from '../pages/farmer/FarmerProcurementPage';
import { FarmerPaymentsPage } from '../pages/farmer/FarmerPaymentsPage';
import { FarmerNotificationsPage } from '../pages/farmer/FarmerNotificationsPage';

// Operator ERP Pages
import { OperatorDashboardPage } from '../pages/operator/OperatorDashboardPage';
import { OperatorQueuePage } from '../pages/operator/OperatorQueuePage';
import { TokenProcessingPage } from '../pages/operator/TokenProcessingPage';
import { WeighbridgePage } from '../pages/operator/WeighbridgePage';
import { QualityInspectionPage } from '../pages/operator/QualityInspectionPage';
import { OperatorProcurementPage } from '../pages/operator/OperatorProcurementPage';
import { ProcurementDetailsPage } from '../pages/operator/ProcurementDetailsPage';
import { OperatorBookingsPage } from '../pages/operator/OperatorBookingsPage';

// Centre Manager ERP Pages
import { ManagerDashboardPage } from '../pages/manager/ManagerDashboardPage';
import { ManagerOperationsPage } from '../pages/manager/ManagerOperationsPage';
import { ManagerBookingsPage } from '../pages/manager/ManagerBookingsPage';
import { ManagerQueuePage } from '../pages/manager/ManagerQueuePage';
import { ManagerProcurementPage } from '../pages/manager/ManagerProcurementPage';
import { ManagerPaymentsPage } from '../pages/manager/ManagerPaymentsPage';
import { ManagerSlotsPage } from '../pages/manager/ManagerSlotsPage';
import { ManagerStaffPage } from '../pages/manager/ManagerStaffPage';
import { ManagerReportsPage } from '../pages/manager/ManagerReportsPage';

// Admin ERP Pages
import { AdminDashboardPage } from '../pages/admin/AdminDashboardPage';
import { AdminUsersPage } from '../pages/admin/AdminUsersPage';
import { AdminFarmersPage } from '../pages/admin/AdminFarmersPage';
import { AdminCentresPage } from '../pages/admin/AdminCentresPage';
import { AdminCropsPage } from '../pages/admin/AdminCropsPage';
import { AdminPricesPage } from '../pages/admin/AdminPricesPage';
import { AdminBookingsPage } from '../pages/admin/AdminBookingsPage';
import { AdminProcurementPage } from '../pages/admin/AdminProcurementPage';
import { AdminPaymentsPage } from '../pages/admin/AdminPaymentsPage';
import { AdminAuditPage } from '../pages/admin/AdminAuditPage';
import { AdminSystemPage } from '../pages/admin/AdminSystemPage';

const RoleBasedDashboard: React.FC = () => {
  const { role } = useAuth();
  if (role === 'FARMER') {
    return <FarmerDashboardPage />;
  }
  if (role === 'OPERATOR') {
    return <OperatorDashboardPage />;
  }
  if (role === 'CENTRE_MANAGER') {
    return <ManagerDashboardPage />;
  }
  if (role === 'ADMIN') {
    return <AdminDashboardPage />;
  }
  return <Navigate to="/login" replace />;
};

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <RoleBasedDashboard />,
      },
      {
        path: 'dashboard',
        element: <Navigate to="/" replace />,
      },

      // Farmer Portal Routes (Protected exclusively for FARMER role)
      {
        path: 'farmer',
        element: (
          <ProtectedRoute allowedRoles={['FARMER']}>
            <FarmerDashboardPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'farmer/bookings',
        element: (
          <ProtectedRoute allowedRoles={['FARMER']}>
            <FarmerBookingsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'farmer/bookings/new',
        element: (
          <ProtectedRoute allowedRoles={['FARMER']}>
            <NewBookingPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'farmer/bookings/:id',
        element: (
          <ProtectedRoute allowedRoles={['FARMER']}>
            <BookingDetailsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'farmer/queue',
        element: (
          <ProtectedRoute allowedRoles={['FARMER']}>
            <FarmerQueuePage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'farmer/procurement',
        element: (
          <ProtectedRoute allowedRoles={['FARMER']}>
            <FarmerProcurementPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'farmer/payments',
        element: (
          <ProtectedRoute allowedRoles={['FARMER']}>
            <FarmerPaymentsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'farmer/notifications',
        element: (
          <ProtectedRoute allowedRoles={['FARMER']}>
            <FarmerNotificationsPage />
          </ProtectedRoute>
        ),
      },

      // Operator ERP Routes (Protected for OPERATOR, CENTRE_MANAGER, ADMIN)
      {
        path: 'operator',
        element: (
          <ProtectedRoute allowedRoles={['OPERATOR', 'CENTRE_MANAGER', 'ADMIN']}>
            <OperatorDashboardPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'operator/queue',
        element: (
          <ProtectedRoute allowedRoles={['OPERATOR', 'CENTRE_MANAGER', 'ADMIN']}>
            <OperatorQueuePage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'operator/queue/:id',
        element: (
          <ProtectedRoute allowedRoles={['OPERATOR', 'CENTRE_MANAGER', 'ADMIN']}>
            <TokenProcessingPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'operator/bookings',
        element: (
          <ProtectedRoute allowedRoles={['OPERATOR', 'CENTRE_MANAGER', 'ADMIN']}>
            <OperatorBookingsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'operator/weighment',
        element: (
          <ProtectedRoute allowedRoles={['OPERATOR', 'CENTRE_MANAGER', 'ADMIN']}>
            <WeighbridgePage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'operator/quality',
        element: (
          <ProtectedRoute allowedRoles={['OPERATOR', 'CENTRE_MANAGER', 'ADMIN']}>
            <QualityInspectionPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'operator/procurement',
        element: (
          <ProtectedRoute allowedRoles={['OPERATOR', 'CENTRE_MANAGER', 'ADMIN']}>
            <OperatorProcurementPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'operator/procurement/:id',
        element: (
          <ProtectedRoute allowedRoles={['OPERATOR', 'CENTRE_MANAGER', 'ADMIN']}>
            <ProcurementDetailsPage />
          </ProtectedRoute>
        ),
      },

      // Centre Manager ERP Routes (Protected exclusively for CENTRE_MANAGER and ADMIN)
      {
        path: 'manager',
        element: (
          <ProtectedRoute allowedRoles={['CENTRE_MANAGER', 'ADMIN']}>
            <ManagerDashboardPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'manager/operations',
        element: (
          <ProtectedRoute allowedRoles={['CENTRE_MANAGER', 'ADMIN']}>
            <ManagerOperationsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'manager/bookings',
        element: (
          <ProtectedRoute allowedRoles={['CENTRE_MANAGER', 'ADMIN']}>
            <ManagerBookingsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'manager/queue',
        element: (
          <ProtectedRoute allowedRoles={['CENTRE_MANAGER', 'ADMIN']}>
            <ManagerQueuePage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'manager/procurement',
        element: (
          <ProtectedRoute allowedRoles={['CENTRE_MANAGER', 'ADMIN']}>
            <ManagerProcurementPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'manager/payments',
        element: (
          <ProtectedRoute allowedRoles={['CENTRE_MANAGER', 'ADMIN']}>
            <ManagerPaymentsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'manager/slots',
        element: (
          <ProtectedRoute allowedRoles={['CENTRE_MANAGER', 'ADMIN']}>
            <ManagerSlotsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'manager/staff',
        element: (
          <ProtectedRoute allowedRoles={['CENTRE_MANAGER', 'ADMIN']}>
            <ManagerStaffPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'manager/reports',
        element: (
          <ProtectedRoute allowedRoles={['CENTRE_MANAGER', 'ADMIN']}>
            <ManagerReportsPage />
          </ProtectedRoute>
        ),
      },

      // Admin ERP Routes (Protected exclusively for ADMIN role)
      {
        path: 'admin',
        element: (
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AdminDashboardPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'admin/users',
        element: (
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AdminUsersPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'admin/farmers',
        element: (
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AdminFarmersPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'admin/centres',
        element: (
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AdminCentresPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'admin/crops',
        element: (
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AdminCropsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'admin/prices',
        element: (
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AdminPricesPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'admin/bookings',
        element: (
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AdminBookingsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'admin/procurement',
        element: (
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AdminProcurementPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'admin/payments',
        element: (
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AdminPaymentsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'admin/audit',
        element: (
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AdminAuditPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'admin/system',
        element: (
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AdminSystemPage />
          </ProtectedRoute>
        ),
      },

      // Aliases & redirects
      {
        path: 'farmers',
        element: <Navigate to="/admin/farmers" replace />,
      },
      {
        path: 'centres',
        element: <Navigate to="/admin/centres" replace />,
      },
      {
        path: 'crops',
        element: <Navigate to="/admin/crops" replace />,
      },
      {
        path: 'prices',
        element: <Navigate to="/admin/prices" replace />,
      },
      {
        path: 'payments',
        element: <Navigate to="/admin/payments" replace />,
      },
      {
        path: 'audit-logs',
        element: <Navigate to="/admin/audit" replace />,
      },
      {
        path: 'settings',
        element: <Navigate to="/admin/system" replace />,
      },
      {
        path: 'analytics',
        element: <Navigate to="/admin/dashboard" replace />,
      },
      {
        path: 'notifications',
        element: <Navigate to="/farmer/notifications" replace />,
      },
    ],
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
]);

export default router;
