<script lang="ts" setup>
import { ref, onMounted, computed } from "vue";
import { useAppStore } from "@/stores/appStore";
import { useMounted } from "@vueuse/core";
import { ElMessage, ElMessageBox } from "element-plus";
import { View, Edit, Delete, Plus } from "@element-plus/icons-vue";
import useApi from "@/composables/useApi";
import type { IUser } from "@/types/user";
import { getUserFullname } from "@/helpers/fullname.helpers";
import { useUserStore } from "@/stores/userStore";
import { storeToRefs } from "pinia";
import { AUTH_ENDPOINT } from "@/api";

// Состояние компонента
const isMounted = useMounted();
const searchQuery = ref("");
const store = useUserStore();
const { fetchUsers, getFullName, getUserRole } = store;
const { users, fetchUsersLoading } = storeToRefs(store);
const loading = ref(false);
const showInactiveUsers = ref(false);

// Активация/деактивация пользователя
const { request: toggleUserStatus, loading: toggleUserStatusLoading } = useApi<
  IUser,
  {
    active: boolean;
    email: string;
    role: number;
    user_id: number;
  }
>({
  baseURL: AUTH_ENDPOINT,
  dynamicUrl: (params) => `/api/v1/security/users/${params.user_id}`,
  method: "PUT",
});

// Загрузка пользователей
const loadUsers = async () => {
  loading.value = true;
  try {
    await fetchUsers();
  } catch (error) {
    ElMessage.error("Не удалось загрузить список пользователей");
    console.error(error);
  } finally {
    loading.value = false;
  }
};

// Обработка изменения статуса пользователя
const handleToggleStatus = async (user: IUser) => {
  try {
    await ElMessageBox.confirm(
      `Вы уверены, что хотите ${user.active ? "деактивировать" : "активировать"} пользователя ${user.email}?`,
      "Подтверждение",
      {
        confirmButtonText: "Да",
        cancelButtonText: "Отмена",
        type: "warning",
      }
    );

    await toggleUserStatus({
      active: !user.active,
      email: user.email,
      role: user.role,
      user_id: user.id,
    });

    ElMessage.success(
      `Пользователь ${user.active ? "деактивирован" : "активирован"}`
    );
    loadUsers();
  } catch (error) {
    if (error !== "cancel") {
      ElMessage.error("Не удалось изменить статус пользователя");
      console.error(error);
    }
  }
};

// Фильтрованные пользователи
const filteredUsers = computed(() => {
  let result = [...(users.value ?? [])].sort((a, b) => a.id - b.id);

  // Фильтр по активности
  if (!showInactiveUsers.value) {
    result = result.filter((user) => user.active);
  }

  // Фильтр по поисковому запросу
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter(
      (user) =>
        user.email.toLowerCase().includes(query) ||
        getFullName(user).toLowerCase().includes(query) ||
        (user.phone && user.phone.toLowerCase().includes(query))
    );
  }

  return result;
});

// Обработчики действий
const { setReferenceBookUsersCreateHash, setReferenceBookUsersDetailsHash } =
  useAppStore();

const handleCreate = () => {
  setReferenceBookUsersCreateHash();
};

const handleEdit = (user: IUser) => {
  setReferenceBookUsersDetailsHash(user.id);
};

const handleView = (user: IUser) => {
  setReferenceBookUsersDetailsHash(user.id);
};

// Загрузка данных при монтировании компонента
onMounted(() => {
  loadUsers();
});
</script>

<template>
  <div class="h-full flex flex-col">
    <!-- Заголовок и кнопки управления -->
    <Teleport v-if="isMounted" to="#header">
      <div class="flex justify-between items-center w-full">
        <div class="text-md text-nowrap text-xl">Пользователи</div>
        <div class="flex items-center gap-3">
          <el-input
            v-model="searchQuery"
            placeholder="Поиск пользователя..."
            class="w-56"
            clearable
          >
            <template #prefix>
              <el-icon class="el-input__icon"><i-ep-search /></el-icon>
            </template>
          </el-input>

          <el-checkbox v-model="showInactiveUsers">
            Показать неактивных
          </el-checkbox>
        </div>

        <el-button type="primary" @click="handleCreate">
          <el-icon class="mr-1"><Plus /></el-icon>
          Добавить пользователя
        </el-button>
      </div>
    </Teleport>

    <!-- Таблица пользователей -->
    <div class="flex-1 overflow-auto">
      <el-table
        v-loading="loading || fetchUsersLoading || toggleUserStatusLoading"
        :data="filteredUsers"
        border
        style="width: 100%"
        :empty-text="'Пользователи не найдены'"
        row-key="id"
      >
        <el-table-column label="ФИО" min-width="200">
          <template #default="{ row }">
            <div class="flex flex-col">
              <span class="font-medium">{{ getFullName(row) }}</span>
              <span class="text-gray-500 text-sm">{{ row.email }}</span>
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="phone" label="Телефон" min-width="150">
          <template #default="{ row }">
            {{ row.phone || "Не указан" }}
          </template>
        </el-table-column>

        <el-table-column label="Роль" min-width="120">
          <template #default="{ row }">
            {{ getUserRole(row) }}
          </template>
        </el-table-column>

        <el-table-column label="Статус" width="120">
          <template #default="{ row }">
            <el-tag :type="row.active ? 'success' : 'danger'">
              {{ row.active ? "Активен" : "Неактивен" }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="Действия" width="180" fixed="right">
          <template #default="{ row }">
            <div class="flex gap-2">
              <el-button
                type="warning"
                circle
                @click="handleEdit(row)"
                title="Редактировать"
              >
                <el-icon><Edit /></el-icon>
              </el-button>
              <el-button
                :type="row.active ? 'danger' : 'success'"
                circle
                @click="handleToggleStatus(row)"
                :title="row.active ? 'Деактивировать' : 'Активировать'"
              >
                <el-icon><Delete /></el-icon>
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<style scoped>
.el-table {
  --el-table-border-color: var(--el-border-color-lighter);
}
</style>
