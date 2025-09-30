import React, { useState, useMemo } from "react";
import { toast } from "react-toastify";
import { StatusEnum } from "../../enums/enums";
import { TextInput, SelectInput } from "../../components/FormInputs";
import { useSpinner } from "../../context/SpinnerContext";
import {
  getOrderByNumber,
  updateOrderById,
} from "../../services/settingsService";
import OrdersTable from "./OrdersTable";

const SettingsSupports = () => {
  const { showSpinner, hideSpinner } = useSpinner();

  const [orderNumber, setOrderNumber] = useState("");
  const [results, setResults] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(false);

  const statusOptions = useMemo(
    () =>
      Object.entries(StatusEnum).map(([key, value]) => ({
        label: value,
        value: value,
      })),
    []
  );

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSelectedOrder((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleClearSearch = () => {
    setOrderNumber("");
    setResults([]);
    setSelectedOrder(null);
    setLoading(false);
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!orderNumber.trim()) return;

    try {
      showSpinner();
      setLoading(true);

      const data = await getOrderByNumber(orderNumber.trim());

      if (!data || data.length === 0) {
        toast.error("Order not found");
        setResults([]);
        setSelectedOrder(null);
        return;
      }

      setResults(data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch orders");
    } finally {
      hideSpinner();
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!selectedOrder) return;

    try {
      showSpinner();

      const payload = {
        status: selectedOrder.status,
        isPaid: selectedOrder.isPaid,
        remarks: selectedOrder.remarks,
      };

      if (
        selectedOrder.quantity !== undefined &&
        selectedOrder.quantity !== ""
      ) {
        payload.quantity = Number(selectedOrder.quantity);
      }

      if (selectedOrder.price !== undefined && selectedOrder.price !== "") {
        payload.price = Number(selectedOrder.price);
      }

      if (selectedOrder.orderDate) {
        payload.orderDate = selectedOrder.orderDate; // keep as string/ISO
      }

      await updateOrderById(selectedOrder._id, payload);

      toast.success("Order updated successfully");
    } catch (error) {
      console.error(error);
      toast.error("Failed to update order");
    } finally {
      hideSpinner();
    }
  };

  return (
    <div className="container mt-3">
      <h4 className="mb-3">🛠 Supports</h4>

      {/* Search Form */}
      <form onSubmit={handleSearch} className="mb-3">
        <div className="input-group">
          <input
            type="text"
            className="form-control"
            placeholder="Enter Order Number"
            value={orderNumber}
            onChange={(e) => setOrderNumber(e.target.value)}
          />
          {results.length > 0 ? (
            <button
              type="button"
              className="btn btn-outline-danger"
              onClick={handleClearSearch}
            >
              ❌
            </button>
          ) : (
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? "..." : "🔍"}
            </button>
          )}
        </div>
      </form>

      {/* Results Table */}
      <OrdersTable results={results} onSelect={setSelectedOrder} />

      {/* Order Details Form */}
      {selectedOrder && (
        <div className="card p-3 mt-3">
          <h5>Order Details</h5>
          <p>
            <strong>Platform:</strong> {selectedOrder.platform}
          </p>
          <p>
            <strong>Courier:</strong> {selectedOrder.courier}
          </p>
          <p>
            <strong>Product:</strong> {selectedOrder.product?.name || "N/A"}
          </p>
          <p>
            <strong>Variant:</strong> {selectedOrder.product?.variant || "N/A"}
          </p>

          <div className="row">
            <div className="col-md-6">
              <TextInput
                label="Quantity"
                name="quantity"
                type="number"
                value={selectedOrder.quantity}
                onChange={handleChange}
              />

              <TextInput
                label="Price"
                name="price"
                type="number"
                step="0.01"
                value={
                  selectedOrder.price != null
                    ? selectedOrder.price
                    : selectedOrder.product?.price ?? ""
                }
                onChange={handleChange}
              />

              <TextInput
                label="Order Date"
                name="orderDate"
                type="date"
                value={
                  selectedOrder.orderDate
                    ? new Date(selectedOrder.orderDate)
                        .toISOString()
                        .slice(0, 10)
                    : ""
                }
                onChange={handleChange}
              />
            </div>

            <div className="col-md-6">
              <SelectInput
                label="Status"
                name="status"
                value={selectedOrder.status}
                onChange={handleChange}
                options={statusOptions}
              />

              <TextInput
                label="Remarks"
                name="remarks"
                type="text"
                value={selectedOrder.remarks}
                onChange={handleChange}
              />

              <div className="form-check mt-5">
                <input
                  className="form-check-input"
                  type="checkbox"
                  name="isPaid"
                  checked={selectedOrder.isPaid}
                  onChange={handleChange}
                />
                <label className="form-check-label">Paid</label>
              </div>
            </div>
          </div>

          <button className="btn btn-success mt-3" onClick={handleUpdate}>
            Update Order
          </button>
        </div>
      )}
    </div>
  );
};

export default SettingsSupports;
