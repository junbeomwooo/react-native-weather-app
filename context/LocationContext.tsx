import { createContext, ReactNode, useState } from "react";

export type LocationType = {
  latlng: [number, number];
  setLatLng: React.Dispatch<React.SetStateAction<[number, number]>>;
};

export const LocationContext = createContext<LocationType>({
  latlng: [0, 0],
  setLatLng: () => {},
});

export function LocationProvider({children}:{ children: ReactNode }) {
  const [latlng, setLatLng] = useState<[number, number]>([0, 0]);
  return (
  <LocationContext.Provider value={{latlng, setLatLng}}>
    {children}
  </LocationContext.Provider>
  );
}
