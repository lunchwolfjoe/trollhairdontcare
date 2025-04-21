export default function DebugEnvPage() {
  return (
    <div className="p-10">
      <h1 className="text-2xl font-bold mb-4">Environment Variables Debug</h1>
      
      <div className="bg-gray-100 p-4 rounded-lg mb-6">
        <h2 className="text-lg font-semibold mb-2">Environment Variables:</h2>
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-200">
              <th className="border border-gray-300 p-2 text-left">Variable</th>
              <th className="border border-gray-300 p-2 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-gray-300 p-2">NEXT_PUBLIC_SUPABASE_URL</td>
              <td className="border border-gray-300 p-2">
                {process.env.NEXT_PUBLIC_SUPABASE_URL ? (
                  <span className="text-green-600">✓ Set</span>
                ) : (
                  <span className="text-red-600">✗ Not Set</span>
                )}
              </td>
            </tr>
            <tr>
              <td className="border border-gray-300 p-2">NEXT_PUBLIC_SUPABASE_ANON_KEY</td>
              <td className="border border-gray-300 p-2">
                {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? (
                  <span className="text-green-600">✓ Set</span>
                ) : (
                  <span className="text-red-600">✗ Not Set</span>
                )}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <div className="bg-gray-100 p-4 rounded-lg mb-6">
        <h2 className="text-lg font-semibold mb-2">Supabase URL:</h2>
        <div className="bg-white p-3 rounded shadow-sm">
          <code>{process.env.NEXT_PUBLIC_SUPABASE_URL || "Not defined"}</code>
        </div>
      </div>
      
      <div className="bg-gray-100 p-4 rounded-lg mb-6">
        <h2 className="text-lg font-semibold mb-2">Supabase Key (First 10 chars):</h2>
        <div className="bg-white p-3 rounded shadow-sm">
          <code>
            {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY 
              ? `${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.substring(0, 10)}...` 
              : "Not defined"}
          </code>
        </div>
      </div>
      
      <div className="flex space-x-4">
        <a href="/test-auth" className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded">
          Go to Auth Test
        </a>
        <a href="/sign-in" className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded">
          Go to Sign In
        </a>
        <a href="/" className="bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded">
          Go to Home
        </a>
      </div>
    </div>
  );
} 