<script setup lang="ts">
import { useRoute } from "vue-router";
import { storeToRefs } from "pinia";
import { ref, watch, computed } from "vue";

import { useUser } from "@/composables/useUser";
import { useStocksNomenclature } from "@/composables/useStocks";
import { useUserStore } from "@/stores/userStore";
import { useStocksReceiptStore } from "@/stores/stocksStore";
import { formatDecimal, formatWithoutCurrency } from "@/helpers/format.helpers";
import type { TNomenclatureType } from "@/types/stocks";

import UiDrawerWrapper from "@/components/ui/UiDrawerWrapper.vue";
import FormsStocksReceipt from "@/components/forms/FormsStocksReceipt.vue";
import { useFiles } from "@/composables/useFiles";

interface IReceiptTab {
  key: TNomenclatureType;
  name: string;
}

const { userProfileLocalCurrencySymbol } = storeToRefs(useUserStore());
const route = useRoute();
const { fetchReceiptOperationDetails, clearInvoiceFilesLists } =
  useStocksReceiptStore();
const {
  receiptDetailsResult,
  receiptDetalsLoading,
  invoiceFileList,
  receiptForm,
} = storeToRefs(useStocksReceiptStore());
const { fetchStockOperationsUploadedFileList } = useFiles();
const { getNomenclatureVatRatePercent, getNomenclatureVatRate } =
  useStocksNomenclature();
const tabs = ref<IReceiptTab[]>([
  {
    key: "ITEM",
    name: `Товары(${receiptDetailsResult.value?.items?.length ?? 0})`,
  },
  {
    key: "SERVICE",
    name: `Услуги(${receiptDetailsResult.value?.services?.length ?? 0})`,
  },
]);
const activeTab = ref(tabs.value[0].key);

watch(
  () => receiptDetailsResult.value?.items?.length,
  (length) => {
    tabs.value[0].name = `Товары(${length})`;
  }
);
watch(
  () => receiptDetailsResult.value?.services?.length,
  (length) => {
    tabs.value[1].name = `Услуги(${length})`;
  }
);

watch(receiptDetailsResult, async (v) => {
  if (v) {
    clearInvoiceFilesLists();
    try {
      invoiceFileList.value = [
        ...(await fetchStockOperationsUploadedFileList(v.document_ids, v.id)),
      ];
    } catch (error) {
      console.error(error);
    }
  }
});
const filteredTableItems = computed(() => {
  if (activeTab.value === "SERVICE") {
    return (
      receiptDetailsResult.value?.services?.map((i) => {
        const vatAmount = getItemVatAmount(i);
        const totalPrice = Number(i.quantity) * Number(i.price_per_item);
        return {
          ...i,
          price: receiptDetailsResult.value?.price_includes_vat
            ? i.price
            : Number(i.price_per_item) - Number(vatAmount),
          vatAmount,
          totalPrice,
        };
      }) ?? []
    );
  }
  return (
    receiptDetailsResult.value?.items?.map((i) => {
      const vatAmount = getItemVatAmount(i);
      const totalPrice = Number(i.quantity) * Number(i.price_per_item);
      return {
        ...i,
        price: receiptDetailsResult.value?.price_includes_vat
          ? i.price
          : Number(i.price_per_item) - Number(vatAmount),
        vatAmount,
        totalPrice,
      };
    }) ?? []
  );
});

const totalSums = computed(() => {
  console.log(filteredTableItems.value);

  return filteredTableItems.value.reduce(
    (acc, item) => {
      return {
        quantity: acc.quantity + Number(item.quantity),
        totalVatAmount: acc.totalVatAmount + Number(item.vatAmount) * Number(item.quantity),
        totalPrice: acc.totalPrice + Number(item.totalPrice),
      };
    },
    { quantity: 0, totalVatAmount: 0, totalPrice: 0 }
  );
});

