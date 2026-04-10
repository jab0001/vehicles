<script setup lang="ts">
import { ref, onMounted, computed, watch } from "vue";
import {
  Plus,
  Delete,
  Edit,
  Warning,
  QuestionFilled,
} from "@element-plus/icons-vue";
import { ElMessageBox, ElNotification } from "element-plus";
import {
  useInspectionProfiles,
  type IInspectionProfile,
  type TInspectionType,
} from "@/composables/useInspectionProfiles";
import { formatDayTime } from "@/helpers/format.helpers";
import InspectionProfileForm from "@/components/forms/InspectionProfileForm.vue";
import { useMounted } from "@vueuse/core";
import UiSearch from "@/components/ui/UiSearch.vue";
import { useAppStore } from "@/stores/appStore";
import { useInspectionProfilesStore } from "@/stores/inspectionProfilesStore";
import { storeToRefs } from "pinia";
import IconQuestion from "@/components/icons/IconQuestion.vue";

// Composables
const {
  fetchInspectionProfilesLoading,
  inspectionProfilesResponse,
  deleteInspectionProfileLoading,
  defaultProfileResult,
  defaultProfileLoading,
  vehiclesWithProfileResponse,
} = storeToRefs(useInspectionProfilesStore());
const {
  getInspectionTypeLabel,
  fetchVehiclesWithProfile,
  fetchDefaultProfile,
  isDefaultProfile,
  deleteInspectionProfile,
  fetchInspectionProfiles,
} = useInspectionProfilesStore();
const {
  setReferenceBookInspectionProfileCreateHash,
  setReferenceBookInspectionProfileDetailsHash,
} = useAppStore();

const emptyPageFilters = {
  search: "",
  page: 1,
  limit: 20,
};
const pageFilters = ref({
  ...emptyPageFilters,
});
const clearFilters = () => {
  pageFilters.value = { ...emptyPageFilters };
};

const isMounted = useMounted();
const profiles = ref<IInspectionProfile[]>([]);
const totalItems = ref(0);
const showCreateModal = ref(false);
const editingProfile = ref<IInspectionProfile | null>(null);

// Загрузка профилей
const loadProfiles = async () => {
  try {
    await fetchInspectionProfiles(pageFilters.value);
  } catch (error) {
    console.error("Ошибка при загрузке профилей осмотров:", error);
    ElNotification.error("Не удалось загрузить профили осмотров");
  }
};

// Обработчик удаления профиля
const handleDeleteProfile = async (profile: IInspectionProfile) => {
  if (isDefaultProfile(profile)) {
    ElNotification.warning("Стандартный профиль не может быть удален");
    return;
  }

  try {
    await ElMessageBox.confirm(
      `Вы действительно хотите удалить профиль "${profile.name}"?`,
      "Удалить?",
      {
        confirmButtonText: "Удалить",
        confirmButtonClass: "!bg-[#F56C6C] border-[#F56C6C]",
        cancelButtonText: "Оставить",
      }
    );

    await deleteInspectionProfile(profile.id);
    await loadProfiles();
  } catch (error) {
    if (error !== "cancel") {
      console.error("Ошибка при удалении профиля:", error);
    }
  }
};

// Обработчик редактирования профиля
const handleEditProfile = (profile: IInspectionProfile) => {
  // editingProfile.value = profile;
  // showCreateModal.value = true;
  setReferenceBookInspectionProfileDetailsHash(profile.id);
};

// Обработчик создания нового профиля
const handleCreateProfile = () => {
  // editingProfile.value = null;
  // showCreateModal.value = true;
  setReferenceBookInspectionProfileCreateHash();
};

// Обработчик закрытия модального окна
const handleModalClose = (refresh: boolean = false) => {
  showCreateModal.value = false;
  editingProfile.value = null;

  if (refresh) {
    loadProfiles();
  }
};

// Получение списка типов осмотров для профиля
const getProfileInspectionTypes = (profile: IInspectionProfile): string => {
  if (
    !profile.enabled_inspection_types ||
    profile.enabled_inspection_types.length === 0
  ) {
    return "Не указаны";
  }

  return profile.enabled_inspection_types
    .map((type) => getInspectionTypeLabel(type))
    .join(", ");
};

