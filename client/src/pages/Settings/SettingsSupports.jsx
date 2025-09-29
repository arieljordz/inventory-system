import React, { useState, useMemo } from "react";
import { toast } from "react-toastify";
import { StatusEnum } from "../../enums/enums";
import { TextInput, SelectInput } from "../../components/FormInputs";
import { useSpinner } from "../../context/SpinnerContext";
import {
  getOrderByNumber,
  updateOrderByNumber,
} from "../../services/settingsService";

const SettingsSupports = () => {
  const { showSpinner, hideSpinner } = useSpinner();

  const [orderNumber, setOrderNumber] = useState("");
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(false);

  const statusOptions = useMemo(
    () =>
      Object.entries(StatusEnum).map(([key, value]) => ({
        label: value,
        value: value,
      })),
    []
  );

  // 🔹 Handle input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // 🔹 Reset search & form
  const handleClearSearch = () => {
    setOrderNumber("");
    setForm(null);
    setLoading(false);
  };

  // 🔹 Fetch order by orderNumber
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!orderNumber.trim()) return; // ⬅️ No toast on empty search

    try {
      showSpinner();
      setLoading(true);

      const data = await getOrderByNumber(orderNumber.trim());

      if (!data) {
        toast.error("Order not found");
        setForm(null);
        return;
      }

      setForm({
        orderNumber: data.orderNumber,
        status: data.status || "",
        isPaid: data.isPaid || false,
        remarks: data.remarks || "",
        quantity: data.quantity || 0,
        price: data.price || 0,
        orderDate: data.orderDate
          ? new Date(data.orderDate).toISOString().slice(0, 10)
          : "",
        platform: data.platform,
        courier: data.courier,
        product: data.product,
      });
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch order");
    } finally {
      hideSpinner();
      setLoading(false);
    }
  };

  // 🔹 Update order
  const handleUpdate = async () => {
    if (!form) return;

    try {
      showSpinner();
      await updateOrderByNumber(form.orderNumber, {
        status: form.status,
        isPaid: form.isPaid,
        remarks: form.remarks,
        quantity: Number(form.quantity),
        price: Number(form.price),
        orderDate: form.orderDate ? new Date(form.orderDate) : null,
      });
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
          {form ? (
            <button
              type="button"
              className="btn btn-outline-danger"
              onClick={handleClearSearch}
            >
              ❌
            </button>
          ) : (
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? "..." : "🔍"}
            </button>
          )}
        </div>
      </form>

      {/* Order Details Form */}
      {form && (
        <div className="card p-3">
          <h5>Order Details</h5>
          <p>
            <strong>Platform:</strong> {form.platform}
          </p>
          <p>
            <strong>Courier:</strong> {form.courier}
          </p>
          <p>
            <strong>Product:</strong> {form.product?.name || "N/A"}
          </p>

          <div className="row">
            {/* Left Column */}
            <div className="col-md-6">
              <TextInput
                label="Quantity"
                name="quantity"
                type="number"
                value={form.quantity}
                onChange={handleChange}
              />

              <TextInput
                label="Price"
                name="price"
                type="number"
                step="0.01"
                value={form.price}
                onChange={handleChange}
              />

              <TextInput
                label="Order Date"
                name="orderDate"
                type="date"
                value={form.orderDate}
                onChange={handleChange}
              />
            </div>

            {/* Right Column */}
            <div className="col-md-6">
              <SelectInput
                label="Status"
                name="status"
                value={form.status}
                onChange={handleChange}
                options={statusOptions}
              />

              <TextInput
                label="Remarks"
                name="remarks"
                type="text"
                value={form.remarks}
                onChange={handleChange}
              />

              <div className="form-check mt-5">
                <input
                  className="form-check-input"
                  type="checkbox"
                  name="isPaid"
                  checked={form.isPaid}
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
