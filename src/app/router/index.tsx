import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router";
import { AuthGuard } from "@/app/guards/auth-guard";
import { AppLayout } from "@/app/layouts/app-layout";
import { PublicLayout } from "@/app/layouts/public-layout";
import { useAuthStore } from "@/lib/auth/authStore";

// Lazy pages

// Auth
const LoginPage = lazy(() =>
  import("@/features/auth/pages/LoginPage").then((m) => ({ default: m.LoginPage }))
);

// Dashboard
const DashboardPage = lazy(() =>
  import("@/features/dashboard/pages/DashboardPage").then((m) => ({ default: m.DashboardPage }))
);

// Customers
const CustomerListPage = lazy(() =>
  import("@/features/customers/pages/CustomerListPage").then((m) => ({ default: m.CustomerListPage }))
);
const CustomerFormPage = lazy(() =>
  import("@/features/customers/pages/CustomerFormPage").then((m) => ({ default: m.CustomerFormPage }))
);
const CustomerDetailsPage = lazy(() =>
  import("@/features/customers/pages/CustomerDetailsPage").then((m) => ({ default: m.CustomerDetailsPage }))
);

// Leads
const LeadListPage = lazy(() =>
  import("@/features/leads/pages/LeadListPage").then((m) => ({ default: m.LeadListPage }))
);
const LeadFormPage = lazy(() =>
  import("@/features/leads/pages/LeadFormPage").then((m) => ({ default: m.LeadFormPage }))
);
const LeadDetailsPage = lazy(() =>
  import("@/features/leads/pages/LeadDetailsPage").then((m) => ({ default: m.LeadDetailsPage }))
);

// Orders
const OrderListPage = lazy(() =>
  import("@/features/orders/pages/OrderListPage").then((m) => ({ default: m.OrderListPage }))
);
const OrderFormPage = lazy(() =>
  import("@/features/orders/pages/OrderFormPage").then((m) => ({ default: m.OrderFormPage }))
);
const OrderDetailsPage = lazy(() =>
  import("@/features/orders/pages/OrderDetailsPage").then((m) => ({ default: m.OrderDetailsPage }))
);

// Appointments
const AppointmentListPage = lazy(() =>
  import("@/features/appointments/pages/AppointmentListPage").then((m) => ({ default: m.AppointmentListPage }))
);
const AppointmentFormPage = lazy(() =>
  import("@/features/appointments/pages/AppointmentFormPage").then((m) => ({ default: m.AppointmentFormPage }))
);

// Schedules
const ScheduleListPage = lazy(() =>
  import("@/features/schedules/pages/ScheduleListPage").then((m) => ({ default: m.ScheduleListPage }))
);
const ScheduleFormPage = lazy(() =>
  import("@/features/schedules/pages/ScheduleFormPage").then((m) => ({ default: m.ScheduleFormPage }))
);

// Persons
const PersonListPage = lazy(() =>
  import("@/features/persons/pages/PersonListPage").then((m) => ({ default: m.PersonListPage }))
);
const PersonFormPage = lazy(() =>
  import("@/features/persons/pages/PersonFormPage").then((m) => ({ default: m.PersonFormPage }))
);

// Addresses
const AddressListPage = lazy(() =>
  import("@/features/addresses/pages/AddressListPage").then((m) => ({ default: m.AddressListPage }))
);
const AddressFormPage = lazy(() =>
  import("@/features/addresses/pages/AddressFormPage").then((m) => ({ default: m.AddressFormPage }))
);

// Catalog - Items
const ItemListPage = lazy(() =>
  import("@/features/catalog/items/pages/ItemListPage").then((m) => ({ default: m.ItemListPage }))
);
const ItemFormPage = lazy(() =>
  import("@/features/catalog/items/pages/ItemFormPage").then((m) => ({ default: m.ItemFormPage }))
);

// Catalog - Categories
const ItemCategoryListPage = lazy(() =>
  import("@/features/catalog/categories/pages/ItemCategoryListPage").then((m) => ({ default: m.ItemCategoryListPage }))
);
const ItemCategoryFormPage = lazy(() =>
  import("@/features/catalog/categories/pages/ItemCategoryFormPage").then((m) => ({ default: m.ItemCategoryFormPage }))
);

