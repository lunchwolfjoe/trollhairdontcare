import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Create Supabase client
    const supabase = await createClient();
    
    // Check if the user is authenticated
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      return NextResponse.json(
        { 
          authenticated: false, 
          error: error.message,
          env: {
            supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || 'Missing URL',
            hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
          } 
        }, 
        { status: 401 }
      );
    }
    
    if (!data.session) {
      return NextResponse.json(
        { 
          authenticated: false, 
          message: 'No active session',
          env: {
            supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || 'Missing URL',
            hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
          } 
        }, 
        { status: 200 }
      );
    }
    
    // Return the authenticated status and user info
    return NextResponse.json({
      authenticated: true,
      session: {
        user: data.session.user,
        expires_at: data.session.expires_at
      },
      env: {
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || 'Missing URL',
        hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      }
    });
  } catch (error) {
    console.error('API route error:', error);
    return NextResponse.json(
      { 
        authenticated: false, 
        error: 'Internal server error',
        env: {
          supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || 'Missing URL',
          hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        }
      }, 
      { status: 500 }
    );
  }
} 