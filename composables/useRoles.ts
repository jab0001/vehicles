import type { IRole } from "@/types/roles";
import { ref } from "vue";

export const useRoles = () => {
  // Predefined roles
  const predefinedRoles = ref<IRole[]>([
    {
      id: 1,
      name: "Механик",
      description: "Проведение осмотров, просмотр вкладок автомобиля, водителя",
      permissions: [
        "Inspection.create",
        "Inspection.read",
        "Vehicle.read",
        "Driver.read",
        "Document.read",
      ],
    },
    {
      id: 2,
      name: "Менеджер",
      description:
        "Управление автомобилями и водителями, финансовые операции (только пополнение)",
      permissions: [
        "Vehicle.create",
        "Vehicle.read",
        "Driver.create",
        "Driver.read",
        "OnLine.create",
        "Document.read",
        "BalanceOperation.read",
        "BalanceOperationDeposit.create",
      ],
    },
    {
      id: 3,
      name: "Финансист",
      description: "Полный доступ к системе",
      permissions: ["*"],
    },
    {
      id: 4,
      name: "Администратор",
      description: "Полный доступ к системе",
      permissions: ["*"],
    },
  ]);

  const permissionMap: Record<string, string> = {
    "Inspection.create": "Создание осмотров",
    "Inspection.read": "Просмотр осмотров",
    "Vehicle.create": "Создание автомобилей",
    "Vehicle.read": "Просмотр автомобилей",
    "Vehicle.update": "Редактирование автомобилей",
    "Vehicle.delete": "Удаление автомобилей",
    "Driver.create": "Создание водителей",
    "Driver.read": "Просмотр водителей",
    "Driver.assign": "Назначение водителей",
    "Driver.update": "Редактирование водителей",
    "Driver.delete": "Удаление водителей",
    "Document.read": "Просмотр документов",
    "OnLine.create": "Выпуск/Снятие водителя с линии",
    "BalanceOperation.read": "Просмотр расчетов",
    "BalanceOperationDeposit.create": "Пополнение",
    "BalanceOperationCredit.create": "Списание",
  };

  const permissionGroups = [
    {
      name: "Автомобили",
      permissions: [
        { id: "Vehicle.read", label: "Просмотр автомобилей" },
        { id: "Vehicle.create", label: "Создание автомобилей" },
        { id: "Vehicle.update", label: "Редактирование автомобилей" },
        { id: "Vehicle.delete", label: "Удаление автомобилей" },
      ],
    },
    {
      name: "Водители",
      permissions: [
        { id: "Driver.read", label: "Просмотр водителей" },
        { id: "Driver.create", label: "Создание водителей" },
        { id: "Driver.update", label: "Редактирование водителей" },
        { id: "Driver.delete", label: "Удаление водителей" },
      ],
    },
    {
      name: "Выпуск на линию",
      permissions: [
        { id: "OnLine.create", label: "Выпуск/Снятие водителя с линии" },
      ],
    },
    {
      name: "Осмотры",
      permissions: [
        { id: "Inspection.read", label: "Просмотр осмотров" },
        { id: "Inspection.create", label: "Создание осмотров" },
        // { id: "Inspection.update", label: "Редактирование осмотров" },
      ],
    },
    {
      name: "Документы",
      permissions: [{ id: "Document.read", label: "Просмотр документов" }],
    },
    {
      name: "Расчеты",
      permissions: [
        { id: "BalanceOperation.read", label: "Просмотр расчетов" },
        { id: "BalanceOperationDeposit.create", label: "Пополнение" },
        { id: "BalanceOperationCredit.create", label: "Списание" },
      ],
    },
  ];

  return { predefinedRoles, permissionMap, permissionGroups };
};
