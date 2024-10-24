import { gql } from "@apollo/client/core";

export const MEGA_ZU_EVENT_ID = "6715e00b4076387d98cadd87"; // MegaZu parent event ID

export const getHostingEventsQuery = gql`
  query {
    getHostingEvents {
      _id
      title
      description
      start
      end
      url_go
      slug
      cover
      new_photos {
        url
      }
      guest_limit
      guest_limit_per
      sessions {
        title
        start
        end
        _id
        broadcast
        description
      }
      subevent_parent
      subevent_parent_expanded {
        title
        timezone
        state
        start
      }
    }
  }
`;

export interface Event {
  __typename: string;
  _id: string;
  title: string;
  description: string;
  start: string;
  end: string;
  url_go: string;
  slug: string;
  cover: string | null;
  new_photos: { url: string }[];
  guest_limit: number | null;
  guest_limit_per: number | null;
  sessions: {
    title: string;
    start: string;
    end: string;
    _id: string;
    broadcast?: boolean;
    description?: string;
  }[];
  subevent_parent: string | null;
  subevent_parent_expanded: {
    title: string;
    timezone: string;
    state: string;
    start: string;
  } | null;
}

export interface GetHostingEventsResponse {
  getHostingEvents: Event[];
}
