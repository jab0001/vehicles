<script lang="ts" setup>
import { useAppStore } from "@/stores/appStore";
import { useMounted } from "@vueuse/core";
import { ref, onMounted, computed, watch } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { View, Edit, Delete } from "@element-plus/icons-vue";
import { useRoles } from "@/composables/useRoles";
import { useRolesApi } from "@/composables/useRolesApi";
import type { IRole } from "@/types/roles";
import { useRolesApiStore } from "@/stores/rolesStore";
import { storeToRefs } from "pinia";

const isMounted = useMounted();
const { setReferenceBookRolesCreateHash, setReferenceBookRolesDetailsHash } =
  useAppStore();

const { predefinedRoles, permissionMap, permissionGroups } = useRoles();
const { fetchRoles, deleteRole: apiDeleteRole } = useRolesApiStore();
const { fetchRolesLoading, rolesResponse, deleteRoleLoading } =
  storeToRefs(useRolesApiStore());

const loading = computed(
  () => fetchRolesLoading.value || deleteRoleLoading.value
);
const roles = ref<IRole[]>([]);
const pagination = ref({
  currentPage: 1,
  pageSize: 20,
  total: 0,
});

watch(rolesResponse, () => {
  if (rolesResponse.value) {
    console.log("rolesResponse", rolesResponse.value);
    // Combine predefined roles with API roles
    const apiRoles = rolesResponse.value.items || [];

    // Filter out any API roles that have the same IDs as predefined roles
    const uniqueApiRoles = apiRoles
      .map((item) => ({
        ...item,
        id: item.id + 4,
      }))
      .filter(
        (apiRole) =>
          !predefinedRoles.value.some(
            (predefined) => predefined.id === apiRole.id
          )
      );

    roles.value = [...predefinedRoles.value, ...uniqueApiRoles];

    // Update pagination
    pagination.value.total = rolesResponse.value.total_items;
  }
});

const loadRoles = async () => {
  await fetchRoles({
    page: pagination.value.currentPage,
    limit: pagination.value.pageSize,
  });
};

// Function to handle role details view
const handleViewRole = (role: IRole) => {
  // Store the selected role ID in the app store or route params
  setReferenceBookRolesDetailsHash(role.id);
};

// Function to handle role deletion
const handleDeleteRole = (role: IRole) => {
  // For predefined roles, show warning
  if (role.id <= 4) {
    ElMessage({
      message: "Предустановленные роли нельзя удалить",
      type: "warning",
    });
    return;
  }

  ElMessageBox.confirm(
    `Вы уверены, что хотите удалить роль "${role.name}"?`,
    "Подтверждение удаления",
    {
      confirmButtonText: "Удалить",
      cancelButtonText: "Отмена",
      type: "warning",
    }
  )
    .then(async () => {
      try {
        // For predefined roles (in-memory), just filter them out
        if (predefinedRoles.value.some((r) => r.id === role.id)) {
          roles.value = roles.value.filter((r) => r.id !== role.id);
        } else {
          // For API roles, call the delete endpoint
          await apiDeleteRole(role.id - 4);
          // Reload roles after deletion
          await loadRoles();
        }

        ElMessage({
          message: `Роль "${role.name}" успешно удалена`,
          type: "success",
        });
      } catch (error) {
        console.error("Error deleting role:", error);
      }
    })
    .catch(() => {
      // User cancelled the deletion
    });
};

// Format permissions for display
const formatPermissions = (permissions: string[]) => {
  if (permissions.includes("*")) {
    return "Полный доступ";
  }

  return permissions.map((p) => permissionMap[p] || p).join(", ");
};

// Handle page change
const handlePageChange = (page: number) => {
  pagination.value.currentPage = page;
  loadRoles();
};

// Load roles from API
onMounted(() => {
  loadRoles();
});
</script>

<template>
  <Teleport v-if="isMounted" to="#header">
    <div class="w-full flex justify-between items-center mx-auto">
      <div class="text-md text-nowrap text-xl">Роли</div>

      <el-button type="primary" @click="setReferenceBookRolesCreateHash">
        Добавить
      </el-button>
    </div>
  </Teleport>

  <div class="w-full mx-auto mt-6">
    <el-table
      :data="roles"
      style="width: 100%"
      v-loading="loading"
      row-key="id"
    >
      <el-table-column prop="name" label="Название" min-width="120" />
      <el-table-column prop="description" label="Описание" min-width="200" />
      <el-table-column label="Разрешения" min-width="200">
        <template #default="{ row }">
          <el-tooltip
            v-if="row.permissions && row.permissions.length > 0"
            :content="formatPermissions(row.permissions)"
            placement="top"
            :show-after="300"
          >
            <div class="truncate max-w-[200px]">
              {{ formatPermissions(row.permissions) }}
            </div>
          </el-tooltip>
          <span v-else>Нет разрешений</span>
        </template>
      </el-table-column>
      <el-table-column label="Действия">
        <template #default="{ row }">
          <div class="flex gap-2">
            <el-button
              size="small"
              type="warning"
              plain
              @click="handleViewRole(row)"
              title="Редактировать"
            >
              <el-icon><Edit /></el-icon>
            </el-button>
            <el-button
              size="small"
              type="danger"
              plain
              @click="handleDeleteRole(row)"
              title="Удалить"
              :disabled="row.id <= 4"
            >
              <el-icon><Delete /></el-icon>
            </el-button>
          </div>
        </template>
      </el-table-column>
    </el-table>

    <div
      v-if="roles.length === 0 && !loading"
      class="text-center py-8 text-gray-500"
    >
      Роли не найдены
    </div>

    <!-- Pagination -->
    <div
      class="flex justify-center mt-4"
      v-if="pagination.total > pagination.pageSize"
    >
      <el-pagination
        v-model:current-page="pagination.currentPage"
        :page-size="pagination.pageSize"
        :total="pagination.total"
        layout="prev, pager, next"
        @current-change="handlePageChange"
      />
    </div>
  </div>
</template>

<style scoped>
.truncate {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
