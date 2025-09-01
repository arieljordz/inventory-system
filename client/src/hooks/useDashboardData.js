// src/hooks/useDashboardData.js
import { useState, useEffect } from "react";
import { subDays, format } from "date-fns";

// Helper to generate random number in range
const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

export const useMockInventoryData = (days = 30) => {
  const [inventoryData, setInventoryData] = useState([]);
  const [orderData, setOrderData] = useState([]);

  useEffect(() => {
    const mockInventory = [];
    const mockOrders = [];

    const productList = ["Product A", "Product B", "Product C", "Product D"];

    for (let i = days; i >= 0; i--) {
      const date = subDays(new Date(), i);
      const formattedDate = format(date, "yyyy-MM-dd");

      // Generate 1-3 inventory movements per day
      const movementsPerDay = randomInt(1, 3);
      for (let j = 0; j < movementsPerDay; j++) {
        const product = productList[randomInt(0, productList.length - 1)];
        const movementType = Math.random() > 0.5 ? "IN" : "OUT";
        const quantity = randomInt(1, 20);
        const price = randomInt(50, 200);

        mockInventory.push({
          _id: `${i}-${j}`,
          product: { _id: product, name: product },
          movementType,
          quantity,
          price,
          createdAt: formattedDate,
        });
      }

      // Generate 0-2 orders per day
      const ordersPerDay = randomInt(0, 2);
      for (let k = 0; k < ordersPerDay; k++) {
        const product = productList[randomInt(0, productList.length - 1)];
        const statuses = ["ON_PROCESS", "COMPLETED", "CANCELLED"];
        const status = statuses[randomInt(0, statuses.length - 1)];

        mockOrders.push({
          _id: `${i}-${k}`,
          product: { _id: product, name: product },
          quantity: randomInt(1, 5),
          status,
          createdAt: formattedDate,
        });
      }
    }

    setInventoryData(mockInventory);
    setOrderData(mockOrders);
  }, [days]);

  return { inventoryData, orderData };
};
