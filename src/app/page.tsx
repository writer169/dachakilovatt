import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import LogoutButton from './LogoutButton';
import RefreshButton from './RefreshButton';

export default async function HomePage() {
  const session = await getSession();
  
  if (!session) {
    redirect('/auth?error=unauthorized');
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6 text-center">
            Welcome to Your Dashboard
          </h1>
          
          <div className="bg-gray-50 rounded-lg p-6 mb-8">
            <h2 className="text-lg font-semibold mb-4">Session Info</h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600 mb-1">Application ID:</p>
                <p className="font-mono bg-white p-2 rounded border text-sm break-all">{session.appId}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Status:</p>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">
                  ✓ Active Session
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <LogoutButton />
            <RefreshButton />
          </div>
        </div>
      </div>
    </div>
  );
}