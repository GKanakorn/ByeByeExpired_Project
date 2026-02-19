export interface BarcodeLookupResult {
  found: boolean
  data?: {
    id: string
    name: string | null
    category: string | null
    locationId: string | null
    image_url: string | null
  }
}