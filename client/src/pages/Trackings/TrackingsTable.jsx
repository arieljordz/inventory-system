import React, { useState } from "react";
import { StatusEnum } from "../../enums/enums";
import { formatAmount, formatDate } from "../../utils/commonUtils";
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

  const isProductBased = [
    StatusEnum.AVAILABLE,
    StatusEnum.OUT_OF_STOCK,
  ].includes(selectedStatus);

  // Helpers
  const getProduct = (item) =>
    isProductBased ? item.product || {} : item.product || item;
  const getQuantity = (item) =>
    isProductBased ? getProduct(item).quantity || 0 : item.quantity || 0;
  const getStatus = (item) =>
    isProductBased ? getProduct(item).status || "-" : item.status || "-";
  const isTagged = (item) =>
    [StatusEnum.FOR_PICK_UP, StatusEnum.TO_SHIP].includes(getStatus(item));

  // Modal handlers
  const openModal = (item) => {
    setSelectedProduct(item);
    setPickupQuantity("");
    setShowModal(true);
  };

  const closeModal = () => {
    setSelectedProduct(null);
    setPickupQuantity("");
    setShowModal(false);
  };

  const confirmPickup = () => {
    const qty = Number(pickupQuantity);
    const maxQty = getQuantity(selectedProduct);
    if (qty > 0 && qty <= maxQty && typeof onTagForPickUp === "function") {
      onTagForPickUp(selectedProduct, qty);
    }
    closeModal();
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
                <th className="text-center p-1">#</th>
                <th className="text-center">SKU</th>
                <th className="text-center">Name</th>
                <th className="text-center">Description</th>
                <th className="text-right">Price</th>
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
                  const isAlreadyTagged = isTagged(item);

                  const price = isProductBased
                    ? parseFloat(product.price || 0)
                    : parseFloat((product.price || 0) * quantity);
                  const priceDisplay = formatAmount(price.toFixed(2));

                  return (
                    <tr key={index}>
                      <td className="text-center align-middle p-2">
                        {index + 1}
                      </td>
                      <td className="text-center">{product.sku || "-"}</td>
                      <td className="text-center">{product.name || "-"}</td>
                      <td className="text-center">
                        {product.description || "-"}
                      </td>
                      <td className="text-right">{priceDisplay}</td>
                      <td className="text-center">{quantity}</td>
                      <td className="text-center">
                        {formatDate(product.createdAt)}
                      </td>
                      <td className="text-center">
                        <span className={`badge badge-${badgeColor}`}>
                          {status}
                        </span>
                      </td>
                      <td className="text-center">
                        <button
                          className="btn btn-sm btn-primary"
                          onClick={() => openModal(item)}
                          disabled={isAlreadyTagged || quantity <= 0}
                          title={
                            isAlreadyTagged
                              ? "Already tagged"
                              : quantity <= 0
                              ? "Out of stock"
                              : "Tag for Pick Up"
                          }
                        >
                          <i className="fas fa-truck-loading mr-1"></i>
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
        handleConfirmPickup={confirmPickup}
        onClose={closeModal}
      />
    </>
  );
};

export default TrackingsTable;
