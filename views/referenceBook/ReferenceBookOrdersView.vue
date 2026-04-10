<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from "vue";
import { useIntegrationOrders } from "@/composables/useIntegrationOrders";
import { useDebounceFn, useMounted } from "@vueuse/core";
import SelectCompanies from "@/components/select/SelectCompanies.vue";
import { useAppStore } from "@/stores/appStore";
import { storeToRefs } from "pinia";
import { useSalaryStatementsStore } from "@/stores/salaryStatementsStore";

const { setIntegrationTransactionsOrderDetailsHash } = useAppStore();

const { filteredStatementOrdersListId } = storeToRefs(useSalaryStatementsStore());

const {
  ordersFilters,
  fetchOrdersLoading,
  fetchOrders,
  orders,
  ordersTotalItems,
} = useIntegrationOrders();

const search = ref("");
const daterange = ref<[string, string] | undefined>(undefined);

const integrationTypes = {
  YANDEX: "Яндекс",
};

const paymentMethods: Record<string, string> = {
  cash: "Наличные",
  cashless: "Безналичные",
  card: "Карта",
  internal: "Внутренний",
  corp: "Счет",
  prepaid: "Предоплата",
  other: "Прочее",
};

const debouncedSearch = useDebounceFn(() => {
  ordersFilters.value.search = search.value;
  ordersFilters.value.page = 1;
  fetchOrders(ordersFilters.value);
}, 500);

const clearFilters = () => {
  search.value = "";
  daterange.value = undefined;
  ordersFilters.value = {
    page: 1,
    limit: 20,
  };
  fetchOrders(ordersFilters.value);
};

const handleRowClick = (row: any) => {
  setIntegrationTransactionsOrderDetailsHash(row.id);
};

watch(
  () => ordersFilters.value.page,
  () => {
    fetchOrders(ordersFilters.value);
  },
);

watch(
  () => ordersFilters.value.limit,
  () => {
    ordersFilters.value.page = 1;
    fetchOrders(ordersFilters.value);
  },
);

watch(
  () => ordersFilters.value.integration_type,
  () => {
    ordersFilters.value.page = 1;
    fetchOrders(ordersFilters.value);
  },
);

watch(
  () => ordersFilters.value.payment_method,
  () => {
    ordersFilters.value.page = 1;
    fetchOrders(ordersFilters.value);
  },
);

watch(
  () => ordersFilters.value.company_id,
  () => {
    ordersFilters.value.page = 1;
    fetchOrders(ordersFilters.value);
  },
);

watch(
  () => filteredStatementOrdersListId.value,
  (id) => {
    if (!id) return;

    ordersFilters.value.not_matched_in_salary_statement_id = id;
    ordersFilters.value.page = 1;

    fetchOrders(ordersFilters.value);
  },
  { immediate: true },
);

watch(daterange, (newVal) => {
  if (newVal && newVal.length === 2) {
    ordersFilters.value.start_date = newVal[0];
    ordersFilters.value.end_date = newVal[1];
  } else {
    ordersFilters.value.start_date = undefined;
    ordersFilters.value.end_date = undefined;
  }
  ordersFilters.value.page = 1;
  fetchOrders(ordersFilters.value);
});

const isMounted = useMounted();

onMounted(() => {
  if (!filteredStatementOrdersListId.value) {
    fetchOrders(ordersFilters.value);
  }
});

onUnmounted(() => {
  filteredStatementOrdersListId.value = null;
});

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleString("ru-RU");
};

const formatAmount = (amount: string) => {
  return `${parseFloat(amount).toFixed(2)} ₽`;
};
</script>

