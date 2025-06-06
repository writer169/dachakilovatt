'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LogoutButton() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    setLoading(true);
    try {
      await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'logout' }),
      });
      router.push('/auth?success=logged_out');
    } catch (error) {
      console.error('Logout failed:', error);
      router.push('/auth?error=logout_failed');
    }
  };

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      className="w-full px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
    >
      {loading ? 'Logging out...' : 'Logout'}
    </button>
  );
}