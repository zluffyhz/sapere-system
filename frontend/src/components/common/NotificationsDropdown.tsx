// Dropdown de notificações para o sino no header
import React, { useState, useRef, useEffect } from 'react';
import {
  Bell,
  X,
  Check,
  User,
  Calendar,
  MessageSquare,
  AlertCircle,
  Clock,
  CheckCircle
} from 'lucide-react';
import { useSystemNotifications } from '@/context/SystemNotificationsContext';
import { formatDate } from '@/utils/formatting';

const NotificationsDropdown: React.FC = () => {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAll
  } = useSystemNotifications();

  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fechar dropdown quando clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'patient_created':
        return <User className="h-4 w-4 text-blue-500" />;
      case 'appointment_scheduled':
      case 'appointment_completed':
        return <Calendar className="h-4 w-4 text-green-500" />;
      case 'message_posted':
        return <MessageSquare className="h-4 w-4 text-sapere-orange" />;
      case 'system_alert':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };

  const getNotificationBg = (read: boolean, priority: string) => {
    if (read) return 'bg-gray-50';
    
    switch (priority) {
      case 'high':
        return 'bg-red-50 border-l-4 border-red-400';
      case 'normal':
        return 'bg-blue-50 border-l-4 border-blue-400';
      case 'low':
        return 'bg-gray-50 border-l-4 border-gray-400';
      default:
        return 'bg-white';
    }
  };

  const handleNotificationClick = (notification: any) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }

    // Aqui você pode adicionar navegação baseada no tipo de notificação
    switch (notification.type) {
      case 'message_posted':
        // Navegar para comunicação
        window.location.href = '/communication';
        break;
      case 'patient_created':
        // Navegar para pacientes
        window.location.href = '/patients';
        break;
      case 'appointment_scheduled':
      case 'appointment_completed':
        // Navegar para agendamentos
        window.location.href = '/appointments';
        break;
      default:
        // Fechar dropdown
        setIsOpen(false);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Sino de notificações */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-sapere-brown hover:bg-sapere-orange/20 rounded-full transition-colors relative"
        title="Notificações"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full text-xs w-5 h-5 flex items-center justify-center font-medium">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <>
          <div className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-50 max-h-96 overflow-hidden">
            {/* Header */}
            <div className="px-4 py-3 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  Notificações
                  {unreadCount > 0 && (
                    <span className="ml-2 bg-red-100 text-red-600 text-xs px-2 py-1 rounded-full">
                      {unreadCount} nova{unreadCount > 1 ? 's' : ''}
                    </span>
                  )}
                </h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Ações */}
              {notifications.length > 0 && (
                <div className="flex items-center gap-2 mt-2">
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-xs text-sapere-orange hover:text-sapere-brown font-medium"
                    >
                      Marcar todas como lidas
                    </button>
                  )}
                  <button
                    onClick={clearAll}
                    className="text-xs text-gray-500 hover:text-gray-700 font-medium"
                  >
                    Limpar todas
                  </button>
                </div>
              )}
            </div>

            {/* Lista de notificações */}
            <div className="max-h-80 overflow-y-auto">
              {notifications.length > 0 ? (
                notifications.map(notification => (
                  <div
                    key={notification.id}
                    className={`px-4 py-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${getNotificationBg(notification.read, notification.priority)}`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-1">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm ${notification.read ? 'text-gray-600' : 'text-gray-900 font-medium'}`}>
                          {notification.title}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {notification.message}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center text-xs text-gray-400">
                            <Clock className="h-3 w-3 mr-1" />
                            {formatDate(notification.createdAt)}
                          </div>
                          <div className="flex items-center space-x-2">
                            {!notification.read && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  markAsRead(notification.id);
                                }}
                                className="text-sapere-orange hover:text-sapere-brown"
                                title="Marcar como lida"
                              >
                                <Check className="h-3 w-3" />
                              </button>
                            )}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                removeNotification(notification.id);
                              }}
                              className="text-gray-400 hover:text-gray-600"
                              title="Remover"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="px-4 py-8 text-center">
                  <Bell className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">Nenhuma notificação</p>
                </div>
              )}
            </div>

            {/* Footer */}
            {notifications.length > 5 && (
              <div className="px-4 py-2 border-t border-gray-200 text-center">
                <button className="text-sm text-sapere-orange hover:text-sapere-brown font-medium">
                  Ver todas as notificações
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationsDropdown;