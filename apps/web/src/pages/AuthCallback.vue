<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { saveToken } from '@/composables/useAuth'

const router = useRouter()
const route = useRoute()

onMounted(() => {
  const token = route.query.token as string | undefined
  if (token) {
    saveToken(token)
    router.push('/')
  } else {
    router.push('/auth?error=callback_failed')
  }
})
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-background">
    <p class="text-muted-foreground">Connexion en cours...</p>
  </div>
</template>
