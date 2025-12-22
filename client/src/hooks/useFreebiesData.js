import { useEffect, useState, useCallback } from "react";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import { useSpinner } from "../context/SpinnerContext";
import {
  getMonthlyFreebiesStats,
  createFreebiesTransaction,
} from "../services/freebiesService";
import { getAllItems } from "../services/itemService";
import { useDebounce } from "./useDebounce";

const DEFAULT_STATS = {
  transactionCount: 0,
  totalReferenceValue: 0,
  avgTransactionValue: 0,
  topSellingItem: { name: "", quantity: 0 },
};

export const useFreebiesData = () => {
  const { showSpinner, hideSpinner } = useSpinner();

  // --- UI state ---
  const [items, setItems] = useState([]);
  const [cart, setCart] = useState([]);
  const [buyerName, setBuyerName] = useState("");
  const [loading, setLoading] = useState(false);

  // --- Pagination & search ---
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 5;
  const debouncedSearch = useDebounce(search, 600);

  // --- Dashboard stats ---
  const [stats, setStats] = useState(DEFAULT_STATS);

  /* -------------------- FETCH STATS -------------------- */
  const fetchStats = useCallback(async () => {
    try {
      const res = await getMonthlyFreebiesStats();
      setStats(res.data);
    } catch {
      setStats(DEFAULT_STATS);
    }
  }, []);

  /* -------------------- LOAD ITEMS -------------------- */
  const loadItems = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getAllItems({
        search: debouncedSearch,
        page,
        limit,
      });
      setItems(res.data?.items || []);
      setTotalPages(res.data?.totalPages || 1);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, page]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  /* -------------------- CART LOGIC -------------------- */
  const addToCart = (item) => {
    if (item.quantity <= 0) return toast.error("Item is out of stock");
    if (cart.some((c) => c.itemId === item._id))
      return toast.warning("Item already in cart");

    setCart((prev) => [
      ...prev,
      {
        itemId: item._id,
        name: item.name,
        variant: item.variant || "",
        retailPrice: item.retailPrice, // reference only
        quantity: 1,
        stock: item.quantity,
      },
    ]);
  };

  const updateQuantity = (itemId, qty) => {
    setCart((prev) =>
      prev.map((c) => {
        if (c.itemId !== itemId) return c;
        const value = Math.max(1, Number(qty) || 1);
        return value > c.stock
          ? (toast.error(`Only ${c.stock} in stock`), { ...c, quantity: c.stock })
          : { ...c, quantity: value };
      })
    );
  };

  const removeFromCart = (itemId) =>
    setCart((prev) => prev.filter((c) => c.itemId !== itemId));

  // Reference value only (display)
  const referenceAmount = cart.reduce(
    (sum, c) => sum + c.retailPrice * c.quantity,
    0
  );

  /* -------------------- SUBMIT FREEBIE -------------------- */
  const confirmFreebieTransaction = async () => {
    if (!cart.length) return toast.warning("No items selected");

    const { isConfirmed } = await Swal.fire({
      title: "Confirm Freebie Transaction",
      html: `
        <p>This transaction will be recorded as <b>FREE</b>.</p>
        <p>Reference value: <b>₱${referenceAmount.toFixed(2)}</b></p>
      `,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, Mark as Free",
    });

    if (!isConfirmed) return;

    try {
      showSpinner();
      await createFreebiesTransaction({
        buyerName: buyerName.trim() || "Freebies Customer",
        items: cart.map(({ itemId, quantity }) => ({ itemId, quantity })),
      });

      toast.success("Freebie transaction recorded");
      setCart([]);
      setBuyerName("");
      fetchStats();
    } catch (err) {
      toast.error(err.response?.data?.message || "Transaction failed");
    } finally {
      hideSpinner();
    }
  };

  return {
    // data
    items,
    cart,
    stats,
    loading,

    // ui state
    buyerName,
    setBuyerName,
    search,
    setSearch,
    page,
    setPage,
    totalPages,

    // actions
    addToCart,
    updateQuantity,
    removeFromCart,
    confirmFreebieTransaction,

    // display
    referenceAmount,
  };
};
