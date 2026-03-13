export type Role = 'superadmin' | 'admin' | 'builder' | 'farmer' | 'user'

export const ROLE_HIERARCHY: Record<Role, number> = {
  superadmin: 5,
  admin: 4,
  builder: 3,
  farmer: 2,
  user: 1,
}

export function hasRole(userRole: Role, required: Role): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[required]
}
