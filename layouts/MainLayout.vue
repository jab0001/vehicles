<script lang="ts" setup>
import { computed, defineComponent, onMounted, ref, watch } from "vue";
import { Close } from "@element-plus/icons-vue";
import { useRouteHash } from "@vueuse/router";
import { storeToRefs } from "pinia";

import { useAppStore } from "@/stores/appStore";
import { useReferenceBooksStore } from "@/stores/referenceBooks";
import { useBalanceOperationsStore } from "@/stores/balanceOperationsStore";
import { useCompaniesManagementStore } from "@/stores/companiesManagementStore";
import { useExtraEquipmentsStore } from "@/stores/extraEquipmentsStore";
import { useFinesStore } from "@/stores/finesStore";
import { EDrawerContent, useAppBreakpoints } from "@/composables/useApp";

import UiDrawer from "@/components/ui/UiDrawer.vue";
import AppMenu from "@/components/app/AppMenu.vue";
import NotificationsSidebar from "@/components/notifications/NotificationsSidebar.vue";
import { useRoute } from "vue-router";

defineComponent({
  name: "MainLayout",
});

const {
  fetchCarBrands,
  fetchCarModels,
  fetchCarColors,
  fetchCarTypes,
  fetchCountriesCodes,
} = useReferenceBooksStore();
const routeHash = useRouteHash();

const route = useRoute();

const isDashboard = computed(() => route.path.includes("dashboard"));

const { openDrawer, closeMobileMenuDrawer } = useAppStore();
const { drawerVisible, mobileMenuDrawerVisible, isDisplayNotifications } =
  storeToRefs(useAppStore());
const { fetchCompaniesManagementList } = useCompaniesManagementStore();
const { fetchExtraEquipmentsList } = useExtraEquipmentsStore();

const { clear: clearBalanceOperationsForm } = useBalanceOperationsStore();
const { clear: clearFinesForm } = useFinesStore();

const { mdAndLarger } = useAppBreakpoints();

