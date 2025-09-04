import { startDailyBackupJob } from "./dailyBackup.js";

export const startCronJobs = () => {
  startDailyBackupJob();
};
