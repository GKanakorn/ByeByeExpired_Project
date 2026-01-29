// BackEnd/src/services/auth.service.ts
import { supabaseAnon } from '../supabase'

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
      emailRedirectTo: 'byebyeexpired://login-callback', // ⭐ สำคัญ
      data: {
        full_name: fullName,
      },
    },
  })

  if (error) throw new Error(error.message)
  if (!data.user) throw new Error('User not created')

  return data.user
}