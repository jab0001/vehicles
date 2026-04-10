import useApi from "@/composables/useApi";
import type { IPagination } from "@/types/apiDefault";
import type {
  ICarBrand,
  ICarModel,
  ICarColor,
  ICarType,
} from "@/types/referenceBooks";
import { computed, ref } from "vue";

export const useReferenceBooks = () => {
  const {
    response: carBrandsResponse,
    loading: isCarBrandsLoading,
    request: fetchCarBrands,
  } = useApi<IPagination<ICarBrand>>({
    url: "/api/v1/reference_books/brands?limit=0",
    method: "GET",
  });

  const {
    response: carModelsResponse,
    loading: isCarModelsLoading,
    request: fetchCarModels,
  } = useApi<IPagination<ICarModel>>({
    url: "/api/v1/reference_books/car_models?limit=0",
    method: "GET",
  });

  const {
    response: carColorsResponse,
    loading: isCarColorsLoading,
    request: fetchCarColors,
  } = useApi<IPagination<ICarColor>>({
    url: "/api/v1/reference_books/colors",
    method: "GET",
  });

  const {
    response: carTypesResponse,
    loading: carTypesLoading,
    request: fetchCarTypes,
  } = useApi<IPagination<ICarType>>({
    url: "/api/v1/reference_books/vehicle_types",
    method: "GET",
  });

  const {
    response: сountriesCodesResponse,
    loading: сountriesCodesLoading,
    request: fetchCountriesCodes,
  } = useApi<string[]>({
    url: "/api/v1/reference_books/countries-codes",
    method: "GET",
  });

  const {
    response: mileageSourcesResponse,
    loading: mileageSourcesLoading,
    request: fetchMileageSources,
  } = useApi<Record<string, { name: string; group: string }>>({
    url: "/api/v1/reference_books/mileage_sources",
    method: "GET",
  });

  const regionName = ref(new Intl.DisplayNames(["ru"], { type: "region" }));

  const carBrands = computed(() => {
    return carBrandsResponse.value?.items ?? [];
  });

  const mileageSources = computed(() => {
    return mileageSourcesResponse.value;
  });

  const carModels = computed(() => {
    return carModelsResponse.value?.items ?? [];
  });

  const carColors = computed(() => {
    return carColorsResponse.value?.items ?? [];
  });

  const carTypes = computed(() => {
    return carTypesResponse.value?.items ?? [];
  });

  const сountriesCodes = computed(() => {
    const priorityCodes = new Set([
      "RU",
      "BY",
      "AZ",
      "AM",
      "KZ",
      "KG",
      "TJ",
      "UZ",
    ]);
    return (
      сountriesCodesResponse.value
        ?.sort((a, b) => {
          if (a === "RU" || b === "RU") return a === "RU" ? -1 : 1;
          const aPriority = priorityCodes.has(a) ? 0 : 1;
          const bPriority = priorityCodes.has(b) ? 0 : 1;
          return aPriority - bPriority || a.localeCompare(b);
        })
        ?.map((code) => ({
          value: code,
          label: regionName.value.of(code),
        })) ?? []
    );
  });

  const getCarBrandById = (id: number) => {
    const brand = carBrands.value.find((brand) => brand.id === id);
    return brand ? brand.brand : "-";
  };

  const getCarModelById = (id: number): string => {
    const model = carModels?.value.find((model) => model.id === id);
    return model ? model.car_model : "-";
  };

  const getCarColorById = (id: number): string => {
    const color = carColors?.value.find((color) => color.id === id);
    return color ? color.color : "-";
  };

  const getCarTypeById = (id: number): string => {
    const type = carTypes?.value.find((type) => type.id === id);
    return type ? type.vehicle_type : "-";
  };

  return {
    carBrands,
    carModels,
    carColors,
    carTypes,
    сountriesCodes,
    regionName,
    isCarModelsLoading,
    isCarBrandsLoading,
    isCarColorsLoading,
    carTypesLoading,

    fetchCarBrands,
    fetchCarModels,
    fetchCarColors,
    fetchCarTypes,
    fetchCountriesCodes,
    getCarBrandById,
    getCarModelById,
    getCarColorById,
    getCarTypeById,

    mileageSources,
    fetchMileageSources,
  };
};
