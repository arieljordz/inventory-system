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
import { getAllOrders } from "../../services/orderService";
import TrackingsTable from "./TrackingsTable";
import Navpath from "../../components/common/Navpath";
import SearchBar from "../../components/common/SearchBar";
import PaginationControls from "../../components/common/PaginationControls";

const TrackingsPage = () => {
  const { showSpinner, hideSpinner } = useSpinner();
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [paginatedItems, setPaginatedItems] = useState([]);

  const fetchOrders = async () => {
    try {
      showSpinner();
      const res = await getAllOrders();
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
      ["name", "platform", "platfromOrderId", "courier", "quantity", "price", "sku"].some((field) =>
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

  return (
    <>
      <Navpath
        levelOne="Tracking Management"
        levelTwo="Home"
        levelThree="Trackings"
      />

      <section className="content">
        <div className="container-fluid">
          <SearchBar
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            itemsPerPage={itemsPerPage}
            onItemsPerPageChange={handleItemsPerPageChange}
          />

          <TrackingsTable orders={paginatedItems} />

          <PaginationControls
            data={filteredBySearch}
            currentPage={currentPage}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            onPaginatedDataChange={setPaginatedItems}
          />
        </div>
      </section>
    </>
  );
};

export default TrackingsPage;
