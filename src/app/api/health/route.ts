import { NextResponse } from 'next/server';

export async function GET() {
  const requiredEnvVars = ['JWT_SECRET', 'UPSTASH_REDIS_REST_URL', 'UPSTASH_REDIS_REST_TOKEN'];
  const missing = requiredEnvVars.filter(v => !process.env[v]);
  
  return NextResponse.json({
    status: missing.length === 0 ? 'healthy' : 'unhealthy',
    timestamp: new Date().toISOString(),
    ...(missing.length > 0 && { missingEnvVars: missing })
  });
}