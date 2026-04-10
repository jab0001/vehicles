import { reactive, ref } from "vue";
import { ElNotification, type FormInstance, type FormRules } from "element-plus";
import { useAppStore } from "@/stores/appStore";
import useApi from "@/composables/useApi";
import type { IParkingPlace, IParkingPlacesForm } from "@/types/parkingPlaces";

export const useParkingPlaces = () => {
  const {
    loading: createParkingPlacesLoading,
    error: createParkingPlacesError,
    response: createParkingPlacesResponse,
    request: createParkingPlacesRequest,
  } = useApi<IParkingPlace, IParkingPlacesForm>({
    url: "/api/v1/parking_places",
    method: "POST",
  });

  const {
    loading: fetchParkingPlacesLoading,
    error: fetchParkingPlacesError,
    response: fetchParkingPlacesResponse,
    request: fetchParkingPlacesRequest,
  } = useApi<IParkingPlace[]>({
    url: "/api/v1/parking_places",
    method: "GET",
  });

  const { hideDrawer } = useAppStore();

  const emptyParkingPlacesForm: IParkingPlacesForm = {
    name: "",
  };
  const parkingPlacesForm = ref({ ...emptyParkingPlacesForm });
  const parkingPlacesRef = ref<FormInstance>();
  const parkingPlacesRules = reactive<FormRules>({
    name: [
      {
        required: true,
        message: "Введите наименование",
        trigger: "blur",
      },
    ],
  });

  const createParkingPlace = async () => {
    try {
      await createParkingPlacesRequest({
        ...parkingPlacesForm.value,
      });
      hideDrawer();
      ElNotification({
        title: "Успешный запрос",
        message: "Стоянка добавлена",
        type: "success",
      });
      fetchParkingPlacesRequest();
    } catch (e) {
      ElNotification({
        title: createParkingPlacesError.value?.title ?? "Ошибка",
        message:
          createParkingPlacesError.value?.message ??
          "Произошла ошибка, обратитесь к администратору",
        type: "error",
      });
    }
  };

  const clearForm = () => {
    parkingPlacesForm.value = {
      ...emptyParkingPlacesForm,
    };
  };

  return {
    parkingPlacesForm,
    parkingPlacesRules,
    parkingPlacesRef,
    clearForm,

    fetchParkingPlacesResponse,
    fetchParkingPlacesLoading,
    fetchParkingPlacesRequest,

    createParkingPlacesLoading,
    createParkingPlace,
  };
};
