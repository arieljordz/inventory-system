import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./App.css";

// Layout
import MainLayout from "./layouts/MainLayout";

// Pages
import LoginPage from "./pages/Login/LoginPage";
import Dashboard from "./pages/Dashboard/Dashboard";
import ProductsPage from "./pages/Products/ProductsPage";
import TrackingsPage from "./pages/Trackings/TrackingsPage";
import SalesPage from "./pages/Sales/SalesPage";
import ReportsPage from "./pages/Reports/ReportsPage";
import InventoryPage from "./pages/Inventory/InventoryPage";

const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;

function App() {
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
            <Route path="/trackings" element={<TrackingsPage />} />
            <Route path="/inventory" element={<InventoryPage />} />
            <Route path="/sales" element={<SalesPage />} />
            <Route path="/reports" element={<ReportsPage />} />
          </Route>
        </Routes>

        <ToastContainer position="top-right" autoClose={2000} />
      </BrowserRouter>
    </GoogleOAuthProvider>
  );
}

export default App;
