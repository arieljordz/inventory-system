import { MongoClient } from "mongodb";
import fs from "fs";
import dotenv from "dotenv";
import readline from "readline";
import path from "path";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;
const BACKUP_DIR = "./backups"; // folder where backups are stored

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

async function askConfirmation(message) {
  return new Promise((resolve) => {
    rl.question(`${message} (yes/no): `, (answer) => {
      resolve(answer.toLowerCase() === "yes");
    });
  });
}

async function selectBackupFiles() {
  const files = fs
    .readdirSync(BACKUP_DIR)
    .filter((f) => f.endsWith(".json"));

  if (files.length === 0) {
    console.log("No JSON backup files found.");
    return [];
  }

  console.log("\nAvailable backup files:");
  files.forEach((f, idx) => console.log(`${idx + 1}. ${f}`));

  return new Promise((resolve) => {
    rl.question(
      "\nEnter backup numbers to restore (comma separated) or 'all': ",
      (answer) => {
        let selected = [];
        if (answer.toLowerCase() === "all") {
          selected = files;
        } else {
          selected = answer
            .split(",")
            .map((x) => parseInt(x.trim()) - 1)
            .filter((i) => i >= 0 && i < files.length)
            .map((i) => files[i]);
        }
        resolve(selected);
      }
    );
  });
}

async function restoreCollections() {
  const client = new MongoClient(MONGO_URI);

  try {
    const confirmed = await askConfirmation(
      "⚠️  Are you sure you want to restore collections? This will overwrite existing data."
    );
    if (!confirmed) {
      console.log("Restore cancelled.");
      rl.close();
      return;
    }

    const backupFiles = await selectBackupFiles();
    if (backupFiles.length === 0) {
      console.log("No backup files selected. Restore cancelled.");
      rl.close();
      return;
    }

    await client.connect();
    const db = client.db();

    for (const file of backupFiles) {
      const filePath = path.join(BACKUP_DIR, file);
      const collectionName = file.split("_")[0]; // assumes format: collectionname_timestamp.json
      const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));

      // Confirm before wiping existing collection
      const overwrite = await askConfirmation(
        `Do you want to overwrite the collection '${collectionName}'?`
      );
      if (!overwrite) {
        console.log(`Skipped restoring collection: ${collectionName}`);
        continue;
      }

      const collection = db.collection(collectionName);

      // Clear existing documents
      await collection.deleteMany({});
      if (data.length > 0) {
        await collection.insertMany(data);
      }

      console.log(`✅ Restored ${data.length} documents into ${collectionName}`);
    }

    console.log("\nAll selected collections restored successfully!");
  } catch (err) {
    console.error("Error during restore:", err.message);
  } finally {
    rl.close();
    await client.close();
  }
}

restoreCollections();
