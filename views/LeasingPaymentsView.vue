<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useMounted } from "@vueuse/core";
import VehiclesLeasing from "@/components/vehicles/VehiclesLeasing.vue";
import { storeToRefs } from "pinia";
import { useUserStore } from "@/stores/userStore";
import {
  Warning,
  SuccessFilled,
  Clock,
  ArrowDown,
  ArrowUp,
} from "@element-plus/icons-vue";
import { useVehiclesLeasingsStore } from "@/stores/vehicles";
import { formatWithoutCurrency } from "@/helpers/format.helpers";
import UiEmptyItems from "@/components/ui/UiEmptyItems.vue";
import dayjs from "dayjs";

const isMounted = useMounted();
const height = ref(window.innerHeight);

const { userProfileLocalCurrencySymbol } = storeToRefs(useUserStore());

const { fetchLeasingsWidget, initLeasingContractsParams } = useVehiclesLeasingsStore();
const { vehicleLeasingsWidgetResponse, vehicleLeasingsWidgetLoading, leasingContractsParams } =
  storeToRefs(useVehiclesLeasingsStore());

const leasingOpen = ref(false);

const debt = computed(() =>
  vehicleLeasingsWidgetResponse.value?.late_contracts.reduce(
    (sum, p) => sum + Number(p.payment_periodic_amount),
    0
  )
);

const openLeasingContract = (contractId: number) => {
  leasingContractsParams.value = {
    ...initLeasingContractsParams,
    contracts_ids: [contractId],
  };
};

onMounted(async () => {
  window.addEventListener("resize", () => {
    height.value = window.innerHeight;
  });

  await fetchLeasingsWidget();
});
</script>

