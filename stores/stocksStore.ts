import { defineStore } from "pinia";
import {
  useStocksNomenclature,
  useStocksMoving,
  useStocksReceipt,
  useStocksWriteOff,
  useStocksPosting,
  useStocksCostItems,
  useStocks,
  useStocksBalance,
} from "@/composables/useStocks";

export const useStocksNomenclatureStore = defineStore(
  "stocksNomenclature",
  () => useStocksNomenclature()
);

export const useStocksMovingStore = defineStore("stocksMovingStore", () =>
  useStocksMoving()
);

export const useStocksBalanceStore = defineStore("stocksBalanceStore", () =>
  useStocksBalance()
);

export const useStocksReceiptStore = defineStore("stocksReceiptStore", () =>
  useStocksReceipt()
);

export const useStocksWriteOffStore = defineStore("stocksWriteOffStore", () =>
  useStocksWriteOff()
);

export const useStocksPostingStore = defineStore("stocksPostingStore", () =>
  useStocksPosting()
);

export const useStocksCostItemsStore = defineStore("stocksCostItemsStore", () =>
  useStocksCostItems()
);
export const useStocksStore = defineStore("stocksStore", () => useStocks());
