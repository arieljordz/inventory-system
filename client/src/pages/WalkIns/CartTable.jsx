import React from "react";

const CartTable = ({
  cart,
  buyerName,
  setBuyerName,
  paymentMethod,
  setPaymentMethod,
  updateQuantity,
  removeFromCart,
  totalAmount,
  handleSubmit,
}) => {
  return (
    <div className="card h-100">
      <div className="card-header">
        <h3 className="card-title">Walk-in Cart</h3>
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
                  <th>Price</th>
                  <th>Qty</th>
                  <th>Total</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {cart.map((c) => (
                  <tr key={c.itemId}>
                    <td>
                      {c.name} {c.variant && `(${c.variant})`}
                    </td>
                    <td>₱{c.price}</td>
                    <td>
                      <input
                        type="number"
                        min="1"
                        value={c.quantity}
                        onChange={(e) =>
                          updateQuantity(c.itemId, e.target.value)
                        }
                        className="form-control form-control-sm text-center"
                        style={{ width: "120px" }}
                      />
                    </td>
                    <td>₱{c.price * c.quantity}</td>
                    <td>
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => removeFromCart(c.itemId)}
                      >
                        <i class="fas fa-trash-alt mr-1"></i>
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Checkout */}
        <div className="form-group mt-1">
          <label>Buyer Name</label>
          <input
            type="text"
            value={buyerName}
            onChange={(e) => setBuyerName(e.target.value)}
            className="form-control"
            placeholder="Optional"
          />
        </div>

        <div className="form-group">
          <label>Payment Method</label>
          <select
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            className="form-control"
          >
            <option value="Cash">Cash</option>
            <option value="GCash">GCash</option>
            <option value="Bank Transfer">Bank Transfer</option>
          </select>
        </div>

        <h5 className="mt-3">Total: ₱{totalAmount}</h5>
        <button className="btn btn-success mt-2 w-100" onClick={handleSubmit}>
          Complete Transaction
        </button>
      </div>
    </div>
  );
};

export default CartTable;
