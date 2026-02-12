import axios from 'axios'
import { API_URL } from '../config/api'

export async function lookupBarcode(barcode: string) {
  const res = await axios.get(`${API_URL}/barcode/${barcode}`)
  return res.data
}