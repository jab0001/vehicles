import { ref, watch } from "vue";
import { breakpointsTailwind, useBreakpoints } from "@vueuse/core";
import dayjs from "dayjs";
import { useI18n } from "vue-i18n";
import router from "@/router";

export enum EDrawerContent {
  VehicleCreate = "vehicle-create",
  VehicleDetails = "vehicle-details",
  DriversCreate = "drivers-create",
  DriversDetails = "drivers-details",
  InspectionsCreate = "inspections-create",
  InspectionsDetails = "inspections-details",
  BalanceOperationsCreate = "operation-create",
  BalanceOperationsDetails = "operations-details",
  FinesCreate = "fines-create",
  FinesDetails = "fines-details",
  PaymentTerminalsDetails = "payment-terminals-details",
  AdjustmentsApplicationsDetails = "adjustments-applications-update",
  AdjustmentsApplicationsCreate = "adjustments-applications-create",
  TollRoadsCreate = "toll-road-create",
  TollRoadsDetails = "toll-road-details",
  WorkingShiftsAutomaticCreate = "working-shifts-driver-create",
  SalaryStatementsCreate = "salary-statements-create",
  SalaryStatementsDetails = "salary-statements-details",
  SalaryStatementsDriverDetails = "salary-statements-driver-details",
  DamageCreate = "damage-create",
  DamageDetails = "damage-details",
  StocksNomenclatureCreate = "stocks-nomenclature-create",
  StocksNomenclatureDetails = "stocks-nomenclature-details",
  StocksMovingCreate = "stocks-moving-create",
  StocksMovingDetails = "stocks-moving-details",
  StocksReceiptCreate = "stocks-receipt-create",
  StocksReceiptDetails = "stocks-receipt-details",
  StocksWriteOffCreate = "stocks-write-off-create",
  StocksWriteOffDetails = "stocks-write-off-details",
  StocksPostingCreate = "stocks-posting-create",
  StocksPostingDetails = "stocks-posting-details",
  StocksCostItemsCreate = "stocks-cost-items-create",
  StocksCostItemsDetails = "stocks-cost-items-details",
  RepairCreate = "repair-create",
  RepairDetails = "repair-details",
  MaintenanceCreate = "maintenance-create",
  MaintenanceDetails = "maintenance-details",
  PrintableForm = "printable-form",
  ReferenceBookDismissalCreate = "reference-book-dismissal-create",
  ReferenceBookDismissalDetails = "reference-book-dismissal-details",
  ReferenceBookUsersCreate = "reference-book-users-create",
  ReferenceBookUsersDetails = "reference-book-users-details",
  ReferenceBookRolesCreate = "reference-book-roles-create",
  ReferenceBookRolesDetails = "reference-book-roles-details",
  ReferenceBookRentCreate = "reference-book-rent-create",
  ReferenceBookRentDetails = "reference-book-rent-details",
  ReferenceBookExtraEquipCreate = "reference-book-extra-equip-create",
  ReferenceBookExtraEquipDetails = "reference-book-extra-equip-details",
  ReferenceBookParkingPlacesCreate = "reference-book-parking-places-create",
  ReferenceBookDowntimeReasonCreate = "reference-book-downtime-reason-create",
  ReferenceBookDowntimeReasonDetails = "reference-book-downtime-reason-details",
  ReferenceBookVehicleGroupCreate = "reference-book-vehicle-group-create",
  ReferenceBookVehicleGroupDetails = "reference-book-vehicle-group-details",
  ReferenceBookEquipmentCreate = "reference-book-equipment-create",
  ReferenceBookEquipmentDetails = "reference-book-equipment-details",
  ReferenceBookCheckExtraCreate = "reference-book-check-extra-create",
  ReferenceBookCheckExtraDetails = "reference-book-check-extra-details",
  ReferenceBookInspectionsScheduleCreate = "reference-book-inspections-schedule-create",
  ReferenceBookInspectionsScheduleDetails = "reference-book-inspections-schedule-details",
  ReferenceBookConditionCreate = "reference-book-condition-create",
  ReferenceBookConditionDetails = "reference-book-condition-details",
  ReferenceBookInspectionProfileCreate = "reference-book-inspection-profle-create",
  ReferenceBookInspectionProfileDetails = "reference-book-inspection-profle-details",
  CompaniesCounterpartyCreate = "companies-counterparty-create",
  CompaniesCounterpartyDetails = "companies-counterparty-details",
  PrintableFormsInfo = "printable-forms-info",
  ReferenceBookCashRegistersCreate = "reference-book-cahs-registers-create",
  ReferenceBookCashRegistersDetails = "reference-book-cahs-registers-details",
  ReportsRent = "reports-rent",
  ReportsBalanceOperations = "reports-balance-operations",
  DriverWeekendTemplateCreate = "driver-weekend-template-create",
  ReportsVehicle = "reports-vehicle",
  ReportsFines = "reports-fines",
  StocksCreate = "stocks-create",
  StocksDetails = "stocks-details",
  IntegrationsCreate = "integrations-create",
  IntegrationsDetails = "integrations-details",
  IntegrationTransactionsDetails = "integration-transactions-details",
  IntegrationTransactionsOrderDetails = "integration-transactions-order-details",
}
export enum EDrawerRouteHash {
  VehicleCreate = `#/${EDrawerContent.VehicleCreate}`,
  VehicleDetails = `#/${EDrawerContent.VehicleDetails}`,
  DriversCreate = `#/${EDrawerContent.DriversCreate}`,
  DriversDetails = `#/${EDrawerContent.DriversDetails}`,
  InspectionsCreate = `#/${EDrawerContent.InspectionsCreate}`,
  InspectionsDetails = `#/${EDrawerContent.InspectionsDetails}`,
  BalanceOperationsCreate = `#/${EDrawerContent.BalanceOperationsCreate}`,
  BalanceOperationsDetails = `#/${EDrawerContent.BalanceOperationsDetails}`,
  FinesCreate = `#/${EDrawerContent.FinesCreate}`,
  FinesDetails = `#/${EDrawerContent.FinesDetails}`,
  PaymentTerminalsDetails = `#/${EDrawerContent.PaymentTerminalsDetails}`,
  AdjustmentsApplicationsDetails = `#/${EDrawerContent.AdjustmentsApplicationsDetails}`,
  AdjustmentsApplicationsCreate = `#/${EDrawerContent.AdjustmentsApplicationsCreate}`,
  TollRoadsCreate = `#/${EDrawerContent.TollRoadsCreate}`,
  TollRoadsDetails = `#/${EDrawerContent.TollRoadsDetails}`,
  WorkingShiftsAutomaticCreate = `#/${EDrawerContent.WorkingShiftsAutomaticCreate}`,
  DamageCreate = `#/${EDrawerContent.DamageCreate}`,
  DamageDetails = `#/${EDrawerContent.DamageDetails}`,
  StocksNomenclatureCreate = `#/${EDrawerContent.StocksNomenclatureCreate}`,
  StocksNomenclatureDetails = `#/${EDrawerContent.StocksNomenclatureDetails}`,
  StocksMovingCreate = `#/${EDrawerContent.StocksMovingCreate}`,
  StocksMovingDetails = `#/${EDrawerContent.StocksMovingDetails}`,
  StocksReceiptCreate = `#/${EDrawerContent.StocksReceiptCreate}`,
  StocksReceiptDetails = `#/${EDrawerContent.StocksReceiptDetails}`,
  StocksWriteOffCreate = `#/${EDrawerContent.StocksWriteOffCreate}`,
  StocksWriteOffDetails = `#/${EDrawerContent.StocksWriteOffDetails}`,
  StocksPostingCreate = `#/${EDrawerContent.StocksPostingCreate}`,
  StocksPostingDetails = `#/${EDrawerContent.StocksPostingDetails}`,
  StocksCostItemsCreate = `#/${EDrawerContent.StocksCostItemsCreate}`,
  StocksCostItemsDetails = `#/${EDrawerContent.StocksCostItemsDetails}`,
  RepairCreate = `#/${EDrawerContent.RepairCreate}`,
  RepairDetails = `#/${EDrawerContent.RepairDetails}`,
  MaintenanceCreate = `#/${EDrawerContent.MaintenanceCreate}`,
  MaintenanceDetails = `#/${EDrawerContent.MaintenanceDetails}`,
  PrintableForm = `#/${EDrawerContent.PrintableForm}`,
  ReferenceBookDismissalCreate = `#/${EDrawerContent.ReferenceBookDismissalCreate}`,
  ReferenceBookDismissalDetails = `#/${EDrawerContent.ReferenceBookDismissalDetails}`,
  ReferenceBookRentCreate = `#/${EDrawerContent.ReferenceBookRentCreate}`,
  ReferenceBookRentDetails = `#/${EDrawerContent.ReferenceBookRentDetails}`,
  ReferenceBookExtraEquipCreate = `#/${EDrawerContent.ReferenceBookExtraEquipCreate}`,
  ReferenceBookExtraEquipDetails = `#/${EDrawerContent.ReferenceBookExtraEquipDetails}`,
  ReferenceBookParkingPlacesCreate = `#/${EDrawerContent.ReferenceBookParkingPlacesCreate}`,
  ReferenceBookDowntimeReasonCreate = `#/${EDrawerContent.ReferenceBookDowntimeReasonCreate}`,
  ReferenceBookDowntimeReasonDetails = `#/${EDrawerContent.ReferenceBookDowntimeReasonDetails}`,
  ReferenceBookVehicleGroupCreate = `#/${EDrawerContent.ReferenceBookVehicleGroupCreate}`,
  ReferenceBookVehicleGroupDetails = `#/${EDrawerContent.ReferenceBookVehicleGroupDetails}`,
  ReferenceBookEquipmentCreate = `#/${EDrawerContent.ReferenceBookEquipmentCreate}`,
  ReferenceBookEquipmentDetails = `#/${EDrawerContent.ReferenceBookEquipmentDetails}`,
  ReferenceBookCheckExtraCreate = `#/${EDrawerContent.ReferenceBookCheckExtraCreate}`,
  ReferenceBookCheckExtraDetails = `#/${EDrawerContent.ReferenceBookCheckExtraDetails}`,
  ReferenceBookInspectionsScheduleCreate = `#/${EDrawerContent.ReferenceBookInspectionsScheduleCreate}`,
  ReferenceBookInspectionsScheduleDetails = `#/${EDrawerContent.ReferenceBookInspectionsScheduleDetails}`,
  ReferenceBookConditionCreate = `#/${EDrawerContent.ReferenceBookConditionCreate}`,
  ReferenceBookConditionDetails = `#/${EDrawerContent.ReferenceBookConditionDetails}`,
  ReferenceBookInspectionProfileCreate = `#/${EDrawerContent.ReferenceBookInspectionProfileCreate}`,
  ReferenceBookInspectionProfileDetails = `#/${EDrawerContent.ReferenceBookInspectionProfileDetails}`,
  CompaniesCounterpartyCreate = `#/${EDrawerContent.CompaniesCounterpartyCreate}`,
  CompaniesCounterpartyDetails = `#/${EDrawerContent.CompaniesCounterpartyDetails}`,
  PrintableFormsInfo = `#/${EDrawerContent.PrintableFormsInfo}`,
  ReferenceBookCashRegistersCreate = `#/${EDrawerContent.ReferenceBookCashRegistersCreate}`,
  ReferenceBookCashRegistersDetails = `#/${EDrawerContent.ReferenceBookCashRegistersDetails}`,
  ReportsRent = `#/${EDrawerContent.ReportsRent}`,
  ReportsBalanceOperations = `#/${EDrawerContent.ReportsBalanceOperations}`,
  DriverWeekendTemplateCreate = `#/${EDrawerContent.DriverWeekendTemplateCreate}`,
  ReportsVehicle = `#/${EDrawerContent.ReportsVehicle}`,
  ReportsFines = `#/${EDrawerContent.ReportsFines}`,
  StocksCreate = `#/${EDrawerContent.StocksCreate}`,
  StocksDetails = `#/${EDrawerContent.StocksDetails}`,
  IntegrationsCreate = `#/${EDrawerContent.IntegrationsCreate}`,
  IntegrationsDetails = `#/${EDrawerContent.IntegrationsDetails}`,
  IntegrationTransactionsDetails = `#/${EDrawerContent.IntegrationTransactionsDetails}`,
  IntegrationTransactionsOrderDetails = `#/${EDrawerContent.IntegrationTransactionsOrderDetails}`,
}
export type TDrawerSettings = {
  size?: number | string;
};
export interface IDrawerData<T = any> {
  data?: T;
  settings?: TDrawerSettings;
}

