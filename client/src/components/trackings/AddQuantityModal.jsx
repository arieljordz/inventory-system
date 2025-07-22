import React, { useEffect, useRef, useState } from "react";

const AddQuantityModal = ({
  show,
  selectedProduct,
  pickupQuantity,
  setPickupQuantity,
  getQuantity,
  handleConfirmPickup,
  onClose,
}) => {
  const inputRef = useRef(null);
  const [showOverflowWarning, setShowOverflowWarning] = useState(false);

  const availableQty = selectedProduct ? getQuantity(selectedProduct) : 0;
  const inputQty = Number(pickupQuantity);

  // Autofocus when modal shows
  useEffect(() => {
    if (show && inputRef.current) {
      inputRef.current.focus();
    }
  }, [show]);

  // Show overflow warning
  useEffect(() => {
    setShowOverflowWarning(inputQty > availableQty && inputQty !== 0);
  }, [inputQty, availableQty]);

  const handleSubmit = (e) => {
    e.preventDefault();
    handleConfirmPickup();
  };

  if (!show || !selectedProduct) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="modal-backdrop fade show" />

      {/* Modal */}
      <div className="modal fade show d-block" tabIndex="-1" role="dialog" aria-modal="true">
        <div className="modal-dialog modal-lg" role="document">
          <form onSubmit={handleSubmit}>
            <div className="modal-content">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title">Enter Quantity for Pick Up</h5>
                <button type="button" className="close text-white" onClick={onClose}>
                  <span>&times;</span>
                </button>
              </div>

              <div className="modal-body">
                <p>
                  <strong>{selectedProduct?.product?.name || "N/A"}</strong>
                  <br />
                  Available Quantity: {availableQty}
                </p>

                <input
                  type="number"
                  ref={inputRef}
                  className="form-control"
                  value={pickupQuantity}
                  onChange={(e) => setPickupQuantity(e.target.value)}
                  placeholder="Enter quantity"
                  min={1}
                  max={availableQty}
                  required
                />

                {showOverflowWarning && (
                  <small className="text-danger">
                    Quantity exceeds available stock.
                  </small>
                )}
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={onClose}>
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={!pickupQuantity || inputQty <= 0 || inputQty > availableQty}
                >
                  Confirm
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default AddQuantityModal;
