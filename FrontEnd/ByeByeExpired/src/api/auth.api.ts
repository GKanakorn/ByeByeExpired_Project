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