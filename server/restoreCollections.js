// restoreCollections.js
import { MongoClient, ObjectId, Binary, Decimal128, Long, Double, Int32 } from "mongodb";
import fs from "fs";
import dotenv from "dotenv";
import readline from "readline";
import path from "path";

dotenv.config();

const RESTORE_URI = process.env.RESTORE_URI;
const BACKUP_DIR = "./backups";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function askConfirmation(message) {
  return new Promise((resolve) => {
    rl.question(`${message} (yes/no): `, (answer) => {
      resolve(answer.toLowerCase() === "yes");
    });
  });
}

async function selectBackupFiles() {
  const files = fs.readdirSync(BACKUP_DIR).filter((f) => f.endsWith(".json"));

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
            .map((x) => parseInt(x.trim(), 10) - 1)
            .filter((i) => i >= 0 && i < files.length)
            .map((i) => files[i]);
        }
        resolve(selected);
      }
    );
  });
}

// Reviver for MongoDB Extended JSON
function reviveDocument(doc) {
  if (Array.isArray(doc)) {
    return doc.map((item) => reviveDocument(item));
  } else if (doc && typeof doc === "object") {
    if (doc.$oid) return new ObjectId(doc.$oid);
    if (doc.$date) return new Date(doc.$date);
    if (doc.$numberInt) return new Int32(doc.$numberInt);
    if (doc.$numberLong) return Long.fromString(doc.$numberLong);
    if (doc.$numberDouble) return new Double(parseFloat(doc.$numberDouble));
    if (doc.$numberDecimal) return Decimal128.fromString(doc.$numberDecimal);
    if (doc.$binary)
      return new Binary(
        Buffer.from(doc.$binary.base64, "base64"),
        doc.$binary.subType || 0
      );
    if (doc.$regex) return new RegExp(doc.$regex.pattern, doc.$regex.options || "");

    const revived = {};
    for (const key in doc) {
      revived[key] = reviveDocument(doc[key]);
    }
    return revived;
  }
  return doc;
}

async function restoreCollections() {
  const client = new MongoClient(RESTORE_URI);

  try {
    const confirmed = await askConfirmation(
      `⚠️  Are you sure you want to restore collections? This will overwrite existing data.\nRestored to: ${RESTORE_URI}`
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
      const collectionName = file.split("_")[0]; // assumes: collectionname_timestamp.json
      const rawData = JSON.parse(fs.readFileSync(filePath, "utf-8"));

      const data = rawData.map((doc) => reviveDocument(doc));

      const collection = db.collection(collectionName);

      // Always overwrite
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
