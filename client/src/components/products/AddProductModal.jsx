import React from "react";

const AddProductModal = ({ form, handleChange, handleSubmit, isEditMode }) => {
  return (
    <div
      className="modal fade"
      id="addProductModal"
      tabIndex="-1"
      role="dialog"
      aria-hidden="true"
    >
      <div className="modal-dialog modal-lg" role="document">
        <form onSubmit={handleSubmit} encType="multipart/form-data">
          <div className="modal-content">
            <div className="modal-header bg-primary">
              <h5 className="modal-title text-white">
                {isEditMode ? "Edit Product" : "Add Product"}
              </h5>
              <button
                type="button"
                className="close text-white"
                data-dismiss="modal"
                aria-label="Close"
              >
                <span aria-hidden="true">&times;</span>
              </button>
            </div>

            <div className="modal-body">
              <div className="form-row">
                <div className="form-group col-md-6">
                  <label htmlFor="serialNumber">Serial Number</label>
                  <input
                    type="text"
                    name="serialNumber"
                    className="form-control"
                    value={form.serialNumber}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group col-md-6">
                  <label htmlFor="name">Name</label>
                  <input
                    type="text"
                    name="name"
                    className="form-control"
                    value={form.name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group col-md-6">
                  <label htmlFor="price">Price</label>
                  <input
                    type="number"
                    name="price"
                    className="form-control"
                    value={form.price}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group col-md-6">
                  <label htmlFor="description">Description</label>
                  <input
                    type="text"
                    name="description"
                    className="form-control"
                    value={form.description}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group col-md-6">
                  <label>Quantity</label>
                  <input
                    type="number"
                    name="quantity"
                    className="form-control"
                    value={form.quantity || ""}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group col-md-6">
                  <label htmlFor="image">Image</label>
                  <div className="custom-file">
                    <input
                      type="file"
                      className="custom-file-input"
                      id="image"
                      name="image"
                      onChange={handleChange}
                    />
                    <label className="custom-file-label" htmlFor="image">
                      Choose file
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer justify-content-end">
              <button type="submit" className="btn btn-success">
                <i className="fas fa-save mr-1"></i>
                {isEditMode ? "Update" : "Add"}
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                data-dismiss="modal"
              >
                <i className="fas fa-times mr-1"></i>
                Cancel
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProductModal;
