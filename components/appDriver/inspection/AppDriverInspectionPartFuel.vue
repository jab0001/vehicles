<script setup lang="ts">
import { ref } from "vue";
import { useInspections } from "@/composables/useInspections";

const emit = defineEmits<{
  (e: "onNext"): void;
}>();

const { fuelOptions } = useInspections();
const currentFuel = defineModel({
  type: Number,
  default: 0,
});

const skipStep = () => {
  currentFuel.value = fuelOptions[fuelOptions.length - 1].value;
  emit("onNext");
};
</script>

<template>
  <div class="flex-1 flex flex-col justify-between">
    <section>
      <div class="my-14">
        <img
          src="@/assets/images/app-driver-inspection-fuel.png"
          class="fit-cover mx-auto"
        />
      </div>

      <p class="text-[var(--text-color-regular)] mb-6 text-base text-center">
        Сколько топлива сейчас в баке?
      </p>

      <div class="flex flex-col gap-2">
        <p
          class="w-full py-3 rounded-xl text-[#409EFF] text-base text-center"
          :class="[
            currentFuel === fuel.value
              ? 'bg-[var(--color-primary-light-7)]'
              : 'bg-[var(--fill-color)]',
          ]"
          v-for="fuel in fuelOptions"
          @click="currentFuel = fuel.value"
        >
          {{ fuel.label }}
        </p>
      </div>
    </section>

    <div class="flex flex-col items-center">
      <transition>
        <el-button
          v-if="currentFuel"
          class="w-full rounded-xl"
          type="primary"
          size="large"
          @click="emit('onNext')"
          >Начать осмотр
        </el-button>
      </transition>

      <!-- <el-link v-if="!currentFuel" class="w-fit" type="primary" @click="skipStep"
        >Пропустить шаг</el-link
      > -->
    </div>
  </div>
</template>
