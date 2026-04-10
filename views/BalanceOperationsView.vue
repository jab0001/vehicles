<script setup lang="ts">
import { onMounted, ref, watch } from "vue";
import { useMounted } from "@vueuse/core";
import { storeToRefs } from "pinia";

import { useAppStore } from "@/stores/appStore";
import { useBalanceOperationsStore } from "@/stores/balanceOperationsStore";

import type { IBalanceOperationDetails } from "@/types/balanceOperations";
import type { IDriver } from "@/types/drivers";

import TableBalanceOperations from "@/components/tables/TableBalanceOperations.vue";
import AutocompleteDriver from "@/components/autocomplete/AutocompleteDriver.vue";
import type { Sort } from "element-plus";
import { useHelpers } from "@/composables/useHelpers";
import { useUser, useUserAbility } from "@/composables/useUser";
import { useDriverBalanceAggegateStore } from "@/stores/driversStore";

const isMounted = useMounted();
const { fetchPublicProfiles, public_profiles } = useUser();
const { operationCategoryFilterValue } = storeToRefs(
  useDriverBalanceAggegateStore()
);
const { setBalanceOperationsCreateHash, setBalanceOperationsDetailsHash } =
  useAppStore();
const {
  operations,
  newOperation,
  updateOperationResponse,
  operationsListLoading,
  operationsTotalItems,
} = storeToRefs(useBalanceOperationsStore());
const {
  initialOperationsParams,
  fetchBalanceOperations,
  getBalanceOperationType,
} = useBalanceOperationsStore();
const { dateKeydownMask } = useHelpers();
const { can } = useUserAbility();

const balanceOperationsType = {
  accrual: "Начисление",
  cash_register: "Кассовая операция",
};

const balanceOperationsCategory = {
  deposit: "Депозит",
  franchise: "Франшиза",
  rent: "Аренда",
  fine: "Штраф ГИБДД",
  damage: "Ущерб",
  toll_road: "Платные дороги",
  repayment_damage: "Долг по ущербам",
  repayment_franchise: "Долг по франшизе",
  redemption: "Выкуп",
  repayment_deposit: "Долг за депозит",
  unallocated_funds: "Внутренний баланс",
  other: "Прочее",
};

const pageFilters = ref({
  ...initialOperationsParams,
});
const search = ref("");
const daterange = ref([]);
const user_id = ref<number | undefined>(undefined);

watch(
  [pageFilters, newOperation, updateOperationResponse],
  ([filtersV, newOperationV, updateV]) => {
    if (filtersV || newOperationV || updateV) {
      fetchBalanceOperations(pageFilters.value);
    }
  },
  {
    immediate: true,
    deep: true,
  }
);

watch(user_id, (v) => {
  if (!v) {
    pageFilters.value.user_id = undefined;
  }
});

watch(search, (v) => {
  if (!v) {
    pageFilters.value.driver_id = undefined;
  }
});

watch(daterange, (v) => {
  if (v?.length) {
    pageFilters.value.date_from = v[0];
    pageFilters.value.date_to = v[1];
  } else {
    pageFilters.value.date_from = undefined;
    pageFilters.value.date_to = undefined;
  }
});

const handleDriverSelect = (v: IDriver) => {
  pageFilters.value.driver_id = v.id;
};
const handleCreatorSelect = (id: number) => {
  pageFilters.value.user_id = id;
};
const onRowClick = (rowItem: IBalanceOperationDetails) => {
  setBalanceOperationsDetailsHash(rowItem.id);
};
const onSortChange = (v: Sort) => {
  console.log({ v });
  pageFilters.value = {
    ...pageFilters.value,
    order_by: v.prop,
    direction: v.order === "ascending" ? "asc" : "desc",
  };
};
const clearFilters = () => {
  pageFilters.value = {
    ...initialOperationsParams,
  };
  daterange.value = [];
  user_id.value = undefined;
};

onMounted(() => {
  fetchPublicProfiles();
});
</script>

<template>
  <Teleport v-if="isMounted" to="#header">
    <div class="flex justify-between items-center w-full">
      <div class="text-md text-nowrap text-xl">
        {{ "Расчеты" }}
      </div>

      <el-button
        v-if="
          can('create', 'BalanceOperation') ||
          can('create', 'BalanceOperationCredit') ||
          can('create', 'BalanceOperationDeposit')
        "
        type="primary"
        @click="setBalanceOperationsCreateHash"
        >{{ "Создать операцию" }}</el-button
      >
    </div>
  </Teleport>

  <div class="flex justify-between items-center w-full gap-3">
    <div class="flex items-end gap-3 w-full">
      <div class="flex flex-col gap-2">
        <p class="text-sm">Поиск по водителю</p>
        <AutocompleteDriver
          v-model="search"
          clearable
          class="w-[200px]"
          placeholder="Выберите водителя"
          @handle-select="handleDriverSelect"
        />
      </div>

      <div class="flex flex-col gap-2">
        <p class="text-sm">По виду операции</p>
        <el-select
          v-model="pageFilters.operation_type"
          placeholder="не выбран"
          class="w-40"
          clearable
        >
          <el-option
            v-for="(name, type) in balanceOperationsType"
            :key="type"
            :label="name"
            :value="type"
          />
        </el-select>
      </div>

      <div class="flex flex-col gap-2">
        <p class="text-sm">По статье</p>
        <el-select
          v-model="pageFilters.operation_category"
          placeholder="не выбрана"
          class="w-40"
          clearable
        >
          <el-option
            v-for="(name, type) in balanceOperationsCategory"
            :key="type"
            :label="name"
            :value="type"
          />
        </el-select>
      </div>

      <div class="flex flex-col gap-2">
        <p class="text-sm">Поиск по создателю</p>
        <el-select
          v-model="user_id"
          class="w-[190px]"
          filterable
          clearable
          placeholder="Создатель операции"
          @change="handleCreatorSelect"
        >
          <el-option
            v-for="item in public_profiles"
            :key="item.user_id"
            :label="`${item.last_name} ${item.first_name} ${item.middle_name}`"
            :value="item.user_id"
          />
        </el-select>
      </div>

      <el-date-picker
        :clearable="false"
        v-model="daterange"
        class="max-w-[280px]"
        type="daterange"
        start-placeholder="Начало"
        end-placeholder="Конец"
        value-format="YYYY-MM-DD"
        format="DD.MM.YYYY"
        @keydown="dateKeydownMask"
      >
        <template #range-separator>до</template>
      </el-date-picker>

      <el-link :underline="false" @click="clearFilters">Сбросить всё</el-link>
    </div>
  </div>

  <TableBalanceOperations
    v-model:pagination="pageFilters"
    v-loading="operationsListLoading"
    class="h-[calc(100vh-130px)] flex flex-col pb-5 pt-5"
    :items="operations"
    :totalItems="operationsTotalItems"
    :empty-text="'Расчеты не проводились'"
    :rowClassName="'cursor-pointer'"
    :loading="operationsListLoading"
    border
    with-pagination
    @row-click="onRowClick"
    @sort-change="onSortChange"
  />
</template>

<style scoped></style>
