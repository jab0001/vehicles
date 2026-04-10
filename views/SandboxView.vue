<script setup lang="ts">
import { ArrowRight } from "@element-plus/icons-vue";
// import VehiclesHistoryTab from "@/components/vehicles/VehiclesHistoryTab.vue";
// import VehiclesRentTab from "@/components/vehicles/VehiclesRentTab.vue";
// import VehiclesInspectionTab from "@/components/vehicles/VehiclesInspectionTab.vue";
// import VehiclesBlockTab from "@/components/vehicles/VehiclesBlockTab.vue";
// import VehiclesCompleteTab from "@/components/vehicles/VehiclesCompleteTab.vue";
// import VehiclesDataTab from "@/components/vehicles/VehiclesDataTab.vue";
</script>

<template>
  <div class="w-[800px]">
    <!-- info panel -->
    <div class="flex gap-3 px-8 py-5 w-fit">
      <el-card class="w-56 h-36">
        <div class="text-xs font-medium mb-5">Hyundai Solaris 2023</div>
        <div class="text-[10px]">Бензин 1/2 бака</div>
        <div class="text-[10px] mb-2">Пробег 466 001 км</div>
        <div class="flex gap-2.5 items-center">
          <div
            class="text-xs font-medium border-solid border border-black px-1.5 py-0.5"
          >
            Е999ЕЕ 77
          </div>
          <div class="text-xs font-medium">871</div>
        </div>
      </el-card>
      <el-card class="w-56 h-36 flex">
        <el-tag class="text-[10px] w-fit" round type="info">в аренде</el-tag>
        <div class="mt-auto font-xs">Кузнецова Анастасия Александровна</div>
      </el-card>
      <el-card class="w-56 h-36 flex">
        <div class="flex items-center justify-between">
          <div class="text-[10px]">ОСАГО</div>
          <div class="text-[10px] flex gap-2 items-center">
            до 23.04.2026
            <el-button
              size="small"
              type="default"
              :icon="ArrowRight"
            ></el-button>
          </div>
        </div>
        <div class="flex items-center justify-between">
          <div class="text-[10px]">ЛИЦЕНЗИЯ</div>
          <div class="text-[10px] flex gap-2 items-center">
            до 01.01.2025
            <el-button
              size="small"
              type="default"
              :icon="ArrowRight"
            ></el-button>
          </div>
        </div>
        <div class="flex items-center justify-between">
          <div class="text-[10px]">ТО</div>
          <div class="text-[10px] flex gap-2 items-center">
            01.05.2024
            <el-button
              size="small"
              type="default"
              :icon="ArrowRight"
            ></el-button>
          </div>
        </div>
        <div class="flex items-center justify-between">
          <div class="text-[10px]">Тех. осмотр</div>
          <div class="text-[10px] flex gap-2 items-center">
            01.05.2024
            <el-button
              size="small"
              type="default"
              :icon="ArrowRight"
            ></el-button>
          </div>
        </div>
      </el-card>
    </div>
    <div class="px-8 py-5 w-full">
      <!-- tabs -->
      <el-tabs type="border-card">
        <!-- <el-tab-pane label="История"><VehiclesHistoryTab /></el-tab-pane>
        <el-tab-pane label="Аренда"><VehiclesRentTab /></el-tab-pane>
        <el-tab-pane label="Осмотр"><VehiclesInspectionTab /></el-tab-pane>
        <el-tab-pane label="Блокировка"><VehiclesBlockTab /></el-tab-pane>
        <el-tab-pane label="Осмотр"><VehiclesCompleteTab /></el-tab-pane>
        <el-tab-pane label="Данные"><VehiclesDataTab /></el-tab-pane> -->
      </el-tabs>
    </div>
  </div>
</template>

<style scoped>
:deep(.el-card__body) {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  flex-grow: 1;
}

:deep(.el-button--small) {
  padding: 4px 4px;
  /* border: none !important; */
}
</style>
