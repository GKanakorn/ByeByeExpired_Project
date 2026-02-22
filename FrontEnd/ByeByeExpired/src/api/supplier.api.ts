// src/api/supplier.api.ts
import { API_URL } from '../config/api'
import { supabase } from '../supabase'

/* ===============================
   1️⃣ Get All Suppliers
================================ */
export async function getSuppliers() {
    const { data: sessionData } = await supabase.auth.getSession()
    const token = sessionData.session?.access_token

    if (!token) {
        throw new Error('Not authenticated')
    }

    const res = await fetch(`${API_URL}/api/suppliers`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    })

    if (!res.ok) {
        const errData = await res.json()
        throw new Error((errData as any)?.message || 'Get suppliers failed')
    }

    return res.json()
}

/* ===============================
   2️⃣ Get Supplier By ID
================================ */
export async function getSupplierById(id: string) {
    const { data: sessionData } = await supabase.auth.getSession()
    const token = sessionData.session?.access_token

    if (!token) {
        throw new Error('Not authenticated')
    }

    const res = await fetch(`${API_URL}/api/suppliers/${id}`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    })

    if (!res.ok) {
        const errData = await res.json()
        throw new Error((errData as any)?.message || 'Get supplier failed')
    }

    return res.json()
}

/* ===============================
   3️⃣ Create Supplier
================================ */
export async function createSupplier(payload: {
    company_name: string
    phone: string
    address: string
    email?: string
    contact_name?: string
    note?: string
    image_url?: string | null
}) {
    const { data: sessionData } = await supabase.auth.getSession()
    const token = sessionData.session?.access_token

    if (!token) {
        throw new Error('Not authenticated')
    }

    const res = await fetch(`${API_URL}/api/suppliers`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
    })

    const responseData = await res.json()
    console.log("RESPONSE:", responseData)

    if (!res.ok) {
        throw new Error((responseData as any)?.message || 'Create supplier failed')
    }

    return responseData
}

/* ===============================
   4️⃣ Delete Supplier
================================ */
export async function deleteSupplier(id: string) {
    const { data: sessionData } = await supabase.auth.getSession()
    const token = sessionData.session?.access_token

    if (!token) {
        throw new Error('Not authenticated')
    }

    const res = await fetch(`${API_URL}/api/suppliers/${id}`, {
        method: 'DELETE',
        headers: {
            Authorization: `Bearer ${token}`,
        },
    })

    if (!res.ok) {
        const errData = await res.json()
        throw new Error((errData as any)?.message || 'Delete supplier failed')
    }

    return res.json()
}