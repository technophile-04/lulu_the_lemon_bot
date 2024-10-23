import { getToken } from "../helpers/oauth.js";
import { query } from "../helpers/request.js";
import {
  type GetHostingEventsResponse,
  getHostingEventsQuery,
} from "../helpers/api.js";

export async function getHostingEvents(
  opts: { skip?: number; limit?: number } = { skip: 0, limit: 10 },
) {
  const token = await getToken();
  const { getHostingEvents } = await query<GetHostingEventsResponse>(
    token,
    getHostingEventsQuery,
    {
      ...opts,
    },
  );
  return getHostingEvents;
}
