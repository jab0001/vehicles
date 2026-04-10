<script setup lang="ts">
import { storeToRefs } from "pinia";
import { useMounted } from "@vueuse/core";
import { ref, watch } from "vue";
import { useAppStore } from "@/stores/appStore";
import { useVehicleDowntimeStore } from "@/stores/vehicles";
import type { IVehicleDowntimeReason } from "@/types/vehicles";
import TableReferenceBookDowntimeReason from "@/components/tables/TableReferenceBookDowntimeReason.vue";

const isMounted = useMounted();

const { fetchVehicleDowntimeReasons, deleteDowntimeReason } =
  useVehicleDowntimeStore();
const {
  downtimeReasons,
  createVehicleDowntimeReasonsResponse,
  deleteVehicleDowntimeReasonsLoading,
  fetchVehicleDowntimeReasonsLoading,
} = storeToRefs(useVehicleDowntimeStore());
const { setReferenceBookDowntimeReasonCreateHash } = useAppStore();

const onRowClick = (rowItem: IVehicleDowntimeReason) => {
  console.log(rowItem);
};
const onDeleteRowItem = (rowItem: IVehicleDowntimeReason) => {
  deleteDowntimeReason(rowItem.id);
};

watch(
  createVehicleDowntimeReasonsResponse,
  (v) => {
    if (v) {
      fetchVehicleDowntimeReasons();
    }
  },
  {
    immediate: true,
    deep: true,
  }
);

fetchVehicleDowntimeReasons();
</script>

<template>
  <Teleport v-if="isMounted" to="#header">
    <div class="w-full flex justify-between items-center">
      <div class="text-md text-nowrap text-xl">
        {{ "Вид простоя" }}
      </div>

      <el-button
        type="primary"
        @click="setReferenceBookDowntimeReasonCreateHash"
        >{{ "Добавить" }}</el-button
      >
    </div>
  </Teleport>

  <TableReferenceBookDowntimeReason
    class="h-[calc(100vh-60px)] flex flex-col pb-5"
    :items="downtimeReasons?.filter((i) => !i.is_deleted) ?? []"
    :total-items="0"
    :loading="
      deleteVehicleDowntimeReasonsLoading || fetchVehicleDowntimeReasonsLoading
    "
    :empty-text="'Ничего не найдено'"
    @row-click="onRowClick"
    @handle-delete="onDeleteRowItem"
  />
</template>
