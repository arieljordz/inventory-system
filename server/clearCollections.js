import { MongoClient } from "mongodb";
import dotenv from "dotenv";
import readline from "readline";

dotenv.config();

const CLEAR_URI = process.env.CLEAR_URI;

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Prompt for yes/no confirmation
async function askConfirmation(message) {
  return new Promise((resolve) => {
    rl.question(`${message} (yes/no): `, (answer) => {
      resolve(answer.toLowerCase() === "yes");
    });
  });
}

// Prompt to select collections to clear
async function selectCollections(allCollections) {
  console.log("\nAvailable collections:");
  allCollections.forEach((c, idx) => console.log(`${idx + 1}. ${c}`));

  return new Promise((resolve) => {
    rl.question(
      "\nEnter collection numbers to clear (comma separated) or 'all': ",
      (answer) => {
        let selected = [];
        if (answer.toLowerCase() === "all") {
          selected = allCollections;
        } else {
          selected = answer
            .split(",")
            .map((x) => parseInt(x.trim()) - 1)
            .filter((i) => i >= 0 && i < allCollections.length)
            .map((i) => allCollections[i]);
        }
        resolve(selected);
      }
    );
  });
}

async function clearCollections() {
  const client = new MongoClient(CLEAR_URI);

  try {
    await client.connect();
    const db = client.db();

    // List all collections
    const allCollections = [
      "auditlogs",
      "inventorydetails",
      "orders",
      "products",
      "items",
      "ItemMovements",
      // "users",
    ];

    const confirmed = await askConfirmation(
      `⚠️  Do you want to proceed with clearing collections?\nDatabase: ${CLEAR_URI}`
    );
    if (!confirmed) {
      console.log("Operation cancelled.");
      rl.close();
      return;
    }

    const selectedCollections = await selectCollections(allCollections);
    if (selectedCollections.length === 0) {
      console.log("No collections selected. Operation cancelled.");
      rl.close();
      return;
    }

    for (const name of selectedCollections) {
      const result = await db.collection(name).deleteMany({});
      console.log(`✅ Cleared ${result.deletedCount} documents from: ${name}`);
    }

    console.log("Selected collections cleared successfully.");
  } catch (err) {
    console.error("Error:", err.message);
  } finally {
    rl.close();
    await client.close();
  }
}

clearCollections();
