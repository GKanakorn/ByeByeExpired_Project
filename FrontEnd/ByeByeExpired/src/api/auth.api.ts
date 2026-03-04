import { API_URL } from '../config/api'
import AsyncStorage from '@react-native-async-storage/async-storage'


export async function register(payload: {
  email: string
  password: string
  fullName: string
}) {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  const text = await res.text() // ✅ อ่านครั้งเดียว

  let data: any
  try {
    data = text ? JSON.parse(text) : null
  } catch {
    data = text
  }

  if (!res.ok) {
    throw new Error(data?.message || data || 'Register failed')
  }

  return data
}

export async function login(payload: {
  email: string
  password: string
}) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  const text = await res.text()
  let data: any

  try {
    data = text ? JSON.parse(text) : null
  } catch {
    data = text
  }

  if (!res.ok) {
    throw new Error(data?.message || 'Login failed')
  }

  return data
}

export async function getAuthToken(): Promise<string> {
  const token = await AsyncStorage.getItem('token')

  if (!token) {
    throw new Error('No auth token found')
  }

  return token
}

export async function deleteAccount(token: string) {
  const res = await fetch(`${API_URL}/auth/account`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  })

  const text = await res.text()
  let data: any

  try {
    data = text ? JSON.parse(text) : null
  } catch {
    data = text
  }

  if (!res.ok) {
    throw new Error(data?.message || 'Delete account failed')
  }

  return data
}

// ✅ Manual Registration - After OTP verification
export async function confirmAndCreateProfile(payload: {
  userId: string
  email: string
  fullName: string
}) {
  const res = await fetch(`${API_URL}/auth/confirm-profile`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  const text = await res.text()
  let data: any

  try {
    data = text ? JSON.parse(text) : null
  } catch {
    data = text
  }

  if (!res.ok) {
    throw new Error(data?.message || 'Failed to create profile')
  }

  return data
}

// ✅ Google OAuth - Verify/Create Profile
export async function verifyGoogleProfile(token: string) {
  const res = await fetch(`${API_URL}/auth/verify-google-profile`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  })

  const text = await res.text()
  let data: any

  try {
    data = text ? JSON.parse(text) : null
  } catch {
    data = text
  }

  if (!res.ok) {
    throw new Error(data?.message || 'Failed to verify google profile')
  }

  return data
}