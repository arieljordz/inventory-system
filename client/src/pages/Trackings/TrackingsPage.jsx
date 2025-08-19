import React, { useEffect, useState, useCallback } from "react";
import { toast } from "react-toastify";
import { useSpinner } from "../../context/SpinnerContext";

import { getAllOrders } from "../../services/orderService";

import TrackingsTable from "./TrackingsTable";
import Navpath from "../../components/common/Navpath";
import SearchBar from "../../components/common/SearchBar";
import PaginationControls from "../../components/common/PaginationControls";

import { useDebounce } from "../../hooks/useDebounce";

const TrackingsPage = () => {
  /** 🔹 Core state */
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  /** 🔹 Search & pagination state */
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [totalItems, setTotalItems] = useState(0);

  const debouncedSearchTerm = useDebounce(searchTerm, 1000);

  /** 🔹 Fetch Orders (server handles pagination + search) */
  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAllOrders({
        page: currentPage,
        limit: itemsPerPage,
        search: debouncedSearchTerm,
      });

      const { orders: fetchedOrders, totalOrders, totalPages } = res.data;

      setOrders(fetchedOrders || []);
      setTotalItems(totalOrders || 0);

      // Fix current page if overflow
      if (currentPage > totalPages && totalPages > 0) {
        setCurrentPage(totalPages);
      }
    } catch (error) {
      console.error("Failed to fetch orders:", error);
      toast.error("Failed to fetch orders");
      setOrders([]);
      setTotalItems(0);
    } finally {
      setLoading(false);
    }
  }, [currentPage, itemsPerPage, debouncedSearchTerm]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

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
        levelOne="Tracking Management"
        levelTwo="Home"
        levelThree="Trackings"
      />

      <section className="content">
        <div className="container-fluid">
          {/* Search & Items Per Page */}
          <SearchBar
            searchTerm={searchTerm}
            onSearchChange={handleSearchChange}
            itemsPerPage={itemsPerPage}
            onItemsPerPageChange={handleItemsPerPageChange}
            disabled={loading}
          />

          {/* Tracking Table */}
          <TrackingsTable orders={orders} loading={loading} />

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

export default TrackingsPage;
