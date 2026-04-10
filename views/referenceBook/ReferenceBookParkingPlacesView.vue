<script setup lang="ts">
import { storeToRefs } from "pinia";
import { useMounted } from "@vueuse/core";
import { useAppStore } from "@/stores/appStore";
import { useParkingPlacesStore } from "@/stores/parkingPlacesStore";
import { useParkingPlaces } from "@/composables/useParkingPlaces";

import TableReferenceBookParkingPlaces from "@/components/tables/TableReferenceBookParkingPlaces.vue";

const { fetchParkingPlacesRequest } = useParkingPlacesStore();
const { fetchParkingPlacesResponse: parkingPlaces, fetchParkingPlacesLoading } =
  storeToRefs(useParkingPlacesStore());

const isMounted = useMounted();

const { setReferenceBookParkingPlacesCreateHash } = useAppStore();

fetchParkingPlacesRequest();
</script>

<template>
  <Teleport v-if="isMounted" to="#header">
    <div class="w-full flex justify-between items-center">
      <div class="text-md text-nowrap text-xl">
        {{ "Стоянки" }}
      </div>
      <el-button
        type="primary"
        @click="setReferenceBookParkingPlacesCreateHash"
        >{{ "Добавить" }}</el-button
      >
    </div>
  </Teleport>

  <TableReferenceBookParkingPlaces
    class="h-[calc(100vh-60px)] flex flex-col pb-5"
    :items="parkingPlaces ?? []"
    :total-items="0"
    :loading="fetchParkingPlacesLoading"
    :empty-text="'Ничего не найдено'"
  />
</template>
