import { lazy, Suspense, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router";
import { AuthGuard } from "@/app/guards/auth-guard";
import { AppLayout } from "@/app/layouts/app-layout";
import { PublicLayout } from "@/app/layouts/public-layout";
import { useAuthStore } from "@/lib/auth/authStore";

// Lazy pages

// Auth
const LoginPage = lazy(() =>
  import("@/features/auth/pages/LoginPage").then((m) => ({
    default: m.LoginPage,
  })),
);

// Dashboard
const DashboardPage = lazy(() =>
  import("@/features/dashboard/pages/DashboardPage").then((m) => ({
    default: m.DashboardPage,
  })),
);

// Conversations
const ConversationsPage = lazy(() =>
  import("@/features/conversations/pages/ConversationsPage").then((m) => ({
    default: m.ConversationsPage,
  })),
);

// Customers
const CustomerListPage = lazy(() =>
  import("@/features/customers/pages/CustomerListPage").then((m) => ({
    default: m.CustomerListPage,
  })),
);
const CustomerFormPage = lazy(() =>
  import("@/features/customers/pages/CustomerFormPage").then((m) => ({
    default: m.CustomerFormPage,
  })),
);
const CustomerDetailsPage = lazy(() =>
  import("@/features/customers/pages/CustomerDetailsPage").then((m) => ({
    default: m.CustomerDetailsPage,
  })),
);

// Leads
const LeadListPage = lazy(() =>
  import("@/features/leads/pages/LeadListPage").then((m) => ({
    default: m.LeadListPage,
  })),
);
const LeadFormPage = lazy(() =>
  import("@/features/leads/pages/LeadFormPage").then((m) => ({
    default: m.LeadFormPage,
  })),
);
const LeadDetailsPage = lazy(() =>
  import("@/features/leads/pages/LeadDetailsPage").then((m) => ({
    default: m.LeadDetailsPage,
  })),
);

// Orders
const OrderListPage = lazy(() =>
  import("@/features/orders/pages/OrderListPage").then((m) => ({
    default: m.OrderListPage,
  })),
);

// Catalog - Items
const ItemListPage = lazy(() =>
  import("@/features/catalog/items/pages/ItemListPage").then((m) => ({
    default: m.ItemListPage,
  })),
);
const ItemFormPage = lazy(() =>
  import("@/features/catalog/items/pages/ItemFormPage").then((m) => ({
    default: m.ItemFormPage,
  })),
);

// Catalog - Categories
const ItemCategoryListPage = lazy(() =>
  import("@/features/catalog/categories/pages/ItemCategoryListPage").then(
    (m) => ({ default: m.ItemCategoryListPage }),
  ),
);
const ItemCategoryFormPage = lazy(() =>
  import("@/features/catalog/categories/pages/ItemCategoryFormPage").then(
    (m) => ({ default: m.ItemCategoryFormPage }),
  ),
);

// Catalog - Units of measure
const UnitOfMeasureListPage = lazy(() =>
  import("@/features/catalog/units-of-measure/pages/UnitOfMeasureListPage").then(
    (m) => ({ default: m.UnitOfMeasureListPage }),
  ),
);

// Pipeline
const PipelineFlowListPage = lazy(() =>
  import("@/features/pipeline/pages/PipelineFlowListPage").then((m) => ({
    default: m.PipelineFlowListPage,
  })),
);
const PipelineFlowFormPage = lazy(() =>
  import("@/features/pipeline/pages/PipelineFlowFormPage").then((m) => ({
    default: m.PipelineFlowFormPage,
  })),
);

// Admin - Tenants
const TenantListPage = lazy(() =>
  import("@/features/admin/tenants/pages/TenantListPage").then((m) => ({
    default: m.TenantListPage,
  })),
);
const TenantFormPage = lazy(() =>
  import("@/features/admin/tenants/pages/TenantFormPage").then((m) => ({
    default: m.TenantFormPage,
  })),
);

// Admin - Users
const UserListPage = lazy(() =>
  import("@/features/admin/users/pages/UserListPage").then((m) => ({
    default: m.UserListPage,
  })),
);
const UserFormPage = lazy(() =>
  import("@/features/admin/users/pages/UserFormPage").then((m) => ({
    default: m.UserFormPage,
  })),
);

// Admin - Workers
const WorkerListPage = lazy(() =>
  import("@/features/admin/workers/pages/WorkerListPage").then((m) => ({
    default: m.WorkerListPage,
  })),
);
const WorkerFormPage = lazy(() =>
  import("@/features/admin/workers/pages/WorkerFormPage").then((m) => ({
    default: m.WorkerFormPage,
  })),
);

// Schedules Board
const SchedulesBoardPage = lazy(() =>
  import("@/features/schedules-board/pages/SchedulesBoardPage").then((m) => ({
    default: m.SchedulesBoardPage,
  })),
);

// Campaigns (legacy — mantido para compatibilidade com rota /campaigns)
const CampaignsPage = lazy(() =>
  import("@/features/campaigns/pages/CampaignsPage").then((m) => ({
    default: m.CampaignsPage,
  })),
);

// Marketing
const MarketingCampaignsPage = lazy(() =>
  import("@/features/marketing/pages/MarketingCampaignsPage").then((m) => ({
    default: m.MarketingCampaignsPage,
  })),
);

const MarketingAutomationPage = lazy(() =>
  import("@/features/marketing/pages/MarketingAutomationPage").then((m) => ({
    default: m.MarketingAutomationPage,
  })),
);

const ContactListPage = lazy(() =>
  import("@/features/marketing/pages/ContactListPage").then((m) => ({
    default: m.ContactListPage,
  })),
);

const LeadsBoardPage = lazy(() =>
  import("@/features/marketing/pages/LeadsBoardPage").then((m) => ({
    default: m.LeadsBoardPage,
  })),
);

const LandingPageConfigPage = lazy(() =>
  import("@/features/marketing/pages/LandingPageConfigPage").then((m) => ({
    default: m.LandingPageConfigPage,
  })),
);

const LandingPage = lazy(() =>
  import("@/features/marketing/pages/LandingPage").then((m) => ({
    default: m.LandingPage,
  })),
);

const PlanPage = lazy(() =>
  import("@/features/billing/pages/PlanPage").then((m) => ({
    default: m.PlanPage,
  })),
);

const CouponsPage = lazy(() =>
  import("@/features/marketing/pages/CouponsPage").then((m) => ({
    default: m.CouponsPage,
  })),
);

const CashbackPage = lazy(() =>
  import("@/features/marketing/pages/CashbackPage").then((m) => ({
    default: m.CashbackPage,
  })),
);

const AffiliatesPage = lazy(() =>
  import("@/features/marketing/pages/AffiliatesPage").then((m) => ({
    default: m.AffiliatesPage,
  })),
);

// Expenses
const ExpensesPage = lazy(() =>
  import("@/features/expenses/pages/ExpensesPage").then((m) => ({
    default: m.ExpensesPage,
  })),
);

// Notifications
const NotificationsPage = lazy(() =>
  import("@/features/notifications/pages/NotificationsPage").then((m) => ({
    default: m.NotificationsPage,
  })),
);

// Account
const MyProfilePage = lazy(() =>
  import("@/features/account/pages/MyProfilePage").then((m) => ({
    default: m.MyProfilePage,
  })),
);

const SettingsPage = lazy(() =>
  import("@/features/account/pages/SettingsPage").then((m) => ({
    default: m.SettingsPage,
  })),
);
const PaymentMethodsSettingsPage = lazy(() =>
  import("@/features/account/pages/PaymentMethodsSettingsPage").then((m) => ({
    default: m.PaymentMethodsSettingsPage,
  })),
);
const DeliverySettingsPage = lazy(() =>
  import("@/features/account/pages/DeliverySettingsPage").then((m) => ({
    default: m.DeliverySettingsPage,
  })),
);

// Admin - Roles
const RoleListPage = lazy(() =>
  import("@/features/admin/roles/pages/RoleListPage").then((m) => ({
    default: m.RoleListPage,
  })),
);
const RoleFormPage = lazy(() =>
  import("@/features/admin/roles/pages/RoleFormPage").then((m) => ({
    default: m.RoleFormPage,
  })),
);

// Admin - Permissions
const PermissionListPage = lazy(() =>
  import("@/features/admin/permissions/pages/PermissionListPage").then((m) => ({
    default: m.PermissionListPage,
  })),
);

// Redirects / to /dashboard or /login based on auth state
function RootRedirect() {
  const token = useAuthStore((s) => s.token);
  return <Navigate to={token ? "/dashboard" : "/login"} replace />;
}

// Loading spinner for lazy page chunks
function PageLoader() {
  return (
    <div className="flex h-full min-h-32 items-center justify-center">
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
    </div>
  );
}

// Authenticated shell: AuthGuard + AppLayout + Outlet
function AuthenticatedLayout() {
  return (
    <AuthGuard>
      <AppLayout>
        <Outlet />
      </AppLayout>
    </AuthGuard>
  );
}

// Authenticated routes without left nav shell — enters browser fullscreen on mount
function AuthenticatedFullscreenLayout() {
  useEffect(() => {
    if (!document.fullscreenElement) {
      void document.documentElement.requestFullscreen().catch(() => undefined);
    }
    // No cleanup here — exiting fullscreen is handled by the "Home" buttons inside each page
  }, []);

  return (
    <AuthGuard>
      <Outlet />
    </AuthGuard>
  );
}

// /login: redirect to /dashboard if already authenticated
function LoginRoute() {
  const token = useAuthStore((s) => s.token);
  if (token) return <Navigate to="/dashboard" replace />;
  return (
    <PublicLayout>
      <LoginPage />
    </PublicLayout>
  );
}

export function AppRouter() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<RootRedirect />} />
          <Route path="/login" element={<LoginRoute />} />
          <Route path="/landing" element={<LandingPage />} />

          <Route element={<AuthenticatedLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />

            <Route path="/customers" element={<CustomerListPage />} />
            <Route path="/customers/new" element={<CustomerFormPage />} />
            <Route path="/customers/:id" element={<CustomerDetailsPage />} />
            <Route path="/customers/:id/edit" element={<CustomerFormPage />} />

            <Route path="/leads" element={<LeadListPage />} />
            <Route path="/leads/new" element={<LeadFormPage />} />
            <Route path="/leads/:id" element={<LeadDetailsPage />} />
            <Route path="/leads/:id/edit" element={<LeadFormPage />} />

            <Route path="/orders" element={<Navigate to="/quotes" replace />} />
            <Route
              path="/quotes"
              element={<OrderListPage viewMode="quotes" />}
            />
            <Route path="/sales" element={<OrderListPage viewMode="sales" />} />
            <Route
              path="/orders/new"
              element={<Navigate to="/quotes" replace />}
            />
            <Route
              path="/orders/:id"
              element={<Navigate to="/quotes" replace />}
            />
            <Route
              path="/orders/:id/edit"
              element={<Navigate to="/quotes" replace />}
            />

            <Route path="/catalog/items" element={<ItemListPage />} />
            <Route path="/catalog/items/new" element={<ItemFormPage />} />
            <Route path="/catalog/items/:id/edit" element={<ItemFormPage />} />

            <Route
              path="/catalog/categories"
              element={<ItemCategoryListPage />}
            />
            <Route
              path="/catalog/categories/new"
              element={<ItemCategoryFormPage />}
            />
            <Route
              path="/catalog/categories/:id/edit"
              element={<ItemCategoryFormPage />}
            />

            <Route
              path="/catalog/units-of-measure"
              element={<UnitOfMeasureListPage />}
            />

            <Route path="/pipeline-flows" element={<PipelineFlowListPage />} />
            <Route
              path="/pipeline-flows/new"
              element={<PipelineFlowFormPage />}
            />
            <Route
              path="/pipeline-flows/:id/edit"
              element={<PipelineFlowFormPage />}
            />

            <Route path="/tenants" element={<TenantListPage />} />
            <Route path="/tenants/new" element={<TenantFormPage />} />
            <Route path="/tenants/:id/edit" element={<TenantFormPage />} />

            <Route path="/users" element={<UserListPage />} />
            <Route path="/users/new" element={<UserFormPage />} />
            <Route path="/users/:id/edit" element={<UserFormPage />} />

            <Route path="/workers" element={<WorkerListPage />} />
            <Route path="/workers/new" element={<WorkerFormPage />} />
            <Route path="/workers/:id/edit" element={<WorkerFormPage />} />

            <Route path="/admin/roles" element={<RoleListPage />} />
            <Route path="/admin/roles/new" element={<RoleFormPage />} />
            <Route path="/admin/roles/:id/edit" element={<RoleFormPage />} />

            <Route path="/admin/permissions" element={<PermissionListPage />} />

            <Route path="/campaigns" element={<CampaignsPage />} />

            {/* Marketing */}
            <Route
              path="/marketing/campaigns"
              element={<MarketingCampaignsPage />}
            />
            <Route
              path="/marketing/automation"
              element={<MarketingAutomationPage />}
            />
            <Route path="/marketing/contacts" element={<ContactListPage />} />
            <Route
              path="/marketing/landing-page"
              element={<LandingPageConfigPage />}
            />
            <Route path="/marketing/coupons" element={<CouponsPage />} />
            <Route path="/marketing/cashback" element={<CashbackPage />} />
            <Route path="/marketing/affiliates" element={<AffiliatesPage />} />
            <Route path="/plans" element={<PlanPage />} />

            {/* Expenses */}
            <Route path="/expenses" element={<ExpensesPage />} />

            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/me/profile" element={<MyProfilePage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route
              path="/settings/configuracoes"
              element={
                <Navigate
                  to="/settings/configuracoes/payment-methods"
                  replace
                />
              }
            />
            <Route
              path="/settings/configuracoes/payment-methods"
              element={<PaymentMethodsSettingsPage />}
            />
            <Route
              path="/settings/configuracoes/delivery"
              element={<DeliverySettingsPage />}
            />
          </Route>

          <Route element={<AuthenticatedFullscreenLayout />}>
            <Route
              path="/conversations"
              element={<Navigate to="/chat" replace />}
            />
            <Route path="/chat" element={<ConversationsPage />} />
            <Route path="/schedules/board" element={<SchedulesBoardPage />} />
            <Route path="/marketing/leads" element={<LeadsBoardPage />} />
          </Route>

          <Route path="*" element={<RootRedirect />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
