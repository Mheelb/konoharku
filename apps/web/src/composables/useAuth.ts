import { supabase } from './useSupabase'

export type MinecraftProfile = {
  uuid: string
  username: string
  skinUrl: string | null
}

export async function getUser() {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export async function getMinecraftProfile(): Promise<MinecraftProfile | null> {
  const user = await getUser()
  return user?.user_metadata?.minecraft ?? null
}

export async function signOut() {
  await supabase.auth.signOut()
}
