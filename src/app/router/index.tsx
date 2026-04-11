import { BrowserRouter, Routes, Route } from "react-router";
import { BaseLayout } from "@/app/layouts/base-layout";
import { HomePage } from "@/pages/home";

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <BaseLayout>
              <HomePage />
            </BaseLayout>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
