<script setup lang="ts">
import { onMounted, ref, watch, computed, onUnmounted } from "vue";
import { useIntegrationTransactions } from "@/composables/useIntegrationTransactions";
import { useDebounceFn, useMounted } from "@vueuse/core";
import SelectCompanies from "@/components/select/SelectCompanies.vue";
import { useAppStore } from "@/stores/appStore";
import { storeToRefs } from "pinia";
import { useSalaryStatementsStore } from "@/stores/salaryStatementsStore";

const { setIntegrationTransactionsDetailsHash } = useAppStore();

const { filteredStatementTransactionListId } = storeToRefs(
  useSalaryStatementsStore(),
);

const {
  transactionsFilters,
  fetchTransactionsLoading,
  fetchTransactions,
  transactions,
  transactionsTotalItems,
} = useIntegrationTransactions();

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
  transactionsFilters.value.search = search.value;
  transactionsFilters.value.page = 1;
  fetchTransactions();
}, 500);

const clearFilters = () => {
  search.value = "";
  daterange.value = undefined;
  transactionsFilters.value = {
    page: 1,
    limit: 20,
  };
  fetchTransactions();
};

const handleRowClick = (row: any) => {
  setIntegrationTransactionsDetailsHash(row.id);
};

watch(
  () => transactionsFilters.value.page,
  () => {
    fetchTransactions();
  },
);

watch(
  () => transactionsFilters.value.limit,
  () => {
    transactionsFilters.value.page = 1;
    fetchTransactions();
  },
);

watch(
  () => transactionsFilters.value.integration_type,
  () => {
    transactionsFilters.value.page = 1;
    fetchTransactions();
  },
);

watch(
  () => transactionsFilters.value.payment_method,
  () => {
    transactionsFilters.value.page = 1;
    fetchTransactions();
  },
);

watch(
  () => transactionsFilters.value.company_id,
  () => {
    transactionsFilters.value.page = 1;
    fetchTransactions();
  },
);

watch(
  () => transactionsFilters.value.order_related,
  () => {
    transactionsFilters.value.page = 1;
    if (transactionsFilters.value.order_related === "") {
      transactionsFilters.value = {
        ...transactionsFilters.value,
        order_related: undefined,
      };
    }
    fetchTransactions();
  },
);

watch(daterange, (newVal) => {
  if (newVal && newVal.length === 2) {
    transactionsFilters.value.start_date = newVal[0];
    transactionsFilters.value.end_date = newVal[1];
  } else {
    transactionsFilters.value.start_date = undefined;
    transactionsFilters.value.end_date = undefined;
  }
  transactionsFilters.value.page = 1;
  fetchTransactions();
});

watch(
  () => filteredStatementTransactionListId.value,
  (id) => {
    if (!id) return;

    transactionsFilters.value.not_matched_in_salary_statement_id = id;
    transactionsFilters.value.page = 1;

    fetchTransactions();
  },
  { immediate: true },
);

const isMounted = useMounted();

onMounted(() => {
  if (!filteredStatementTransactionListId.value) {
    fetchTransactions();
  }
});

onUnmounted(() => {
  filteredStatementTransactionListId.value = null;
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
        {{ "Транзакции" }}
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
            v-model="transactionsFilters.integration_type"
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

        <el-form-item label="Привязка смены" class="w-[120px]">
          <el-select
            v-model="transactionsFilters.order_related"
            placeholder="Не выбран"
            clearable
          >
            <el-option label="С сменой" :value="true" />
            <el-option label="Без смены" :value="false" />
            <el-option label="Все" :value="''" />
          </el-select>
        </el-form-item>

        <!-- <el-form-item label="Вид оплаты" class="w-[176px]">
          <el-select
            v-model="transactionsFilters.payment_method"
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
        </el-form-item> -->

        <el-form-item label="Организация" class="w-[120px]">
          <SelectCompanies v-model="transactionsFilters.company_id" />
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
      v-loading="fetchTransactionsLoading"
      :data="transactions"
      class="flex-1"
      border
      :empty-text="'Транзакции не найдены'"
      @row-click="handleRowClick"
      style="cursor: pointer"
    >
      <el-table-column prop="id" label="ID транзакции" width="120" />
      <el-table-column prop="integration_id" label="№ интеграции" width="120" />
      <el-table-column label="Дата загрузки" width="180">
        <template #default="{ row }">
          {{ formatDate(row.created_at) }}
        </template>
      </el-table-column>
      <el-table-column label="Дата" width="180">
        <template #default="{ row }">
          {{ formatDate(row.transaction_datetime) }}
        </template>
      </el-table-column>
      <el-table-column prop="driver_id" label="ID водителя" width="120" />
      <el-table-column
        prop="driver_full_name"
        label="Водитель"
        min-width="200"
      />
      <el-table-column label="Вид операции" width="150">
        <template #default="{ row }">
          {{ row.transaction_type }}
        </template>
      </el-table-column>
      <el-table-column label="Смена" width="100">
        <template #default="{ row }">
          {{ row.working_shift_record?.condition?.name || "—" }}
        </template>
      </el-table-column>
      <el-table-column prop="description" label="Комментарий" min-width="200" />
      <el-table-column label="Сумма, ₽" width="120" align="right">
        <template #default="{ row }">
          {{ formatAmount(row.amount) }}
        </template>
      </el-table-column>
    </el-table>

    <div class="flex justify-center py-4">
      <el-pagination
        v-model:current-page="transactionsFilters.page"
        v-model:page-size="transactionsFilters.limit"
        :total="transactionsTotalItems"
        layout="prev, pager, next"
      />
    </div>
  </div>
</template>
