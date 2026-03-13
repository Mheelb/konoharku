import { supabase } from './useSupabase'
import { hasRole, type Role } from '@konoharku/types'

export { hasRole, type Role }

export async function getUserRole(): Promise<Role> {
  const { data: { user } } = await supabase.auth.getUser()
  return (user?.app_metadata?.role as Role) ?? 'user'
}

export async function can(required: Role): Promise<boolean> {
  const role = await getUserRole()
  return hasRole(role, required)
}
