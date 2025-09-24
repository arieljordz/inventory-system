import { useEffect, useState, useCallback } from "react";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import { useSpinner } from "../context/SpinnerContext";
import {
  getMonthlyWalkInStats,
  createWalkInTransaction,
} from "../services/walkInService";
import { getAllItems } from "../services/itemService";
import { useDebounce } from "../hooks/useDebounce";

export const useWalkInData = () => {
  const { showSpinner, hideSpinner } = useSpinner();

  // --- State ---
  const [items, setItems] = useState([]);
  const [cart, setCart] = useState([]);
  const [buyerName, setBuyerName] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 5;

  const debouncedSearch = useDebounce(search, 600);

  const [stats, setStats] = useState({
    totalSales: 0,
    transactionCount: 0,
    avgTransactionValue: 0,
    topSellingItem: { name: "", quantity: 0 },
  });

  // --- Fetch stats ---
  const fetchWalkInStats = useCallback(async () => {
    try {
      const res = await getMonthlyWalkInStats();
      setStats(res.data);
    } catch (error) {
      console.error("Fetch error:", error);
      setStats({
        totalSales: 0,
        transactionCount: 0,
        avgTransactionValue: 0,
        topSellingItem: { name: "", quantity: 0 },
      });
    }
  }, []);

  useEffect(() => {
    fetchWalkInStats();
  }, [fetchWalkInStats]);

  // --- Fetch items ---
  const loadItems = useCallback(async (searchTerm = "", pageNum = 1) => {
    try {
      setLoading(true);
      const res = await getAllItems({
        search: searchTerm,
        page: pageNum,
        limit,
      });
      setItems(res.data?.items || []);
      setTotalPages(res.data?.totalPages || 1);
      setPage(res.data?.currentPage || pageNum);
    } catch (err) {
      console.error("Failed to fetch items:", err);
      setItems([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadItems(debouncedSearch, page);
  }, [debouncedSearch, page, loadItems]);

  // --- Cart Handlers ---
  const addToCart = (item) => {
    if (cart.find((c) => c.itemId === item._id)) {
      toast.warning("Item already in cart");
      return;
    }
    if (item.quantity <= 0) {
      toast.error("Item is out of stock");
      return;
    }
    setCart([
      ...cart,
      {
        itemId: item._id,
        name: item.name,
        variant: item.variant || "",
        price: item.price,
        retailPrice: item.retailPrice,
        quantity: 1,
        stock: item.quantity,
      },
    ]);
  };

  const updateQuantity = (itemId, qty) => {
    setCart((prev) =>
      prev.map((c) => {
        if (c.itemId === itemId) {
          const newQty = Math.max(1, parseInt(qty, 10) || 1);
          if (newQty > c.stock) {
            toast.error(`Only ${c.stock} in stock`);
            return { ...c, quantity: c.stock };
          }
          return { ...c, quantity: newQty };
        }
        return c;
      })
    );
  };

  const removeFromCart = (itemId) => {
    setCart((prev) => prev.filter((c) => c.itemId !== itemId));
  };

  const totalAmount = cart.reduce(
    (sum, c) => sum + c.retailPrice * c.quantity,
    0
  );

  // --- Submit transaction with confirmation ---
  const handleSubmit = async () => {
    if (cart.length === 0) {
      toast.warning("No items selected");
      return;
    }

    const result = await Swal.fire({
      title: "Confirm Transaction",
      text: `Proceed with total amount ₱${totalAmount.toFixed(2)}?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, Confirm",
      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed) return;

    try {
      showSpinner();
      const payload = {
        buyerName: buyerName.trim() || "Walk-in Customer",
        paymentMethod,
        items: cart.map((c) => ({ itemId: c.itemId, quantity: c.quantity })),
      };
      await createWalkInTransaction(payload);
      toast.success("Walk-in transaction recorded!");
      setCart([]);
      setBuyerName("");
      setPaymentMethod("Cash");
      fetchWalkInStats(); // refresh stats
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Failed to record transaction"
      );
    } finally {
      hideSpinner();
    }
  };

  return {
    items,
    cart,
    buyerName,
    paymentMethod,
    loading,
    search,
    setSearch,
    page,
    totalPages,
    setPage,
    stats,
    addToCart,
    updateQuantity,
    removeFromCart,
    totalAmount,
    handleSubmit,
    setBuyerName,
    setPaymentMethod,
  };
};
