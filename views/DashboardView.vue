<script setup lang="ts">
import { useMounted } from "@vueuse/core";

import DashboardMain from "@/components/dashboard/DashboardMain.vue";
import DashboardSettingsModal from "@/components/dashboard/DasboardSettingsModal.vue";
import DashboardInsuranceSettingsModal from "@/components/dashboard/DashboardInsuranceSettingsModal.vue";
import { ref } from "vue";

const isMounted = useMounted();

const modalVisible = ref(false);
const modalDebt = ref(true);

const modalInsuranceStatisticVisible = ref(false);

const openDashboardModal = (isDebt: boolean) => {
  modalDebt.value = isDebt;
  modalVisible.value = true;
};

const openStatisticModal = () => {
  modalInsuranceStatisticVisible.value = true;
}
</script>

<template>
  <Teleport v-if="isMounted" to="#header">
    <div class="flex justify-between items-center w-[1172px] mx-auto">
      <div class="text-nowrap text-[24px] font-medium">Добрый день!</div>
    </div>
  </Teleport>

  <DashboardMain class="z-10" @open-modal="openDashboardModal" @open-statistic-modal="openStatisticModal" />

  <DashboardSettingsModal
    :modal-visible="modalVisible"
    :modalDebt="modalDebt"
    @close-modal="modalVisible = false"
  />
  <DashboardInsuranceSettingsModal
    :modal-visible="modalInsuranceStatisticVisible"
    @close-modal="modalInsuranceStatisticVisible = false"
  />
</template>

<style scoped>
.card {
  background-color: var(--fill-color-light);
  border-radius: 20px;
}
.card p {
  color: var(--text-color-secondary);
}
:deep(.statuses .el-table tr) {
  background: transparent;
}
:deep(.statuses .el-table) {
  background: transparent;
}
:deep(.el-link__inner) {
  @apply text-xs font-medium;
}
</style>
