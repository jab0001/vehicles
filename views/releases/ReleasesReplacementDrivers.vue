<script setup lang="ts">
import { ref, reactive } from "vue";
import _ from "lodash";
import { Delete } from "@element-plus/icons-vue";
import VehiclesOnLineTimeIntervalsModal from "@/components/vehiclesOnLine/VehiclesOnLineTimeIntervalsModal.vue";

const modalTimeIntervalsVisible = ref(false);
const timeIntervals = ref<string[][]>([]);

const removeTimeIntervals = (row: string[]) => {
  timeIntervals.value = timeIntervals.value.filter((_) => _ !== row);
};
const handleSelectTimeIntervals = (intervals: string[][]) => {
  timeIntervals.value = _.cloneDeep(intervals);
  modalTimeIntervalsVisible.value = false;
};
</script>

<template>
  <Teleport defer to="#header">
    <div class="flex justify-between items-center w-full">
      <div class="text-md text-nowrap text-xl">Сменные водители</div>
      <el-button type="primary" @click="">Выпустить на линию</el-button>
    </div>
  </Teleport>

  <div
    class="max-w-[290px] flex flex-col gap-6 px-5 py-2.5 border-l text-[var(--text-color-regular)]"
  >
    <h3 class="font-bold">Дополнительные настройки для сменных водителей</h3>

    <div>
      <p>Запрет на передачу смену во временные промежутки</p>

      <el-table
        v-if="timeIntervals.length"
        :data="timeIntervals"
        border
        size="small"
      >
        <el-table-column label="Период по времени">
          <template #default="{ row }: { row: any }">
            {{ row.join(" - ") }}
          </template>
        </el-table-column>
        <el-table-column width="56">
          <template #default="{ row }: { row: any }">
            <el-button
              :icon="Delete"
              circle
              @click.stop="removeTimeIntervals(row)"
            />
          </template>
        </el-table-column>
      </el-table>

      <el-button
        class="mt-2"
        type="primary"
        plain
        @click="modalTimeIntervalsVisible = true"
        >+ Добавить промежуток</el-button
      >
    </div>

    <el-form label-position="top" class="flex flex-col gap-1.5">
      <el-form-item label="">
        <el-checkbox class="flex-wrap whitespace-normal flex-col">
        Водители должны проводить осмотры при передаче смены</el-checkbox
      >
      </el-form-item>
      <el-form-item label="Мин. время до передачи смены">
        <el-time-picker format="HH:mm" value-format="HH:mm" style="width: 100%" />
      </el-form-item>
      <el-form-item label="Кому начислять аренду">
        <el-select>
        <el-option label="Водителю на линии" value="1" />
      </el-select>
      </el-form-item>
    </el-form>

    <VehiclesOnLineTimeIntervalsModal
      v-if="modalTimeIntervalsVisible"
      :modalIntervalsVisible="modalTimeIntervalsVisible"
      :selected="timeIntervals"
      @close="modalTimeIntervalsVisible = false"
      @handle-select="handleSelectTimeIntervals"
    />
  </div>
</template>
