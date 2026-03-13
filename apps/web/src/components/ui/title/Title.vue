<script setup lang="ts">
import { computed } from 'vue'
import { cn } from '@/lib/utils'

const props = withDefaults(defineProps<{
  as?: 'h1' | 'h2' | 'h3' | 'h4'
  class?: string
}>(), {
  as: 'h2',
})

const styles: Record<string, string> = {
  h1: 'text-4xl font-black tracking-tight',
  h2: 'text-2xl font-bold tracking-tight',
  h3: 'text-lg font-semibold',
  h4: 'text-base font-semibold text-muted-foreground',
}
</script>

<template>
  <component :is="as" :class="cn(styles[as], props.class)">
    <slot />
  </component>
</template>
