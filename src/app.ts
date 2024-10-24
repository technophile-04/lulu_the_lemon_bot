import express from "express";
import dotenv from "dotenv";
import { Telegraf } from "telegraf";
import {
  getMegaZuEvents,
  handleTodayEvents,
  handleTomorrowEvents,
} from "./services/lemonade.js";
import { formatEventMessage } from "./utils/index.js";

dotenv.config();
const app = express();
const port = process.env.PORT || 3000;

// Constants
export const MEGA_ZU_EVENT_ID = "6715e00b4076387d98cadd87";

// Initialize Telegram bot
const bot = new Telegraf(process.env.BOT_TOKEN!);

// Telegram bot command handler
async function handleUpcomingEvents(ctx: any) {
  try {
    const loadingMsg = await ctx.reply("Fetching upcoming events... 🔄");

    const events = await getMegaZuEvents();
    if (!events.success) throw new Error("Something went worng");

    const now = new Date();
    const megaZuEvents = events.data
      .filter((event) => {
        const eventStart = new Date(event.start);
        const isMegaZuSubevent = event.subevent_parent === MEGA_ZU_EVENT_ID;
        const isUpcoming = eventStart >= now;
        return isMegaZuSubevent && isUpcoming;
      })
      .sort(
        (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime(),
      );

    const formattedMessage = formatEventMessage(megaZuEvents);

    await ctx.telegram.deleteMessage(ctx.chat.id, loadingMsg.message_id);

    await ctx.replyWithMarkdownV2(
      formattedMessage.replace(/[.!{}[\]()>#+\-=|{},]/g, "\\$&"),
      {
        parse_mode: "MarkdownV2",
      },
    );
  } catch (error) {
    console.error("Error handling upcoming events:", error);
    await ctx.reply(
      "Oops! Had a little trouble fetching the events. Please try again in a moment! 🔄",
    );
  }
}

// Bot commands
bot.command("start", (ctx) => {
  ctx.reply(
    "Welcome to MegaZu Events Bot! 🎉\n\nUse these commands to check events:\n" +
      "/upcoming - See all upcoming events\n" +
      "/today - See today's events\n" +
      "/tomorrow - See tomorrow's events\n" +
      "/help - Show all available commands",
  );
});

bot.command("help", (ctx) => {
  ctx.reply(
    "Available commands:\n" +
      "/upcoming - See all upcoming MegaZu events\n" +
      "/today - See today's events\n" +
      "/tomorrow - See tomorrow's events\n" +
      "/start - Start the bot\n" +
      "/help - Show this help message",
  );
});

bot.command("upcoming", handleUpcomingEvents);
bot.command("today", handleTodayEvents);
bot.command("tomorrow", handleTomorrowEvents);

// Express routes
const asyncHandler = (fn: any) => (req: any, res: any, next: any) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

app.get(
  "/hosting-events",
  asyncHandler(async (req: any, res: any) => {
    try {
      const events = await getMegaZuEvents();

      res.json({
        success: true,
        data: events,
      });
    } catch (error: any) {
      console.error("Error fetching events:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Failed to fetch events",
      });
    }
  }),
);

// Error handling middleware
app.use((err: any, req: any, res: any, next: any) => {
  console.error("Global error:", err);
  res.status(500).json({
    success: false,
    error: err.message || "Internal server error",
  });
});

// Start server and bot
async function startApp() {
  try {
    // Start Express server
    app.listen(port, () => {
      console.log(`Server running at http://localhost:${port}`);
      console.log(`Try: http://localhost:${port}/hosting-events`);
    });

    // Start Telegram bot
    await bot.launch();
    console.log("Telegram bot is online!");

    // Enable graceful stop
    process.once("SIGINT", () => bot.stop("SIGINT"));
    process.once("SIGTERM", () => bot.stop("SIGTERM"));
  } catch (error) {
    console.error("Failed to start the application:", error);
    process.exit(1);
  }
}

startApp();
