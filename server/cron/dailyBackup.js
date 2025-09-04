import cron from "node-cron";
import { backupCollections } from "../controllers/settingsController.js";

// Run every day at 2 AM
export const startDailyBackupJob = () => {
  cron.schedule("0 2 * * *", async () => {
    console.log("⏰ Running daily backup job...");
    try {
      // run backup for all collections
      await backupCollections(
        { body: { collections: ["all"] } }, 
        { json: (msg) => console.log("Backup result:", msg) }
      );
    } catch (err) {
      console.error("Daily backup failed:", err);
    }
  });
};
