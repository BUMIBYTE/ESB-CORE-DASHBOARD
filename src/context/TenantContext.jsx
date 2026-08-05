import React, { createContext, useContext, useState } from "react";

const TenantContext = createContext(null);

export const TenantProvider = ({ children }) => {
  const [selectedTenant, setSelectedTenant] = useState(() => {
    // Membaca dari localStorage agar pilihan tidak hilang saat page refresh
    const saved = localStorage.getItem("selectedTenant");
    try {
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const changeTenant = (tenant) => {
    setSelectedTenant(tenant);
    if (tenant) {
      localStorage.setItem("selectedTenant", JSON.stringify(tenant));
    } else {
      localStorage.removeItem("selectedTenant");
    }
  };

  return (
    <TenantContext.Provider
      value={{
        selectedTenant,
        changeTenant,
        tenantId: selectedTenant?.id || null,
      }}
    >
      {children}
    </TenantContext.Provider>
  );
};

// Custom Hook untuk memanggil state tenant di mana saja
export const useTenant = () => {
  const context = useContext(TenantContext);
  if (!context) {
    throw new Error("useTenant harus digunakan di dalam <TenantProvider />");
  }
  return context;
};