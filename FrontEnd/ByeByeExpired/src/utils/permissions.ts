export type Role = "owner" | "admin" | "member"

export const permissions = {
  canManageProduct: (role: Role) =>
    role === "owner" || role === "admin",

  canManageMembers: (role: Role) =>
    role === "owner",

  canManageStorage: (role: Role) =>
    role === "owner" || role === "admin",
}