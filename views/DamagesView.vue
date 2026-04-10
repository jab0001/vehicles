<script setup lang="ts">
import { useMounted } from "@vueuse/core";
import { storeToRefs } from "pinia";
import { ref, watch } from "vue";

import { useAppStore } from "@/stores/appStore";
import { useDamagesStore } from "@/stores/damagesStore";

import type { IDamage } from "@/types/damages";

import TableDamages from "@/components/tables/TableDamages.vue";
import { useUserAbility } from "@/composables/useUser";
import { useAppBreakpoints } from "@/composables/useApp";
import UiMobileMenuButton from "@/components/ui/UiMobileMenuButton.vue";
import UiSearch from "@/components/ui/UiSearch.vue";
import { formatDateToServer } from "@/helpers/format.helpers";
import type { Sort } from "element-plus";
import { ESortDirection } from "@/types/drivers";
import { useHelpers } from "@/composables/useHelpers";

const datetimeTypes: {
  name: string;
  key: string;
}[] = [
  { name: "дата ввода", key: "created_at" },
  { name: "дата события", key: "event_time" },
];

const isMounted = useMounted();
const { setDamageCreateHash, setDamageDetailsHash } = useAppStore();
const {
  fetchDamagesList,
  initialDamagesParams,
  damageStatuses,
  damageTypes,
  damageCulprits,
} = useDamagesStore();
const { dateKeydownMask } = useHelpers();
const {
  damagesList,
  damagesListTotalItems,
  damagesListLoading,
  newDamage,
  updateDamageResponse,
} = storeToRefs(useDamagesStore());
const { can } = useUserAbility();
const { mdAndLarger } = useAppBreakpoints();
const pageFilters = ref({ ...initialDamagesParams });
const daterange = ref("");

watch(daterange, (v) => {
  if (v?.length) {
    pageFilters.value.start_date = formatDateToServer(v[0]);
    pageFilters.value.end_date = formatDateToServer(v[1]);
  } else {
    pageFilters.value.start_date = undefined;
    pageFilters.value.end_date = undefined;
  }
});

watch(
  [pageFilters, newDamage, updateDamageResponse],
  ([filtersV, newDamageV, updDamageV]) => {
    if (filtersV || newDamageV || updDamageV) {
      fetchDamagesList(pageFilters.value);
    }
  },
  {
    immediate: true,
    deep: true,
  }
);

const onSortChange = (v: Sort) => {
  if (!v.order || !v.prop) {
    const next = { ...pageFilters.value, page: 1 };
    delete (next as any).order_by;
    delete (next as any).direction;
    pageFilters.value = next;
    return;
  }

  pageFilters.value = {
    ...pageFilters.value,
    order_by: String(v.prop),
    direction: v.order === "ascending" ? ESortDirection.asc : ESortDirection.desc,
    page: 1,
  };
};

const onRowClick = (rowItem: IDamage) => {
  setDamageDetailsHash(rowItem.id);
};

const clearFilters = () => {
  pageFilters.value = {
    ...initialDamagesParams,
  };
  daterange.value = "";
};
</script>

<template>
  <Teleport v-if="isMounted" to="#header">
    <div class="flex justify-between items-center w-full">
      <div class="flex items-center gap-4">
        <UiMobileMenuButton v-if="!mdAndLarger" />
        <div class="text-md text-nowrap text-xl">
          {{ "Ущербы" }}
        </div>
      </div>

      <el-button
        v-if="can('create', 'Damage')"
        type="primary"
        @click="setDamageCreateHash"
        >{{ "Добавить ущерб" }}</el-button
      >
    </div>
  </Teleport>

  <div class="flex justify-between items-center w-full gap-3">
    <div class="flex items-end gap-3 w-full">
      <div class="flex flex-col gap-2">
        <p class="text-sm">Поиск</p>
        <UiSearch
          v-model="pageFilters.search"
          class="flex-grow max-w-[200px]"
          :placeholder="'Поиск'"
        />
      </div>
      <div class="flex flex-col gap-2">
        <p class="text-sm">Статус</p>
        <el-select
          v-model="pageFilters.statuses"
          class="w-40"
          placeholder="Не выбран"
          clearable
          multiple
          collapse-tags
        >
          <el-option
            v-for="item in damageStatuses"
            :key="item.key"
            :label="item.label"
            :value="item.key"
          />
        </el-select>
      </div>
      <div class="flex flex-col gap-2">
        <p class="text-sm">Тип ущерба</p>
        <el-select
          v-model="pageFilters.damage_types"
          class="w-40"
          placeholder="Не выбран"
          clearable
          multiple
          collapse-tags
        >
          <el-option
            v-for="item in damageTypes"
            :key="item.key"
            :label="item.label"
            :value="item.key"
          />
        </el-select>
      </div>
      <div class="flex flex-col gap-2">
        <p class="text-sm">Виновник</p>
        <el-select
          v-model="pageFilters.culprits"
          class="w-40"
          placeholder="Не выбран"
          clearable
          multiple
          collapse-tags
        >
          <el-option
            v-for="item in damageCulprits"
            :key="item.key"
            :label="item.label"
            :value="item.key"
          />
        </el-select>
      </div>
      <div class="flex flex-col gap-2">
        <p class="text-sm">Период</p>
        <el-date-picker
          v-model="daterange"
          class="max-w-[310px]"
          type="daterange"
          start-placeholder="Начало"
          end-placeholder="Конец"
          value-format="YYYY-MM-DD"
          format="DD.MM.YYYY"
          @keydown="dateKeydownMask"
        >
          <template #range-separator>до</template>
        </el-date-picker>
      </div>
      <el-select v-model="pageFilters.period_type" style="width: 147px">
        <el-option
          v-for="item in datetimeTypes"
          :label="item.name"
          :value="item.key"
        />
      </el-select>
      <el-link class="ml-auto" :underline="false" @click="clearFilters"
        >Сбросить всё</el-link
      >
    </div>
  </div>

  <TableDamages
    v-model:pagination="pageFilters"
    v-loading="damagesListLoading"
    class="h-[calc(100vh-96px)] md:h-[calc(100vh-70px)] flex flex-col pb-5 pt-5"
    :display-columns="[
      'created_at',
      'status',
      'certificate_number',
      'vehicle.plate_number',
      'vehicle.brand.brand',
      'vehicle.car_model.car_model',
      'cost',
      'payed_sum',
      'reason',
      'place',
      'driver',
      'damage_type',
      'culprit',
      'event_time',
    ]"
    :sortable-columns="['created_at', 'event_time', 'payed_sum', 'cost']"
    :items="damagesList"
    :totalItems="damagesListTotalItems"
    :empty-text="'Ущербы не найдены'"
    :rowClassName="'cursor-pointer'"
    :loading="damagesListLoading"
    :size="mdAndLarger ? 'default' : 'small'"
    border
    with-pagination
    @row-click="onRowClick"
    @sort-change="onSortChange"
  />
</template>

<style scoped></style>
