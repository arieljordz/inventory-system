import React from "react";

const PaginationControls = ({
  currentPage = 1,
  totalPages = 1,
  totalItems = 0,
  indexOfFirstItem = 0,
  indexOfLastItem = 0,
  onPageChange,
}) => {
  if (totalItems === 0) return null;

  const start = totalItems === 1 ? 1 : indexOfFirstItem + 1;
  const end = Math.min(indexOfLastItem, totalItems);

  return (
    <div className="d-flex justify-content-between align-items-center mt-3 flex-column flex-sm-row gap-2">
      <div className="text-muted">
        Showing {totalItems === 1 ? "1 row" : `${start}–${end} rows`} out of{" "}
        {totalItems === 1 ? "1 entry" : `${totalItems} entries`}
      </div>

      {totalPages > 1 && (
        <ul className="pagination mb-0">
          <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
            <button className="page-link" onClick={() => onPageChange(currentPage - 1)}>
              Previous
            </button>
          </li>
          {Array.from({ length: totalPages }, (_, i) => (
            <li key={i + 1} className={`page-item ${currentPage === i + 1 ? "active" : ""}`}>
              <button className="page-link" onClick={() => onPageChange(i + 1)}>
                {i + 1}
              </button>
            </li>
          ))}
          <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
            <button className="page-link" onClick={() => onPageChange(currentPage + 1)}>
              Next
            </button>
          </li>
        </ul>
      )}
    </div>
  );
};

export default PaginationControls;
