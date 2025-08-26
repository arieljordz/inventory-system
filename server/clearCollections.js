import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

async function clearCollections() {
  const client = new MongoClient(MONGO_URI);

  try {
    await client.connect();
    const db = client.db(); 

    const collectionsToClear = [
      'auditlogs',
      'inventorydetails',
      'orders',
      'products',
      'users',
    ];

    for (const name of collectionsToClear) {
      const result = await db.collection(name).deleteMany({});
      console.log(`Cleared ${result.deletedCount} documents from: ${name}`);
    }

  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await client.close();
  }
}

clearCollections();
