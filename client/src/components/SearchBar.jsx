import React, { useRef, useEffect } from "react";

const SearchBar = ({
  searchTerm = "",
  onSearchChange,
  itemsPerPage = 10,
  onItemsPerPageChange,
  itemsPerPageOptions = [5, 10, 20, 50, 100],
  placeholder = "Search products...",
  disabled = false,
}) => {
  const inputRef = useRef(null);

  // Always focus when component mounts
  useEffect(() => {
    if (!disabled && inputRef.current) {
      inputRef.current.focus();
    }
  }, [disabled]);

  const handleSearchInputChange = (e) => {
    onSearchChange?.(e.target.value);
  };

  const handleItemsPerPageSelectChange = (e) => {
    const value = parseInt(e.target.value, 10);
    onItemsPerPageChange?.(value);

    // Refocus the search input after selecting items per page
    if (!disabled && inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleClearSearch = () => {
    onSearchChange?.("");
    // Refocus after clearing
    if (!disabled && inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <div className="card mb-3">
      <div className="card-body">
        <div className="row align-items-center">
          {/* Search Input */}
          <div className="col-md-9 mb-2 mb-md-0">
            <div className="input-group">
              <div className="input-group-prepend">
                <span className="input-group-text">
                  <i className="fas fa-search"></i>
                </span>
              </div>
              <input
                ref={inputRef}
                type="text"
                className="form-control"
                placeholder={placeholder}
                value={searchTerm}
                onChange={handleSearchInputChange}
                disabled={disabled}
              />
              {searchTerm && (
                <div className="input-group-append">
                  <button
                    className="btn btn-outline-secondary"
                    type="button"
                    onClick={handleClearSearch}
                    disabled={disabled}
                    title="Clear search"
                  >
                    <i className="fas fa-times"></i>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Items Per Page Selector */}
          <div className="col-md-3">
            <div className="d-flex justify-content-md-end align-items-center">
              <label htmlFor="itemsPerPage" className="mb-0 mr-2 text-muted">
                Show:
              </label>
              <select
                id="itemsPerPage"
                className="form-control"
                style={{ width: "auto" }}
                value={itemsPerPage}
                onChange={handleItemsPerPageSelectChange}
                disabled={disabled}
              >
                {itemsPerPageOptions.map((option) => (
                  <option key={option} value={option}>
                    {option} items
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchBar;
