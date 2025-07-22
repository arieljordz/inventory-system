import React, { useState } from "react";
import { StatusEnum } from "../../enums/enums";
import AddQuantityModal from "./AddQuantityModal";

const TrackingsTable = ({
  products = [],
  selectedStatus,
  onTagForPickUp,
  statusColorMap,
}) => {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [pickupQuantity, setPickupQuantity] = useState("");
  const [showModal, setShowModal] = useState(false);

  const isProductBased = [StatusEnum.AVAILABLE, StatusEnum.OUT_OF_STOCK].includes(
    selectedStatus
  );

  /** Get base product object */
  const getProduct = (item) => {
    return isProductBased ? item.product || {} : item.product || item;
  };

  /** Get quantity depending on status */
  const getQuantity = (item) => {
    const product = getProduct(item);
    return isProductBased ? product.quantity || 0 : item.quantity || 0;
  };

  /** Get status from product */
  const getStatus = (item) => {
    if (isProductBased) {
      const product = getProduct(item);
      return product.status || "-";
    } else {
      return item.status || "-";
    }
  };

  const isTagged = (item) => {
    const status = getStatus(item);
    return [StatusEnum.FOR_PICK_UP, StatusEnum.TO_SHIP].includes(status);
  };

  const handleOpenModal = (item) => {
    setSelectedProduct(item);
    setPickupQuantity("");
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setSelectedProduct(null);
    setPickupQuantity("");
    setShowModal(false);
  };

  const handleConfirmPickup = () => {
    const qty = Number(pickupQuantity);
    const maxQty = getQuantity(selectedProduct);

    if (qty > 0 && qty <= maxQty && typeof onTagForPickUp === "function") {
      onTagForPickUp(selectedProduct, qty);
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
                products.map((item, index) => {
                  const product = getProduct(item);
                  const quantity = getQuantity(item);
                  const status = getStatus(item);
                  const badgeColor = statusColorMap?.[status] || "secondary";
                  const createdAt = product.createdAt
                    ? new Date(product.createdAt).toLocaleDateString()
                    : "-";

                  const priceDisplay = isProductBased
                    ? parseFloat(product.price || 0).toFixed(2)
                    : parseFloat((product.price || 0) * quantity).toFixed(2);

                  return (
                    <tr key={item._id}>
                      <td className="text-center">{index + 1}</td>
                      <td className="text-center">
                        {product.serialNumber || "-"}
                      </td>
                      <td className="text-center">{product.name || "-"}</td>
                      <td className="text-right">₱{priceDisplay}</td>
                      <td className="text-center">
                        {product.description || "-"}
                      </td>
                      <td className="text-center">{quantity}</td>
                      <td className="text-center">{createdAt}</td>
                      <td className="text-center">
                        <span className={`badge badge-${badgeColor}`}>
                          {status}
                        </span>
                      </td>
                      <td className="text-center">
                        <button
                          className="btn btn-sm btn-primary"
                          onClick={() => handleOpenModal(item)}
                          title={
                            isTagged(item)
                              ? "Already tagged"
                              : quantity <= 0
                              ? "Out of stock"
                              : "Tag for Pick Up"
                          }
                          disabled={isTagged(item) || quantity <= 0}
                        >
                          <i className="fas fa-truck-loading mr-1"></i>
                          {isTagged(item) ? "Tagged" : "Pick Up"}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AddQuantityModal
        show={showModal}
        selectedProduct={selectedProduct}
        pickupQuantity={pickupQuantity}
        setPickupQuantity={setPickupQuantity}
        getQuantity={getQuantity}
        handleConfirmPickup={handleConfirmPickup}
        onClose={handleCloseModal}
      />
    </>
  );
};

export default TrackingsTable;
