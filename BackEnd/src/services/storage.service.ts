import { supabaseAdmin } from '../supabase'
import { CreateStorageInput } from '../types/storage'

export async function createStorage(data: CreateStorageInput) {
  const { error, data: result } = await supabaseAdmin
    .from('storages')
    .insert(data)
    .select()
    .single()

  if (error) throw error
  return result
}

export async function getStoragesByLocation(locationId: string) {
  const { data, error } = await supabaseAdmin
    .from('storages')
    .select(`
      id,
      name,
      icon,
      color,
      location_id,
      created_at,
      products(count)
    `)
    .eq('location_id', locationId)

  if (error) throw error

  // แปลง products(count) → item_count
  const storagesWithCount = (data || []).map((storage: any) => ({
    ...storage,
    item_count: storage.products?.[0]?.count ?? 0,
  }))

  return storagesWithCount
}

export async function deleteStorage(
  userId: string,
  storageId: string,
  targetStorageId?: string
) {
  const { data: sourceStorage, error: sourceStorageError } = await supabaseAdmin
    .from('storages')
    .select('id, location_id, name')
    .eq('id', storageId)
    .single()

  if (sourceStorageError || !sourceStorage) throw sourceStorageError || new Error('Storage not found')

  const { count: productCount, error: countError } = await supabaseAdmin
    .from('products')
    .select('id', { count: 'exact', head: true })
    .eq('storage_id', storageId)

  if (countError) throw countError

  let destinationStorageId = targetStorageId

  if ((productCount ?? 0) > 0) {
    if (!destinationStorageId || destinationStorageId === '__NO_STORAGE__') {
      const { data: existingNoStorage, error: existingNoStorageError } = await supabaseAdmin
        .from('storages')
        .select('id')
        .eq('location_id', sourceStorage.location_id)
        .ilike('name', 'no storage')
        .limit(1)

      if (existingNoStorageError) throw existingNoStorageError

      if (existingNoStorage && existingNoStorage.length > 0) {
        destinationStorageId = existingNoStorage[0].id
      } else {
        const { data: createdNoStorage, error: createNoStorageError } = await supabaseAdmin
          .from('storages')
          .insert({
            location_id: sourceStorage.location_id,
            name: 'No Storage',
            icon: 'default',
            color: '#FFFFFF',
          })
          .select('id')
          .single()

        if (createNoStorageError || !createdNoStorage) {
          throw createNoStorageError || new Error('Failed to create No Storage')
        }

        destinationStorageId = createdNoStorage.id
      }
    }

    if (destinationStorageId === storageId) {
      throw new Error('Target storage must be different from source storage')
    }

    const { data: destinationStorage, error: destinationStorageError } = await supabaseAdmin
      .from('storages')
      .select('id, location_id')
      .eq('id', destinationStorageId)
      .single()

    if (destinationStorageError || !destinationStorage) {
      throw destinationStorageError || new Error('Target storage not found')
    }

    if (destinationStorage.location_id !== sourceStorage.location_id) {
      throw new Error('Target storage must be in the same location')
    }

    const { error: moveProductsError } = await supabaseAdmin
      .from('products')
      .update({ storage_id: destinationStorageId })
      .eq('storage_id', storageId)

    if (moveProductsError) throw moveProductsError
  }

  // 2. ลบ storage หลังจากย้ายสินค้าแล้ว
  const { error } = await supabaseAdmin
    .from('storages')
    .delete()
    .eq('id', storageId)

  if (error) throw error

  return {
    success: true,
    movedProducts: productCount ?? 0,
    targetStorageId: destinationStorageId ?? null,
  }
}

export async function updateStorage(
  storageId: string,
  data: {
    name: string
    icon: string
    color: string
  }
) {
  const { data: result, error } = await supabaseAdmin
    .from('storages')
    .update({
      name: data.name,
      icon: data.icon,
      color: data.color,
    })
    .eq('id', storageId)
    .select()
    .single()

  if (error) throw error
  return result
}

export async function getStorageById(storageId: string) {
  const { data, error } = await supabaseAdmin
    .from('storages')
    .select('*')
    .eq('id', storageId)
    .single()

  if (error) throw error
  return data
}