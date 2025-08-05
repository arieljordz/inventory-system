import React, {
  useEffect,
  useState,
  useMemo,
  useCallback,
  useRef,
} from "react";
import { toast } from "react-toastify";
import { InfoBox } from "../../components/common/FormInputs";
import { useSpinner } from "../../context/SpinnerContext";
import { getAllOrdersByDate } from "../../services/orderService";
import { getCurrentDate, formatAmount } from "../../utils/commonUtils";
import {
  importSalesByPlatform,
  getSalesStatsByDate,
} from "../../services/salesService";
import { PlatformEnum, CourierEnum } from "../../enums/enums";
import Navpath from "../../components/common/Navpath";
import SearchBar from "../../components/common/SearchBar";
import PaginationControls from "../../components/common/PaginationControls";
import DateRangeFilter from "../../components/common/DateRangeFilter";
import SalesTable from "./SalesTable";
import ImportModal from "./ImportModal";

const initialFormState = {
  quantity: "",
  platformOrderId: "",
  price: "",
  courier: CourierEnum.SPX,
  platform: PlatformEnum.SHOPEE,
  remarks: "",
};

const SalesPage = () => {
  const [dateRange, setDateRange] = useState({
    startDate: getCurrentDate(),
    endDate: getCurrentDate(),
  });
  const { showSpinner, hideSpinner } = useSpinner();
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState([]);
  const [form, setForm] = useState(initialFormState);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [paginatedItems, setPaginatedItems] = useState([]);

  const [showImportModal, setShowImportModal] = useState(false);
  const fileInputRef = useRef(null);

  const platformOptions = useMemo(
    () =>
      Object.entries(PlatformEnum).map(([key, value]) => ({
        label: value,
        value: key,
      })),
    []
  );

  const filteredBySearch = useMemo(() => {
    return orders.filter((item) =>
      ["name", "platform", "platfromOrderId", "courier"].some((field) =>
        String(item[field] || "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
      )
    );
  }, [orders, searchTerm]);

  const handleItemsPerPageChange = useCallback((val) => {
    setItemsPerPage(val);
    setCurrentPage(1);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const fetchOrders = async () => {
    try {
      showSpinner();
      const { startDate, endDate } = dateRange;
      const [statsRes, ordersRes] = await Promise.all([
        getSalesStatsByDate(startDate, endDate),
        getAllOrdersByDate(startDate, endDate),
      ]);
      setOrders(ordersRes.data);
      setStats(statsRes.data);
    } catch (error) {
      console.error("Failed to fetch orders", error);
    } finally {
      hideSpinner();
    }
  };

  const handleFilter = async () => {
    fetchOrders();
  };

  const handleImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const platform = form.platform?.trim();
    if (!platform) {
      toast.error("Please select a platform before uploading.");
      return;
    }

    const formData = new FormData();
    formData.append("platform", platform);
    formData.append("file", file);

    try {
      showSpinner();

      const response = await importSalesByPlatform(formData);
      const { message, updatedOrderIds } = response.data;

      toast.success(message || "Import successful.");
      if (updatedOrderIds?.length) {
        console.log("Updated Orders:", updatedOrderIds);
      }

      await fetchOrders(); // Refresh data after import
    } catch (err) {
      console.error("Import failed:", err);
      toast.error(err.response?.data?.message || "Failed to import sales.");
    } finally {
      hideSpinner();
      setShowImportModal(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = null; // Reset file input
      }
    }
  };

  return (
    <>
      <Navpath levelOne="Sales" levelTwo="Home" levelThree="Sales" />
      <section className="content">
        <div className="container-fluid">
          {/* Info Boxes */}
          <div className="row">
            <InfoBox
              label="Total Sales"
              icon="fas fa-dollar-sign"
              color="success"
              value={formatAmount(stats.totalSales || 0)}
            />
            <InfoBox
              label="Total Orders"
              icon="fas fa-receipt"
              color="primary"
              value={stats.totalOrders || 0}
            />
            <InfoBox
              label="Revenue Today"
              icon="fas fa-calendar-day"
              color="info"
              value={formatAmount(stats.revenue || 0)}
            />
            <InfoBox
              label="Unpaid Orders"
              icon="fas fa-clock"
              color="danger"
              value={stats.unpaidOrders || 0}
            />
          </div>

          {/* Filters */}
          <DateRangeFilter
            dateRange={dateRange}
            onDateChange={setDateRange}
            onFilter={handleFilter}
          />

          <button
            className="btn btn-success mb-3"
            onClick={() => setShowImportModal(true)}
          >
            <i className="fas fa-file-import mr-1"></i> Import Sales
          </button>
          <SearchBar
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            itemsPerPage={itemsPerPage}
            onItemsPerPageChange={handleItemsPerPageChange}
          />

          <SalesTable orders={paginatedItems} />

          <PaginationControls
            data={filteredBySearch}
            currentPage={currentPage}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            onPaginatedDataChange={setPaginatedItems}
          />

          <ImportModal
            show={showImportModal}
            onClose={() => setShowImportModal(false)}
            form={form}
            handleChange={handleChange}
            fileInputRef={fileInputRef}
            handleImport={handleImport}
            platformOptions={platformOptions}
          />
        </div>
      </section>
    </>
  );
};

export default SalesPage;