// Получение количества автомобилей с профилем
const getVehiclesCount = (profile: IInspectionProfile): number => {
  return profile.vehicles_count || 0;
};

watch(inspectionProfilesResponse, async () => {
  if (inspectionProfilesResponse.value) {
    profiles.value = inspectionProfilesResponse.value.items;
    totalItems.value = inspectionProfilesResponse.value.total_items;

    const defaultProfile = profiles.value.find((p) => p.is_default);

    if (defaultProfile)
      profiles.value = [
        defaultProfile,
        ...profiles.value.filter((p) => p.id !== defaultProfile.id),
      ];
  }
});

watch(
  pageFilters,
  () => {
    loadProfiles();
  },
  {
    deep: true,
  }
);

// Инициализация
onMounted(() => {
  loadProfiles();
});

// Вычисляемые свойства
const loading = computed(
  () =>
    fetchInspectionProfilesLoading.value ||
    deleteInspectionProfileLoading.value ||
    defaultProfileLoading.value
);
</script>

<template>
  <Teleport v-if="isMounted" to="#header">
    <div class="w-full flex justify-between items-center">
      <div class="text-md text-nowrap text-xl">Профили осмотров</div>

      <div class="flex items-center gap-2">
        <UiSearch
          v-model="pageFilters.search"
          class="w-72"
          :placeholder="'Поиск по наименованию'"
        />
        <el-link :underline="false" @click="clearFilters">Сбросить всё</el-link>
      </div>
      <el-button type="primary" @click="handleCreateProfile">{{
        "Добавить"
      }}</el-button>
    </div>
  </Teleport>

  <div class="settings-inspection-profiles">
    <el-table
      v-loading="loading"
      :data="profiles"
      border
      style="width: 100%"
      @row-click="(row) => handleEditProfile(row)"
    >
      <el-table-column prop="name" label="Название профиля" min-width="200">
        <template #default="{ row }">
          <div class="flex items-center gap-1">
            {{ row.name }}
            <el-dropdown
              v-if="isDefaultProfile(row)"
              placement="top"
              class="align-middle"
            >
              <el-link
                :icon="QuestionFilled"
                :underline="false"
                class="h-[12px] text-gray-500 focus:outline-none transition-opacity"
              />
              <template #dropdown>
                <el-dropdown-menu class="max-w-[324px] pr-3 pl-3 pt-1 pb-1">
                  Для всех автомобилей автоматически устанавливается стандартный
                  профиль осмотров. При необходимости его можно заменить, создав
                  и выбрав другой профиль в карточке автомобиля в разделе
                  "Осмотры а/м".
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </template>
      </el-table-column>

      <el-table-column label="Осмотр в парке каждые: (дни)" min-width="250">
        <template #default="{ row }">
          {{
            row.enabled_inspection_types.includes("weekly")
              ? (row.frequency_weekly ?? 0)
              : "-"
          }}
        </template>
      </el-table-column>

      <el-table-column label="Мобильный осмотр каждые: (дни)" min-width="250">
        <template #default="{ row }">
          {{
            row.enabled_inspection_types.includes("mobile")
              ? (row.frequency_mobile ?? 0)
              : "-"
          }}
        </template>
      </el-table-column>

      <el-table-column width="90" align="center">
        <template #default="{ row }">
          <div class="flex justify-center gap-2">
            <el-icon
              class="cursor-pointer"
              v-if="!isDefaultProfile(row)"
              @click.prevent.stop="handleDeleteProfile(row)"
            >
              <Delete />
            </el-icon>
          </div>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination
      v-if="totalItems > pageFilters.limit"
      v-model:current-page="pageFilters.page"
      v-model:page-size="pageFilters.limit"
      :page-sizes="[10, 20, 50, 100]"
      layout="total, sizes, prev, pager, next"
      :total="totalItems"
      @size-change="loadProfiles"
      @current-change="loadProfiles"
      class="mt-4 flex justify-end"
    />

    <!-- Модальное окно создания/редактирования профиля -->
    <InspectionProfileForm
      v-if="showCreateModal"
      :profile="editingProfile"
      @close="handleModalClose"
    />
  </div>
</template>
