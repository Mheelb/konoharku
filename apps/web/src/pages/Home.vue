<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Motion } from 'motion-v'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { Title } from '@/components/ui/title'
import { Text } from '@/components/ui/text'
import { getMinecraftProfile, type MinecraftProfile } from '@/composables/useAuth'

const minecraft = ref<MinecraftProfile | null>(null)
const progressValues = ref([0, 0, 0, 0])

const stats = [
  { label: 'Builds actifs', value: '4', sub: '1 terminé ce mois' },
  { label: 'Objectifs', value: '7', sub: '3 en cours' },
  { label: 'Membres', value: '12', sub: '5 actifs cette semaine' },
  { label: 'Matériaux manquants', value: '248', sub: 'sur 6 builds' },
]

const actualites = [
  {
    title: 'Lancement du chantier du spawn',
    date: '12 mars 2026',
    tag: 'Build',
    tagClass: 'bg-primary/15 text-primary',
    content: 'Le chantier principal du spawn a officiellement démarré. Tous les builders sont invités à rejoindre le projet.',
  },
  {
    title: 'Stock de pierre taillée épuisé',
    date: '10 mars 2026',
    tag: 'Stock',
    tagClass: 'bg-destructive/15 text-destructive',
    content: 'On manque de pierre taillée pour avancer sur la salle du trône. Les farmers peuvent contribuer.',
  },
  {
    title: 'Nouvel objectif : Route principale',
    date: '8 mars 2026',
    tag: 'Objectif',
    tagClass: 'bg-accent/15 text-accent',
    content: 'Un nouvel objectif a été ajouté : tracer et construire la route principale reliant les zones.',
  },
]

const objectifs = [
  { label: 'Spawn principal', progress: 35 },
  { label: 'Salle du trône', progress: 72 },
  { label: 'Route principale', progress: 5 },
  { label: 'Marché du village', progress: 100 },
]

onMounted(async () => {
  minecraft.value = await getMinecraftProfile()
  setTimeout(() => {
    progressValues.value = objectifs.map(o => o.progress)
  }, 600)
})
</script>

<template>
  <main class="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 py-10 flex flex-col gap-10">

      <!-- Hero -->
      <section class="relative overflow-hidden rounded-xl border border-border bg-card px-8 py-10">
        <div class="pointer-events-none absolute inset-0 overflow-hidden">
          <div class="absolute -top-20 -left-20 w-96 h-96 rounded-full bg-primary/8 blur-3xl" />
          <div class="absolute -bottom-20 -right-20 w-72 h-72 rounded-full bg-accent/6 blur-3xl" />
        </div>

        <div class="relative flex items-center justify-between gap-6">
          <Motion
            :initial="{ opacity: 0, x: -24 }"
            :animate="{ opacity: 1, x: 0 }"
            :transition="{ duration: 0.5, ease: 'easeOut' }"
            class="flex flex-col gap-3"
          >
            <Text variant="label">Bienvenue</Text>
            <Title as="h1">{{ minecraft?.username ?? '...' }}</Title>
            <Text variant="lead" class="max-w-md">
              Suis l'avancement des builds, les stocks de matériaux, et reste à jour sur les objectifs du serveur.
            </Text>
          </Motion>

          <Motion
            v-if="minecraft"
            :initial="{ opacity: 0, x: 24, scale: 0.9 }"
            :animate="{ opacity: 1, x: 0, scale: 1 }"
            :transition="{ duration: 0.5, ease: 'easeOut', delay: 0.1 }"
            class="shrink-0 hidden sm:block"
          >
            <img
              :src="`https://mc-heads.net/body/${minecraft.uuid}/100`"
              :alt="minecraft.username"
              class="h-36 object-contain drop-shadow-2xl"
              style="image-rendering: pixelated;"
            />
          </Motion>
        </div>
      </section>

      <!-- Stats -->
      <section class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Motion
          v-for="(stat, i) in stats"
          :key="stat.label"
          :initial="{ opacity: 0, y: 20 }"
          :while-in-view="{ opacity: 1, y: 0 }"
          :viewport="{ once: true }"
          :transition="{ duration: 0.4, ease: 'easeOut', delay: i * 0.08 }"
        >
          <Card class="border-border bg-card h-full">
            <CardContent class="p-5">
              <Text variant="muted">{{ stat.label }}</Text>
              <Title as="h3" class="text-3xl font-black mt-1">{{ stat.value }}</Title>
              <Text variant="small" class="mt-1">{{ stat.sub }}</Text>
            </CardContent>
          </Card>
        </Motion>
      </section>

      <!-- Contenu principal -->
      <section class="grid grid-cols-1 lg:grid-cols-3 gap-6">

        <!-- Actualités -->
        <div class="lg:col-span-2 flex flex-col gap-4">
          <Motion
            :initial="{ opacity: 0, y: 16 }"
            :while-in-view="{ opacity: 1, y: 0 }"
            :viewport="{ once: true }"
            :transition="{ duration: 0.4 }"
          >
            <Title as="h2">Actualités</Title>
          </Motion>

          <div class="flex flex-col gap-3">
            <Motion
              v-for="(actu, i) in actualites"
              :key="actu.title"
              :initial="{ opacity: 0, y: 20 }"
              :while-in-view="{ opacity: 1, y: 0 }"
              :viewport="{ once: true }"
              :transition="{ duration: 0.4, ease: 'easeOut', delay: i * 0.1 }"
            >
              <Card class="border-border bg-card hover:border-primary/30 transition-colors duration-300 cursor-default">
                <CardContent class="p-5 flex flex-col gap-2">
                  <div class="flex items-center justify-between gap-2">
                    <span :class="['text-xs font-semibold px-2 py-0.5 rounded-md', actu.tagClass]">
                      {{ actu.tag }}
                    </span>
                    <Text variant="small">{{ actu.date }}</Text>
                  </div>
                  <Text as="span" class="font-semibold">{{ actu.title }}</Text>
                  <Text variant="muted">{{ actu.content }}</Text>
                </CardContent>
              </Card>
            </Motion>
          </div>
        </div>

        <!-- Objectifs -->
        <div class="flex flex-col gap-4">
          <Motion
            :initial="{ opacity: 0, y: 16 }"
            :while-in-view="{ opacity: 1, y: 0 }"
            :viewport="{ once: true }"
            :transition="{ duration: 0.4 }"
          >
            <Title as="h2">Objectifs</Title>
          </Motion>

          <Motion
            :initial="{ opacity: 0, y: 20 }"
            :while-in-view="{ opacity: 1, y: 0 }"
            :viewport="{ once: true }"
            :transition="{ duration: 0.4, delay: 0.15 }"
          >
            <Card class="border-border bg-card">
              <CardContent class="p-5 flex flex-col gap-5">
                <div v-for="(obj, i) in objectifs" :key="obj.label" class="flex flex-col gap-2">
                  <div class="flex items-center justify-between">
                    <Text as="span" class="font-medium">{{ obj.label }}</Text>
                    <Text variant="small" :class="obj.progress === 100 ? 'text-accent' : ''">
                      {{ obj.progress === 100 ? 'Terminé' : `${obj.progress}%` }}
                    </Text>
                  </div>
                  <Progress
                    :model-value="progressValues[i]"
                    class="h-1.5 transition-all duration-700 ease-out"
                    :class="obj.progress === 100 ? '[&>div]:bg-accent' : '[&>div]:bg-primary'"
                  />
                  <Separator v-if="i < objectifs.length - 1" class="mt-1 opacity-40" />
                </div>
              </CardContent>
            </Card>
          </Motion>
        </div>

      </section>
  </main>
</template>
