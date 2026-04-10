<script setup lang="ts">
import UiDrawerWrapper from "@/components/ui/UiDrawerWrapper.vue";
import CompaniesInfo from "@/components/companies/CompaniesInfo.vue";

const isUpdateCounterparty = false;
</script>

<template>
  <UiDrawerWrapper class="company-create">
    <h1 class="text-lg font-medium pr-5 pl-5 pt-5">Новый контрагент</h1>

    <CompaniesInfo :isUpdateCounterparty="isUpdateCounterparty"/>
  </UiDrawerWrapper>
</template>

<style scoped>
.company-create :deep(.el-main) {
  padding: 0;
}
</style>
