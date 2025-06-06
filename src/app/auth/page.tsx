'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

function AuthContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [state, setState] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const handleAuth = async () => {
      const token = searchParams.get('token');
      const error = searchParams.get('error');
      const success = searchParams.get('success');

      // Handle success/error states
      if (success === 'logged_out') {
        setState('success');
        setMessage('Successfully logged out');
        return;
      }

      if (error) {
        setState('error');
        setMessage(getErrorMessage(error));
        return;
      }

      // Check existing session
      try {
        const sessionRes = await fetch('/api/auth');
        const { authenticated } = await sessionRes.json();
        if (authenticated) {
          router.push('/');
          return;
        }
      } catch (e) {
        console.warn('Session check failed:', e);
      }

      // Verify magic link token
      if (token) {
        try {
          const res = await fetch('/api/auth', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'verify', token }),
          });

          if (res.ok) {
            setState('success');
            setMessage('Authentication successful! Redirecting...');
            setTimeout(() => router.push('/'), 2000);
          } else {
            const { error } = await res.json();
            setState('error');
            setMessage(error || 'Authentication failed');
          }
        } catch (e) {
          setState('error');
          setMessage('Network error during authentication');
        }
      } else {
        setState('error');
        setMessage('No authentication token provided');
      }
    };

    handleAuth();
  }, [searchParams, router]);

  const getErrorMessage = (error: string) => {
    const messages: Record<string, string> = {
      unauthorized: 'Authentication required',
      expired: 'Magic link has expired',
      invalid: 'Invalid magic link',
      logout_failed: 'Logout failed',
    };
    return messages[error] || 'An error occurred';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
        {state === 'loading' && (
          <>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h1 className="text-2xl font-semibold mb-2">Processing...</h1>
            <p className="text-gray-600">Please wait...</p>
          </>
        )}

        {state === 'success' && (
          <>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-semibold mb-2">Success!</h1>
            <p className="text-gray-600">{message}</p>
          </>
        )}

        {state === 'error' && (
          <>
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="text-2xl font-semibold mb-2">Authentication Error</h1>
            <p className="text-gray-600 mb-4">{message}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    }>
      <AuthContent />
    </Suspense>
  );
}