export interface AddProductPayload {
  barcode?: string
  name: string
  category?: string
  location_id: string
  quantity: number
  template_id?: string
}