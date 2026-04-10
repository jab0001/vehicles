<script setup lang="ts">
import { storeToRefs } from "pinia";
import { useRoute } from "vue-router";

import { Close } from "@element-plus/icons-vue";
import { useAppStore } from "@/stores/appStore";
import { useDamagesStore } from "@/stores/damagesStore";

import UiDrawerWrapper from "@/components/ui/UiDrawerWrapper.vue";
import FormsDamage from "@/components/forms/FormsDamage.vue";
import { useAppBreakpoints } from "@/composables/useApp";

// const { hideDrawer } = useAppStore();
const route = useRoute();
const { updateDamageLoading, damageDetailsLoading } =
  storeToRefs(useDamagesStore());
const { fetchDamageDetails, updateDamage } = useDamagesStore();
const { mdAndLarger } = useAppBreakpoints();
const { hideDrawer } = useAppStore();

fetchDamageDetails({
  damage_id: Number(route.hash?.split("/")[2]),
});
</script>

<template>
  <UiDrawerWrapper
    ><div class="flex items-center justify-between mb-4">
      <div class="text-lg md:text-xl font-medium">Ущерб</div>
      <el-icon v-if="!mdAndLarger" :size="16" @click="hideDrawer"
        ><Close
      /></el-icon>
    </div>

    <FormsDamage
      v-loading="updateDamageLoading || damageDetailsLoading"
      class="mt-4"
    >
      <template #footer>
        <div class="w-full flex items-center justify-end mt-4">
          <el-button type="primary" @click="updateDamage">Сохранить</el-button>
        </div>
      </template>
    </FormsDamage>
  </UiDrawerWrapper>
</template>

<style scoped></style>
