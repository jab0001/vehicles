<script setup lang="ts">
import { useFines } from "@/composables/useFines";
import { formatCurrency, formatDayTime } from "@/helpers/format.helpers";

defineProps<{
  fine: any;
}>();

const { getFineLocalStatus } = useFines();
</script>

<template>
  <div class="relative flex flex-col items-center gap-0.5 justify-between py-4 px-5">
    <p
      v-if="fine?.is_new"
      class="absolute top-2 right-2 w-2 h-2 rounded-full bg-[var(--text-color-error)]"
    ></p>
    <div class="w-full flex items-center justify-between">
      <p class="font-medium">{{ `№${fine?.number}` }}</p>
      <p
        class="font-medium"
        :class="{
          'text-[var(--text-color-secondary)]': [
            'paid',
            'paid_with_discount',
						'canceled'
          ].includes(fine.local_status),
        }"
      >
        {{ formatCurrency(fine.price) }}
      </p>
    </div>
    <div class="w-full flex items-center justify-between">
      <p class="text-[var(--text-color-secondary)]">
        {{ formatDayTime(fine.bill_date) }}
      </p>
      <p
        :class="{
          'text-[var(--text-color-secondary)]': ['canceled'].includes(
            fine.local_status
          ),
          'text-[var(--text-color-success)]': [
            'paid',
            'paid_with_discount',
          ].includes(fine.local_status),
          'text-[var(--text-color-warning)]': [
            'not_paid',
            'not_paid_with_discount',
          ].includes(fine.local_status),
        }"
      >
        {{ getFineLocalStatus(fine.local_status) }}
      </p>
    </div>
  </div>
</template>

<style scoped></style>
