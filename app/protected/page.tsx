import { createClient } from "@/utils/supabase/server";
import { signOutAction } from "@/app/actions";
import { redirect } from "next/navigation";

export default async function ProtectedPage() {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect("/sign-in");
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <main className="flex flex-col items-center justify-center w-full flex-1 px-4 sm:px-20 text-center">
        <h1 className="text-4xl font-bold mt-20">Protected Page</h1>
        <p className="mt-4">Welcome {user.email}!</p>
        <p className="mt-2">You are now signed in.</p>
        
        <form action={signOutAction} className="mt-8">
          <button
            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
            type="submit"
          >
            Sign Out
          </button>
        </form>
      </main>
    </div>
  );
} 