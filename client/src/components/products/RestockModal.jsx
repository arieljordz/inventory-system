import React from "react";

const RestockModal = ({ restockForm, onChange, onSubmit }) => {
  return (
    <div
      className="modal fade"
      id="restockModal"
      tabIndex="-1"
      role="dialog"
      aria-hidden="true"
    >
      <div className="modal-dialog" role="document">
        <form onSubmit={onSubmit}>
          <div className="modal-content">
            <div className="modal-header bg-primary">
              <h5 className="modal-title text-white">Restock Product</h5>
              <button
                type="button"
                className="close text-white"
                data-dismiss="modal"
              >
                <span>&times;</span>
              </button>
            </div>

            <div className="modal-body">
              <p>
                <strong>{restockForm?.name}</strong>
              </p>
              <div className="form-group">
                <label>Quantity</label>
                <input
                  type="number"
                  name="quantity"
                  value={restockForm.quantity}
                  onChange={onChange}
                  className="form-control"
                  required
                />
              </div>
              <div className="form-group">
                <label>Remarks</label>
                <input
                  type="text"
                  name="remarks"
                  value={restockForm.remarks}
                  onChange={onChange}
                  className="form-control"
                />
              </div>
            </div>

            <div className="modal-footer">
              <button type="submit" className="btn btn-info">
                <i className="fas fa-save mr-1"></i> Restock
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                data-dismiss="modal"
              >
                Cancel
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RestockModal;
