var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import express from "express";
import dotenv from "dotenv";
import { Telegraf } from "telegraf";
import { handleTodayEvents, handleTomorrowEvents, handleUpcomingEvents, } from "./services/lemonade.js";
dotenv.config();
const app = express();
const port = process.env.PORT || 3000;
// Constants
export const MEGA_ZU_EVENT_ID = "6715e00b4076387d98cadd87";
// Initialize Telegram bot
const bot = new Telegraf(process.env.BOT_TOKEN);
// Bot commands with Lulu's personality
bot.command("start", (ctx) => {
    ctx.reply("🍋 Heyyy! I'm Lulu the Lemon, your zesty friend from Lemonade Social! Ready to make your MegaZu experience extra sweet?\n\n" +
        "Here's how you can squeeze the most out of me:\n\n" +
        "🌟 /upcoming - Get a peek at all the juicy events coming up!\n" +
        "🎯 /today - See what's fresh and happening today\n" +
        "🔮 /tomorrow - Sneak a taste of tomorrow's lineup\n" +
        "❓ /help - Need more juice? I got you!\n\n" +
        "Let's make some sweet lemonade together! 🎉");
});
bot.command("help", (ctx) => {
    ctx.reply("🍋 Lulu's Command Menu - Fresh Squeezed Just for You! 🍋\n\n" +
        "🌟 /upcoming - All the zesty events on the horizon\n" +
        "🎯 /today - Today's fresh batch of happenings\n" +
        "🔮 /tomorrow - Tomorrow's sweet lineup\n" +
        "🎉 /start - Reset our friendship (but why would you want to?)\n" +
        "❓ /help - You're already here, you clever lemon! 🍋\n\n" +
        "Made with 💖 by your friends at Lemonade Social");
});
bot.command("upcoming", handleUpcomingEvents);
bot.command("today", handleTodayEvents);
bot.command("tomorrow", handleTomorrowEvents);
// Start server and bot with Lulu's personality
function startApp() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Start Express server
            app.listen(port, () => {
                console.log("🍋 Lulu's juice bar is open at http://localhost:" + port);
                console.log("🍋 Get fresh events at http://localhost:" + port + "/hosting-events");
            });
            // Start Telegram bot
            yield bot.launch();
            console.log("🍋 Lulu the Lemon is awake and ready to serve some zesty events!");
            // Enable graceful stop
            process.once("SIGINT", () => {
                console.log("🍋 Lulu's taking a quick nap! See you soon!");
                bot.stop("SIGINT");
            });
            process.once("SIGTERM", () => {
                console.log("🍋 Lulu's heading to bed! Catch you on the flip side!");
                bot.stop("SIGTERM");
            });
        }
        catch (error) {
            console.error("🍋 Oh no! Lulu stumbled:", error);
            process.exit(1);
        }
    });
}
startApp();
