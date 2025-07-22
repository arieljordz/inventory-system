import React, { useState } from "react";
import { StatusEnum, MovementTypeEnum } from "../../enums/enums";

const TrackingsTable = ({ products = [], selectedStatus, onTagForPickUp }) => {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [pickupQuantity, setPickupQuantity] = useState("");
  const [showModal, setShowModal] = useState(false);

  // Helper functions
  const getQuantity = (obj) => {
    const statusesFromObj = [
      StatusEnum.FOR_PICK_UP,
      StatusEnum.TO_SHIP,
      StatusEnum.SHIPPING,
      StatusEnum.RETURNED,
      StatusEnum.DELIVERED,
      StatusEnum.COMPLETED,
    ];
    return statusesFromObj.includes(selectedStatus)
      ? obj.quantity
      : obj.product.quantity;
  };

  const getStatus = (obj) => {
    const statusesFromObj = [
      StatusEnum.FOR_PICK_UP,
      StatusEnum.TO_SHIP,
      StatusEnum.SHIPPING,
      StatusEnum.RETURNED,
      StatusEnum.DELIVERED,
      StatusEnum.COMPLETED,
    ];
    return statusesFromObj.includes(selectedStatus)
      ? obj.status
      : obj.product.status;
  };

  const isTagged = (obj) => {
    const currentStatus = getStatus(obj);
    return (
      currentStatus === StatusEnum.FOR_PICK_UP ||
      currentStatus === StatusEnum.TO_SHIP
    );
  };

  const handleOpenModal = (product) => {
    setSelectedProduct(product);
    setPickupQuantity("");
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setSelectedProduct(null);
    setPickupQuantity("");
    setShowModal(false);
  };

  const handleConfirmPickup = () => {
    if (
      selectedProduct &&
      typeof onTagForPickUp === "function" &&
      Number(pickupQuantity) > 0 &&
      Number(pickupQuantity) <= getQuantity(selectedProduct)
    ) {
      onTagForPickUp(selectedProduct, Number(pickupQuantity));
    }
    handleCloseModal();
  };

  return (
    <>
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">
            Product List -{" "}
            <span className="text-primary">{selectedStatus}</span>
          </h3>
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
                  <td colSpan="9" className="text-center text-muted py-4">
                    No products found.
                  </td>
                </tr>
              ) : (
                products.map((obj, index) => (
                  <tr key={obj._id}>
                    <td className="text-center">{index + 1}</td>
                    <td className="text-center">
                      {obj.product.serialNumber || "-"}
                    </td>
                    <td className="text-center">{obj.product.name || "-"}</td>
                    <td className="text-right">
                      ₱{parseFloat(obj.product.price * getQuantity(obj) || 0).toFixed(2)}
                    </td>
                    <td className="text-center">{obj.product.description || "-"}</td>
                    <td className="text-center">{getQuantity(obj)}</td>
                    <td className="text-center">
                      {obj.product.createdAt
                        ? new Date(obj.product.createdAt).toLocaleDateString()
                        : "-"}
                    </td>
                    <td className="text-center">
                      <span className="badge badge-info">{getStatus(obj)}</span>
                    </td>
                    <td className="text-center">
                      <button
                        className="btn btn-sm btn-primary"
                        onClick={() => handleOpenModal(obj)}
                        title="Mark as For Pick Up"
                        disabled={isTagged(obj)}
                      >
                        <i className="fas fa-truck-loading mr-1"></i>
                        {isTagged(obj) ? "Tagged" : "Pick Up"}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div
          className="modal d-block"
          tabIndex="-1"
          role="dialog"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Enter Quantity for Pick Up</h5>
                <button
                  type="button"
                  className="close"
                  onClick={handleCloseModal}
                >
                  <span>&times;</span>
                </button>
              </div>
              <div className="modal-body">
                <p>
                  <strong>{selectedProduct?.product?.name}</strong> <br />
                  Available Quantity: {getQuantity(selectedProduct)}
                </p>
                <input
                  type="number"
                  className="form-control"
                  value={pickupQuantity}
                  onChange={(e) => setPickupQuantity(e.target.value)}
                  placeholder="Enter quantity"
                  min={1}
                  max={getQuantity(selectedProduct)}
                />
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={handleCloseModal}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-primary"
                  onClick={handleConfirmPickup}
                  disabled={
                    !pickupQuantity ||
                    Number(pickupQuantity) <= 0 ||
                    Number(pickupQuantity) > getQuantity(selectedProduct)
                  }
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TrackingsTable;
