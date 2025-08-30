// ItemInventory.jsx
// React + Vite + Bootstrap UI for managing Item Inventory (single-file demo)
// Notes:
// 1) Ensure Bootstrap CSS & JS are loaded in index.html
//    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet" />
//    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
// 2) Replace the mock API at the bottom with your real backend calls.
// 3) This file exports a single component <ItemInventory /> you can mount on a route.

import React, { useEffect, useMemo, useRef, useState } from "react";

// -----------------------------
// Helpers
// -----------------------------
const debounce = (fn, ms = 400) => {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), ms);
  };
};

const StatusEnum = {
  AVAILABLE: "Available",
  OUT_OF_STOCK: "Out of Stock",
  DISCONTINUED: "Discontinued",
};

const statusBadge = (status) => {
  const map = {
    [StatusEnum.AVAILABLE]: "success",
    [StatusEnum.OUT_OF_STOCK]: "danger",
    [StatusEnum.DISCONTINUED]: "secondary",
  };
  return map[status] || "secondary";
};

const defaultItem = {
  _id: null,
  name: "",
  sku: "",
  description: "",
  quantity: 0,
  unit: "pcs",
  location: "Main Warehouse",
  status: StatusEnum.AVAILABLE,
  image: "",
  imageId: "",
};

// -----------------------------
// Main Component
// -----------------------------
export default function ItemInventory() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // table state
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [unitFilter, setUnitFilter] = useState("");
  const [sortBy, setSortBy] = useState({ key: "createdAt", dir: "desc" });
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // modal state
  const [showEdit, setShowEdit] = useState(false);
  const [editing, setEditing] = useState(defaultItem);

  const [showAdjust, setShowAdjust] = useState(false);
  const [adjustData, setAdjustData] = useState({ type: "IN", qty: 1, note: "", reference: "" });

  const [showMoves, setShowMoves] = useState(false);
  const [movesItem, setMovesItem] = useState(null);
  const [moves, setMoves] = useState([]);

  const debouncedFetch = useMemo(
    () =>
      debounce(async (q, s, u, sort, p, l) => {
        try {
          setLoading(true);
          setError("");
          const res = await api.listItems({ search: q, status: s, unit: u, sortBy: sort.key, sortDir: sort.dir, page: p, limit: l });
          setItems(res.items);
        } catch (e) {
          setError(e.message || "Failed to load items.");
        } finally {
          setLoading(false);
        }
      }, 250),
    []
  );

  useEffect(() => {
    debouncedFetch(search, statusFilter, unitFilter, sortBy, page, limit);
  }, [search, statusFilter, unitFilter, sortBy, page, limit, debouncedFetch]);

  const onOpenCreate = () => {
    setEditing({ ...defaultItem, _id: null });
    setShowEdit(true);
  };
  const onOpenEdit = (it) => {
    setEditing({ ...defaultItem, ...it });
    setShowEdit(true);
  };

  const onSaveItem = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError("");
      if (editing._id) {
        await api.updateItem(editing._id, editing);
      } else {
        await api.createItem(editing);
      }
      setShowEdit(false);
      debouncedFetch(search, statusFilter, unitFilter, sortBy, page, limit);
    } catch (e) {
      setError(e.message || "Failed to save item.");
    } finally {
      setLoading(false);
    }
  };

  const onDelete = async (id) => {
    if (!confirm("Delete this item? This cannot be undone.")) return;
    try {
      setLoading(true);
      await api.deleteItem(id);
      debouncedFetch(search, statusFilter, unitFilter, sortBy, page, limit);
    } catch (e) {
      setError(e.message || "Failed to delete.");
    } finally {
      setLoading(false);
    }
  };

  const onOpenAdjust = (it) => {
    setAdjustData({ type: "IN", qty: 1, note: "", reference: "" });
    setEditing({ ...defaultItem, ...it });
    setShowAdjust(true);
  };
  const onApplyAdjust = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await api.adjustStock(editing._id, adjustData);
      setShowAdjust(false);
      debouncedFetch(search, statusFilter, unitFilter, sortBy, page, limit);
    } catch (e) {
      setError(e.message || "Failed to adjust stock.");
    } finally {
      setLoading(false);
    }
  };

  const onOpenMoves = async (it) => {
    setMovesItem(it);
    setShowMoves(true);
    try {
      setLoading(true);
      const m = await api.getMovements(it._id);
      setMoves(m);
    } catch (e) {
      setError(e.message || "Failed to load movements.");
    } finally {
      setLoading(false);
    }
  };

  const onSort = (key) => {
    setSortBy((prev) => {
      if (prev.key === key) return { key, dir: prev.dir === "asc" ? "desc" : "asc" };
      return { key, dir: "asc" };
    });
  };

  const units = ["pcs", "set", "box", "pack", "roll", "kg", "m"];

  return (
    <div className="container-fluid py-3">
      <div className="d-flex align-items-center justify-content-between mb-3">
        <h3 className="mb-0">Item Inventory</h3>
        <div className="d-flex gap-2">
          <button className="btn btn-outline-secondary" onClick={() => debouncedFetch(search, statusFilter, unitFilter, sortBy, page, limit)}>
            <i className="fas fa-rotate"></i> Refresh
          </button>
          <button className="btn btn-primary" onClick={onOpenCreate}>
            <i className="fas fa-plus me-1"></i> New Item
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="card shadow-sm mb-3">
        <div className="card-body">
          <div className="row g-2 align-items-end">
            <div className="col-md-4">
              <label className="form-label">Search</label>
              <input
                className="form-control"
                placeholder="Name / SKU / Description"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="col-md-3">
              <label className="form-label">Status</label>
              <select className="form-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="">All</option>
                <option value={StatusEnum.AVAILABLE}>Available</option>
                <option value={StatusEnum.OUT_OF_STOCK}>Out of Stock</option>
                <option value={StatusEnum.DISCONTINUED}>Discontinued</option>
              </select>
            </div>
            <div className="col-md-3">
              <label className="form-label">Unit</label>
              <select className="form-select" value={unitFilter} onChange={(e) => setUnitFilter(e.target.value)}>
                <option value="">All</option>
                {units.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-2">
              <label className="form-label">Per Page</label>
              <select className="form-select" value={limit} onChange={(e) => setLimit(Number(e.target.value))}>
                {[10, 20, 50, 100].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="alert alert-danger d-flex align-items-center" role="alert">
          <i className="fas fa-triangle-exclamation me-2"></i>
          <div>{error}</div>
        </div>
      )}

      {/* Table */}
      <div className="card shadow-sm">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <Th sortBy={sortBy} onSort={onSort} k="name" label="Item" />
                <Th sortBy={sortBy} onSort={onSort} k="sku" label="SKU" />
                <Th sortBy={sortBy} onSort={onSort} k="quantity" label="Qty" right />
                <th>Unit</th>
                <th>Location</th>
                <Th sortBy={sortBy} onSort={onSort} k="status" label="Status" />
                <Th sortBy={sortBy} onSort={onSort} k="updatedAt" label="Updated" />
                <th style={{ width: 160 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={8} className="text-center py-5">
                    <div className="spinner-border" role="status" />
                  </td>
                </tr>
              )}
              {!loading && items.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center py-5 text-muted">
                    No items found.
                  </td>
                </tr>
              )}
              {!loading &&
                items.map((it) => (
                  <tr key={it._id}>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        {it.image ? (
                          <img src={it.image} alt="img" width={36} height={36} className="rounded"/>
                        ) : (
                          <div className="bg-light rounded d-flex align-items-center justify-content-center" style={{width:36,height:36}}>
                            <i className="fas fa-box"></i>
                          </div>
                        )}
                        <div>
                          <div className="fw-semibold">{it.name}</div>
                          <div className="small text-muted">{it.description?.slice(0, 64)}</div>
                        </div>
                      </div>
                    </td>
                    <td><code>{it.sku}</code></td>
                    <td className="text-end">{it.quantity.toLocaleString()}</td>
                    <td>{it.unit}</td>
                    <td>{it.location}</td>
                    <td>
                      <span className={`badge text-bg-${statusBadge(it.status)}`}>{it.status}</span>
                    </td>
                    <td>{new Date(it.updatedAt).toLocaleString()}</td>
                    <td>
                      <div className="btn-group btn-group-sm" role="group">
                        <button className="btn btn-outline-secondary" title="Movements" onClick={() => onOpenMoves(it)}>
                          <i className="fas fa-clock-rotate-left"></i>
                        </button>
                        <button className="btn btn-outline-primary" title="Adjust Stock" onClick={() => onOpenAdjust(it)}>
                          <i className="fas fa-arrows-rotate"></i>
                        </button>
                        <button className="btn btn-outline-warning" title="Edit" onClick={() => onOpenEdit(it)}>
                          <i className="fas fa-pen"></i>
                        </button>
                        <button className="btn btn-outline-danger" title="Delete" onClick={() => onDelete(it._id)}>
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
        {/* Pagination */}
        <div className="card-footer d-flex align-items-center justify-content-between">
          <div className="text-muted small">Page {page}</div>
          <div className="btn-group">
            <button className="btn btn-outline-secondary btn-sm" disabled={page === 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
              <i className="fas fa-chevron-left"></i>
            </button>
            <button className="btn btn-outline-secondary btn-sm" onClick={() => setPage((p) => p + 1)}>
              <i className="fas fa-chevron-right"></i>
            </button>
          </div>
        </div>
      </div>

      {/* Create/Edit Modal */}
      <Modal show={showEdit} onClose={() => setShowEdit(false)} title={editing._id ? "Edit Item" : "New Item"}>
        <form onSubmit={onSaveItem} className="needs-validation" noValidate>
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label">Name</label>
              <input
                className="form-control"
                value={editing.name}
                required
                onChange={(e) => setEditing({ ...editing, name: e.target.value })}
              />
            </div>
            <div className="col-md-6">
              <label className="form-label">SKU</label>
              <input className="form-control" value={editing.sku} onChange={(e) => setEditing({ ...editing, sku: e.target.value })} />
            </div>
            <div className="col-12">
              <label className="form-label">Description</label>
              <textarea className="form-control" rows={2} value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })}></textarea>
            </div>
            <div className="col-md-4">
              <label className="form-label">Quantity</label>
              <input
                type="number"
                min={0}
                className="form-control"
                value={editing.quantity}
                onChange={(e) => setEditing({ ...editing, quantity: Number(e.target.value) })}
              />
            </div>
            <div className="col-md-4">
              <label className="form-label">Unit</label>
              <select className="form-select" value={editing.unit} onChange={(e) => setEditing({ ...editing, unit: e.target.value })}>
                {units.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-4">
              <label className="form-label">Location</label>
              <input className="form-control" value={editing.location} onChange={(e) => setEditing({ ...editing, location: e.target.value })} />
            </div>
            <div className="col-md-6">
              <label className="form-label">Status</label>
              <select className="form-select" value={editing.status} onChange={(e) => setEditing({ ...editing, status: e.target.value })}>
                {Object.values(StatusEnum).map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-6">
              <label className="form-label">Image URL</label>
              <input className="form-control" value={editing.image} onChange={(e) => setEditing({ ...editing, image: e.target.value })} />
            </div>
          </div>
          <div className="d-flex justify-content-end gap-2 mt-4">
            <button type="button" className="btn btn-outline-secondary" onClick={() => setShowEdit(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {editing._id ? "Save Changes" : "Create Item"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Adjust Stock Modal */}
      <Modal show={showAdjust} onClose={() => setShowAdjust(false)} title={`Adjust Stock • ${editing.name || ""}`}>
        <form onSubmit={onApplyAdjust}>
          <div className="row g-3">
            <div className="col-md-4">
              <label className="form-label">Type</label>
              <select className="form-select" value={adjustData.type} onChange={(e) => setAdjustData({ ...adjustData, type: e.target.value })}>
                <option value="IN">IN</option>
                <option value="OUT">OUT</option>
              </select>
            </div>
            <div className="col-md-4">
              <label className="form-label">Quantity</label>
              <input
                type="number"
                min={1}
                className="form-control"
                value={adjustData.qty}
                onChange={(e) => setAdjustData({ ...adjustData, qty: Math.max(1, Number(e.target.value)) })}
                required
              />
            </div>
            <div className="col-md-4">
              <label className="form-label">Reference</label>
              <input className="form-control" value={adjustData.reference} onChange={(e) => setAdjustData({ ...adjustData, reference: e.target.value })} />
            </div>
            <div className="col-12">
              <label className="form-label">Note</label>
              <textarea className="form-control" rows={2} value={adjustData.note} onChange={(e) => setAdjustData({ ...adjustData, note: e.target.value })}></textarea>
            </div>
          </div>
          <div className="d-flex justify-content-end gap-2 mt-4">
            <button type="button" className="btn btn-outline-secondary" onClick={() => setShowAdjust(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Apply
            </button>
          </div>
        </form>
      </Modal>

      {/* Movements Modal */}
      <Modal show={showMoves} onClose={() => setShowMoves(false)} title={`Movements • ${movesItem?.name || ""}`}>
        <div className="table-responsive">
          <table className="table table-sm table-striped align-middle">
            <thead>
              <tr>
                <th>Date</th>
                <th>Type</th>
                <th className="text-end">Qty</th>
                <th>Reference</th>
                <th>Note</th>
              </tr>
            </thead>
            <tbody>
              {moves.map((m) => (
                <tr key={m._id}>
                  <td>{new Date(m.createdAt).toLocaleString()}</td>
                  <td>
                    <span className={`badge text-bg-${m.type === "IN" ? "success" : "danger"}`}>{m.type}</span>
                  </td>
                  <td className="text-end">{m.qty}</td>
                  <td>{m.reference}</td>
                  <td className="text-truncate" style={{maxWidth:200}}>{m.note}</td>
                </tr>
              ))}
              {moves.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center text-muted">No movements yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Modal>
    </div>
  );
}

// -----------------------------
// Reusable Table Header with Sort
// -----------------------------
function Th({ k, label, sortBy, onSort, right }) {
  const is = sortBy.key === k;
  const dir = is ? sortBy.dir : undefined;
  return (
    <th role="button" onClick={() => onSort(k)} className={right ? "text-end" : undefined}>
      <div className={`d-flex ${right ? "justify-content-end" : "justify-content-start"} align-items-center gap-1`}>
        <span>{label}</span>
        <i className={`fas ${!is ? "fa-sort" : dir === "asc" ? "fa-arrow-up-short-wide" : "fa-arrow-down-wide-short"}`}></i>
      </div>
    </th>
  );
}

// -----------------------------
// Simple Modal (Bootstrap powered)
// -----------------------------
function Modal({ show, onClose, title, children }) {
  const ref = useRef();
  useEffect(() => {
    if (!ref.current) return;
    const el = ref.current;
    if (show) {
      el.style.display = "block";
      el.classList.add("show");
      document.body.classList.add("modal-open");
    } else {
      el.classList.remove("show");
      el.style.display = "none";
      document.body.classList.remove("modal-open");
    }
    return () => {
      document.body.classList.remove("modal-open");
    };
  }, [show]);

  return (
    <div className="modal fade" tabIndex="-1" style={{ display: "none" }} ref={ref}>
      <div className="modal-dialog modal-lg modal-dialog-scrollable">
        <div className="modal-content">
          <div className="modal-header bg-primary text-white">
            <h5 className="modal-title">{title}</h5>
            <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
          </div>
          <div className="modal-body">{children}</div>
        </div>
      </div>
      {show && <div className="modal-backdrop fade show" onClick={onClose}></div>}
    </div>
  );
}

// -----------------------------
// Mock API (Replace with real backend)
// -----------------------------
const seed = [
  {
    _id: "1",
    name: "Ring",
    sku: "RNG-001",
    description: "Steel ring",
    quantity: 120,
    unit: "pcs",
    location: "Main Warehouse",
    status: StatusEnum.AVAILABLE,
    image: "",
    updatedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  },
  {
    _id: "2",
    name: "Frame",
    sku: "FRM-008",
    description: "Metal frame",
    quantity: 8,
    unit: "pcs",
    location: "Secondary Warehouse",
    status: StatusEnum.AVAILABLE,
    image: "",
    updatedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  },
  {
    _id: "3",
    name: "Duyan",
    sku: "DYN-123",
    description: "Hammock fabric",
    quantity: 0,
    unit: "pcs",
    location: "Main Warehouse",
    status: StatusEnum.OUT_OF_STOCK,
    image: "",
    updatedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  },
];

let db = [...seed];
let movesDb = [];

const api = {
  async listItems({ search = "", status = "", unit = "", sortBy = "createdAt", sortDir = "desc", page = 1, limit = 10 }) {
    await sleep(300);
    let data = [...db];
    const q = search.trim().toLowerCase();
    if (q) {
      data = data.filter((x) =>
        [x.name, x.sku, x.description].some((f) => (f || "").toLowerCase().includes(q))
      );
    }
    if (status) data = data.filter((x) => x.status === status);
    if (unit) data = data.filter((x) => x.unit === unit);

    data.sort((a, b) => {
      const va = a[sortBy];
      const vb = b[sortBy];
      if (va === vb) return 0;
      if (sortDir === "asc") return va > vb ? 1 : -1;
      return va < vb ? 1 : -1;
    });

    const start = (page - 1) * limit;
    const items = data.slice(start, start + limit);
    return { items, total: data.length };
  },
  async createItem(payload) {
    await sleep(250);
    const now = new Date().toISOString();
    const _id = String(Math.random()).slice(2);
    const newItem = { ...defaultItem, ...payload, _id, createdAt: now, updatedAt: now };
    db.unshift(newItem);
    return newItem;
  },
  async updateItem(id, payload) {
    await sleep(250);
    const i = db.findIndex((x) => x._id === id);
    if (i === -1) throw new Error("Item not found");
    db[i] = { ...db[i], ...payload, updatedAt: new Date().toISOString() };
    return db[i];
  },
  async deleteItem(id) {
    await sleep(200);
    db = db.filter((x) => x._id !== id);
    movesDb = movesDb.filter((m) => m.itemId !== id);
    return true;
  },
  async adjustStock(id, { type, qty, note, reference }) {
    await sleep(250);
    const item = db.find((x) => x._id === id);
    if (!item) throw new Error("Item not found");
    const delta = type === "IN" ? Math.abs(qty) : -Math.abs(qty);
    const next = (item.quantity || 0) + delta;
    if (next < 0) throw new Error("Insufficient stock for OUT movement.");
    item.quantity = next;
    item.status = next === 0 ? StatusEnum.OUT_OF_STOCK : item.status;
    item.updatedAt = new Date().toISOString();
    const move = { _id: String(Math.random()).slice(2), itemId: id, type, qty: Math.abs(qty), note, reference, createdAt: new Date().toISOString() };
    movesDb.unshift(move);
    return item;
  },
  async getMovements(id) {
    await sleep(200);
    return movesDb.filter((m) => m.itemId === id);
  },
};

function sleep(ms) {
  return new Promise((res) => setTimeout(res, ms));
}
