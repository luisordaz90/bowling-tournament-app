import { NextResponse } from 'next/server';
import { auth0 } from '../../../../lib/auth0';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { token } = await auth0.getAccessToken();
    return NextResponse.json({ accessToken: token });
  } catch {
    return NextResponse.json({ accessToken: null }, { status: 401 });
  }
}
