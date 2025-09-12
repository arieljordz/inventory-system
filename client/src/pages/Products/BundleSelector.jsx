import React, { useEffect, useState, useCallback } from "react";
import { Button, FormControl, InputGroup, Row, Col } from "react-bootstrap";
import { getAllItems } from "../../services/itemService";
import { useDebounce } from "../../hooks/useDebounce";
import AvailableItemsTable from "./AvailableItemsTable";
import SelectedComponentsTable from "./SelectedComponentsTable";

const BundleSelector = ({ components, setComponents }) => {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const debouncedSearch = useDebounce(search, 800);

  const loadItems = useCallback(async (searchTerm = "", pageNum = 1) => {
    try {
      const limit = 5;
      const res = await getAllItems({
        search: searchTerm,
        page: pageNum,
        limit,
      });

      setItems(res.data?.items || []);
      setTotalPages(res.data?.totalPages || 1);
      setPage(res.data?.currentPage || pageNum);
    } catch (err) {
      console.error("Failed to fetch items:", err);
      setItems([]);
      setTotalPages(1);
    }
  }, []);

  useEffect(() => {
    setPage(1);
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
        <Col xs={12} md={6}>
          <AvailableItemsTable
            items={items}
            components={components}
            addItem={addItem}
            page={page}
            totalPages={totalPages}
            setPage={setPage}
          />
        </Col>

        <Col xs={12} md={6}>
          <SelectedComponentsTable
            components={components}
            updateQty={updateQty}
            removeItem={removeItem}
          />
        </Col>
      </Row>
    </div>
  );
};

export default BundleSelector;
