import React, { useEffect, useState } from "react";

const AddProductModal = ({ isOpen, onClose, form, onChange, onSubmit, isEditMode }) => {
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    if (form.image && typeof form.image === "object") {
      setImagePreview(URL.createObjectURL(form.image));
    } else {
      setImagePreview(null);
    }
  }, [form.image]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="modal-backdrop fade show"></div>

      {/* Modal */}
      <div className="modal fade show d-block" tabIndex="-1" role="dialog" aria-modal="true">
        <div className="modal-dialog modal-lg" role="document">
          <form onSubmit={onSubmit} encType="multipart/form-data">
            <div className="modal-content">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title">
                  {isEditMode ? "Edit Product" : "Add Product"}
                </h5>
                <button type="button" className="close text-white" onClick={onClose}>
                  <span>&times;</span>
                </button>
              </div>

              <div className="modal-body">
                <div className="form-row">
                  <div className="form-group col-md-6">
                    <label>Serial Number</label>
                    <input
                      type="text"
                      name="serialNumber"
                      className="form-control"
                      value={form.serialNumber}
                      onChange={onChange}
                      required
                      placeholder="Enter serial number"
                    />
                  </div>
                  <div className="form-group col-md-6">
                    <label>Name</label>
                    <input
                      type="text"
                      name="name"
                      className="form-control"
                      value={form.name}
                      onChange={onChange}
                      required
                      placeholder="Enter product name"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group col-md-6">
                    <label>Price</label>
                    <input
                      type="number"
                      name="price"
                      className="form-control"
                      value={form.price}
                      onChange={onChange}
                      required
                      placeholder="Enter product price"
                    />
                  </div>
                  <div className="form-group col-md-6">
                    <label>Quantity</label>
                    <input
                      type="number"
                      name="quantity"
                      className="form-control"
                      value={form.quantity}
                      onChange={onChange}
                      required
                      placeholder="Enter quantity"
                      disabled={isEditMode}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    name="description"
                    className="form-control"
                    rows="2"
                    value={form.description}
                    onChange={onChange}
                    placeholder="Enter product description"
                  />
                </div>

                <div className="form-group">
                  <label>Image</label>
                  <div className="custom-file">
                    <input
                      type="file"
                      name="image"
                      className="custom-file-input"
                      id="productImage"
                      onChange={onChange}
                      accept="image/*"
                    />
                    <label className="custom-file-label" htmlFor="productImage">
                      {form.image?.name || "Choose image"}
                    </label>
                  </div>
                </div>

                {imagePreview && (
                  <div className="text-center mt-3">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="img-thumbnail"
                      style={{ maxWidth: "200px", maxHeight: "150px" }}
                    />
                  </div>
                )}
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={onClose}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {isEditMode ? "Update" : "Create"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default AddProductModal;
