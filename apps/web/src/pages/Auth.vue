<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { supabase } from '@/composables/useSupabase'
import { apiFetch } from '@/composables/useApi'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

const router = useRouter()
const route = useRoute()

const errorParam = route.query.error as string | undefined
const step = ref<'idle' | 'loading' | 'waiting' | 'error'>('idle')
const userCode = ref('')
const verificationUri = ref('')
const error = ref(errorParam ?? '')

let pollInterval: ReturnType<typeof setInterval> | null = null

async function startLogin() {
  step.value = 'loading'
  error.value = ''

  try {
    const res = await apiFetch('/auth/microsoft/device-code', { method: 'POST' })
    if (!res.ok) {
      const body = await res.json().catch(() => ({})) as { error?: string }
      throw new Error(body.error ?? `HTTP ${res.status}`)
    }

    const data = await res.json() as {
      sessionId: string
      userCode: string
      verificationUri: string
      interval: number
    }

    userCode.value = data.userCode
    verificationUri.value = data.verificationUri
    step.value = 'waiting'

    const intervalMs = (data.interval + 1) * 1000

    pollInterval = setInterval(async () => {
      try {
        const pollRes = await apiFetch(`/auth/microsoft/poll/${data.sessionId}`)
        const pollData = await pollRes.json() as { status?: string; tokenHash?: string; email?: string; error?: string }

        if (pollData.status === 'pending') return

        clearInterval(pollInterval!)

        if (pollData.status === 'success' && pollData.tokenHash) {
          const { error: otpError } = await supabase.auth.verifyOtp({
            token_hash: pollData.tokenHash,
            type: 'email',
          })
          if (otpError) {
            step.value = 'error'
            error.value = otpError.message
            return
          }
          router.push('/')
        } else {
          step.value = 'error'
          error.value = pollData.error ?? 'Échec de la connexion'
        }
      } catch {
        clearInterval(pollInterval!)
        step.value = 'error'
        error.value = 'Erreur réseau lors du polling'
      }
    }, intervalMs)
  } catch (e) {
    step.value = 'error'
    error.value = e instanceof Error ? e.message : 'Impossible de démarrer la connexion'
  }
}

function cancel() {
  if (pollInterval) clearInterval(pollInterval)
  step.value = 'idle'
  userCode.value = ''
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-background px-4">
    <Card class="w-full max-w-sm">
      <CardHeader class="text-center">
        <CardTitle class="text-2xl">Konoharku</CardTitle>
        <CardDescription>Connecte-toi avec ton compte Minecraft</CardDescription>
      </CardHeader>
      <CardContent class="flex flex-col gap-4">

        <template v-if="step === 'idle' || step === 'error'">
          <Button class="w-full" @click="startLogin">
            Se connecter avec Minecraft
          </Button>
          <p v-if="error" class="text-sm text-destructive text-center">{{ error }}</p>
        </template>

        <template v-else-if="step === 'loading'">
          <p class="text-sm text-center text-muted-foreground">Chargement...</p>
        </template>

        <template v-else-if="step === 'waiting'">
          <p class="text-sm text-center text-muted-foreground">
            Va sur <a :href="verificationUri" target="_blank" class="underline font-medium text-foreground">{{ verificationUri }}</a>
            et entre ce code :
          </p>
          <p class="text-3xl font-mono font-bold tracking-widest text-center">{{ userCode }}</p>
          <p class="text-xs text-center text-muted-foreground">En attente de confirmation...</p>
          <Button variant="outline" class="w-full" @click="cancel">Annuler</Button>
        </template>

      </CardContent>
    </Card>
  </div>
</template>
