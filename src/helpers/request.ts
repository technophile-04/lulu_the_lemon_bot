import {
  type DocumentNode,
  ApolloClient,
  InMemoryCache,
} from "@apollo/client/core";
import { lemonadeBackend } from "../config.js";

const gqlClient = new ApolloClient({
  uri: lemonadeBackend,
  cache: new InMemoryCache(),
});

const getContextFromToken = (token: string) => ({
  headers: { authorization: `Bearer ${token}` },
});

export async function query<T>(
  token: string,
  q: DocumentNode,
  variables: Record<string, unknown> = {},
) {
  const res = await gqlClient.query({
    query: q,
    variables,
    context: getContextFromToken(token),
  });
  return res.data as T;
}
