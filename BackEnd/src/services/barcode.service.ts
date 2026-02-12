// src/services/barcode.service.ts
import { supabaseAdmin } from '../supabase'
import axios from 'axios'

export async function lookupBarcode(barcode: string) {
  // 1️⃣ หาใน DB
  const { data: existing } = await supabaseAdmin
    .from('product_templates')
    .select('*')
    .eq('barcode', barcode)
    .single()

  if (existing) {
    return {
      found: true,
      template: existing,
    }
  }

  // 2️⃣ ไม่เจอ → create empty template
  const { data: created } = await supabaseAdmin
    .from('product_templates')
    .insert({
      barcode,
    })
    .select()
    .single()

  return {
    found: false,
    template: created,
  }
}