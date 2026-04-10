<script setup lang="ts">
import { storeToRefs } from "pinia";
import { useMounted } from "@vueuse/core";
import { ref, watch, computed, onMounted } from "vue";
import { ElNotification, type Sort } from "element-plus";

import { useHelpers } from "@/composables/useHelpers";
import { useAppStore } from "@/stores/appStore";
import { Download } from "@element-plus/icons-vue";

import UiSearch from "@/components/ui/UiSearch.vue";
import TableRepair from "@/components/tables/TableRepair.vue";
import {
  ESortDirection,
  type IRepair,
  type IRepairPaginatedParams,
} from "@/types/repairs";
import type { TRepairMethod, TRepairType } from "@/types/repairs";
import { useRepairsStore } from "@/stores/repairsStore";

const initialRepairParams: IRepairPaginatedParams = {
  limit: 20,
  page: 1,
  start_date: undefined,
  end_date: undefined,
  search: "",
  repair_methods: [],
  repair_types: [],
  order_by: undefined,
  direction: undefined,
  repair_statuses: [],
};

const isMounted = useMounted();
const { dateKeydownMask } = useHelpers();
const { setRepairCreateHash, setRepairDetailsHash } = useAppStore();
const { fetchList, detailRequest, downloadRepairs } = useRepairsStore();
const { list, listTotalItems, updateResult, listLoading } =
  storeToRefs(useRepairsStore());
fetchList();

const daterange = ref([]);
const pageFilters = ref({
  ...initialRepairParams,
});

interface IRepairStatusOption {
  label: string;
  key: string;
}
const statusOptions: IRepairStatusOption[] = [
  {
    label: "Заявка",
    key: "NEW",
  },
  {
    label: "Ожидание",
    key: "PENDING",
  },
  {
    label: "В работе",
    key: "IN_PROGRESS",
  },
  {
    label: "Стоянка",
    key: "PARKING",
  },
  {
    label: "Выполнен",
    key: "DONE",
  },
  {
    label: "Закрыт",
    key: "CANCELED",
  },
];

interface IRepairMethodOption {
  label: string;
  key: TRepairMethod;
}
const methodOptions: IRepairMethodOption[] = [
  {
    label: "Собственная ремонтная зона",
    key: "OWN_REPAIR_ZONE",
  },
  {
    label: "Ремонт (замена) водителем",
    key: "REPAIR_BY_DRIVER",
  },
  {
    label: "В автосервисе",
    key: "REPAIR_BY_SERVICE",
  },
];

interface IRepairTypeOption {
  label: string;
  key: TRepairType;
}
const typeOptions: IRepairTypeOption[] = [
  {
    label: "Плановое ТО",
    key: "SCHEDULED",
  },
  {
    label: "Внеплановое ТО",
    key: "UNSCHEDULED",
  },
];

watch(daterange, (v) => {
  if (v?.length) {
    pageFilters.value.start_date = v[0];
    pageFilters.value.end_date = v[1];
  } else {
    pageFilters.value.start_date = undefined;
    pageFilters.value.end_date = undefined;
  }
});
watch(
  [pageFilters],
  ([filtersV]) => {
    if (filtersV) {
      fetchList(pageFilters.value);
    }
  },
  {
    immediate: true,
    deep: true,
  },
);
watch(updateResult, (v) => {
  if (v?.id) {
    clearFilters();
  }
});

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

const downloadRepairHandler = async () => {
  downloadRepairs(pageFilters.value);
};

function displayDetail(row: IRepair) {
  setRepairDetailsHash(row.id);
}
const clearFilters = () => {
  pageFilters.value = { ...initialRepairParams };
  daterange.value = [];
};
</script>

<template>
  <Teleport v-if="isMounted" to="#header">
    <div class="flex justify-between items-center w-full">
      <div class="text-md text-nowrap text-xl">
        {{ "Ремонт" }}
      </div>

      <div>
        <el-button type="primary" @click="setRepairCreateHash">{{
          "Новый ремонт"
        }}</el-button>
        <el-button type="default" @click="downloadRepairHandler">
          <el-icon><Download /></el-icon>
        </el-button>
      </div>
    </div>
  </Teleport>

  <div class="flex items-center justify-between">
    <el-form class="flex gap-3" label-position="top">
      <el-form-item label="Поиск">
        <UiSearch
          v-model="pageFilters.search"
          class="w-[153px]"
          :placeholder="'Поиск'"
        />
      </el-form-item>

      <el-form-item label="Статус ремонта">
        <el-select
          v-model="pageFilters.repair_statuses"
          class="w-[170px]"
          placeholder="Статус ремонта"
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

      <el-form-item label="Способ ремонта">
        <el-select
          v-model="pageFilters.repair_methods"
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
      </el-form-item>

      <el-form-item label="Вид ремонта">
        <el-select
          v-model="pageFilters.repair_types"
          style="width: 151px"
          placeholder="Не выбран"
          clearable
          multiple
          collapse-tags
        >
          <el-option
            v-for="item in typeOptions"
            :key="item.key"
            :label="item.label"
            :value="item.key"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="Период">
        <el-date-picker
          :clearable="false"
          v-model="daterange"
          class="max-w-[210px]"
          type="daterange"
          start-placeholder="Начало"
          end-placeholder="Конец"
          value-format="YYYY-MM-DD"
          format="DD.MM.YYYY"
          @keydown="dateKeydownMask"
        >
          <template #range-separator>до</template>
        </el-date-picker>
      </el-form-item>

      <!-- <el-form-item :label="` `">
          <el-select style="width: 147px">
            <el-option v-for="item in []" :label="item" :value="item" />
          </el-select>
        </el-form-item> -->
    </el-form>

    <el-link :underline="false" @click="clearFilters">Сбросить всё</el-link>
  </div>

  <TableRepair
    v-model:pagination="pageFilters"
    v-loading="listLoading"
    class="h-[calc(100vh-148px)] flex flex-col pb-5"
    :items="list"
    :totalItems="listTotalItems"
    :table-sort="tableSort"
    :sortable-columns="['created_at', 'services_sum', 'total_sum', 'items_sum']"
    :empty-text="'Ремонты не добавлены'"
    :rowClassName="'cursor-pointer'"
    :loading="false"
    border
    with-pagination
    @row-click="displayDetail"
    @sort-change="onSortChange"
  />
</template>

<style scoped></style>
