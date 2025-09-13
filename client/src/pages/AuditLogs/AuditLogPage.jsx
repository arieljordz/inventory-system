import React, { useEffect, useState, useCallback } from "react";
import { toast } from "react-toastify";

import { getAllAuditLogs } from "../../services/auditlogsService";

import AuditLogsTable from "./AuditLogsTable";
import Navpath from "../../components/Navpath";
import SearchBar from "../../components/SearchBar";
import PaginationControls from "../../components/PaginationControls";

import { useDebounce } from "../../hooks/useDebounce";

const AuditLogPage = () => {
  /** 🔹 Core state */
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  /** 🔹 Search & pagination state */
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);

  const debouncedSearchTerm = useDebounce(searchTerm, 1000);

  /** 🔹 Fetch Audit Logs (server handles pagination + search) */
  const fetchAuditLogs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAllAuditLogs({
        page: currentPage,
        limit: itemsPerPage,
        search: debouncedSearchTerm,
      });

      const { logs: fetchedLogs, totalLogs, totalPages } = res.data;

      setAuditLogs(fetchedLogs || []);
      setTotalItems(totalLogs || 0);

      // Fix current page if overflow
      if (currentPage > totalPages && totalPages > 0) {
        setCurrentPage(totalPages);
      }
    } catch (error) {
      console.error("Failed to fetch audit logs:", error);
      setAuditLogs([]);
      setTotalItems(0);
    } finally {
      setLoading(false);
    }
  }, [currentPage, itemsPerPage, debouncedSearchTerm]);

  useEffect(() => {
    fetchAuditLogs();
  }, [fetchAuditLogs]);

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
        levelOne="Audit Management"
        levelTwo="Home"
        levelThree="Audit Logs"
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

          {/* Audit Logs Table */}
          <AuditLogsTable auditLogs={auditLogs} loading={loading} />

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

export default AuditLogPage;
