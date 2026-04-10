import useApi from "@/composables/useApi";
import { ElNotification } from "element-plus";
import { ref } from "vue";
import type { IRole } from "@/types/roles";

interface IRolesResponse {
  items: IRole[];
  total_pages: number;
  current_page: number;
  page_items: number;
  total_items: number;
}

export const useRolesApi = () => {
  // Get roles list
  const {
    loading: fetchRolesLoading,
    response: rolesResponse,
    request: fetchRoles,
  } = useApi<IRolesResponse, { limit?: number; page?: number }>({
    url: "/api/v1/front/roles",
    method: "GET",
  });

  // Get role details
  // const {
  //   loading: roleDetailsLoading,
  //   response: roleDetailsResult,
  //   request: fetchRoleDetails,
  // } = useApi<IRole, { role_id: number }>({
  //   dynamicUrl: (p) => `/api/v1/front/roles/${p.role_id}`,
  //   method: "GET",
  // });
  const roleDetailsLoading = ref(false);
  const roleDetailsResult = ref<IRole>();
  const fetchRoleDetails = async ({
    role_id,
  }: {
    role_id: number;
  }): Promise<IRole | undefined> => {
    console.log("role_id", role_id, rolesResponse.value);
    roleDetailsLoading.value = true;
    roleDetailsResult.value = rolesResponse.value?.items.find(
      (item) => item.id == role_id - 4
    );
    roleDetailsLoading.value = false;
    return roleDetailsResult.value;
  };

  // Create role
  const {
    loading: createRoleLoading,
    error: createRoleError,
    response: newRole,
    request: createRoleRequest,
  } = useApi<IRole, Omit<IRole, "id">>({
    url: "/api/v1/front/roles",
    method: "POST",
  });

  const createRole = async (role: Omit<IRole, "id">): Promise<void> => {
    try {
      await createRoleRequest(role);
      ElNotification({
        title: "Успешный запрос",
        message: "Роль успешно создана",
        type: "success",
      });
    } catch (e) {
      ElNotification({
        title: createRoleError.value?.title ?? "Ошибка",
        message:
          createRoleError.value?.message ??
          "Произошла ошибка при создании роли, обратитесь к администратору",
        type: "error",
      });
      throw e;
    }
  };

  // Update role
  const {
    loading: updateRoleLoading,
    error: updateRoleError,
    response: updateRoleResponse,
    request: updateRoleRequest,
  } = useApi<IRole, IRole>({
    dynamicUrl: (p) => `/api/v1/front/roles/${p.id}`,
    method: "PUT",
  });

  const updateRole = async (role: IRole): Promise<void> => {
    try {
      await updateRoleRequest(role);
      ElNotification({
        title: "Успешный запрос",
        message: "Роль успешно обновлена",
        type: "success",
      });
    } catch (e) {
      ElNotification({
        title: updateRoleError.value?.title ?? "Ошибка",
        message:
          updateRoleError.value?.message ??
          "Произошла ошибка при обновлении роли, обратитесь к администратору",
        type: "error",
      });
      throw e;
    }
  };

  // Delete role
  const {
    loading: deleteRoleLoading,
    error: deleteRoleError,
    request: deleteRoleRequest,
  } = useApi<void, { role_id: number }>({
    dynamicUrl: (p) => `/api/v1/front/roles/${p.role_id}`,
    method: "DELETE",
  });

  const deleteRole = async (roleId: number): Promise<void> => {
    try {
      await deleteRoleRequest({ role_id: roleId });
      ElNotification({
        title: "Успешный запрос",
        message: "Роль успешно удалена",
        type: "success",
      });
    } catch (e) {
      ElNotification({
        title: deleteRoleError.value?.title ?? "Ошибка",
        message:
          deleteRoleError.value?.message ??
          "Произошла ошибка при удалении роли, обратитесь к администратору",
        type: "error",
      });
      throw e;
    }
  };

  return {
    // List
    fetchRolesLoading,
    rolesResponse,
    fetchRoles,

    // Details
    roleDetailsLoading,
    roleDetailsResult,
    fetchRoleDetails,

    // Create
    createRoleLoading,
    createRole,

    // Update
    updateRoleLoading,
    updateRole,

    // Delete
    deleteRoleLoading,
    deleteRole,
  };
};
