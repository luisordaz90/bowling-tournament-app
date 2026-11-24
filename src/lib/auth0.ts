import { Auth0Client } from "@auth0/nextjs-auth0/server"
import { NextResponse } from "next/server"
import * as jose from "jose"

const CLAIMS_NAMESPACE = 'https://bowling-tournament-api.com';

export const auth0 = new Auth0Client({
  authorizationParameters: {
    audience: process.env.AUTH0_AUDIENCE,
    scope: 'openid profile email offline_access',
  },

  async beforeSessionSaved(session) {
    // Decode the access token to extract roles (without verification —
    // the SDK already verified it during the OAuth exchange).
    try {
      const accessToken = session.tokenSet.accessToken;
      if (accessToken) {
        const decoded = jose.decodeJwt(accessToken);
        const roles = (decoded[`${CLAIMS_NAMESPACE}/roles`] as string[]) || [];
        session.user.roles = roles;
      }
    } catch (err) {
      console.error('Failed to extract roles from access token:', err);
      session.user.roles = [];
    }
    return session;
  },

  async onCallback(error, context, session) {
    if (error) {
      console.error('Auth0 callback error:', error);
      return NextResponse.redirect(new URL('/auth/login', process.env.APP_BASE_URL));
    }
    return NextResponse.redirect(new URL('/', process.env.APP_BASE_URL));
  }
})
