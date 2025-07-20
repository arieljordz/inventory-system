import React from "react";

const SearchBar = ({
  searchTerm = "",
  onSearchChange,
  itemsPerPage = 10,
  onItemsPerPageChange,
  itemsPerPageOptions = [5, 10, 20, 50, "All"],
  icon = "🔍",
}) => {
  return (
    <div className="row mb-3 align-items-center">
      <div className="col-md-4 mb-2 mb-md-0">
        <div className="input-group">
          <div className="input-group-prepend">
            <span className="input-group-text">{icon}</span>
          </div>
          <input
            type="text"
            className="form-control"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      </div>

      <div className="col-md-8 text-md-right">
        <div className="form-group mb-0 ml-auto" style={{ maxWidth: "150px" }}>
          <select
            className="form-control"
            value={itemsPerPage}
            onChange={(e) => onItemsPerPageChange(e.target.value)}
          >
            {itemsPerPageOptions.map((opt) => (
              <option key={opt} value={opt}>
                Show {opt}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default SearchBar;
