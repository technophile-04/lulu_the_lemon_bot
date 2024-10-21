import express from "express";
import dotenv from "dotenv";
import { Telegraf } from "telegraf";
import { GraphQLClient, gql } from "graphql-request";
import cron from "node-cron";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// Initialize Telegram bot
const bot = new Telegraf(process.env.BOT_TOKEN!);

// Initialize GraphQL client
const client = new GraphQLClient(process.env.LEMONADE_API_URL!);

// In-memory storage for user subscriptions (replace with a database in production)
const userSubscriptions: { [chatId: string]: string } = {};

bot.command("start", (ctx) => {
  console.log("Starting the Lemonade bot!");
  ctx.reply(
    "Hey there, event enthusiast! 🎉🚀 I'm your Lemonade Event Reminder bot, here to keep you in the loop about awesome events! Here's how to stay updated:\n\n1️⃣ Use /notify <lemonade_user_id> to subscribe to a user's events\n2️⃣ I'll check for events daily and notify you about today's happenings\n3️⃣ Use /unsubscribe to stop notifications\n\nLet's make sure you never miss out on the fun! 🎈🥳",
    { reply_parameters: { message_id: ctx.message.message_id } },
  );
});

bot.command("notify", (ctx) => {
  const args = ctx.message.text.split(" ");
  if (args.length !== 2) {
    return ctx.reply("Oops! Please use the format: /notify <lemonade_user_id>");
  }
  const lemonadeUserId = args[1];
  const chatId = ctx.chat.id.toString();
  userSubscriptions[chatId] = lemonadeUserId;
  ctx.reply(
    `You're all set! 🎊 I'll notify you about events from user ${lemonadeUserId}. Get ready for some exciting updates! 🚀`,
  );
});

bot.command("unsubscribe", (ctx) => {
  const chatId = ctx.chat.id.toString();
  if (userSubscriptions[chatId]) {
    delete userSubscriptions[chatId];
    ctx.reply(
      "You've unsubscribed from event notifications. Feel free to subscribe again anytime! 👋",
    );
  } else {
    ctx.reply(
      "You're not currently subscribed to any notifications. Use /notify <lemonade_user_id> to subscribe!",
    );
  }
});

const GET_TODAY_EVENTS = gql`
  query GetTodayEvents($userId: ID!, $date: Date!) {
    events(userId: $userId, date: $date) {
      id
      title
      description
      startTime
    }
  }
`;

async function fetchTodayEvents(userId: string) {
  const today = new Date().toISOString().split("T")[0];
  try {
    const data = (await client.request(GET_TODAY_EVENTS, {
      userId,
      date: today,
    })) as any;
    return data.events;
  } catch (error) {
    console.error("Error fetching events:", error);
    return [];
  }
}

async function sendDailyNotifications() {
  for (const [chatId, userId] of Object.entries(userSubscriptions)) {
    try {
      const events = await fetchTodayEvents(userId);
      if (events.length > 0) {
        let message = `🎉 Today's Awesome Events! 🎉\n\n`;
        events.forEach((event: any) => {
          message += `🔸 ${event.title}\n   🕒 ${event.startTime}\n   📝 ${event.description}\n\n`;
        });
        bot.telegram.sendMessage(chatId, message);
      }
    } catch (error) {
      console.error(`Failed to fetch events for user ${userId}:`, error);
    }
  }
}

// Schedule daily notifications
cron.schedule("0 8 * * *", sendDailyNotifications);

// Express routes
app.get("/", (_req, res) => {
  res.send(
    "Lemonade Event Reminder bot is ready to keep you in the loop! 🍋🎉",
  );
});

// Start server and bot
async function startApp() {
  try {
    // Start Express server
    app.listen(port, () => {
      console.log(`Server is listening on port ${port} 💪`);
    });

    // Start Telegram bot
    await bot.launch();
    console.log("Lemonade bot is online and ready to spread the event hype!");

    // Enable graceful stop
    process.once("SIGINT", () => bot.stop("SIGINT"));
    process.once("SIGTERM", () => bot.stop("SIGTERM"));
  } catch (error) {
    console.error("Failed to start the application:", error);
    process.exit(1);
  }
}

startApp();