// Catalog - Units of measure
const UnitOfMeasureListPage = lazy(() =>
  import("@/features/catalog/units-of-measure/pages/UnitOfMeasureListPage").then((m) => ({ default: m.UnitOfMeasureListPage }))
);

// Pipeline
const PipelineFlowListPage = lazy(() =>
  import("@/features/pipeline/pages/PipelineFlowListPage").then((m) => ({ default: m.PipelineFlowListPage }))
);
const PipelineFlowFormPage = lazy(() =>
  import("@/features/pipeline/pages/PipelineFlowFormPage").then((m) => ({ default: m.PipelineFlowFormPage }))
);

// Admin - Tenants
const TenantListPage = lazy(() =>
  import("@/features/admin/tenants/pages/TenantListPage").then((m) => ({ default: m.TenantListPage }))
);
const TenantFormPage = lazy(() =>
  import("@/features/admin/tenants/pages/TenantFormPage").then((m) => ({ default: m.TenantFormPage }))
);

// Admin - Users
const UserListPage = lazy(() =>
  import("@/features/admin/users/pages/UserListPage").then((m) => ({ default: m.UserListPage }))
);
const UserFormPage = lazy(() =>
  import("@/features/admin/users/pages/UserFormPage").then((m) => ({ default: m.UserFormPage }))
);

// Admin - Workers
const WorkerListPage = lazy(() =>
  import("@/features/admin/workers/pages/WorkerListPage").then((m) => ({ default: m.WorkerListPage }))
);
const WorkerFormPage = lazy(() =>
  import("@/features/admin/workers/pages/WorkerFormPage").then((m) => ({ default: m.WorkerFormPage }))
);

// Admin - Roles
const RoleListPage = lazy(() =>
  import("@/features/admin/roles/pages/RoleListPage").then((m) => ({ default: m.RoleListPage }))
);
const RoleFormPage = lazy(() =>
  import("@/features/admin/roles/pages/RoleFormPage").then((m) => ({ default: m.RoleFormPage }))
);

// Admin - Permissions
const PermissionListPage = lazy(() =>
  import("@/features/admin/permissions/pages/PermissionListPage").then((m) => ({ default: m.PermissionListPage }))
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

            <Route path="/orders" element={<OrderListPage />} />
            <Route path="/orders/new" element={<OrderFormPage />} />
            <Route path="/orders/:id" element={<OrderDetailsPage />} />
            <Route path="/orders/:id/edit" element={<OrderFormPage />} />

            <Route path="/appointments" element={<AppointmentListPage />} />
            <Route path="/appointments/new" element={<AppointmentFormPage />} />
            <Route path="/appointments/:id/edit" element={<AppointmentFormPage />} />

            <Route path="/schedules" element={<ScheduleListPage />} />
            <Route path="/schedules/new" element={<ScheduleFormPage />} />
            <Route path="/schedules/:id/edit" element={<ScheduleFormPage />} />

            <Route path="/persons" element={<PersonListPage />} />
            <Route path="/persons/new" element={<PersonFormPage />} />
            <Route path="/persons/:id/edit" element={<PersonFormPage />} />

            <Route path="/addresses" element={<AddressListPage />} />
            <Route path="/addresses/new" element={<AddressFormPage />} />
            <Route path="/addresses/:id/edit" element={<AddressFormPage />} />

            <Route path="/catalog/items" element={<ItemListPage />} />
            <Route path="/catalog/items/new" element={<ItemFormPage />} />
            <Route path="/catalog/items/:id/edit" element={<ItemFormPage />} />

            <Route path="/catalog/categories" element={<ItemCategoryListPage />} />
            <Route path="/catalog/categories/new" element={<ItemCategoryFormPage />} />
            <Route path="/catalog/categories/:id/edit" element={<ItemCategoryFormPage />} />

            <Route path="/catalog/units-of-measure" element={<UnitOfMeasureListPage />} />

            <Route path="/pipeline-flows" element={<PipelineFlowListPage />} />
            <Route path="/pipeline-flows/new" element={<PipelineFlowFormPage />} />
            <Route path="/pipeline-flows/:id/edit" element={<PipelineFlowFormPage />} />

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
          </Route>

          <Route path="*" element={<RootRedirect />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}