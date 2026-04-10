<script setup lang="ts">
import { storeToRefs } from "pinia";
import { ref, watch, computed } from "vue";
import { Delete } from "@element-plus/icons-vue";

import { useUser } from "@/composables/useUser";
import { useStocksReceiptStore } from "@/stores/stocksStore";
import { formatDecimal, formatWithoutCurrency } from "@/helpers/format.helpers";
import { useStocksNomenclature } from "@/composables/useStocks";
import type { TNomenclatureType } from "@/types/stocks";

import UiDrawerWrapper from "@/components/ui/UiDrawerWrapper.vue";
import FormsStocksReceipt from "@/components/forms/FormsStocksReceipt.vue";
import ModalStocksItemAdd from "@/components/modals/ModalStocksItemAdd.vue";
import { useUserStore } from "@/stores/userStore";

interface IReceiptTab {
  key: TNomenclatureType;
  name: string;
}
const { userProfileLocalCurrencySymbol } = storeToRefs(useUserStore());
const { createReceiptOperation } = useStocksReceiptStore();
const {
  createReceiptOperationLoading,
  createReceiptOperationError,
  receiptForm,
} = storeToRefs(useStocksReceiptStore());
const { getNomenclatureVatRate } = useStocksNomenclature();
const modalVisible = ref(false);
const tableItems = ref<any>([]);
const tabs = ref<IReceiptTab[]>([
  {
    key: "ITEM",
    name: `Товары(0)`,
  },
  {
    key: "SERVICE",
    name: `Услуги(0)`,
  },
]);
const activeTab = ref(tabs.value[0].key);

watch(
  () => receiptForm.value.items?.length,
  (length) => {
    tabs.value[0].name = `Товары(${length})`;
  }
);
watch(
  () => receiptForm.value.services?.length,
  (length) => {
    tabs.value[1].name = `Услуги(${length})`;
  }
);

const filteredTableItems = computed(() => {
  if (activeTab.value === "SERVICE") {
    return tableItems.value.filter((n: any) => n.type === "SERVICE");
  }
  return tableItems.value.filter((n: any) => n.type === "ITEM");
});

const serviceAndItemsSum = computed(() => {
  const totalSum = tableItems.value.reduce(
    (acc: number, item: any) => {
      return acc + Number(item.totalPrice);
    },
    0
  );
  const totalSumWithVat = tableItems.value.reduce(
    (acc: number, item: any) => {
      return acc + Number(item.totalPrice) + Number(item.totalVatAmount);
    },
    0
  );
  return receiptForm.value.price_includes_vat
    ? totalSum
    : totalSumWithVat;
});

const totalSums = computed(() => {
  return filteredTableItems.value.reduce(
    (
      acc: { quantity: number; totalVatAmount: number; totalPrice: number },
      item: any
    ) => {
      return {
        quantity: acc.quantity + Number(item.count),
        totalVatAmount: acc.totalVatAmount + Number(item.totalVatAmount),
        totalPrice: acc.totalPrice + Number(item.totalPrice),
      };
    },
    { quantity: 0, totalVatAmount: 0, totalPrice: 0 }
  );
});

watch(tableItems, (v) => {
  receiptForm.value.items =
    v
      ?.filter((n: any) => n.type === "ITEM")
      ?.map((i: any) => ({
        nomenclature_id: i.id,
        quantity: i.count,
        vat_rate: i.vat_rate,
        price: i.price,
        vatAmount: i.vatAmount,
      })) ?? [];

  receiptForm.value.services =
    v
      ?.filter((n: any) => n.type === "SERVICE")
      ?.map((i: any) => ({
        nomenclature_id: i.id,
        quantity: i.count,
        vat_rate: i.vat_rate,
        price: i.price,
        vatAmount: i.vatAmount,
      })) ?? [];
});

const addTableItem = (item: any) => {
  tableItems.value = [item, ...tableItems.value];
};
const removeTableItem = (item: any) => {
  tableItems.value = tableItems.value.filter((i: any) => i.id !== item.id);
};
</script>

