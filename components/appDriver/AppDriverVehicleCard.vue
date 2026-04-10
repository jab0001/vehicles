<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { useRouter } from "vue-router";
import VehiclesLicencePlate from "@/components/vehicles/VehiclesLicencePlate.vue";
import {
  getVehicleFullname,
  getUserFullname,
} from "@/helpers/fullname.helpers";
import type { IVehicle } from "@/types/vehicles";
import type {
  IReleasesDriverGroup,
  ITransferRequest,
} from "@/types/vehiclesOnLine";

import UiSheet from "@/components/ui/UiSheet.vue";
import UiSpinner from "@/components/ui/UiSpinner.vue";
import type { IDriver } from "@/types/drivers";
import { useAppDriverGroup } from "@/composables/useAppDriver";
import { ElNotification } from "element-plus";
import { useAppDriverGroupStore } from "@/stores/appDriverGroupStore";
import { storeToRefs } from "pinia";

const emit = defineEmits(["create-transfer-success", "refresh"]);
const props = defineProps<{
  vehicle: IVehicle | undefined;
  driverGroup: IReleasesDriverGroup | undefined;
  latestTransfer: ITransferRequest | undefined;
  driver: IDriver;
}>();

const router = useRouter();
const groupDriversRef = ref<{
  show: () => void;
  close: () => void;
} | null>(null);
const errorRef = ref<{
  show: () => void;
  close: () => void;
} | null>(null);
const createTransferRequestRef = ref<{
  show: () => void;
  close: () => void;
} | null>(null);

const { transferRequest, transferCancelRequest, receiverAccept } =
  useAppDriverGroupStore();
const { transferLoading, transferCancelLoading, receiverAcceptLoading } =
  storeToRefs(useAppDriverGroupStore());

const vehiclePlate = computed(() => {
  if (
    (props.driverGroup?.id &&
      props.latestTransfer?.group_id == props.driverGroup?.id) ||
    (!props.vehicle && props.driverGroup)
  ) {
    return props.driverGroup?.vehicle.plate_number;
  }

  return props.vehicle?.plate_number;
});
const vehicleName = computed(() => {
  if (
    props.driverGroup?.id &&
    props.latestTransfer?.group_id == props.driverGroup?.id
  ) {
    return getVehicleFullname(
      props.driverGroup?.vehicle?.brand?.brand!,
      props.driverGroup?.vehicle?.car_model?.car_model!
    );
  }
  if (props.vehicle) {
    return getVehicleFullname(
      props.vehicle?.brand?.brand!,
      props.vehicle?.car_model?.car_model!
    );
  }
  if (props.driverGroup) {
    return getVehicleFullname(
      props.driverGroup.vehicle.brand.brand,
      props.driverGroup.vehicle.car_model.car_model
    );
  }
  return "";
});

const otherDrivers = computed(() => {
  if (!props.driverGroup) return [];

  const drivers = [];

  if (props.driverGroup.first_driver_id) {
    drivers.push({
      id: props.driverGroup.first_driver_id,
      driver: getUserFullname(
        props.driverGroup.first_driver?.lastname,
        props.driverGroup.first_driver?.firstname,
        props.driverGroup.first_driver?.middlename
      ),
    });
  }

  if (props.driverGroup.second_driver_id) {
    drivers.push({
      id: props.driverGroup.second_driver_id,
      driver: getUserFullname(
        props.driverGroup.second_driver?.lastname,
        props.driverGroup.second_driver?.firstname,
        props.driverGroup.second_driver?.middlename
      ),
    });
  }

  if (props.driverGroup.third_driver_id) {
    drivers.push({
      id: props.driverGroup.third_driver_id,
      driver: getUserFullname(
        props.driverGroup.third_driver?.lastname,
        props.driverGroup.third_driver?.firstname,
        props.driverGroup.third_driver?.middlename
      ),
    });
  }

  return drivers
    .filter((driver) => driver.id !== props.driver.id)
    .filter(Boolean);
});

