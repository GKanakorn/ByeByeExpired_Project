//context/LocationContest.tsx
import { createContext, useContext, useEffect, useState } from "react"
import { getMyLocations, Location } from "../api/location.api"
import { supabase } from "../supabase"

type LocationContextType = {
  locations: Location[]
  currentLocation: Location | null
  setCurrentLocation: (loc: Location) => void
  reloadLocations: () => Promise<void>
}

const LocationContext = createContext<LocationContextType | null>(null)

export const LocationProvider = ({ children }: { children: React.ReactNode }) => {
  const [locations, setLocations] = useState<Location[]>([])
  const [currentLocation, setCurrentLocation] = useState<Location | null>(null)

  const pickDefaultLocation = (data: Location[]) => {
    const myHome = data.find(loc => loc.name === 'My Home')
    if (myHome) return myHome

    const personal = data.find(loc => loc.type === 'personal')
    if (personal) return personal

    return data[0]
  }

  const reloadLocations = async () => {
    const { data: sessionData } = await supabase.auth.getSession()
    const token = sessionData?.session?.access_token

    if (!token) {
      setLocations([])
      setCurrentLocation(null)
      return
    }

    const data = await getMyLocations(token)

    // ✅ ผู้ใช้ใหม่
    if (data.length === 0) {
      setLocations([])
      setCurrentLocation(null)
      return
    }

    // ✅ ผู้ใช้เก่า
    setLocations(data)

    // ⭐ ตั้ง default location ให้ deterministic
    setCurrentLocation(prev => {
      if (prev && data.some(loc => loc.id === prev.id)) {
        return prev
      }
      return pickDefaultLocation(data)
    })
  }

  useEffect(() => {
    reloadLocations()
  }, [])

  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session?.access_token) {
          reloadLocations()
          return
        }

        setLocations([])
        setCurrentLocation(null)
      }
    )

    return () => {
      listener.subscription.unsubscribe()
    }
  }, [])

  return (
    <LocationContext.Provider
      value={{ locations, currentLocation, setCurrentLocation, reloadLocations }}
    >
      {children}
    </LocationContext.Provider>
  )
}

export const useLocation = () => {
  const ctx = useContext(LocationContext)
  if (!ctx) throw new Error("useLocation must be used inside LocationProvider")
  return ctx
}