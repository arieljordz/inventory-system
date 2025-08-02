import React, { useEffect, useMemo } from "react";

const PaginationControls = ({
  data = [],
  itemsPerPage = 5,
  currentPage,
  onPageChange,
  onPaginatedDataChange,
}) => {
  const totalItems = data.length;
  const effectiveItemsPerPage =
    itemsPerPage === "All" ? totalItems || 1 : itemsPerPage;
  const totalPages = Math.ceil(totalItems / effectiveItemsPerPage) || 1;

  const indexOfFirstItem = (currentPage - 1) * effectiveItemsPerPage;
  const indexOfLastItem = Math.min(
    indexOfFirstItem + effectiveItemsPerPage,
    totalItems
  );
  const start = totalItems === 1 ? 1 : indexOfFirstItem + 1;
  const end = totalItems === 1 ? 1 : indexOfLastItem;

  const currentPageData = useMemo(() => {
    return data.slice(indexOfFirstItem, indexOfLastItem);
  }, [data, indexOfFirstItem, indexOfLastItem]);

  useEffect(() => {
    onPaginatedDataChange?.(currentPageData);
  }, [currentPageData, onPaginatedDataChange]);

  if (totalItems === 0) return null;

  const getPageNumbers = () => {
    const pageButtons = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pageButtons.push(i);
      }
    } else {
      const left = Math.max(2, currentPage - 1);
      const right = Math.min(totalPages - 1, currentPage + 1);

      pageButtons.push(1); // First page

      if (left > 2) {
        pageButtons.push("...");
      }

      for (let i = left; i <= right; i++) {
        pageButtons.push(i);
      }

      if (right < totalPages - 1) {
        pageButtons.push("...");
      }

      pageButtons.push(totalPages); // Last page
    }

    return pageButtons;
  };

  return (
    <div className="d-flex justify-content-between align-items-center mt-3 flex-wrap gap-2">
      <div className="text-muted">
        Showing {totalItems === 1 ? "1 row" : `${start}–${end} rows`} out of{" "}
        {totalItems === 1 ? "1 entry" : `${totalItems} entries`}
      </div>

      {totalPages > 1 && (
        <ul className="pagination mb-0 flex-wrap">
          <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
            <button
              className="page-link"
              onClick={() => onPageChange(currentPage - 1)}
            >
              Previous
            </button>
          </li>

          {getPageNumbers().map((page, index) =>
            page === "..." ? (
              <li key={`ellipsis-${index}`} className="page-item disabled">
                <span className="page-link">...</span>
              </li>
            ) : (
              <li
                key={page}
                className={`page-item ${currentPage === page ? "active" : ""}`}
              >
                <button
                  className="page-link"
                  onClick={() => onPageChange(page)}
                >
                  {page}
                </button>
              </li>
            )
          )}

          <li
            className={`page-item ${
              currentPage === totalPages ? "disabled" : ""
            }`}
          >
            <button
              className="page-link"
              onClick={() => onPageChange(currentPage + 1)}
            >
              Next
            </button>
          </li>
        </ul>
      )}
    </div>
  );
};

export default PaginationControls;
