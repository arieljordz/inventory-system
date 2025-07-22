import React, { useEffect, useRef } from "react";

const RestockModal = ({ show, onClose, restockForm, onChange, onSubmit }) => {
  const quantityRef = useRef(null);

  useEffect(() => {
    if (show && quantityRef.current) {
      quantityRef.current.focus();
    }
  }, [show]);

  if (!show || !restockForm) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="modal-backdrop fade show" />

      {/* Modal */}
      <div
        className="modal fade show d-block"
        tabIndex="-1"
        role="dialog"
        aria-modal="true"
      >
        <div className="modal-dialog modal-lg" role="document">
          <form onSubmit={onSubmit}>
            <div className="modal-content">
              {/* Modal Header */}
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title">Restock Product</h5>
                <button
                  type="button"
                  className="close text-white"
                  onClick={onClose}
                  aria-label="Close"
                >
                  <span aria-hidden="true">&times;</span>
                </button>
              </div>

              {/* Modal Body */}
              <div className="modal-body">
                <p className="mb-3 font-weight-bold">{restockForm.name}</p>

                <div className="form-group">
                  <label htmlFor="restock-quantity">Quantity</label>
                  <input
                    id="restock-quantity"
                    type="number"
                    name="quantity"
                    ref={quantityRef}
                    value={restockForm.quantity}
                    onChange={onChange}
                    className="form-control"
                    min={1}
                    required
                    placeholder="Enter quantity to add"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="restock-remarks">Remarks</label>
                  <input
                    id="restock-remarks"
                    type="text"
                    name="remarks"
                    value={restockForm.remarks}
                    onChange={onChange}
                    className="form-control"
                    placeholder="Optional remarks (e.g., Restocking)"
                  />
                </div>
              </div>

              {/* Modal Footer */}
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={onClose}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-info">
                  <i className="fas fa-save mr-1" />
                  Restock
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default RestockModal;
