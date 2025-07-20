import React from "react";

const ProductTable = ({ products = [], onDelete, onEdit, onRestock }) => {
  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">Product List</h3>
      </div>
      <div className="card-body table-responsive p-0">
        <table className="table table-bordered table-hover mb-0">
          <thead>
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
              <th className="text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 ? (
              <tr>
                <td colSpan="9" className="text-center text-muted">
                  No products found.
                </td>
              </tr>
            ) : (
              products.map((product, index) => (
                <tr key={product._id}>
                  <td className="text-center">{index + 1}</td>
                  <td className="text-center">{product.serialNumber}</td>
                  <td className="text-center">{product.name}</td>
                  <td className="text-right">
                    ₱{parseFloat(product.price).toFixed(2)}
                  </td>
                  <td className="text-center">{product.description}</td>
                  <td className="text-center">{product.quantity}</td>
                  <td className="text-center">
                    {new Date(product.createdAt).toLocaleDateString()}
                  </td>
                  <td className="text-center">{product.status}</td>
                  <td className="text-center">
                    <button
                      className="btn btn-sm btn-info mr-1"
                      onClick={() => onRestock?.(product)}
                      title="Restock"
                    >
                      <i className="fas fa-plus"></i>
                    </button>
                    <button
                      className="btn btn-sm btn-warning mr-1"
                      onClick={() => onEdit?.(product)}
                      title="Edit"
                    >
                      <i className="fas fa-edit"></i>
                    </button>

                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => onDelete?.(product._id)}
                      title="Delete"
                    >
                      <i className="fas fa-trash-alt"></i>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProductTable;
