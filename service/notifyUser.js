import cron from "node-cron";
import { Borrow } from "../models/borrowModel.js";
import { sendEmail } from "../utils/sendEmail.js";

export const notifyUser = () => {
  cron.schedule("* */30 * * * *", async () => {
    try {
      const lastDay = new Date() - 24 * 60 * 60 * 1000;
      const borrows = await Borrow.find({
        dueDate: { $lt: lastDay },
        returnDate: null,
        notified: false,
      });

      borrows.forEach(async (borrow) => {
        await sendEmail({
          email: borrow.user.email,
          subject: "Book Return Reminder",
          message: `
                <div style="font-family: Arial, sans-serif; line-height: 1.6;">
                    <p>Dear ${borrow.user.name},</p>
                    <p>This is a friendly reminder that you have a book due to be returned.</p>
                    <p><strong>Due Date:</strong> ${borrow.dueDate}</p>
                    <p>Please return it on time to avoid any late fees.</p>
                    <p>Thank you,<br/>Team Librento</p>
                </div>
            `,
        });
        console.log("email sent");
        borrow.notified = true;
        await borrow.save();
      });
    } catch (error) {
      console.error("error in notify user :", error);
    }
  });
};
