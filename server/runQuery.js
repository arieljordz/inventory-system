import mongoose from "mongoose";
import Item from "./models/Item.js";
import ItemMovement from "./models/ItemMovement.js";

async function syncItemMovementPrices() {
  const mongoUri = "mongodb://127.0.0.1:27017/inventory-db"; // replace with your DB

  try {
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ MongoDB connected");

    // Fetch all item movements with the related item
    const movements = await ItemMovement.find().populate("item");

    console.log(`Found ${movements.length} item movements.`);

    let updatedCount = 0;

    for (const movement of movements) {
      if (!movement.item) continue; // skip if item reference is missing

      // Update price if different
      if (movement.price !== movement.item.price) {
        movement.price = movement.item.price;
        movement.totalValue = movement.quantity * movement.price; // recalc totalValue
        await movement.save();
        updatedCount++;
        console.log(`Updated movement ${movement._id} with new price: ${movement.price}`);
      }
    }

    console.log(`\n✅ Finished. Updated ${updatedCount} item movements.`);
  } catch (err) {
    console.error("❌ Error:", err);
  } finally {
    await mongoose.connection.close();
    console.log("✅ MongoDB connection closed");
  }
}

syncItemMovementPrices();
