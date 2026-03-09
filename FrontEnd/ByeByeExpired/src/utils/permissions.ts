export type Role = "owner" | "member"
type RoleInput = Role | "admin"

const normalizeRole = (role: RoleInput): Role =>
  role === "owner" ? "owner" : "member"

export const permissions = {
  canManageProduct: (role: RoleInput) => {
    const normalizedRole = normalizeRole(role)
    return normalizedRole === "owner" || normalizedRole === "member"
  },

  canManageMembers: (role: RoleInput) =>
    normalizeRole(role) === "owner",

  canManageStorage: (role: RoleInput) =>
    normalizeRole(role) === "owner",
}