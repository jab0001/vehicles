<script setup lang="ts">
import { formatDayTime } from "@/helpers/format.helpers";
import type { IDocumentRegistry } from "@/types/documentRegistry";

const props = defineProps<{
  document: IDocumentRegistry;
}>();

// const getDocumentStatus = (
//   status: any
// ):
//   | {
//       name: String;
//       type: "success" | "danger" | "info";
//     }
//   | undefined => {
//   switch (status) {
//     case "not_subscribed":
//       return { name: "Не подписан", type: "danger" };
//     case "subscribed":
//       return { name: "Подписан", type: "success" };
//     case "subscribed_office":
//       return { name: "Подписан в офисе", type: "success" };
//     case "not_acquainted":
//       return { name: "Не ознакомлен", type: "danger" };
//     case "acquainted":
//       return { name: "Ознакомлен", type: "success" };
//     case "printed":
//       return { name: "Распечатан", type: "info" };
//     default:
//       break;
//   }
// };
// const getStatusColor = (status: string) => {
//   switch (status) {
//     case "not_subscribed":
//       return "text-[var(--text-color-warning)]";
//     case "subscribed":
//       return "text-[var(--text-color-success)]";
//     case "subscribed_office":
//       return "text-[var(--text-color-success)]";
//     case "not_acquainted":
//       return "text-[var(--text-color-warning)]";
//     case "acquainted":
//       return "text-[var(--text-color-success)]";
//     case "printed":
//       return 'text-[var(--text-color-disabled)]';
//     default:
//       return 'text-[var(--text-color-disabled)]';
//   }
// };
</script>

<template>
  <div class="relative flex flex-col gap-1 justify-between py-3.5 px-4">
    <div class="font-medium">
      {{ document.name }}
    </div>

    <div class="flex items-center justify-between">
      <p class="text-[var(--text-color-disabled)]">
        {{ formatDayTime(document.created_at) }}
      </p>
      <!-- <p :class="getStatusColor(document.status)">
        {{ getDocumentStatus(document.status)?.name }}
      </p> -->
    </div>
  </div>
</template>
