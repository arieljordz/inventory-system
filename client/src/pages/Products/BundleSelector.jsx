import React, { useEffect, useState, useCallback } from "react";
import {
  Table,
  Button,
  FormControl,
  InputGroup,
  Row,
  Col,
} from "react-bootstrap";
import { getAllItems } from "../../services/itemService";
import { useDebounce } from "../../hooks/useDebounce";

const BundleSelector = ({ components, setComponents }) => {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const debouncedSearch = useDebounce(search, 800);

  console.log("BundleSelector render with components:", components);

  const loadItems = useCallback(async (searchTerm = "", pageNum = 1) => {
    try {
      const limit = 5;
      const res = await getAllItems({
        search: searchTerm,
        page: pageNum,
        limit,
      });

      setItems(res.data?.items || []);
      setTotalPages(res.data?.totalPages || 1); // <-- correct field
      setPage(res.data?.currentPage || pageNum);
    } catch (err) {
      console.error("Failed to fetch items:", err);
      setItems([]);
      setTotalPages(1);
    }
  }, []);

  useEffect(() => {
    setPage(1); // reset to first page when search changes
  }, [debouncedSearch]);

  useEffect(() => {
    loadItems(debouncedSearch, page);
  }, [debouncedSearch, page, loadItems]);

  const addItem = (item) => {
    if (!item._id) return;
    if (
      components.find((c) => {
        const id = typeof c.item === "object" ? c.item._id : c.item;
        return id === item._id;
      })
    )
      return;

    setComponents([...components, { item, qty: 1 }]);
  };

  const removeItem = (itemId) => {
    setComponents(
      components.filter((c) => {
        const id = typeof c.item === "object" ? c.item._id : c.item;
        return id !== itemId;
      })
    );
  };

  const updateQty = (itemId, qty) => {
    setComponents(
      components.map((c) => {
        const id = typeof c.item === "object" ? c.item._id : c.item;
        return id === itemId ? { ...c, qty: Number(qty) } : c;
      })
    );
  };

  return (
    <div className="mt-2">
      <h6>Bundle Components</h6>

      {/* Search input */}
      <InputGroup className="mb-3">
        <FormControl
          placeholder="Search items..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {search && (
          <Button variant="outline-secondary" onClick={() => setSearch("")}>
            ✕
          </Button>
        )}
      </InputGroup>

      <Row className="g-3">
        {/* Available Items */}
        <Col xs={12} md={6}>
          <div className="table-responsive" style={{ maxHeight: "250px" }}>
            <Table bordered size="sm" className="mb-0 table-sm text-center">
              <thead>
                <tr>
                  <th>Item Name</th>
                  <th>Stock</th>
                  <th>Add</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, index) => {
                  const isAdded = components.some((c) => {
                    const id = typeof c.item === "object" ? c.item._id : c.item;
                    return id === item._id;
                  });

                  return (
                    <tr key={item._id || index}>
                      <td>{`${item.name} (${item.variant})`}</td>
                      <td>{item.quantity}</td>
                      <td>
                        <Button
                          size="sm"
                          onClick={() => addItem(item)}
                          disabled={isAdded}
                        >
                          {isAdded ? "Added" : "Add"}
                        </Button>
                      </td>
                    </tr>
                  );
                })}
                {items.length === 0 && (
                  <tr>
                    <td colSpan={3} className="text-center">
                      No items found
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>

          {/* Pagination Controls */}
          <div className="d-flex justify-content-center align-items-center mt-2">
            <Button
              size="sm"
              variant="secondary"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Prev
            </Button>
            <span className="mx-2">
              Page {page} of {totalPages}
            </span>
            <Button
              size="sm"
              variant="secondary"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </Col>

        {/* Selected Components */}
        <Col xs={12} md={6}>
          <div className="table-responsive" style={{ maxHeight: "250px" }}>
            <Table bordered size="sm" className="mb-0 table-sm text-center">
              <thead>
                <tr>
                  <th style={{ width: "340px" }}>Item Name</th>
                  <th>Qty per Bundle</th>
                  <th>Remove</th>
                </tr>
              </thead>
              <tbody>
                {components.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="text-center">
                      No components selected
                    </td>
                  </tr>
                ) : (
                  components.map((comp, index) => {
                    const itemId =
                      typeof comp.item === "object" ? comp.item._id : comp.item;

                    const itemName =
                      typeof comp.item === "object"
                        ? `${comp.item.name} (${comp.item.variant})` // 👈 concat name + variant
                        : `${comp.name} (${comp.variant})`;

                    return (
                      <tr key={itemId || index}>
                        <td style={{ width: "170px" }}>{itemName}</td>
                        <td>
                          <FormControl
                            type="number"
                            min="1"
                            value={comp.qty}
                            onChange={(e) => updateQty(itemId, e.target.value)}
                            className="text-center"
                            style={{ height: "30px" }}
                          />
                        </td>
                        <td>
                          <Button
                            size="sm"
                            variant="danger"
                            onClick={() => removeItem(itemId)}
                          >
                            Remove
                          </Button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </Table>
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default BundleSelector;
