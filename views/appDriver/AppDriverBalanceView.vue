<script setup lang="ts">
import { CaretTop, CaretBottom } from "@element-plus/icons-vue";
import { useRouter } from "vue-router";
import { formatCurrency } from "@/helpers/format.helpers";

import { useAppDriverBalanceOperations } from "@/composables/useAppDriver";

import AppDriverMainHeader from "@/components/appDriver/AppDriverMainHeader.vue";
import AppDriverBalanceCategoryCard from "@/components/appDriver/AppDriverBalanceCategoryCard.vue";

const router = useRouter();
const {
  totalBalanceOperationsLoading,
  totalBalanceOperations,
  fetchTotalBalanceOperations,
} = useAppDriverBalanceOperations();

fetchTotalBalanceOperations();
</script>

<template>
  <div class="flex flex-col justify-between p-4 flex-grow">
    <div class="flex flex-col gap-4 flex-grow">
      <AppDriverMainHeader title="Баланс">
        <div class="flex items-center gap-2 ml-auto">
          <template v-if="Number(totalBalanceOperations?.total) !== 0">
            <el-icon
              v-if="Number(totalBalanceOperations?.total) < 0"
              size="16"
              color="#F56C6C"
              ><CaretBottom
            /></el-icon>
            <el-icon v-else size="16" color="#67C23A"><CaretTop /></el-icon>
          </template>

          <p class="text-lg font-medium">
            {{ formatCurrency(totalBalanceOperations?.total) }}
          </p>
        </div>
      </AppDriverMainHeader>

      <div
        v-loading="totalBalanceOperationsLoading"
        class="w-full bg-white shadow-app-driver rounded-xl divide-y"
      >
        <AppDriverBalanceCategoryCard
          v-for="(total, category) in totalBalanceOperations?.by_category"
          :key="category"
          :operation="{ category, total }"
          @click="
            router.push({
              name: 'AppDriverBalanceOperations',
              params: {
                category: category,
              },
            })
          "
        />
      </div>
    </div>
    <el-button
      class="h-14 rounded-xl text-base"
      size="large"
      type="primary"
      @click="router.push({ name: 'AppDriverBalanceAdd' })"
      >Пополнить баланс</el-button
    >
  </div>
</template>
