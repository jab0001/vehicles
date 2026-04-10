<script setup lang="ts">
import { storeToRefs } from "pinia";
import { useMounted } from "@vueuse/core";
import { onMounted, ref, watch } from "vue";
import { useAppStore } from "@/stores/appStore";
import { useConditionsStore } from "@/stores/conditionsStore";
import type { ICondition } from "@/types/conditions";
import UiSearch from "@/components/ui/UiSearch.vue";
import TableReferenceBookConditions from "@/components/tables/TableReferenceBookConditions.vue";
import UiBaseDeleteModal from "@/components/ui/UiBaseDeleteModal.vue";
import type { Sort } from "element-plus";

const isMounted = useMounted();
const {
  newCondition,
  editConditionResult,
  conditionsListLoading,
  conditionsList,
  conditionsListTotalItems,
  deleteConditionLoading,
  deleteConditionError,
  deleteConditionResult,
  pageFilters,
} = storeToRefs(useConditionsStore());
const { fetchConditionsList, clearFilters, deleteCondition } =
  useConditionsStore();

const {
  setReferenceBookConditionCreateHash,
  setReferenceBookConditionDetailsHash,
} = useAppStore();

const modalDeleteConditionVisible = ref<boolean>(false);
const modalCantDeleteConditionVisible = ref<boolean>(false);
const selectedConditionId = ref();

watch(
  [pageFilters, newCondition, editConditionResult],
  ([newFineV, updateV]) => {
    if (newFineV || updateV) {
      fetchConditionsList({
        ...pageFilters.value,
      });
    }
  },
  {
    immediate: true,
    deep: true,
  }
);

watch(
  [deleteConditionError],
  ([v]) => {
    if (v) {
      if (v.code === 409) {
        modalCantDeleteConditionVisible.value = true;
      }
    }
  },
  {
    immediate: true,
    deep: true,
  }
);

const onRowClick = (rowItem: ICondition) => {
  setReferenceBookConditionDetailsHash(rowItem.id);
};
const onDeleteRowItem = (rowItem: ICondition) => {
  selectedConditionId.value = rowItem.id;
  modalDeleteConditionVisible.value = true;
};

const handeDeleteCondition = (id: number) => {
  deleteCondition(id);
  modalDeleteConditionVisible.value = false;
};
</script>

<template>
  <Teleport v-if="isMounted" to="#header">
    <div class="w-full flex justify-between items-center">
      <div class="text-md text-nowrap text-xl">
        {{ "Условия работы штатных сотрудников" }}
      </div>

      <div class="flex items-center gap-2">
        <UiSearch
          v-model="pageFilters.search"
          class="w-72"
          :placeholder="'Поиск по наименованию'"
        />
        <el-link :underline="false" @click="clearFilters">Сбросить всё</el-link>
      </div>
      <el-button type="primary" @click="setReferenceBookConditionCreateHash">{{
        "Добавить"
      }}</el-button>
    </div>
  </Teleport>

  <TableReferenceBookConditions
    v-model:pagination="pageFilters"
    class="h-[calc(100vh-60px)] flex flex-col pb-5"
    :items="conditionsList"
    :display-columns="['name']"
    :sortable-columns="['name']"
    :total-items="conditionsListTotalItems"
    :loading="conditionsListLoading || deleteConditionLoading"
    :empty-text="'Ничего не найдено'"
    @row-click="onRowClick"
    @handle-delete="onDeleteRowItem"
  />

  <UiBaseDeleteModal
    :modal-visible="modalDeleteConditionVisible"
    :id="selectedConditionId!"
    @close-modal="modalDeleteConditionVisible = false"
    @success="handeDeleteCondition"
  >
    {{ "Вы действительно хотите удалить условие работы штатных сотрудников?" }}
  </UiBaseDeleteModal>

  <el-dialog
    :model-value="modalCantDeleteConditionVisible"
    class="p-5"
    :title="`Нельзя удалить условие`"
    :width="340"
    align-center
    @close="modalCantDeleteConditionVisible = false"
  >
    <div class="py-5">
      Сейчас данное условие используется
    </div>
    <div class="flex items-center justify-end mt-2.5">
      <el-button @click="modalCantDeleteConditionVisible = false"
        >Оставить</el-button
      >
    </div>
  </el-dialog>
</template>
