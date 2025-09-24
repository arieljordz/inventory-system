import React from "react";
import Navpath from "../../components/Navpath";
import ItemsTable from "./ItemsTable";
import CartTable from "./CartTable";
import InfoDashboard from "./InfoDashboard";
import { useWalkInData } from "../../hooks/useWalkInData";

const WalkInsPage = () => {
  const {
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
  } = useWalkInData();

  return (
    <>
      <Navpath
        levelOne="Walk-In Transactions"
        levelTwo="Home"
        levelThree="Walk-Ins"
      />

      <section className="content">
        <div className="container-fluid">
          {/* 🔹 Dashboard */}
          <InfoDashboard stats={stats} />

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
