/**
 * Dashboard mock service — thin re-export from centralized mocks.
 *
 * When a real API is available, replace each function body with
 * an HTTP call and delete the corresponding JSON in `src/mocks/dashboard/`.
 */
export {
  getFunnelData,
  getConversionRateData,
  getRecentMessagesData,
  getRecentOrdersData,
} from "@/mocks/mockApi";