<template>
  <Teleport v-if="isMounted" to="#header">
    <div class="w-full flex justify-between items-center">
      <div class="text-md text-nowrap text-xl">
        {{ "Заказы из агрегаторов" }}
      </div>
    </div>
  </Teleport>
  <div class="h-full flex flex-col">
    <div class="flex py-4 justify-between items-end gap-5">
      <el-form label-position="top" class="flex gap-3 items-end flex-wrap">
        <el-form-item label="Поиск">
          <el-input
            class="w-64"
            v-model="search"
            placeholder="Поиск по номеру, а/м и водителю"
            clearable
            @input="debouncedSearch"
          />
        </el-form-item>

        <el-form-item label="Агрегатор" class="w-[120px]">
          <el-select
            v-model="ordersFilters.integration_type"
            placeholder="Не выбран"
            clearable
          >
            <el-option
              v-for="(name, type) in integrationTypes"
              :key="type"
              :label="name"
              :value="type"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="Вид оплаты" class="w-[120px]">
          <el-select
            v-model="ordersFilters.payment_method"
            placeholder="Не выбран"
            clearable
          >
            <el-option
              v-for="(name, method) in paymentMethods"
              :key="method"
              :label="name"
              :value="method"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="Организация" class="w-[120px]">
          <SelectCompanies v-model="ordersFilters.company_id" />
        </el-form-item>

        <el-form-item label="Период" class="w-[279px]">
          <el-date-picker
            v-model="daterange"
            type="daterange"
            start-placeholder="Начало"
            end-placeholder="Конец"
            value-format="YYYY-MM-DD"
            format="DD.MM.YYYY"
            :clearable="true"
          >
            <template #range-separator>до</template>
          </el-date-picker>
        </el-form-item>

        <el-form-item label=" ">
          <el-link :underline="false" @click="clearFilters">
            Сбросить всё
          </el-link>
        </el-form-item>
      </el-form>
    </div>

    <el-table
      v-loading="fetchOrdersLoading"
      :data="orders"
      class="flex-1"
      border
      :empty-text="'Заказы не найдены'"
      @row-click="handleRowClick"
      style="cursor: pointer"
    >
      <el-table-column label="Дата" width="180">
        <template #default="{ row }">
          {{ formatDate(row.started_at) }}
        </template>
      </el-table-column>
      <el-table-column prop="id" label="Номер" width="120" />
      <el-table-column label="Агрегатор" width="150">
        <template #default="{ row }">
          {{ integrationTypes[row.integration_type as keyof typeof integrationTypes] }}
        </template>
      </el-table-column>
      <el-table-column
        prop="driver_full_name"
        label="Водитель"
        min-width="200"
      />
      <el-table-column label="Гос. номер" width="120">
        <template #default="{ row }">
          {{ row.vehicle_plate_number }}
        </template>
      </el-table-column>
      <el-table-column label="Марка" width="120">
        <template #default="{ row }">
          {{ row.vehicle_brand }}
        </template>
      </el-table-column>
      <el-table-column label="Модель" width="120">
        <template #default="{ row }">
          {{ row.vehicle_model }}
        </template>
      </el-table-column>
      <el-table-column label="Вид оплаты" width="150">
        <template #default="{ row }">
          {{ paymentMethods[row.payment_method] }}
        </template>
      </el-table-column>
      <el-table-column
        prop="company_name"
        label="Организация"
        min-width="200"
      />
      <el-table-column label="Смена" width="100">
        <template #default="{ row }">
          {{ row.working_shift_record?.condition?.name || "—" }}
        </template>
      </el-table-column>
      <el-table-column label="Наличными, ₽" width="120" align="right">
        <template #default="{ row }">
          {{ row.amount_cash ? formatAmount(row.amount_cash) : "—" }}
        </template>
      </el-table-column>
      <el-table-column label="Итого, ₽" width="120" align="right">
        <template #default="{ row }">
          {{ formatAmount(row.amount) }}
        </template>
      </el-table-column>
    </el-table>

    <div class="flex justify-center py-4">
      <el-pagination
        v-model:current-page="ordersFilters.page"
        v-model:page-size="ordersFilters.limit"
        :page-sizes="[20, 50, 100]"
        :total="ordersTotalItems"
        layout="prev, pager, next"
      />
    </div>
  </div>
</template>
