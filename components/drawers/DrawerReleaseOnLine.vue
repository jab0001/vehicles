<script setup lang="ts">
import { reactive } from "vue";
import { useVehiclesOnLineStore } from "@/stores/vehiclesOnLineStore";

import UiDrawerWrapper from "@/components/ui/UiDrawerWrapper.vue";

const { releaseVehicleToLine, fetchVehiclesOnLine } = useVehiclesOnLineStore();
const formValues = reactive<any>({
  driver: undefined,
  vehicle: undefined,
  inspection: undefined,
});

const selectDriver = [
  {
    id: 1,
    name: "Кузнецова Анастасия Александровна",
    debt: "55788 ₽",
    licenceDate: "27.04.2024",
  },
  {
    id: 2,
    name: "Иванов Василий Михайлович",
    debt: "12328 ₽",
    licenceDate: "22.01.2024",
  },
];
const selectVehicle = [
  {
    id: 1,
    name: "Deawoo Matiz - E161EE | 161",
    company: "Организация, к которой привязан договор",
    cascoDate: "27.04.2024",
  },
  {
    id: 2,
    name: "Hyundai Solaris - Е999ЕЕ77 | 871",
    company: "Организация, к которой привязан договор",
    cascoDate: "22.01.2024",
  },
];
const selectInspection = [
  {
    id: 1,
    name: "Осмотр от 16.04.2024",
  },
  {
    id: 2,
    name: "Осмотр от 19.02.2023",
  },
];

const onSend = async () => {
  console.log(formValues);

  try {
    await releaseVehicleToLine({
      vehicle_id: 14,
      driver_id: 1,
    });
  } catch (error) {
    console.log(error);
  } finally {
    await fetchVehiclesOnLine({
      limit: 10,
      page: 1,
    });
  }
};
</script>

<template>
  <UiDrawerWrapper>
    <div class="flex flex-col">
      <h2 class="text-2xl mb-7">
        {{ $t("components.drawers.releaseOnLine.title") }}
      </h2>

      <el-form
        class=""
        :label-position="'top'"
        label-width="auto"
        :model="formValues"
      >
        <el-form-item
          class="pb-5 border-b"
          :label="$t('components.drawers.releaseOnLine.driver.label')"
        >
          <el-select
            v-model="formValues.driver"
            :placeholder="
              $t('components.drawers.releaseOnLine.driver.placeholder')
            "
          >
            <el-option
              v-for="item in selectDriver"
              :key="item.id"
              :label="item.name"
              :value="item"
            />
          </el-select>

          <div v-if="formValues.driver" class="flex items-center gap-10">
            <div>
              {{
                $t("components.drawers.releaseOnLine.driver.debt", {
                  msg: formValues.driver.debt,
                })
              }}
            </div>
            <div>
              {{
                $t("components.drawers.releaseOnLine.driver.licenceDate", {
                  msg: formValues.driver.licenceDate,
                })
              }}
            </div>
          </div>
        </el-form-item>
        <el-form-item
          class="pb-5 border-b"
          :label="$t('components.drawers.releaseOnLine.vehicle.label')"
        >
          <el-select
            v-model="formValues.vehicle"
            :placeholder="
              $t('components.drawers.releaseOnLine.driver.placeholder')
            "
          >
            <el-option
              v-for="item in selectVehicle"
              :key="item.id"
              :label="item.name"
              :value="item"
            />
          </el-select>
          <div
            v-if="formValues.vehicle"
            class="w-full flex items-center justify-between"
          >
            <div>
              {{
                $t("components.drawers.releaseOnLine.vehicle.cascoDate", {
                  msg: formValues.vehicle.cascoDate,
                })
              }}
            </div>
            <div>
              {{ formValues.vehicle.company }}
            </div>
          </div>
        </el-form-item>
        <el-form-item
          class="pb-5 border-b"
          :label="$t('components.drawers.releaseOnLine.inspection.label')"
        >
          <div class="w-full flex items-center gap-2.5">
            <el-select
              v-model="formValues.inspection"
              :placeholder="
                $t('components.drawers.releaseOnLine.inspection.placeholder')
              "
            >
              <el-option
                v-for="item in selectInspection"
                :key="item.id"
                :label="item.name"
                :value="item"
              />
            </el-select>
            <el-button v-if="formValues.inspection">{{
              $t("components.drawers.releaseOnLine.inspection.btnAct")
            }}</el-button>
          </div>

          <el-link v-if="formValues.inspection">
            {{ $t("components.drawers.releaseOnLine.inspection.link") }}
          </el-link>
        </el-form-item>

        <div class="w-full flex flex-col gap-10">
          <div class="w-full flex items-center justify-between">
            <div class="flex items-center gap-4">
              <p>{{ $t("components.drawers.releaseOnLine.rent.title") }}</p>
              <el-button>{{
                $t("components.drawers.releaseOnLine.rent.btnOffer")
              }}</el-button>
            </div>

            <p>
              {{ $t("components.drawers.releaseOnLine.rent.offerNumber") }}
            </p>
          </div>

          <el-button class="w-fit">{{
            $t("components.drawers.releaseOnLine.rent.btnCreate")
          }}</el-button>
        </div>
      </el-form>

      <div class="mt-auto text-end">
        <el-button @click="onSend">{{
          $t("components.drawers.releaseOnLine.btnSend")
        }}</el-button>
      </div>
    </div>
  </UiDrawerWrapper>
</template>
