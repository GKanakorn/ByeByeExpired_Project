import { API_URL } from '../config/api'

export async function getManageLocation(token: string, locationId: string) {
  const res = await fetch(
    `${API_URL}/api/locations/${locationId}/members`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  )

  const data = await res.json()

  if (!res.ok) {
    throw new Error(data?.message || 'Fetch members failed')
  }

  return data
}

export async function updateMemberRole(
  token: string,
  locationId: string,
  memberId: string,
  role: string
) {
  const res = await fetch(
    `${API_URL}/api/locations/${locationId}/members/${memberId}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ role }),
    }
  );

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data?.message || "Update member role failed");
  }

  return data;
}

export async function deleteMember(
  token: string,
  locationId: string,
  memberId: string
) {
  const res = await fetch(
    `${API_URL}/api/locations/${locationId}/members/${memberId}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Delete member failed");
  }

  return true;
}

export async function inviteMemberToLocation(
  token: string,
  locationId: string,
  email: string,
  role: string
) {
  const res = await fetch(
    `${API_URL}/api/locations/${locationId}/members`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ email, role }),
    }
  );

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data?.message || "Invite member failed");
  }

  return data;
}