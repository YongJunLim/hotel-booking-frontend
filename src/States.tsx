import { create } from 'zustand';

export const useUserStore = create((set) => ({
  user: null,
  setUser: (user: any) => set({ user }),
}));

type Range = {
  from: Date | undefined;
  to?: Date;
};

interface RangeStore {
  range: Range;
  setRange: (range: Range) => void;
}

export const useRangeStore = create<RangeStore>((set) => ({
  range: { from: undefined },
  setRange: (range) => set({ range }),
}));

export const useAdultStore = create<{
  Adult: number;
  setAdult: (val: number | ((prev: number) => number)) => void;
}>((set, get) => ({
  Adult: 0,
  setAdult: (val) =>
    set((state) => ({
      Adult: typeof val === "function" ? (val as (prev: number) => number)(state.Adult) : val,
    })),
}));

export const useChildStore = create<{
  Child: number;
  setChild: (val: number | ((prev: number) => number)) => void;
}>((set, get) => ({
  Child: 0,
  setChild: (val) =>
    set((state) => ({
      Child: typeof val === "function" ? (val as (prev: number) => number)(state.Child) : val,
    })),
}));

export const useRoomStore = create<{
  Room: number;
  setRoom: (val: number | ((prev: number) => number)) => void;
}>((set, get) => ({
  Room: 0,
  setRoom: (val) =>
    set((state) => ({
      Room: typeof val === "function" ? (val as (prev: number) => number)(state.Room) : val,
    })),
}));

export type Country = {
  uid: string
  term: string
  lat: number
  lng: number
};

interface CountryStore {
  country: Country;
  setCountry: (uid: string, term: string, lat: number, lng: number) => void;
}

export const useCountryStore = create<CountryStore>((set) => ({
  country: { uid: "", term: "", lat: 0, lng: 0 },
  setCountry: (uid : string, term: string, lat: number, lng: number) => set({ country: {uid, term, lat, lng} }),
}));