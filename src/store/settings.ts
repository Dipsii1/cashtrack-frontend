import { create } from "zustand";
import { persist } from "zustand/middleware";

interface SettingsState {
  currency: string;
  timezone: string;
  setCurrency: (currency: string) => void;
  setTimezone: (timezone: string) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      currency: "IDR",
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone ?? "Asia/Jakarta",
      setCurrency: (currency) => set({ currency }),
      setTimezone: (timezone) => set({ timezone }),
    }),
    { name: "cashtrack-settings" }
  )
);
