import { ref, type Ref } from "vue";
import _ from "lodash";
import type { AxiosError, RawAxiosRequestConfig, AxiosResponse } from "axios";
import axios, { MAIN_ENDPOINT, NOTIFICATIONS_ENDPOINT } from "@/api/index";
import { useAuth } from "@/composables/UseAuth";
import router from "@/router";

export interface IError {
  title: string;
  message: string;
  code?: number;
}
export interface IApiResult<T> {
  data?: T;
}

export interface IApiError {
  req_id: string;
  resp_datetime: string;
  error: {
    name: string;
    extra_info: null | string;
  };
  data: null;
}

export interface IConfig<P = any> extends RawAxiosRequestConfig<P> {
  dynamicUrl?: (p: P) => string;
  repeatable?: boolean;
  postQueryParams?: boolean;
  postBodyParams?: boolean;
}

export interface UsableAPI<T, P> {
  response: Ref<T | undefined>;
  request: (params?: P) => Promise<T>;
  error: Ref<IError | undefined>;
  loading: Ref<boolean>;
}

let isRefreshing = false;
let refreshPromise: Promise<any> | null = null;

export default function useApi<T, P = any>(
  config: IConfig<P>
): UsableAPI<T, P> {
  const response: Ref<T | undefined> = ref();
  const error = ref<IError | undefined>();
  const loading = ref(false);

  const logoutRedirect = () => {
    if (location.pathname.includes("app-driver")) {
      router.push({ name: "AppDriverAuthStart" });
    } else if (window.location.pathname != "/recovery") {
      router.push({ name: "Login" });
    }
  };
  const refreshTokenAndRetry = async (
    retryRequest: () => Promise<T>
  ): Promise<T> => {
    const { token, refreshToken, removeToken } = useAuth();

    if (!isRefreshing) {
      isRefreshing = true;
      refreshPromise = refreshToken({
        refresh_token: token.value!.refresh_token,
        session_uuid: token.value!.session_uuid,
      })
        .then((newToken) => {
          token.value = newToken;
        })
        .finally(() => {
          isRefreshing = false;
          refreshPromise = null;
        });
    }

    try {
      await refreshPromise;
    } catch (error) {
      removeToken();
      logoutRedirect();
      throw new Error("refreshTokenErr");
    }
    return retryRequest();
  };

  const request = async (params?: P): Promise<T> => {
    const { token } = useAuth();
    const isRepeatable =
      typeof config.repeatable == "undefined" || config.repeatable;

    try {
      loading.value = true;
      if (!config.baseURL) {
        config.baseURL = MAIN_ENDPOINT;
      }
      if (config.dynamicUrl && params) {
        config.url = config.dynamicUrl(params);
      }

      if (
        (config.method === "GET" ||
          config.method === "DELETE" ||
          config.postQueryParams) &&
        !config.postBodyParams
      ) {
        config.params = _.cloneDeep(params);
        config.paramsSerializer = {
          indexes: null,
        };
      } else {
        config.data = _.cloneDeep(params);
      }
      const res = await axios.request<IApiResult<T>>(config);
      if (config.responseType || config.baseURL === NOTIFICATIONS_ENDPOINT) {
        response.value = res.data as T;
        return res.data as T;
      } else {
        console.log({ res });
        if (res.data && "data" in res.data) {
          response.value = res.data?.data as T;
        } else {
          response.value = res.data as T;
        }
        return response.value;
      }
    } catch (e: any) {
      const response = e.response as AxiosResponse;
      console.log(response);

      if (
        response &&
        response.data?.data?.error_code === "unauthorized" &&
        isRepeatable
      ) {
        if (token.value) {
          return refreshTokenAndRetry(() => request(params));
        } else {
          logoutRedirect();
        }
      } else {
        let message = e.message;
        console.log({ e });
        if (e.response?.data?.data?.user_message) {
          message = e.response?.data?.data?.user_message + "\n";
        }
        if (e.response?.data?.data?.payload?.validation_errors) {
          message += e.response?.data?.data?.payload?.validation_errors
            .map((item: any) => item.msg)
            .join("\n");
        }
        error.value = {
          title: "Ошибка",
          message,
          code: e.response?.status,
        };
      }
      throw e.response?.data ?? new Error(e);
    } finally {
      loading.value = false;
    }
  };

  return { response, request, error, loading };
}
