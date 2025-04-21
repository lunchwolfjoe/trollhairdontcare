import { signUpAction } from "@/app/actions";

export default function SignUp() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <main className="flex flex-col items-center justify-center w-full flex-1 px-4 sm:px-20 text-center">
        <h1 className="text-4xl font-bold mt-20">Sign Up</h1>
        
        <form 
          className="w-full max-w-md flex flex-col gap-4 mt-10" 
          action={signUpAction}
        >
          <input
            className="rounded border border-gray-300 px-4 py-2"
            name="email"
            placeholder="Email"
            required
          />
          <input
            className="rounded border border-gray-300 px-4 py-2"
            type="password"
            name="password"
            placeholder="Password"
            required
          />
          <button
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
            type="submit"
          >
            Sign Up
          </button>
        </form>
      </main>
    </div>
  );
} 