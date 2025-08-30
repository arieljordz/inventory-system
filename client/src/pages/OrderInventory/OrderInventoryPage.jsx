import React from "react";
import Navpath from "../../components/Navpath";
import SearchBar from "../../components/SearchBar";
import PaginationControls from "../../components/PaginationControls";
import DateRangeFilter from "../../components/DateRangeFilter";
import OrderInventoryTable from "./OrderInventoryTable";
import { InventoryStats } from "./InventoryStats";

import { useOrderInventory } from "../../hooks/useOrderInventory";

const OrderInventoryPage = () => {
  const inventory = useOrderInventory(5);

  return (
    <>
      <Navpath
        levelOne="Order Inventory Management"
        levelTwo="Home"
        levelThree="Inventory"
      />

      <section className="content">
        <div className="container-fluid">
          {/* Info Boxes */}
          <InventoryStats stats={inventory.stats} />

          {/* Filters */}
          <DateRangeFilter
            dateRange={inventory.dateRange}
            onDateChange={inventory.setDateRange}
            onFilter={inventory.fetchInventory}
          />

          <SearchBar
            searchTerm={inventory.searchTerm}
            onSearchChange={inventory.setSearchTerm}
            itemsPerPage={inventory.itemsPerPage}
            onItemsPerPageChange={(val) => {
              inventory.setItemsPerPage(val);
              inventory.setCurrentPage(1);
            }}
            disabled={inventory.loading}
          />

          {/* Inventory Table */}
          <OrderInventoryTable
            data={inventory.movements}
            remainingPerProduct={inventory.remainingPerProduct}
            loading={inventory.loading}
          />

          {/* Pagination */}
          <PaginationControls
            currentPage={inventory.currentPage}
            totalItems={inventory.totalItems}
            itemsPerPage={inventory.itemsPerPage}
            onPageChange={inventory.setCurrentPage}
            disabled={inventory.loading}
          />
        </div>
      </section>
    </>
  );
};

export default OrderInventoryPage;
