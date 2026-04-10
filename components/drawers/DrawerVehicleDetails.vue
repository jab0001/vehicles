<script setup lang="ts">
import {
  Memo,
  Money,
  Right,
  Minus,
  View,
  DocumentChecked,
  SetUp,
  Box,
  Document,
  DocumentCopy,
  Odometer,
  Setting,
} from "@element-plus/icons-vue";
import { ref, computed, watch, onUnmounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { storeToRefs } from "pinia";
import { ClickOutside as vClickOutside } from "element-plus";

import { useCompaniesManagementStore } from "@/stores/companiesManagementStore";
import { useVehicleEquipmentStore, useVehiclesStore } from "@/stores/vehicles";
import { useVehicleGeoposition } from "@/composables/useVehicles";

import VehiclesInfo from "@/components/vehicles/VehiclesInfo.vue";
import VehiclesRent from "@/components/vehicles/VehiclesRent.vue";
import VehiclesLeasing from "@/components/vehicles/VehiclesLeasing.vue";
import VehiclesInsurance from "@/components/vehicles/VehiclesInsurance.vue";
import VehiclesDiagnosticCards from "@/components/vehicles/VehiclesDiagnosticCards.vue";
import VehiclesOnLine from "@/components/vehicles/VehiclesOnLine.vue";
import VehiclesInspections from "@/components/vehicles/VehiclesInspections.vue";
import VehiclesEquipment from "@/components/vehicles/VehiclesEquipment.vue";
import VehiclesDocuments from "@/components/vehicles/VehiclesDocuments.vue";
import UiDrawerWrapper from "@/components/ui/UiDrawerWrapper.vue";
import VehiclesLicencePlate from "@/components/vehicles/VehiclesLicencePlate.vue";
import VehiclesMaintenance from "@/components/vehicles/VehiclesMaintenance.vue";
import VehiclesRepairs from "@/components/vehicles/VehiclesRepairs.vue";
import VehiclesMileage from "@/components/vehicles/VehiclesMileage.vue";
import VehiclesDamages from "@/components/vehicles/VehiclesDamages.vue";
import { useEquipmentStore } from "@/stores/equipmentStore";
import IconDamage from "../icons/IconDamage.vue";
import { useUserAbility } from "@/composables/useUser";
import VehiclesAggregators from "../vehicles/VehiclesAggregators.vue";
import IconAggregators from "../icons/IconAggregators.vue";

const route = useRoute();
const router = useRouter();
const { fetchDetail, updateVehicle, clearVehicleRentTemplateForm } =
  useVehiclesStore();
const { detailResult, vehicleProhibitionForm } =
  storeToRefs(useVehiclesStore());
const menuIndex = ref("");
const displayProhobitionDialog = ref(false);
const { currentCompanyId, currentCompaniesIdsList } = storeToRefs(
  useCompaniesManagementStore()
);
const { fetchEquipmentList, fetchEquipmentListHistory } = useEquipmentStore();
const { fetchVehicleEquipmentsHistoryRequest } = useVehicleEquipmentStore();
const { vehicleGeopositionLoading, getVehicleGeoposition } =
  useVehicleGeoposition();
const { can } = useUserAbility();

const component = computed(() => {
  switch (menuIndex.value) {
    case "info":
      return VehiclesInfo;
    case "mileage":
      return VehiclesMileage;
    case "rent":
      return VehiclesRent;
    case "leasing":
      return VehiclesLeasing;
    case "insurance":
      return VehiclesInsurance;
    case "diagnostic-cards":
      return VehiclesDiagnosticCards;
    case "lines":
      return VehiclesOnLine;
    case "inspections":
      return VehiclesInspections;
    case "extra-equipment":
      return VehiclesEquipment;
    case "maintenance":
      return VehiclesMaintenance;
    // case "documents":
    //   return VehiclesDocuments;
    case "documents":
      return VehiclesDocuments;
    case "damages":
      return VehiclesDamages;
    case "aggregators":
      return VehiclesAggregators;
    case "repairs":
      return VehiclesRepairs;
    default:
      break;
  }
});

watch(
  () => route.hash,
  (v) => {
    if (!v) return;
    const h = v?.split("/") ?? [];
    menuIndex.value = h[h.length - 1] ?? "";
  },
  { deep: true, immediate: true }
);

const onMenuSelect = (v: any) => {
  const h = route.hash?.split("/") ?? [];
  h[h.length - 1] = v;
  console.log(h.join("/"));
  router.replace({ hash: h.join("/") });
};

const onProhibitionClick = () => {
  console.log(
    "vehicleProhibitionForm.value.issuance_prohibition",
    vehicleProhibitionForm.value.issuance_prohibition
  );
  vehicleProhibitionForm.value.issuance_prohibition =
    !vehicleProhibitionForm.value.issuance_prohibition;

  setTimeout(() => {
    if (vehicleProhibitionForm.value.issuance_prohibition) {
      displayProhobitionDialog.value = true;
    } else {
      updateVehicle({ silent: true });
    }
  }, 300);
};

fetchDetail({
  company_id: currentCompanyId.value,
  vehicle_id: Number(route.hash?.split("/")[2]),
});
fetchEquipmentList();
fetchEquipmentListHistory({
  search: undefined,
  page: 1,
  limit: 0,
  include_deleted: true,
});
fetchVehicleEquipmentsHistoryRequest({
  vehicle_id: Number(route.hash?.split("/")[2]),
  include_deleted: true,
});

watch(displayProhobitionDialog, (v) => {
  if (v === false) {
    updateVehicle({ silent: true });
  }
});

onUnmounted(() => clearVehicleRentTemplateForm());
</script>

<template>
  <UiDrawerWrapper
    :class="{
      'vehicle-details': menuIndex === 'info',
    }"
  >
    <template #aside>
      <el-menu
        class="h-full flex flex-col py-5"
        :default-active="menuIndex"
        @select="onMenuSelect"
      >
        <section class="px-5 mb-5">
          <VehiclesLicencePlate :plate-number="detailResult?.plate_number" />
          <div class="mt-3 font-medium line-clamp-2">
            {{ detailResult?.brand?.brand }}
            {{ detailResult?.car_model?.car_model }}
          </div>
          <div class="flex items-center mt-0.5 text-xs">
            <span>№{{ detailResult?.id }}</span>
            <span
              class="inline-block w-1.5 h-1.5 rounded-full mx-2"
              :class="detailResult?.is_on_line ? 'bg-green-500' : 'bg-red-500'"
            ></span>
            <span
              >{{ detailResult?.is_on_line === false ? `не ` : `` }}на
              линии</span
            >
          </div>
        </section>

        <el-menu-item index="info">
          <el-icon><Memo /></el-icon>
          <span>{{ "Данные а/м" }}</span>
        </el-menu-item>
        <el-menu-item index="mileage">
          <el-icon><Odometer /></el-icon>
          <span>{{ "Пробег" }}</span>
        </el-menu-item>
        <el-menu-item index="rent">
          <el-icon><Money /></el-icon>
          <span>{{ "Условия аренды" }}</span>
        </el-menu-item>
        <el-menu-item index="leasing">
          <el-icon><DocumentCopy /></el-icon>
          <span>{{ "Лизинг" }}</span>
        </el-menu-item>
        <el-menu-item index="insurance">
          <el-icon><DocumentChecked /></el-icon>
          <span>{{ "Страховки" }}</span> </el-menu-item
        ><el-menu-item index="diagnostic-cards">
          <el-icon><SetUp /></el-icon>
          <span>{{ "Диагностические карты" }}</span>
        </el-menu-item>

        <el-menu-item index="lines">
          <span
            ><el-icon><Minus class="rotate-90" /><Right /></el-icon
          ></span>
          <span>{{ "Выпуск на линию" }}</span>
        </el-menu-item>
        <el-menu-item index="inspections">
          <el-icon><View /></el-icon>
          <span>{{ "Осмотры а/м" }}</span>
        </el-menu-item>
        <el-menu-item index="extra-equipment">
          <el-icon><Box /></el-icon>
          <span>{{ "Комплектация" }}</span>
        </el-menu-item>
        <el-menu-item index="maintenance">
          <el-icon><Odometer /></el-icon>
          <span>{{ "Техобслуживание" }}</span>
        </el-menu-item>
        <el-menu-item index="documents">
          <el-icon><Document /></el-icon>
          <span>{{ "Документы" }}</span>
        </el-menu-item>
        <el-menu-item index="damages">
          <el-icon><IconDamage /></el-icon>
          <span>{{ "Ущербы" }}</span>
        </el-menu-item>
        <el-menu-item index="aggregators">
          <el-icon><IconAggregators /></el-icon>
          <span>{{ "Агрегаторы" }}</span>
        </el-menu-item>
        <el-menu-item index="repairs">
          <el-icon><Setting /></el-icon>
          <span>{{ "Ремонты" }}</span>
        </el-menu-item>
        <el-tooltip
          v-if="can('update', 'Vehicle')"
          :disabled="!vehicleProhibitionForm.issuance_prohibition"
          :content="vehicleProhibitionForm.issuance_prohibition_reason"
          placement="bottom"
        >
          <div
            class="px-5 py-2 flex gap-2 items-center border-t border-t-gray-300 cursor-pointer"
            @click.prevent.stop="onProhibitionClick"
          >
            <el-switch
              class="!pointer-events-none"
              v-model="vehicleProhibitionForm.issuance_prohibition"
            />
            Запрет на выдачу
          </div>
        </el-tooltip>

        <el-link
          class="w-fit mx-auto mt-4"
          :underline="false"
          v-loading="vehicleGeopositionLoading"
          type="primary"
          @click="getVehicleGeoposition(detailResult?.id!)"
          >Местоположение</el-link
        >

        <section
          v-if="false"
          class="flex flex-col gap-1 mt-auto text-xs font-medium"
        >
          <div class="flex gap-2">
            <span class="short-title">Пробег</span>
            <span>1 466 001 км</span>
          </div>
          <div class="flex gap-2">
            <span class="short-title">Бензин</span>
            <span>1/4 бака</span>
          </div>
          <div class="flex gap-2">
            <span class="short-title">ТО</span>
            <span>1 550 км</span>
          </div>
          <div class="flex gap-2">
            <span class="short-title">ОСАГО до</span>
            <span>11.04.2026</span>
          </div>
          <div class="flex gap-2">
            <span class="short-title">Техосмотр до</span>
            <span>11.04.2026</span>
          </div>
          <div class="flex gap-2">
            <span class="short-title">Лицензия до</span>
            <span>11.04.2026</span>
          </div>
        </section>
      </el-menu>
    </template>

    <Component v-if="component" :is="component" />

    <el-dialog
      v-model="displayProhobitionDialog"
      title="Причина запрета на выдачу"
      width="500"
    >
      <el-input
        v-model="vehicleProhibitionForm.issuance_prohibition_reason"
        type="textarea"
        placeholder="Ваш комментарий..."
      />
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="displayProhobitionDialog = false">
            Ок
          </el-button>
        </div>
      </template>
    </el-dialog>
  </UiDrawerWrapper>
</template>

<style scoped>
.vehicle-details :deep(.el-main) {
  padding: 0;
}
.short-title {
  @apply w-1/2 text-right font-medium;
}
</style>
