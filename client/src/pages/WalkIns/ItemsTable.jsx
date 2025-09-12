import React, { useRef } from "react";
import { formatAmount } from "../../utils/commonUtils";
import { Pagination } from "react-bootstrap";

const ItemsTable = ({
  items,
  loading,
  search,
  setSearch,
  page,
  totalPages,
  setPage,
  addToCart,
}) => {
  const inputRef = useRef(null);

  const handleClearSearch = () => {
    setSearch("");
    setPage(1);
    inputRef.current.focus();
  };

  return (
    <div className="card h-100">
      <div className="card-header">
        <h3 className="card-title">Available Items</h3>
      </div>

      <div className="card-body">
        {/* Search input */}
        <div className="input-group mb-2">
          <div className="input-group-prepend">
            <span className="input-group-text">
              <i className="fas fa-search"></i>
            </span>
          </div>
          <input
            ref={inputRef}
            type="text"
            className="form-control"
            placeholder="Search items..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
          {search && (
            <div className="input-group-append">
              <button
                className="btn btn-outline-secondary"
                type="button"
                onClick={handleClearSearch}
                title="Clear search"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
          )}
        </div>

        {/* Table */}
        <div className="table-responsive">
          <table className="table table-hover">
            <thead>
              <tr>
                <th>Name</th>
                <th>Price</th>
                <th>Stock</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="4" className="text-center py-4">
                    <div className="d-flex justify-content-center align-items-center">
                      <div
                        className="spinner-border text-primary mr-2"
                        role="status"
                      >
                        <span className="sr-only">Loading...</span>
                      </div>
                      <span className="text-muted">Loading items...</span>
                    </div>
                  </td>
                </tr>
              ) : items.length > 0 ? (
                items.map((item) => (
                  <tr key={item._id}>
                    <td>
                      {item.name} {item.variant && `(${item.variant})`}
                    </td>
                    <td>{formatAmount(item.retailPrice)}</td>
                    <td>{item.quantity}</td>
                    <td>
                      <button
                        className="btn btn-sm btn-primary"
                        onClick={() => addToCart(item)}
                      >
                        <i className="fas fa-plus mr-1"></i>
                        Add
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="text-center">
                    No items found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          {/* Pagination */}
          <div className="d-flex justify-content-end mt-2">
            <Pagination>
              <Pagination.First
                onClick={() => setPage(1)}
                disabled={page === 1}
              />
              <Pagination.Prev
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                disabled={page === 1}
              />
              {[...Array(totalPages)].map((_, i) => (
                <Pagination.Item
                  key={i + 1}
                  active={i + 1 === page}
                  onClick={() => setPage(i + 1)}
                >
                  {i + 1}
                </Pagination.Item>
              ))}
              <Pagination.Next
                onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                disabled={page === totalPages}
              />
              <Pagination.Last
                onClick={() => setPage(totalPages)}
                disabled={page === totalPages}
              />
            </Pagination>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItemsTable;
