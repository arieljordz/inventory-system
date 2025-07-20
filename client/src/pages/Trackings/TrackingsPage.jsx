import React, { useEffect, useState } from "react";
import Navpath from "../../components/common/Navpath";
import SearchBar from "../../components/common/SearchBar";
import PaginationControls from "../../components/common/PaginationControls";
import TrackingsTable from "../../components/trackings/TrackingsTable";
import { getInventoryDetailsByStatus, tagInventoryForPickUp } from "../../services/inventoryDetailService";
import { StatusEnum } from "../../enums/enums";
import usePagination from "../../hooks/usePagination";
import { toast } from "react-toastify";

const statusIconMap = {
  [StatusEnum.AVAILABLE]: "ion ion-cube",
  [StatusEnum.FOR_PICK_UP]: "ion ion-log-out",
  [StatusEnum.TO_SHIP]: "ion ion-forward",
  [StatusEnum.SHIPPING]: "ion ion-android-bus",
  [StatusEnum.RETURNED]: "ion ion-refresh",
  [StatusEnum.DELIVERED]: "ion ion-checkmark",
  [StatusEnum.COMPLETED]: "ion ion-clipboard",
};

const statusColorMap = {
  [StatusEnum.AVAILABLE]: "info",
  [StatusEnum.FOR_PICK_UP]: "warning",
  [StatusEnum.TO_SHIP]: "primary",
  [StatusEnum.SHIPPING]: "success",
  [StatusEnum.RETURNED]: "danger",
  [StatusEnum.DELIVERED]: "secondary",
  [StatusEnum.COMPLETED]: "dark",
};

const TrackingsPage = () => {
  const [statusCounts, setStatusCounts] = useState({});
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [filteredData, setFilteredData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    const fetchStatusCounts = async () => {
      const counts = {};
      for (const status of Object.values(StatusEnum)) {
        try {
          const { data } = await getInventoryDetailsByStatus(status);
          counts[status] = data.length;
        } catch (err) {
          console.error(`Failed to fetch data for ${status}`, err);
          counts[status] = 0;
        }
      }
      setStatusCounts(counts);
    };

    fetchStatusCounts();
  }, []);

  useEffect(() => {
    if (!selectedStatus) return;

    const fetchDetails = async () => {
      try {
        const { data } = await getInventoryDetailsByStatus(selectedStatus);
        setFilteredData(data);
        setCurrentPage(1);
      } catch (err) {
        console.error("Error fetching selected status:", err);
        toast.error("Failed to load data.");
      }
    };

    fetchDetails();
  }, [selectedStatus]);

  const filteredBySearch = filteredData.filter(({ product }) => {
    const search = searchTerm.toLowerCase();
    return (
      product?.name?.toLowerCase().includes(search) ||
      product?.serialNumber?.toLowerCase().includes(search) ||
      product?.description?.toLowerCase().includes(search) ||
      product?.sku?.toLowerCase().includes(search)
    );
  });

  const totalItems = filteredBySearch.length;
  const { indexOfFirstItem, indexOfLastItem, totalPages } = usePagination({
    totalItems,
    itemsPerPage,
    currentPage,
  });

  const currentItems = filteredBySearch.slice(indexOfFirstItem, indexOfLastItem);

  const handleTagForPickUp = async (detail, quantity) => {
    try {
      await tagInventoryForPickUp(detail.product._id, quantity);
      toast.success("Product tagged for pick up!");
      setSelectedStatus((prev) => prev); // Re-trigger fetch
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to tag product.");
    }
  };

  return (
    <>
      <Navpath levelOne="Trackings" levelTwo="Home" levelThree="Trackings" />

      <section className="content">
        <div className="container-fluid">
          <div className="row">
            {Object.entries(StatusEnum).map(([key, value]) => {
              const count = statusCounts[value] || 0;
              const icon = statusIconMap[value];
              const color = statusColorMap[value];

              return (
                <div className="col-lg-3 col-6" key={key}>
                  <div
                    className={`small-box bg-${color}`}
                    style={{ cursor: "pointer" }}
                    onClick={() => setSelectedStatus(value)}
                  >
                    <div className="inner">
                      <h3>{count}</h3>
                      <p>{value}</p>
                    </div>
                    <div className="icon">
                      <i className={icon}></i>
                    </div>
                    <div className="small-box-footer text-white">
                      Click to view <i className="fas fa-arrow-circle-right"></i>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {selectedStatus && (
            <>
              <SearchBar
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                itemsPerPage={itemsPerPage}
                onItemsPerPageChange={(value) =>
                  setItemsPerPage(value === "All" ? filteredBySearch.length : Number(value))
                }
              />

              <TrackingsTable
                products={currentItems}
                selectedStatus={selectedStatus}
                refreshData={() => setSelectedStatus((prev) => prev)}
                onTagForPickUp={handleTagForPickUp}
              />

              <PaginationControls
                currentPage={currentPage}
                totalPages={totalPages}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
                onItemsPerPageChange={setItemsPerPage}
              />
            </>
          )}
        </div>
      </section>
    </>
  );
};

export default TrackingsPage;
