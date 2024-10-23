import { type TokenSet, type Client, Issuer } from "openid-client";
import * as assert from "assert";
import {
  oauthAudience,
  oauthClientId,
  oauthClientSecret,
  oauthServerUrl,
} from "../config.js";

let issuer: Issuer | undefined;
let client: Client;
let tokenSet: TokenSet | undefined;

export async function getToken() {
  if (
    !tokenSet?.access_token ||
    !tokenSet.expires_at ||
    tokenSet.expires_at < Date.now()
  ) {
    if (!issuer) {
      issuer = await Issuer.discover(oauthServerUrl);
    }
    assert.ok(oauthClientId && oauthClientSecret);
    if (!client) {
      client = new issuer.Client({
        client_id: oauthClientId,
        client_secret: oauthClientSecret,
        token_endpoint_auth_method: "client_secret_post",
      });
    }
    tokenSet = await client.grant({
      grant_type: "client_credentials",
      scope: ["audience"],
      audience: [oauthAudience],
    });
  }
  assert.ok(tokenSet.access_token);
  return tokenSet.access_token;
}
