import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!);
const COOKIE_NAME = 'auth-session';
const SESSION_DURATION = 60 * 24 * 60 * 60; // 60 days in seconds

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// Simplified types
interface Session {
  appId: string;
  iat: number;
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
    
    // Проверяем наличие необходимых полей
    if (typeof payload.appId === 'string' && typeof payload.iat === 'number') {
      return {
        appId: payload.appId,
        iat: payload.iat
      };
    }
    
    return null;
  } catch {
    return null;
  }
}

// Cookie functions
export function setCookie(response: NextResponse, token: string) {
  response.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_DURATION,
    path: '/',
  });
}

export function clearCookie(response: NextResponse) {
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
export async function getMagicLinkData(token: string): Promise<{ appId: string } | null> {
  try {
    const data = await redis.get(`magic_link_token:${token}`);
    return data ? { appId: (data as any).appId } : null;
  } catch {
    return null;
  }
}

export async function deleteToken(token: string): Promise<boolean> {
  try {
    await redis.del(`magic_link_token:${token}`);
    return true;
  } catch {
    return false;
  }
}