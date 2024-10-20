import React, { createContext, useState, useContext } from 'react';

const AppContext = createContext();

export const useApp = () => useContext(AppContext);

export const AppProvider = ({ children }) => {
  const [scanQRCode, setScanQRCode] = useState(() => {});

  const value = {
    scanQRCode,
    setScanQRCode,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};