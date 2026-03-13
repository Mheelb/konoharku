import { supabase } from './useSupabase'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

export const apiFetch = async (path: string, options?: RequestInit) => {
  const { data: { session } } = await supabase.auth.getSession()
  return fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(session ? { Authorization: `Bearer ${session.access_token}` } : {}),
      ...options?.headers,
    },
  })
}
