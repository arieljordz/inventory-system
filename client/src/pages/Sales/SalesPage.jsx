import React, { useEffect, useState, useCallback } from "react";
import { toast } from "react-toastify";
import { useSpinner } from "../../context/SpinnerContext";

import {
  getSalesStatsByDate,
  importSalesByPlatform,
} from "../../services/salesService";
import { getCurrentDate, formatAmount } from "../../utils/commonUtils";
import { importHandlers } from "../../utils/importUtils";

import Navpath from "../../components/common/Navpath";
import { InfoBox } from "../../components/common/FormInputs";
import SearchBar from "../../components/common/SearchBar";
import PaginationControls from "../../components/common/PaginationControls";
import DateRangeFilter from "../../components/common/DateRangeFilter";
import SalesTable from "./SalesTable";
import ImportModal from "./ImportModal";

import { PlatformEnum, CourierEnum } from "../../enums/enums";
import { useDebounce } from "../../hooks/useDebounce";
import ImportButtons from "./ImportButtons";

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
  const [importType, setImportType] = useState(""); // "sales" or "returned"
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
  const openImportModal = useCallback((type) => {
    setImportType(type);
    setShowImportModal(true);
  }, []);
  const closeImportModal = useCallback(() => {
    setShowImportModal(false);
    setImportType("");
  }, []);

  const handleImport = useCallback(
    async (file, platform, importType) => {
      if (!file || !platform) {
        toast.error("Please select a platform and file.");
        return;
      }
      console.log("Import Type:", importType);

      const handler = importHandlers[importType];
      if (!handler) {
        toast.error(`Unsupported import type: ${importType}`);
        return;
      }

      const formData = new FormData();
      formData.append("platform", platform);
      formData.append("file", file);

      try {
        showSpinner();

        // 🔑 Call the correct API
        const res = await handler.api(formData);
        const { details } = res.data;

        // console.log(`${importType} res.data:`, res.data);

        // ✅ Show results
        handler.showResults(details, platform);

        // 🔑 Refresh data only if needed
        await fetchSales();
      } catch (err) {
        console.error(`${importType} import failed:`, err);
        toast.error(
          err.response?.data?.message || `Failed to import ${importType}.`
        );
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

          <ImportButtons
            loading={loading}
            onImportSales={() => openImportModal("sales")}
            onImportReturned={() => openImportModal("returned")}
          />

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
            handleImport={(file, platform) =>
              handleImport(file, platform, importType)
            }
            platformOptions={platformOptions}
            importType={importType}
          />
        </div>
      </section>
    </>
  );
};

export default SalesPage;
