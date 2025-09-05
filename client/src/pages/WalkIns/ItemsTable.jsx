import React from "react";

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
  return (
    <div className="card h-100">
      <div className="card-header">
        <h3 className="card-title">Available Items</h3>
      </div>

      <div className="card-body">
        {/* Search with icon */}
        <div className="input-group mb-2">
          <input
            type="text"
            className="form-control form-control-sm"
            placeholder="Search items..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
          <span className="input-group-text">
            <i className="fas fa-search"></i>
          </span>
        </div>
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
                    <td>₱{item.price}</td>
                    <td>{item.quantity}</td>
                    <td>
                      <button
                        className="btn btn-sm btn-primary"
                        onClick={() => addToCart(item)}
                      >
                        <i class="fas fa-plus mr-1"></i>
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
        </div>
      </div>

      {/* Pagination */}
      <div className="card-footer d-flex justify-content-end align-items-center gap-2">
        <button
          className="btn btn-sm btn-secondary"
          disabled={page <= 1}
          onClick={() => setPage((p) => p - 1)}
        >
          Prev
        </button>

        <span className="text-center">
          Page {page} of {totalPages}
        </span>

        <button
          className="btn btn-sm btn-secondary"
          disabled={page >= totalPages}
          onClick={() => setPage((p) => p + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default ItemsTable;