const driverOnLineFullname = computed(() => {
  if (props.driverGroup) {
    if (
      props.driverGroup.driver_on_line_id == props.driverGroup.first_driver_id
    ) {
      return getUserFullname(
        props.driverGroup.first_driver?.lastname,
        props.driverGroup.first_driver?.firstname,
        props.driverGroup.first_driver?.middlename
      );
    }
    if (
      props.driverGroup.driver_on_line_id == props.driverGroup.second_driver_id
    ) {
      return getUserFullname(
        props.driverGroup.second_driver?.lastname,
        props.driverGroup.second_driver?.firstname,
        props.driverGroup.second_driver?.middlename
      );
    }
    if (
      props.driverGroup.driver_on_line_id == props.driverGroup.third_driver_id
    ) {
      return getUserFullname(
        props.driverGroup.third_driver?.lastname,
        props.driverGroup.third_driver?.firstname,
        props.driverGroup.third_driver?.middlename
      );
    }
  }
  return "";
});

const openGroupDrivers = () => groupDriversRef.value?.show();
const openErrorSheet = () => errorRef.value?.show();
const cancelTransfer = () => {
  if (!props.latestTransfer) return;
  transferCancelRequest({
    transfer_id: props.latestTransfer.id,
  }).then(() => {
    emit("refresh");
    ElNotification.success("Успешный запрос");
  });
};
const acceptTransfer = () => {
  if (!props.latestTransfer) return;
  receiverAccept({
    transfer_id: props.latestTransfer.id,
  })
    .then(() => {
      emit("refresh");
      groupDriversRef.value?.close();
      ElNotification.success("Успешный запрос");
    })
    .catch((err) => {
      ElNotification({
        title: "Ошибка",
        message: err.data?.user_message || "Ошибка при принятии заявки",
        type: "error",
      });
    });
};
const goToLineWithInspection = () => {
  if (!props.latestTransfer?.id) return;
  return router.push({
    name: "AppDriverInspectionsCreate",
    hash: `#/transfer/${props.latestTransfer.id}`,
  });
};

function onCreateTransfer(item: { driver: string; id: number }) {
  console.log({ item });
  if (props.driverGroup)
    transferRequest({
      group_id: props.driverGroup.id,
      driver_receiver_id: item.id,
    })
      .then(() => {
        emit("refresh");
        createTransferRequestRef.value?.close();
        ElNotification.success("Успешный запрос");
      })
      .catch((err) => {
        ElNotification({
          title: "Ошибка",
          message: err.data?.user_message || "Ошибка при создании заявки",
          type: "error",
        });
      });
}
</script>