const serviceAndItemsSum = computed(() => {
  const resultServices = receiptDetailsResult.value?.services ?? [];
  const resultItems = receiptDetailsResult.value?.items ?? [];
  const resultServicesArray = resultServices.map((i) => {
    const totalPrice = Number(i.quantity) * Number(i.price);
    return totalPrice;
  });
  const resultItemsArray = resultItems.map((i) => {
    const totalPrice = Number(i.quantity) * Number(i.price);
    return totalPrice;
  });

  const totalSum = [...resultServicesArray, ...resultItemsArray].reduce(
    (acc, price) => acc + price,
    0
  );

  return totalSum;
});

const getItemVatAmount = (item: any) => {
  const percent = getNomenclatureVatRatePercent(item.vat_rate);

  return Number(item.price_per_item) - Number(item.price_per_item) / (1 + percent / 100);
};

fetchReceiptOperationDetails({
  stock_operation_id: route.hash?.split("/")[2],
  operation_type: "ARRIVAL",
});
</script>

<template>
  <UiDrawerWrapper>
    <h1 class="text-lg font-medium mb-4">
      Поступление {{ receiptDetailsResult?.id }}
    </h1>
    <FormsStocksReceipt v-loading="receiptDetalsLoading" disabled>
      <div class="w-full flex items-center justify-between pt-4 border-t mb-4">
        <el-tabs class="w-1/2" v-model="activeTab" type="card" stretch
          ><el-tab-pane
            v-for="tab in tabs"
            :key="tab.name"
            :label="tab.name"
            :name="tab.key"
        /></el-tabs>
        <el-button disabled> Добавить </el-button>
      </div>

      <el-table :data="filteredTableItems" size="small" border>
        <el-table-column
          label="Номенклатура"
          prop="nomenclature.name"
          width="160"
        >
        </el-table-column>
        <el-table-column label="Кол-во" prop="quantity" width="90">
          <template #default="{ row }">
            {{ formatWithoutCurrency(row.quantity) }}
          </template>
        </el-table-column>
        <el-table-column
          :label="`Цена, ${userProfileLocalCurrencySymbol}`"
          prop="price"
          width="73"
        >
          <template #default="{ row }">
            {{
              formatWithoutCurrency(
                receiptForm.price_includes_vat
                  ? Number(row.price_per_item)
                  : Number(row.price_per_item) /
                      (1 + getNomenclatureVatRatePercent(row.vat_rate) / 100)
              )
            }}
          </template>
        </el-table-column>
        <el-table-column
          :label="`НДС, ${userProfileLocalCurrencySymbol}`"
          prop="vatAmount"
          width="90"
        >
          <template #default="{ row }">
            {{ formatWithoutCurrency(row.vatAmount) }}
            {{ ` (${getNomenclatureVatRate(row.vat_rate)})` }}</template
          >
        </el-table-column>
        <el-table-column :label="`Сумма, ${userProfileLocalCurrencySymbol}`">
          <template #default="{ row }">
            {{ formatWithoutCurrency(row.totalPrice) }}
          </template>
        </el-table-column>

        <template #append>
          <div
            v-if="filteredTableItems.length"
            class="flex items-center bg-[var(--border-color-lighter)]"
          >
            <div class="w-[160px] px-2">Итого</div>
            <div class="w-[90px] px-2">
              {{ formatWithoutCurrency(totalSums.quantity) }}
            </div>
            <div class="w-[73px] px-2"></div>
            <div class="w-[90px] px-2">
              {{ formatWithoutCurrency(totalSums.totalVatAmount) }}
            </div>
            <div class="px-2">
              {{ formatWithoutCurrency(totalSums.totalPrice) }}
            </div>
          </div>
        </template>
      </el-table>

      <div class="flex w-full justify-between pt-5">
        <p class="flex items-center font-medium text-md">
          Итого по услугам и товарам:
          {{ formatWithoutCurrency(receiptDetailsResult?.total_sum) }} ₽
        </p>
      </div>
    </FormsStocksReceipt>
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
