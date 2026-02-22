import { supabaseAdmin } from '../supabase'
import { Supplier } from "../types/supplier"

export const createSupplier = async (supplier: Supplier) => {
  const { data, error } = await supabaseAdmin
    .from("suppliers")
    .insert([supplier])
    .select()

  if (error) throw error
  return data[0]
}

export const getSuppliersByUser = async (user_id: string) => {
  const { data, error } = await supabaseAdmin
    .from("suppliers")
    .select("*")
    .eq("user_id", user_id)
    .order("created_at", { ascending: false })

  if (error) throw error
  return data
}

export const getSupplierById = async (id: string, user_id: string) => {
  const { data, error } = await supabaseAdmin
    .from("suppliers")
    .select("*")
    .eq("id", id)
    .eq("user_id", user_id)
    .single()

  if (error) throw error
  return data
}

export const updateSupplier = async (
  id: string,
  user_id: string,
  supplier: Partial<Supplier>
) => {
  const { data, error } = await supabaseAdmin
    .from("suppliers")
    .update({ ...supplier, updated_at: new Date() })
    .eq("id", id)
    .eq("user_id", user_id)
    .select()

  if (error) throw error
  return data[0]
}

export const deleteSupplier = async (id: string, user_id: string) => {
  const { error } = await supabaseAdmin
    .from("suppliers")
    .delete()
    .eq("id", id)
    .eq("user_id", user_id)

  if (error) throw error
}