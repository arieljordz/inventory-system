import React, {
  useEffect,
  useState,
  useMemo,
  useCallback,
  useRef,
} from "react";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import { useSpinner } from "../../context/SpinnerContext";
import { getProductsByStatus } from "../../services/productService";
import { tagInventoryForPickUp } from "../../services/inventoryDetailService";
import { StatusEnum } from "../../enums/enums";
import OrderTable from "./OrderTable";
import PickupModal from "./PickupModal";
import Navpath from "../../components/common/Navpath";
import SearchBar from "../../components/common/SearchBar";
import PaginationControls from "../../components/common/PaginationControls";

const initialFormState = {
  quantity: "",
  price: "",
  courier: "",
};

const OrderPage = () => {
  const { showSpinner, hideSpinner } = useSpinner();
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(initialFormState);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [paginatedItems, setPaginatedItems] = useState([]);

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const fetchProducts = async () => {
    try {
      showSpinner();
      const res = await getProductsByStatus(StatusEnum.AVAILABLE);
      setProducts(res.data);
    } catch (error) {
      console.error("Failed to fetch products", error);
    } finally {
      hideSpinner();
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const filteredBySearch = useMemo(() => {
    return products.filter((item) =>
      ["name", "price", "description", "variant"].some((field) =>
        String(item[field] || "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
      )
    );
  }, [products, searchTerm]);

  const handleItemsPerPageChange = useCallback((val) => {
    setItemsPerPage(val);
    setCurrentPage(1);
  }, []);

  const openModal = (product) => {
    setSelectedProduct(product);
    setForm(initialFormState);
    setShowModal(true);
  };

  const closeModal = () => {
    setSelectedProduct(null);
    setForm(initialFormState);
    setShowModal(false);
  };

  const handleConfirmPickup = async () => {
    const qty = Number(form.quantity);
    const courier = form.courier?.trim();

    if (!qty || qty <= 0 || qty > selectedProduct.quantity) {
      toast.error("Invalid quantity.");
      return;
    }

    if (!courier) {
      toast.error("Courier is required.");
      return;
    }

    try {
      showSpinner();

      await tagInventoryForPickUp(
        selectedProduct._id,
        qty,
        courier,
        form.remarks || ""
      );
      toast.success("Product tagged for pick up!");

      closeModal();
      await fetchProducts();
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
          <SearchBar
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            itemsPerPage={itemsPerPage}
            onItemsPerPageChange={handleItemsPerPageChange}
          />

          <OrderTable products={paginatedItems} onOpenModal={openModal} />

          <PaginationControls
            data={filteredBySearch}
            currentPage={currentPage}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            onPaginatedDataChange={setPaginatedItems}
          />

          <PickupModal
            show={showModal}
            selectedProduct={selectedProduct}
            form={form}
            setForm={setForm}
            getQuantity={() => selectedProduct?.quantity || 0}
            onClose={closeModal}
            handleConfirmPickup={handleConfirmPickup}
          />
        </div>
      </section>
    </>
  );
};

export default OrderPage;
