import React, { useEffect, useState, useCallback } from "react";
import { toast } from "react-toastify";
import { useSpinner } from "../../context/SpinnerContext";
import Navpath from "../../components/Navpath";
import { createWalkInTransaction } from "../../services/walkInService";
import { getAllItems } from "../../services/itemService";
import { useDebounce } from "../../hooks/useDebounce";
import ItemsTable from "./ItemsTable";
import CartTable from "./CartTable";

const WalkInsPage = () => {
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

  const totalAmount = cart.reduce((sum, c) => sum + c.retailPrice * c.quantity, 0);

  // --- Submit transaction ---
  const handleSubmit = async () => {
    if (cart.length === 0) {
      toast.warning("No items selected");
      return;
    }
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
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Failed to record transaction"
      );
    } finally {
      hideSpinner();
    }
  };

  return (
    <>
      <Navpath
        levelOne="Walk-In Transactions"
        levelTwo="Walk-Ins"
        levelThree="Walk-Ins"
      />

      <section className="content">
        <div className="container-fluid">
          <div className="row">
            {/* Items */}
            <div className="col-12 col-md-6 mb-3">
              <ItemsTable
                items={items}
                loading={loading}
                search={search}
                setSearch={setSearch}
                page={page}
                totalPages={totalPages}
                setPage={setPage}
                addToCart={addToCart}
              />
            </div>

            {/* Cart */}
            <div className="col-12 col-md-6 mb-3">
              <CartTable
                cart={cart}
                buyerName={buyerName}
                setBuyerName={setBuyerName}
                paymentMethod={paymentMethod}
                setPaymentMethod={setPaymentMethod}
                updateQuantity={updateQuantity}
                removeFromCart={removeFromCart}
                totalAmount={totalAmount}
                handleSubmit={handleSubmit}
              />
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default WalkInsPage;
