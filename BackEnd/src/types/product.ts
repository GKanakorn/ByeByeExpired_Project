// types/product.ts
export interface AddProductPayload {
  barcode?: string
  name: string
  category?: string
  storage: string
  imageUrl?: string | null
  locationId: string
  storageDate: string
  expireDate: string
  quantity: number

  // Personal
  notifyEnabled: boolean
  notifyBeforeDays?: number | null

  // Business
  price?: number | null
  supplierId?: string | null
  lowStockEnabled?: boolean
  lowStockThreshold?: number | null
}