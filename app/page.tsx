import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export default async function Page() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Redirect authenticated users to the protected page
  if (user) {
    redirect('/protected')
  }

  // Redirect unauthenticated users to the sign-in page
  redirect('/sign-in')
} 