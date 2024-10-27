import { formatDistance } from "date-fns";
import { format, toZonedTime } from "date-fns-tz";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

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

// Fun intros for different timeframes
const INTRO_MESSAGES = {
  Today: [
    "🍋 Yo fam! Lulu the Lemon here with today's juicy lineup! Get ready to squeeze the day!",
    "🍋 What's poppin' MegaZu? Your favorite citrus bringing you today's zesty schedule!",
    "🍋 Hey party people! Lulu here to make your day extra sweet and sour!",
  ],
  Tomorrow: [
    "🍋 Future check! Your boy Lulu here with tomorrow's spicy agenda!",
    "🍋 Peek into tomorrow with your favorite lemon! Trust me, it's gonna be zesty!",
    "🍋 Tomorrow's looking extra juicy! Let your favorite citrus guide you through it!",
  ],
  Upcoming: [
    "🍋 Lulu the Lemon in the house! Let me squeeze out these upcoming bangers for you!",
    "🍋 Sup MegaZu fam! Your favorite fruit dropping some future heat!",
    "🍋 Ready to get zesty? Lulu's got the freshest lineup coming your way!",
  ],
};

async function summarizeDescription(description: string): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You are Lulu the Lemon bot - playful, sarcastic, and full of citrus-related puns. 
          Summarize the following event description in a fun, engaging way. Keep it short (max 100 chars) 
          and add some personality. Use emojis sparingly. Don't use the word "event".`,
        },
        {
          role: "user",
          content: description,
        },
      ],
      max_tokens: 100,
      temperature: 0.7,
    });

    return response.choices[0]?.message?.content || description;
  } catch (error) {
    console.error("Error summarizing description:", error);
    return description;
  }
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

export async function formatEventMessage(
  events: Event[],
  timeframe: string = "Upcoming",
): Promise<string> {
  if (events.length === 0) {
    return `🍋 Aww snap! No ${timeframe.toLowerCase()} plans yet! Don't worry fam, your boy Lulu will keep you posted when the juice starts flowing! 🎯`;
  }

  const intros =
    INTRO_MESSAGES[timeframe as keyof typeof INTRO_MESSAGES] ||
    INTRO_MESSAGES.Upcoming;
  const randomIntro = intros[Math.floor(Math.random() * intros.length)];
  let message = `${randomIntro}\n\n`;

  // Use Asia/Bangkok timezone as specified in the event data
  const timezone = "Asia/Bangkok";

  for (let i = 0; i < events.length; i++) {
    const event = events[i];

    // Convert UTC dates to Bangkok time
    const startDate = toZonedTime(new Date(event.start), timezone);
    const endDate = toZonedTime(new Date(event.end), timezone);

    message += `*${i + 1}. ${event.title}*\n`;
    message += `📅 ${format(startDate, "MMM d, yyyy", { timeZone: timezone })}\n`;
    message += `⏰ ${format(startDate, "HH:mm", { timeZone: timezone })} - ${format(endDate, "HH:mm", { timeZone: timezone })} (Bangkok Time)\n`;

    if (event.description) {
      const summary = await summarizeDescription(event.description);
      message += `📝 ${summary}\n`;
    }
    message += "\n";

    if (event.url_go) {
      message += `🔗 ${event.url_go}\n`;
    }
    message += "\n";
  }

  const closingMessages = [
    "Stay fresh, stay zesty! 🍋",
    "Time to make lemonade! 🍋",
    "Catch you on the flip side, you absolute legends! 🍋",
    "Let's squeeze the day! 🍋",
    "Keep it juicy, fam! 🍋",
  ];

  message +=
    closingMessages[Math.floor(Math.random() * closingMessages.length)];
  return message.trim();
}
