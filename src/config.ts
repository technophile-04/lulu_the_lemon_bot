import dotenv from "dotenv";

dotenv.config();

export const lemonadeBackend =
  process.env.LEMONADE_BACKEND_SERVER_URL ||
  "https://backend.staging.lemonade.social/graphql/";
export const oauthServerUrl =
  process.env.OAUTH_SERVER_URL || "https://oauth2.staging.lemonade.social/";
export const oauthClientId = process.env.OAUTH_CLIENT_ID;
export const oauthClientSecret = process.env.OAUTH_CLIENT_SECRET;
export const oauthAudience = process.env.OAUTH_AUDIENCE;