onMounted(() => {
  fetchCarBrands();
  fetchCarModels();
  fetchCarColors();
  fetchCarTypes();
  fetchCountriesCodes();
  // fetchCompaniesManagementList();
  fetchExtraEquipmentsList();
});
watch(mdAndLarger, (v) => {
  if (v) closeMobileMenuDrawer();
});
watch(
  routeHash,
  (v) => {
    if (!v || drawerVisible.value) {
      clearBalanceOperationsForm();
      clearFinesForm();
      return;
    }

    if (v?.split("/").includes(EDrawerContent.DriversCreate)) {
      openDrawer(EDrawerContent.DriversCreate, {
        settings: {
          size: "calc(100% - 250px)",
        },
      });
    }
    if (v?.split("/").includes(EDrawerContent.DriversDetails)) {
      openDrawer(EDrawerContent.DriversDetails, {
        settings: {
          size: "calc(100% - 250px)",
        },
      });
    }
    if (v?.split("/").includes(EDrawerContent.VehicleCreate)) {
      openDrawer(EDrawerContent.VehicleCreate, {
        settings: {
          size: "calc(100% - 250px)",
        },
      });
    }
    if (v?.split("/").includes(EDrawerContent.VehicleDetails)) {
      openDrawer(EDrawerContent.VehicleDetails, {
        settings: {
          size: "calc(100% - 250px)",
        },
      });
    }
    if (v?.split("/").includes(EDrawerContent.InspectionsCreate)) {
      openDrawer(EDrawerContent.InspectionsCreate, {
        settings: {
          size: mdAndLarger.value ? "600px" : "100%",
        },
      });
    }
    if (v?.split("/").includes(EDrawerContent.InspectionsDetails)) {
      openDrawer(EDrawerContent.InspectionsDetails, {
        settings: {
          size: mdAndLarger.value ? "600px" : "100%",
        },
      });
    }
    if (v?.split("/").includes(EDrawerContent.BalanceOperationsCreate)) {
      openDrawer(EDrawerContent.BalanceOperationsCreate, {
        settings: {
          size: "600px",
        },
      });
    }
    if (v?.split("/").includes(EDrawerContent.BalanceOperationsDetails)) {
      openDrawer(EDrawerContent.BalanceOperationsDetails, {
        settings: {
          size: "600px",
        },
      });
    }
    if (v?.split("/").includes(EDrawerContent.FinesCreate)) {
      openDrawer(EDrawerContent.FinesCreate, {
        settings: {
          size: "600px",
        },
      });
    }
    if (v?.split("/").includes(EDrawerContent.FinesDetails)) {
      openDrawer(EDrawerContent.FinesDetails, {
        settings: {
          size: "600px",
        },
      });
    }
    if (v?.split("/").includes(EDrawerContent.PaymentTerminalsDetails)) {
      openDrawer(EDrawerContent.PaymentTerminalsDetails, {
        settings: {
          size: "700px",
        },
      });
    }
    if (v?.split("/").includes(EDrawerContent.AdjustmentsApplicationsCreate)) {
      openDrawer(EDrawerContent.AdjustmentsApplicationsCreate, {
        settings: {
          size: "648px",
        },
      });
    }
    if (v?.split("/").includes(EDrawerContent.AdjustmentsApplicationsDetails)) {
      openDrawer(EDrawerContent.AdjustmentsApplicationsDetails, {
        settings: {
          size: "648px",
        },
      });
    }
    if (v?.split("/").includes(EDrawerContent.TollRoadsCreate)) {
      openDrawer(EDrawerContent.TollRoadsCreate, {
        settings: {
          size: "600px",
        },
      });
    }
    if (v?.split("/").includes(EDrawerContent.TollRoadsDetails)) {
      openDrawer(EDrawerContent.TollRoadsDetails, {
        settings: {
          size: "600px",
        },
      });
    }
    if (v?.split("/").includes(EDrawerContent.WorkingShiftsAutomaticCreate)) {
      openDrawer(EDrawerContent.WorkingShiftsAutomaticCreate, {
        settings: {
          size: "700px",
        },
      });
    }
    if (v?.split("/").includes(EDrawerContent.SalaryStatementsCreate)) {
      openDrawer(EDrawerContent.SalaryStatementsCreate, {
        settings: {
          size: "600px",
        },
      });
    }
    if (v?.split("/").includes(EDrawerContent.SalaryStatementsDetails)) {
      openDrawer(EDrawerContent.SalaryStatementsDetails, {
        settings: {
          size: "600px",
        },
      });
    }
    if (v?.split("/").includes(EDrawerContent.SalaryStatementsDriverDetails)) {
      openDrawer(EDrawerContent.SalaryStatementsDriverDetails, {
        settings: {
          size: "600px",
        },
      });
    }
    if (v?.split("/").includes(EDrawerContent.DamageCreate)) {
      openDrawer(EDrawerContent.DamageCreate, {
        settings: {
          size: mdAndLarger.value ? "600px" : "100%",
        },
      });
    }
    if (v?.split("/").includes(EDrawerContent.DamageDetails)) {
      openDrawer(EDrawerContent.DamageDetails, {
        settings: {
          size: mdAndLarger.value ? "600px" : "100%",
        },
      });
    }
    if (v?.split("/").includes(EDrawerContent.StocksNomenclatureCreate)) {
      openDrawer(EDrawerContent.StocksNomenclatureCreate, {
        settings: {
          size: "600px",
        },
      });
    }
    if (v?.split("/").includes(EDrawerContent.StocksNomenclatureDetails)) {
      openDrawer(EDrawerContent.StocksNomenclatureDetails, {
        settings: {
          size: "600px",
        },
      });
    }
    if (v?.split("/").includes(EDrawerContent.StocksMovingCreate)) {
      openDrawer(EDrawerContent.StocksMovingCreate, {
        settings: {
          size: "600px",
        },
      });
    }
    if (v?.split("/").includes(EDrawerContent.StocksMovingDetails)) {
      openDrawer(EDrawerContent.StocksMovingDetails, {
        settings: {
          size: "600px",
        },
      });
    }
    if (v?.split("/").includes(EDrawerContent.StocksReceiptCreate)) {
      openDrawer(EDrawerContent.StocksReceiptCreate, {
        settings: {
          size: "600px",
        },
      });
    }
    if (v?.split("/").includes(EDrawerContent.StocksReceiptDetails)) {
      openDrawer(EDrawerContent.StocksReceiptDetails, {
        settings: {
          size: "600px",
        },
      });
    }
    if (v?.split("/").includes(EDrawerContent.StocksWriteOffCreate)) {
      openDrawer(EDrawerContent.StocksWriteOffCreate, {
        settings: {
          size: "600px",
        },
      });
    }
    if (v?.split("/").includes(EDrawerContent.StocksWriteOffDetails)) {
      openDrawer(EDrawerContent.StocksWriteOffDetails, {
        settings: {
          size: "600px",
        },
      });
    }
    if (v?.split("/").includes(EDrawerContent.StocksPostingCreate)) {
      openDrawer(EDrawerContent.StocksPostingCreate, {
        settings: {
          size: "600px",
        },
      });
    }
    if (v?.split("/").includes(EDrawerContent.StocksPostingDetails)) {
      openDrawer(EDrawerContent.StocksPostingDetails, {
        settings: {
          size: "600px",
        },
      });
    }
    if (v?.split("/").includes(EDrawerContent.StocksCostItemsCreate)) {
      openDrawer(EDrawerContent.StocksCostItemsCreate, {
        settings: {
          size: "600px",
        },
      });
    }
    if (v?.split("/").includes(EDrawerContent.StocksCostItemsDetails)) {
      openDrawer(EDrawerContent.StocksCostItemsDetails, {
        settings: {
          size: "600px",
        },
      });
    }
    if (v?.split("/").includes(EDrawerContent.StocksCreate)) {
      openDrawer(EDrawerContent.StocksCreate, {
        settings: {
          size: "600px",
        },
      });
    }
    if (v?.split("/").includes(EDrawerContent.StocksDetails)) {
      openDrawer(EDrawerContent.StocksDetails, {
        settings: {
          size: "600px",
        },
      });
    }
    if (v?.split("/").includes(EDrawerContent.RepairCreate)) {
      openDrawer(EDrawerContent.RepairCreate, {
        settings: {
          size: "1100px",
        },
      });
    }
    if (v?.split("/").includes(EDrawerContent.RepairDetails)) {
      openDrawer(EDrawerContent.RepairDetails, {
        settings: {
          size: "1100px",
        },
      });
    }
    if (v?.split("/").includes(EDrawerContent.MaintenanceCreate)) {
      openDrawer(EDrawerContent.MaintenanceCreate, {
        settings: {
          size: "700px",
        },
      });
    }
    if (v?.split("/").includes(EDrawerContent.MaintenanceDetails)) {
      openDrawer(EDrawerContent.MaintenanceDetails, {
        settings: {
          size: "700px",
        },
      });
    }
    if (v?.split("/").includes(EDrawerContent.PrintableForm)) {
      openDrawer(EDrawerContent.PrintableForm, {
        settings: {
          size: "700px",
        },
      });
    }
    if (v?.split("/").includes(EDrawerContent.ReferenceBookDismissalCreate)) {
      openDrawer(EDrawerContent.ReferenceBookDismissalCreate, {
        settings: {
          size: "600px",
        },
      });
    }
    if (v?.split("/").includes(EDrawerContent.ReferenceBookDismissalDetails)) {
      openDrawer(EDrawerContent.ReferenceBookDismissalDetails, {
        settings: {
          size: "600px",
        },
      });
    }
    if (v?.split("/").includes(EDrawerContent.ReferenceBookRentCreate)) {
      openDrawer(EDrawerContent.ReferenceBookRentCreate, {
        settings: {
          size: "600px",
        },
      });
    }
    if (v?.split("/").includes(EDrawerContent.ReferenceBookRentDetails)) {
      openDrawer(EDrawerContent.ReferenceBookRentDetails, {
        settings: {
          size: "600px",
        },
      });
    }
    if (v?.split("/").includes(EDrawerContent.ReferenceBookExtraEquipCreate)) {
      openDrawer(EDrawerContent.ReferenceBookExtraEquipCreate, {
        settings: {
          size: "600px",
        },
      });
    }
    if (v?.split("/").includes(EDrawerContent.ReferenceBookExtraEquipDetails)) {
      openDrawer(EDrawerContent.ReferenceBookExtraEquipDetails, {
        settings: {
          size: "600px",
        },
      });
    }
    if (
      v?.split("/").includes(EDrawerContent.ReferenceBookParkingPlacesCreate)
    ) {
      openDrawer(EDrawerContent.ReferenceBookParkingPlacesCreate, {
        settings: {
          size: "600px",
        },
      });
    }
    if (
      v?.split("/").includes(EDrawerContent.ReferenceBookDowntimeReasonCreate)
    ) {
      openDrawer(EDrawerContent.ReferenceBookDowntimeReasonCreate, {
        settings: {
          size: "600px",
        },
      });
    }
    if (
      v?.split("/").includes(EDrawerContent.ReferenceBookDowntimeReasonDetails)
    ) {
      openDrawer(EDrawerContent.ReferenceBookDowntimeReasonDetails, {
        settings: {
          size: "600px",
        },
      });
    }
    if (
      v?.split("/").includes(EDrawerContent.ReferenceBookVehicleGroupCreate)
    ) {
      openDrawer(EDrawerContent.ReferenceBookVehicleGroupCreate, {
        settings: {
          size: "600px",
        },
      });
    }
    if (
      v?.split("/").includes(EDrawerContent.ReferenceBookVehicleGroupDetails)
    ) {
      openDrawer(EDrawerContent.ReferenceBookVehicleGroupDetails, {
        settings: {
          size: "600px",
        },
      });
    }
    if (v?.split("/").includes(EDrawerContent.ReferenceBookEquipmentCreate)) {
      openDrawer(EDrawerContent.ReferenceBookEquipmentCreate, {
        settings: {
          size: "700px",
        },
      });
    }
    if (v?.split("/").includes(EDrawerContent.ReferenceBookEquipmentDetails)) {
      openDrawer(EDrawerContent.ReferenceBookEquipmentDetails, {
        settings: {
          size: "700px",
        },
      });
    }
    if (v?.split("/").includes(EDrawerContent.ReferenceBookCheckExtraCreate)) {
      openDrawer(EDrawerContent.ReferenceBookCheckExtraCreate, {
        settings: {
          size: "700px",
        },
      });
    }
    if (v?.split("/").includes(EDrawerContent.ReferenceBookCheckExtraDetails)) {
      openDrawer(EDrawerContent.ReferenceBookCheckExtraDetails, {
        settings: {
          size: "700px",
        },
      });
    }
    if (
      v
        ?.split("/")
        .includes(EDrawerContent.ReferenceBookInspectionsScheduleCreate)
    ) {
      openDrawer(EDrawerContent.ReferenceBookInspectionsScheduleCreate, {
        settings: {
          size: "700px",
        },
      });
    }
    if (
      v
        ?.split("/")
        .includes(EDrawerContent.ReferenceBookInspectionsScheduleDetails)
    ) {
      openDrawer(EDrawerContent.ReferenceBookInspectionsScheduleDetails, {
        settings: {
          size: "700px",
        },
      });
    }
    if (v?.split("/").includes(EDrawerContent.ReferenceBookConditionCreate)) {
      openDrawer(EDrawerContent.ReferenceBookConditionCreate, {
        settings: {
          size: "760px",
        },
      });
    }
    if (v?.split("/").includes(EDrawerContent.ReferenceBookConditionDetails)) {
      openDrawer(EDrawerContent.ReferenceBookConditionDetails, {
        settings: {
          size: "760px",
        },
      });
    }
    if (v?.split("/").includes(EDrawerContent.ReferenceBookRolesCreate)) {
      openDrawer(EDrawerContent.ReferenceBookRolesCreate, {
        settings: {
          size: "700px",
        },
      });
    }
    if (v?.split("/").includes(EDrawerContent.ReferenceBookRolesDetails)) {
      openDrawer(EDrawerContent.ReferenceBookRolesDetails, {
        settings: {
          size: "700px",
        },
      });
    }
    if (v?.split("/").includes(EDrawerContent.ReferenceBookUsersCreate)) {
      openDrawer(EDrawerContent.ReferenceBookUsersCreate, {
        settings: {
          size: "700px",
        },
      });
    }
    if (v?.split("/").includes(EDrawerContent.ReferenceBookUsersDetails)) {
      openDrawer(EDrawerContent.ReferenceBookUsersDetails, {
        settings: {
          size: "700px",
        },
      });
    }
    if (v?.split("/").includes(EDrawerContent.CompaniesCounterpartyCreate)) {
      openDrawer(EDrawerContent.CompaniesCounterpartyCreate, {
        settings: {
          size: "700px",
        },
      });
    }
    if (v?.split("/").includes(EDrawerContent.CompaniesCounterpartyDetails)) {
      openDrawer(EDrawerContent.CompaniesCounterpartyDetails, {
        settings: {
          size: "700px",
        },
      });
    }
    if (
      v?.split("/").includes(EDrawerContent.ReferenceBookCashRegistersCreate)
    ) {
      openDrawer(EDrawerContent.ReferenceBookCashRegistersCreate, {
        settings: {
          size: "600px",
        },
      });
    }
    if (
      v?.split("/").includes(EDrawerContent.ReferenceBookCashRegistersDetails)
    ) {
      openDrawer(EDrawerContent.ReferenceBookCashRegistersDetails, {
        settings: {
          size: "600px",
        },
      });
    }
    if (
      v
        ?.split("/")
        .includes(EDrawerContent.ReferenceBookInspectionProfileCreate)
    ) {
      openDrawer(EDrawerContent.ReferenceBookInspectionProfileCreate, {
        settings: {
          size: "600px",
        },
      });
    }
    if (
      v
        ?.split("/")
        .includes(EDrawerContent.ReferenceBookInspectionProfileDetails)
    ) {
      openDrawer(EDrawerContent.ReferenceBookInspectionProfileDetails, {
        settings: {
          size: "600px",
        },
      });
    }
    if (v?.split("/").includes(EDrawerContent.PrintableFormsInfo)) {
      openDrawer(EDrawerContent.PrintableFormsInfo, {
        settings: {
          size: "600px",
        },
      });
    }
    if (v?.split("/").includes(EDrawerContent.ReportsRent)) {
      openDrawer(EDrawerContent.ReportsRent, {
        settings: {
          size: "600px",
        },
      });
    }
    if (v?.split("/").includes(EDrawerContent.ReportsBalanceOperations)) {
      openDrawer(EDrawerContent.ReportsBalanceOperations, {
        settings: {
          size: "600px",
        },
      });
    }
    if (v?.split("/").includes(EDrawerContent.ReportsVehicle)) {
      openDrawer(EDrawerContent.ReportsVehicle, {
        settings: {
          size: "700px",
        },
      });
    }
    if (v?.split("/").includes(EDrawerContent.ReportsFines)) {
      openDrawer(EDrawerContent.ReportsFines, {
        settings: {
          size: "700px",
        },
      });
    }
    if (v?.split("/").includes(EDrawerContent.IntegrationsCreate)) {
      openDrawer(EDrawerContent.IntegrationsCreate, {
        settings: {
          size: "600px",
        },
      });
    }
    if (v?.split("/").includes(EDrawerContent.IntegrationsDetails)) {
      openDrawer(EDrawerContent.IntegrationsDetails, {
        settings: {
          size: "600px",
        },
      });
    }
    if (v?.split("/").includes(EDrawerContent.IntegrationTransactionsDetails)) {
      openDrawer(EDrawerContent.IntegrationTransactionsDetails, {
        settings: {
          size: "600px",
        },
      });
    }
    if (
      v?.split("/").includes(EDrawerContent.IntegrationTransactionsOrderDetails)
    ) {
      openDrawer(EDrawerContent.IntegrationTransactionsOrderDetails, {
        settings: {
          size: "600px",
        },
      });
    }
    // if (v?.split("/").includes(EDrawerContent.AdjustmentsApplicationsUpdate)) {
    //   openDrawer(EDrawerContent.AdjustmentsApplicationsUpdate, {
    //   });
    // }
    // if (v?.split("/").includes(EDrawerContent.AdjustmentsApplicationsDetails)) {
    //   openDrawer(EDrawerContent.AdjustmentsApplicationsDetails, {
    //     settings: {
    //       size: "600px",
    //     },
    //   });
    // }
  },
  { deep: true, immediate: true }
);
</script>

