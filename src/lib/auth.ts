import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!);
const COOKIE_NAME = 'auth-session';
const SESSION_DURATION = 60 * 24 * 60 * 60; // 60 days

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

interface Session {
  appId: string;
  iat: number;
}

interface MagicLinkData {
  appId: string;
}

// JWT functions
export async function createSession(appId: string): Promise<string> {
  return await new SignJWT({ appId, iat: Date.now() })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime(`${SESSION_DURATION}s`)
    .sign(JWT_SECRET);
}

export async function verifySession(token: string): Promise<Session | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    
    if (typeof payload.appId === 'string' && typeof payload.iat === 'number') {
      return { appId: payload.appId, iat: payload.iat };
    }
    return null;
  } catch {
    return null;
  }
}

// Cookie functions
export function setCookie(response: NextResponse, token: string): void {
  response.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_DURATION,
    path: '/',
  });
}

export function clearCookie(response: NextResponse): void {
  response.cookies.delete(COOKIE_NAME);
}

// Session helpers
export async function getSession(): Promise<Session | null> {
  const cookieStore = await cookies();
  const cookie = cookieStore.get(COOKIE_NAME);
  return cookie ? await verifySession(cookie.value) : null;
}

export async function getSessionFromRequest(req: NextRequest): Promise<Session | null> {
  const cookie = req.cookies.get(COOKIE_NAME);
  return cookie ? await verifySession(cookie.value) : null;
}

// Redis functions
export async function getMagicLinkData(token: string): Promise<MagicLinkData | null> {
  try {
    const data = await redis.get(`magic_link_token:${token}`) as MagicLinkData | null;
    return data;
  } catch (error) {
    console.error('Failed to get magic link data:', error);
    return null;
  }
}

export async function deleteToken(token: string): Promise<void> {
  try {
    await redis.del(`magic_link_token:${token}`);
  } catch (error) {
    console.error('Failed to delete token:', error);
  }
}