import React, { useState, useCallback, useMemo } from "react";
import { useSpinner } from "../../context/SpinnerContext";
import Navpath from "../../components/common/Navpath";
import InventoryTable from "./InventoryTable";
import {
  getInventoryStats,
  getInventoryMovements,
  getRemainingPerProduct,
} from "../../services/inventoryDetailService";
import { getCurrentDate } from "../../utils/commonUtils";
import { InfoBox } from "../../components/common/FormInputs";
import { MovementTypeEnum } from "../../enums/enums";
import SearchBar from "../../components/common/SearchBar";
import PaginationControls from "../../components/common/PaginationControls";
import DateRangeFilter from "../../components/common/DateRangeFilter";

const InventoryPage = () => {
  const [dateRange, setDateRange] = useState({
    startDate: getCurrentDate(),
    endDate: getCurrentDate(),
  });
  const { showSpinner, hideSpinner } = useSpinner();
  const [stats, setStats] = useState({ remaining: 0, totalIn: 0, totalOut: 0 });
  const [filteredData, setFilteredData] = useState([]);
  const [remainingPerProduct, setRemainingPerProduct] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [paginatedItems, setPaginatedItems] = useState([]);

  const handleFilter = async () => {
    try {
      showSpinner(); // Start spinner

      const { startDate, endDate } = dateRange;
      const [statsRes, movementsRes, remainingRes] = await Promise.all([
        getInventoryStats(startDate, endDate),
        getInventoryMovements(startDate, endDate),
        getRemainingPerProduct(),
      ]);

      setStats(statsRes.data);
      setFilteredData(movementsRes.data);
      setRemainingPerProduct(remainingRes.data);
    } catch (err) {
      console.error("Failed to fetch inventory data", err);
    } finally {
      hideSpinner(); // Always stop spinner
    }
  };

  const filteredBySearch = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    return filteredData.filter((m) => {
      const product = m.product || {};
      const value = String(m.movementType || "").toLowerCase();

      if (["in", "out"].includes(search)) {
        return value === search; // strict match for movementType only
      }

      const productFields = ["name"];
      const rootFields = ["movementType", "quantity"];

      const matchesProductFields = productFields.some((field) =>
        String(product[field] || "")
          .toLowerCase()
          .includes(search)
      );

      const matchesRootFields = rootFields.some((field) =>
        String(m[field] || "")
          .toLowerCase()
          .includes(search)
      );

      return matchesProductFields || matchesRootFields;
    });
  }, [filteredData, searchTerm]);

  const handleItemsPerPageChange = useCallback((val) => {
    setItemsPerPage(val);
    setCurrentPage(1);
  }, []);

  return (
    <>
      <Navpath levelOne="Inventory Management" levelTwo="Home" levelThree="Inventory" />
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
            onFilter={handleFilter}
          />

          {/* Search + Items Per Page */}

          <SearchBar
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            itemsPerPage={itemsPerPage}
            onItemsPerPageChange={handleItemsPerPageChange}
          />

          {/* Inventory Table */}
          <InventoryTable
            data={paginatedItems}
            remainingPerProduct={remainingPerProduct}
          />

          {/* Pagination */}
          <PaginationControls
            data={filteredBySearch}
            currentPage={currentPage}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            onPaginatedDataChange={setPaginatedItems}
          />
        </div>
      </section>
    </>
  );
};

export default InventoryPage;
