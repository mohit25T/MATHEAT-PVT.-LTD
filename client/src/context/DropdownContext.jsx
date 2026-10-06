import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api/client';

const DropdownContext = createContext(null);

export const DropdownProvider = ({ children }) => {
  const [dropdowns, setDropdowns] = useState({});
  const [loading, setLoading] = useState(true);

  // Fetch all dropdown categories from MongoDB
  const fetchAllDropdowns = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.dropdowns.getAll().catch(() => ({ data: {} }));
      const data = res?.data || {};
      setDropdowns(data);
    } catch (err) {
      console.warn('[DROPDOWN CONTEXT] Failed to load dropdowns from database:', err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllDropdowns();
  }, [fetchAllDropdowns]);

  // Helper to get options for any key (normalized lowercase)
  const getOptions = useCallback((key) => {
    if (!key) return [];
    const normalizedKey = String(key).toLowerCase().trim();
    return dropdowns[normalizedKey] || [];
  }, [dropdowns]);

  // Add an option to database and update state
  const addOption = useCallback(async (key, optionData) => {
    if (!key) return null;
    const normalizedKey = String(key).toLowerCase().trim();
    const value = typeof optionData === 'object' && optionData !== null ? optionData.value : String(optionData);
    const label = typeof optionData === 'object' && optionData !== null ? (optionData.label || optionData.value) : String(optionData);

    const newOpt = { value: value.trim(), label: label.trim() };

    // Optimistic local update
    setDropdowns((prev) => {
      const currentList = prev[normalizedKey] || [];
      if (currentList.some((o) => o.value.toLowerCase() === newOpt.value.toLowerCase())) {
        return prev;
      }
      return {
        ...prev,
        [normalizedKey]: [...currentList, newOpt]
      };
    });

    // Save to database
    try {
      const res = await api.dropdowns.addOption(normalizedKey, newOpt);
      if (res && res.data) {
        setDropdowns((prev) => ({
          ...prev,
          [normalizedKey]: res.data
        }));
      }
      return newOpt;
    } catch (err) {
      console.error(`[DROPDOWN CONTEXT] Error saving option to database for "${key}":`, err.message);
      return newOpt;
    }
  }, []);

  // Remove option from database and state
  const deleteOption = useCallback(async (key, value) => {
    if (!key || !value) return;
    const normalizedKey = String(key).toLowerCase().trim();
    const valStr = String(value).trim();

    setDropdowns((prev) => {
      const currentList = prev[normalizedKey] || [];
      return {
        ...prev,
        [normalizedKey]: currentList.filter((o) => o.value.toLowerCase() !== valStr.toLowerCase())
      };
    });

    try {
      await api.dropdowns.deleteOption(normalizedKey, valStr);
    } catch (err) {
      console.warn(`[DROPDOWN CONTEXT] Error deleting option from "${key}":`, err.message);
    }
  }, []);

  const value = {
    dropdowns,
    loading,
    getOptions,
    addOption,
    deleteOption,
    refresh: fetchAllDropdowns
  };

  return (
    <DropdownContext.Provider value={value}>
      {children}
    </DropdownContext.Provider>
  );
};

export const useDropdowns = () => {
  const context = useContext(DropdownContext);
  if (!context) {
    // Return a graceful fallback if used outside provider
    return {
      dropdowns: {},
      loading: false,
      getOptions: () => [],
      addOption: async () => null,
      deleteOption: async () => {},
      refresh: async () => {}
    };
  }
  return context;
};

export default DropdownContext;
