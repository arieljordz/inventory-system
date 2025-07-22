import React, { useState } from "react";
import Navpath from "../../components/common/Navpath";
import InventoryTable from "../../components/inventory/InventoryTable";
import {
  getInventoryStats,
  getInventoryMovements,
  getRemainingPerProduct,
} from "../../services/inventoryDetailService";
import { StatusEnum, MovementTypeEnum } from "../../enums/enums";
import SearchBar from "../../components/common/SearchBar";
import PaginationControls from "../../components/common/PaginationControls";
import usePagination from "../../hooks/usePagination";

const InventoryPage = () => {
  const today = new Date().toISOString().split("T")[0];

  const [dateRange, setDateRange] = useState({ startDate: today, endDate: today });
  const [stats, setStats] = useState({ remaining: 0, totalIn: 0, totalOut: 0 });
  const [movements, setMovements] = useState([]);
  const [remainingPerProduct, setRemainingPerProduct] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const fetchData = async () => {
    try {
      const { startDate, endDate } = dateRange;
      const [statsRes, movementsRes, remainingRes] = await Promise.all([
        getInventoryStats(startDate, endDate),
        getInventoryMovements(startDate, endDate),
        getRemainingPerProduct(),
      ]);

      const totals = computeTotalsByRange(movementsRes.data, startDate, endDate);

      setStats({ remaining: statsRes.data.remaining, ...totals });
      setMovements(movementsRes.data);
      setRemainingPerProduct(remainingRes.data);
    } catch (err) {
      console.error("Failed to fetch inventory data", err);
    }
  };

  const computeTotalsByRange = (movements, startDate, endDate) => {
    const filtered = movements.filter((m) => {
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

  const filteredMovements = movements.filter((m) => {
    const values = [
      m.product?.name,
      m.product?.serialNumber,
      m.movementType,
      m.quantity,
    ];
    return values.some((val) =>
      String(val).toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const pagination = usePagination({
    totalItems: filteredMovements.length,
    itemsPerPage: itemsPerPage === "All" ? filteredMovements.length : parseInt(itemsPerPage),
    currentPage,
  });

  const currentData = filteredMovements.slice(
    pagination.indexOfFirstItem,
    pagination.indexOfLastItem
  );

  const totalRemainingQty = remainingPerProduct.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  return (
    <>
      <Navpath levelOne="Inventory" levelTwo="Home" levelThree="Inventory" />
      <section className="content">
        <div className="container-fluid">
          {/* Info Boxes */}
          <div className="row">
            <InfoBox icon="fas fa-layer-group" label="Unique Products" value={remainingPerProduct.length} color="primary" />
            <InfoBox icon="fas fa-boxes" label="Remaining Qty (Total)" value={totalRemainingQty} color="info" />
            <InfoBox icon="fas fa-arrow-circle-down" label="Total In" value={stats.totalIn} color="success" />
            <InfoBox icon="fas fa-arrow-circle-up" label="Total Out" value={stats.totalOut} color="danger" />
          </div>

          {/* Date Filter */}
          <div className="row mb-4 align-items-end">
            <div className="col-md-3">
              <label>Start Date</label>
              <input
                type="date"
                className="form-control"
                value={dateRange.startDate}
                onChange={(e) => setDateRange((prev) => ({ ...prev, startDate: e.target.value }))}
              />
            </div>
            <div className="col-md-3">
              <label>End Date</label>
              <input
                type="date"
                className="form-control"
                value={dateRange.endDate}
                onChange={(e) => setDateRange((prev) => ({ ...prev, endDate: e.target.value }))}
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
            onItemsPerPageChange={(value) => {
              setItemsPerPage(value);
              setCurrentPage(1);
            }}
          />

          {/* Inventory Table */}
          <InventoryTable
            data={currentData}
            remainingPerProduct={remainingPerProduct}
          />

          {/* Pagination */}
          <PaginationControls
            currentPage={currentPage}
            totalPages={pagination.totalPages}
            totalItems={filteredMovements.length}
            indexOfFirstItem={pagination.indexOfFirstItem}
            indexOfLastItem={pagination.indexOfLastItem}
            onPageChange={setCurrentPage}
          />
        </div>
      </section>
    </>
  );
};

const InfoBox = ({ icon, label, value, color }) => (
  <div className="col-md-3 col-sm-6 col-12">
    <div className={`info-box bg-${color}`}>
      <span className="info-box-icon">
        <i className={`fas ${icon}`}></i>
      </span>
      <div className="info-box-content">
        <span className="info-box-text">{label}</span>
        <span className="info-box-number">{value}</span>
      </div>
    </div>
  </div>
);

export default InventoryPage;
