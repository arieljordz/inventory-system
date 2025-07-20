import { useMemo } from "react";

const usePagination = ({ totalItems, itemsPerPage, currentPage }) => {
  return useMemo(() => {
    const totalPages = itemsPerPage === "All"
      ? 1
      : Math.ceil(totalItems / itemsPerPage);

    const indexOfLastItem =
      itemsPerPage === "All"
        ? totalItems
        : currentPage * itemsPerPage;

    const indexOfFirstItem =
      itemsPerPage === "All"
        ? 0
        : indexOfLastItem - itemsPerPage;

    return {
      totalPages,
      indexOfFirstItem,
      indexOfLastItem,
    };
  }, [totalItems, itemsPerPage, currentPage]);
};

export default usePagination;
