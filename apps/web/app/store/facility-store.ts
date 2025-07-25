
import { create } from 'zustand';

interface FacilityState {
  facility: string | null;
  setFacility: (facility: string) => void;
}

export const useFacilityStore = create<FacilityState>((set) => ({
  facility: null,
  setFacility: (facility) => set({ facility }),
}));