<template>
  <UiDrawerWrapper>
    <h1 class="text-lg font-medium mb-4">Поступление товаров и услуг</h1>
    <FormsStocksReceipt>
      <div class="w-full flex items-center justify-between pt-4 border-t mb-4">
        <el-tabs class="w-1/2" v-model="activeTab" type="card" stretch
          ><el-tab-pane
            v-for="tab in tabs"
            :key="tab.name"
            :label="tab.name"
            :name="tab.key"
        /></el-tabs>
        <el-button
          @click="modalVisible = true"
          :disabled="!receiptForm.stock_id"
        >
          Добавить
        </el-button>
      </div>

      <el-table :data="filteredTableItems" size="small" border>
        <el-table-column label="Номенклатура" prop="name" width="140">
        </el-table-column>
        <el-table-column label="Кол-во" prop="count" width="90">
          <template #default="{ row }">
            {{ formatWithoutCurrency(row.count) }}
          </template>
        </el-table-column>
        <el-table-column
          :label="`Цена, ${userProfileLocalCurrencySymbol}`"
          prop="price"
          width="73"
        >
          <template #default="{ row }">
            {{ formatWithoutCurrency(row.price / row.count) }}
          </template>
        </el-table-column>
        <el-table-column
          :label="`НДС, ${userProfileLocalCurrencySymbol}`"
          prop="vatAmount"
          width="90"
        >
          <template #default="{ row }">
            {{ formatWithoutCurrency(row.vatAmount)
            }}{{ ` (${getNomenclatureVatRate(row.vat_rate)})` }}
          </template>
        </el-table-column>
        <el-table-column :label="`Сумма, ${userProfileLocalCurrencySymbol}`">
          <template #default="{ row }">
            {{
              formatWithoutCurrency(
                receiptForm.price_includes_vat
                  ? row.totalPrice
                  : row.totalPrice + row.totalVatAmount
              )
            }}
          </template>
        </el-table-column>
        <el-table-column v-if="tableItems.length" width="50">
          <template #default="{ row }">
            <el-button
              :icon="Delete"
              circle
              @click.stop="removeTableItem(row)"
            />
          </template>
        </el-table-column>

        <template #append>
          <div
            v-if="filteredTableItems.length"
            class="flex items-center bg-[var(--border-color-lighter)]"
          >
            <div class="w-[140px] px-2">Итого</div>
            <div class="w-[90px] px-2">
              {{ formatWithoutCurrency(totalSums.quantity) }}
            </div>
            <div class="w-[73px] px-2"></div>
            <div class="w-[90px] px-2">
              {{ formatWithoutCurrency(totalSums.totalVatAmount) }}
            </div>
            <div class="px-2">
              {{
                formatWithoutCurrency(
                  receiptForm.price_includes_vat
                    ? totalSums.totalPrice
                    : totalSums.totalPrice + totalSums.totalVatAmount
                )
              }}
            </div>
          </div>
        </template>
      </el-table>
    </FormsStocksReceipt>

    <div class="flex w-full justify-between p-5">
      <p class="flex items-center font-medium text-md">Итого по услугам и товарам: {{ formatWithoutCurrency(serviceAndItemsSum) }} ₽</p>
      <el-button
        type="primary"
        @click="createReceiptOperation"
        :loading="createReceiptOperationLoading"
      >
        Провести
      </el-button>
    </div>

    <ModalStocksItemAdd
      v-if="modalVisible"
      :modal-visible="modalVisible"
      :stock-id="receiptForm.stock_id!"
      :nomenclature-type="activeTab"
      is-enter-price
      isVatRate
      isArrival
      @close-modal="modalVisible = false"
      @handle-add="addTableItem"
    />
  </UiDrawerWrapper>
</template>

<style scoped>
:deep(.el-tabs__header) {
  display: flex !important;
  align-items: center !important;
  margin: 0;
  margin-bottom: -1px;
}
</style>
