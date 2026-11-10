import React from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { X, Bell, AlertOctagon } from 'lucide-react';

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToModule: (moduleName: string) => void;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({
  isOpen,
  onClose,
  onNavigateToModule,
}) => {
  const { notifications, exceptions, markNotificationAsRead } = useData();
  const { canAccessFacility } = useAuth();

  if (!isOpen) return null;

  const scopedExceptions = exceptions.filter(
    (e) => e.status === 'open' && canAccessFacility(e.facilityId)
  );
  const scopedNotifications = notifications.filter(
    (n) => !n.facilityId || canAccessFacility(n.facilityId)
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full p-6 border border-slate-200">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Notifications & Alerts</h3>
              <p className="text-xs text-slate-500">Real-time system events, shortages, and exceptions</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-4 space-y-3 max-h-[60vh] overflow-y-auto p-1 custom-scrollbar">
          {/* Active Exceptions */}
          {scopedExceptions.map((exc) => (
            <div
              key={exc.id}
              className="p-3.5 rounded-xl border border-rose-200 bg-rose-50/70 text-left transition"
            >
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-800 uppercase px-2 py-0.5 rounded-full bg-rose-200/80">
                  <AlertOctagon className="w-3 h-3 text-rose-700" />
                  Exception: {exc.severity}
                </span>
                <span className="text-[11px] text-slate-400">{exc.date}</span>
              </div>
              <div className="font-bold text-slate-900 text-sm mt-1">{exc.title}</div>
              <div className="text-xs text-slate-600 mt-1">{exc.description}</div>
              <div className="mt-2 text-right">
                <button
                  onClick={() => {
                    onNavigateToModule('exceptions');
                    onClose();
                  }}
                  className="text-xs font-semibold text-rose-700 hover:text-rose-900 underline"
                >
                  View in Exception Monitoring &rarr;
                </button>
              </div>
            </div>
          ))}

          {/* Standard Notifications */}
          {scopedNotifications.map((notif) => (
            <div
              key={notif.id}
              onClick={() => markNotificationAsRead(notif.id)}
              className={`p-3.5 rounded-xl border text-left transition cursor-pointer ${
                notif.read ? 'bg-slate-50 border-slate-200 opacity-70' : 'bg-emerald-50/50 border-emerald-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">{notif.title}</span>
                <span className="text-[11px] text-slate-400">{notif.createdAt.substring(11, 16)}</span>
              </div>
              <p className="text-xs text-slate-600 mt-1">{notif.message}</p>
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 text-[11px] text-slate-500">
                <span>Module: {notif.module}</span>
                {notif.read ? (
                  <span className="text-slate-400">Read</span>
                ) : (
                  <span className="text-emerald-600 font-semibold">New</span>
                )}
              </div>
            </div>
          ))}

          {scopedNotifications.length === 0 && scopedExceptions.length === 0 && (
            <div className="text-center py-8 text-slate-400 text-xs">
              No active alerts or notifications.
            </div>
          )}
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 text-right">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