<template>
  <Teleport v-if="isMounted" to="#header">
    <div class="flex justify-between items-center w-full">
      <div class="text-md text-nowrap text-xl">
        {{ "Лизинговые договоры" }}
      </div>
    </div>
  </Teleport>

  <div
    v-loading="vehicleLeasingsWidgetLoading"
    v-if="vehicleLeasingsWidgetResponse"
  >
    <div class="relative mx-auto flex flex-col gap-2 pb-3">
      <section class="flex">
        <div class="w-full flex justify-between">
          <div class="w-full flex items-center gap-2">
            <div
              class="flex items-center justify-between px-5 w-[50%] h-[80px] border border-[--text-color-warning] bg-[--color-warning-light-8] rounded-[12px]"
            >
              <div class="flex flex-col">
                <p class="text-[14px] font-medium">
                  Нужно оплатить в этом месяце
                </p>
                <p class="text-[30px] text-[--text-color-warning] font-medium">
                  {{
                    formatWithoutCurrency(
                      vehicleLeasingsWidgetResponse?.need_to_pay ?? "0"
                    )
                  }}
                  {{ userProfileLocalCurrencySymbol }}
                </p>
              </div>
              <el-icon :size="45" class="text-[--text-color-warning]">
                <Warning />
              </el-icon>
            </div>
            <div
              class="flex items-center justify-between px-5 w-[50%] h-[80px] border border-[--text-color-success] bg-[#f2fcf4] rounded-[12px]"
            >
              <div class="flex flex-col">
                <p class="text-[14px] font-medium">Оплачено в в этом месяце</p>
                <p class="text-[30px] text-[--text-color-success] font-medium">
                  {{
                    formatWithoutCurrency(
                      vehicleLeasingsWidgetResponse?.current_month_payed ?? "0"
                    )
                  }}
                  {{ userProfileLocalCurrencySymbol }}
                </p>
              </div>
              <el-icon :size="45" class="text-[--text-color-success]">
                <SuccessFilled />
              </el-icon>
            </div>
          </div>
        </div>
      </section>
      <section class="flex">
        <div class="w-full flex justify-between">
          <div class="w-full flex items-center gap-2">
            <div
              class="flex-1 min-h-[90px] border border-[--text-color-secondary] bg-[#fff] rounded-[12px]"
            >
              <div class="flex flex-col items-center py-2 px-2">
                <p class="text-[18px] font-bold leading-none pb-[5px]">
                  Автомобилей в лизинге
                </p>
                <div class="flex gap-[5px]">
                  <div
                    class="flex flex-col items-center w-[100px] px-1 gap-2 font-bold text-[20px] text-[--text-color-success] leading-none py-1 px-1 bg-[#f2fcf4] rounded-[8px]"
                  >
                    {{ vehicleLeasingsWidgetResponse?.active_contracts ?? 0 }}
                    <p class="text-[14px] text-[--text-color-primary]">
                      Активных
                    </p>
                  </div>
                  <div
                    class="flex flex-col items-center w-[100px] px-1 gap-2 font-bold text-[20px] text-[#1d60ee] leading-none py-1 px-1 bg-[#eff6ff] rounded-[8px]"
                  >
                    {{ vehicleLeasingsWidgetResponse?.done_contracts ?? 0 }}
                    <p class="text-[14px] text-[--text-color-primary]">
                      Завершенных
                    </p>
                  </div>
                  <div
                    class="flex flex-col items-center w-[100px] px-1 gap-2 font-bold text-[20px] leading-none py-1 px-1 bg-[#f9fafc] rounded-[8px]"
                  >
                    {{ vehicleLeasingsWidgetResponse?.closed_contracts ?? 0 }}
                    <p class="text-[14px]">Закрытых</p>
                  </div>
                </div>
              </div>
            </div>
            <div
              class="flex-1 min-h-[90px] border border-[--text-color-success] bg-[#f2fcf4] rounded-[12px]"
            >
              <div class="flex flex-col justify-center py-2 px-2 gap-1">
                <p class="text-[18px] text-[--text-color-success] font-bold">
                  Выплачено
                </p>
                <p class="text-[20px] text-[--text-color-success] font-bold">
                  {{
                    formatWithoutCurrency(
                      vehicleLeasingsWidgetResponse?.paid ?? "0"
                    )
                  }}
                  {{ userProfileLocalCurrencySymbol }}
                </p>
              </div>
            </div>
            <div
              class="flex-1 min-h-[90px] border border-[--text-color-error] bg-[#fdf3f2] rounded-[12px]"
            >
              <div class="flex flex-col justify-center py-2 px-2 gap-1">
                <p class="text-[18px] text-[--text-color-error] font-bold">
                  Задолженность
                </p>
                <p class="text-[20px] text-[--text-color-error] font-bold">
                  {{ formatWithoutCurrency(debt) }}
                  {{ userProfileLocalCurrencySymbol }}
                </p>
              </div>
            </div>
            <div
              class="flex-1 min-h-[90px] border border-[--text-color-warning] bg-[--color-warning-light-8] rounded-[12px]"
            >
              <div class="flex flex-col justify-center py-2 px-2 gap-1">
                <p class="text-[18px] text-[--text-color-warning] font-bold">
                  Остаток по выплате
                </p>
                <p class="text-[20px] text-[--text-color-warning] font-bold">
                  {{
                    formatWithoutCurrency(
                      vehicleLeasingsWidgetResponse?.remains ?? "0"
                    )
                  }}
                  {{ userProfileLocalCurrencySymbol }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section class="flex">
        <div class="w-full flex justify-between">
          <div
            class="w-full flex items-center px-8 py-2 justify-between border border-[--text-color-warning] bg-[#fdf3f2] rounded-[12px]"
          >
            <div class="flex gap-3 items-center">
              <el-icon :size="30" class="text-[--text-color-warning]">
                <Clock />
              </el-icon>
              <div>
                <p class="text-[18px] font-bold text-[--text-color-warning]">
                  Приближающиеся платежи
                </p>
                <p
                  v-if="
                    Number(vehicleLeasingsWidgetResponse?.coming_contracts) ===
                    0
                  "
                  class="text-[14px] font-medium text-[--text-color-secondary]"
                >
                  Нет платежей в ближайшие 7 дней
                </p>
              </div>
            </div>
            <div class="flex flex-col">
              <p class="text-[14px] font-medium text-[--text-color-secondary]">
                К оплате в этом месяце
              </p>
              <p class="text-[25px] font-bold text-[--text-color-warning]">
                {{
                  formatWithoutCurrency(
                    vehicleLeasingsWidgetResponse?.coming_contracts ?? "0"
                  )
                }}
                {{ userProfileLocalCurrencySymbol }}
              </p>
            </div>
          </div>
        </div>
      </section>
      <section class="flex">
        <div class="w-full flex justify-between">
          <div
            class="w-full gap-1 px-8 py-2 flex flex-col border border-[--text-color-error] bg-[#fdf3f2] rounded-[12px]"
          >
            <div
              class="flex gap-3 items-center"
              @click="leasingOpen = !leasingOpen"
            >
              <el-icon :size="30" class="text-[--text-color-error]">
                <Warning />
              </el-icon>
              <div>
                <p class="text-[18px] font-bold text-[--text-color-error]">
                  Просрочки по платежам
                </p>
                <p
                  class="text-[14px] font-medium text-[--text-color-secondary]"
                >
                  Обнаружены просроченные платежи по
                  {{
                    vehicleLeasingsWidgetResponse?.late_contracts.length ?? 0
                  }}
                  договорам
                </p>
              </div>
              <el-icon :size="20" class="ml-auto">
                <ArrowDown v-if="!leasingOpen" />
                <ArrowUp v-else />
              </el-icon>
            </div>

            <div
              v-show="leasingOpen"
              class="custom-scroll flex flex-col gap-1 h-[150px] overflow-y-auto"
            >
              <div
                v-for="contract in vehicleLeasingsWidgetResponse?.late_contracts"
                :key="contract.id"
                class="bg-[#fff] rounded-[12px] flex justify-between items-center px-5 py-2"
              >
                <div class="flex flex-col">
                  <p class="text-[14px] font-bold">
                    {{ contract.vehicle.car_name }}
                    •
                    {{ contract.vehicle.plate_number }}
                  </p>
                  <p
                    class="text-[11px] font-medium text-[--text-color-secondary]"
                  >
                    Договор {{ contract.number }}
                  </p>
                </div>
                <div class="flex gap-3 items-center">
                  <div>
                    <p class="text-[14px] font-bold text-[--text-color-error] text-right">
                      {{ formatWithoutCurrency(contract.payment_periodic_amount ?? "0") }}
                      {{ userProfileLocalCurrencySymbol }}
                    </p>
                    <p
                      class="text-[11px] font-medium text-[--text-color-secondary] text-right"
                    >
                      {{ dayjs(contract.payment_periodic_date).format("DD MMMM YYYY") }}
                    </p>
                  </div>
                  <el-button
                    class="ml-auto"
                    type="default"
                    size="small"
                    @click="openLeasingContract(contract.id)"
                    >Открыть график</el-button
                  >
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
  <UiEmptyItems
    v-else
    :height="height - 200"
    text="Нет данных по статистике лизинговых договоров"
  />
  <VehiclesLeasing v-if="isMounted" :leasingPayments="true" />
</template>

<style scoped>
.custom-scroll::-webkit-scrollbar {
  width: 4px;
}

.custom-scroll::-webkit-scrollbar-track {
  background: #fff;
}

.custom-scroll::-webkit-scrollbar-thumb {
  background-color: #d9d9d9;
  border-radius: 10px;
}

.custom-scroll::-webkit-scrollbar-thumb:hover {
  background-color: #a0a0a0;
}
</style>
