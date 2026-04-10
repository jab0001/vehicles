<script setup lang="ts">
defineProps<{
  label: string;
  text?: string;
}>();
</script>

<template>
  <div class="flex flex-col gap-0.5">
    <p class="text-[var(--text-color-regular)] text-xs leading-5">
      {{ label }}
    </p>
    <slot>
      <p class="text-sm font-medium leading-6">{{ text }}</p>
    </slot>
  </div>
</template>

<style scoped></style>
