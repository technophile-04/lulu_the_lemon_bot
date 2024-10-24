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

export function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export function formatEventMessage(
  events: Event[],
  timeframe: string = "Upcoming",
): string {
  if (events.length === 0) {
    return `No ${timeframe.toLowerCase()} events scheduled for MegaZu. Stay tuned! 🎯`;
  }

  let message = `🎉 ${timeframe} MegaZu Events 🎉\n\n`;
  const timezone = "America/New_York";

  events.forEach((event, index) => {
    // Convert UTC ISO strings to timezone
    const startDate = toZonedTime(event.start, timezone);
    const endDate = toZonedTime(event.end, timezone);

    message += `*${index + 1}. ${event.title}*\n`;
    message += `📅 ${format(startDate, "MMM d, yyyy", { timeZone: timezone })}\n`;
    message += `⏰ ${format(startDate, "hh:mm aa", { timeZone: timezone })} - ${format(endDate, "hh:mm aa", { timeZone: timezone })}\n`;

    if (event.description) {
      const truncatedDesc =
        event.description.length > 100
          ? event.description.substring(0, 97) + "..."
          : event.description;
      message += `📝 ${truncatedDesc}\n`;
    }

    // Add URL as plain text instead of markdown link
    if (event.url_go) {
      message += `🔗 ${event.url_go}\n`;
    }

    message += "\n";
  });

  // Removed the help command line
  return message.trim();
}
