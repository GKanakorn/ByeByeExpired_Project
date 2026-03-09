// BackEnd/src/services/auth.service.ts
import { supabaseAnon, supabaseAdmin } from '../supabase'

const DEFAULT_LOCATION_CONFIGS = [
  { name: 'My Home', type: 'personal' as const },
  { name: 'Restaurants', type: 'business' as const },
]

const DEFAULT_STORAGE_CONFIGS = [
  { name: 'Freezer', icon: 'freezer2', color: '#3498DB' },
  { name: 'Fridge', icon: 'fridge1', color: '#FFB6C1' },
  { name: 'Dry Food', icon: 'can', color: '#F1C40F' },
]

async function createDefaultLocationsAndStorages(userId: string) {
  for (const locationConfig of DEFAULT_LOCATION_CONFIGS) {
    const { data: location, error: locationError } = await supabaseAdmin
      .from('locations')
      .insert({
        name: locationConfig.name,
        type: locationConfig.type,
        owner_id: userId,
      })
      .select()
      .single()

    if (locationError || !location) {
      throw new Error('Failed to create default location: ' + locationError?.message)
    }

    const { error: memberError } = await supabaseAdmin
      .from('location_members')
      .insert({
        user_id: userId,
        location_id: location.id,
        role: 'owner',
      })

    if (memberError) {
      throw new Error('Failed to add location member: ' + memberError.message)
    }

    const storagesPayload = DEFAULT_STORAGE_CONFIGS.map(storage => ({
      name: storage.name,
      icon: storage.icon,
      color: storage.color,
      location_id: location.id,
    }))

    const { error: storagesError } = await supabaseAdmin
      .from('storages')
      .insert(storagesPayload)

    if (storagesError) {
      throw new Error(
        `Failed to create default storages for ${locationConfig.name}: ${storagesError.message}`
      )
    }
  }
}

// ✅ Manual Registration with OTP
export async function register({
  email,
  password,
  fullName,
}: {
  email: string
  password: string
  fullName: string
}) {
  const { data, error } = await supabaseAnon.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: 'byebyeexpired://login-callback',
      data: {
        full_name: fullName,
      },
    },
  })

  if (error) throw new Error(error.message)
  if (!data.user) throw new Error('User not created')

  return data.user
}

// ✅ Called after OTP verification - Insert profile to database
export async function confirmAndCreateProfile(
  userId: string,
  email: string,
  fullName: string,
  provider: string = 'email'
) {
  try {
    // Check if profile exists
    const { data: existingProfile } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .single()

    if (existingProfile) {
      console.log('Profile already exists for user:', userId)
      return { success: true, profileExists: true }
    }

    // 1. Insert profile
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert({
        id: userId,
        email,
        full_name: fullName,
        provider,
        avatar_url: null,
      })

    if (profileError) {
      throw new Error('Failed to create profile: ' + profileError.message)
    }

    await createDefaultLocationsAndStorages(userId)

    return { success: true, profileExists: false }
  } catch (error: any) {
    console.error('Error in confirmAndCreateProfile:', error)
    throw new Error(error.message || 'Failed to create profile')
  }
}

// ✅ Google OAuth - Verify/Create profile
export async function verifyOrCreateProfileGoogle(
  userId: string,
  email: string,
  fullName?: string,
  avatarUrl?: string
) {
  try {
    // Check if profile exists
    const { data: existingProfile } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .single()

    if (existingProfile) {
      console.log('Google profile already exists for user:', userId)
      return { success: true, profileExists: true }
    }

    // 1. Insert profile with Google provider
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert({
        id: userId,
        email,
        full_name: fullName || email.split('@')[0],
        provider: 'google',
        avatar_url: avatarUrl || null,
      })

    if (profileError) {
      throw new Error('Failed to create Google profile: ' + profileError.message)
    }

    await createDefaultLocationsAndStorages(userId)

    return { success: true, profileExists: false }
  } catch (error: any) {
    console.error('Error in verifyOrCreateProfileGoogle:', error)
    throw new Error(error.message || 'Failed to create Google profile')
  }
}

export async function login({
  email,
  password,
}: {
  email: string
  password: string
}) {
  const { data, error } = await supabaseAnon.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    throw new Error(error.message)
  }

  if (!data.session || !data.user) {
    throw new Error('Invalid login')
  }

  return {
    user: data.user,
    access_token: data.session.access_token,
    refresh_token: data.session.refresh_token,
  }
}

// ✅ Delete entire user account with all data
export async function deleteAccount(userId: string) {
  try {
    // 1. Get all locations owned by this user
    const { data: ownedLocations } = await supabaseAdmin
      .from('locations')
      .select('id')
      .eq('owner_id', userId)

    const locationIds = ownedLocations?.map(l => l.id) || []

    // 2. Delete products in those locations
    if (locationIds.length > 0) {
      await supabaseAdmin
        .from('products')
        .delete()
        .in('location_id', locationIds)
    }

    // 3. Delete storages in those locations
    if (locationIds.length > 0) {
      await supabaseAdmin
        .from('storages')
        .delete()
        .in('location_id', locationIds)
    }

    // 4. Delete product_delete_history in those locations
    if (locationIds.length > 0) {
      await supabaseAdmin
        .from('product_delete_history')
        .delete()
        .in('location_id', locationIds)
    }

    // 5. Delete all location_members where user is a member
    await supabaseAdmin
      .from('location_members')
      .delete()
      .eq('user_id', userId)

    // 6. Delete all locations owned by this user
    if (locationIds.length > 0) {
      await supabaseAdmin
        .from('locations')
        .delete()
        .in('id', locationIds)
    }

    // 7. Delete suppliers created by this user
    await supabaseAdmin
      .from('suppliers')
      .delete()
      .eq('owner_id', userId)

    // 8. Delete profile
    await supabaseAdmin
      .from('profiles')
      .delete()
      .eq('id', userId)

    // 9. Delete auth user (will cascade delete via foreign key)
    await supabaseAdmin.auth.admin.deleteUser(userId)

    return { success: true }
  } catch (error: any) {
    console.error('Error deleting account:', error)
    throw new Error('Failed to delete account: ' + error.message)
  }
}