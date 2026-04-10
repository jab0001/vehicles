import { createRouter, createWebHistory } from "vue-router";
import { storeToRefs } from "pinia";
import { useCompaniesManagementStore } from "@/stores/companiesManagementStore";
import { useUserStore } from "@/stores/userStore";

// @ts-ignore
const queryPhoneGuard = (from, to, next) => {
  if (from.query?.phone && from.query?.phone?.length === 11) {
    return next();
  }
  return next({ name: "AppDriverAuthStart" });
};

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      component: () => import("@/layouts/AuthLayout.vue"),
      children: [
        {
          path: "auth",
          name: "Login",
          component: () => import("@/views/auth/LoginView.vue"),
        },
        {
          path: "recovery",
          name: "Recovery",
          component: () => import("@/views/auth/RecoveryView.vue"),
        },
        {
          path: "",
          redirect: { name: "Login" },
        },
      ],
    },
    {
      path: "/main",
      component: () => import("@/layouts/MainLayout.vue"),
      beforeEnter: async (to, from, next) => {
        const { fetchCompaniesManagementList } = useCompaniesManagementStore();
        const { companiesManagementList } = storeToRefs(
          useCompaniesManagementStore()
        );
        await fetchCompaniesManagementList({});

        const store = useUserStore();
        const { fetchUserProfile, ability } = store;
        const { userProfile } = storeToRefs(store);
        await fetchUserProfile();

        if (companiesManagementList.value.length > 0 && userProfile.value) {
          console.log("next");
          return next();
        } else {
          console.log("else");

          next({ name: "Login" });
        }
      },
      redirect: { name: "Dashboard" },
      children: [
        {
          path: "dashboard",
          name: "Dashboard",
          component: () => import("@/views/DashboardView.vue"),
        },
        {
          path: "profile",
          name: "Profile",
          component: () => import("@/views/ProfileView.vue"),
        },
        {
          path: "releases",
          redirect: { name: "ReleasesLines" },
          children: [
            {
              path: "on-line",
              name: "ReleasesLines",
              component: () => import("@/views/VehiclesOnLineView.vue"),
            },
            // {
            //   path: "replacement-drivers",
            //   name: "ReleasesDriversGroup",
            //   component: () =>
            //     import("@/views/releases/ReleasesDriversGroup.vue"),
            // },
            {
              path: "replacement-drivers",
              name: "ReleasesDriversGroup",
              component: () =>
                import("@/views/releases/ReleasesDriversGroup.vue"),
            },
            // Replacement drivers
          ],
        },
        {
          path: "inspections",
          name: "inspections",
          component: () => import("@/views/InspectionsView.vue"),
        },
        {
          path: "balance-operations",
          name: "BalanceOperations",
          component: () => import("@/views/BalanceOperationsView.vue"),
        },
        {
          path: "leasing-payments",
          name: "LeasingPayments",
          component: () => import("@/views/LeasingPaymentsView.vue"),
        },
        {
          path: "applications",
          name: "Applications",
          component: () => import("@/views/AdjustmentsApplicationsView.vue"),
        },
        {
          path: "vehicles",
          name: "Vehicles",
          component: () => import("@/views/VehiclesView.vue"),
        },
        {
          path: "fines",
          name: "Fines",
          component: () => import("@/views/FinesView.vue"),
        },
        {
          path: "drivers",
          name: "Drivers",
          component: () => import("@/views/DriversView.vue"),
        },
        {
          path: "working-shifts",
          name: "WorkingShifts",
          component: () => import("@/views/WorkingShiftsView.vue"),
        },
        {
          path: "salary-statements",
          name: "SalaryStatements",
          component: () => import("@/views/SalaryStatementsView.vue"),
        },
        {
          path: "insurances",
          name: "Insurances",
          component: () => import("@/views/InsurancesView.vue"),
        },
        {
          path: "downtime",
          name: "Downtime",
          component: () => import("@/views/DowntimeView.vue"),
        },
        {
          path: "damages",
          name: "Damages",
          component: () => import("@/views/DamagesView.vue"),
        },
        {
          path: "toll-roads",
          name: "TollRoads",
          component: () => import("@/views/TollRoadsView.vue"),
        },
        {
          path: "repair",
          name: "Repair",
          component: () => import("@/views/RepairView.vue"),
        },
        {
          path: "maintenance",
          name: "Maintenance",
          component: () => import("@/views/MaintenanceView.vue"),
        },
        {
          path: "reports",
          name: "Reports",
          component: () => import("@/views/ReportsView.vue"),
        },
        {
          path: "stocks",
          redirect: { name: "StocksStorages" },
          children: [
            {
              path: "nomenclature",
              name: "StocksNomenclature",
              component: () =>
                import("@/views/stocks/StocksNomenclatureView.vue"),
            },
            {
              path: "moving",
              name: "StocksMoving",
              component: () => import("@/views/stocks/StocksMovingView.vue"),
            },
            {
              path: "receipt",
              name: "StocksReceipt",
              component: () => import("@/views/stocks/StocksReceiptView.vue"),
            },
            {
              path: "write-off",
              name: "StocksWriteOff",
              component: () => import("@/views/stocks/StocksWriteOffView.vue"),
            },
            {
              path: "posting",
              name: "StocksPosting",
              component: () => import("@/views/stocks/StocksPostingView.vue"),
            },
            {
              path: "cost-items",
              name: "StocksCostItems",
              component: () => import("@/views/stocks/StocksCostItemsView.vue"),
            },
            {
              path: "storages",
              name: "StocksStorages",
              component: () => import("@/views/stocks/StocksStoragesView.vue"),
            },
            {
              path: "balance",
              name: "StocksBalance",
              component: () => import("@/views/stocks/StocksBalanceView.vue"),
            },
          ],
        },
        {
          path: "companies",
          name: "Companies",
          component: () => import("@/views/CompaniesView.vue"),
        },
        {
          path: "payment-terminals",
          name: "PaymentTerminals",
          component: () => import("@/views/PaymentTerminalsView.vue"),
        },
        {
          path: "counterparty",
          name: "Counterparty",
          component: () => import("@/views/CounterpartyView.vue"),
        },
        {
          path: "system-settings",
          name: "SystemSettings",
          component: () => import("@/views/SystemSettingsView.vue"),
        },
        {
          path: "integrations",
          name: "Integrations",
          component: () => import("@/views/IntegrationsView.vue"),
        },
        {
          path: "driver-notifications-settings",
          name: "DriverNotificationsSettings",
          component: () =>
            import("@/views/DriverNotificationsSettingsView.vue"),
        },
        {
          path: "printable-forms",
          name: "PrintableForms",
          component: () => import("@/views/PrintableFormsView.vue"),
        },
        {
          path: "reference-book",
          redirect: { name: "ReferenceBookDismissal" },
          children: [
            {
              path: "users",
              name: "ReferenceUsers",
              component: () =>
                import("@/views/referenceBook/ReferenceUsersView.vue"),
            },
            {
              path: "roles",
              name: "ReferenceRoles",
              component: () =>
                import("@/views/referenceBook/ReferenceRolesView.vue"),
            },
            {
              path: "dismissal",
              name: "ReferenceBookDismissal",
              component: () =>
                import("@/views/referenceBook/ReferenceBookDismissalView.vue"),
            },
            {
              path: "rent",
              name: "ReferenceBookRent",
              component: () =>
                import("@/views/referenceBook/ReferenceBookRentView.vue"),
            },
            {
              path: "inspections-profiles",
              name: "ReferenceBookInspectionProfiles",
              component: () =>
                import(
                  "@/views/referenceBook/ReferenceBookInspectionProfilesView.vue"
                ),
            },
            {
              path: "inspections-schedule",
              name: "ReferenceBookInspectionsSchedule",
              component: () =>
                import(
                  "@/views/referenceBook/ReferenceBookInspectionsScheduleView.vue"
                ),
            },
            {
              path: "vehicle-groups",
              name: "ReferenceBookVehicleGroups",
              component: () =>
                import(
                  "@/views/referenceBook/ReferenceBookVehicleGroupsView.vue"
                ),
            },
            {
              path: "conditions",
              name: "ReferenceBookConditions",
              component: () =>
                import("@/views/referenceBook/ReferenceBookConditionsView.vue"),
            },
            {
              path: "equipment",
              name: "ReferenceBookEquipment",
              component: () =>
                import("@/views/referenceBook/ReferenceBookEquipmentView.vue"),
            },
            {
              path: "check-extra",
              name: "ReferenceBookCheckExtra",
              component: () =>
                import("@/views/referenceBook/ReferenceBookCheckExtraView.vue"),
            },
            {
              path: "extra-equipment",
              name: "ReferenceBookExtraEquip",
              component: () =>
                import("@/views/referenceBook/ReferenceBookExtraEquipView.vue"),
            },
            {
              path: "parking-places",
              name: "ReferenceBookParkingPlaces",
              component: () =>
                import(
                  "@/views/referenceBook/ReferenceBookParkingPlacesView.vue"
                ),
            },
            {
              path: "downtime",
              name: "ReferenceBookDowntime",
              component: () =>
                import("@/views/referenceBook/ReferenceBookDowntimeView.vue"),
            },
            {
              path: "cahs-registers",
              name: "ReferenceBookCashRegisters",
              component: () =>
                import(
                  "@/views/referenceBook/ReferenceBookCashRegistersView.vue"
                ),
            },
            {
              path: "/reference-book/transactions",
              name: "ReferenceBookTransactions",
              component: () =>
                import(
                  "@/views/referenceBook/ReferenceBookTransactionsView.vue"
                ),
              meta: {
                requiresAuth: true,
              },
            },
            {
              path: "/reference-book/orders",
              name: "ReferenceBookOrders",
              component: () =>
                import("@/views/referenceBook/ReferenceBookOrdersView.vue"),
              meta: {
                requiresAuth: true,
              },
            },
          ],
        },
        {
          path: "sandbox",
          name: "Sandbox",
          component: () => import("@/views/SandboxView.vue"),
        },
      ],
    },
    {
      path: "/app-driver",
      redirect: "/app-driver/auth",
      children: [
        {
          path: "auth",
          component: () => import("@/layouts/AppDriverAuth.vue"),
          children: [
            {
              path: "",
              name: "AppDriverAuthStart",
              component: () =>
                import("@/views/appDriver/AppDriverAuthStartView.vue"),
            },
            {
              path: "login",
              name: "AppDriverAuthLogin",
              beforeEnter: queryPhoneGuard,
              component: () =>
                import("@/views/appDriver/AppDriverAuthLoginView.vue"),
            },
            {
              path: "register",
              name: "AppDriverAuthRegister",
              beforeEnter: queryPhoneGuard,
              component: () =>
                import("@/views/appDriver/AppDriverAuthRegisterView.vue"),
            },
            {
              path: "forgot-password",
              name: "AppDriverAuthForgotPassword",
              beforeEnter: queryPhoneGuard,
              component: () =>
                import("@/views/appDriver/AppDriverAuthForgotPasswordView.vue"),
            },
            {
              path: "companies",
              name: "AppDriverAuthCompanies",
              beforeEnter: (from, to, next) => {
                // TODO has access_token?
                return next();
              },
              component: () =>
                import("@/views/appDriver/AppDriverAuthChooseCompany.vue"),
            },
          ],
        },
        {
          path: "main",
          redirect: { name: "AppDriverDashboard" },
          component: () => import("@/layouts/AppDriverMain.vue"),
          children: [
            {
              path: "dashboard",
              name: "AppDriverDashboard",
              component: () =>
                import("@/views/appDriver/AppDriverDashboardView.vue"),
            },
            {
              path: "balance",
              redirect: { name: "AppDriverBalance" },
              children: [
                {
                  path: "",
                  name: "AppDriverBalance",
                  component: () =>
                    import("@/views/appDriver/AppDriverBalanceView.vue"),
                },
                {
                  path: ":category",
                  name: "AppDriverBalanceOperations",
                  component: () =>
                    import(
                      "@/views/appDriver/AppDriverBalanceOperationsView.vue"
                    ),
                },
                {
                  path: "add",
                  name: "AppDriverBalanceAdd",
                  component: () =>
                    import("@/views/appDriver/AppDriverBalanceAddView.vue"),
                },
              ],
            },
            {
              path: "notifications",
              name: "AppDriverNotifications",
              component: () =>
                import("@/views/appDriver/AppDriverNotificationsView.vue"),
            },
            {
              path: "fines",
              name: "AppDriverFines",
              component: () =>
                import("@/views/appDriver/AppDriverFinesView.vue"),
            },
            {
              path: "damages",
              name: "AppDriverDamages",
              component: () =>
                import("@/views/appDriver/AppDriverDamagesView.vue"),
            },
            {
              path: "documents",
              name: "AppDriverDocuments",
              component: () =>
                import("@/views/appDriver/AppDriverDocumentsView.vue"),
            },
            {
              path: "inspections",
              redirect: { name: "AppDriverInspections" },
              children: [
                {
                  path: "",
                  name: "AppDriverInspections",
                  component: () =>
                    import("@/views/appDriver/AppDriverInspectionsView.vue"),
                },
                {
                  path: "create",
                  name: "AppDriverInspectionsCreate",
                  component: () =>
                    import(
                      "@/views/appDriver/AppDriverInspectionsCreateView.vue"
                    ),
                },
              ],
            },
            {
              path: "days-off",
              name: "AppDriverDaysOff",
              component: () =>
                import("@/views/appDriver/AppDriverDaysOffView.vue"),
            },
          ],
        },
      ],
    },
  ],
});

export default router;
