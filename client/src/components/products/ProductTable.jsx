import React from "react";

const ProductTable = ({
  products = [],
  onDelete,
  onEdit,
  onRestock,
  statusColorMap,
}) => {
  const formatPrice = (price) =>
    new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
    }).format(price || 0);

  const formatDate = (date) =>
    date ? new Date(date).toLocaleDateString() : "N/A";

  const renderStatusBadge = (status) => {
    const color = statusColorMap?.[status] || "secondary";
    return (
      <span className={`badge badge-pill badge-${color}`}>
        {status || "Unknown"}
      </span>
    );
  };

  const renderRows = () => {
    if (products.length === 0) {
      return (
        <tr>
          <td colSpan="9" className="text-center text-muted py-3">
            No products found.
          </td>
        </tr>
      );
    }

    return products.map((product, index) => (
      <tr key={product._id}>
        <td className="text-center align-middle">{index + 1}</td>
        <td className="text-center align-middle">
          {product.serialNumber || "N/A"}
        </td>
        <td className="text-center align-middle">{product.name || "N/A"}</td>
        <td className="text-right align-middle">
          {formatPrice(product.price)}
        </td>
        <td className="text-center align-middle">
          {product.description || "-"}
        </td>
        <td className="text-center align-middle">{product.quantity ?? 0}</td>
        <td className="text-center align-middle">
          {formatDate(product.createdAt)}
        </td>
        <td className="text-center align-middle">
          {renderStatusBadge(product.status)}
        </td>
        <td className="text-center align-middle">
          <button
            className="btn btn-sm btn-info mr-1"
            onClick={() => onRestock?.(product)}
            title="Restock"
          >
            <i className="fas fa-plus" />
          </button>
          <button
            className="btn btn-sm btn-warning mr-1"
            onClick={() => onEdit?.(product)}
            title="Edit"
          >
            <i className="fas fa-edit" />
          </button>
          <button
            className="btn btn-sm btn-danger"
            onClick={() => onDelete?.(product._id)}
            title="Delete"
          >
            <i className="fas fa-trash-alt" />
          </button>
        </td>
      </tr>
    ));
  };

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title mb-0">Product List</h3>
      </div>

      <div className="card-body table-responsive p-0">
        <table className="table table-bordered table-hover mb-0">
          <thead className="thead-light">
            <tr>
              <th className="text-center" style={{ width: "50px" }}>
                #
              </th>
              <th className="text-center">Serial Number</th>
              <th className="text-center">Name</th>
              <th className="text-right">Price</th>
              <th className="text-center">Description</th>
              <th className="text-center">Quantity</th>
              <th className="text-center">Date Added</th>
              <th className="text-center">Status</th>
              <th className="text-center" style={{ width: "150px" }}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody>{renderRows()}</tbody>
        </table>
      </div>
    </div>
  );
};

export default ProductTable;
