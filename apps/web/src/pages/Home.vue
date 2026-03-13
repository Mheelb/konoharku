<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { signOut, getMinecraftProfile, type MinecraftProfile } from '@/composables/useAuth'
import { Button } from '@/components/ui/button'

const router = useRouter()
const minecraft = ref<MinecraftProfile | null>(null)

onMounted(async () => {
  minecraft.value = await getMinecraftProfile()
})

async function handleSignOut() {
  await signOut()
  router.push('/auth')
}
</script>

<template>
  <div class="min-h-screen flex flex-col items-center justify-center bg-background gap-6">
    <div v-if="minecraft" class="flex flex-col items-center gap-3">
      <img
        :src="`https://mc-heads.net/avatar/${minecraft.uuid}/64`"
        :alt="minecraft.username"
        class="w-16 h-16 rounded-md"
      />
      <p class="text-xl font-semibold">{{ minecraft.username }}</p>
    </div>
    <h1 class="text-3xl font-bold">Accueil</h1>
    <Button variant="outline" @click="handleSignOut">Se déconnecter</Button>
  </div>
</template>
