import { MongoClient } from "mongodb";
import dotenv from "dotenv";
import readline from "readline";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

async function askConfirmation() {
  return new Promise((resolve) => {
    rl.question(
      "⚠️  Are you sure you want to clear all documents in the selected collections? (yes/no): ",
      (answer) => {
        resolve(answer.toLowerCase() === "yes");
      }
    );
  });
}

async function clearCollections() {
  const client = new MongoClient(MONGO_URI);

  try {
    const confirmed = await askConfirmation();
    if (!confirmed) {
      console.log("Operation cancelled.");
      rl.close();
      return;
    }

    await client.connect();
    const db = client.db();

    const collectionsToClear = [
      "auditlogs",
      "inventorydetails",
      "orders",
      "products",
      "users",
    ];

    for (const name of collectionsToClear) {
      const result = await db.collection(name).deleteMany({});
      console.log(`✅ Cleared ${result.deletedCount} documents from: ${name}`);
    }

    console.log("All selected collections cleared successfully.");
  } catch (err) {
    console.error("Error:", err.message);
  } finally {
    rl.close();
    await client.close();
  }
}

clearCollections();
