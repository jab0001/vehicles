<script setup lang="ts">
import { ref } from "vue";
import { useIntersectionObserver } from "@vueuse/core";

const emit = defineEmits<{
  (e: "loadMore"): void;
}>();

const target = ref<HTMLElement | null>(null);

useIntersectionObserver(target, ([{ isIntersecting }]) => {
  if (isIntersecting) {
    setTimeout(() => emit("loadMore"), 150);
  }
});
</script>

<template>
  <div>
    <slot />
    <div ref="target">
      <slot name="target" />
    </div>
  </div>
</template>
