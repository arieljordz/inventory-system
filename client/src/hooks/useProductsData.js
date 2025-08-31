// src/hooks/useProductsData.js
import { useState, useEffect, useCallback } from "react";
import { getProducts } from "../services/productService";
import { useDebounce } from "./useDebounce";

export const useProductsData = (initialItemsPerPage = 5) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 800);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(initialItemsPerPage);
  const [totalItems, setTotalItems] = useState(0);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await getProducts({
        page: currentPage,
        limit: itemsPerPage,
        search: debouncedSearchTerm,
      });

      // console.log("Fetched products data:", data);
      setProducts(data.products || []);
      setTotalItems(data.totalProducts || 0);

      if (currentPage > data.totalPages && data.totalPages > 0) {
        setCurrentPage(data.totalPages);
      }
    } catch (err) {
      console.error("Fetch products failed:", err);
      setProducts([]);
      setTotalItems(0);
    } finally {
      setLoading(false);
    }
  }, [currentPage, itemsPerPage, debouncedSearchTerm]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    if (currentPage !== 1) setCurrentPage(1);
  }, [debouncedSearchTerm]);

  return {
    products,
    loading,
    searchTerm,
    setSearchTerm,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    setItemsPerPage,
    totalItems,
    fetchProducts,
  };
};
