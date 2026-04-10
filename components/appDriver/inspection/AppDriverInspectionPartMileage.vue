<script setup lang="ts">
import { ref, watch } from "vue";

const emit = defineEmits<{
  (e: "onNext"): void;
}>();

const currentMileage = defineModel({
  type: String,
  default: "",
});

const startPartForm = ref({
  current_mileage: "",
});
const formatMileageInput = (value: string) => {
  let numericValue = value.replace(/\./g, ",");
  numericValue = numericValue.replace(/[^\d,]/g, "");

  let [integerPart, decimalPart] = numericValue.split(",");
  integerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, " ");

  if (decimalPart) {
    decimalPart = decimalPart.slice(0, 3);
  }

  return decimalPart !== undefined
    ? `${integerPart},${decimalPart}`
    : integerPart;
};
</script>

<template>
  <div class="flex-1 flex flex-col justify-between">
    <section>
      <div class="my-14">
        <img
          src="@/assets/images/app-driver-inspection-mileage.png"
          class="fit-cover mx-auto"
        />
      </div>

      <p class="text-[var(--text-color-regular)] mb-6 text-base text-center">
        Укажите текущий пробег, км
      </p>

      <el-input
        v-model="currentMileage"
        placeholder="100 00"
        size="large"
        inputmode="decimal"
        :formatter="formatMileageInput"
      />
    </section>

    <transition>
      <el-button
        v-if="Number(currentMileage.replaceAll(' ', ''))"
        class="w-full rounded-xl"
        type="primary"
        size="large"
        @click="emit('onNext')"
        >Далее
      </el-button>
    </transition>
  </div>
</template>

<style scoped>
:deep(.el-input__inner) {
  text-align: center;
}
:deep(.el-input) {
  --el-input-border-radius: var(--border-radius-xl);
  --el-input-bg-color: var(--fill-color-light);
}
</style>
