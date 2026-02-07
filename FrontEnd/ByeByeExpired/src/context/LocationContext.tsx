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

  const reloadLocations = async () => {
    const { data: session } = await supabase.auth.getSession()
    const token = session?.session?.access_token
    if (!token) return

    const data = await getMyLocations(token)

    // ✅ ผู้ใช้ใหม่
    if (data.length === 0) {
      setLocations([])
      setCurrentLocation(null)
      return
    }

    // ✅ ผู้ใช้เก่า
    setLocations(data)

    // ⭐ หัวใจของ default
    setCurrentLocation(prev => prev ?? data[0])
  }

  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session?.access_token) {
          reloadLocations()
        }
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