<script setup lang="ts">
import { useDamages } from "@/composables/useDamages";
import { formatCurrency, formatDayTime } from "@/helpers/format.helpers";
import {
  getVehicleFullname,
  getUserFullname,
} from "@/helpers/fullname.helpers";
import type { IDamage } from "@/types/damages";

import AppDriverBaseDesc from "./AppDriverBaseDesc.vue";

defineProps<{
  damage: IDamage;
}>();

const { getDamageStatus, getDamageType, getDamageCulprit } = useDamages();
</script>

<template>
  <div class="flex flex-col gap-6 px-4">
    <div class="flex items-center gap-2">
      <el-tag :type="damage?.status === 'DONE' ? 'success' : 'warning'">{{
        getDamageStatus(damage?.status)
      }}</el-tag>
      <p class="text-sm font-medium leading-6">№ {{ damage.id }}</p>
    </div>

    <AppDriverBaseDesc label="Сумма ущерба"
      ><p class="text-xl font-medium">
        {{ formatCurrency(damage.cost) }}
      </p></AppDriverBaseDesc
    >
    <div class="grid grid-cols-2 gap-x-2 gap-y-6">
      <AppDriverBaseDesc
        label="Тип ущерба"
        :text="getDamageType(damage?.damage_type)"
      />
      <AppDriverBaseDesc
        label="Внесенная сумма"
        :text="formatCurrency(damage.payed_sum)"
      />
      <AppDriverBaseDesc
        label="Дата события"
        :text="formatDayTime(damage.event_time, true)"
      />
      <AppDriverBaseDesc
        label="Гос. номер"
        :text="damage.vehicle.plate_number"
      />
      <AppDriverBaseDesc
        label="Виновник ущерба"
        :text="getDamageCulprit(damage.culprit)"
      />
      <AppDriverBaseDesc
        label="Марка и модель"
        :text="
          getVehicleFullname(
            damage.vehicle.brand?.brand!,
            damage.vehicle.car_model?.car_model!
          )
        "
      />
    </div>

    <AppDriverBaseDesc label="Причина ущерба" :text="damage.reason!" />
    <AppDriverBaseDesc label="Место происшествия" :text="damage.place!" />

    <AppDriverBaseDesc
      v-if="damage?.damage_type === 'ACCIDENT'"
      label="Участники ДТП"
      :text="
        getUserFullname(
          damage.driver.lastname,
          damage.driver.firstname,
          damage.driver.middlename
        )
      "
    />
  </div>
</template>
