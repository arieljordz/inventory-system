import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./App.css";
import { useAxiosInterceptor } from "./hooks/useAxiosInterceptor";

// Layout
import MainLayout from "./layouts/MainLayout";

// Pages
import LoginPage from "./pages/Login/LoginPage";
import Dashboard from "./pages/Dashboard/Dashboard";
import ProductsPage from "./pages/Products/ProductsPage";
import OrderPage from "./pages/Orders/OrderPage";
// import TrackingsPage from "./pages/Trackings/TrackingsPage";
// import OrderInventoryPage from "./pages/OrderInventory/OrderInventoryPage";
import ItemInventoryPage from "./pages/ItemInventory/ItemInventoryPage";
import SalesPage from "./pages/Sales/SalesPage";
import ReportsPage from "./pages/Reports/ReportsPage";
import UsersPage from "./pages/Users/UsersPage";
import SettingsPage from "./pages/Settings/SettingsPage";
import AuditLogPage from "./pages/AuditLogs/AuditLogPage";

const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;

function App() {
  useAxiosInterceptor();
  return (
    <GoogleOAuthProvider clientId={API_KEY}>
      <BrowserRouter>
        <Routes>
          {/* Login page without layout */}
          <Route path="/" element={<LoginPage />} />

          {/* Pages with layout */}
          <Route element={<MainLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/orders" element={<OrderPage />} />
            {/* <Route path="/trackings" element={<TrackingsPage />} /> */}
            {/* <Route path="/order-inventory" element={<OrderInventoryPage />} /> */}
            <Route path="/item-inventory" element={<ItemInventoryPage />} />
            <Route path="/sales" element={<SalesPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/users" element={<UsersPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/auditlogs" element={<AuditLogPage />} />
          </Route>
        </Routes>

        <ToastContainer position="top-right" autoClose={2000} />
      </BrowserRouter>
    </GoogleOAuthProvider>
  );
}

export default App;
