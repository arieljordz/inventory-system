import React, { useEffect, useState, useCallback } from "react";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import { useSpinner } from "../../context/SpinnerContext";

import {
  getSalesStatsByDate,
  importSalesByPlatform,
} from "../../services/salesService";
import { getCurrentDate, formatAmount } from "../../utils/commonUtils";

import Navpath from "../../components/common/Navpath";
import { InfoBox } from "../../components/common/FormInputs";
import SearchBar from "../../components/common/SearchBar";
import PaginationControls from "../../components/common/PaginationControls";
import DateRangeFilter from "../../components/common/DateRangeFilter";
import SalesTable from "./SalesTable";
import ImportModal from "./ImportModal";

import { PlatformEnum, CourierEnum } from "../../enums/enums";
import { useDebounce } from "../../hooks/useDebounce";

const initialFormState = {
  quantity: "",
  platformOrderId: "",
  price: "",
  courier: CourierEnum.SPX,
  platform: PlatformEnum.SHOPEE,
  remarks: "",
};

const SalesPage = () => {
  const { showSpinner, hideSpinner } = useSpinner();
  /** 🔹 Core state */
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalSales: 0,
    revenueToday: 0,
    unpaidOrders: 0,
  });
  const [loading, setLoading] = useState(false);

  /** 🔹 Search & pagination state */
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [totalItems, setTotalItems] = useState(0);

  /** 🔹 Date filter */
  const [dateRange, setDateRange] = useState({
    startDate: getCurrentDate(),
    endDate: getCurrentDate(),
  });

  const debouncedSearchTerm = useDebounce(searchTerm, 1000);

  /** 🔹 Import modal state */
  const [showImportModal, setShowImportModal] = useState(false);
  const [form, setForm] = useState(initialFormState);

  // Platform options
  const platformOptions = Object.entries(PlatformEnum).map(([key, value]) => ({
    label: value,
    value: key,
  }));

  /** 🔹 Fetch sales (server handles pagination + search) */
  const fetchSales = useCallback(async () => {
    setLoading(true);
    try {
      const { startDate, endDate } = dateRange;

      const res = await getSalesStatsByDate({
        start: startDate,
        end: endDate,
        page: currentPage,
        limit: itemsPerPage,
        search: debouncedSearchTerm,
      });

      const {
        orders: fetchedOrders,
        totalOrders,
        totalPages,
        totalSales,
        unpaidOrders,
        revenueToday,
      } = res.data;

      setOrders(fetchedOrders || []);
      setStats({
        totalOrders: totalOrders ?? 0,
        totalSales: totalSales ?? 0,
        unpaidOrders: unpaidOrders ?? 0,
        revenueToday: revenueToday ?? 0,
      });
      setTotalItems(totalOrders || 0);

      // Fix current page if overflow
      if (currentPage > totalPages && totalPages > 0) {
        setCurrentPage(totalPages);
      }
    } catch (error) {
      console.error("Failed to fetch sales data:", error);
      toast.error("Failed to fetch sales data");
      setOrders([]);
      setStats({});
      setTotalItems(0);
    } finally {
      setLoading(false);
    }
  }, [dateRange, currentPage, itemsPerPage, debouncedSearchTerm]);

  useEffect(() => {
    fetchSales();
  }, [fetchSales]);

  /** 🔹 Reset page on search change */
  useEffect(() => {
    if (currentPage !== 1) setCurrentPage(1);
  }, [debouncedSearchTerm]);

  /** 🔹 Event Handlers */
  const handleSearchChange = useCallback((val) => setSearchTerm(val), []);
  const handleItemsPerPageChange = useCallback((val) => {
    setItemsPerPage(val);
    setCurrentPage(1);
  }, []);
  const handlePageChange = useCallback((page) => setCurrentPage(page), []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  /** 🔹 Import Modal Handlers */
  const openImportModal = useCallback(() => setShowImportModal(true), []);
  const closeImportModal = useCallback(() => setShowImportModal(false), []);

  const handleImport = useCallback(
    async (file, platform) => {
      if (!file || !platform) {
        toast.error("Please select a platform and file.");
        return;
      }

      const formData = new FormData();
      formData.append("platform", platform);
      formData.append("file", file);

      try {
        showSpinner();
        const res = await importSalesByPlatform(formData);
        const { message, details } = res.data;

        console.log("res.data:", res.data);
        if (details?.alreadyPaid?.length || details?.notFound?.length) {
          const warningMessages = [
            ...(details.alreadyPaid || []).map(
              (id, idx) => `#${idx + 1} (Order ID: ${id}): Already Paid`
            ),
            ...(details.notFound || []).map(
              (id, idx) => `#${idx + 1} (Order ID: ${id}): Not Found`
            ),
          ];

          Swal.fire({
            icon: "warning",
            title: "Import Completed with Issues",
            html: `<div style="max-height:300px; overflow:auto">${warningMessages.join(
              "<br>"
            )}</div>`,
            width: "40em",
          });
        } else {
          toast.success(message || "Sales imported successfully!");
        }

        await fetchSales();
      } catch (err) {
        console.error("Sales import failed:", err);
        toast.error(err.response?.data?.message || "Failed to import sales.");
      } finally {
        hideSpinner();
        closeImportModal();
      }
    },
    [fetchSales, showSpinner, hideSpinner, closeImportModal]
  );

  return (
    <>
      <Navpath levelOne="Sales Management" levelTwo="Home" levelThree="Sales" />

      <section className="content">
        <div className="container-fluid">
          {/* Info Boxes */}
          <div className="row">
            <InfoBox
              label="Total Sales"
              icon="fas fa-money-bill-wave"
              color="success"
              value={formatAmount(stats.totalSales)}
            />
            <InfoBox
              label="Total Orders"
              icon="fas fa-receipt"
              color="primary"
              value={stats.totalOrders}
            />
            <InfoBox
              label="Revenue Today"
              icon="fas fa-calendar-day"
              color="info"
              value={formatAmount(stats.revenueToday)}
            />
            <InfoBox
              label="Unpaid Orders"
              icon="fas fa-clock"
              color="danger"
              value={stats.unpaidOrders}
            />
          </div>

          {/* Date Filter */}
          <DateRangeFilter
            dateRange={dateRange}
            onDateChange={setDateRange}
            onFilter={fetchSales}
          />

          {/* Import button */}
          <button
            className="btn btn-success mb-3"
            onClick={openImportModal}
            disabled={loading}
          >
            <i className="fas fa-file-import mr-1"></i> Import Sales
          </button>

          {/* Search + Items Per Page */}
          <SearchBar
            searchTerm={searchTerm}
            onSearchChange={handleSearchChange}
            itemsPerPage={itemsPerPage}
            onItemsPerPageChange={handleItemsPerPageChange}
            disabled={loading}
          />

          {/* Sales Table */}
          <SalesTable orders={orders} loading={loading} />

          {/* Pagination */}
          <PaginationControls
            currentPage={currentPage}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            onPageChange={handlePageChange}
            disabled={loading}
          />

          {/* Import Modal */}
          <ImportModal
            show={showImportModal}
            onClose={closeImportModal}
            form={form}
            handleChange={handleChange}
            handleImport={handleImport}
            platformOptions={platformOptions}
          />
        </div>
      </section>
    </>
  );
};

export default SalesPage;
