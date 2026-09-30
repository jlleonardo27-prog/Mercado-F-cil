import React from 'react';
import {
  X,
  Bell,
  CheckCheck,
  Clock
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const NotificationsScreen: React.FC = () => {
  const {
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    setSubView,
    t
  } = useApp();

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl space-y-4 animate-in fade-in">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-black text-white font-display">
              {t('notifications_title')}
            </h2>
            <p className="text-[11px] text-slate-400">{t('notifications_subtitle')}</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {notifications.length > 0 && (
            <button
              type="button"
              onClick={markAllNotificationsRead}
              className="text-xs text-emerald-400 hover:text-emerald-300 font-bold flex items-center space-x-1 cursor-pointer"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>{t('mark_read')}</span>
            </button>
          )}
          <button
            type="button"
            onClick={() => setSubView('none')}
            className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-2.5">
        {notifications.length === 0 ? (
          <div className="text-center py-10 text-slate-500 text-xs space-y-1">
            <Bell className="w-8 h-8 mx-auto text-slate-700" />
            <p>{t('empty_notifications')}</p>
          </div>
        ) : (
          notifications.map((notif) => (
            <div
              key={notif.id}
              onClick={() => markNotificationRead(notif.id)}
              className={`p-3.5 rounded-2xl border transition cursor-pointer space-y-1.5 ${
                notif.lida
                  ? 'bg-slate-950/60 border-slate-800 text-slate-400'
                  : 'bg-emerald-950/30 border-emerald-500/30 text-slate-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-black text-white">
                    {notif.titulo}
                  </span>
                  {!notif.lida && (
                    <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  )}
                </div>
                <span className="text-[10px] text-slate-500 flex items-center space-x-1">
                  <Clock className="w-3 h-3 inline" />
                  <span>{notif.hora} • {notif.data}</span>
                </span>
              </div>

              <p className="text-xs leading-relaxed text-slate-300">
                {notif.mensagem}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
