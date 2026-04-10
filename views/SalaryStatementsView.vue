<script setup lang="ts">
import { useMounted } from "@vueuse/core";
import { computed, ref, watch } from "vue";

import TableSalaryStatements from "@/components/tables/TableSalaryStatements.vue";
import { useSalaryStatementsStore } from "@/stores/salaryStatementsStore";
import { storeToRefs } from "pinia";
import { useAppStore } from "@/stores/appStore";
import { useHelpers } from "@/composables/useHelpers";
import dayjs from "dayjs";
import type { Sort } from "element-plus";
import { ESortDirection } from "@/types/salaryStatements";

const {
  setSalaryStatementsCreateHash,
  setSalaryStatementsDetailsHash,
  setSalaryStatementsDriverDetailsHash,
} = useAppStore();

const { fetchStatementList } = useSalaryStatementsStore();

const {
  statementList,
  statementListTotalPages,
  statementListParams,
  statementListLoading,

  updateStatementStatusResponse,
  recalculateStatementResponse,
} = storeToRefs(useSalaryStatementsStore());

const isMounted = useMounted();
const { dateKeydownMask } = useHelpers();
const daterange = ref([]);
const pageFilters = ref({
  ...statementListParams.value,
});

const statusOptions = [
  {
    label: "На выплату",
    key: "PENDING",
  },
  {
    label: "Выплачено",
    key: "PAID",
  },
  {
    label: "Аннулировано",
    key: "CANCELED",
  },
];

watch(daterange, (v) => {
  if (v?.length) {
    pageFilters.value.start_date = dayjs(v[0]).startOf("month").format("YYYY-MM-DD");
    pageFilters.value.end_date = dayjs(v[1]).endOf("month").format("YYYY-MM-DD");
  } else {
    pageFilters.value.start_date = undefined;
    pageFilters.value.end_date = undefined;
  }
});
watch(
  [
    pageFilters,
    updateStatementStatusResponse,
    recalculateStatementResponse,
  ],
  async ([vParams, vStatementUpdate, vRecalculate]) => {
    if (vParams || vStatementUpdate || vRecalculate) {
      await fetchStatementList(pageFilters.value);
    }
  },
  {
    immediate: true,
    deep: true,
  }
);

const clearFilters = () => {
  pageFilters.value = { ...statementListParams.value };
  daterange.value = [];
};

const createSalaryStatement = () => {
  setSalaryStatementsCreateHash();
};

const handleDownload = (v: any) => {
  setSalaryStatementsDetailsHash(v.id);
};

const handleDriverStatement = (v: any) => {
  setSalaryStatementsDriverDetailsHash(v.salary_statement_id, v.id);
};

const tableSort = computed<Sort>(() => {
  if (
    pageFilters.value.order_by &&
    (pageFilters.value.direction === "asc" ||
      pageFilters.value.direction === "desc")
  ) {
    return {
      prop: pageFilters.value.order_by,
      order: pageFilters.value.direction === "asc" ? "ascending" : "descending",
    };
  }
  return {
    prop: "",
    order: "ascending",
  };
});

const onSortChange = (v: Sort) => {
  pageFilters.value = {
    ...pageFilters.value,
    order_by: v.prop,
    direction:
      v.order === "ascending" ? ESortDirection.asc : ESortDirection.desc,
  };
};
</script>

<template>
  <Teleport v-if="isMounted" to="#header">
    <div class="w-full flex justify-between items-center mx-auto">
      <div class="text-md text-nowrap text-xl">
        {{ "Зарплатные ведомости штатных сотрудников" }}
      </div>

      <div class="flex gap-3">
        <el-button type="primary" @click="createSalaryStatement">{{
          "Сформировать"
        }}</el-button>
      </div>
    </div>
  </Teleport>

  <div class="flex items-center justify-between">
    <el-form class="flex gap-3" label-position="top">
      <!-- <el-form-item label="Поиск">
        <UiSearch
          v-model="pageFilters.search"
          class="w-[153px]"
          :placeholder="'Поиск'"
        />
      </el-form-item> -->

      <el-form-item label="Статус">
        <el-select
          v-model="pageFilters.status"
          class="w-[170px]"
          placeholder="Статус"
          clearable
          multiple
          collapse-tags
        >
          <el-option
            v-for="item in statusOptions"
            :key="item.key"
            :label="item.label"
            :value="item.key"
          />
        </el-select>
      </el-form-item>

      <!-- <el-form-item label="Способ ремонта">
        <el-select
          v-model="pageFilters.type"
          style="width: 151px"
          placeholder="Не выбран"
          clearable
          multiple
          collapse-tags
        >
          <el-option
            v-for="item in methodOptions"
            :key="item.key"
            :label="item.label"
            :value="item.key"
          />
        </el-select>
      </el-form-item> -->

      <el-form-item label="Период">
        <el-date-picker
          :clearable="false"
          v-model="daterange"
          class="max-w-[210px]"
          type="monthrange"
          start-placeholder="Начало"
          end-placeholder="Конец"
          value-format="YYYY-MM-DD"
          format="DD.MM.YYYY"
          @keydown="dateKeydownMask"
        >
          <template #range-separator>до</template>
        </el-date-picker>
      </el-form-item>
    </el-form>

    <el-link :underline="false" @click="clearFilters">Сбросить всё</el-link>
  </div>

  <TableSalaryStatements
    v-model:pagination="pageFilters"
    v-loading="statementListLoading"
    class="h-[calc(100vh-148px)] flex flex-col pb-5"
    :items="statementList"
    :totalItems="statementListTotalPages"
    :empty-text="'Зарплатные ведомости не формировались'"
    :rowClassName="'cursor-pointer'"
    :loading="false"
    :table-sort="tableSort"
    :size="`small`"
    border
    with-pagination
    @handle-download="handleDownload"
    @row-click="handleDriverStatement"
    @sort-change="onSortChange"
  />
</template>
