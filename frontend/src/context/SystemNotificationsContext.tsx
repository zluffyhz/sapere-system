// Contexto para notificações do sistema (sino no header)
import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';

export type SystemNotificationType = 'patient_created' | 'appointment_scheduled' | 'appointment_completed' | 'message_posted' | 'system_alert';

export interface SystemNotification {
  id: string;
  type: SystemNotificationType;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  data?: Record<string, any>;
  priority: 'low' | 'normal' | 'high';
}

interface SystemNotificationsContextType {
  notifications: SystemNotification[];
  unreadCount: number;
  addNotification: (notification: Omit<SystemNotification, 'id' | 'createdAt'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
}

const SystemNotificationsContext = createContext<SystemNotificationsContextType | undefined>(undefined);

export const useSystemNotifications = () => {
  const context = useContext(SystemNotificationsContext);
  if (!context) {
    throw new Error('useSystemNotifications must be used within a SystemNotificationsProvider');
  }
  return context;
};

interface SystemNotificationsProviderProps {
  children: ReactNode;
}

export const SystemNotificationsProvider: React.FC<SystemNotificationsProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<SystemNotification[]>([]);
  const { user } = useAuth();

  const generateId = () => `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  const addNotification = useCallback((notification: Omit<SystemNotification, 'id' | 'createdAt'>) => {
    const newNotification: SystemNotification = {
      ...notification,
      id: generateId(),
      createdAt: new Date().toISOString(),
      read: false
    };

    setNotifications(prev => [newNotification, ...prev.slice(0, 49)]); // Manter máximo de 50 notificações
  }, []);

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, read: true }))
    );
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  // Carregar notificações salvas no localStorage
  useEffect(() => {
    if (!user?.id) return;
    
    const savedNotifications = localStorage.getItem(`sapere_notifications_${user.id}`);
    if (savedNotifications) {
      try {
        const parsed = JSON.parse(savedNotifications);
        setNotifications(parsed);
      } catch (error) {
        console.error('Erro ao carregar notificações:', error);
      }
    }
  }, [user?.id]);

  // Salvar notificações no localStorage
  useEffect(() => {
    if (!user?.id || notifications.length === 0) return;
    
    localStorage.setItem(`sapere_notifications_${user.id}`, JSON.stringify(notifications));
  }, [notifications, user?.id]);

  return (
    <SystemNotificationsContext.Provider value={{
      notifications,
      unreadCount,
      addNotification,
      markAsRead,
      markAllAsRead,
      removeNotification,
      clearAll
    }}>
      {children}
    </SystemNotificationsContext.Provider>
  );
};

export default SystemNotificationsProvider;