<template>
  <div
    class="w-full bg-white shadow-app-driver rounded-[20px] py-4 px-3"
    v-loading="transferCancelLoading || transferLoading"
  >
    <section class="flex justify-between items-center gap-4">
      <div class="overflow-hidden">
        <p class="text-[var(--text-color-secondary)] text-xs leading-5">
          Транспортное средство:
        </p>
        <p class="text-sm font-medium truncate">
          {{ vehicleName }}
        </p>
      </div>
      <VehiclesLicencePlate :plate-number="vehiclePlate" />
    </section>

    <p
      v-if="!latestTransfer && vehicle && driverGroup"
      class="group-item mt-2.5 cursor-pointer"
      @click="createTransferRequestRef?.show"
    >
      Передать транспортное средство
    </p>

    <div
      v-if="!latestTransfer && !vehicle && driverGroup"
      class="border-t border-t-[#DCDFE6] mt-2.5 pt-2.5 text-center"
    >
      {{
        driverGroup.driver_on_line_id
          ? `Сейчас на линии ваш сменный водитель: ${driverOnLineFullname}`
          : `Сейчас на линии никого нет`
      }}
    </div>

    <template v-else-if="latestTransfer">
      <div
        v-if="
          !latestTransfer.driver_receiver_accepted &&
          latestTransfer.driver_initiator_id == driver?.id &&
          vehicle
        "
        class="mt-2.5"
      >
        <div class="flex items-center justify-center gap-1.5">
          <UiSpinner />
          <p class="text-[13px] leading-5 font-medium">
            Ждем ответ от сменного водителя
          </p>
        </div>
        <p class="group-item mt-2.5" @click="cancelTransfer">
          Отменить передачу т/с
        </p>
      </div>

      <template v-else>
        <div class="border-t border-t-[#DCDFE6] mt-2.5 pt-2.5 text-center">
          <p>Ваш сменный водитель передает вам транспортное средство</p>
          <p
            class="w-full py-3 mt-2.5 rounded-xl bg-[#67C23A] text-white text-base text-center"
            @click="groupDriversRef?.show"
          >
            Выйти на линию
          </p>
          <p class="group-item mt-2" @click="cancelTransfer">
            Отклонить предложение
          </p>
        </div>
      </template>
    </template>

    <UiSheet ref="createTransferRequestRef">
      <div class="p-4" v-loading="transferLoading">
        <h2 class="text-center text-lg font-medium">
          Выберите, кому планируете передать транспортное средство
        </h2>
        <div class="flex flex-col gap-2 mt-4">
          <p
            class="group-item"
            v-for="item in otherDrivers"
            @click="onCreateTransfer(item)"
          >
            {{ item.driver }}
          </p>
        </div>
      </div>
    </UiSheet>

    <UiSheet ref="groupDriversRef">
      <!-- <div class="p-4">
        <h2 class="text-center text-lg font-medium">
          Выберите, кому планируете передать транспортное средство
        </h2>
        <div class="flex flex-col gap-2 mt-4">
          <p class="group-item" v-for="item in otherDrivers">
            {{ item.driver }}
          </p>
        </div>
      </div> -->

      <div class="p-4">
        <h2 class="text-center text-lg font-medium">
          Хорошо было бы проветси осмотр транспортного средства
        </h2>
        <div class="flex flex-col gap-2 mt-4">
          <p
            class="w-full py-3 rounded-xl bg-[#409EFF] text-white text-base text-center"
            @click="goToLineWithInspection"
          >
            Пройти осмотр
          </p>
          <p class="group-item" @click="acceptTransfer">
            Пропустить и выйти на линию
          </p>
        </div>
      </div>

      <!-- <div class="p-4">
        <h2 class="text-center text-lg font-medium">
          Чтобы выйти на линию, необходимо пройти осмотр
        </h2>
        <div class="flex flex-col gap-2 mt-4">
          <p
            class="w-full py-3 rounded-xl bg-[#409EFF] text-white text-base text-center"
            @click="goToLineWithInspection"
          >
            Пройти осмотр
          </p>
          <p class="group-item">Не выходить на линию</p>
        </div>
      </div> -->
    </UiSheet>

    <UiSheet ref="errorRef">
      <div class="flex flex-col items-center gap-4 p-4">
        <svg
          width="41"
          height="40"
          viewBox="0 0 41 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M18.7425 20L15.1875 16.4837C14.9533 16.2229 14.8362 15.9233 14.8362 15.585C14.8362 15.2467 14.96 14.9537 15.2075 14.7062C15.455 14.4587 15.7479 14.335 16.0862 14.335C16.4246 14.335 16.7242 14.4521 16.985 14.6862L20.5012 18.2412L24.0175 14.6862C24.3825 14.3479 24.7925 14.2437 25.2475 14.3737C25.7025 14.5037 25.9954 14.7967 26.1262 15.2525C26.2571 15.7083 26.1529 16.1183 25.8137 16.4825L22.2587 19.9987L25.8137 23.515C26.1521 23.88 26.2562 24.29 26.1262 24.745C25.9962 25.2 25.7033 25.4929 25.2475 25.6237C24.7917 25.7546 24.3817 25.6504 24.0175 25.3112L20.5012 21.7562L16.985 25.3112C16.7242 25.5454 16.4246 25.6625 16.0862 25.6625C15.7479 25.6625 15.455 25.5387 15.2075 25.2912C14.96 25.0437 14.8362 24.7508 14.8362 24.4125C14.8362 24.0742 14.9533 23.7746 15.1875 23.5137L18.7425 20ZM20.5 35C24.745 34.8958 28.28 33.4308 31.105 30.605C33.93 27.7792 35.395 24.2442 35.5 20C35.3958 15.755 33.9308 12.22 31.105 9.395C28.2792 6.57 24.7442 5.105 20.5 5C16.255 5.10417 12.72 6.56917 9.895 9.395C7.07 12.2208 5.605 15.7558 5.5 20C5.60417 24.245 7.06917 27.78 9.895 30.605C12.7208 33.43 16.2558 34.895 20.5 35ZM20.5 37.5C15.5517 37.37 11.4304 35.6579 8.13625 32.3637C4.84208 29.0696 3.13 24.9483 3 20C3.13 15.0517 4.84208 10.9304 8.13625 7.63625C11.4304 4.34208 15.5517 2.63 20.5 2.5C25.4483 2.63 29.5696 4.34208 32.8637 7.63625C36.1579 10.9304 37.87 15.0517 38 20C37.87 24.9483 36.1579 29.0696 32.8637 32.3637C29.5696 35.6579 25.4483 37.37 20.5 37.5V37.5Z"
            fill="#F56C6C"
          />
        </svg>
        <h2 class="max-w-64 text-center text-lg font-medium">
          Вы не можете передать автомобиль сейчас
        </h2>
        <p class="text-center text-[var(--text-color-regular)] text-sm">
          Временные промежутки, доступные для передачи транспортного средства:
          <span class="block">{{
            `${"с 12:40 до 17:30, с 19:50 до 12:40"}`
          }}</span>
        </p>
        <p
          class="w-full py-3 rounded-xl bg-[#409EFF] text-white text-base text-center"
        >
          Понятно
        </p>
      </div>

      <div class="flex flex-col items-center gap-4 p-4">
        <svg
          width="41"
          height="40"
          viewBox="0 0 41 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M18.7425 20L15.1875 16.4837C14.9533 16.2229 14.8362 15.9233 14.8362 15.585C14.8362 15.2467 14.96 14.9537 15.2075 14.7062C15.455 14.4587 15.7479 14.335 16.0862 14.335C16.4246 14.335 16.7242 14.4521 16.985 14.6862L20.5012 18.2412L24.0175 14.6862C24.3825 14.3479 24.7925 14.2437 25.2475 14.3737C25.7025 14.5037 25.9954 14.7967 26.1262 15.2525C26.2571 15.7083 26.1529 16.1183 25.8137 16.4825L22.2587 19.9987L25.8137 23.515C26.1521 23.88 26.2562 24.29 26.1262 24.745C25.9962 25.2 25.7033 25.4929 25.2475 25.6237C24.7917 25.7546 24.3817 25.6504 24.0175 25.3112L20.5012 21.7562L16.985 25.3112C16.7242 25.5454 16.4246 25.6625 16.0862 25.6625C15.7479 25.6625 15.455 25.5387 15.2075 25.2912C14.96 25.0437 14.8362 24.7508 14.8362 24.4125C14.8362 24.0742 14.9533 23.7746 15.1875 23.5137L18.7425 20ZM20.5 35C24.745 34.8958 28.28 33.4308 31.105 30.605C33.93 27.7792 35.395 24.2442 35.5 20C35.3958 15.755 33.9308 12.22 31.105 9.395C28.2792 6.57 24.7442 5.105 20.5 5C16.255 5.10417 12.72 6.56917 9.895 9.395C7.07 12.2208 5.605 15.7558 5.5 20C5.60417 24.245 7.06917 27.78 9.895 30.605C12.7208 33.43 16.2558 34.895 20.5 35ZM20.5 37.5C15.5517 37.37 11.4304 35.6579 8.13625 32.3637C4.84208 29.0696 3.13 24.9483 3 20C3.13 15.0517 4.84208 10.9304 8.13625 7.63625C11.4304 4.34208 15.5517 2.63 20.5 2.5C25.4483 2.63 29.5696 4.34208 32.8637 7.63625C36.1579 10.9304 37.87 15.0517 38 20C37.87 24.9483 36.1579 29.0696 32.8637 32.3637C29.5696 35.6579 25.4483 37.37 20.5 37.5V37.5Z"
            fill="#F56C6C"
          />
        </svg>
        <h2 class="max-w-64 text-center text-lg font-medium">
          Нельзя так часто передавать транспортное средство
        </h2>
        <p
          class="max-w-64 text-center text-[var(--text-color-regular)] text-sm"
        >
          Минимально вы должны провести на смене {{ `4 часа 30 минут` }}
        </p>
        <p
          class="w-full py-3 rounded-xl bg-[#409EFF] text-white text-base text-center"
        >
          Понятно
        </p>
      </div>
    </UiSheet>
  </div>
</template>

<style scoped>
.group-item {
  @apply w-full py-3 rounded-xl bg-[var(--fill-color)] text-[#409EFF] text-base text-center;
}
</style>
