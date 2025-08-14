import React, {
  useEffect,
  useState,
  useMemo,
  useCallback,
  useRef,
} from "react";
import Swal from "sweetalert2";
import * as XLSX from "xlsx";
import { toast } from "react-toastify";
import { useSpinner } from "../../context/SpinnerContext";
import { getProductsByStatus } from "../../services/productService";
import { tagInventoryForPickUp } from "../../services/inventoryDetailService";
import { importOrdersByPlatform } from "../../services/orderService";
import { StatusEnum, PlatformEnum, CourierEnum } from "../../enums/enums";
import OrderTable from "./OrderTable";
import PickupModal from "./PickupModal";
import ImportModal from "./ImportModal";
import Navpath from "../../components/common/Navpath";
import SearchBar from "../../components/common/SearchBar";
import PaginationControls from "../../components/common/PaginationControls";

const initialFormState = {
  quantity: "",
  platformOrderId: "",
  price: "",
  courier: CourierEnum.SPX,
  platform: PlatformEnum.SHOPEE,
  remarks: "",
};

const OrderPage = () => {
  const { showSpinner, hideSpinner } = useSpinner();
  const [orders, setOrders] = useState([]);
  const [form, setForm] = useState(initialFormState);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [paginatedItems, setPaginatedItems] = useState([]);

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showPickupModal, setShowPickupModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const fileInputRef = useRef(null);

  const platformOptions = useMemo(
    () =>
      Object.entries(PlatformEnum).map(([key, value]) => ({
        label: value,
        value: key,
      })),
    []
  );

  const fetchOrders = async () => {
    try {
      showSpinner();
      const res = await getProductsByStatus(StatusEnum.AVAILABLE);
      setOrders(res.data);
    } catch (error) {
      console.error("Failed to fetch orders", error);
    } finally {
      hideSpinner();
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const filteredBySearch = useMemo(() => {
    return orders.filter((item) =>
      ["name", "price", "description", "variant", "quantity"].some((field) =>
        String(item[field] || "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
      )
    );
  }, [orders, searchTerm]);

  const handleItemsPerPageChange = useCallback((val) => {
    setItemsPerPage(val);
    setCurrentPage(1);
  }, []);

  const openModal = (product) => {
    setSelectedProduct(product);
    setForm(initialFormState);
    setShowPickupModal(true);
  };

  const closeModal = () => {
    setSelectedProduct(null);
    setForm(initialFormState);
    setShowPickupModal(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const platform = form.platform?.trim();
    if (!platform) {
      toast.error("Please select a platform before uploading.");
      return;
    }

    const formData = new FormData();
    formData.append("platform", platform);
    formData.append("file", file);

    try {
      showSpinner();

      const response = await importOrdersByPlatform(formData);

    //   console.log("response:", response);
      const { summary, details } = response.data;

      if (details.skipped.length) {
        const skippedMessages = details.skipped.map(
          (item, idx) => `#${idx + 1} (${item.platformOrderId}): ${item.reason}`
        );

        Swal.fire({
          icon: "warning",
          title: "Import Completed with Issues",
          html: `<div style="max-height:300px; overflow:auto">${skippedMessages.join(
            "<br>"
          )}</div>`,
          width: "40em",
        });
      } else {
        toast.success("All orders imported successfully!");
      }

      await fetchOrders();
    } catch (err) {
      console.error("Import failed:", err);
      toast.error(err.response?.data?.message || "Failed to import orders.");
    } finally {
      hideSpinner();
      setShowImportModal(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = null; // Reset file input
      }
    }
  };

  const handleConfirmPickup = async () => {
    const qty = Number(form.quantity);
    const courier = form.courier?.trim();

    if (!qty || qty <= 0 || qty > selectedProduct.quantity) {
      toast.error("Invalid quantity.");
      return;
    }

    try {
      showSpinner();

      const data = {
        quantity: qty,
        platform: form.platform?.trim() || "",
        platformOrderId: form.platformOrderId?.trim() || "",
        courier,
        remarks: form.remarks?.trim() || "",
      };

      await tagInventoryForPickUp(data, selectedProduct._id);

      toast.success("Product tagged for pick up!");
      closeModal();
      await fetchOrders();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to tag product.");
    } finally {
      hideSpinner();
    }
  };

  return (
    <>
      <Navpath
        levelOne="Order Management"
        levelTwo="Home"
        levelThree="Orders"
      />

      <section className="content">
        <div className="container-fluid">
          <button
            className="btn btn-success mb-3"
            onClick={() => setShowImportModal(true)}
          >
            <i className="fas fa-file-import mr-1"></i> Import Orders
          </button>

          <SearchBar
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            itemsPerPage={itemsPerPage}
            onItemsPerPageChange={handleItemsPerPageChange}
          />

          <OrderTable orders={paginatedItems} onOpenModal={openModal} />

          <PaginationControls
            data={filteredBySearch}
            currentPage={currentPage}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            onPaginatedDataChange={setPaginatedItems}
          />

          <PickupModal
            show={showPickupModal}
            selectedProduct={selectedProduct}
            form={form}
            getQuantity={() => selectedProduct?.quantity || 0}
            onClose={closeModal}
            onChange={handleChange}
            handleConfirmPickup={handleConfirmPickup}
          />

          <ImportModal
            show={showImportModal}
            onClose={() => setShowImportModal(false)}
            form={form}
            handleChange={handleChange}
            fileInputRef={fileInputRef}
            handleImport={handleImport}
            platformOptions={platformOptions}
          />
        </div>
      </section>
    </>
  );
};

export default OrderPage;
