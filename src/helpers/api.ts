import { gql } from "@apollo/client/core";

export const getHostingEventsQuery = gql(`
  query($skip: Int!, $limit: Int!) {
    getHostingEvents(skip: $skip, limit: $limit) {
      _id,
      title,
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
      subevent_parent_expanded {
        title
        timezone
        state
        start
      }
    }
  }
`);

// TODO: Update the return type inline with the query
export interface GetHostingEventsResponse {
  getHostingEvents: Array<{
    _id: string;
    name: string;
    description: string;
    start_time: string;
    end_time: string;
  }>;
}
