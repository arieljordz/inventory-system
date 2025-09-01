import mongoose from "mongoose";
import Item from "./models/Item.js";
import ItemMovement from "./models/ItemMovement.js";

async function run() {
  const mongoUri = "mongodb://127.0.0.1:27017/inventory-db"; // replace if needed

  try {
    // Connect to MongoDB
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ MongoDB connected");

    // --- 1️⃣ Find items without movements ---
    const itemsWithoutMovement = await Item.aggregate([
      {
        $lookup: {
          from: "itemmovements", // make sure this matches your collection name
          localField: "_id",
          foreignField: "item",
          as: "movements",
        },
      },
      {
        $match: { movements: { $size: 0 } },
      },
    ]);

    console.log(`\n🟢 Items without movements (${itemsWithoutMovement.length}):`);
    itemsWithoutMovement.forEach((item) => console.log(item._id, item.name));

    // --- 2️⃣ Find items with duplicate movements ---
    const duplicateMovements = await ItemMovement.aggregate([
      {
        $group: {
          _id: "$item",
          count: { $sum: 1 },
        },
      },
      {
        $match: { count: { $gt: 1 } },
      },
      {
        $lookup: {
          from: "items",
          localField: "_id",
          foreignField: "_id",
          as: "itemDetails",
        },
      },
      { $unwind: "$itemDetails" },
    ]);

    console.log(`\n🔴 Items with duplicate movements (${duplicateMovements.length}):`);
    duplicateMovements.forEach((dup) =>
      console.log(dup._id, dup.itemDetails.name, "Movements:", dup.count)
    );
  } catch (err) {
    console.error("❌ Error:", err);
  } finally {
    await mongoose.connection.close();
    console.log("\n✅ MongoDB connection closed");
  }
}

run();
