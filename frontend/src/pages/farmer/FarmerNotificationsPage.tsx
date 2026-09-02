import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../auth/AuthContext';
import { farmerApi } from '../../api/farmerApi';
import type { NotificationType } from '../../types/farmer';
import {
  CalendarCheck,
  Clock,
  PackageCheck,
  CreditCard,
  Check,
} from 'lucide-react';
import { LoadingState } from '../../components/common/LoadingState';
import { ErrorState } from '../../components/common/ErrorState';
import { EmptyState } from '../../components/common/EmptyState';

export const FarmerNotificationsPage: React.FC = () => {
  const { user } = useAuth();
  const userId = user?.id;
  const queryClient = useQueryClient();

  const {
    data: notifications = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['farmer-notifications', userId],
    queryFn: () => (userId ? farmerApi.getUserNotifications(userId) : Promise.resolve([])),
    enabled: !!userId,
  });

  const markReadMutation = useMutation({
    mutationFn: farmerApi.markNotificationRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['farmer-notifications'] });
      queryClient.invalidateQueries({ queryKey: ['unread-notifications-count'] });
    },
  });

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case 'BOOKING':
        return <CalendarCheck className="w-4 h-4 text-emerald-700" />;
      case 'QUEUE':
        return <Clock className="w-4 h-4 text-amber-600" />;
      case 'PAYMENT':
        return <CreditCard className="w-4 h-4 text-blue-700" />;
      case 'PROCUREMENT':
      default:
        return <PackageCheck className="w-4 h-4 text-purple-700" />;
    }
  };

  if (isLoading) {
    return <LoadingState message="Loading your system notifications..." />;
  }

  if (isError) {
    return (
      <ErrorState
        title="Unable to load notifications"
        message="Could not retrieve notifications from the server."
        onRetry={refetch}
      />
    );
  }

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">System Notifications</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Operational alerts, queue token callouts, and payment disbursement notices
          </p>
        </div>
        {unreadCount > 0 && (
          <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 text-xs font-semibold rounded-full">
            {unreadCount} unread
          </span>
        )}
      </div>

      {notifications.length === 0 ? (
        <EmptyState
          title="No notifications"
          description="You do not have any operational notifications right now."
        />
      ) : (
        <div className="space-y-2.5">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`p-4 rounded-lg border flex items-start justify-between gap-4 transition-colors ${
                notification.read
                  ? 'bg-white border-slate-200'
                  : 'bg-emerald-50/60 border-emerald-300 shadow-xs'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg mt-0.5 shrink-0 ${notification.read ? 'bg-slate-100' : 'bg-white shadow-xs'}`}>
                  {getNotificationIcon(notification.type)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className={`text-xs font-bold ${notification.read ? 'text-slate-800' : 'text-emerald-950'}`}>
                      {notification.title}
                    </h2>
                    {!notification.read && (
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                    )}
                  </div>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    {notification.message}
                  </p>
                  <span className="text-[10px] text-slate-400 mt-2 block">
                    {new Date(notification.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>

              {!notification.read && (
                <button
                  type="button"
                  disabled={markReadMutation.isPending}
                  onClick={() => markReadMutation.mutate(notification.id)}
                  className="shrink-0 p-1.5 text-xs font-medium text-emerald-800 hover:bg-emerald-100 rounded transition-colors"
                  title="Mark as read"
                >
                  <Check className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FarmerNotificationsPage;
