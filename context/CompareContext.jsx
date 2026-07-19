'use client';
import { createContext, useContext, useState, useEffect } from 'react';

const MAX_COMPARE = 4;
const STORAGE_KEY = 'intrafer_compare';

const CompareContext = createContext({
  compareIds: [],
  isFull: false,
  isSelected: () => false,
  addToCompare: () => false,
  removeFromCompare: () => {},
  clearCompare: () => {},
});

export default function CompareProvider({ children }) {
  const [compareIds, setCompareIds] = useState([]);

  useEffect(() => {
    try {
      const saved = JSON.parse(sessionStorage.getItem(STORAGE_KEY) || '[]');
      if (Array.isArray(saved)) setCompareIds(saved.slice(0, MAX_COMPARE));
    } catch (_) {}
  }, []);

  const persist = (next) => {
    setCompareIds(next);
    try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch (_) {}
  };

  const isSelected = (id) => compareIds.includes(id);

  // Returns false (and does not add) if already at the 4-item cap.
  const addToCompare = (id) => {
    if (compareIds.includes(id)) return true;
    if (compareIds.length >= MAX_COMPARE) return false;
    persist([...compareIds, id]);
    return true;
  };

  const removeFromCompare = (id) => {
    persist(compareIds.filter((cid) => cid !== id));
  };

  const clearCompare = () => persist([]);

  return (
    <CompareContext.Provider value={{
      compareIds,
      isFull: compareIds.length >= MAX_COMPARE,
      isSelected,
      addToCompare,
      removeFromCompare,
      clearCompare,
    }}>
      {children}
    </CompareContext.Provider>
  );
}

export const useCompare = () => useContext(CompareContext);
