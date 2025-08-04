import React, { useState, useCallback, useMemo } from "react";
import Navpath from "../../components/common/Navpath";
import InventoryTable from "./InventoryTable";
import {
  getInventoryStats,
  getInventoryMovements,
  getRemainingPerProduct,
} from "../../services/inventoryDetailService";
import { InfoBox } from "../../components/common/FormInputs";
import { StatusEnum, MovementTypeEnum } from "../../enums/enums";
import SearchBar from "../../components/common/SearchBar";
import PaginationControls from "../../components/common/PaginationControls";

const InventoryPage = () => {
  const today = new Date().toISOString().split("T")[0];

  const [dateRange, setDateRange] = useState({
    startDate: today,
    endDate: today,
  });
  const [stats, setStats] = useState({ remaining: 0, totalIn: 0, totalOut: 0 });
  const [filteredData, setFilteredData] = useState([]);
  const [remainingPerProduct, setRemainingPerProduct] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [paginatedItems, setPaginatedItems] = useState([]);

  const fetchData = async () => {
    try {
      const { startDate, endDate } = dateRange;
      const [statsRes, movementsRes, remainingRes] = await Promise.all([
        getInventoryStats(startDate, endDate),
        getInventoryMovements(startDate, endDate),
        getRemainingPerProduct(),
      ]);

      const totals = computeTotalsByRange(
        movementsRes.data,
        startDate,
        endDate
      );

      setStats({ remaining: statsRes.data.remaining, ...totals });
      setFilteredData(movementsRes.data);
      setRemainingPerProduct(remainingRes.data);
    } catch (err) {
      console.error("Failed to fetch inventory data", err);
    }
  };

  const computeTotalsByRange = (filteredData, startDate, endDate) => {
    const filtered = filteredData.filter((m) => {
      const movementDate = new Date(m.createdAt).toISOString().split("T")[0];
      return movementDate >= startDate && movementDate <= endDate;
    });

    let totalIn = 0;
    let totalOut = 0;

    filtered.forEach((m) => {
      if (m.movementType === MovementTypeEnum.IN) totalIn += m.quantity;
      else if (m.movementType === MovementTypeEnum.OUT) totalOut += m.quantity;
    });

    return { totalIn, totalOut };
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
      <Navpath levelOne="Inventory" levelTwo="Home" levelThree="Inventory" />
      <section className="content">
        <div className="container-fluid">
          {/* Info Boxes */}
          <div className="row">
            <InfoBox
              icon="fas fa-layer-group"
              label="Unique Products"
              value={remainingPerProduct.length}
              color="primary"
            />
            <InfoBox
              icon="fas fa-boxes"
              label="Remaining Qty (Total)"
              value={remainingPerProduct.length}
              color="info"
            />
            <InfoBox
              icon="fas fa-arrow-circle-down"
              label="Total In"
              value={stats.totalIn}
              color="success"
            />
            <InfoBox
              icon="fas fa-arrow-circle-up"
              label="Total Out"
              value={stats.totalOut}
              color="danger"
            />
          </div>

          {/* Date Filter */}
          <div className="row mb-4 align-items-end">
            <div className="col-md-3">
              <label>Start Date</label>
              <input
                type="date"
                className="form-control"
                value={dateRange.startDate}
                onChange={(e) =>
                  setDateRange((prev) => ({
                    ...prev,
                    startDate: e.target.value,
                  }))
                }
              />
            </div>
            <div className="col-md-3">
              <label>End Date</label>
              <input
                type="date"
                className="form-control"
                value={dateRange.endDate}
                onChange={(e) =>
                  setDateRange((prev) => ({ ...prev, endDate: e.target.value }))
                }
              />
            </div>
            <div className="col-md-2">
              <button className="btn btn-primary btn-block" onClick={fetchData}>
                Filter
              </button>
            </div>
          </div>

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
