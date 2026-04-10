<script setup lang="ts">
import { ref } from "vue";
import { storeToRefs } from "pinia";
import { onClickOutside } from "@vueuse/core";
import { useRouter, useRoute } from "vue-router";
import {
  Setting,
  User,
  Postcard,
  CreditCard,
  View,
  Wallet,
  Edit,
  Clock,
  Switch,
  Box,
  Tickets,
  Operation,
  Odometer,
  Refresh,
  Download,
  Upload,
  Finished,
  Bell,
  Document,
  Suitcase,
  Notebook,
  Memo,
  DataAnalysis,
  Notification,
  PieChart,
  ArrowDown,
} from "@element-plus/icons-vue";

import { useUserStore } from "@/stores/userStore";
import { useAppStore } from "@/stores/appStore";
import { useCompaniesManagementStore } from "@/stores/companiesManagementStore";
import { useUserAbility } from "@/composables/useUser";

import IconWarehouse from "@/components/icons/IconWarehouse.vue";
import IconHighWay from "@/components/icons/IconHighWay.vue";
import IconCar from "@/components/icons/IconCar.vue";
import IconDamage from "@/components/icons/IconDamage.vue";
import IconOnLine from "@/components/icons/IconOnLine.vue";
import IconSettings from "@/components/icons/IconSettings.vue";
import { useAuth } from "@/composables/UseAuth";
import IconDashboard from "@/components/icons/IconDashboard.vue";
import { getUserFullname } from "@/helpers/fullname.helpers";
import { useAppBreakpoints } from "@/composables/useApp";
import IconAggregators from "../icons/IconAggregators.vue";

const router = useRouter();
const route = useRoute();
const { isDisplayNotifications } = storeToRefs(useAppStore());
const { companyGroupName } = storeToRefs(useCompaniesManagementStore());
const { userProfile } = storeToRefs(useUserStore());
const { can } = useUserAbility();
const { closeMobileMenuDrawer, showNotifications, hideNotifications } =
  useAppStore();
const { removeToken } = useAuth();
const { getFullName, getUserRole } = useUserStore();
const { mdAndLarger } = useAppBreakpoints();

const target = ref(null);
type SubmenuType = "stocks" | "settings" | "releases";
const openSubmenu = ref<SubmenuType | null>(null);

const isActive = (index: string) => {
  return route.name === index;
};

const toggleSubmenu = (submenuName: SubmenuType) => {
  openSubmenu.value = submenuName;
};

const goToPage = (pageName: string) => {
  if (
    pageName === "stocks" ||
    pageName === "settings" ||
    pageName === "releases"
  ) {
    toggleSubmenu(pageName);
  } else {
    router.push({ name: pageName });
    closeMobileMenuDrawer();
  }
};

const onStatusSelect = async (command: string) => {
  if (command === "profile") {
    router.push({ name: "Profile" });
  } else if (command === "logout") {
    logout();
  }
};

const logout = () => {
  removeToken();
  router.push({ name: "Login" });
};

onClickOutside(target, () => (openSubmenu.value = null));

const sections = ref<Record<string, boolean>>({
  releases: false,
  vehicles: false,
  balances: false,
  repairs: false,
  reports: false,
});

const toggleSection = (key: keyof typeof sections.value) => {
  sections.value[key] = !sections.value[key];
};
</script>

