import React from "react";
import { formatAmount } from "../../utils/commonUtils";

const CartTable = ({
  cart,
  buyerName,
  setBuyerName,
  updateQuantity,
  removeFromCart,
  referenceAmount,
  onConfirm,
}) => {
  return (
    <div className="card h-100">
      <div className="card-header">
        <h3 className="card-title">Freebies Cart (FREE)</h3>
      </div>

      <div className="card-body">
        {cart.length === 0 ? (
          <p className="text-muted">No items in cart</p>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Reference Price</th>
                  <th>Qty</th>
                  <th>Reference Total</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {cart.map((c) => (
                  <tr key={c.itemId}>
                    <td>
                      {c.name} {c.variant && `(${c.variant})`}
                    </td>
                    <td>{formatAmount(c.retailPrice)}</td>
                    <td>
                      <input
                        type="number"
                        min="1"
                        value={c.quantity}
                        onChange={(e) =>
                          updateQuantity(c.itemId, e.target.value)
                        }
                        className="form-control form-control-sm text-center"
                        style={{ width: "90px" }}
                      />
                    </td>
                    <td>{formatAmount(c.retailPrice * c.quantity)}</td>
                    <td>
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => removeFromCart(c.itemId)}
                      >
                        <i className="fas fa-trash-alt mr-1"></i>
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Customer Name */}
        <div className="form-group mt-3">
          <label>Customer Name</label>
          <input
            type="text"
            value={buyerName}
            onChange={(e) => setBuyerName(e.target.value)}
            className="form-control"
            placeholder="Optional"
          />
        </div>

        {/* Reference Total */}
        <div className="mt-3 mb-2">
          <h5>Reference Value: {formatAmount(referenceAmount)}</h5>
          <small className="text-muted">
            This transaction will be recorded as <b>FREE</b>
          </small>
        </div>

        <button
          className="btn btn-success w-100"
          onClick={onConfirm}
          disabled={!cart.length}
        >
          Confirm Freebie Transaction
        </button>
      </div>
    </div>
  );
};

export default CartTable;
