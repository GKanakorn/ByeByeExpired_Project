import React, { createContext, useContext, useState } from 'react'

type Location = {
  id: string
  name: string
}

type LocationContextType = {
  selectedLocation: Location | null
  setSelectedLocation: (loc: Location | null) => void
}

const LocationContext = createContext<LocationContextType | undefined>(undefined)

export function LocationProvider({ children }: { children: React.ReactNode }) {
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null)

  return (
    <LocationContext.Provider value={{ selectedLocation, setSelectedLocation }}>
      {children}
    </LocationContext.Provider>
  )
}

export function useLocation() {
  const ctx = useContext(LocationContext)
  if (!ctx) {
    throw new Error('useLocation must be used inside LocationProvider')
  }
  return ctx
}