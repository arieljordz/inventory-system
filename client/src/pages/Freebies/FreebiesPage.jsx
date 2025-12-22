import React from "react";
import Navpath from "../../components/Navpath";
import ItemsTable from "./ItemsTable";
import CartTable from "./CartTable";
import InfoDashboard from "./InfoDashboard";
import { useFreebiesData } from "../../hooks/useFreebiesData";

const FreebiesPage = () => {
  const {
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
  } = useFreebiesData();

  return (
    <>
      <Navpath
        levelOne="Freebies Transactions"
        levelTwo="Home"
        levelThree="Freebies"
      />

      <section className="content">
        <div className="container-fluid">
          {/* Dashboard Stats */}
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
                updateQuantity={updateQuantity}
                removeFromCart={removeFromCart}
                referenceAmount={referenceAmount}
                onConfirm={confirmFreebieTransaction}
              />
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default FreebiesPage;
