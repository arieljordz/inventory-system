import React, { useState, useMemo } from "react";
import { Pagination } from "react-bootstrap";

const AdjustmentsHistoryList = ({ history = [], pageSize = 5 }) => {
  const [currentPage, setCurrentPage] = useState(1);

  // Total pages
  const totalPages = Math.ceil(history.length / pageSize);

  // Slice history for current page
  const paginatedHistory = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return history.slice(start, start + pageSize);
  }, [history, currentPage, pageSize]);

  if (!history || history.length === 0) {
    return (
      <div>
        <h6>Adjustment History</h6>
        <ul className="list-group">
          <li className="list-group-item">No adjustments yet</li>
        </ul>
      </div>
    );
  }

  return (
    <div>
      <h6>Adjustment History</h6>
      <ul className="list-group">
        {paginatedHistory.map((adj) => {
          const isDiscount = adj.adjustmentType === "discount";
          const badgeClass = isDiscount ? "text-danger" : "text-success";
          const valueDisplay =
            adj.valueType === "percentage" ? `${adj.value}%` : `₱${adj.value}`;

          return (
            <li key={adj._id} className="list-group-item">
              <strong className={badgeClass}>
                {adj.adjustmentType.charAt(0).toUpperCase() +
                  adj.adjustmentType.slice(1)}
              </strong>{" "}
              {valueDisplay} →{" "}
              <span className={badgeClass}>
                ₱{Number(adj.newPrice).toFixed(2)}
              </span>
              {adj.notes && (
                <>
                  <br />
                  <small className="text-muted">{adj.notes}</small>
                </>
              )}
            </li>
          );
        })}
      </ul>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="d-flex justify-content-end mt-2">
          <Pagination>
            <Pagination.First
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
            />
            <Pagination.Prev
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
            />
            {[...Array(totalPages)].map((_, i) => (
              <Pagination.Item
                key={i + 1}
                active={i + 1 === currentPage}
                onClick={() => setCurrentPage(i + 1)}
              >
                {i + 1}
              </Pagination.Item>
            ))}
            <Pagination.Next
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
            />
            <Pagination.Last
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
            />
          </Pagination>
        </div>
      )}
    </div>
  );
};

export default AdjustmentsHistoryList;
