// backupCollections.js
import { MongoClient, ObjectId, Binary, Decimal128, Long, Double, Int32 } from "mongodb";
import fs from "fs";
import dotenv from "dotenv";
import readline from "readline";

dotenv.config();

const BACKUP_URI = process.env.BACKUP_URI;
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

function selectCollections(allCollections) {
  console.log("\nAvailable collections:");
  allCollections.forEach((c, idx) => console.log(`${idx + 1}. ${c}`));

  return new Promise((resolve) => {
    rl.question(
      "\nEnter collection numbers to backup (comma separated) or 'all': ",
      (answer) => {
        let selected = [];
        if (answer.toLowerCase() === "all") {
          selected = allCollections;
        } else {
          selected = answer
            .split(",")
            .map((x) => parseInt(x.trim(), 10) - 1)
            .filter((i) => i >= 0 && i < allCollections.length)
            .map((i) => allCollections[i]);
        }
        resolve(selected);
      }
    );
  });
}

function formatTimestampToDateTime(timestamp) {
  const date = new Date(timestamp);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");
  return `${month}${day}${year}_${hours}${minutes}${seconds}`;
}

/**
 * Recursively transform MongoDB values into Extended JSON format
 */
function transformToExtendedJSON(value) {
  if (value instanceof ObjectId) {
    return { $oid: value.toString() };
  }
  if (value instanceof Date) {
    return { $date: value.toISOString() };
  }
  if (value instanceof Int32) {
    return { $numberInt: value.toString() };
  }
  if (value instanceof Long) {
    return { $numberLong: value.toString() };
  }
  if (value instanceof Double) {
    return { $numberDouble: value.valueOf().toString() };
  }
  if (value instanceof Decimal128) {
    return { $numberDecimal: value.toString() };
  }
  if (value instanceof Binary) {
    return {
      $binary: {
        base64: value.buffer.toString("base64"),
        subType: value.sub_type.toString(16).padStart(2, "0"),
      },
    };
  }
  if (value instanceof RegExp) {
    return {
      $regex: {
        pattern: value.source,
        options: value.flags,
      },
    };
  }
  if (Array.isArray(value)) {
    return value.map(transformToExtendedJSON);
  }
  if (value && typeof value === "object") {
    const transformed = {};
    for (const key in value) {
      transformed[key] = transformToExtendedJSON(value[key]);
    }
    return transformed;
  }
  return value;
}

async function backupCollections() {
  const client = new MongoClient(BACKUP_URI);

  try {
    await client.connect();
    const db = client.db();

    const allCollections = await db.listCollections().toArray();
    const collectionNames = allCollections.map((c) => c.name);

    const confirmed = await askConfirmation(
      `⚠️  Do you want to proceed with backing up collections?\nBackup from: ${BACKUP_URI}`
    );
    if (!confirmed) {
      console.log("Backup cancelled.");
      rl.close();
      return;
    }

    const selectedCollections = await selectCollections(collectionNames);
    if (selectedCollections.length === 0) {
      console.log("No collections selected. Backup cancelled.");
      rl.close();
      return;
    }

    if (!fs.existsSync(BACKUP_DIR)) {
      fs.mkdirSync(BACKUP_DIR);
    }

    for (const name of selectedCollections) {
      const collection = db.collection(name);
      const documents = await collection.find({}).toArray();

      // Transform recursively into Extended JSON
      const transformedDocs = documents.map(transformToExtendedJSON);

      const filePath = `${BACKUP_DIR}/${name}_${formatTimestampToDateTime(
        Date.now()
      )}.json`;

      fs.writeFileSync(
        filePath,
        JSON.stringify(transformedDocs, null, 2),
        "utf-8"
      );

      console.log(
        `✅ Backed up ${documents.length} documents from ${name} to ${filePath}`
      );
    }

    console.log("\nAll selected collections backed up successfully!");
  } catch (err) {
    console.error("Error during backup:", err.message);
  } finally {
    rl.close();
    await client.close();
  }
}

backupCollections();
