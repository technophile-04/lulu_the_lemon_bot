import { getToken } from "../helpers/oauth.js";
import { query } from "../helpers/request.js";
import {
  type GetHostingEventsResponse,
  MEGA_ZU_EVENT_ID,
  getHostingEventsQuery,
} from "../helpers/api.js";
import { addDays, formatEventMessage, isSameDay } from "../utils/index.js";

export async function getMegaZuEvents() {
  const token = await getToken();
  const { getHostingEvents } = await query<GetHostingEventsResponse>(
    token,
    getHostingEventsQuery,
  );

  // Filter for MegaZu subevents and upcoming dates
  const now = new Date();
  const megaZuEvents = getHostingEvents.filter((event) => {
    const eventStart = new Date(event.start);
    const isMegaZuSubevent = event.subevent_parent === MEGA_ZU_EVENT_ID;
    const isUpcoming = eventStart >= now;
    return isMegaZuSubevent && isUpcoming;
  });

  // Sort by start date
  const sortedEvents = megaZuEvents.sort(
    (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime(),
  );

  return {
    success: true,
    data: sortedEvents,
  };
}

// Helper function to filter events by date
export function filterEventsByDate(events: any[], targetDate: Date) {
  return events
    .filter((event) => {
      const eventStart = new Date(event.start);
      const isMegaZuSubevent = event.subevent_parent === MEGA_ZU_EVENT_ID;
      return isMegaZuSubevent && isSameDay(eventStart, targetDate);
    })
    .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
}

export async function handleUpcomingEvents(ctx: any) {
  try {
    const loadingMsg = await ctx.reply("Fetching upcoming events... 🔄");
    const events = await getMegaZuEvents();
    if (!events.success) throw new Error("Something went wrong");

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

export async function handleTodayEvents(ctx: any) {
  try {
    const loadingMsg = await ctx.reply("Fetching today's events... 🔄");
    const events = await getMegaZuEvents();
    if (!events.success) throw new Error("Something went wrong");

    const today = new Date();
    const todayEvents = filterEventsByDate(events.data, today);

    const formattedMessage = formatEventMessage(todayEvents, "Today's");
    await ctx.telegram.deleteMessage(ctx.chat.id, loadingMsg.message_id);
    await ctx.replyWithMarkdownV2(
      formattedMessage.replace(/[.!{}[\]()>#+\-=|{},]/g, "\\$&"),
      {
        parse_mode: "MarkdownV2",
      },
    );
  } catch (error) {
    console.error("Error handling today's events:", error);
    await ctx.reply(
      "Oops! Had a little trouble fetching today's events. Please try again in a moment! 🔄",
    );
  }
}

export async function handleTomorrowEvents(ctx: any) {
  try {
    const loadingMsg = await ctx.reply("Fetching tomorrow's events... 🔄");
    const events = await getMegaZuEvents();
    if (!events.success) throw new Error("Something went wrong");

    const tomorrow = addDays(new Date(), 1);
    const tomorrowEvents = filterEventsByDate(events.data, tomorrow);

    const formattedMessage = formatEventMessage(tomorrowEvents, "Tomorrow's");
    await ctx.telegram.deleteMessage(ctx.chat.id, loadingMsg.message_id);
    await ctx.replyWithMarkdownV2(
      formattedMessage.replace(/[.!{}[\]()>#+\-=|{},]/g, "\\$&"),
      {
        parse_mode: "MarkdownV2",
      },
    );
  } catch (error) {
    console.error("Error handling tomorrow's events:", error);
    await ctx.reply(
      "Oops! Had a little trouble fetching tomorrow's events. Please try again in a moment! 🔄",
    );
  }
}
