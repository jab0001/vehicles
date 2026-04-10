<script setup lang="ts">
import { useDashboardStore } from "@/stores/dashboardStore";
import { useInsurancesStore } from "@/stores/insurancesStore";
import { storeToRefs } from "pinia";
import { computed, ref, watch } from "vue";

const emit = defineEmits(["close-modal"]);
const props = defineProps({
  modalVisible: { type: Boolean, required: true },
  isDashboard: { type: Boolean, default: true}
});

const { dashBoardInsuranceStatisticSettings } =
  storeToRefs(useDashboardStore());

const { insuranceDashboardSettings } = storeToRefs(useInsurancesStore());

const { insuranceTypes } = useDashboardStore();

const modalIsOpen = ref(false);

const dashboardPlace = computed(() => {
  return props.isDashboard ? dashBoardInsuranceStatisticSettings.value : insuranceDashboardSettings.value
})

watch(
  () => props.modalVisible,
  (v: boolean) => {
    modalIsOpen.value = v;
  },
);

const closeModal = () => {
  modalIsOpen.value = false;
  emit("close-modal");
};

const saveSettings = () => {
  modalIsOpen.value = false;
  emit("close-modal");
};
</script>

<template>
  <el-dialog
    v-model="modalIsOpen"
    class="p-5"
    :title="'Настройки отображения'"
    width="426"
    align-center
    @close="closeModal"
  >
    <p class="mt-1 text-lg text-[#00a73d]">Действующие</p>
    <el-checkbox-group
      v-model="dashboardPlace.insurance_types_active"
      class="flex"
    >
      <el-checkbox
        v-for="(item, type) in insuranceTypes"
        :key="type"
        :value="type"
        name="type"
      >
        {{ item }}
      </el-checkbox>
    </el-checkbox-group>
    <p class="mt-1 text-lg text-[#ff9342]">Истекают</p>
    <el-checkbox-group
      v-model="dashboardPlace.insurance_types_expires"
      class="flex"
    >
      <el-checkbox
        v-for="(item, type) in insuranceTypes"
        :key="type"
        :value="type"
        name="type"
      >
        {{ item }}
      </el-checkbox>
    </el-checkbox-group>
    <p class="mt-1 text-lg text-[#fb2c37]">Автомобили без страховок</p>
    <el-checkbox-group
      v-model="dashboardPlace.cars_without_insurance_types"
      class="flex"
    >
      <el-checkbox
        v-for="(item, type) in insuranceTypes"
        :key="type"
        :value="type"
        name="type"
      >
        {{ item }}
      </el-checkbox>
    </el-checkbox-group>

    <div class="flex items-center justify-end mt-2.5">
      <el-button @click="closeModal">Отменить</el-button>
      <el-button type="primary" @click="saveSettings">Сохранить</el-button>
    </div>
  </el-dialog>
</template>

<style scoped></style>
