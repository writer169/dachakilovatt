import { NextRequest, NextResponse } from 'next/server';
import { 
  createSession, 
  setCookie, 
  clearCookie, 
  getSessionFromRequest,
  getMagicLinkData,
  deleteToken
} from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { action, token } = await request.json();

    // Verify magic link
    if (action === 'verify') {
      if (!token || !/^[0-9a-f-]{36}$/i.test(token)) {
        return NextResponse.json({ error: 'Invalid token' }, { status: 400 });
      }

      const magicData = await getMagicLinkData(token);
      if (!magicData) {
        return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
      }

      await deleteToken(token);
      const sessionToken = await createSession(magicData.appId);
      
      const response = NextResponse.json({ 
        success: true, 
        appId: magicData.appId 
      });
      setCookie(response, sessionToken);
      
      return response;
    }

    // Logout
    if (action === 'logout') {
      const response = NextResponse.json({ success: true });
      clearCookie(response);
      return response;
    }

    // Get session
    if (action === 'session') {
      const session = await getSessionFromRequest(request);
      return NextResponse.json({ 
        authenticated: !!session,
        session: session ? { appId: session.appId } : null
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error) {
    console.error('Auth API error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const session = await getSessionFromRequest(request);
  return NextResponse.json({ 
    authenticated: !!session,
    session: session ? { appId: session.appId } : null
  });
}