import React, { useMemo } from "react";

const PaginationControls = ({
  currentPage = 1,
  totalItems = 0,
  itemsPerPage = 10,
  onPageChange,
  disabled = false,
  maxVisiblePages = 5,
}) => {
  const paginationData = useMemo(() => {
    const totalPages = Math.max(Math.ceil(totalItems / itemsPerPage), 1);
    const startItem =
      totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, totalItems);

    return {
      totalPages,
      startItem,
      endItem,
      hasItems: totalItems > 0,
      hasPagination: totalPages > 1,
    };
  }, [currentPage, totalItems, itemsPerPage]);

  const pageNumbers = useMemo(() => {
    const { totalPages } = paginationData;

    if (totalPages <= maxVisiblePages) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const pages = [];
    const leftOffset = Math.floor(maxVisiblePages / 2);
    const rightOffset = maxVisiblePages - leftOffset - 1;

    let start = Math.max(1, currentPage - leftOffset);
    let end = Math.min(totalPages, currentPage + rightOffset);

    if (end - start + 1 < maxVisiblePages) {
      if (start === 1) {
        end = Math.min(totalPages, start + maxVisiblePages - 1);
      } else if (end === totalPages) {
        start = Math.max(1, end - maxVisiblePages + 1);
      }
    }

    if (start > 1) {
      pages.push(1);
      if (start > 2) pages.push("...");
    }

    for (let i = start; i <= end; i++) pages.push(i);

    if (end < totalPages) {
      if (end < totalPages - 1) pages.push("...");
      pages.push(totalPages);
    }

    return pages;
  }, [currentPage, paginationData.totalPages, maxVisiblePages]);

  const handlePageChange = (page) => {
    if (
      disabled ||
      page === currentPage ||
      page < 1 ||
      page > paginationData.totalPages
    ) {
      return;
    }
    onPageChange?.(page);
  };

  if (!paginationData.hasItems) return null;

  return (
    <div className="card mt-3">
      <div className="card-body py-3">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-2">
          {/* Items Info */}
          <div className="text-muted small">
            Showing{" "}
            <strong>
              {paginationData.startItem}–{paginationData.endItem}
            </strong>{" "}
            of <strong>{totalItems.toLocaleString()}</strong> entries
          </div>

          {/* Pagination */}
          {paginationData.hasPagination && (
            <div
              className="d-flex overflow-auto"
              style={{ maxWidth: "100%" }}
            >
              <nav aria-label="Page navigation" className="mx-auto">
                <ul className="pagination pagination-sm mb-0 flex-nowrap">
                  {/* First */}
                  <li
                    className={`page-item ${
                      currentPage === 1 || disabled ? "disabled" : ""
                    }`}
                  >
                    <button
                      className="page-link"
                      onClick={() => handlePageChange(1)}
                      disabled={currentPage === 1 || disabled}
                    >
                      <i className="fas fa-angle-double-left"></i>
                    </button>
                  </li>

                  {/* Prev */}
                  <li
                    className={`page-item ${
                      currentPage === 1 || disabled ? "disabled" : ""
                    }`}
                  >
                    <button
                      className="page-link"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1 || disabled}
                    >
                      <i className="fas fa-angle-left"></i>
                    </button>
                  </li>

                  {/* Pages */}
                  {pageNumbers.map((page, index) =>
                    page === "..." ? (
                      <li key={`ellipsis-${index}`} className="page-item disabled">
                        <span className="page-link">...</span>
                      </li>
                    ) : (
                      <li
                        key={page}
                        className={`page-item ${
                          currentPage === page ? "active" : ""
                        } ${disabled ? "disabled" : ""}`}
                      >
                        <button
                          className="page-link"
                          onClick={() => handlePageChange(page)}
                          disabled={disabled}
                        >
                          {page}
                        </button>
                      </li>
                    )
                  )}

                  {/* Next */}
                  <li
                    className={`page-item ${
                      currentPage === paginationData.totalPages || disabled
                        ? "disabled"
                        : ""
                    }`}
                  >
                    <button
                      className="page-link"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={
                        currentPage === paginationData.totalPages || disabled
                      }
                    >
                      <i className="fas fa-angle-right"></i>
                    </button>
                  </li>

                  {/* Last */}
                  <li
                    className={`page-item ${
                      currentPage === paginationData.totalPages || disabled
                        ? "disabled"
                        : ""
                    }`}
                  >
                    <button
                      className="page-link"
                      onClick={() =>
                        handlePageChange(paginationData.totalPages)
                      }
                      disabled={
                        currentPage === paginationData.totalPages || disabled
                      }
                    >
                      <i className="fas fa-angle-double-right"></i>
                    </button>
                  </li>
                </ul>
              </nav>
            </div>
          )}

          {/* Page Info */}
          {paginationData.hasPagination && (
            <div className="text-muted small">
              Page <strong>{currentPage}</strong> of{" "}
              <strong>{paginationData.totalPages}</strong>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaginationControls;