export const useApp = () => {
  const drawerVisible = ref(false);
  const activeDrawer = ref<EDrawerContent>();
  const drawerData = ref<IDrawerData>();
  const mobileMenuDrawerVisible = ref(false);
  const isDisplayNotifications = ref(false);

  const showNotifications = () => (isDisplayNotifications.value = true);
  const hideNotifications = () => (isDisplayNotifications.value = false);

  function openDrawer<T>(drawerName: EDrawerContent, data?: IDrawerData<T>) {
    drawerVisible.value = true;
    activeDrawer.value = drawerName;
    if (data) {
      drawerData.value = data;
    }
  }
  function hideDrawer() {
    drawerVisible.value = false;
    activeDrawer.value = undefined;
    drawerData.value = undefined;

    const currentHash = router.currentRoute.value.hash || "";

    const hashParts = currentHash.split("#").filter(Boolean);

    if (hashParts.length > 0) {
      hashParts.pop();
    }

    const newHash = hashParts.length > 0 ? `#${hashParts.join("#")}` : "";

    router.replace({ hash: newHash });
  }

  /* toggle mobile menu visible */
  const openMobileMenuDrawer = () => (mobileMenuDrawerVisible.value = true);
  const closeMobileMenuDrawer = () => (mobileMenuDrawerVisible.value = false);

  /* set drawers HASH */

  /* vehicles */
  const setVehiclesCreateHash = () =>
    router.replace({ hash: `#/${EDrawerContent.VehicleCreate}` });
  const setVehiclesDetailsHash = (vehicleId: number, tab: string = "info") =>
    router.replace({
      hash: `#/${EDrawerContent.VehicleDetails}/${vehicleId}/${tab}`,
    });
  const setVehiclesDetailsCreateInspectionHash = (vehicleId: number) =>
    router.replace({
      hash: `#/${EDrawerContent.VehicleDetails}/${vehicleId}/inspections#/${EDrawerContent.InspectionsCreate}`,
    });
  /* balance operations */
  const setBalanceOperationsCreateHash = () =>
    router.replace({ hash: `#/${EDrawerContent.BalanceOperationsCreate}` });
  const setBalanceOperationsDetailsHash = (operationId: number) =>
    router.replace({
      hash: `#/${EDrawerContent.BalanceOperationsDetails}/${operationId}`,
    });
  const setBalanceOperationsAdjustmentCreateHash = (operationId: number) =>
    router.replace({
      hash: `#/${EDrawerContent.BalanceOperationsDetails}/${operationId}/#/${EDrawerContent.AdjustmentsApplicationsCreate}`,
    });
  /* drivers */
  const setDriversCreateHash = () =>
    router.replace({ hash: `#/${EDrawerContent.DriversCreate}` });
  const setDriversDetailsHash = (driverId: number) =>
    router.replace({
      hash: `#/${EDrawerContent.DriversDetails}/${driverId}/info`,
    });
  const setDriversDetailsCreateInspectionHash = (driverId: number) =>
    router.replace({
      hash: `#/${EDrawerContent.DriversDetails}/${driverId}/inspections#/${EDrawerContent.InspectionsCreate}`,
    });
  const setDriversDetailsOperationCreateHash = (driverId: number) =>
    router.replace({
      hash: `#/${EDrawerContent.DriversDetails}/${driverId}/payments#/${EDrawerContent.BalanceOperationsCreate}`,
    });
  const setDriverWeekendTemplateCreateHash = (driverId: number) =>
    router.replace({
      hash: `#/${EDrawerContent.DriversDetails}/${driverId}/weekend-calendar#/${EDrawerContent.DriverWeekendTemplateCreate}`,
    });
  const setDriverDetailsDamageCreateHash = (driverId: number) =>
    router.replace({
      hash: `#/${EDrawerContent.DriversDetails}/${driverId}/damages#/${EDrawerContent.DamageCreate}`,
    });
  const setDriversDetailsFinesDetailsHash = (
    fineId: number,
    driverId: number
  ) =>
    router.replace({
      hash: `#/${EDrawerContent.DriversDetails}/${driverId}/fines#/${EDrawerContent.FinesDetails}/${fineId}`,
    });
  /*  payment terminals */
  const setPaymentTerminalsDetailsHash = (terminalId: number) =>
    router.replace({
      hash: `#/${EDrawerContent.PaymentTerminalsDetails}/${terminalId}`,
    });
  /* inspections */
  const setInspectionsCreateHash = () =>
    router.replace({ hash: `#/${EDrawerContent.InspectionsCreate}` });
  const setInspectionsDetailsHash = (inspectionId: number) =>
    router.replace({
      hash: `#/${EDrawerContent.InspectionsDetails}/${inspectionId}`,
    });
  /* fines */
  const setFinesCreateHash = () =>
    router.replace({ hash: `#/${EDrawerContent.FinesCreate}` });
  const setFinesDetailsHash = (fineId: number) =>
    router.replace({ hash: `#/${EDrawerContent.FinesDetails}/${fineId}` });
  /* AdjustmentsApplications  */
  const setAdjustmentsApplicationsDetailsHash = (adjId: number) =>
    router.replace({
      hash: `#/${EDrawerContent.AdjustmentsApplicationsDetails}/${adjId}`,
    });
  const setAdjustmentsApplicationsCreateHash = () =>
    router.replace({
      hash: `#/${EDrawerContent.AdjustmentsApplicationsCreate}`,
    });
  /* toll roads */
  const setTollRoadsCreateHash = () =>
    router.replace({ hash: `#/${EDrawerContent.TollRoadsCreate}` });
  const setTollRoadsDetailsHash = (roadId: number) =>
    router.replace({ hash: `#/${EDrawerContent.TollRoadsDetails}/${roadId}` });
  /* working shifts */
  const setWorkingShiftsDriverCreateHash = () =>
    router.replace({
      hash: `#/${EDrawerContent.WorkingShiftsAutomaticCreate}`,
    });
  /* salary statements */
  const setSalaryStatementsCreateHash = () =>
    router.replace({
      hash: `#/${EDrawerContent.SalaryStatementsCreate}`,
    });
  const setSalaryStatementsDetailsHash = (ss_id: number) =>
    router.replace({
      hash: `#/${EDrawerContent.SalaryStatementsDetails}/${ss_id}`,
    });
  const setSalaryStatementsDriverDetailsHash = (ss_id: number, ss_driver_id: number) =>
    router.replace({
      hash: `#/${EDrawerContent.SalaryStatementsDriverDetails}/${ss_id}/${ss_driver_id}`,
    });
  /* damages */
  const setDamageCreateHash = () =>
    router.replace({ hash: `#/${EDrawerContent.DamageCreate}` });
  const setDamageDetailsHash = (damageId: number) =>
    router.replace({ hash: `#/${EDrawerContent.DamageDetails}/${damageId}` });
  /* stocks */
  const setStocksNomenclatureCreateHash = () =>
    router.replace({ hash: `#/${EDrawerContent.StocksNomenclatureCreate}` });
  const setStocksNomenclatureDetailsHash = (nomenclatureId: number) =>
    router.replace({
      hash: `#/${EDrawerContent.StocksNomenclatureDetails}/${nomenclatureId}`,
    });
  const setStocksMovingCreateHash = () =>
    router.replace({ hash: `#/${EDrawerContent.StocksMovingCreate}` });
  const setStocksMovingDetailsHash = (movId: number) =>
    router.replace({
      hash: `#/${EDrawerContent.StocksMovingDetails}/${movId}`,
    });
  const setStocksReceiptHash = () =>
    router.replace({ hash: `#/${EDrawerContent.StocksReceiptCreate}` });
  const setStocksReceiptDetailsHash = (receiptId: number) =>
    router.replace({
      hash: `#/${EDrawerContent.StocksReceiptDetails}/${receiptId}`,
    });
  const setStocksWriteOffHash = () =>
    router.replace({ hash: `#/${EDrawerContent.StocksWriteOffCreate}` });
  const setStocksWriteOffDetailsHash = (woId: number) =>
    router.replace({
      hash: `#/${EDrawerContent.StocksWriteOffDetails}/${woId}`,
    });
  const setStocksPostingHash = () =>
    router.replace({ hash: `#/${EDrawerContent.StocksPostingCreate}` });
  const setStocksPostingDetailsHash = (postingId: number) =>
    router.replace({
      hash: `#/${EDrawerContent.StocksPostingDetails}/${postingId}`,
    });
  const setStocksCostItemsHash = () =>
    router.replace({ hash: `#/${EDrawerContent.StocksCostItemsCreate}` });
  const setStocksCostItemDetailsHash = (costId: number) =>
    router.replace({
      hash: `#/${EDrawerContent.StocksCostItemsDetails}/${costId}`,
    });
  const setStocksCreateHash = () =>
    router.replace({ hash: `#/${EDrawerContent.StocksCreate}` });
  const setStocksDetailsHash = (stockId: number) =>
    router.replace({ hash: `#/${EDrawerContent.StocksDetails}/${stockId}` });
  /* repair */
  const setRepairCreateHash = () =>
    router.replace({ hash: `#/${EDrawerContent.RepairCreate}` });
  const setRepairDetailsHash = (repairId: number) =>
    router.replace({ hash: `#/${EDrawerContent.RepairDetails}/${repairId}` });
  /* maintenance */
  const setMaintenanceCreateHash = (vehicleId: number | null) => {
    if (vehicleId) {
      router.replace({
        hash: `#/${EDrawerContent.VehicleDetails}/${vehicleId}/maintenance#/${EDrawerContent.MaintenanceCreate}`,
      });
    } else {
      router.replace({ hash: `#/${EDrawerContent.MaintenanceCreate}` });
    }
  };
  const setMaintenanceDetailsHash = (mId: number, vehicleId: number | null) => {
    if (vehicleId) {
      router.replace({
        hash: `#/${EDrawerContent.VehicleDetails}/${vehicleId}/maintenance#/${EDrawerContent.MaintenanceDetails}/${mId}`,
      });
    } else {
      router.replace({ hash: `#/${EDrawerContent.MaintenanceDetails}/${mId}` });
    }
  };
  /* printable forms */
  const setPrintableFormHash = (printId: number) =>
    router.replace({ hash: `#/${EDrawerContent.PrintableForm}/${printId}` });
  const setPrintableFormsInfoHash = () =>
    router.replace({
      hash: `#/${EDrawerContent.PrintableFormsInfo}/`,
    });
  /* reference book */
  const setReferenceBookDismissalCreateHash = () =>
    router.replace({
      hash: `#/${EDrawerContent.ReferenceBookDismissalCreate}`,
    });
  const setReferenceBookDismissalDetailsHash = (disId: number) =>
    router.replace({
      hash: `#/${EDrawerContent.ReferenceBookDismissalDetails}/${disId}`,
    });
  const setReferenceBookRentCreateHash = () =>
    router.replace({ hash: `#/${EDrawerContent.ReferenceBookRentCreate}` });
  const setReferenceBookRentDetailsHash = (rentId: number) =>
    router.replace({
      hash: `#/${EDrawerContent.ReferenceBookRentDetails}/${rentId}`,
    });
  const setReferenceBookExtraEquipCreateHash = () =>
    router.replace({
      hash: `#/${EDrawerContent.ReferenceBookExtraEquipCreate}`,
    });
  const setReferenceBookExtraEquipDetailsHash = (equipId: number) =>
    router.replace({
      hash: `#/${EDrawerContent.ReferenceBookExtraEquipDetails}/${equipId}`,
    });
  const setReferenceBookParkingPlacesCreateHash = () =>
    router.replace({
      hash: `#/${EDrawerContent.ReferenceBookParkingPlacesCreate}`,
    });
  const setReferenceBookDowntimeReasonCreateHash = () =>
    router.replace({
      hash: `#/${EDrawerContent.ReferenceBookDowntimeReasonCreate}`,
    });
  const setReferenceBookDowntimeReasonDetailsHash = (downtimeId: number) =>
    router.replace({
      hash: `#/${EDrawerContent.ReferenceBookDowntimeReasonDetails}/${downtimeId}`,
    });
  const setReferenceBookVehicleGroupCreateHash = () =>
    router.replace({
      hash: `#/${EDrawerContent.ReferenceBookVehicleGroupCreate}`,
    });
  const setReferenceBookVehicleGroupDetailsHash = (groupId: number) =>
    router.replace({
      hash: `#/${EDrawerContent.ReferenceBookVehicleGroupDetails}/${groupId}`,
    });
  const setReferenceBookEquipmentCreateHash = () =>
    router.replace({
      hash: `#/${EDrawerContent.ReferenceBookEquipmentCreate}`,
    });
  const setReferenceBookEquipmentDetailsHash = (equipmentId: number) =>
    router.replace({
      hash: `#/${EDrawerContent.ReferenceBookEquipmentDetails}/${equipmentId}`,
    });
  const setReferenceBookCheckExtraCreateHash = () =>
    router.replace({
      hash: `#/${EDrawerContent.ReferenceBookCheckExtraCreate}`,
    });
  const setReferenceBookCheckExtraDetailsHash = (checkId: number) =>
    router.replace({
      hash: `#/${EDrawerContent.ReferenceBookCheckExtraDetails}/${checkId}`,
    });
  const setReferenceBookInspectionsScheduleCreateHash = () =>
    router.replace({
      hash: `#/${EDrawerContent.ReferenceBookInspectionsScheduleCreate}`,
    });
  const setReferenceBookInspectionsScheduleDetailsHash = (
    scheduleId: number,
    isDefault: string
  ) =>
    router.replace({
      hash: `#/${EDrawerContent.ReferenceBookInspectionsScheduleDetails}/${scheduleId}`,
      query: { isDefault },
    });
  const setReferenceBookConditionCreateHash = () =>
    router.replace({
      hash: `#/${EDrawerContent.ReferenceBookConditionCreate}`,
    });
  const setReferenceBookConditionDetailsHash = (conditionId: number) =>
    router.replace({
      hash: `#/${EDrawerContent.ReferenceBookConditionDetails}/${conditionId}`,
    });
  const setReferenceBookUsersCreateHash = () =>
    router.replace({
      hash: `#/${EDrawerContent.ReferenceBookUsersCreate}`,
    });
  const setReferenceBookUsersDetailsHash = (disId: number) =>
    router.replace({
      hash: `#/${EDrawerContent.ReferenceBookUsersDetails}/${disId}`,
    });
  const setReferenceBookRolesCreateHash = () =>
    router.replace({
      hash: `#/${EDrawerContent.ReferenceBookRolesCreate}`,
    });
  const setReferenceBookRolesDetailsHash = (disId: number) =>
    router.replace({
      hash: `#/${EDrawerContent.ReferenceBookRolesDetails}/${disId}`,
    });
  const setReferenceBookInspectionProfileCreateHash = () =>
    router.replace({
      hash: `#/${EDrawerContent.ReferenceBookInspectionProfileCreate}`,
    });
  const setReferenceBookInspectionProfileDetailsHash = (id: number) =>
    router.replace({
      hash: `#/${EDrawerContent.ReferenceBookInspectionProfileDetails}/${id}`,
    });
  /* companiesCounterparty */
  const setCompaniesCounterpartyCreateHash = () =>
    router.replace({
      hash: `#/${EDrawerContent.CompaniesCounterpartyCreate}/`,
    });
  const setCompaniesCounterpartyDetailsHash = (downtimeId: number) =>
    router.replace({
      hash: `#/${EDrawerContent.CompaniesCounterpartyDetails}/${downtimeId}`,
    });
  const setReferenceBookCashRegistersCreateHash = () =>
    router.replace({
      hash: `#/${EDrawerContent.ReferenceBookCashRegistersCreate}`,
    });
  const setReferenceBookCashRegistersDetailsHash = (cashId: number) =>
    router.replace({
      hash: `#/${EDrawerContent.ReferenceBookCashRegistersDetails}/${cashId}`,
    });
  /* reports */
  const setReportsRentCreateHash = () =>
    router.replace({
      hash: `#/${EDrawerContent.ReportsRent}`,
    });
  const setReportsBalanceOperationsCreateHash = () =>
    router.replace({
      hash: `#/${EDrawerContent.ReportsBalanceOperations}`,
    });
  /* companiesCounterparty */
  const setReportsVehicleCreateHash = () =>
    router.replace({
      hash: `#/${EDrawerContent.ReportsVehicle}`,
    });
  const setReportsFinesCreateHash = () =>
    router.replace({
      hash: `#/${EDrawerContent.ReportsFines}`,
    });

  const setIntegrationsCreateHash = () =>
    router.replace({
      hash: `#/${EDrawerContent.IntegrationsCreate}`,
    });

  const setIntegrationsDetailsHash = (id: number) =>
    router.replace({
      hash: `#/${EDrawerContent.IntegrationsDetails}/${id}`,
    });

  const setIntegrationTransactionsDetailsHash = (id: number) =>
    router.replace({
      hash: `#/${EDrawerContent.IntegrationTransactionsDetails}/${id}`,
    });

  const setIntegrationTransactionsOrderDetailsHash = (id: number) =>
    router.replace({
      hash: `#/${EDrawerContent.IntegrationTransactionsOrderDetails}/${id}`,
    });

  return {
    drawerVisible,
    activeDrawer,
    drawerData,
    openDrawer,
    hideDrawer,

    /* mobile menu */
    mobileMenuDrawerVisible,
    openMobileMenuDrawer,
    closeMobileMenuDrawer,

    /* drawers */
    setDriversCreateHash,
    setDriversDetailsHash,
    setDriversDetailsCreateInspectionHash,
    setDriversDetailsOperationCreateHash,
    setDriverDetailsDamageCreateHash,
    setDriversDetailsFinesDetailsHash,
    setDriverWeekendTemplateCreateHash,
    setVehiclesCreateHash,
    setVehiclesDetailsHash,
    setVehiclesDetailsCreateInspectionHash,
    setInspectionsCreateHash,
    setInspectionsDetailsHash,
    setBalanceOperationsCreateHash,
    setBalanceOperationsDetailsHash,
    setBalanceOperationsAdjustmentCreateHash,
    setFinesCreateHash,
    setFinesDetailsHash,
    setPaymentTerminalsDetailsHash,
    setAdjustmentsApplicationsDetailsHash,
    setAdjustmentsApplicationsCreateHash,
    setTollRoadsCreateHash,
    setTollRoadsDetailsHash,
    setWorkingShiftsDriverCreateHash,
    setSalaryStatementsCreateHash,
    setSalaryStatementsDetailsHash,
    setSalaryStatementsDriverDetailsHash,
    setDamageCreateHash,
    setDamageDetailsHash,
    setStocksNomenclatureCreateHash,
    setStocksNomenclatureDetailsHash,
    setStocksMovingCreateHash,
    setStocksMovingDetailsHash,
    setStocksReceiptHash,
    setStocksReceiptDetailsHash,
    setStocksWriteOffHash,
    setStocksWriteOffDetailsHash,
    setStocksPostingHash,
    setStocksPostingDetailsHash,
    setStocksCostItemsHash,
    setStocksCostItemDetailsHash,
    setStocksCreateHash,
    setStocksDetailsHash,
    setRepairCreateHash,
    setRepairDetailsHash,
    setMaintenanceCreateHash,
    setMaintenanceDetailsHash,
    setPrintableFormHash,
    setPrintableFormsInfoHash,
    setReferenceBookDismissalCreateHash,
    setReferenceBookDismissalDetailsHash,
    setReferenceBookRentCreateHash,
    setReferenceBookRentDetailsHash,
    setReferenceBookExtraEquipCreateHash,
    setReferenceBookExtraEquipDetailsHash,
    setReferenceBookParkingPlacesCreateHash,
    setReferenceBookDowntimeReasonCreateHash,
    setReferenceBookDowntimeReasonDetailsHash,
    setReferenceBookVehicleGroupCreateHash,
    setReferenceBookVehicleGroupDetailsHash,
    setReferenceBookInspectionsScheduleCreateHash,
    setReferenceBookConditionCreateHash,
    setReferenceBookConditionDetailsHash,
    setReferenceBookEquipmentCreateHash,
    setReferenceBookEquipmentDetailsHash,
    setReferenceBookCheckExtraCreateHash,
    setReferenceBookCheckExtraDetailsHash,
    setReferenceBookInspectionsScheduleDetailsHash,
    setReferenceBookUsersCreateHash,
    setReferenceBookUsersDetailsHash,
    setReferenceBookRolesCreateHash,
    setReferenceBookRolesDetailsHash,
    setReferenceBookInspectionProfileCreateHash,
    setReferenceBookInspectionProfileDetailsHash,

    /* companiesCounterparty */
    setCompaniesCounterpartyCreateHash,
    setCompaniesCounterpartyDetailsHash,
    setReferenceBookCashRegistersCreateHash,
    setReferenceBookCashRegistersDetailsHash,
    // setReportsRentCreateHash,
    // setReportsBalanceOperationsCreateHash,
    setReportsRentCreateHash,
    setReportsVehicleCreateHash,
    setReportsBalanceOperationsCreateHash,
    setReportsFinesCreateHash,

    setIntegrationsCreateHash,
    setIntegrationsDetailsHash,
    setIntegrationTransactionsDetailsHash,
    setIntegrationTransactionsOrderDetailsHash,

    isDisplayNotifications,
    showNotifications,
    hideNotifications,
  };
};

export const useAppLocale = () => {
  const { locale } = useI18n();
  const locales = ["ru", "en"];

  function setLocale(loc: string) {
    localStorage.setItem("app.language", loc);
    locale.value = loc;
    dayjs.locale(loc);
  }
  return {
    locales,
    setLocale,
  };
};

export const useAppBreakpoints = () => {
  const breakpoints = useBreakpoints(breakpointsTailwind);

  const smAndLarger = breakpoints.greaterOrEqual("sm");
  const mdAndLarger = breakpoints.greaterOrEqual("md");
  const lgAndLarger = breakpoints.greaterOrEqual("lg");
  const xlAndLarger = breakpoints.greaterOrEqual("xl");

  return {
    smAndLarger,
    mdAndLarger,
    lgAndLarger,
    xlAndLarger,
  };
};
