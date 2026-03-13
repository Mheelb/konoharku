<script setup lang="ts">
import { computed } from 'vue'
import { cva } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const props = withDefaults(defineProps<{
  variant?: 'default' | 'muted' | 'small' | 'label' | 'lead'
  as?: string
  class?: string
}>(), {
  variant: 'default',
  as: 'p',
})

const textVariants = cva('', {
  variants: {
    variant: {
      default: 'text-base text-foreground',
      muted:   'text-sm text-muted-foreground',
      small:   'text-xs text-muted-foreground',
      label:   'text-xs font-medium uppercase tracking-widest text-muted-foreground',
      lead:    'text-lg text-muted-foreground',
    },
  },
})
</script>

<template>
  <component :is="as" :class="cn(textVariants({ variant }), props.class)">
    <slot />
  </component>
</template>
