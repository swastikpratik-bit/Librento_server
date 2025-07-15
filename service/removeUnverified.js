import cron from "node-cron";
import { User } from "../models/userModel.js";

export const removeUnverified = () => {
  cron.schedule("*/5 * * * *", async () => {
    const halfAnHourAgo = new Date(Date.now() - 30 * 60 * 1000);
    await User.deleteMany({
      accountVerified: false,
      createdAt: { $lt: halfAnHourAgo },
    });
  });
};
