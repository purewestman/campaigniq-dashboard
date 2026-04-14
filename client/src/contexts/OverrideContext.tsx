/*
 * Gap Override Context — CampaignIQ Dashboard
 * Manages manual gap overrides with comments, persisted to localStorage.
 * Each override marks a specific gap category for a partner as "complete"
 * with an optional comment and timestamp.
 */

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

export type GapCategory = "salesPro" | "techPro" | "bootcamp" | "implSpec" | "simplyPure" | "aspFoundations" | "aspStoragePro" | "aspSupportSpec";

export interface GapOverride {
  partnerId: number;
  category: GapCategory;
  comment: string;
  completedAt: string; // ISO timestamp
  completedBy: string; // user label
}

export interface AspOverride {
  partnerId: number;
  approvedAt: string;  // ISO timestamp
  note: string;
}

interface OverrideContextValue {
  overrides: GapOverride[];
  addOverride: (override: Omit<GapOverride, "completedAt">) => void;
  removeOverride: (partnerId: number, category: GapCategory) => void;
  getOverride: (partnerId: number, category: GapCategory) => GapOverride | undefined;
  getPartnerOverrides: (partnerId: number) => GapOverride[];
  getOverrideCount: (partnerId: number) => number;
  // ASP manual overrides
  aspOverrides: AspOverride[];
  setAspOverride: (partnerId: number, note?: string) => void;
  removeAspOverride: (partnerId: number) => void;
  getAspOverride: (partnerId: number) => AspOverride | undefined;
  isAspEligible: (partnerId: number, autoEligible: boolean) => boolean;
}

const STORAGE_KEY = "campaigniq-gap-overrides";
const ASP_STORAGE_KEY = "campaigniq-asp-overrides";

function loadOverrides(): GapOverride[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveOverrides(overrides: GapOverride[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(overrides));
  } catch {
    // silently fail if localStorage is full
  }
}

function loadAspOverrides(): AspOverride[] {
  try {
    const raw = localStorage.getItem(ASP_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveAspOverrides(overrides: AspOverride[]) {
  try {
    localStorage.setItem(ASP_STORAGE_KEY, JSON.stringify(overrides));
  } catch {
    // silently fail
  }
}

const OverrideContext = createContext<OverrideContextValue | null>(null);

export function OverrideProvider({ children }: { children: ReactNode }) {
  const [overrides, setOverrides] = useState<GapOverride[]>(loadOverrides);
  const [aspOverrides, setAspOverrides] = useState<AspOverride[]>(loadAspOverrides);

  const addOverride = useCallback((override: Omit<GapOverride, "completedAt">) => {
    setOverrides((prev) => {
      // Remove existing override for same partner+category if any
      const filtered = prev.filter(
        (o) => !(o.partnerId === override.partnerId && o.category === override.category)
      );
      const next = [
        ...filtered,
        { ...override, completedAt: new Date().toISOString() },
      ];
      saveOverrides(next);
      return next;
    });
  }, []);

  const removeOverride = useCallback((partnerId: number, category: GapCategory) => {
    setOverrides((prev) => {
      const next = prev.filter(
        (o) => !(o.partnerId === partnerId && o.category === category)
      );
      saveOverrides(next);
      return next;
    });
  }, []);

  const getOverride = useCallback(
    (partnerId: number, category: GapCategory) =>
      overrides.find((o) => o.partnerId === partnerId && o.category === category),
    [overrides]
  );

  const getPartnerOverrides = useCallback(
    (partnerId: number) => overrides.filter((o) => o.partnerId === partnerId),
    [overrides]
  );

  const getOverrideCount = useCallback(
    (partnerId: number) => overrides.filter((o) => o.partnerId === partnerId).length,
    [overrides]
  );

  const setAspOverride = useCallback((partnerId: number, note = "") => {
    setAspOverrides((prev) => {
      const filtered = prev.filter((o) => o.partnerId !== partnerId);
      const next = [...filtered, { partnerId, approvedAt: new Date().toISOString(), note }];
      saveAspOverrides(next);
      return next;
    });
  }, []);

  const removeAspOverride = useCallback((partnerId: number) => {
    setAspOverrides((prev) => {
      const next = prev.filter((o) => o.partnerId !== partnerId);
      saveAspOverrides(next);
      return next;
    });
  }, []);

  const getAspOverride = useCallback(
    (partnerId: number) => aspOverrides.find((o) => o.partnerId === partnerId),
    [aspOverrides]
  );

  const isAspEligible = useCallback(
    (partnerId: number, autoEligible: boolean) =>
      autoEligible || aspOverrides.some((o) => o.partnerId === partnerId),
    [aspOverrides]
  );

  return (
    <OverrideContext.Provider
      value={{
        overrides, addOverride, removeOverride, getOverride, getPartnerOverrides, getOverrideCount,
        aspOverrides, setAspOverride, removeAspOverride, getAspOverride, isAspEligible,
      }}
    >
      {children}
    </OverrideContext.Provider>
  );
}

export function useOverrides() {
  const ctx = useContext(OverrideContext);
  if (!ctx) throw new Error("useOverrides must be used within OverrideProvider");
  return ctx;
}
