import { supabaseAdmin } from "../supabase";

export async function getLocationMembers(
  locationId: string,
) {
  // Get location
  const { data: location, error: locationError } = await supabaseAdmin
    .from("locations")
    .select("id, name, owner_id")
    .eq("id", locationId)
    .single();

  if (locationError || !location) {
    throw new Error("Location not found");
  }

  // Get members with profiles join
  const { data: members, error: membersError } = await supabaseAdmin
    .from("location_members")
    .select(`
      user_id,
      role,
      profiles:profiles!location_members_user_id_fkey (
        email
      )
    `)
    .eq("location_id", locationId);

  if (membersError) {
    throw new Error("Fetch members failed");
  }
  const formattedMembers = [
    ...(members ?? []).map((m: any) => ({
      id: m.user_id,
      email: Array.isArray(m.profiles)
        ? m.profiles?.[0]?.email ?? ''
        : m.profiles?.email ?? '',
      role: m.role,
    })),
  ]

  return {
    locationName: location.name,
    ownerId: location.owner_id,
    members: formattedMembers,
  };
}

export async function updateMemberRoleService(
  locationId: string,
  memberId: string,
  role: string
) {
  const { error } = await supabaseAdmin
    .from("location_members")
    .update({ role })
    .eq("location_id", locationId)
    .eq("user_id", memberId);

  if (error) {
    throw new Error("Update role failed");
  }

  return { success: true };
}

export async function deleteMemberService(
  locationId: string,
  memberId: string
) {
  const { error } = await supabaseAdmin
    .from("location_members")
    .delete()
    .eq("location_id", locationId)
    .eq("user_id", memberId);

  if (error) {
    throw new Error("Delete member failed");
  }

  return { success: true };
}

export async function inviteMemberService(
  locationId: string,
  email: string,
  role: string
) {
  // Find user by email
  const { data: user, error: userError } = await supabaseAdmin
    .from("profiles")
    .select("id, email")
    .eq("email", email)
    .single();

  if (userError || !user) {
    throw new Error("User not found");
  }

  const { error } = await supabaseAdmin
    .from("location_members")
    .insert({
      location_id: locationId,
      user_id: user.id,
      role,
    });

  if (error) {
    throw new Error("Invite member failed");
  }

  return { success: true };
}
