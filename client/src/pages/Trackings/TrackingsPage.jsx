import React, { useEffect, useState, useCallback, useMemo } from "react";
import Navpath from "../../components/common/Navpath";
import SearchBar from "../../components/common/SearchBar";
import PaginationControls from "../../components/common/PaginationControls";
import {
  getInventoryDetailsByStatus,
  tagInventoryForPickUp,
} from "../../services/inventoryDetailService";
import { StatusEnum } from "../../enums/enums";
import { toast } from "react-toastify";
import TrackingsTable from "./TrackingsTable";

const groupedStatuses = [StatusEnum.AVAILABLE, StatusEnum.OUT_OF_STOCK];

const statusIconMap = {
  [StatusEnum.AVAILABLE]: "ion ion-cube",
  [StatusEnum.FOR_PICK_UP]: "ion ion-log-out",
  [StatusEnum.TO_SHIP]: "ion ion-forward",
  [StatusEnum.SHIPPING]: "ion ion-android-bus",
  [StatusEnum.RETURNED]: "ion ion-refresh",
  [StatusEnum.DELIVERED]: "ion ion-checkmark",
  [StatusEnum.COMPLETED]: "ion ion-clipboard",
  [StatusEnum.OUT_OF_STOCK]: "ion ion-close-circled",
};

const statusColorMap = {
  [StatusEnum.AVAILABLE]: "info",
  [StatusEnum.FOR_PICK_UP]: "warning",
  [StatusEnum.TO_SHIP]: "primary",
  [StatusEnum.SHIPPING]: "success",
  [StatusEnum.RETURNED]: "secondary",
  [StatusEnum.DELIVERED]: "teal",
  [StatusEnum.COMPLETED]: "dark",
  [StatusEnum.OUT_OF_STOCK]: "danger",
};

const TrackingsPage = () => {
  const [statusCounts, setStatusCounts] = useState({});
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [filteredData, setFilteredData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [paginatedItems, setPaginatedItems] = useState([]);

  // Count items by status
  const fetchStatusCounts = useCallback(async () => {
    const counts = {};
    await Promise.all(
      Object.values(StatusEnum).map(async (status) => {
        try {
          const { data } = await getInventoryDetailsByStatus(status);

          // console.log("status:", status);
          if (status === StatusEnum.AVAILABLE) {
            // Only count products that are actually available (e.g., quantity > 0)
            counts[status] = data.filter(
              (item) => item.product?.quantity > 0
            ).length;
          } else if (status === StatusEnum.OUT_OF_STOCK) {
            counts[status] = data.filter(
              (item) => item.product?.status === StatusEnum.OUT_OF_STOCK
            ).length;

            // console.log("Filtered OUT_OF_STOCK count:", counts[status]);
          } else {
            // Default behavior for other statuses
            counts[status] = data.length;
          }
        } catch (err) {
          counts[status] = 0;
        }
      })
    );
    setStatusCounts(counts);
  }, []);

  // Fetch inventory details for the selected status
  const fetchDetailsByStatus = useCallback(async (status) => {
    try {
      const { data } = await getInventoryDetailsByStatus(status);
      setFilteredData(data);
      setCurrentPage(1);
    } catch (err) {
      toast.error("Failed to load data.");
    }
  }, []);

  useEffect(() => {
    fetchStatusCounts();
  }, [fetchStatusCounts]);

  useEffect(() => {
    if (selectedStatus) {
      fetchDetailsByStatus(selectedStatus);
    }
  }, [selectedStatus, fetchDetailsByStatus]);

  const handleTagForPickUp = async (detail, quantity) => {
    try {
      await tagInventoryForPickUp(detail.product._id, quantity);
      toast.success("Product tagged for pick up!");
      await fetchDetailsByStatus(selectedStatus);
      await fetchStatusCounts();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to tag product.");
    }
  };

  // Filtered products
  const filteredBySearch = useMemo(() => {
    return filteredData.filter((item) => {
      const product = item.product || {};
      const searchableFields = ["name", "description", "sku"];

      return searchableFields.some((field) =>
        String(product[field] || "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
      );
    });
  }, [filteredData, searchTerm]);

  const handleItemsPerPageChange = useCallback((val) => {
    setItemsPerPage(val);
    setCurrentPage(1);
  }, []);

  return (
    <>
      <Navpath levelOne="Trackings" levelTwo="Home" levelThree="Trackings" />
      <section className="content">
        <div className="container-fluid">
          <div className="row">
            {Object.entries(StatusEnum).map(([key, value]) => (
              <div className="col-lg-3 col-6" key={key}>
                <div
                  className={`small-box bg-${statusColorMap[value]}`}
                  style={{ cursor: "pointer" }}
                  onClick={() => setSelectedStatus(value)}
                >
                  <div className="inner">
                    <h3>{statusCounts[value] || 0}</h3>
                    <p>{value}</p>
                  </div>
                  <div className="icon">
                    <i className={statusIconMap[value]}></i>
                  </div>
                  <div className="small-box-footer text-white">
                    Click to view <i className="fas fa-arrow-circle-right"></i>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {selectedStatus && (
            <>
              <SearchBar
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                itemsPerPage={itemsPerPage}
                onItemsPerPageChange={handleItemsPerPageChange}
              />

              <TrackingsTable
                products={paginatedItems}
                selectedStatus={selectedStatus}
                refreshData={() => fetchDetailsByStatus(selectedStatus)}
                onTagForPickUp={handleTagForPickUp}
                statusColorMap={statusColorMap}
              />

              <PaginationControls
                data={filteredBySearch}
                currentPage={currentPage}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
                onPaginatedDataChange={setPaginatedItems}
              />
            </>
          )}
        </div>
      </section>
    </>
  );
};

export default TrackingsPage;
