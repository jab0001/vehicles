<script setup lang="ts">
import { useDashboardStore } from "@/stores/dashboardStore";
import { storeToRefs } from "pinia";
import { computed, ref, watch } from "vue";

const emit = defineEmits(["close-modal"]);
const props = defineProps({
  modalVisible: { type: Boolean, required: true },
  modalDebt: { type: Boolean, required: true },
});

const { dashBoardSettings, dashBoardDriverSettings } =
  storeToRefs(useDashboardStore());

const { balanceOperationsCategory } = useDashboardStore();

const modalIsOpen = ref(false);

const optionsCounterpartyType = [
  {
    label: "С переплатой",
    key: false,
  },
  {
    label: "Без переплаты",
    key: true,
  },
];

const currentSettings = computed(() =>
  props.modalDebt ? dashBoardSettings.value : dashBoardDriverSettings.value
);

watch(
  () => props.modalVisible,
  (v: boolean) => {
    modalIsOpen.value = v;
  }
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
    :title="modalDebt ? 'Общая задолженность' : 'Водители'"
    width="426"
    align-center
    @close="closeModal"
  >
    <el-radio-group v-model="currentSettings.onlyDebtIncluded">
      <el-radio v-for="item in optionsCounterpartyType" :value="item.key">{{
        item.label
      }}</el-radio>
    </el-radio-group>

    <p class="mt-6 text-xs text-[#909399]">
      Укажите статьи, которые будут учтены
    </p>
    <el-checkbox-group
      v-model="currentSettings.balanceOperations"
      class="flex flex-col"
    >
      <el-checkbox
        v-for="(item, type) in balanceOperationsCategory"
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
