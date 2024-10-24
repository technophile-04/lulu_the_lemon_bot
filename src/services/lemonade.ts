import { getToken } from "../helpers/oauth.js";
import { query } from "../helpers/request.js";
import {
  type GetHostingEventsResponse,
  MEGA_ZU_EVENT_ID,
  getHostingEventsQuery,
} from "../helpers/api.js";

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
