import React, { useEffect, useState, useCallback } from "react";
import { toast } from "react-toastify";
import { useSpinner } from "../../context/SpinnerContext";

import {
  getInventoryStats,
  getInventoryMovements,
  getRemainingPerProduct,
} from "../../services/inventoryDetailService";

import Navpath from "../../components/common/Navpath";
import InventoryTable from "./InventoryTable";
import SearchBar from "../../components/common/SearchBar";
import PaginationControls from "../../components/common/PaginationControls";
import DateRangeFilter from "../../components/common/DateRangeFilter";
import { InfoBox } from "../../components/common/FormInputs";

import { getCurrentDate } from "../../utils/commonUtils";
import { useDebounce } from "../../hooks/useDebounce";

const InventoryPage = () => {
  /** 🔹 Core state */
  const [movements, setMovements] = useState([]);
  const [remainingPerProduct, setRemainingPerProduct] = useState([]);
  const [stats, setStats] = useState({
    availableProductCount: 0,
    totalAvailableQuantity: 0,
    totalIn: 0,
    totalOut: 0,
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

  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  /** 🔹 Fetch Movements (server handles pagination + search) */
  const fetchMovements = useCallback(async () => {
    setLoading(true);
    try {
      const { startDate, endDate } = dateRange;

      const [statsRes, movementsRes, remainingRes] = await Promise.all([
        getInventoryStats(startDate, endDate),
        getInventoryMovements({
          start: startDate,
          end: endDate,
          page: currentPage,
          limit: itemsPerPage,
          search: debouncedSearchTerm,
        }),
        getRemainingPerProduct(),
      ]);

      const { movements: fetchedMovements, totalMovements, totalPages } =
        movementsRes.data;

      // console.log("movementsRes.data:", movementsRes.data);
      setStats(statsRes.data);
      setMovements(fetchedMovements || []);
      setRemainingPerProduct(remainingRes.data || []);
      setTotalItems(totalMovements || 0);

      // Fix current page if overflow
      if (currentPage > totalPages && totalPages > 0) {
        setCurrentPage(totalPages);
      }
    } catch (error) {
      console.error("Failed to fetch inventory data:", error);
      toast.error("Failed to fetch inventory data");
      setMovements([]);
      setRemainingPerProduct([]);
      setStats({
        availableProductCount: 0,
        totalAvailableQuantity: 0,
        totalIn: 0,
        totalOut: 0,
      });
      setTotalItems(0);
    } finally {
      setLoading(false);
    }
  }, [dateRange, currentPage, itemsPerPage, debouncedSearchTerm]);

  useEffect(() => {
    fetchMovements();
  }, [fetchMovements]);

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

  return (
    <>
      <Navpath
        levelOne="Inventory Management"
        levelTwo="Home"
        levelThree="Inventory"
      />

      <section className="content">
        <div className="container-fluid">
          {/* Info Boxes */}
          <div className="row">
            <InfoBox
              icon="fas fa-layer-group"
              label="Unique Products"
              value={stats.availableProductCount ?? 0}
              color="primary"
            />
            <InfoBox
              icon="fas fa-boxes"
              label="Remaining Qty (Total)"
              value={stats.totalAvailableQuantity ?? 0}
              color="info"
            />
            <InfoBox
              icon="fas fa-arrow-circle-down"
              label="Total In"
              value={stats.totalIn ?? 0}
              color="success"
            />
            <InfoBox
              icon="fas fa-arrow-circle-up"
              label="Total Out"
              value={stats.totalOut ?? 0}
              color="danger"
            />
          </div>

          {/* Date Filter */}
          <DateRangeFilter
            dateRange={dateRange}
            onDateChange={setDateRange}
            onFilter={fetchMovements}
          />

          {/* Search + Items Per Page */}
          <SearchBar
            searchTerm={searchTerm}
            onSearchChange={handleSearchChange}
            itemsPerPage={itemsPerPage}
            onItemsPerPageChange={handleItemsPerPageChange}
            disabled={loading}
          />

          {/* Inventory Table */}
          <InventoryTable
            data={movements}
            remainingPerProduct={remainingPerProduct}
            loading={loading}
          />

          {/* Pagination */}
          <PaginationControls
            currentPage={currentPage}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            onPageChange={handlePageChange}
            disabled={loading}
          />
        </div>
      </section>
    </>
  );
};

export default InventoryPage;
