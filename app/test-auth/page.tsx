import { createClient } from '@/utils/supabase/server';

export default async function TestAuthPage() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getSession();
  
  return (
    <div className="p-10">
      <h1 className="text-2xl font-bold mb-4">Authentication Test Page</h1>
      
      <div className="bg-gray-100 p-4 rounded-lg mb-6">
        <h2 className="text-lg font-semibold mb-2">Session Status:</h2>
        <div className="bg-white p-3 rounded shadow-sm">
          {data.session ? (
            <pre className="text-green-600">Authenticated ✓</pre>
          ) : (
            <pre className="text-red-600">Not authenticated ✗</pre>
          )}
        </div>
      </div>
      
      {error && (
        <div className="bg-red-50 p-4 rounded-lg mb-6">
          <h2 className="text-lg font-semibold mb-2">Error:</h2>
          <pre className="bg-white p-3 rounded shadow-sm text-red-600 overflow-auto">
            {JSON.stringify(error, null, 2)}
          </pre>
        </div>
      )}
      
      {data.session && (
        <div className="bg-gray-100 p-4 rounded-lg mb-6">
          <h2 className="text-lg font-semibold mb-2">Session Data:</h2>
          <pre className="bg-white p-3 rounded shadow-sm overflow-auto">
            {JSON.stringify(data.session, null, 2)}
          </pre>
        </div>
      )}
      
      <div className="flex space-x-4">
        <a href="/sign-in" className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded">
          Go to Sign In
        </a>
        <a href="/sign-up" className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded">
          Go to Sign Up
        </a>
        <a href="/" className="bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded">
          Go to Home
        </a>
      </div>
    </div>
  );
} 