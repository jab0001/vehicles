import type { TFineLocalStatus, TFineStatus } from "@/types/fines";
import type { TTollRoadLocalStatus, TTollRoadStatus } from "@/types/tollRoads";

type TValueType =
  | "fineStatus" // Статус штрафa в ГИБДД
  | "fineLocalStatus" // Статус штрафa водителя
  | "tollRoadStatus" // Статус в ЦОДД платной дороги
  | "tollRoadLocalStatus"; // Статус платной дороги водителя

// TODO
// | "manufacture" // Индикация даты прохождения техосмотра
// | "registrationCertificateDate" // Индикация срока истчения лицензии
// Индикация даты истечения ОСАГО
// Индикация КМ до прохождения ТО
type TReturnedVStyleType = "error" | "warning" | "";

export const getStyleType = (
  type: TValueType,
  value:
    | TFineLocalStatus
    | TFineStatus
    | TTollRoadLocalStatus
    | TTollRoadStatus
    | number
): TReturnedVStyleType => {
  // fines
  if (type === "fineStatus") {
    if (value === "not_paid") {
      return "error";
    }
  }
  if (type === "fineLocalStatus") {
    if (value === "not_paid") {
      return "warning";
    }
  }

  // toll roads
  if (type === "tollRoadStatus") {
    if (value === "not_paid") {
      return "error";
    }
  }
  if (type === "tollRoadLocalStatus") {
    if (value === "not_paid") {
      return "warning";
    }
  }

  return "";
};
