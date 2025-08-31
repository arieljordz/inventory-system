import React, { useState } from "react";
import Navpath from "../../components/Navpath";
import SearchBar from "../../components/SearchBar";
import PaginationControls from "../../components/PaginationControls";
import ItemInventoryTable from "./ItemInventoryTable";
import ItemModal from "./ItemModal";
import RestockItemModal from "./RestockItemModal";
import InfoDashboard from "./InfoDashboard";

import { StatusEnum } from "../../enums/enums";
import { useItemInventory } from "../../hooks/useItemInventory";

/** ---------------------------
 * Constants
 ---------------------------- */
const INITIAL_FORM = {
  name: "",
  price: "",
  quantity: 0,
  variant: "Default",
  unit: "pcs",
  supplier: "",
  location: "Main Warehouse",
  status: StatusEnum.AVAILABLE,
};

const INITIAL_RESTOCK_FORM = {
  _id: "",
  name: "",
  price: 0,
  quantity: 1,
  remarks: "",
};

/** ---------------------------
 * Component
 ---------------------------- */
const ItemInventoryPage = () => {
  const {
    items,
    totalItems,
    loading,
    pagination,
    setPagination,
    saveItem,
    removeItem,
    restock,
    stats,
  } = useItemInventory({
    currentPage: 1,
    itemsPerPage: 5,
    searchTerm: "",
  });

  /** 🔹 Modals & Forms */
  const [modals, setModals] = useState({
    isItemOpen: false,
    isEditMode: false,
    isRestockOpen: false,
  });
  const [form, setForm] = useState(INITIAL_FORM);
  const [restockForm, setRestockForm] = useState(INITIAL_RESTOCK_FORM);

  /** ---------------------------
   * Helpers
   ---------------------------- */
  const handleChange = (setter) => (e) => {
    const { name, value, files } = e.target;
    setter((prev) => ({ ...prev, [name]: files ? files[0] : value }));
  };

  const openModal = (type, data = null) => {
    switch (type) {
      case "create":
        setForm(INITIAL_FORM);
        setModals({ isItemOpen: true, isEditMode: false, isRestockOpen: false });
        break;
      case "edit":
        setForm({ ...data, image: data?.image || null });
        setModals({ isItemOpen: true, isEditMode: true, isRestockOpen: false });
        break;
      case "restock":
        setRestockForm({
          _id: data._id,
          name: data.name,
          quantity: 1,
          remarks: "",
        });
        setModals((prev) => ({ ...prev, isRestockOpen: true }));
        break;
      default:
        break;
    }
  };

  const closeModal = (type) => {
    if (type === "item") {
      setForm(INITIAL_FORM);
      setModals((prev) => ({ ...prev, isItemOpen: false }));
    }
    if (type === "restock") {
      setRestockForm(INITIAL_RESTOCK_FORM);
      setModals((prev) => ({ ...prev, isRestockOpen: false }));
    }
  };

  /** ---------------------------
   * Render
   ---------------------------- */
  return (
    <>
      <Navpath
        levelOne="Item Inventory Management"
        levelTwo="Home"
        levelThree="Inventory"
      />

      <section className="content">
        <div className="container-fluid">
          {/* 🔹 Dashboard */}
          <InfoDashboard stats={stats} />

          {/* 🔹 Add Item */}
          <div className="mb-3">
            <button
              className="btn btn-primary"
              onClick={() => openModal("create")}
              disabled={loading}
            >
              <i className="fas fa-plus mr-1"></i> Add Items
            </button>
          </div>

          {/* 🔹 Search & Pagination */}
          <SearchBar
            searchTerm={pagination.searchTerm}
            onSearchChange={(val) =>
              setPagination((prev) => ({ ...prev, searchTerm: val }))
            }
            itemsPerPage={pagination.itemsPerPage}
            onItemsPerPageChange={(val) =>
              setPagination({ currentPage: 1, itemsPerPage: val, searchTerm: "" })
            }
            disabled={loading}
          />

          {/* 🔹 Table */}
          <ItemInventoryTable
            items={items}
            onEdit={(item) => openModal("edit", item)}
            onDelete={removeItem}
            onRestock={(item) => openModal("restock", item)}
            loading={loading}
          />

          {/* 🔹 Pagination Controls */}
          <PaginationControls
            currentPage={pagination.currentPage}
            totalItems={totalItems}
            itemsPerPage={pagination.itemsPerPage}
            onPageChange={(page) =>
              setPagination((prev) => ({ ...prev, currentPage: page }))
            }
            disabled={loading}
          />

          {/* 🔹 Item Modal */}
          <ItemModal
            isOpen={modals.isItemOpen}
            onClose={() => closeModal("item")}
            form={form}
            onChange={handleChange(setForm)}
            onSubmit={(e) => {
              e.preventDefault();
              saveItem(form, modals.isEditMode, () => closeModal("item"));
            }}
            isEditMode={modals.isEditMode}
          />

          {/* 🔹 Restock Item Modal */}
          <RestockItemModal
            show={modals.isRestockOpen}
            onClose={() => closeModal("restock")}
            restockForm={restockForm}
            onChange={handleChange(setRestockForm)}
            onSubmit={(e) => {
              e.preventDefault();
              restock(restockForm, () => closeModal("restock"));
            }}
          />
        </div>
      </section>
    </>
  );
};

export default ItemInventoryPage;
