import * as t from "@/types/user";
import useApi from "./useApi";
import { provideAbility, Can, useAbility } from "@casl/vue";
import { AbilityBuilder, defineAbility } from "@casl/ability";
import { AppAbility } from "@/types/appAbility";
import { computed, ref, watch } from "vue";
import { getUserFullname } from "@/helpers/fullname.helpers";
import { ElNotification } from "element-plus";
import { useRolesApi } from "./useRolesApi";
import type { IRole } from "@/types/roles";

export const useUser = () => {
  const {
    fetch: fetchUserProfile,
    data: userProfile,
    loading: userProfileLoading,
    error: userProfileError,
  } = useUserProfile();

  // Получение списка пользователей
  const {
    request: fetchUsers,
    loading: fetchUsersLoading,
    response: users,
  } = useApi<t.IUser[]>({
    url: "/api/v1/company_group/users",
    method: "GET",
  });

  const {
    request: fetchPublicProfiles,
    loading: fetchPublicProfilesLoading,
    response: public_profiles,
  } = useApi<t.IPublicProfiles[]>({
    url: "/api/v1/company_group/users/public-profiles",
    method: "GET",
  });

  const {
    request: updateUsers,
    loading: updateUsersLoading,
    response: usersupdateUsers,
  } = useApi<
    t.IUser[],
    { first_name: string; last_name: string; middle_name: string }
  >({
    url: "/api/v1/user/profile",
    method: "PUT",
  });

  const updateProfile = async ({
    last_name,
    first_name,
    middle_name,
  }: {
    last_name: string;
    first_name: string;
    middle_name: string;
  }): Promise<void> => {
    try {
      await updateUsers({
        first_name,
        last_name,
        middle_name,
      });

      ElNotification({
        title: "Успешный запрос",
        message: "Данные профиля успешно обновлены",
        type: "success",
      });
    } catch (e: any) {
      ElNotification({
        title: "Ошибка",
        message: e.message || "Произошла ошибка, обратитесь к администратору",
        type: "error",
      });
    }
  };

  async function getUserById(id: number): Promise<t.IUser | undefined> {
    if (!users.value) {
      await fetchUsers();
    }

    return users.value?.find((user) => user.id == id);
  }

  const ability = defineAbility((can, cannot) => {
    can("create", "all");
    can("read", "all");
    can("update", "all");
    can("delete", "all");
  });

  const roles = ref<IRole[]>([
    { id: 1, name: "Механик", description: "Доступ к техническим функциям" },
    { id: 2, name: "Менеджер", description: "Управление автопарком" },
    { id: 3, name: "Финансист", description: "Доступ к финансовым операциям" },
    {
      id: 4,
      name: "Администратор",
      description: "Доступ ко всему (кроме работы с пользователями и ролями)",
    },
  ]);

  watch([userProfile, roles], ([v]) => {
    const { can, cannot, rules } = new AbilityBuilder(AppAbility);

    // Проверяем роль в settings.role
    if (v?.profile?.settings?.role) {
      const roleId = v.profile.settings.role;
      const role = roles.value.find((item) => item.id == roleId);

      // Роль 1: Механик
      if (roleId === 1) {
        // Базовые разрешения для чтения
        // can("read", "Dashboard");
        can("read", "Vehicle");
        can("read", "Driver");

        // Специфичные разрешения для механика
        can("create", "Inspection");
        can("read", "Inspection");
        can("update", "Inspection");

        can('read', 'OnLine');
        can('create', 'OnLine');
        can('update', 'OnLine');
      }

      // Роль 2: Менеджер
      else if (roleId === 2) {
        // Базовые разрешения
        can("read", "Dashboard");
        can("read", "OnLine");
        can("read", "Vehicle");
        can("read", "Driver");
        can("read", "BalanceOperation");

        // Специфичные разрешения для менеджера
        can("create", "Vehicle");
        can("create", "Driver");
        // can("create", "Contract");
        // can("read", "Contract");
        can("create", "BalanceOperationDeposit"); // Только пополнение
      }

      // Роль 3: Финансист
      else if (roleId === 3) {
        // Полный доступ ко всему
        can("create", "all");
        can("read", "all");
        can("update", "all");
        can("delete", "all");
      }

      // Роль 4: Администратор (по умолчанию)
      else if (roleId && role && role.permissions) {
        role.permissions.forEach((permission) => {
          const [subject, action] = permission.split(".");
          if (subject && action) {
            // @ts-ignore
            can(action, subject);
          }
        });
      } else {
        // Полный доступ ко всему
        can("create", "all");
        can("read", "all");
        can("update", "all");
        can("delete", "all");
      }

      if (!v.permissions.includes("edit_cg_users")) {
        cannot("read", "User");
        cannot("read", "Role");
      }

      // @ts-ignore
      ability.update(rules);
    } else if (v?.company_group_role == 2) {
      can("create", "all");
      can("update", "all");
      can("delete", "all");

      cannot("delete", "BalanceOperation");
      cannot("update", "BalanceOperation");
      can("read", "Dashboard");
      can("read", "OnLine");
      can("read", "Vehicle");
      can("read", "Driver");
      can("read", "BalanceOperation");

      if (!v.permissions.includes("edit_cg_users")) {
        cannot("read", "User");
        cannot("read", "Role");
      }

      // @ts-ignore
      ability.update(rules);
    } else {
      can("create", "all");
      can("read", "all");
      can("update", "all");
      can("delete", "all");

      // @ts-ignore
      ability.update(rules);
    }
  });

  const userProfileLocalCurrencySymbol = computed(() => {
    return userProfile.value?.country?.toLowerCase() === "kz" ? "₸" : "₽";
  });

  const userProfileLocalINNString = computed(() => {
    return userProfile.value?.country?.toLowerCase() === "kz" ? "ИИН" : "ИНН";
  });
  const userProfileLocation = computed<t.UserProfileLocation | undefined>(
    () => {
      const country = userProfile.value?.country?.toLowerCase();
      return country === "ru" || country === "kz" ? country : undefined;
    }
  );

  // Получение полного имени пользователя
  const getFullName = (user?: t.IUser) => {
    if (!user) return "Без имени";

    // Сначала проверяем данные в корне объекта
    if (user.first_name || user.last_name || user.middle_name) {
      return getUserFullname(user.last_name, user.first_name, user.middle_name);
    }

    // Затем проверяем данные в profile
    if (user.profile) {
      return getUserFullname(
        user.profile.last_name,
        user.profile.first_name,
        user.profile.middle_name
      );
    }

    return "Без имени";
  };

  // Получение роли пользователя
  const getUserRole = (user?: t.IUser) => {
    // // Проверяем наличие роли в корне объекта
    // if (user.role) {
    //   return getRoleName(user.role);
    // }

    // Проверяем наличие роли в settings
    if (user?.profile?.settings?.role) {
      return getRoleName(user.profile.settings.role);
    }

    return "Администратор";
  };
  const { fetchRoles, fetchRolesLoading, rolesResponse } = useRolesApi();
  fetchRoles();
  watch(rolesResponse, () => {
    if (rolesResponse.value?.items)
      roles.value = [
        ...roles.value,
        ...rolesResponse.value.items.map((item) => ({
          ...item,
          id: item.id + 4,
        })),
      ];
  });

  // Получение названия роли
  const getRoleName = (roleId: number) => {
    const role = roles.value.find((r) => r.id === roleId);
    return role?.name || "Неизвестная роль";
  };

  return {
    fetchUserProfile,
    userProfile,
    userProfileLoading,
    userProfileError,
    updateProfile,

    ability,

    userProfileLocalCurrencySymbol,
    userProfileLocalINNString,
    userProfileLocation,

    fetchUsers,
    fetchUsersLoading,
    users,

    fetchPublicProfiles,
    fetchPublicProfilesLoading,
    public_profiles,

    getUserById,
    getFullName,
    getUserRole,
    getRoleName,
  };
};

export const useUserProfile = () => {
  const {
    request: fetch,
    response: data,
    loading,
    error,
  } = useApi<t.IUser>({
    url: "/api/v1/user/profile",
    method: "GET",
  });
  return { fetch, data, loading, error };
};

export const useUserAbility = () => useAbility<AppAbility>();
