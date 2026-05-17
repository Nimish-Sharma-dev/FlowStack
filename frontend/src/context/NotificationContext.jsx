import React, { createContext, useContext } from 'react';

export const NotificationContext = createContext(null);

export const useNotification = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotification must be used within NotificationContext.Provider');
  return ctx;
};