<template>
  <div class="flex w-fit h-lvh">
    <el-menu
      class="min-h-full w-[250px] flex flex-col justify-between nav bg-transparent border-none"
      :default-active="route.name ? (route.name as string) : ''"
      @select="(pageName: string) => goToPage(pageName)"
    >
      <div class="h-full flex flex-col">
        <div class="flex flex-col p-5 px-2">
          <div class="flex justify-between items-center">
            <svg
              class="pl-2"
              width="144"
              height="24"
              viewBox="0 0 144 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M0 0.553823H21.8424V4.09957H13.1922V23.44H8.6501V4.09957H0V0.553823Z"
                fill="white"
                fill-opacity="0.6"
              />
              <path
                d="M23.7286 23.44H18.9526L29.4062 0.553823H34.5161L44.9363 23.44H40.1938L37.8226 17.8957H26.0998L23.7286 23.44ZM30.9759 6.54935L27.4691 14.6723H36.4198L32.9464 6.54935C32.6458 5.84021 32.2451 4.80872 31.9779 3.90616H31.9111C31.6439 4.80872 31.2431 5.84021 30.9759 6.54935Z"
                fill="white"
                fill-opacity="0.6"
              />
              <path
                d="M46.5089 16.1873V12.7383H59.7346V16.1873H46.5089Z"
                fill="white"
                fill-opacity="0.6"
              />
              <path
                d="M64.3474 0.553823H76.3707C81.681 0.553823 85.0542 3.32595 85.0542 7.67755C85.0542 12.1581 81.5808 14.9947 76.1035 14.9947H68.8896V23.44H64.3474V0.553823ZM68.8896 11.7068H75.4356C78.408 11.7068 80.2449 10.224 80.2449 7.77425C80.2449 5.32446 78.4414 3.87393 75.4356 3.87393H68.8896V11.7068Z"
                fill="white"
                fill-opacity="0.6"
              />
              <path
                d="M93.3349 23.9235C89.1935 23.9235 86.5551 22.0862 86.5551 19.0884C86.5551 17.5734 87.223 16.284 88.5256 15.4782C89.7279 14.7368 91.3644 14.2533 94.5372 13.9632L100.682 13.4797V13.1251C100.682 10.772 99.1461 9.64382 96.3073 9.64382C93.5019 9.64382 91.7986 10.7075 91.5314 12.6094H87.0894C87.4902 9.09584 90.997 6.83946 96.2739 6.83946C102.185 6.83946 104.957 9.03137 104.957 13.6731V18.2503C104.957 20.6679 105.091 22.1506 105.392 23.44H101.117C100.95 22.6019 100.883 21.5382 100.849 20.5067C99.6805 22.6664 97.0755 23.9235 93.3349 23.9235ZM94.771 21.1514C98.3112 21.1514 100.749 19.4107 100.749 16.6708V15.8005L95.0048 16.3163C92.0323 16.6386 90.9636 17.38 90.9636 18.8628C90.9636 20.3133 92.3663 21.1514 94.771 21.1514Z"
                fill="white"
                fill-opacity="0.6"
              />
              <path
                d="M113.843 7.32297V11.5779C114.745 8.7735 116.983 6.90393 120.089 6.90393C120.556 6.90393 120.89 6.90393 121.291 6.9684V10.8042C120.824 10.7398 120.456 10.7075 119.955 10.7075C118.018 10.7075 116.749 11.2233 115.814 12.0936C114.511 13.3507 114.211 15.1881 114.211 17.1221V23.44H109.969V7.32297H113.843Z"
                fill="white"
                fill-opacity="0.6"
              />
              <path
                d="M143.119 23.44H138.109L132.632 15.7361L128.725 18.7983V23.44H124.483V0.0703125H128.725V14.7046L137.274 7.32297H142.752L135.805 13.3507L143.119 23.44Z"
                fill="white"
                fill-opacity="0.6"
              />
            </svg>
            <svg
              class="cursor-pointer"
              width="34"
              height="34"
              viewBox="0 0 34 34"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              @click="
                () =>
                  isDisplayNotifications
                    ? hideNotifications()
                    : showNotifications()
              "
            >
              <path
                d="M20.25 25.125C20.2499 25.9869 19.9073 26.8134 19.2979 27.4229L19.1816 27.5342C18.5854 28.0741 17.8081 28.375 17 28.375V26.9307C17.392 26.9307 17.7698 26.8014 18.0801 26.5693H15.9199C16.2302 26.8014 16.608 26.9307 17 26.9307V28.375L16.8389 28.3711C16.0891 28.3339 15.3748 28.0381 14.8184 27.5342L14.7021 27.4229C14.0927 26.8134 13.7501 25.9869 13.75 25.125H20.25ZM23.6738 15.0869C23.6113 13.6487 23.0861 12.266 22.1719 11.1475C21.1967 9.95439 19.8391 9.13531 18.3291 8.82812L17.0488 8.56738L17.1797 7.26758V7.23047C17.1783 7.21796 17.1758 7.20538 17.1719 7.19336C17.164 7.16943 17.1507 7.14759 17.1338 7.12891C17.1169 7.11021 17.0963 7.09519 17.0732 7.08496C17.0616 7.0798 17.0495 7.07584 17.0371 7.07324L17 7.06934C16.9748 7.06934 16.9498 7.07473 16.9268 7.08496C16.9037 7.09519 16.8831 7.11021 16.8662 7.12891C16.8493 7.14759 16.836 7.16943 16.8281 7.19336C16.8203 7.21718 16.8179 7.24262 16.8203 7.26758L16.9512 8.57031L15.668 8.82812C12.6168 9.44246 10.3193 12.1431 10.3193 15.375V22.0557H23.6807V15.375L23.6738 15.0869ZM25.125 21.5498H26.5879C26.8463 21.5499 27.0946 21.6522 27.2773 21.835C27.4601 22.0177 27.5624 22.266 27.5625 22.5244L27.5576 22.6211C27.5355 22.8441 27.4371 23.0539 27.2773 23.2139L27.2051 23.2793C27.0564 23.401 26.8749 23.4762 26.6836 23.4951L26.5879 23.5H7.41211L7.31641 23.4951C7.12514 23.4762 6.94364 23.401 6.79492 23.2793L6.72266 23.2139C6.54005 23.0311 6.4375 22.7828 6.4375 22.5244C6.4376 22.266 6.5399 22.0177 6.72266 21.835C6.88271 21.6749 7.09311 21.5768 7.31641 21.5547L7.41211 21.5498H8.875V15.375C8.875 11.4426 11.6698 8.15971 15.3828 7.41211C15.3658 7.24267 15.3762 7.07201 15.4121 6.90625L15.4561 6.74219C15.5092 6.5806 15.5876 6.42883 15.6875 6.29199L15.7949 6.16016C15.9092 6.03385 16.0424 5.92641 16.1895 5.8418L16.3408 5.76465C16.5484 5.67254 16.7729 5.625 17 5.625C17.2271 5.625 17.4516 5.67254 17.6592 5.76465C17.8667 5.85677 18.0527 5.99175 18.2051 6.16016C18.3573 6.32848 18.473 6.5266 18.5439 6.74219C18.6149 6.95784 18.6398 7.18623 18.6172 7.41211C20.4535 7.78567 22.1041 8.78253 23.29 10.2334C24.476 11.6844 25.1244 13.501 25.125 15.375V21.5498Z"
                fill="white"
              />
            </svg>
          </div>
          <div class="bg-white rounded-full flex gap-2 px-3 py-2 mt-6">
            <el-dropdown
              @command="onStatusSelect"
              class="w-full"
              v-if="mdAndLarger"
            >
              <el-link
                size="default"
                class="px-0 py-0 border-none w-full justify-between custom-link"
                :underline="false"
              >
                {{ getFullName(userProfile) }}
                <el-icon class="ml-2"><ArrowDown /></el-icon>
              </el-link>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="profile">Профиль</el-dropdown-item>
                  <el-dropdown-item command="logout">Выйти</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>

            <div
              v-else
              class="text-sm text-black whitespace-nowrap overflow-hidden text-ellipsis"
            >
              {{
                // @ts-ignore
                getFullName({
                  profile: userProfile,
                }) == ""
                  ? getUserRole(userProfile)
                  : getFullName({ profile: userProfile })
              }}
            </div>
          </div>
          <div v-if="mdAndLarger" class="text-xs text-[#909399] mx-auto mt-1">
            {{ getUserRole(userProfile) }}
          </div>
        </div>

        <div class="flex-1 overflow-auto">
          <el-menu-item
            v-if="can('read', 'Dashboard') && mdAndLarger"
            index="Dashboard"
          >
            <span class="w-6 flex justify-center mr-1">
              <IconDashboard :active="isActive('Dashboard')" />
            </span>
            <span>{{ $t("nav.dashboard") }}</span>
          </el-menu-item>
          <!-- <el-menu-item
            v-if="mdAndLarger"
            class="select-none mb-3"
            @click="
              () =>
                isDisplayNotifications
                  ? hideNotifications()
                  : showNotifications()
            "
          >
            <el-icon><Bell /></el-icon>
            <span>{{ $t("nav.notifications") }}</span>
          </el-menu-item> -->
          <el-menu-item @click="toggleSection('releases')">
            <span class="w-6 flex justify-center mr-1">
              <IconOnLine />
            </span>
            <span>{{ "Выпуски на линию" }}</span>
            <el-icon class="ml-auto"
              ><ArrowDown :class="{ 'rotate-180': sections.releases }"
            /></el-icon>
          </el-menu-item>

          <template v-if="sections.releases">
            <el-menu-item v-if="can('read', 'OnLine')" index="ReleasesLines">
              <el-icon><!-- <Notification /> --></el-icon>
              {{ $t("nav.lines.now") }}
            </el-menu-item>
            <el-menu-item
              v-if="can('read', 'OnLine') && mdAndLarger"
              index="ReleasesDriversGroup"
            >
              <el-icon><!-- <Refresh /> --></el-icon>
              {{ $t("nav.lines.changes") }}
            </el-menu-item>
            <el-menu-item
              v-if="can('read', 'Downtime') && mdAndLarger"
              index="Downtime"
            >
              <span>
                <el-icon>
                  <!-- <Clock /> -->
                </el-icon>
              </span>
              <span>{{ "В простое" }}</span>
            </el-menu-item>
          </template>

          <el-menu-item @click="toggleSection('vehicles')">
            <span class="w-6 flex justify-center mr-1">
              <IconCar />
            </span>
            <span>{{ "Транспортный отдел" }}</span>
            <el-icon class="ml-auto"
              ><ArrowDown :class="{ 'rotate-180': sections.vehicles }"
            /></el-icon>
          </el-menu-item>

          <template v-if="sections.vehicles">
            <el-menu-item
              v-if="can('read', 'Vehicle') && mdAndLarger"
              index="Vehicles"
            >
              <el-icon><!-- <Notification /> --></el-icon>
              <span>{{ $t("nav.vehicles") }}</span>
            </el-menu-item>
            <el-menu-item v-if="can('read', 'Inspection')" index="inspections">
              <span>
                <el-icon>
                  <!-- <View /> -->
                </el-icon>
              </span>
              <span>{{ $t("nav.inspections") }}</span>
            </el-menu-item>
            <el-menu-item v-if="can('read', 'Damage')" index="Damages">
              <el-icon>
                <!-- <IconDamage /> -->
              </el-icon>
              <span>{{ $t("nav.damages") }}</span>
            </el-menu-item>
            <el-menu-item
              v-if="can('read', 'Vehicle') && mdAndLarger"
              index="WorkingShifts"
            >
              <el-icon><!-- <Notification /> --></el-icon>
              <span>{{ $t("nav.workingShifts") }}</span>
            </el-menu-item>
            <el-menu-item
              v-if="can('read', 'Vehicle') && mdAndLarger"
              index="SalaryStatements"
            >
              <el-icon><!-- <Notification /> --></el-icon>
              <span>{{ $t("nav.salaryStatements") }}</span>
            </el-menu-item>
            <el-menu-item
              v-if="can('read', 'Vehicle') && mdAndLarger"
              index="Insurances"
            >
              <el-icon><!-- <Notification /> --></el-icon>
              <span>{{ $t("nav.insurances") }}</span>
            </el-menu-item>
          </template>

          <el-menu-item
            v-if="can('read', 'Driver') && mdAndLarger"
            index="Drivers"
          >
            <el-icon><User /></el-icon>
            <span>{{ $t("nav.drivers") }}</span>
          </el-menu-item>

          <el-menu-item @click="toggleSection('balances')">
            <span class="w-6 flex justify-center mr-1">
              <el-icon><Wallet /></el-icon>
            </span>
            <span>{{ "Денежные средства" }}</span>
            <el-icon class="ml-auto"
              ><ArrowDown :class="{ 'rotate-180': sections.balances }"
            /></el-icon>
          </el-menu-item>

          <template v-if="sections.balances">
            <el-menu-item
              v-if="can('read', 'BalanceOperation') && mdAndLarger"
              index="BalanceOperations"
            >
              <el-icon><!-- <Wallet /> --></el-icon>
              <span>{{ $t("nav.balanceOperations") }}</span>
            </el-menu-item>
            <el-menu-item
              v-if="mdAndLarger"
              index="LeasingPayments"
            >
              <el-icon><!-- <Wallet /> --></el-icon>
              <span>{{ $t("nav.leasingPayments") }}</span>
            </el-menu-item>
            <el-menu-item
              v-if="can('read', 'BalanceOperationOrder') && mdAndLarger"
              index="Applications"
            >
              <el-icon><!-- <Edit /> --></el-icon>
              <span>{{ "Корректировки" }}</span>
            </el-menu-item>
            <el-menu-item
              v-if="can('read', 'TollRoad') && mdAndLarger"
              index="TollRoads"
            >
              <el-icon><!-- <IconHighWay /> --></el-icon>
              <span>{{ $t("nav.tollRoads") }}</span>
            </el-menu-item>
            <el-menu-item
              v-if="can('read', 'Fine') && mdAndLarger"
              index="Fines"
            >
              <el-icon><!-- <Postcard /> --></el-icon>
              <span>{{ $t("nav.fines") }}</span>
            </el-menu-item>
          </template>

          <el-menu-item @click="toggleSection('repairs')">
            <span class="w-6 flex justify-center mr-1">
              <el-icon><Odometer /></el-icon>
            </span>
            <span>{{ "Ремонты и ТО" }}</span>
            <el-icon class="ml-auto"
              ><ArrowDown :class="{ 'rotate-180': sections.repairs }"
            /></el-icon>
          </el-menu-item>

          <template v-if="sections.repairs">
            <el-menu-item
              v-if="can('read', 'Repair') && mdAndLarger"
              index="Repair"
            >
              <el-icon><!-- <Setting /> --></el-icon>
              <span>{{ $t("nav.repair") }}</span>
            </el-menu-item>
            <el-menu-item
              v-if="can('read', 'Maintenance') && mdAndLarger"
              index="Maintenance"
            >
              <el-icon><!-- <Odometer /> --></el-icon>
              <span>{{ $t("nav.maintenance") }}</span>
            </el-menu-item>
            <el-menu-item
              v-if="can('read', 'Stock') && mdAndLarger"
              index="stocks"
              @click="toggleSubmenu('stocks')"
            >
              <el-icon><!-- <Box /> --></el-icon>
              <span>{{ $t("nav.stocks.warehouses") }}</span>
            </el-menu-item>
          </template>

          <el-menu-item @click="toggleSection('reports')">
            <span class="w-6 flex justify-center mr-1">
              <el-icon><DataAnalysis /></el-icon>
            </span>
            <span>{{ "Отчеты и формы" }}</span>
            <el-icon class="ml-auto"
              ><ArrowDown :class="{ 'rotate-180': sections.reports }"
            /></el-icon>
          </el-menu-item>

          <template v-if="sections.reports">
            <el-menu-item
              v-if="can('read', 'Reports') && mdAndLarger"
              index="Reports"
            >
              <el-icon><!-- <DataAnalysis /> --></el-icon>
              <span>{{ "Отчеты для печати" }}</span>
            </el-menu-item>
            <el-menu-item
              v-if="can('read', 'PrintableForm') && mdAndLarger"
              index="PrintableForms"
            >
              <el-icon><!-- <Document /> --></el-icon>
              <span>{{ $t("nav.printableForms") }}</span>
            </el-menu-item>
          </template>

          <el-menu-item
            v-if="can('read', 'Setting') && mdAndLarger"
            index="settings"
            @click="toggleSubmenu('settings')"
          >
            <el-icon><Operation /></el-icon>
            <span>{{ $t("nav.settings.settings") }}</span>
          </el-menu-item>
          <el-menu-item v-if="!mdAndLarger" @click="logout">
            <el-icon>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
                class="size-5 stroke-black"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75"
                />
              </svg>
            </el-icon>
            <span>Выйти</span>
          </el-menu-item>
        </div>
      </div>
      <!-- <div class="flex flex-col p-5">
        <span class="text-sm">{{ companyGroupName?.name }}</span>
      </div> -->
    </el-menu>
    <div
      v-if="openSubmenu"
      ref="target"
      class="flex flex-col bg-[#FAFAFA] w-52 h-full mt-[96px]"
    >
      <template v-if="openSubmenu === 'stocks'">
        <div class="flex items-center font-medium text-sm h-12 px-5">
          {{ $t("nav.stocks.warehouses") }}
        </div>
        <el-menu
          class="bg-transparent"
          :default-active="route.name ? (route.name as string) : ''"
          @select="(pageName: string) => goToPage(pageName)"
        >
          <el-menu-item index="StocksMoving">
            <el-icon><Switch /></el-icon>
            {{ $t("nav.stocks.moving") }}
          </el-menu-item>
          <el-menu-item index="StocksReceipt">
            <el-icon><Download /></el-icon>
            {{ $t("nav.stocks.receipt") }}
          </el-menu-item>
          <el-menu-item index="StocksPosting">
            <el-icon><Refresh /></el-icon>
            {{ $t("nav.stocks.posting") }}
          </el-menu-item>
          <el-menu-item class="mb-3" index="StocksWriteOff">
            <el-icon><Upload /></el-icon>
            {{ $t("nav.stocks.writeoff") }}
          </el-menu-item>
          <el-menu-item index="StocksNomenclature">
            <el-icon><Tickets /></el-icon>
            {{ $t("nav.stocks.nomenclature") }}
          </el-menu-item>
          <el-menu-item index="StocksStorages">
            <el-icon>
              <IconWarehouse :active="isActive('StocksStorages')" />
            </el-icon>
            {{ $t("nav.stocks.storages") }}
          </el-menu-item>
          <el-menu-item index="StocksCostItems">
            <el-icon><Finished /></el-icon>
            {{ $t("nav.stocks.costitems") }}
          </el-menu-item>
          <el-menu-item index="StocksBalance">
            <el-icon><PieChart /></el-icon>
            {{ $t("nav.stocks.balance") }}
          </el-menu-item>
        </el-menu>
      </template>

      <template v-else-if="openSubmenu === 'settings'">
        <div class="flex items-center font-medium text-sm h-12 px-5">
          {{ $t("nav.settings.settings") }}
        </div>
        <el-menu
          class="bg-transparent"
          :default-active="route.name ? (route.name as string) : ''"
          @select="(pageName: string) => goToPage(pageName)"
        >
          <el-menu-item index="Companies">
            <el-icon><Suitcase /></el-icon>
            <span>{{ $t("nav.settings.companies") }}</span>
          </el-menu-item>
          <el-menu-item index="Counterparty">
            <el-icon><Notebook /></el-icon>
            <span>{{ $t("nav.settings.counterparty") }}</span>
          </el-menu-item>
          <el-menu-item index="SystemSettings">
            <el-icon
              ><IconSettings :active="isActive('SystemSettings')"
            /></el-icon>
            <span>{{ $t("nav.settings.systemSettings") }}</span>
          </el-menu-item>
          <el-menu-item index="PaymentTerminals">
            <el-icon
              ><CreditCard :active="isActive('PaymentTerminals')"
            /></el-icon>
            <span>{{ $t("nav.settings.paymentTerminals") }}</span>
          </el-menu-item>
          <el-menu-item index="Integrations">
            <el-icon><IconAggregators /></el-icon>
            <span>Интеграции</span>
          </el-menu-item>
          <el-menu-item class="mb-3" index="DriverNotificationsSettings">
            <el-icon
              ><Bell
                :style="{
                  color: isActive('DriverNotificationsSettings')
                    ? '#A562FF'
                    : '#303133',
                }"
            /></el-icon>
            <span>Уведомл. водителям</span>
          </el-menu-item>
          <div class="h-5 px-5 text-[#909399] text-xs">Справочники</div>
          <el-menu-item class="!h-8" index="ReferenceBookTransactions">
            <span>Транзакции</span>
          </el-menu-item>
          <el-menu-item class="!h-8" index="ReferenceBookOrders">
            <span>Заказы из агрегаторов</span>
          </el-menu-item>
          <el-menu-item
            v-if="can('read', 'User')"
            class="!h-8"
            index="ReferenceUsers"
          >
            <span>Пользователи</span>
          </el-menu-item>
          <el-menu-item
            v-if="can('read', 'Role')"
            class="!h-8"
            index="ReferenceRoles"
          >
            <span>Роли</span>
          </el-menu-item>
          <el-menu-item class="!h-8" index="ReferenceBookDismissal">
            <span>{{ $t("nav.referenceBook.dismissal") }}</span>
          </el-menu-item>
          <el-menu-item class="!h-8" index="ReferenceBookRent">
            <span>{{ $t("nav.referenceBook.rent") }}</span>
          </el-menu-item>
          <el-menu-item class="!h-8" index="ReferenceBookInspectionProfiles">
            <span>Профили осмотров</span>
          </el-menu-item>
          <el-menu-item class="!h-8" index="ReferenceBookExtraEquip">
            <span>{{ $t("nav.referenceBook.extraEquip") }}</span>
          </el-menu-item>
          <el-menu-item class="!h-8" index="ReferenceBookParkingPlaces">
            <span>{{ $t("nav.referenceBook.parkingPlaces") }}</span>
          </el-menu-item>
          <el-menu-item class="!h-8" index="ReferenceBookDowntime">
            <span>{{ "Вид простоя" }}</span>
          </el-menu-item>
          <el-menu-item class="!h-8" index="ReferenceBookCashRegisters">
            <span>{{ "Кассы" }}</span>
          </el-menu-item>
          <el-menu-item class="!h-8" index="ReferenceBookCheckExtra">
            <span>{{ $t("nav.referenceBook.checkExtra") }}</span>
          </el-menu-item>
          <el-menu-item class="!h-8" index="ReferenceBookEquipment">
            <span>{{ $t("nav.referenceBook.equipment") }}</span>
          </el-menu-item>
          <el-menu-item class="!h-8" index="ReferenceBookInspectionsSchedule">
            <span>{{
              $t("nav.referenceBook.technicalInspectionsSchedule")
            }}</span>
          </el-menu-item>
          <el-menu-item class="!h-8" index="ReferenceBookVehicleGroups">
            <span>{{ $t("nav.referenceBook.vehicleGroups") }}</span>
          </el-menu-item>
          <el-menu-item
            class="!h-8 items-center"
            index="ReferenceBookConditions"
          >
            <el-tooltip
              effect="light"
              placement="right"
              :show-after="150"
              :content="$t('nav.referenceBook.conditions')"
            >
              <span class="flex-1 min-w-0 truncate">
                {{ $t("nav.referenceBook.conditions") }}
              </span>
            </el-tooltip>
          </el-menu-item>
        </el-menu>
      </template>

      <template v-if="openSubmenu === 'releases'">
        <div class="flex items-center font-medium text-sm h-12 px-5">
          {{ $t("nav.lines.lines") }}
        </div>
        <el-menu
          class="bg-transparent"
          :default-active="route.name ? (route.name as string) : ''"
          @select="(pageName: string) => goToPage(pageName)"
        >
          <el-menu-item index="ReleasesLines">
            <el-icon><Notification /></el-icon>
            {{ $t("nav.lines.now") }}
          </el-menu-item>
          <el-menu-item index="ReleasesDriversGroup">
            <el-icon><Refresh /></el-icon>
            {{ $t("nav.lines.changes") }}
          </el-menu-item>
          <!-- <el-menu-item index="StocksReceipt">
            <el-icon><Download /></el-icon>
            {{ $t("nav.lines.history") }}
          </el-menu-item> -->
        </el-menu>
      </template>
    </div>
  </div>
</template>

<style scoped>
:deep(.el-menu-item) {
  height: 40px;
}

:deep(.el-sub-menu) {
  height: 40px;
}

:deep(.el-sub-menu__title) {
  height: 100%;
}

:deep(.custom-link .el-link__inner) {
  width: 100%;
  display: flex;
  justify-content: space-between;
}
</style>