<template>
  <el-container class="h-screen main-layout">
    <div
      class="absolute top-0 left-0 w-full h-24"
      style="
        background: linear-gradient(
          90.98deg,
          #a562ff 1.39%,
          #7d30e5 6.69%,
          #a562ff 12.83%
        );
      "
    ></div>
    <el-aside v-if="mdAndLarger" class="z-50 w-fit flex h-fit overflow-hidden">
      <AppMenu />
      <div id="sidebar"></div>
    </el-aside>

    <el-container
      :class="[
        'relative bg-white rounded-t-2xl mt-2 mr-2',
        isDashboard ? '!bg-[#edeff3] pt-[58px]' : '',
      ]"
    >
      <transition name="el-fade-in-linear">
        <NotificationsSidebar v-if="isDisplayNotifications" />
      </transition>

      <el-header id="header" />

      <el-main>
        <el-scrollbar>
          <router-view />
        </el-scrollbar>
      </el-main>

      <UiDrawer />

      <!-- mobile menu drawer -->
      <el-drawer
        v-model="mobileMenuDrawerVisible"
        class="mobile-drawer"
        direction="ltr"
        :with-header="false"
        :size="250"
        @close="closeMobileMenuDrawer"
      >
        <div class="absolute -right-10 top-4 z-40">
          <el-icon
            class="cursor-pointer"
            color="#F5F7FA"
            :size="32"
            @click="closeMobileMenuDrawer"
            ><Close
          /></el-icon>
        </div>
        <AppMenu />
      </el-drawer>
      <!-- <div
        v-if="isDashboard"
        class="w-full h-auto absolute -bottom-0 flex items-center justify-center"
      >
        <img width="1172" src="@/assets/images/car_dashboard.png" alt="" />
      </div> -->
    </el-container>
  </el-container>
</template>

<style scoped>
.main-layout .el-header {
  @apply max-md:min-h-24 flex p-4 md:px-6 items-center justify-between gap-6;
}
.main-layout .el-main {
  @apply px-4 md:px-6 py-0;
}

:deep(.mobile-drawer.el-drawer) {
  overflow: visible;
}
:deep(.mobile-drawer .el-drawer__body) {
  padding: 0;
}
</style>
