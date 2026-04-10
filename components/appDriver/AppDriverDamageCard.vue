<script setup lang="ts">
import { useDamages } from "@/composables/useDamages";
import { formatCurrency, formatDayTime } from "@/helpers/format.helpers";

defineProps<{
  damage: any;
}>();

const { getDamageStatus, getDamageType } = useDamages();
</script>

<template>
  <div class="relative flex flex-col items-center gap-0.5 justify-between py-4 px-5">
    <div class="w-full flex items-center justify-between">
      <p class="font-medium">
        {{
          "DONE" === damage.status
            ? `${getDamageType(damage?.damage_type)}`
            : `№${damage?.certificate_number}, ${getDamageType(damage?.damage_type).toLocaleLowerCase()}`
        }}
      </p>
      <p
        class="font-medium"
        :class="{
          'text-[var(--text-color-secondary)]': 'DONE' === damage.status,
        }"
      >
        {{ formatCurrency(damage.cost) }}
      </p>
    </div>
    <div class="w-full flex items-center justify-between">
      <p class="text-[var(--text-color-secondary)]">
        {{ formatDayTime(damage.event_time, true) }}
      </p>
      <p
        :class="{
          'text-[var(--text-color-success)]': 'DONE' === damage.status,
          'text-[var(--text-color-warning)]': 'IN_PROGRESS' === damage.status,
        }"
      >
        {{ getDamageStatus(damage.status) }}
      </p>
    </div>
  </div>
</template>

<style scoped></style>
