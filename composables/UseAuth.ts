import { useStorage, StorageSerializers } from "@vueuse/core";
import { jwtDecode } from "jwt-decode";
import router from "@/router";

import useApi from "@/composables/useApi";
import * as t from "@/types/auth";
import { AUTH_ENDPOINT } from "@/api";
import { useAppBreakpoints } from "./useApp";
import { ElNotification } from "element-plus";
import { watch } from "vue";
// import { useCompaniesManagement } from "./useCompaniesManagement";
// import { useCompaniesManagementStore } from "@/stores/companiesManagementStore";
interface IDecodeToken {
  exp: number;
  session_uuid: string;
}

export const useAuth = () => {
  /**
   * app auth
   */
  const {
    loading: loginLoading,
    request: onLoginRequest,
    error: onLoginError,
  } = useApi<t.IAuthLoginData, t.IAuthLoginParams>({
    baseURL: AUTH_ENDPOINT,
    url: "/api/v1/security/auth/login",
    headers: {
      "Content-Language": "ru"
    },
    method: "POST",
  });

  const {
    loading: recoveryStartLoading,
    request: onRecoveryStartRequest,
    error: onRecoveryStartError,
  } = useApi<{ success: boolean }, { email: string }>({
    baseURL: AUTH_ENDPOINT,
    url: "/api/v1/security/auth/recover",
    headers: {
      "Content-Language": "ru"
    },
    method: "POST",
  });

  const {
    loading: recoveryChangeLoading,
    request: onRecoveryChangeRequest,
    error: onRecoveryChangeError,
  } = useApi<
    { success: boolean },
    { new_password: string; recover_id: string }
  >({
    baseURL: AUTH_ENDPOINT,
    url: "/api/v1/security/auth/recover/confirm",
    headers: {
      "Content-Language": "ru"
    },
    method: "POST",
  });

  const { request: refreshToken } = useApi<
    t.IAuthLoginData,
    t.IAuthTokenRefreshParams
  >({
    baseURL: AUTH_ENDPOINT,
    url: "/api/v1/security/auth/token/refresh",
    method: "POST",
    repeatable: false,
    postQueryParams: true,
  });

  /**
   * driver app auth
   */
  const { loading: checkRegisterLoading, request: checkAppDriverRegister } =
    useApi<boolean, t.IAuthAppDriverPhoneParams>({
      baseURL: AUTH_ENDPOINT,
      url: "/api/v1/security/driver_app/is_registered",
      method: "GET",
    });
  const {
    response: startPhoneVerificationResponse,
    request: startPhoneVerification,
  } = useApi<t.IAuthAppDriverVerificationData, t.IAuthAppDriverPhoneParams>({
    baseURL: AUTH_ENDPOINT,
    url: "/api/v1/security/driver_app/phone/verification/start",
    method: "GET",
  });
  const {
    loading: completePhoneVerificationLoading,
    request: completePhoneVerification,
    error: completePhoneVerificationError,
  } = useApi<
    t.IAuthAppDriverVerificationData,
    t.IAuthAppDriverVerificationCompleteParams
  >({
    baseURL: AUTH_ENDPOINT,
    url: "/api/v1/security/driver_app/phone/verification/complete",
    method: "POST",
    postQueryParams: true,
  });
  const {
    loading: appDriverRegisterLoading,
    request: onAppDriverRegisterRequest,
  } = useApi<t.IAuthLoginData, t.IAuthAppDriverRegisterParams>({
    baseURL: AUTH_ENDPOINT,
    url: "/api/v1/security/driver_app/password",
    method: "POST",
  });
  const {
    loading: appDriverLoginLoading,
    request: onAppDriverLoginRequest,
    error: onAppDriverLoginError,
  } = useApi<t.IAuthLoginData, t.IAuthAppDriverLoginParams>({
    baseURL: AUTH_ENDPOINT,
    url: "/api/v1/security/driver_app/login",
    method: "POST",
  });
  const { response: appDriverCompanyGroups, request: fetchCompanyGroups } =
    useApi<{ company_groups: Record<string, string> }>({
      baseURL: AUTH_ENDPOINT,
      url: "/api/v1/security/driver_app/available_company_groups",
      method: "GET",
    });
  const { request: chooseCompanyGroup } = useApi<
    string,
    {
      company_group_id: number;
    }
  >({
    baseURL: AUTH_ENDPOINT,
    url: "/api/v1/security/driver_app/choose_company_group",
    method: "POST",
  });

  const { mdAndLarger } = useAppBreakpoints();
  const token = useStorage<t.IAuthLoginData | undefined>(
    "app.token",
    null,
    undefined,
    { serializer: StorageSerializers.object }
  );

  const removeToken = () => {
    localStorage.removeItem("app.token");
  };

  const onLogin = async (data: t.IAuthLoginParams) => {
    try {
      const result = await onLoginRequest(data);
      token.value = result;
      const decodeToken = jwtDecode<IDecodeToken>(result.access_token);
      // await fetchCompaniesManagementList();
      if (mdAndLarger.value) {
        router.push({ name: "Dashboard" });
      } else {
        router.push({ name: "inspections" });
      }
    } catch (error) {
      ElNotification({
        type: "error",
        message: "Неправильный логин или пароль",
      });
      console.log(error);
      return error;
    }
  };

  const onRecoveryStart = async (email: string) => {
    try {
      const result = await onRecoveryStartRequest({ email });

      return result;
    } catch (error) {
      console.log(error);
      return error
    }
  };

  const onRecoveryChange = async (new_password: string, recoveryId: string) => {
    try {
      const result = await onRecoveryChangeRequest({
        new_password,
        recover_id: recoveryId,
      });

      return result;
    } catch (error) {
      console.log(error);
      return error;
    }
  };

  const onAppDriverLogin = async (data: t.IAuthAppDriverLoginParams) => {
    try {
      const result = await onAppDriverLoginRequest(data);
      token.value = result;
      router.push({ name: "AppDriverAuthCompanies" });
    } catch (error) {
      ElNotification.error(onAppDriverLoginError.value?.message);
    }
  };
  const onAppDriverSetPassword = async (
    data: t.IAuthAppDriverRegisterParams
  ) => {
    try {
      const result = await onAppDriverRegisterRequest(data);
      token.value = result;
      router.push({ name: "AppDriverAuthCompanies" });
    } catch (error) {
      console.log(error);
      ElNotification.error(error?.error?.user_message);
    }
  };

  watch(completePhoneVerificationError, (v) => {
    console.log({ v });
    ElNotification.error(v);
  });

  return {
    token,
    loginLoading,
    recoveryStartLoading,
    recoveryChangeLoading,

    removeToken,
    refreshToken,
    onLogin,
    onLoginError,
    onRecoveryStart,
    onRecoveryStartError,
    onRecoveryChange,
    onRecoveryChangeError,

    /** driver app **/
    checkRegisterLoading,
    checkAppDriverRegister,

    appDriverLoginLoading,
    onAppDriverLogin,

    appDriverRegisterLoading,
    onAppDriverSetPassword,

    appDriverCompanyGroups,
    fetchCompanyGroups,
    chooseCompanyGroup,

    startPhoneVerificationResponse,
    completePhoneVerificationLoading,
    startPhoneVerification,
    completePhoneVerification,
  };
};
