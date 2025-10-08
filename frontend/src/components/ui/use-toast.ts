import React, { useState, useCallback } from 'react';

export interface Toast {
  id: string;
  title?: string;
  description?: string;
  variant?: 'default' | 'destructive';
}

let toastCount = 0;

let globalToasts: Toast[] = [];
let toastListeners: (() => void)[] = [];

const notifyListeners = () => {
  toastListeners.forEach(listener => listener());
};

export const toast = ({ title, description, variant = 'default' }: Omit<Toast, 'id'>) => {
  const id = (toastCount++).toString();
  const newToast: Toast = { id, title, description, variant };

  globalToasts = [...globalToasts, newToast];
  notifyListeners();

  setTimeout(() => {
    globalToasts = globalToasts.filter(t => t.id !== id);
    notifyListeners();
  }, 5000);

  return { id };
};

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>(globalToasts);

  const subscribe = useCallback(() => {
    setToasts([...globalToasts]);
  }, []);

  React.useEffect(() => {
    toastListeners.push(subscribe);
    return () => {
      toastListeners = toastListeners.filter(listener => listener !== subscribe);
    };
  }, [subscribe]);

  const dismiss = useCallback((toastId?: string) => {
    globalToasts = toastId ? globalToasts.filter(t => t.id !== toastId) : [];
    notifyListeners();
  }, []);

  return {
    toast,
    dismiss,
    toasts,
  };
}