import axios, { type AxiosRequestConfig, type AxiosResponse } from "axios";
import { useAuth } from "@/composables/UseAuth";

export const AUTH_ENDPOINT = import.meta.env.VITE_AUTH_API_URL;
export const MAIN_ENDPOINT = import.meta.env.VITE_MAIN_API_URL;
export const NOTIFICATIONS_ENDPOINT = import.meta.env.VITE_NOTIFICATION_API_URL;
export const IS_DEV = import.meta.env.DEV;

// const endpoint = import.meta.env.VITE_API_URL;
// axios.defaults.baseURL = endpoint;

axios.interceptors.request.use((config) => {
  const { token } = useAuth();
  if (!config.headers["Authorization"] && token.value?.access_token) {
    config.headers["Authorization"] = `Bearer ${token.value.access_token}`;
  }
  return config;
});

axios.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // const response = error.response as AxiosResponse;
    // const requestConfig = error.config as AxiosRequestConfig;
    return Promise.reject(error);
  }
);

export default axios;
