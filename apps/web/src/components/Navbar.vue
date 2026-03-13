<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { Motion } from 'motion-v'
import { signOut, getMinecraftProfile, type MinecraftProfile } from '@/composables/useAuth'
import { getUserRole, type Role } from '@/composables/useRole'
import { Button } from '@/components/ui/button'

const router = useRouter()
const minecraft = ref<MinecraftProfile | null>(null)
const role = ref<Role>('user')

onMounted(async () => {
  minecraft.value = await getMinecraftProfile()
  role.value = await getUserRole()
})

async function handleSignOut() {
  await signOut()
  router.push('/auth')
}

const roleConfig: Record<Role, { label: string; class: string }> = {
  superadmin: { label: 'Super Admin', class: 'text-amber-400 bg-amber-400/10 border border-amber-400/25' },
  admin:       { label: 'Admin',       class: 'text-primary bg-primary/10 border border-primary/25' },
  builder:     { label: 'Builder',     class: 'text-accent bg-accent/10 border border-accent/25' },
  farmer:      { label: 'Farmer',      class: 'text-lime-400 bg-lime-400/10 border border-lime-400/25' },
  user:        { label: 'Membre',      class: 'text-muted-foreground bg-muted border border-border' },
}

const navLinks = [
  { label: 'Accueil', to: '/' },
  { label: 'Builds', to: '/builds' },
  { label: 'Stocks', to: '/stocks' },
  { label: 'Actualités', to: '/actualites' },
  { label: 'Objectifs', to: '/objectifs' },
]
</script>

<template>
  <Motion
    :initial="{ opacity: 0, y: -16 }"
    :animate="{ opacity: 1, y: 0 }"
    :transition="{ duration: 0.4, ease: 'easeOut' }"
    as="nav"
    class="sticky top-0 z-50 w-full border-b border-border/60 bg-background/80 backdrop-blur-md"
  >
    <div class="mx-auto max-w-7xl px-4 sm:px-6 flex h-16 items-center justify-between gap-8">

      <!-- Logo -->
      <RouterLink to="/" class="flex items-center gap-2 shrink-0">
        <span class="text-xl font-black tracking-tight text-primary drop-shadow-[0_0_12px_oklch(0.65_0.22_228/0.6)]">
          KONOHARKU
        </span>
      </RouterLink>

      <!-- Nav links -->
      <div class="hidden md:flex items-center gap-1">
        <RouterLink
          v-for="link in navLinks"
          :key="link.to"
          :to="link.to"
          class="px-3 py-1.5 text-sm text-muted-foreground rounded-md transition-colors hover:text-foreground hover:bg-white/5"
          active-class="text-foreground bg-white/5"
        >
          {{ link.label }}
        </RouterLink>
      </div>

      <!-- User -->
      <div class="flex items-center gap-3 shrink-0">
        <div v-if="minecraft" class="flex items-center gap-2.5">
          <img
            :src="`https://mc-heads.net/avatar/${minecraft.uuid}/32`"
            :alt="minecraft.username"
            class="w-8 h-8 rounded-sm"
          />
          <div class="hidden sm:flex flex-col items-start leading-none gap-1">
            <span class="text-sm font-semibold">{{ minecraft.username }}</span>
            <span :class="['text-[10px] font-medium px-1.5 py-0.5 rounded-sm', roleConfig[role].class]">
              {{ roleConfig[role].label }}
            </span>
          </div>
        </div>
        <Button variant="ghost" size="sm" class="text-muted-foreground hover:text-foreground" @click="handleSignOut">
          Déconnexion
        </Button>
      </div>

    </div>
  </Motion>
</template>
