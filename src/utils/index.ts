import { formatDistance } from "date-fns";
import { format, toZonedTime } from "date-fns-tz";

interface Event {
  title: string;
  description: string;
  start: string;
  end: string;
  url_go: string;
  subevent_parent_expanded?: {
    timezone: string;
  } | null;
}

export function formatEventMessage(events: Event[]): string {
  if (events.length === 0) {
    return "No upcoming events scheduled for MegaZu. Stay tuned! 🎯";
  }

  let message = "🎉 *Upcoming MegaZu Events* 🎉\n\n";
  const timezone = "America/New_York";

  events.forEach((event, index) => {
    // Convert UTC ISO strings to timezone
    const startDate = toZonedTime(event.start, timezone);
    const endDate = toZonedTime(event.end, timezone);

    // Calculate time until using UTC date for correct difference
    const timeUntil = formatDistance(new Date(event.start), new Date(), {
      addSuffix: true,
    });

    message += `*${index + 1}. ${event.title}*\n`;
    message += `📅 ${format(startDate, "MMM d, yyyy", { timeZone: timezone })}\n`;
    message += `⏰ ${format(startDate, "hh:mm aa", { timeZone: timezone })} - ${format(endDate, "hh:mm aa", { timeZone: timezone })}\n`;
    message += `🕐 Starts ${timeUntil}\n`;

    if (event.description) {
      const truncatedDesc =
        event.description.length > 100
          ? event.description.substring(0, 97) + "..."
          : event.description;
      message += `📝 ${truncatedDesc}\n`;
    }

    message += `🔗 [Join Event](${event.url_go})\n\n`;
  });

  message += "\nUse /help to learn more about MegaZu events! 🚀";
  return message;
}